export interface IOPCResponse {
  status: number;
  total_time: number;
  reqId: string;
}

export type OPCErrorResponse = IOPCResponse & {
  desc: string;
  data_status: number;
};

export type OPCStockResponse = IOPCResponse & {
  price: OPCStockPrice;
};

export type OPCStockPrice = {
  cached: boolean;
  status: number;
  last: number;
  bid: number;
  ask: number;
  _data_source: string
};

export type OPCOptionsResponse = IOPCResponse & {
  data_status: number;
  cached: boolean;
  status: number;
  options: any;
}