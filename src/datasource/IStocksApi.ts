import { Stock, OptionsForExpiry } from "../graphql/types";

export default interface IStocksApi {
  getStock(symbol: string): Promise<Stock | undefined>;
  getOptions(symbol: string): Promise<OptionsForExpiry[] | undefined>;
}