import IStocksApi from '../data-source/stocks-api/IStocksApi';
import { Resolvers, CalculatorInput } from './types';
import { calculateMaxRiskAndReturn, calclateEntryCost } from '../util/return-calculator';
import { GQLSafeNumber } from '../util/types';

// Lets resolvers know what's available in the context
export type ResolverContext = {
  dataSources: {
    stocksApi: IStocksApi
  }
};

const resolvers: Resolvers = {
  // Query resolvers
  Query: {
    stock: async (_, args, context) => context.dataSources.stocksApi.getStock(args.symbol),
    calculateReturns: (_, args, context, resolveInfo) => {
      const maxRiskAndReturn = calculateMaxRiskAndReturn(args.input);
      return {
        breakEvenAtExpiry: 0,
        entryCost: calclateEntryCost(args.input),
        maxRisk: maxRiskAndReturn[0],
        maxReturn: maxRiskAndReturn[1],
        returnsTable: []
      };  
    }
  },
  // @ts-ignore
  Stock: {
    // Use a resolver specifically for optionsChain field since it requires an API call.
    optionsChain: (parent, _, context) => context.dataSources.stocksApi.getOptions(parent.symbol)
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