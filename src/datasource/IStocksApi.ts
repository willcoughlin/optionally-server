import { Stock } from "../graphql/types";

export default interface IStocksApi {
  getStock(symbol: string): Promise<Stock | undefined>;
}