import { OptionInput, OptionsForExpiry, Stock } from "../../graphql/types";

/**
 * Exposes stock and option chain info retrieval functionality for stock query resolvers.
 */
export default interface IStocksApi {
  getStock(symbol: string): Promise<Stock>;
  getOptions(underlying: Stock): Promise<OptionsForExpiry[]>;
  getImpliedVolatility(option: OptionInput): Promise<number>;
}