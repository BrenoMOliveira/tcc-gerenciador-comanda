import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

const mockEmployees = [
  { 
    id: 1, 
    nome: "João Silva", 
    cargo: "Gerente", 
    email: "joao@restaurante.com",
    telefone: "(11) 99999-9999",
    status: "Ativo" 
  },
  { 
    id: 2, 
    nome: "Maria Santos", 
    cargo: "Garçom", 
    email: "maria@restaurante.com",
    telefone: "(11) 88888-8888",
    status: "Ativo" 
  },
  { 
    id: 3, 
    nome: "Pedro Costa", 
    cargo: "Caixa", 
    email: "pedro@restaurante.com",
    telefone: "(11) 77777-7777",
    status: "Inativo" 
  },
];

export const Funcionarios = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Badge className="status-success">Ativo</Badge>;
      case "Inativo":
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
        <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
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
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Telefone
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
                {mockEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">{employee.nome}</td>
                    <td className="py-4 px-4 text-primary">{employee.cargo}</td>
                    <td className="py-4 px-4">{employee.email}</td>
                    <td className="py-4 px-4">{employee.telefone}</td>
                    <td className="py-4 px-4">{getStatusBadge(employee.status)}</td>
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
    </div>
  );
};