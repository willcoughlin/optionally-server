import { RESTDataSource } from 'apollo-datasource-rest';
import moment from 'moment';
import { OptionInput, OptionsForExpiry, OptionType, Stock } from "../../../graphql/types";
import IStocksApi from "../IStocksApi";
import { TDAOptionQuoteResponse } from './types';

/** 
 * TD Ameritrade implementation of IStocksApi 
 * */
export default class TDAStocksApi extends RESTDataSource implements IStocksApi {  
  private apiKey: string | undefined;

  constructor() {
    super();
    this.baseURL = process.env.TDA_BASEURL;
    this.apiKey = process.env.TDA_APIKEY;
  }

  /**
   * Gets implied volatility for a specified option.
   * @param option Option to look up.
   * @returns Implied volatility in percent.
   */
  public async getImpliedVolatility(option: OptionInput): Promise<number> {
    const formattedSymbol = this.formatTDAOptionSymbol(option);
    const res = await this.get<TDAOptionQuoteResponse>(`${formattedSymbol}/quotes?apikey=${this.apiKey}`);
    if (!(formattedSymbol in res)) {
      throw new Error('Could not find IV for option: ' + formattedSymbol);
    }
    const iv = res[formattedSymbol].volatility;
    return Math.max(iv, 0);
  }
  
  // TODO: implement getStock and getOptions to phase out OPC implementation totally
  public getStock(symbol: string): Promise<Stock> {
    throw new Error("Method not implemented.");
  }
  public getOptions(underlying: Stock): Promise<OptionsForExpiry[]> {
    throw new Error("Method not implemented.");
  }

  private formatTDAOptionSymbol(option: OptionInput) {
    const underlyingSymbol = option.underlyingSymbol.toUpperCase();
    const formattedDate = moment(option.expiry).format('MMDDYY');
    const type = option.type === OptionType.Call ? 'C' : 'P';
    return `${underlyingSymbol}_${formattedDate}${type}${option.strike.toString()}`;
  }
}