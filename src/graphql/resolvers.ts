import IAutocompleteApi from '../data-source/autocomplete-api/IAutocompleteApi';
import IEconApi from '../data-source/econ-api/IEconApi';
import IStocksApi from '../data-source/stocks-api/IStocksApi';
import * as returnCalculator from '../util/return-calculator';

import { Resolvers } from './types';

// Lets resolvers know what's available in the context
export type ResolverContext = {
  dataSources: {
    autocompleteApi: IAutocompleteApi,
    stocksApi: IStocksApi,
    econApi: IEconApi,
    ivApi: IStocksApi
  }
};

const resolvers: Resolvers = {
  // Query resolvers
  Query: {
    lookup: async(_, args, context) => context.dataSources.autocompleteApi.findMatches(args.query),
    stock: async (_, args, context) => context.dataSources.stocksApi.getStock(args.symbol),
    calculateReturns: async (_, args, context) => {
      const maxRiskAndReturn = returnCalculator.calculateMaxRiskAndReturn(args.input);
      return {
        breakEvenAtExpiry: returnCalculator.calculateBreakevenAtExpiry(args.input),
        entryCost: returnCalculator.calculateEntryCost(args.input),
        maxRisk: maxRiskAndReturn[0],
        maxReturn: maxRiskAndReturn[1],
        returnsTable: await returnCalculator.calculateReturnMatrix(args.input, context.dataSources.econApi, context.dataSources.ivApi)
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