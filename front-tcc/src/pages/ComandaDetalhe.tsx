import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchComanda } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ComandaDetalhe = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data } = useQuery({
    queryKey: ["comanda", id],
    queryFn: () => fetchComanda(id as string),
    enabled: !!id,
  });

  if (!data) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        Voltar
      </Button>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Pedido #{data.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <p>Tipo: {data.tipo}</p>
            {data.mesaNum && <p>Mesa: {data.mesaNum}</p>}
            <p>Status: {data.status}</p>
          </div>
          {data.pedidos?.length ? (
            <div className="space-y-2">
              {data.pedidos.map((p: any) => (
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
