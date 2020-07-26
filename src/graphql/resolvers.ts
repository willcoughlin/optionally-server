import { Resolvers, OptionType } from './types';

const SPY_OPTIONS_CHAIN = [
  { 
    expiry: '2020-07-27', 
    calls: [
      { strike: 155.0, type: OptionType.Call, bid: 165.24, ask: 165.63, last: 0, expiry: '2020-07-27' }
    ],
    puts: [
      { strike: 155.0, type: OptionType.Put, bid: 0, ask: 0.01, last: 0.04, expiry: '2020-07-27' }
    ]
  }
];

const STOCKS = [
  { symbol: 'SPY', last: 320.85, bid: 320.15, ask: 320.3, optionsChain: SPY_OPTIONS_CHAIN },
  { symbol: 'QQQ', last: 255.44, bid: 254.6, ask: 255.9 },
  { symbol: 'DIA', last: 264.76, bid: 264.15, ask: 264.48 }
];

export const resolvers: Resolvers = {
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
    stock: (_, { symbol }) => STOCKS.find(s => s.symbol == symbol.toUpperCase())
  }
};

export default resolvers;