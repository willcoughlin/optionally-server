/*
 * Types for Yahoo IAutocompleteApi implementation
 */

export type YahooAutocompleteResponse = {
  ResultSet: {
    Query: string;
    Result: YahooAutoCompleteResult[];
  };
}

export type YahooAutoCompleteResult = {
  symbol: string;
  name: string;
  exch: string;
  type: string;
  exchDisp: string;
  typeDisp: string;
};