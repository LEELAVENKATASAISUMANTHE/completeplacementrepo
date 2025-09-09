import { makeExecutableSchema } from '@graphql-tools/schema';
import { createHandler } from 'graphql-http/lib/use/express';
import typeDefs from './typedefs.js';
import { resolvers } from './resolvers.js';

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create GraphQL handler for Express
export const graphQLHandler = createHandler({
  schema,
  context: (req, res) => ({
    req,
    res,
    user: req.session?.user || null,
  }),
  graphiql: process.env.NODE_ENV !== 'production', // Enable GraphiQL in development
});
