import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  onLogin: (cpf: string, password: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(cpf, password);
  };
  const isPasswordValid = password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-foreground">
            Bem Vindo!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="CPF"
                value={cpf}
                onChange={handleCpfChange}
                className="form-input"
                //pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                minLength={8}
              />
              {!isPasswordValid && (
                <p className="text-sm text-red-500 mt-1">
                  Senha deve ter no mínimo 8 caracteres
                </p>
              )}
            </div>
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Esqueceu sua senha ?
              </button>
            </div>
            <Button
              type="submit"
              disabled={!isPasswordValid}
              className="w-full bg-gradient-primary hover:bg-primary-hover text-primary-foreground font-medium py-3"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};