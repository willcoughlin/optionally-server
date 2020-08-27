import { GraphQLResolveInfo } from 'graphql';
import { ResolverContext } from './resolvers';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Tradable = {
  bid: Scalars['Float'];
  ask: Scalars['Float'];
  last: Scalars['Float'];
};

export type Stock = Tradable & {
  __typename?: 'Stock';
  bid: Scalars['Float'];
  ask: Scalars['Float'];
  last: Scalars['Float'];
  symbol: Scalars['String'];
  optionsChain: Array<OptionsForExpiry>;
};

export type Option = Tradable & {
  __typename?: 'Option';
  bid: Scalars['Float'];
  ask: Scalars['Float'];
  last: Scalars['Float'];
  strike: Scalars['Float'];
  expiry: Scalars['String'];
  type: OptionType;
  underlyingSymbol: Scalars['String'];
};

export type OptionsForExpiry = {
  __typename?: 'OptionsForExpiry';
  expiry: Scalars['String'];
  calls: Array<Option>;
  puts: Array<Option>;
};

export type CalculatorResult = {
  __typename?: 'CalculatorResult';
  entryCost: Scalars['Float'];
  maxRisk: Maybe<Scalars['Float']>;
  maxReturn: Maybe<Scalars['Float']>;
  breakEvenAtExpiry: Scalars['Float'];
  returnsTable: Array<ReturnsForDateByStrike>;
};

export type ReturnsForDateByStrike = {
  __typename?: 'ReturnsForDateByStrike';
  date: Scalars['String'];
  returnInDollars: Scalars['Float'];
  returnInPercent: Scalars['Float'];
};

export enum OptionType {
  Call = 'CALL',
  Put = 'PUT'
}

export enum StrategyType {
  Call = 'CALL',
  Put = 'PUT',
  StraddleStrangle = 'STRADDLE_STRANGLE',
  BullCallSpread = 'BULL_CALL_SPREAD',
  BearCallSpread = 'BEAR_CALL_SPREAD',
  BullPutSpread = 'BULL_PUT_SPREAD',
  BearPutSpread = 'BEAR_PUT_SPREAD',
  IronCondor = 'IRON_CONDOR'
}

export type CalculatorInput = {
  strategy: StrategyType;
  longCall: Maybe<OptionInput>;
  longPut: Maybe<OptionInput>;
  shortCall: Maybe<OptionInput>;
  shortPut: Maybe<OptionInput>;
};

export type OptionInput = {
  quantity: Scalars['Int'];
  currentPrice: Scalars['Float'];
  strike: Scalars['Float'];
  expiry: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  stock: Stock;
  calculateReturns: CalculatorResult;
};


export type QueryStockArgs = {
  symbol: Scalars['String'];
};


export type QueryCalculateReturnsArgs = {
  input: CalculatorInput;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Tradable: ResolversTypes['Stock'] | ResolversTypes['Option'];
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Stock: ResolverTypeWrapper<Stock>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Option: ResolverTypeWrapper<Option>;
  OptionsForExpiry: ResolverTypeWrapper<OptionsForExpiry>;
  CalculatorResult: ResolverTypeWrapper<CalculatorResult>;
  ReturnsForDateByStrike: ResolverTypeWrapper<ReturnsForDateByStrike>;
  OptionType: OptionType;
  StrategyType: StrategyType;
  CalculatorInput: CalculatorInput;
  OptionInput: OptionInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Tradable: ResolversParentTypes['Stock'] | ResolversParentTypes['Option'];
  Float: Scalars['Float'];
  Stock: Stock;
  String: Scalars['String'];
  Option: Option;
  OptionsForExpiry: OptionsForExpiry;
  CalculatorResult: CalculatorResult;
  ReturnsForDateByStrike: ReturnsForDateByStrike;
  CalculatorInput: CalculatorInput;
  OptionInput: OptionInput;
  Int: Scalars['Int'];
  Query: {};
  Boolean: Scalars['Boolean'];
}>;

export type TradableResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Tradable'] = ResolversParentTypes['Tradable']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Stock' | 'Option', ParentType, ContextType>;
  bid: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ask: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  last: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type StockResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Stock'] = ResolversParentTypes['Stock']> = ResolversObject<{
  bid: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ask: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  last: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  symbol: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  optionsChain: Resolver<Array<ResolversTypes['OptionsForExpiry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type OptionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Option'] = ResolversParentTypes['Option']> = ResolversObject<{
  bid: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ask: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  last: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  strike: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  expiry: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type: Resolver<ResolversTypes['OptionType'], ParentType, ContextType>;
  underlyingSymbol: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type OptionsForExpiryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['OptionsForExpiry'] = ResolversParentTypes['OptionsForExpiry']> = ResolversObject<{
  expiry: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  calls: Resolver<Array<ResolversTypes['Option']>, ParentType, ContextType>;
  puts: Resolver<Array<ResolversTypes['Option']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type CalculatorResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CalculatorResult'] = ResolversParentTypes['CalculatorResult']> = ResolversObject<{
  entryCost: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  maxRisk: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  maxReturn: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  breakEvenAtExpiry: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  returnsTable: Resolver<Array<ResolversTypes['ReturnsForDateByStrike']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ReturnsForDateByStrikeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReturnsForDateByStrike'] = ResolversParentTypes['ReturnsForDateByStrike']> = ResolversObject<{
  date: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  returnInDollars: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  returnInPercent: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type QueryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  stock: Resolver<ResolversTypes['Stock'], ParentType, ContextType, RequireFields<QueryStockArgs, 'symbol'>>;
  calculateReturns: Resolver<ResolversTypes['CalculatorResult'], ParentType, ContextType, RequireFields<QueryCalculateReturnsArgs, 'input'>>;
}>;

export type Resolvers<ContextType = ResolverContext> = ResolversObject<{
  Tradable: TradableResolvers<ContextType>;
  Stock: StockResolvers<ContextType>;
  Option: OptionResolvers<ContextType>;
  OptionsForExpiry: OptionsForExpiryResolvers<ContextType>;
  CalculatorResult: CalculatorResultResolvers<ContextType>;
  ReturnsForDateByStrike: ReturnsForDateByStrikeResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ResolverContext> = Resolvers<ContextType>;
