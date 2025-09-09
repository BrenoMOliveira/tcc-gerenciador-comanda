import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { fetchProducts, fetchCategories, createProduct, updateProduct, deleteProduct } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  category: string;
  categoryProductId: string;
  price: number;
  ativo: boolean;
  stockQuantity: number;
  minimoAlerta: number;
  availability: string;
}

interface Category {
  id: string;
  name: string;
}

export const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryProductId: "",
    price: "",
    stockQuantity: "",
    minimoAlerta: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
  try {
    const params: {
      search?: string;
      categoryId?: string;
      availabilityId?: string;
    } = {};
    if (searchTerm) params.search = searchTerm;
    if (categoryFilter && categoryFilter !== "todas") params.categoryId = categoryFilter;
    if (stockFilter && stockFilter !== "todos") params.availabilityId = stockFilter;
    const list = await fetchProducts(params);
      setProducts(list);
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    }
  }, [searchTerm, categoryFilter, stockFilter]);


  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Erro ao buscar categorias", err));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadProducts();
    }, 500);
    return () => clearTimeout(handler);
  }, [loadProducts]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      "Em Estoque": "status-success",
      "Baixo Estoque": "status-warning",
      "Fora de Estoque": "status-error",
    };
    const className = map[status] || "bg-secondary text-secondary-foreground";
    return <Badge className={className}>{status}</Badge>;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        name: newProduct.name,
        categoryProductId: newProduct.categoryProductId,
        price: Number(newProduct.price),
        stockQuantity: Number(newProduct.stockQuantity),
        minimoAlerta: Number(newProduct.minimoAlerta),
      });
      setNewProduct({
        name: "",
        categoryProductId: "",
        price: "",
        stockQuantity: "",
        minimoAlerta: "",
      });
      setOpen(false);
      await loadProducts();
    } catch (err) {
      console.error("Erro ao adicionar produto", err);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.id, {
        id: editingProduct.id,
        name: editingProduct.name,
        categoryProductId: editingProduct.categoryProductId,
        price: editingProduct.price,
        ativo: editingProduct.ativo,
        stockQuantity: editingProduct.stockQuantity,
        minimoAlerta: editingProduct.minimoAlerta,
      });
      setEditOpen(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error("Erro ao atualizar produto", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Erro ao deletar produto", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos e estoque</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={newProduct.categoryProductId}
                  onValueChange={(value) => setNewProduct({ ...newProduct, categoryProductId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco">Preço</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={newProduct.stockQuantity}
                  onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimo">Mínimo de alerta</Label>
                <Input
                  id="minimo"
                  type="number"
                  value={newProduct.minimoAlerta}
                  onChange={(e) => setNewProduct({ ...newProduct, minimoAlerta: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="2">Em estoque</SelectItem>
                <SelectItem value="1">Baixo estoque</SelectItem>
                <SelectItem value="0">Fora de estoque</SelectItem>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary-hover"
                          onClick={() => {
                            setEditingProduct({ ...product });
                            setEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary-hover"
                    onClick={() => {
                      setEditingProduct({ ...product });
                      setEditOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input
                  id="edit-nome"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-categoria">Categoria</Label>
                <Select
                  value={editingProduct.categoryProductId}
                  onValueChange={(value) =>
                    setEditingProduct({ ...editingProduct, categoryProductId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-preco">Preço</Label>
                <Input
                  id="edit-preco"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantidade">Quantidade</Label>
                <Input
                  id="edit-quantidade"
                  type="number"
                  value={editingProduct.stockQuantity}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stockQuantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minimo">Mínimo de alerta</Label>
                <Input
                  id="edit-minimo"
                  type="number"
                  value={editingProduct.minimoAlerta}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      minimoAlerta: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ativo">Status</Label>
                <Select
                  value={editingProduct.ativo ? "true" : "false"}
                  onValueChange={(value) =>
                    setEditingProduct({ ...editingProduct, ativo: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground"
                >
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};