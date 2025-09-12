import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "./Dashboard";
import { Produtos } from "./Produtos";
import { Comandas } from "./Comandas";
import { ComandaDetalhe } from "./ComandaDetalhe";
import { Funcionarios } from "./Funcionarios";
import { Configuracoes } from "./Configuracoes";
import { useToast } from "@/hooks/use-toast";
import { Routes, Route } from "react-router-dom";
import { API_URL } from "@/lib/api";
import { saveToken, clearToken } from "@/lib/auth";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

 const handleLogin = async (cpf: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpf.replace(/\D/g, ""), senha: password }),
      });
      if (!res.ok) throw new Error("Login inválido");
      const data = await res.json();
      saveToken(data.token);
      setIsLoggedIn(true);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema de gestão.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro no login";
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto lg:ml-0 pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/comandas" element={<Comandas />} />
          <Route path="/comandas/mesas/:mesaId" element={<ComandaDetalhe />} />
          <Route path="/comandas/mesas/:mesaId/:subId" element={<ComandaDetalhe />} />
          <Route path="/comandas/:id/subcomandas/:subId" element={<ComandaDetalhe />}/>
          <Route path="/comandas/:id" element={<ComandaDetalhe />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </main>
    </div>
  );
};

export default Index;
