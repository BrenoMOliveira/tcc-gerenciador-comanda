import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchComanda, fetchMesa, createMesaComanda, fetchProducts, fetchCategories, addItemToComanda, addPagamento, createSubComandas, fetchSubComanda, fetchSubComandasMesa, fetchSubComandaMesa } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comanda, Pedido, Mesa, Product, Pagamento, SubComanda } from "@/types";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

export const ComandaDetalhe = () => {
  const navigate = useNavigate();
  const { id, mesaId, subId } = useParams();

  const isMesa = !!mesaId && !subId;
  const isSub = !!subId;

  const { data, refetch } = useQuery<Comanda | Mesa>({
    queryKey: [isMesa ? "mesa" : "comanda", isMesa ? mesaId : id],
    queryFn: () => (isMesa ? fetchMesa(mesaId as string) : fetchComanda(id as string)),
    enabled: !isSub && (isMesa ? !!mesaId : !!id),
  });

  const { data: subData, refetch: refetchSub } = useQuery<SubComanda>({
    queryKey: ["subcomanda", id, mesaId, subId],
    queryFn: () =>
      id
        ? fetchSubComanda(id as string, subId as string)
        : fetchSubComandaMesa(mesaId as string, subId as string),
    enabled: isSub && !!subId && (!!id || !!mesaId),
  });

  const parentComandaQuery = useQuery<Comanda>({
    queryKey: ["comanda", id || mesaId],
    queryFn: () =>
      id
        ? fetchComanda(id as string)
        : fetchMesa(mesaId as string).then((m) => m.comanda as Comanda),
    enabled: isSub && (!!id || !!mesaId),
  });

  const subComandasMesaQuery = useQuery<SubComanda[]>({
    queryKey: ["subcomandas-mesa", mesaId],
    queryFn: () => fetchSubComandasMesa(mesaId as string),
    enabled: isMesa && !!mesaId,
  });

  const mutation = useMutation({
    mutationFn: () => createMesaComanda(mesaId as string),
    onSuccess: () => refetch(),
  });

  const [open, setOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"categories" | "items" | "summary">(
    "categories"
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryItems, setCategoryItems] = useState<
    Record<string, Record<string, number>>
  >({});
  const [submittedCategories, setSubmittedCategories] = useState<string[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const [conferenceOpen, setConferenceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [paymentValue, setPaymentValue] = useState(0);
  const [splitName, setSplitName] = useState("");
  const [splitNames, setSplitNames] = useState<string[]>([]);
  const [saldoOverride, setSaldoOverride] = useState<number | null>(null);

  const formatClientName = (name?: string | null) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ");
  };

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const allProductsQuery = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const productsQuery = useQuery<Product[]>({
    queryKey: ["products", selectedCategory?.id],
    queryFn: () => fetchProducts({ categoryId: selectedCategory?.id }),
    enabled: modalStep === "items" && !!selectedCategory?.id,
  });

  useEffect(() => {
    if (productsQuery.data) {
      setProductsMap((prev) => ({
        ...prev,
        ...Object.fromEntries(productsQuery.data.map((p) => [p.id, p])),
      }));
    }
  }, [productsQuery.data]);

  useEffect(() => {
    if (!paymentOpen) {
      setSaldoOverride(null);
    }
  }, [paymentOpen]);

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setModalStep("categories");
      setSelectedCategory(null);
      setCategoryItems({});
      setSubmittedCategories([]);
      setProductsMap({});
    }
    setModalError(null);
    setOpen(o);
  };

  const getQuantity = (catId: string, prodId: string) => {
    return categoryItems[catId]?.[prodId] || 0;
  };

  const getMaxStockValue = (product?: Product) => {
    if (!product) return undefined;
    const stock = product.stockQuantity;
    if (typeof stock !== "number" || Number.isNaN(stock)) return undefined;
    return Math.max(0, Math.floor(stock));
  };

  const updateQuantity = (
    catId: string,
    prodId: string,
    qtd: number,
    productOverride?: Product
  ) => {
    const numericDesired = Number.isFinite(qtd) ? qtd : 0;
    let normalizedQty = Math.max(0, Math.floor(numericDesired));

    const product = productOverride ?? productsMap[prodId];
    const maxStock = getMaxStockValue(product);

    if (maxStock !== undefined && normalizedQty > maxStock) {
      normalizedQty = maxStock;
    }

    setCategoryItems((prev) => ({
      ...prev,
      [catId]: { ...(prev[catId] ?? {}), [prodId]: normalizedQty },
    }));
  };

  const handleEnviarPedido = () => {
    if (!selectedCategory) return;
    setSubmittedCategories((prev) =>
      prev.includes(selectedCategory.id)
        ? prev
        : [...prev, selectedCategory.id]
    );
    setModalStep("categories");
  };

  const handleConfirmPedido = async () => {
    const comandaData = isSub
      ? subData
      : isMesa
      ? (data as Mesa).comanda
      : (data as Comanda);
    if (!comandaData) return;
    setModalError(null);
    try {
      for (const catId of submittedCategories) {
        const items = categoryItems[catId] || {};
        for (const [prodId, qtd] of Object.entries(items)) {
          if (qtd > 0) {
            const prod = productsMap[prodId];
            await addItemToComanda(isSub ? (id as string) : comandaData.id, {
              produtoId: prodId,
              quantidade: qtd,
              precoUnit: prod?.price || 0,
              subcomandaid: isSub ? subId : undefined,
            });
          }
        }
      }
      if (isSub) {
        await refetchSub();
        await parentComandaQuery.refetch();
      } else {
        await refetch();
      }
      handleOpenChange(false);
    } catch (err) {
      console.error("Erro ao confirmar pedido", err);
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar os itens. Verifique o estoque e tente novamente.";
      setModalError(message);
    }
  };

  if (isSub && !subData) return null;
  if (!isSub && !data) return null;

  const mesa = isMesa ? (data as Mesa) : undefined;
  const comanda = isSub
    ? subData
    : isMesa
    ? mesa?.comanda
    : (data as Comanda);
  const parentComanda = isSub ? parentComandaQuery.data : undefined;
  const subList = isMesa ? subComandasMesaQuery.data : comanda?.subcomandas;
  const hasSubcomandas = !isSub && !!subList?.length;

  const totalComanda =
    comanda?.pedidos?.reduce(
      (acc, p) => acc + p.precoUnit * p.quantidade,
      0
    ) || 0;
  const totalPago =
    comanda?.pagamentos?.reduce((acc, p) => acc + p.valorpago, 0) || 0;
  const saldoCalculado = Math.max(totalComanda - totalPago, 0);
  const saldo = saldoOverride ?? saldoCalculado;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        Voltar
      </Button>
      {isMesa && !comanda ? (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Mesa {mesa?.numero}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Mesa vazia.</p>
            <Button onClick={() => mutation.mutate()}>Abrir Mesa</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>
              {isSub ? (
                <>
                  {subData?.nome_cliente ? `${subData.nome_cliente} - ` : ""}
                  {parentComanda?.numero
                    ? `Pedido #${parentComanda.numero}`
                    : "Subcomanda"}
                </>
              ) : (
                <>
                  {comanda?.nome_cliente ? `${comanda.nome_cliente} - ` : ""}
                  {comanda?.tipo === "balcao"
                    ? `Balcão #${comanda?.numero}`
                    : comanda?.tipo === "entrega"
                    ? `Entrega #${comanda?.numero}`
                    : `Pedido #${comanda?.numero}`}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              {mesa && <p>Mesa: {mesa.numero}</p>}
              {!isSub && <p>Tipo: {comanda?.tipo}</p>}
              <p>Status: {comanda?.status}</p>
              {comanda?.criadoem && (
                <p>
                  Criado em: {new Date(comanda.criadoem).toLocaleDateString()} {" "}
                  {new Date(comanda.criadoem).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            {!hasSubcomandas && (
              comanda?.pedidos?.length ? (
                <div className="space-y-2">
                  {comanda.pedidos.map((p: Pedido) => {
                    const prodName =
                      allProductsQuery.data?.find((prod) => prod.id === p.produtoId)?.name ||
                      p.produtoId;
                    return (
                      <div
                        key={p.id}
                        className="flex border-b border-border py-1"
                      >
                        <span>
                          {p.quantidade}x {prodName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum item adicionado.
                </p>
              )
            )}
            {!isSub && subList?.length ? (
                            <div className="mt-4 w-full overflow-hidden rounded-md border border-border text-sm">
                <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)] gap-x-8 bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Cliente</span>
                  <span>Status</span>
                </div>
                <div>
                  {subList.map((s, index) => {
                    const formattedName = formatClientName(s.nome_cliente) || s.id;
                    const isLast = index === subList.length - 1;
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "grid cursor-pointer grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)] items-start gap-x-8 px-4 py-3 transition-colors hover:bg-muted/60",
                          !isLast && "border-b border-border/70"
                        )}
                        onClick={() =>
                          navigate(
                            isMesa
                              ? `/comandas/mesas/${mesaId}/${s.id}`
                              : `/comandas/${(comanda as Comanda).id}/subcomandas/${s.id}`
                          )
                        }
                      >
                        <span className="font-medium text-foreground">{formattedName}</span>
                        <span className="text-foreground">{s.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(!hasSubcomandas || isSub) &&
                comanda &&
                (["aberta", "ocupada"].includes(
                  comanda.status.toLowerCase()
                ) || !comanda.pedidos?.length) && (
                  <Button onClick={() => setOpen(true)}>Novo Pedido</Button>
                )}
              {(((comanda?.pedidos?.length ?? 0) > 0) || hasSubcomandas) && (
                <Button
                  variant="outline"
                  onClick={() => setConferenceOpen(true)}
                >
                  Conferência
                </Button>
              )}
              {((isSub || !hasSubcomandas) && (comanda?.pedidos?.length ?? 0) > 0) && (
                <Button onClick={() => setPaymentOpen(true)}>
                  Fechar Comanda
                </Button>
              )}
              {isMesa && !isSub && comanda && (
                <Button
                  variant="secondary"
                  onClick={() => setSplitOpen(true)}
                >
                  Dividir Mesa
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          {modalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro ao adicionar itens</AlertTitle>
              <AlertDescription>{modalError}</AlertDescription>
            </Alert>
          )}
          {modalStep === "categories" && (
            <>
              <DialogHeader>
                <DialogTitle>Categorias</DialogTitle>
              </DialogHeader>
              {submittedCategories.length > 0 && (
                <Button className="mb-4" onClick={() => setModalStep("summary")}>Consultar Itens</Button>
              )}
              <div className="space-y-2">
                {categoriesQuery.data?.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setModalStep("items");
                    }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </>
          )}
          {modalStep === "items" && selectedCategory && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCategory.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {productsQuery.data?.map((prod) => {
                  const qtd = getQuantity(selectedCategory.id, prod.id);
                  const availabilityLabel = prod.availability;
                  const isOutOfStock =
                    availabilityLabel?.toLowerCase() === "fora de estoque";
                  const maxStock = getMaxStockValue(prod);
                  const reachedLimit =
                    maxStock !== undefined && qtd >= maxStock;
                  const stockLimitMessage =
                    !isOutOfStock && reachedLimit && maxStock !== undefined
                      ? `Limite de Estoque atingido. Quantidade máxima disponível: ${maxStock} unidades.`
                      : null;
                  return (
                    <div
                      key={prod.id}
                      className={cn(
                        "rounded-md border border-transparent bg-muted/30 p-3 transition-colors",
                        isOutOfStock ? "bg-muted/60" : "hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{prod.name}</span>
                          {availabilityLabel && (
                            <span
                              className={cn(
                                "text-xs",
                                isOutOfStock
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              {availabilityLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(
                                selectedCategory.id,
                                prod.id,
                                qtd - 1,
                                prod
                              )
                            }
                            disabled={qtd <= 0}
                            aria-label={`Remover ${prod.name}`}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={maxStock ?? undefined}
                            step={1}
                            value={qtd === 0 ? "" : qtd}
                            onChange={(e) =>
                              updateQuantity(
                                selectedCategory.id,
                                prod.id,
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                                prod
                              )
                            }
                            className="w-16 text-center"
                            disabled={isOutOfStock}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(
                                selectedCategory.id,
                                prod.id,
                                qtd + 1,
                                prod
                              )
                            }
                            disabled={isOutOfStock || reachedLimit}
                            aria-label={`Adicionar ${prod.name}`}
                            title={
                              isOutOfStock
                                ? "Produto fora de estoque"
                                : reachedLimit
                                ? `Limite de estoque: ${maxStock} unidades`
                                : undefined
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      {stockLimitMessage && (
                        <p className="mt-2 block w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                          {stockLimitMessage}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalStep("categories")}
                >
                  Voltar
                </Button>
                <Button onClick={handleEnviarPedido}>Enviar Pedido</Button>
              </div>
            </>
          )}
          {modalStep === "summary" && (
            <>
              <DialogHeader>
                <DialogTitle>Resumo do Pedido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {submittedCategories.map((catId) => {
                  const cat = categoriesQuery.data?.find((c) => c.id === catId);
                  const items = categoryItems[catId] || {};
                  return (
                    <div key={catId} className="space-y-2">
                      <h3 className="font-semibold">{cat?.name}</h3>
                      {Object.entries(items).map(([prodId, qtd]) => {
                        if (qtd <= 0) return null;
                        const prod = productsMap[prodId];
                        const availabilityLabel = prod?.availability;
                        const isOutOfStock =
                          availabilityLabel?.toLowerCase() === "fora de estoque";
                        const maxStock = getMaxStockValue(prod);
                        const reachedLimit =
                          maxStock !== undefined && qtd >= maxStock;
                        const stockLimitMessage =
                          !isOutOfStock && reachedLimit && maxStock !== undefined
                            ? `Limite de Estoque atingido. Quantidade máxima disponível: ${maxStock} unidades.`
                            : null;
                        return (
                          <div
                            key={prodId}
                            className={cn(
                              "rounded-md border border-transparent bg-muted/30 p-3",
                              isOutOfStock && "bg-muted/60"
                            )}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex flex-col">
                                <span>{prod?.name || prodId}</span>
                                {availabilityLabel && (
                                  <span
                                    className={cn(
                                      "text-xs",
                                      isOutOfStock
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {availabilityLabel}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    updateQuantity(
                                      catId,
                                      prodId,
                                      qtd - 1,
                                      prod
                                    )
                                  }
                                  disabled={qtd <= 0}
                                  aria-label={`Remover ${prod?.name || prodId}`}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  min={0}
                                  max={maxStock ?? undefined}
                                  step={1}
                                  value={qtd === 0 ? "" : qtd}
                                  onChange={(e) =>
                                    updateQuantity(
                                      catId,
                                      prodId,
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value),
                                      prod
                                    )
                                  }
                                  className="w-16 text-center"
                                  disabled={isOutOfStock}
                                />
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    updateQuantity(
                                      catId,
                                      prodId,
                                      qtd + 1,
                                      prod
                                    )
                                  }
                                  disabled={isOutOfStock || reachedLimit}
                                  aria-label={`Adicionar ${prod?.name || prodId}`}
                                  title={
                                    isOutOfStock
                                      ? "Produto fora de estoque"
                                      : reachedLimit
                                      ? `Limite de estoque: ${maxStock} unidades`
                                      : undefined
                                  }
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            {stockLimitMessage && (
                              <p className="mt-2 block w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                                {stockLimitMessage}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalStep("categories")}
                >
                  Voltar
                </Button>
                <Button onClick={handleConfirmPedido}>Confirmar Pedido</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    {/* Conferencia */}
      <Dialog open={conferenceOpen} onOpenChange={setConferenceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferência</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {Object.entries(
              comanda?.pedidos?.reduce<Record<string, { quantidade: number; preco: number }>>(
                (acc, p: Pedido) => {
                  const key = p.produtoId;
                  if (!acc[key]) acc[key] = { quantidade: 0, preco: p.precoUnit };
                  acc[key].quantidade += p.quantidade;
                  return acc;
                },{}) || {}
            ).map(([prodId, info]) => {
              const prodName =
                allProductsQuery.data?.find((prod) => prod.id === prodId)?.name || prodId;
              const subtotal = info.preco * info.quantidade;
              return (
                <div key={prodId} className="flex justify-between">
                  <span>
                    {info.quantidade}x {prodName} - R$ {info.preco.toFixed(2)}
                  </span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 font-semibold">Total: R$ {totalComanda.toFixed(2)}</div>
        </DialogContent>
      </Dialog>

      {/* Pagamento */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>Restante: R$ {saldo.toFixed(2)}</div>
            <div className="flex space-x-2">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border rounded p-2"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="debito">Cartão de Débito</option>
              </select>
              <Input
                type="number"
                min={0}
                value={paymentValue}
                onChange={(e) => setPaymentValue(Number(e.target.value))}
                className="w-32"
              />
              <Button
                onClick={async () => {
                  if (!comanda) return;
                  const comandaIdForPayment = isSub
                    ? parentComanda?.id ??
                      (comanda as SubComanda | undefined)?.comandaid ??
                      subData?.comandaid ??
                      (typeof id === "string" ? id : undefined)
                    : (comanda as Comanda).id;

                  if (!comandaIdForPayment) {
                    console.error(
                      "ID da comanda não disponível para registrar pagamento."
                    );
                    return;
                  }
                  let shouldClose = false;
                  let shouldNavigate = false;
                  try {
                    const res = await addPagamento({
                      comandaid: comandaIdForPayment,
                      valorpago: paymentValue,
                      formapagamento: paymentMethod,
                      subcomandaid: isSub ? subId : undefined,
                    });
                    const novoSaldo = isSub
                      ? res.valorRestanteSubcomanda ?? res.valorRestante
                      : res.valorRestante;
                    if (typeof novoSaldo === "number" && !Number.isNaN(novoSaldo)) {
                      setSaldoOverride(Math.max(novoSaldo, 0));
                    }
                    setPaymentValue(0);
                    const isClosed = (status?: string) =>
                      status ? ["fechada", "paga"].includes(status.toLowerCase()) : false;
                    shouldClose =
                      isClosed(res.status) || (isSub && isClosed(res.statusSubcomanda));
                    shouldNavigate = Boolean(
                      res.mesaLiberada && (isMesa || (isSub && mesaId))
                    );
                    const refetchPromises: Promise<unknown>[] = [];
                    if (isSub) {
                     refetchPromises.push(refetchSub());
                      refetchPromises.push(parentComandaQuery.refetch());
                      if (mesaId) {
                        refetchPromises.push(subComandasMesaQuery.refetch());
                      }
                    } else {
                      refetchPromises.push(refetch());
                      if (isMesa) {
                        refetchPromises.push(subComandasMesaQuery.refetch());
                      }
                    }
                    await Promise.all(refetchPromises);
                    setSaldoOverride(null);
                  } catch (err) {
                    console.error(err);
                  }finally {
                    if (shouldClose) {
                      setPaymentOpen(false);
                    }

                    if (shouldNavigate) {
                      navigate("/comandas");
                    }
                  }
                }}
              >
                Adicionar
              </Button>
            </div>
            <div className="space-y-1">
              {comanda?.pagamentos?.map((p: Pagamento) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>
                    {p.formapagamento} - R$ {p.valorpago.toFixed(2)}
                  </span>
                  <span>
                    {p.pagoem
                      ? new Date(p.pagoem).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : null}
                  </span>
                </div>
              ))}
            </div>
            {saldo <= 0 && (
              <Button onClick={() => setPaymentOpen(false)}>Fechar</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isMesa && !isSub && (
        <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dividir Mesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={splitName}
                  onChange={(e) => setSplitName(e.target.value)}
                  placeholder="Nome"
                />
                <Button
                  onClick={() => {
                    if (splitName.trim()) {
                      setSplitNames((prev) => [...prev, splitName.trim()]);
                      setSplitName("");
                    }
                  }}
                >
                  Adicionar
                </Button>
              </div>
              <ul className="list-disc pl-5">
                {splitNames.map((n, idx) => (
                  <li key={idx}>{n}</li>
                ))}
              </ul>
              <Button
                onClick={async () => {
                  if (!comanda) return;
                  try {
                    await createSubComandas(comanda.id, splitNames);
                    setSplitNames([]);
                    setSplitOpen(false);
                    await refetch();
                    if (isMesa) await subComandasMesaQuery.refetch();
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Dividir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ComandaDetalhe;