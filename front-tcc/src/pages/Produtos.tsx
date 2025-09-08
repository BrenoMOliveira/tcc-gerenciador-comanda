import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { fetchProducts } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  availability: "EmEstoque" | "BaixoEstoque" | "ForaDeEstoque";
}

export const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error("Erro ao buscar produtos", err));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EmEstoque":
        return <Badge className="status-success">Em estoque</Badge>;
      case "BaixoEstoque":
        return <Badge className="status-warning">Baixo estoque</Badge>;
      case "ForaDeEstoque":
        return <Badge className="status-error">Fora de estoque</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos e estoque</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Produto
        </Button>
      </div>

      {/* Filters */}
      <Card className="dashboard-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar Produto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="complementos">Complementos</SelectItem>
                <SelectItem value="carnes">Carnes</SelectItem>
                <SelectItem value="bebidas">Bebidas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="em-estoque">Em estoque</SelectItem>
                <SelectItem value="baixo-estoque">Baixo estoque</SelectItem>
                <SelectItem value="fora-estoque">Fora de estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table - Desktop */}
      <Card className="dashboard-card hidden md:block">
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Produtos
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Categoria
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Preço
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Estoque
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Disponibilidade
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">{product.name}</td>
                    <td className="py-4 px-4 text-primary">{product.category}</td>
                    <td className="py-4 px-4">
                      {product.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="py-4 px-4">{product.stockQuantity} uni</td>
                    <td className="py-4 px-4">
                      {getStatusBadge(product.availability)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-primary text-sm">{product.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Preço:</span>
                  <p className="font-medium">
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estoque:</span>
                  <p className="font-medium">{product.stockQuantity} uni</p>
                </div>
              </div>
              <div className="mt-3">
                {getStatusBadge(product.availability)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};