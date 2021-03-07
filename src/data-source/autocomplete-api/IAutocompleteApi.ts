import { LookupResult } from "../../graphql/types";

/**
 * Provides access to stock symbol autocomplete service provider.
 */
export default interface IAutocompleteApi {
  findMatches(query: string): Promise<LookupResult[]>;
}