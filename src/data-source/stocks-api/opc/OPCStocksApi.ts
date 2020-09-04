import { RESTDataSource } from 'apollo-datasource-rest';
import { Option, OptionsForExpiry, OptionType, Stock } from '../../../graphql/types';
import IStocksApi from '../IStocksApi';
import { OPCErrorResponse, OPCOptionsResponse, OPCStockResponse } from './types';

/**
 * OptionsProfitCalculator implementation of IStocksApi.
 */
export default class OPCStocksApi extends RESTDataSource implements IStocksApi {
  public constructor() {
    super();
    this.baseURL = process.env.OPC_BASEURL;
  }

  /**
   * Gets stock price info for a given symbol.
   * @param symbol Stock symbol to look up.
   * @returns Stock data object.
   */
  public async getStock(symbol: string) {
    return this.get<OPCStockResponse | OPCErrorResponse>(`getStockPrice?stock=${symbol}&reqId=0`)
      .then(res => {
        // If 'desc' prop in response, we got an error
        if ('desc' in res) {
          throw new Error('Could not fetch data for underlying: ' + symbol);  
        }
        // If we can't cast to OPCStockResponse for some other reason, return.
        const stockResponse = res as OPCStockResponse;
        if (stockResponse == null) {
          throw new Error('Could not fetch data for underlying: ' + symbol);  
        }
        // Map to our Stock type
        const stock: Stock = {
          symbol: symbol.toUpperCase(),
          ask: stockResponse.price.ask,
          bid: stockResponse.price.bid,
          last: stockResponse.price.last,
          optionsChain: []
        };

        return stock;
    });
  }

  /**
   * Gets options chain for an underlying symbol.
   * @param symbol Stock symbol for underlying.
   * @returns Options chain for underlying Stock.
   */
  public async getOptions(underlying: Stock) {
    const { symbol: underlyingSymbol, last: underlyingPrice } = underlying;
    return this.get<OPCOptionsResponse | OPCErrorResponse>(`getOptions?stock=${underlyingSymbol}&reqId=1`)
      .then(res => {
        // If 'desc' prop in response, we got an error
        if ('desc' in res) {
          throw new Error('Could not fetch options chain for underlying: ' + underlyingSymbol);
        }
        // If we can't cast to OPCOptionsResponse for some other reason, return.
        const optionsResponse = res as OPCOptionsResponse;
        if (optionsResponse == null) {
          throw new Error('Could not fetch options chain for underlying: ' + underlyingSymbol);
        }

        const options = optionsResponse.options;

        // Map options chain in OptionsProfitCalculator response format to our OptionsForExpiry type.
        return Object.keys(options)
          .filter(key => key != '_data_source' && options[key])
          .map((expiry): OptionsForExpiry => ({
            expiry: expiry,
            calls: Object.keys(options[expiry].c).map(this.getContractMapFn(expiry, underlyingSymbol, underlyingPrice, options, OptionType.Call)),
            puts: Object.keys(options[expiry].p).map(this.getContractMapFn(expiry, underlyingSymbol, underlyingPrice, options, OptionType.Put))
          }));
      });
  }

  /**
   * Helper method which returns a function to map calls or puts from OptionsProfitCalculator format to our own Options type.
   * @param expiry Expiration date from options chain.
   * @param underlyingSymbol Underlying stock symbol.
   * @param underlyingPrice Underlying stock price.
   * @param options Options object from OptionsProfitCalculator response.
   * @param type Call or Put.
   * @returns The mapper function.
   */
  private getContractMapFn(expiry: string, underlyingSymbol: string, underlyingPrice: number, options: any, type: OptionType) {
    return (strike: string): Option => {
      const contractTypeKey = type == OptionType.Call ? 'c': 'p';
      const contract = options[expiry][contractTypeKey][strike];
      return {
        expiry: expiry,
        underlyingSymbol: underlyingSymbol,
        underlyingPrice: underlyingPrice,
        bid: parseFloat(contract.b),
        ask: parseFloat(contract.a),
        last: parseFloat(contract.l),
        strike: parseFloat(strike),
        type: type,
        impliedVolatility: parseFloat(contract.v)
      };
    }
  }
}