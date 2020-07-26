import { Resolvers } from './types';

const STOCKS = [
  { symbol: 'SPY', last: 320.85, bid: 320.15, ask: 320.3 },
  { symbol: 'QQQ', last: 255.44, bid: 254.6, ask: 255.9 },
  { symbol: 'DIA', last: 264.76, bid: 264.15, ask: 264.48 }
];

export const resolvers: Resolvers = {
  // @ts-ignore
  Tradable: {
    __resolveType: () => 'Stock'
  },
  Query: {
  // @ts-ignore
    stock: (_, { symbol }) => STOCKS.find(s => s.symbol == symbol)
  }
};

export default resolvers;