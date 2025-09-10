import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "./Dashboard";
import { Produtos } from "./Produtos";
import { Comandas } from "./Comandas";
import { Funcionarios } from "./Funcionarios";
import { Configuracoes } from "./Configuracoes";
import { useToast } from "@/hooks/use-toast";
import { Routes, Route } from "react-router-dom";
import ComandaDetalhe from "./ComandaDetalhe";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication
    if (email && password) {
      setIsLoggedIn(true);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema de gestão.",
      });
    }
  };

  const handleLogout = () => {
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
          <Route path="/comandas/:id" element={<ComandaDetalhe />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </main>
    </div>
  );
};

export default Index;
