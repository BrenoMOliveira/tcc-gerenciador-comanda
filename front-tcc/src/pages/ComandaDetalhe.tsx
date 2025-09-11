import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchComanda, fetchMesa, createMesaComanda, fetchProducts, fetchCategories, addItemToComanda, addPagamento, createSubComandas } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comanda, Pedido, Mesa, Product, Pagamento } from "@/types";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
}

export const ComandaDetalhe = () => {
  const navigate = useNavigate();
  const { id, mesaId } = useParams();

  const isMesa = !!mesaId;

  const { data, refetch } = useQuery<Comanda | Mesa>({
    queryKey: [isMesa ? "mesa" : "comanda", isMesa ? mesaId : id],
    queryFn: () => (isMesa ? fetchMesa(mesaId as string) : fetchComanda(id as string)),
    enabled: isMesa ? !!mesaId : !!id,
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
  const [conferenceOpen, setConferenceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [paymentValue, setPaymentValue] = useState(0);
  const [splitName, setSplitName] = useState("");
  const [splitNames, setSplitNames] = useState<string[]>([]);

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

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setModalStep("categories");
      setSelectedCategory(null);
      setCategoryItems({});
      setSubmittedCategories([]);
      setProductsMap({});
    }
    setOpen(o);
  };

  const getQuantity = (catId: string, prodId: string) => {
    return categoryItems[catId]?.[prodId] || 0;
  };

  const updateQuantity = (catId: string, prodId: string, qtd: number) => {
    if (qtd < 0) qtd = 0;
    setCategoryItems((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], [prodId]: qtd },
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
    const comandaData = isMesa
      ? (data as Mesa).comanda
      : (data as Comanda);
    if (!comandaData) return;
    try {
      for (const catId of submittedCategories) {
        const items = categoryItems[catId] || {};
        for (const [prodId, qtd] of Object.entries(items)) {
          if (qtd > 0) {
            const prod = productsMap[prodId];
            await addItemToComanda(comandaData.id, {
              produtoId: prodId,
              quantidade: qtd,
              precoUnit: prod?.price || 0,
            });
          }
        }
      }
      await refetch();
      handleOpenChange(false);
    } catch (err) {
      console.error("Erro ao confirmar pedido", err);
    }
  };

  if (!data) return null;

  const mesa = isMesa ? (data as Mesa) : undefined;
  const comanda = isMesa ? mesa?.comanda : (data as Comanda);

  const totalComanda =
    comanda?.pedidos?.reduce(
      (acc, p) => acc + p.precoUnit * p.quantidade,
      0
    ) || 0;
  const totalPago =
    comanda?.pagamentos?.reduce((acc, p) => acc + p.valorpago, 0) || 0;
  const saldo = totalComanda - totalPago;

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
            <Button onClick={() => mutation.mutate()}>Novo Pedido</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>
              {comanda?.nome_cliente ? `${comanda.nome_cliente} - ` : ""}
              {comanda?.tipo === "balcao"
                ? `Balcão #${comanda?.numero}`
                : comanda?.tipo === "entrega"
                ? `Entrega #${comanda?.numero}`
                : `Pedido #${comanda?.numero}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              {mesa && <p>Mesa: {mesa.numero}</p>}
              <p>Tipo: {comanda?.tipo}</p>
              <p>Status: {comanda?.status}</p>
              {comanda?.criadoem && (
                <p>
                  Criado em: {new Date(comanda.criadoem).toLocaleDateString()} {" "}
                  {new Date(comanda.criadoem).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
            {comanda?.pedidos?.length ? (
              <div className="space-y-2">
                {comanda.pedidos.map((p: Pedido) => {
                  const prodName = allProductsQuery.data?.find((prod) => prod.id === p.produtoId)?.name || p.produtoId;
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
            )}
            {comanda?.subcomandas?.length ? (
              <div className="mt-4 space-y-1">
                {comanda.subcomandas.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span>{s.nomeCliente || s.id}</span>
                    <span>{s.status}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {comanda &&
                (comanda.status.toLowerCase() === "aberta" ||
                  !comanda.pedidos?.length) && (
                  <Button onClick={() => setOpen(true)}>Novo Pedido</Button>
                )}
              {comanda?.pedidos?.length ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setConferenceOpen(true)}
                  >
                    Conferência
                  </Button>
                  <Button onClick={() => setPaymentOpen(true)}>
                    Fechar Comanda
                  </Button>
                  {isMesa && (
                    <Button
                      variant="secondary"
                      onClick={() => setSplitOpen(true)}
                    >
                      Dividir Comanda
                    </Button>
                  )}
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}
     <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                  return (
                    <div key={prod.id} className="flex items-center justify-between">
                      <span>{prod.name}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(selectedCategory.id, prod.id, qtd - 1)
                          }
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min={0}
                          value={qtd === 0 ? "" : qtd}
                          onChange={(e) =>
                            updateQuantity(
                              selectedCategory.id,
                              prod.id,
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          className="w-16 text-center"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(selectedCategory.id, prod.id, qtd + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
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
                        return (
                          <div
                            key={prodId}
                            className="flex items-center justify-between"
                          >
                            <span>{prod?.name || prodId}</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(catId, prodId, qtd - 1)
                                }
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min={0}
                                value={qtd === 0 ? "" : qtd}
                                onChange={(e) =>
                                  updateQuantity(
                                    catId,
                                    prodId,
                                    e.target.value === "" ? 0 : Number(e.target.value)
                                  )
                                }
                                className="w-16 text-center"
                              />
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(catId, prodId, qtd + 1)
                                }
                              >
                                +
                              </Button>
                            </div>
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
              comanda?.pedidos?.reduce((acc: any, p: Pedido) => {
                const key = p.produtoId;
                if (!acc[key]) acc[key] = { quantidade: 0, preco: p.precoUnit };
                acc[key].quantidade += p.quantidade;
                return acc;
              }, {}) || {}
            ).map(([prodId, info]: any) => {
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
                  try {
                    await addPagamento({
                      comandaid: comanda.id,
                      valorpago: paymentValue,
                      metodo: paymentMethod,
                    });
                    setPaymentValue(0);
                    await refetch();
                  } catch (err) {
                    console.error(err);
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
                    {p.metodo} - R$ {p.valorpago.toFixed(2)}
                  </span>
                  <span>
                    {p.pagamentoem
                      ? new Date(p.pagamentoem).toLocaleTimeString([], {
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

      {/* Dividir Comanda */}
      <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dividir Comanda</DialogTitle>
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
    </div>
  );
};

export default ComandaDetalhe;
