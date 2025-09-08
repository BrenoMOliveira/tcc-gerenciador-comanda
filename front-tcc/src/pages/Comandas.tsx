import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockOrders = [
  {
    id: 1,
    mesa: "Mesa 1",
    cliente: "Sarah",
    pedido: "#12345",
    valor: "R$ 25,50",
    status: "Ocupada",
    data: "2024-01-15",
    hora: "18:30",
    itens: [
      { nome: "Medalhão de Frango", preco: "R$ 15,00", qtd: 2 },
      { nome: "Mandioca cozida", preco: "R$ 8,50", qtd: 1 },
      { nome: "Coca", preco: "R$ 6,00", qtd: 1 }
    ]
  },
  {
    id: 2,
    mesa: "Mesa 2",
    cliente: "David",
    pedido: "#12346",
    valor: "R$ 32,75",
    status: "Aguardando Pagamento",
    data: "2024-01-15",
    hora: "18:30",
    itens: [
      { nome: "Medalhão de Frango", preco: "R$ 15,00", qtd: 2 },
      { nome: "Coca", preco: "R$ 6,00", qtd: 1 }
    ]
  },
  {
    id: 3,
    mesa: "Mesa 3",
    cliente: "Emily",
    pedido: "#12347",
    valor: "R$ 18,90",
    status: "Livre",
    data: "2024-01-15",
    hora: "18:30",
    itens: []
  }
];

export const Comandas = () => {
  const [selectedOrder, setSelectedOrder] = useState(mockOrders[0]);
  const [activeTab, setActiveTab] = useState("mesas");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ocupada":
        return <Badge className="status-warning">Ocupada</Badge>;
      case "Aguardando Pagamento":
        return <Badge className="status-success">Aguardando Pagamento</Badge>;
      case "Livre":
        return <Badge variant="secondary">Livre</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Comandas</h1>
        <p className="text-muted-foreground">Gerencie pedidos e comandas do restaurante</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="mesas">Mesas</TabsTrigger>
          <TabsTrigger value="balcao">Balcão</TabsTrigger>
          <TabsTrigger value="entrega">Entrega</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="col-span-1">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Comandas Ativas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2 p-4">
                    {mockOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrder.id === order.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{order.mesa}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {order.cliente}
                        </p>
                        <p className="text-sm text-primary font-medium">
                          {order.pedido}
                        </p>
                        <p className="text-lg font-bold mt-2">{order.valor}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <div className="col-span-2">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Detalhes Comanda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Info */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">
                      Pedido {selectedOrder.pedido}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{selectedOrder.cliente}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p className="font-medium">{selectedOrder.data}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hora</p>
                        <p className="font-medium">{selectedOrder.hora}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Itens</h3>
                    <div className="space-y-2">
                      {selectedOrder.itens.map((item, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-border"
                        >
                          <span>{item.qtd}x {item.nome}</span>
                          <span className="font-medium">{item.preco}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-4 border-t border-border pt-4">
                    <h3 className="font-semibold">Pagamento</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Método de pagamento
                        </label>
                        <Input 
                          placeholder="Selecionar método"
                          className="form-input mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Valor recebido
                        </label>
                        <Input 
                          placeholder="R$ 0,00"
                          className="form-input mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
                      Fechar Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Orders List Mobile */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Comandas Ativas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {mockOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrder.id === order.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{order.mesa}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {order.cliente}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        {order.pedido}
                      </p>
                      <p className="text-lg font-bold mt-2">{order.valor}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Details Mobile */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Detalhes da Comanda Selecionada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info */}
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    Pedido {selectedOrder.pedido}
                  </h2>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{selectedOrder.cliente}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mesa</p>
                        <p className="font-medium">{selectedOrder.mesa}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p className="font-medium">{selectedOrder.data}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hora</p>
                        <p className="font-medium">{selectedOrder.hora}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Itens</h3>
                  <div className="space-y-3">
                    {selectedOrder.itens.map((item, index) => (
                      <div 
                        key={index}
                        className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{item.qtd}x {item.nome}</span>
                        </div>
                        <span className="font-bold text-primary">{item.preco}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="font-semibold">Pagamento</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Método de pagamento
                      </label>
                      <Input 
                        placeholder="Selecionar método"
                        className="form-input mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Valor recebido
                      </label>
                      <Input 
                        placeholder="R$ 0,00"
                        className="form-input mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground w-full">
                    Fechar Pedido
                  </Button>
                  <Button variant="outline" className="w-full">
                    Dividir Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};