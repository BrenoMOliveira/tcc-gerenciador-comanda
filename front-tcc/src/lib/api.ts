export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5125";

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}

export async function fetchEmployees() {
  const res = await fetch(`${API_URL}/api/usuarios`);
  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }
  return res.json();
}

export async function fetchCargos() {
  const res = await fetch(`${API_URL}/api/cargos`);
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
  const res = await fetch(`${API_URL}/api/usuarios`, {
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
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
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
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete employee");
  }
}