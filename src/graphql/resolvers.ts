import IStocksApi from '../data-source/stocks-api/IStocksApi';
import { Resolvers } from './types';

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
    calculateReturns: () => { throw new Error("Not Implemented"); }
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