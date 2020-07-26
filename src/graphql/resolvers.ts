import IStocksApi from '../datasource/IStocksApi';
import { Resolvers } from './types';

// Lets resolvers know what's available in the context
export type ResolverContext = {
  dataSources: {
    stocksApi: IStocksApi
  }
};

const resolvers: Resolvers = {
  // @ts-ignore
  Tradable: {
    __resolveType: (parent) => {
      if ('symbol' in parent) return 'Stock'
      if ('strike' in parent) return 'Option'
      return null;
    }
  },
  Query: {
  // @ts-ignore
    stock: async (_, args, context) => context.dataSources.stocksApi.getStock(args.symbol)
  },
  Stock: {
    // Use a resolver specifically for optionsChain field since it requires an API call.
    // @ts-ignore
    optionsChain: (parent, _, context) => context.dataSources.stocksApi.getOptions(parent.symbol)
  }
};

export default resolvers;