import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchProducts, fetchCategories, createProduct, updateProduct, deleteProduct, fetchInactiveProducts } from "@/lib/api";

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

const capitalizeText = (value: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const first = trimmed.charAt(0).toLocaleUpperCase("pt-BR");
  const rest = trimmed.slice(1).toLocaleLowerCase("pt-BR");
  return `${first}${rest}`;
};

const formatProductDisplay = (product: Product): Product => ({
  ...product,
  name: capitalizeText(product.name),
  category: capitalizeText(product.category),
});

export const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [inactiveProducts, setInactiveProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ativos" | "inativos">("ativos");
  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryProductId: "",
    price: "",
    stockQuantity: "",
    minimoAlerta: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const buildProductParams = useCallback(() => {
    const params: {
      search?: string;
      categoryId?: string;
      availabilityId?: string;
    } = {};
    if (searchTerm) params.search = searchTerm;
    if (categoryFilter && categoryFilter !== "todas") params.categoryId = categoryFilter;
    if (stockFilter && stockFilter !== "todos") params.availabilityId = stockFilter;
    return params;
  }, [searchTerm, categoryFilter, stockFilter]);

  const loadActiveProducts = useCallback(async () => {
    try {
      const list = await fetchProducts(buildProductParams());
      setProducts(list.map(formatProductDisplay));
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    }
  }, [buildProductParams]);

  const loadInactiveProducts = useCallback(async () => {
    try {
      const list = await fetchInactiveProducts(buildProductParams());
      setInactiveProducts(list.map(formatProductDisplay));
    } catch (err) {
      console.error("Erro ao buscar produtos inativos", err);
    }
  }, [buildProductParams]);

  useEffect(() => {
    fetchCategories()
      .then((list: Category[]) =>
        setCategories(list.map((category) => ({
          ...category,
          name: capitalizeText(category.name),
        })))
      )
      .catch((err) => console.error("Erro ao buscar categorias", err));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeTab === "ativos") {
        loadActiveProducts();
      } else {
        loadInactiveProducts();
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [activeTab, loadActiveProducts, loadInactiveProducts]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      "Em Estoque": "availability-in-stock",
      "Baixo Estoque": "availability-low-stock",
      "Fora de Estoque": "availability-out-of-stock",
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
      await Promise.all([loadActiveProducts(), loadInactiveProducts()]);
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
      await Promise.all([loadActiveProducts(), loadInactiveProducts()]);
    } catch (err) {
      console.error("Erro ao atualizar produto", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await Promise.all([loadActiveProducts(), loadInactiveProducts()]);
    } catch (err) {
      console.error("Erro ao deletar produto", err);
    }
  };

  const handleReactivateProduct = async (product: Product) => {
    try {
      await updateProduct(product.id, {
        id: product.id,
        name: product.name,
        categoryProductId: product.categoryProductId,
        price: product.price,
        ativo: true,
        stockQuantity: product.stockQuantity,
        minimoAlerta: product.minimoAlerta,
      });
      await Promise.all([loadActiveProducts(), loadInactiveProducts()]);
    } catch (err) {
      console.error("Erro ao reativar produto", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
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

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "ativos" | "inativos")}
        className="space-y-4"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="ativos" className="flex-1 sm:flex-none">
            Ativos
          </TabsTrigger>
          <TabsTrigger value="inativos" className="flex-1 sm:flex-none">
            Inativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="space-y-4">
          <Card className="dashboard-card hidden md:block">
            <CardHeader>
              <CardTitle>Lista de Produtos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[60vh]">
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
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Nenhum produto encontrado.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="md:hidden space-y-4">
            {products.length === 0 ? (
              <Card className="dashboard-card">
                <CardContent className="p-4 text-center text-muted-foreground">
                  Nenhum produto encontrado.
                </CardContent>
              </Card>
            ) : (
              products.map((product) => (
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
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="inativos" className="space-y-4">
          <Card className="dashboard-card hidden md:block">
            <CardHeader>
              <CardTitle>Produtos Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[60vh]">
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
                    {inactiveProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Nenhum produto inativo encontrado.
                        </td>
                      </tr>
                    ) : (
                      inactiveProducts.map((product) => (
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
                                onClick={() => handleReactivateProduct(product)}
                              >
                                <RefreshCcw className="h-4 w-4" />
                              </Button>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="md:hidden space-y-4">
            {inactiveProducts.length === 0 ? (
              <Card className="dashboard-card">
                <CardContent className="p-4 text-center text-muted-foreground">
                  Nenhum produto inativo encontrado.
                </CardContent>
              </Card>
            ) : (
              inactiveProducts.map((product) => (
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
                          onClick={() => handleReactivateProduct(product)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
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
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
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