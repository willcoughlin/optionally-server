# OptionAlly Server
![test workflow badge](https://github.com/willcoughlin/optionally-server/workflows/Tests/badge.svg)

## Contents
* [Description](#description)
* [Technologies](#technologies)
* [Schema](#schema)
* [Examples](#examples)
* [Source Code](#source-code)
* [Attributions](#attributions)

## Description
This is the server which makes OptionAlly possible, providing market data through an intuitive GraphQL API.

### Setup
After cloning this repo, here's how to get up and running locally.

#### 1. Configure environment
You will need to sign up for a free [Quandl dev account and create and API key](https://docs.quandl.com/docs#section-authentication). After you have an API key, create a file in the root of the project called *.env* and add your key as shown below:
```
YAHOO_BASEURL=http://d.yimg.com/autoc.finance.yahoo.com/
OPC_BASEURL=https://www.optionsprofitcalculator.com/ajax/
QUANDL_BASEURL=https://www.quandl.com/api/v3/datasets/
QUANDL_APIKEY=<YOUR API KEY>
```


#### 2. Install dependencies
```sh
cd optionally-server
npm install
```
#### 3. Run local dev server
```sh
npm run start
```

### Tests
To maintain robustness, OptionAlly Server has tests! Test files are found adjacent their corresponding source files suffixed with *.test.ts*.
#### Run unit tests
```sh
npm run test
```  


## Technologies
<div style="display: flex; justify-content: space-evenly">
  <a href="https://www.typescriptlang.org/">
    <img src="./assets/ts-logo-128.svg" width="64" alt="TypeScript Logo">
  </a>
  <a href="https://graphql.org/">
    <img src="./assets/GraphQL_Logo.svg" width="64" alt="GraphQL Logo">
  </a>
  <a href="https://nodejs.org/en/">
    <img src="./assets/node-js-brands.svg" width="64" alt="Node.js Logo">
  </a>
</div>

OptionAlly Server is built with:
- [TypeScript](https://www.typescriptlang.org/)
- [GraphQL](https://graphql.org/) + [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Node.js](https://nodejs.org/en/) + [Express](https://expressjs.com/)

With special thanks to:
- [Quandl](https://www.quandl.com/)
- [Yahoo Finance](https://finance.yahoo.com/)
- [OptionsProfitCalculator](https://www.optionsprofitcalculator.com/)
  
## Schema
See below for an abridged version of the GraphQL schema. You can view the full version at [/src/graphql/schema.graphql](/src/graphql/schema.graphql).
### Queries
```graphql
type Query {
  lookup(query: String!): [LookupResult]!
  stock(symbol: String!): Stock!
  calculateReturns(input: CalculatorInput!) : CalculatorResult!
}
```

### Types
```graphql
type Stock implements Tradable {
  bid: Float!
  ask: Float!
  last: Float!
  symbol: String!
  optionsChain: [OptionsForExpiry!]!
}

type Option implements Tradable {
  bid: Float!
  ask: Float!
  last: Float!
  strike: Float!
  expiry: String!
  type: OptionType!  # CALL or PUT
  underlyingSymbol: String!
  underlyingPrice: Float!
}

type OptionsForExpiry {
  expiry: String!
  calls: [Option!]!
  puts: [Option!]!
}

type CalculatorResult {
  entryCost: Float!
  maxRisk: Float 
  maxReturn: Float  # null values for maxRisk/maxReturn indicate infinity
  breakEvenAtExpiry: [Float!]!  # 1 for directional, 2 for delta-neutral
  returnsTable: ReturnsTable!
}

type ReturnsTable {
  dates: [String!]!
  underlyingPrices: [Float!]!
  dataMatrix: [[Float!]!]!
}

type LookupResult {
  symbol: String!
  name: String!
  exchange: String!
}

input CalculatorInput {
  strategy: StrategyType!,  # Ex: BULL_CALL_SPREAD
  longCall: OptionInput,
  longPut: OptionInput,
  shortCall: OptionInput,
  shortPut: OptionInput
}

input OptionInput {
  quantity: Int!,
  currentPrice: Float!,
  strike: Float!,
  expiry: String!
  underlyingPrice: Float!,
  type: OptionType!
}
```

## Examples
Now that we've seen the schema, let's see some queries in action.

### Search symbols matching "GM"
Request:
```graphql
{
  lookup(query: "gm") {
    symbol
    name
    exchange
  }
}
```

Response: 
```json
{
  "data": {
    "lookup": [
      {
        "symbol": "GM",
        "name": "General Motors Company",
        "exchange": "NYSE"
      },
      {
        "symbol": "GMVD",
        "name": "G Medical Innovations Holdings Ltd.",
        "exchange": "NASDAQ"
      },
      {
        "symbol": "GMIIU",
        "name": "Gores Metropoulos II, Inc.",
        "exchange": "NASDAQ"
      },
      ...
    ]
  }
}
```

### Get price data for $SPY
Request:
```graphql
{
  stock(symbol: "SPY") {
    symbol
    bid
    ask
    last
  }
}
```

Response:
```json
{
  "data": {
    "stock": {
      "symbol": "SPY",
      "bid": 320.15,
      "ask": 320.3,
      "last": 320.85
    }
  }
}
```

### Get put option data for $TSLA
Request:
```graphql
{
  stock(symbol: "TSLA") {
    optionsChain {
      expiry
      puts {
        underlyingSymbol
        last
        strike,
        expiry,
      }
    }
  } 
}
```

Response:
```json
{
  "data": {
    "stock": {
      "optionsChain": [
        {
          "expiry": "2020-07-31",
          "puts": [
            {
              "underlyingSymbol": "TSLA",
              "last": 0.01,
              "strike": 100,
              "expiry": "2020-07-31"
            },
            {
              "underlyingSymbol": "TSLA",
              "last": 0.01,
              "strike": 150,
              "expiry": "2020-07-31"
            },

            ...
          
          ]
        }
        
        ...
      
      ]
    }
  }
}
```

### Calculate max profit or loss and breakeven points from long strangle:
Request:
```graphql
{
  calculateReturns(input: {
    strategy: STRADDLE_STRANGLE,
    longCall: {
      quantity: 1,
      currentPrice: 1.40,
      strike: 50,
      expiry: "2021-03-19"
    }
    longPut: {
      quantity: 1,
      currentPrice: 1.55,
      strike: 43.5
      expiry: "2021-03-19"
    }
  }) {
    entryCost
    maxRisk
    maxReturn
    breakEvenAtExpiry
  }
}
```

Response:
```json
{
  "data": {
    "calculateReturns": {
      "entryCost": 295,
      "maxRisk": 295,
      "maxReturn": null,
      "breakEvenAtExpiry": [
        51.4,
        41.95
      ]
    }
  }
}
```

## Source Code
Let's run through the source code, shall we?
### [src/server.ts](src/server.ts)
Here is the application entry point. It contains configuration for the Apollo and Express servers. Not much else to see here.

### [src/data-source](src/data-source)
GraphQL resolver data sources. Each subdirectory contains an Interface and current Implementation(s).

#### [src/data-source/autocomplete-api/IAutocompleteApi.ts](src/data-source/autocomplete-api/IAutocompleteApi.ts)
Declares a method to power the mobile app's symbol autocomplete:
- `findMatches` for finding stock or ETF symbols that match the user's query.

#### [src/data-source/econ-api/IEconApi.ts](src/data-source/econ-api/IEconApi.ts)
Declares two macroeconomic data retrieval methods for option pricing:
- `getNearestTBillRate` for getting yield for Treasury Bill with maturity nearest a given date.
- `getInflationRate` for getting the current rate of inflation.

#### [src/data-source/stocks-api/IStocksApi.ts](src/data-source/stocks-api/IStocksApi.ts)
Declares two market data retrieval metthods for our resolvers:
- `getStock` for getting stock price.
- `getOptions` for getting an underlying stock's options chain.

### [src/graphql](src/graphql)
In this directory is all the GraphQL-specific TypeScript code, as well as the schema definition file.

#### [src/graphql/resolvers.ts](src/graphql/resolvers.ts)
Definitions for all neccessary resolvers.

#### [src/graphql/schema.ts](src/graphql/schema.ts)
Creation of the executable `GraphQLSchema` with typedefs and resolvers.

#### [src/graphql/types.ts](src/graphql/types.ts)
GraphQL type definitions generated by [GraphQL Code Generator](https://graphql-code-generator.com/). <small>(Thanks so much ♥!)</small>

#### [src/graphql/schema.graphql](src/graphql/schema.graphql)
 *See section [Schema](#schema) for details*.

### [src/util](src/util)
General utlity modules.

#### [src/util/option-pricing.ts](src/util/option-pricing.ts)
Of note here is the function `calculateOptionPriceForDates`, used to calculate theoretical option prices on each date in a given list of dates. OptionAlly uses the Black-Scholes option pricing model.

Herein also lies `calculateApproximateImpliedVolatility`, which we use to find the approximate IV of a contract. This function essentially binary searches while comparing the actual option price to the calculated Black-Scholes price.

#### [src/util/return-calculator.ts](src/util/return-calculator.ts)
This module is home to most of the business logic. These functions do the work of producing the results for a given `CalculatorInput`, including generating the returns matrix, and calculating risk/reward. 

## Attributions
* The TypeScript Logo is attributed to Microsoft, licensed under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
* The GraphQL Logo is attributed to Facebook, licensed under the <a href="http://opensource.org/licenses/bsd-license.php">BSD License</a>. Icon is not modified.
* The icon *node-js-brands* is attributed to FontAwesome, licensed under [Creative Commons Attribution 4.0 International license](https://fontawesome.com/license). Icon is not modified. Node.js is a trademark of the [OpenJS Foundation](https://openjsf.org/)
