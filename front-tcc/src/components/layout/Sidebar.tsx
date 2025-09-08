import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'comandas', label: 'Comandas', icon: ClipboardList },
  { id: 'funcionarios', label: 'Funcionários', icon: Users },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

const SidebarContent = ({ currentPage, onPageChange, onLogout }: SidebarProps) => (
  <>
    {/* Header */}
    <div className="p-6 border-b border-sidebar-border">
      <h1 className="text-xl font-bold text-sidebar-primary-foreground">
        Sistema Restaurante
      </h1>
      <p className="text-sm text-sidebar-foreground mt-1">
        Gestão Completa
      </p>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  currentPage === item.id && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>

    {/* Logout */}
    <div className="p-4 border-t border-sidebar-border">
      <Button
        variant="ghost"
        className="w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
        onClick={onLogout}
      >
        <LogOut className="mr-3 h-4 w-4" />
        Sair
      </Button>
    </div>
  </>
);

export const Sidebar = ({ currentPage, onPageChange, onLogout }: SidebarProps) => {
  return (
    <>
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 bg-background">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground">
            <div className="flex flex-col h-full">
              <SidebarContent 
                currentPage={currentPage} 
                onPageChange={onPageChange} 
                onLogout={onLogout} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col">
        <SidebarContent 
          currentPage={currentPage} 
          onPageChange={onPageChange} 
          onLogout={onLogout} 
        />
      </div>
    </>
  );
};