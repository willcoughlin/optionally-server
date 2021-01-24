import IAutocompleteApi from '../data-source/autocomplete-api/IAutocompleteApi';
import IStocksApi from '../data-source/stocks-api/IStocksApi';
import { calculateEntryCost, calculateMaxRiskAndReturn } from '../util/return-calculator';
import { Resolvers } from './types';

// Lets resolvers know what's available in the context
export type ResolverContext = {
  dataSources: {
    autocompleteApi: IAutocompleteApi,
    stocksApi: IStocksApi
  }
};

const resolvers: Resolvers = {
  // Query resolvers
  Query: {
    lookup: async(_, args, context) => context.dataSources.autocompleteApi.findMatches(args.query),
    stock: async (_, args, context) => context.dataSources.stocksApi.getStock(args.symbol),
    calculateReturns: (_, args) => {
      const maxRiskAndReturn = calculateMaxRiskAndReturn(args.input);
      return {
        breakEvenAtExpiry: 0,
        entryCost: calculateEntryCost(args.input),
        maxRisk: maxRiskAndReturn[0],
        maxReturn: maxRiskAndReturn[1],
        returnsTable: []
      };  
    }
  },
  // @ts-ignore
  Stock: {
    // Use a resolver specifically for optionsChain field since it requires an API call.
    optionsChain: (parent, _, context) => context.dataSources.stocksApi.getOptions(parent)
  },
  // @ts-ignore
  Tradable: {
    __resolveType: (parent) => {
      if ('symbol' in parent) return 'Stock'
      if ('strike' in parent) return 'Option'
      return null;
    }
  }
};

export default resolvers;