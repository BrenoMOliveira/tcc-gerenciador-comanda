import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { fetchEmployees, fetchCargos, createEmployee, updateEmployee, deleteEmployee } from "@/lib/api";

interface Employee {
  id: string;
  nome: string;
  cpf: string;
  tipo: string;
  cargoid: number;
  status: number;
}

interface Cargo {
  id: number;
  nome: string;
}

export const Funcionarios = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    nome: "",
    cpf: "",
    senha: "",
    tipo: "",
    cargoid: "",
  });
  const [editingEmployee, setEditingEmployee] = useState<
    (Employee & { senha?: string }) | null
  >(null);

  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(console.error);
    fetchCargos().then(setCargos).catch(console.error);
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const created = await createEmployee({
      nome: newEmployee.nome,
      cpf: newEmployee.cpf,
      senha: newEmployee.senha,
      tipo: cargos.find(c => c.id === Number(newEmployee.cargoid))?.nome ?? "",
      cargoid: Number(newEmployee.cargoid),
    });
    setEmployees((prev) => [...prev, created]);
    setNewEmployee({ nome: "", cpf: "", senha: "", tipo: "", cargoid: "" });
      setOpen(false);
    } catch (err) {
      console.error("Erro ao adicionar funcionário", err);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      await updateEmployee(editingEmployee.id, {
        id: editingEmployee.id,
        nome: editingEmployee.nome,
        cpf: editingEmployee.cpf,
        senha: editingEmployee.senha,
        tipo: cargos.find(c => c.id === Number(editingEmployee.cargoid))?.nome ?? "",
        cargoid: editingEmployee.cargoid,
        status: editingEmployee.status,
      });
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp))
      );
      setEditOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error("Erro ao atualizar funcionário", err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error("Erro ao deletar funcionário", err);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="status-success">Ativo</Badge>;
      case 0:
        return <Badge className="status-error">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie a equipe do restaurante</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={newEmployee.nome}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={newEmployee.cpf}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, cpf: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={newEmployee.senha}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, senha: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  onValueChange={(value) =>
                    setNewEmployee({ ...newEmployee, cargoid: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id.toString()}>
                        {cargo.nome}
                      </SelectItem>
                    ))}
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
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Cargo
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-4 px-4 font-medium">{employee.nome}</td>
                    <td className="py-4 px-4 text-primary">{employee.tipo}</td>
                    <td className="py-4 px-4">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary-hover"
                          onClick={() => {
                            setEditingEmployee({ ...employee, senha: "" });
                            setEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteEmployee(employee.id)}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input
                  id="edit-nome"
                  value={editingEmployee.nome}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cpf">CPF</Label>
                <Input
                  id="edit-cpf"
                  value={editingEmployee.cpf}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, cpf: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-senha">Senha</Label>
                <Input
                  id="edit-senha"
                  type="password"
                  value={editingEmployee.senha}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, senha: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select
                  value={editingEmployee.cargoid.toString()}
                  onValueChange={(value) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      cargoid: Number(value),
                      tipo: cargos.find((c) => c.id === Number(value))?.nome || "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id.toString()}>
                        {cargo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingEmployee.status.toString()}
                  onValueChange={(value) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      status: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ativo</SelectItem>
                    <SelectItem value="0">Inativo</SelectItem>
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