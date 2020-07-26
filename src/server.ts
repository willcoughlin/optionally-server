import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import OPCStocksApi from './datasource/opc-stocks-api/OPCStocksApi';
import schema from './graphql/schema';

// Create express app
const app = express();
app.use('*', cors());
app.use(compression());

// Create Apollo server
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  dataSources: () => ({ stocksApi: new OPCStocksApi() })
}); 

server.applyMiddleware({ app, path: '/graphql' }); 

// Serve it up
const httpServer = createServer(app); 
httpServer.listen({ port: 3000 }, (): void => console.log('\nGraphQL is now running on http://localhost:3000/graphql'));