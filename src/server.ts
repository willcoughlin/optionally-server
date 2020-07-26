import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import schema from './graphql/schema'; 
import OPCStocksApi from './datasource/opc-stocks-api/OPCStocksApi';

const app = express();
app.use('*', cors());
app.use(compression());

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  dataSources: () => ({ stocksApi: new OPCStocksApi() })
}); 

server.applyMiddleware({ app, path: '/graphql' }); 

const httpServer = createServer(app); 
httpServer.listen({ port: 3000 }, (): void => console.log('\nGraphQL is now running on http://localhost:3000/graphql'));