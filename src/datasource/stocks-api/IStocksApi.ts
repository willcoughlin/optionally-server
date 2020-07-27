import { OptionsForExpiry, Stock } from "../../graphql/types";

/**
 * Exposes stock and option chain info retrieval functionality for stock query resolvers.
 */
export default interface IStocksApi {
  getStock(symbol: string): Promise<Stock | undefined>;
  getOptions(symbol: string): Promise<OptionsForExpiry[] | undefined>;
}