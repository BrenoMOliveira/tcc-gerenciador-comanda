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
}

export interface Pagamento {
  id: string;
  comandaid: string;
  valorpago: number;
  metodo: string;
  pagamentoem?: string;
  subcomandaid?: string;
}

export interface SubComanda {
  id: string;
  comandaid: string;
  nomeCliente?: string;
  status: string;
  criadoem?: string;
  pedidos?: Pedido[];
  pagamentos?: Pagamento[];
}