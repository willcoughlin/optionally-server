/*
 * Types for Yahoo IAutocompleteApi implementation
 */

export type YahooAutocompleteResponse = {
  ResultSet: {
    Query: string;
    Result: YahooAutocompleteResult[];
  };
}

export type YahooAutocompleteResult = {
  symbol: string;
  name: string;
  exch: string;
  type: string;
  exchDisp: string;
  typeDisp: string;
};