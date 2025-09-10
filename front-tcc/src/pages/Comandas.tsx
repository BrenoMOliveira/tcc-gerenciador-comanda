import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMesas, fetchComandas, createComanda } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mesa, Comanda } from "@/types";
import { Input } from "@/components/ui/input";

export const Comandas = () => {
  const [activeTab, setActiveTab] = useState("mesas");
  const [tipoNovo, setTipoNovo] = useState("balcao");
  const [clienteNovo, setClienteNovo] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: mesas } = useQuery<Mesa[]>({
    queryKey: ["mesas"],
    queryFn: fetchMesas,
    enabled: activeTab === "mesas",
    refetchInterval: activeTab === "mesas" ? 2000 : false,
  });

  const { data: comandas } = useQuery<Comanda[]>({
    queryKey: ["comandas", activeTab],
    queryFn: () => fetchComandas(activeTab === "mesas" ? undefined : activeTab),
    enabled: activeTab !== "mesas",
  });

  const mutation = useMutation({
    mutationFn: createComanda,
    onSuccess: (data: Comanda) => {
      queryClient.invalidateQueries({ queryKey: ["comandas"] });
      navigate(`/comandas/${data.id}`);
    },
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Comandas</h1>
          <p className="text-muted-foreground">Gerencie pedidos e comandas do restaurante</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground">Adicionar Comanda</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Comanda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={tipoNovo} onValueChange={setTipoNovo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balcao">Balcão</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Nome do cliente"
                value={clienteNovo}
                onChange={(e) => setClienteNovo(e.target.value)}
              />
              <Button
                disabled={!clienteNovo.trim()}
                onClick={() =>
                  mutation.mutate({
                    tipo: tipoNovo,
                    nome_cliente: clienteNovo,
                    criadoPor: "00000000-0000-0000-0000-000000000000",
                  })
                }
              >
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="mesas">Mesas</TabsTrigger>
          <TabsTrigger value="balcao">Balcão</TabsTrigger>
          <TabsTrigger value="entrega">Entrega</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Comandas Ativas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            {activeTab === "mesas" && mesas && mesas.map((mesa: Mesa) => (
              <div
                key={mesa.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/comandas/mesas/${mesa.id}`)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">Mesa {mesa.numero}</span>
                  <span className="text-sm">{mesa.status}</span>
                </div>
              </div>
            ))}
            {activeTab !== "mesas" && comandas && comandas.map((c: Comanda) => (
              <div
                key={c.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/comandas/${c.id}`)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    <span className="font-medium">
                      {c.nome_cliente ? `${c.nome_cliente} - ` : ""}
                      {c.tipo === "balcao"
                        ? `Balcão #${c.numero}`
                        : c.tipo === "entrega"
                        ? `Entrega #${c.numero}`
                        : `Mesa ${c.mesaNum}`}
                    </span>
                  </span>
                  <span className="text-sm">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
