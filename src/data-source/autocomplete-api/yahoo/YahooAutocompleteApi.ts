import { RESTDataSource } from "apollo-datasource-rest";
import { LookupResult } from "../../../graphql/types";
import IAutocompleteApi from "../IAutocompleteApi";
import { YahooAutocompleteResponse } from "./types";

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
    return this.get<YahooAutocompleteResponse>(`autoc?region=1&lang=en&query=${query}`)
      .then(res => res.ResultSet.Result.map((yahooResultItem): LookupResult => ({
          symbol: yahooResultItem.symbol,
          name: yahooResultItem.name,
          exchange: yahooResultItem.exchDisp
        })));
  }
}