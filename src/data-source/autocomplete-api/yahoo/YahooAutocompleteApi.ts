import { RESTDataSource } from "apollo-datasource-rest";
import { LookupResult } from "../../../graphql/types";
import IAutocompleteApi from "../IAutocompleteApi";
import { YahooAutocompleteResponse, YahooAutocompleteResult } from "./types";

/**
 * Yahoo implementation of IAutocompleteApi.
 */
export default class YahooAutocompleteApi extends RESTDataSource implements IAutocompleteApi {
  public constructor() {
    super();
    this.baseURL = process.env.YAHOO_BASEURL;
  }

  /**
   * Gets matching stocks or ETFS for given symbol query string.
   * @param query Symbol query string.
   * @returns List of matches.
   */
  public async findMatches(query: string) {
    const res = await this.get<YahooAutocompleteResponse>(`autoc?region=1&lang=en&query=${query}`);
    return res.ResultSet.Result
        .filter(this.getMatchesFilterFn)
        .map(this.getMatchesMapFn);
  }

  /**
   * Helper method which returns filter predicate for findMatches API results.
   * @param yahooResultItem Result item from Yahoo API.
   * @returns The filter function.
   */
  private getMatchesFilterFn(yahooResultItem: YahooAutocompleteResult) {
    const ALLOWED_TYPES = [
      'S',  // Stocks
      'E',  // ETFs
    ];
  
    const ALLOWED_EXCHANGES = [
      'NYSE',
      'NASDAQ',
    ];

    return (
      ALLOWED_TYPES.includes(yahooResultItem.type)
      && ALLOWED_EXCHANGES.some(exchange => yahooResultItem.exchDisp  .toUpperCase().startsWith(exchange))
    );
  }

  /**
   * Helper method which returns map function for findMatches API results.
   * @param yahooResultItem Result item from Yahoo API.
   * @returns The map function.
   */
  private getMatchesMapFn(yahooResultItem: YahooAutocompleteResult) {
    return {
      symbol: yahooResultItem.symbol,
      name: yahooResultItem.name,
      exchange: yahooResultItem.exchDisp
    };
  }
}