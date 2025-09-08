import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Save } from "lucide-react";

export const Configuracoes = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Ajuste as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Info */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações do Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome do Estabelecimento
              </label>
              <Input 
                placeholder="Nome do restaurante"
                className="form-input mt-1"
                defaultValue="Restaurante Exemplo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Endereço
              </label>
              <Input 
                placeholder="Endereço completo"
                className="form-input mt-1"
                defaultValue="Rua Exemplo, 123"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Telefone
              </label>
              <Input 
                placeholder="(11) 99999-9999"
                className="form-input mt-1"
                defaultValue="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <Input 
                placeholder="contato@restaurante.com"
                className="form-input mt-1"
                defaultValue="contato@restaurante.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações por Email</p>
                <p className="text-sm text-muted-foreground">
                  Receber alertas por email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">
                  Backup diário dos dados
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo Offline</p>
                <p className="text-sm text-muted-foreground">
                  Permitir operação sem internet
                </p>
              </div>
              <Switch />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Taxa de Serviço (%)
              </label>
              <Input 
                type="number"
                placeholder="10"
                className="form-input mt-1"
                defaultValue="10"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tempo de Sessão (minutos)
              </label>
              <Input 
                type="number"
                placeholder="60"
                className="form-input mt-1"
                defaultValue="60"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};