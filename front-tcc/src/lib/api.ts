import { authFetch } from "./auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5125";

export async function fetchProducts(params?: {
  search?: string;
  categoryId?: string;
  availabilityId?: string;
}) {
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

export async function fetchComanda(id: string) {
  const res = await authFetch(`${API_URL}/api/comandas/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch comanda");
  }
  return res.json();
}

export async function fetchMesa(id: string) {
  const res = await authFetch(`${API_URL}/api/mesas/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch mesa");
  }
  return res.json();
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