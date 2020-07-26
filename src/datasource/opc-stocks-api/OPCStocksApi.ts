import { RESTDataSource } from 'apollo-datasource-rest';
import IStocksApi from '../IStocksApi';
import { Stock } from '../../graphql/types';
import { OPCResponse, OPCStockResponse } from './types';

export default class OPCStocksApi extends RESTDataSource implements IStocksApi {
  constructor() {
    super();
    this.baseURL = 'https://www.optionsprofitcalculator.com/ajax/'
  }

  public async getStock(symbol: string) {
    return this.get<OPCResponse>(`getStockPrice?stock=${symbol}&reqId=0`)
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
}