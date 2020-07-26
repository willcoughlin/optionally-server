import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import schema from './graphql/schema'; 
const { graphiqlExpress } = require('apollo-server-express');

const app = express();
app.use('*', cors());
app.use(compression());


app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
}); 

server.applyMiddleware({ app, path: '/graphql' }); 

const httpServer = createServer(app); 
httpServer.listen({ port: 3000 }, (): void => console.log(`\n🚀      GraphQL is now running on http://localhost:3000/graphql`));