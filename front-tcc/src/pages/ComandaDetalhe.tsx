import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchComanda, fetchMesa, createMesaComanda, fetchProducts, addItemToComanda } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comanda, Pedido, Mesa, Product } from "@/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const productsQuery = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

const handleAddItem = async (produtoId: string) => {
  const comandaData = isMesa
    ? (data as Mesa).comanda
    : (data as Comanda);
  if (!comandaData) return;
  const product = productsQuery.data?.find((p) => p.id === produtoId);
  if (!product) return;
  const qtd = quantities[produtoId] || 1;
  try {
    await addItemToComanda(comandaData.id, {
      produtoId,
      quantidade: qtd,
      precoUnit: product.price,
    });
    setQuantities((q) => ({ ...q, [produtoId]: 1 }));
    await refetch();
  } catch (err) {
    console.error("Erro ao adicionar item", err);
  }
};

  if (!data) return null;

  const mesa = isMesa ? (data as Mesa) : undefined;
  const comanda = isMesa ? mesa?.comanda : (data as Comanda);

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
                  const prodName =
                    productsQuery.data?.find((prod) => prod.id === p.produtoId)?.name ||
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
            )}
            {comanda && (comanda.status.toLowerCase() === "aberta" || !comanda.pedidos?.length) && (
              <Button onClick={() => setOpen(true)}>Novo Pedido</Button>
            )}
          </CardContent>
        </Card>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {productsQuery.data?.map((prod: Product) => (
              <div key={prod.id} className="flex items-center justify-between">
                <span>
                  {prod.name} - R$ {prod.price}
                </span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={1}
                    value={quantities[prod.id] || 1}
                    onChange={(e) =>
                      setQuantities({
                        ...quantities,
                        [prod.id]: Number(e.target.value),
                      })
                    }
                    className="w-16"
                  />
                  <Button onClick={() => handleAddItem(prod.id)}>Adicionar</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComandaDetalhe;