import { RESTDataSource } from 'apollo-datasource-rest';
import IStocksApi from '../IStocksApi';
import { Stock, OptionsForExpiry, Option, OptionType } from '../../graphql/types';
import { OPCStockResponse, OPCErrorResponse, OPCOptionsResponse } from './types';
import { hasUncaughtExceptionCaptureCallback } from 'process';

export default class OPCStocksApi extends RESTDataSource implements IStocksApi {
  constructor() {
    super();
    this.baseURL = 'https://www.optionsprofitcalculator.com/ajax/'
  }

  public async getStock(symbol: string) {
    return this.get<OPCStockResponse | OPCErrorResponse>(`getStockPrice?stock=${symbol}&reqId=0`)
      .then(res => {
        if ('desc' in res) {
          return undefined;
        }

        const stockResponse = res as OPCStockResponse;
        if (stockResponse == null) {
          return undefined;
        }

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

  public async getOptions(symbol: string) {
    return this.get<OPCOptionsResponse | OPCErrorResponse>(`getOptions?stock=${symbol}&reqId=1`)
      .then(res => {
        if ('desc' in res) {
          return undefined;
        }

        const optionsResponse = res as OPCOptionsResponse;
        if (optionsResponse == null) {
          return undefined;
        }

        const options = optionsResponse.options;

        return Object.keys(options).filter(key => key != '_data_source').map((expiry): OptionsForExpiry => ({
          expiry: expiry,
          calls: Object.keys(options[expiry].c).map(this._getContractMapFn(expiry, symbol, options, OptionType.Call)),
          puts: Object.keys(options[expiry].p).map(this._getContractMapFn(expiry, symbol, options, OptionType.Put))
        }));
      });
  }

  private _getContractMapFn(expiry: string, symbol: string, options: any, type: OptionType) {
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