import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "./Dashboard";
import { Produtos } from "./Produtos";
import { Comandas } from "./Comandas";
import { Funcionarios } from "./Funcionarios";
import { Configuracoes } from "./Configuracoes";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
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
    setCurrentPage("dashboard");
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "produtos":
        return <Produtos />;
      case "comandas":
        return <Comandas />;
      case "funcionarios":
        return <Funcionarios />;
      case "configuracoes":
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Index;
