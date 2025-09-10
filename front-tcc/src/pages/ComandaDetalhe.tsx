import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchComanda, fetchMesa, createMesaComanda } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comanda, Pedido, Mesa } from "@/types";

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

  if (!data) return null;

  if (isMesa) {
    const mesa = data as Mesa;
    const comanda = mesa.comanda;
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
        {comanda ? (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Pedido #{comanda.numero}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p>Mesa: {mesa.numero}</p>
                <p>Status: {comanda.status}</p>
                {comanda.criadoem && (
                  <p>
                    Criado em: {new Date(comanda.criadoem).toLocaleDateString()} {" "}
                    {new Date(comanda.criadoem).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
              {comanda.pedidos?.length ? (
                <div className="space-y-2">
                  {comanda.pedidos.map((p: Pedido) => (
                    <div
                      key={p.id}
                      className="flex justify-between border-b border-border py-1"
                    >
                      <span>{p.quantidade}x {p.produtoId}</span>
                      <span className="font-medium">R$ {p.precoUnit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum item adicionado.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Mesa {mesa.numero}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Mesa vazia.</p>
              <Button onClick={() => mutation.mutate()}>Criar Pedido</Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const comanda = data as Comanda;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        Voltar
      </Button>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>
            {comanda.nome_cliente ? `${comanda.nome_cliente} - ` : ""}
            {comanda.tipo === "balcao"
              ? `Balcão #${comanda.numero}`
              : comanda.tipo === "entrega"
              ? `Entrega #${comanda.numero}`
              : `Pedido #${comanda.numero}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <p>Tipo: {comanda.tipo}</p>
            {comanda.mesaNum && <p>Mesa: {comanda.mesaNum}</p>}
            <p>Status: {comanda.status}</p>
            {comanda.criadoem && (
              <p>
                Criado em: {new Date(comanda.criadoem).toLocaleDateString()} {" "}
                {new Date(comanda.criadoem).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          {comanda.pedidos?.length ? (
            <div className="space-y-2">
              {comanda.pedidos.map((p: Pedido) => (
                <div
                  key={p.id}
                  className="flex justify-between border-b border-border py-1"
                >
                  <span>{p.quantidade}x {p.produtoId}</span>
                  <span className="font-medium">R$ {p.precoUnit}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum item adicionado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComandaDetalhe;
