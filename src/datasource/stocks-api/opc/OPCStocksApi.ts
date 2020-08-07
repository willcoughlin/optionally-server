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
   */
  public async getStock(symbol: string) {
    return this.get<OPCStockResponse | OPCErrorResponse>(`getStockPrice?stock=${symbol}&reqId=0`)
      .then(res => {
        // If 'desc' prop in response, we got an error
        if ('desc' in res) {
          return undefined;
        }
        // If we can't cast to OPCStockResponse for some other reason, return.
        const stockResponse = res as OPCStockResponse;
        if (stockResponse == null) {
          return undefined;
        }
        // Map to our Stock type
        const stock: Stock = {
          symbol: symbol.toUpperCase(),
          ask: stockResponse.price.ask,
          bid: stockResponse.price.bid,
          last: stockResponse.price.last,
          optionsChain: null
        };

        return stock;
    });
  }

  /**
   * Gets options chain for an underlying symbol.
   * @param symbol Stock symbol for underlying.
   */
  public async getOptions(symbol: string) {
    return this.get<OPCOptionsResponse | OPCErrorResponse>(`getOptions?stock=${symbol}&reqId=1`)
      .then(res => {
        // If 'desc' prop in response, we got an error
        if ('desc' in res) {
          return undefined;
        }
        // If we can't cast to OPCOptionsResponse for some other reason, return.
        const optionsResponse = res as OPCOptionsResponse;
        if (optionsResponse == null) {
          return undefined;
        }

        const options = optionsResponse.options;

        // Map options chain in OptionsProfitCalculator response format to our OptionsForExpiry type.
        return Object.keys(options)
          .filter(key => key != '_data_source' && options[key])
          .map((expiry): OptionsForExpiry => ({
            expiry: expiry,
            calls: Object.keys(options[expiry].c).map(this.getContractMapFn(expiry, symbol, options, OptionType.Call)),
            puts: Object.keys(options[expiry].p).map(this.getContractMapFn(expiry, symbol, options, OptionType.Put))
          }));
      });
  }

  /**
   * Helper method which returns a function to map calls or puts from OptionsProfitCalculator format to our own Options type.
   * @param expiry Expiration date from options chain.
   * @param symbol Underlying stock symbol.
   * @param options Options object from OptionsProfitCalculator response.
   * @param type Call or Put.
   */
  private getContractMapFn(expiry: string, symbol: string, options: any, type: OptionType) {
    return (strike: string): Option => {
      const contractTypeKey = type == OptionType.Call ? 'c': 'p';
      const contract = options[expiry][contractTypeKey][strike];
      return {
        expiry: expiry,
        underlyingSymbol: symbol,
        bid: parseFloat(contract.b),
        ask: parseFloat(contract.a),
        last: parseFloat(contract.l),
        strike: parseFloat(strike),
        type: type
      };
    }
  }
}