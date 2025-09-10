export interface Pedido {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnit: number;
}

export interface Comanda {
  id: string;
  tipo: string;
  status: string;
  mesaNum?: number;
  pedidos?: Pedido[];
}

export interface Mesa {
  id: string;
  numero: number;
  status: string;
  comandaId?: string;
}