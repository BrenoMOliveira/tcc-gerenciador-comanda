import { authFetch } from "./auth";
import { Product, Comanda, Mesa, Pedido, Pagamento, SubComanda, DashboardStockItem, SalesSummary, FinancialSummary, CashFlowSeries } from "@/types";

//export const API_URL = import.meta.env.VITE_API_URL || "https://back-tcc-production.up.railway.app";
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5125";

export async function fetchProducts(params?: {
  search?: string;
  categoryId?: string;
  availabilityId?: string;
}): Promise<Product[]>{
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.categoryId) query.append("categoryId", params.categoryId);
  if (params?.availabilityId) query.append("availabilityId", params.availabilityId);
  const res = await authFetch(
    `${API_URL}/api/products${query.toString() ? `?${query.toString()}` : ""}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}

export async function fetchInactiveProducts(params?: {
  search?: string;
  categoryId?: string;
  availabilityId?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.categoryId) query.append("categoryId", params.categoryId);
  if (params?.availabilityId) query.append("availabilityId", params.availabilityId);
  const res = await authFetch(
    `${API_URL}/api/products/inactive${query.toString() ? `?${query.toString()}` : ""}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch inactive products");
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await authFetch(`${API_URL}/api/categoryproducts`);
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

export async function fetchEmployees() {
  const res = await authFetch(`${API_URL}/api/usuarios`);
  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }
  return res.json();
}

export async function fetchCargos() {
  const res = await authFetch(`${API_URL}/api/cargos`);
  if (!res.ok) {
    throw new Error("Failed to fetch cargos");
  }
  return res.json();
}

export async function createEmployee(data: {
  nome: string;
  cpf: string;
  senha: string;
  tipo: string;
  cargoid: number;
}) {
  const res = await authFetch(`${API_URL}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create employee");
  }
  return res.json();
}

export async function updateEmployee(
  id: string,
  data: { id: string; nome: string; cpf: string; senha?: string; tipo: string, cargoid: number; status: number }
) {
  const res = await authFetch(`${API_URL}/api/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // Tenta ler a mensagem de erro da API
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || res.statusText;
    
    // Lança um erro com a mensagem detalhada
    throw new Error(`Failed to update employee: ${errorMessage}`);
  }
}

export async function deleteEmployee(id: string) {
  const res = await authFetch(`${API_URL}/api/usuarios/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete employee");
  }
}

export async function createProduct(data: {
  name: string;
  categoryProductId: string;
  price: number;
  stockQuantity: number;
  minimoAlerta: number;
}) {
  const res = await authFetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create product");
  }
  return res.json();
}

export async function updateProduct(
  id: string,
  data: {
    id: string;
    name: string;
    categoryProductId: string;
    price: number;
    ativo: boolean;
    stockQuantity: number;
    minimoAlerta: number;
  }
) {
  const res = await authFetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || res.statusText;
    throw new Error(`Failed to update product: ${errorMessage}`);
  }
}

export async function deleteProduct(id: string) {
  const res = await authFetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete product");
  }
}

export async function fetchMesas() {
  const res = await authFetch(`${API_URL}/api/mesas`);
  if (!res.ok) {
    throw new Error("Failed to fetch mesas");
  }
  return res.json();
}

export async function fetchComandas(tipo?: string) {
  const query = tipo ? `?tipo=${tipo}` : "";
  const res = await authFetch(`${API_URL}/api/comandas${query}`);
  if (!res.ok) {
    throw new Error("Failed to fetch comandas");
  }
  return res.json();
}

interface PedidoApi {
  id: string;
  produtoid: string;
  quantidade: number;
  precounit: number;
  subcomandaid?: string;
}

interface PagamentoApi {
  id: string;
  comandaid: string;
  valorpago: number;
  formapagamento: string;
  pagoem?: string;
  subcomandaid?: string;
}

interface AddPagamentoResponseApi {
  pagamento: PagamentoApi;
  status: string;
  statusSubcomanda?: string;
  valorRestante: number;
  valorRestanteSubcomanda?: number | null;
  mesaLiberada?: boolean;
}


interface SubComandaApi {
  id: string;
  comandaid: string;
  nomeCliente?: string;
  nome_cliente?: string;
  status: string;
  criadoem?: string;
  pedidos?: PedidoApi[];
  pagamentos?: PagamentoApi[];
}

function mapPedido(p: PedidoApi): Pedido {
  return {
    id: p.id,
    produtoId: p.produtoid,
    quantidade: p.quantidade,
    precoUnit: p.precounit,
    subcomandaid: p.subcomandaid,
  };
}

function mapPagamento(p: PagamentoApi): Pagamento {
  return {
    id: p.id,
    comandaid: p.comandaid,
    valorpago: p.valorpago,
    formapagamento: p.formapagamento,
    pagoem: p.pagoem,
    subcomandaid: p.subcomandaid,
  };
}

function mapSubcomanda(s: SubComandaApi): SubComanda {
  return {
    id: s.id,
    comandaid: s.comandaid,
    nome_cliente: s.nomeCliente || s.nome_cliente,
    status: s.status,
    criadoem: s.criadoem,
    pedidos: s.pedidos?.map(mapPedido),
    pagamentos: s.pagamentos?.map(mapPagamento),
  };
}

export async function fetchComanda(id: string): Promise<Comanda> {
  const res = await authFetch(`${API_URL}/api/comandas/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch comanda");
  }
  const data = await res.json();
  return {
    ...data,
    pedidos: data.pedidos?.map(mapPedido),
    pagamentos: data.pagamentos?.map(mapPagamento),
    subcomandas: data.subcomandas?.map(mapSubcomanda),
  };
}

export async function fetchMesa(id: string): Promise<Mesa> {
  const res = await authFetch(`${API_URL}/api/mesas/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch mesa");
  }
  const data = await res.json();
  return {
    ...data,
    comanda: data.comanda
      ? {
          ...data.comanda,
          pedidos: data.comanda.pedidos?.map(mapPedido),
          pagamentos: data.comanda.pagamentos?.map(mapPagamento),
          subcomandas: data.comanda.subcomandas?.map(mapSubcomanda),
        }
      : undefined,
  };
}

export async function createComanda(data: { tipo: string; nome_cliente: string; cliente_id?: string; mesaNum?: number; criadoPor: string }) {
  const res = await authFetch(`${API_URL}/api/comandas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create comanda");
  }
  return res.json();
}

export async function createMesaComanda(mesaId: string) {
  const res = await authFetch(`${API_URL}/api/mesas/${mesaId}/comandas`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to create comanda for mesa");
  }
  return res.json();
}

export async function addItemToComanda(
  comandaId: string,
  data: { produtoId: string; quantidade: number; precoUnit: number; subcomandaid?: string }
) {
  const res = await authFetch(`${API_URL}/api/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      comandaid: comandaId,
      produtoid: data.produtoId,
      quantidade: data.quantidade,
      precounit: data.precoUnit,
      subcomandaid: data.subcomandaid,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to add item to comanda");
  }
  return res.json();
}

export async function addPagamento(data: {
  comandaid: string;
  valorpago: number;
  formapagamento: string;
  subcomandaid?: string;
}): Promise<{
  pagamento: Pagamento;
  status: string;
  statusSubcomanda?: string;
  valorRestante: number;
  valorRestanteSubcomanda?: number;
  mesaLiberada?: boolean;
}> {
  const res = await authFetch(`${API_URL}/api/pagamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to add payment");
  }
  const result: AddPagamentoResponseApi = await res.json();
  return {
    pagamento: mapPagamento(result.pagamento),
    status: result.status,
    statusSubcomanda: result.statusSubcomanda,
    valorRestante: result.valorRestante,
    valorRestanteSubcomanda:
      result.valorRestanteSubcomanda !== undefined &&
      result.valorRestanteSubcomanda !== null
        ? result.valorRestanteSubcomanda
        : undefined,
    mesaLiberada: result.mesaLiberada ?? false,
  };
}

export async function createSubComandas(
  comandaId: string,
  nomes: string[]
): Promise<SubComanda[]> {
  const res = await authFetch(
    `${API_URL}/api/comandas/${comandaId}/subcomandas`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nomes.map((n) => ({ nomeCliente: n }))),
    }
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create subcomandas");
  }
  return res.json();
}

export async function fetchSubComanda(
  comandaId: string,
  subId: string
): Promise<SubComanda> {
  const res = await authFetch(
    `${API_URL}/api/comandas/${comandaId}/subcomandas/${subId}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch subcomanda");
  }
  const data = await res.json();
  return mapSubcomanda(data);
}

export async function fetchSubComandasMesa(
  mesaId: string
): Promise<SubComanda[]> {
  const res = await authFetch(
    `${API_URL}/api/mesas/${mesaId}/subcomandas`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch subcomandas");
  }
  const data = await res.json();
  return data.map(mapSubcomanda);
}

export async function fetchSubComandaMesa(
  mesaId: string,
  subId: string
): Promise<SubComanda> {
  const res = await authFetch(
    `${API_URL}/api/mesas/${mesaId}/subcomandas/${subId}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch subcomanda");
  }
  const data = await res.json();
  return mapSubcomanda(data);
}

export async function fetchDashboardCriticalStock(): Promise<DashboardStockItem[]> {
  const res = await authFetch(`${API_URL}/api/dashboard/critical-stock`);
  if (!res.ok) {
    throw new Error("Failed to fetch critical stock");
  }
  return res.json();
}

export async function fetchLastDaySales(): Promise<SalesSummary> {
  const res = await authFetch(`${API_URL}/api/dashboard/sales/last-day`);
  if (!res.ok) {
    throw new Error("Failed to fetch last day sales summary");
  }
  return res.json();
}

export async function fetchFinancialSummary(params?: { comparisonPeriodDays?: number }): Promise<FinancialSummary> {
  const query = new URLSearchParams();
  if (params?.comparisonPeriodDays) {
    query.set("comparisonPeriodDays", String(params.comparisonPeriodDays));
  }
  const res = await authFetch(
    `${API_URL}/api/dashboard/financial-summary${query.toString() ? `?${query.toString()}` : ""}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch financial summary");
  }
  return res.json();
}

export async function fetchCashFlowSeries(period = 7): Promise<CashFlowSeries> {
  const allowedPeriods = [7, 15, 30];
  const selectedPeriod = allowedPeriods.includes(period) ? period : 7;
  const res = await authFetch(
    `${API_URL}/api/dashboard/cashflow-trend?periodo=${selectedPeriod}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch cash flow series");
  }
  return res.json();
}
