// apolloClient.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// New POP subgraph on Hoodi testnet
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/73367/poa-2/version/latest';

const client = new ApolloClient({
  link: new HttpLink({
    uri: SUBGRAPH_URL,
  }),
  cache: new InMemoryCache(),
});

export default client;
