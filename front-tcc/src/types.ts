export interface Pedido {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnit: number;
  subcomandaid?: string;
}

export interface Comanda {
  id: string;
  numero: number;
  tipo: string;
  status: string;
  nome_cliente?: string;
  mesaNum?: number;
  criadoem?: string;
  pedidos?: Pedido[];
  pagamentos?: Pagamento[];
  subcomandas?: SubComanda[];
}

export interface Mesa {
  id: string;
  numero: number;
  status: string;
  comandaId?: string;
  comanda?: Comanda;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryProductId?: string;
  stockQuantity?: number;
  minimoAlerta?: number;
  availability?: string;
}

export interface Pagamento {
  id: string;
  comandaid: string;
  valorpago: number;
  formapagamento: string;
  pagoem?: string;
  subcomandaid?: string;
}

export interface SubComanda {
  id: string;
  numero?: number;
  comandaid: string;
  tipo?: string;
  mesaNum?: number;
  nome_cliente?: string;
  status: string;
  criadoem?: string;
  pedidos?: Pedido[];
  pagamentos?: Pagamento[];
  subcomandas?: SubComanda[];
}

export interface DashboardStockItem {
  productId: string;
  product: string;
  category: string;
  quantity: number;
  status: "Baixo Estoque" | "Fora de Estoque";
}

export interface SalesSummary {
  totalOrders: number;
  totalValue: number;
  totalOrdersChange: number;
  totalValueChange: number;
}

export interface FinancialMetric {
  value: number;
  variation: number;
  isMock?: boolean;
}

export interface FinancialSummary {
  cashFlow: FinancialMetric;
  totalRevenue: FinancialMetric;
  expenses: FinancialMetric;
  netProfit: FinancialMetric;
  comparisonPeriodDays: number;
}

export interface CashFlowPoint {
  date: string;
  value: number;
}

export interface CashFlowSeries {
  days: number;
  points: CashFlowPoint[];
}