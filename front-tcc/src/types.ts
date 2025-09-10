export interface Pedido {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnit: number;
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
}

export interface Mesa {
  id: string;
  numero: number;
  status: string;
  comandaId?: string;
  comanda?: Comanda;
}