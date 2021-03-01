require('dotenv').config();

import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import YahooAutocompleteApi from './data-source/autocomplete-api/yahoo/YahooAutocompleteApi';
import QuandlEconApi from './data-source/econ-api/quandl/QuandlEconApi';
import OPCStocksApi from './data-source/stocks-api/opc/OPCStocksApi';
import schema from './graphql/schema';

// Create express app
const app = express();
app.use('*', cors());
app.use(compression());

// Create Apollo server
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  dataSources: () => ({ 
    autocompleteApi: new YahooAutocompleteApi(),
    stocksApi: new OPCStocksApi(),
    econApi: new QuandlEconApi(),
  })
}); 

server.applyMiddleware({ app, path: '/graphql' }); 

// Serve it up
const httpServer = createServer(app); 
httpServer.listen({ port: 3000 }, (): void => console.log('\nGraphQL is now running on http://localhost:3000/graphql'));