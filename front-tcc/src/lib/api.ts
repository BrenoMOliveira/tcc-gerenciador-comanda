export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5125";

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}
