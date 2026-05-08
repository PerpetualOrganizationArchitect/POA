// apolloClient.js
//
// Per-chain subgraph routing. Each supported chainId maps to a
// `NEXT_PUBLIC_<CHAIN>_SUBGRAPH_URL` env var; `NEXT_PUBLIC_SUBGRAPH_URL`
// is the legacy single-URL fallback for backward compatibility.
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URLS_BY_CHAIN_ID = {
  100:      process.env.NEXT_PUBLIC_GNOSIS_SUBGRAPH_URL,
  137:      process.env.NEXT_PUBLIC_POLYGON_SUBGRAPH_URL,
  10:       process.env.NEXT_PUBLIC_OPTIMISM_SUBGRAPH_URL,
  42161:    process.env.NEXT_PUBLIC_ARBITRUM_SUBGRAPH_URL,
  8453:     process.env.NEXT_PUBLIC_BASE_SUBGRAPH_URL,
  11155111: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
  80002:    process.env.NEXT_PUBLIC_POLYGON_AMOY_SUBGRAPH_URL,
};

const FALLBACK_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL;

const clientCache = new Map();

export function getApolloClient(chainId) {
  const explicit = SUBGRAPH_URLS_BY_CHAIN_ID[chainId];
  const url = explicit || FALLBACK_URL;
  if (!url) {
    if (typeof window !== 'undefined') {
      console.warn(
        `[apolloClient] no subgraph URL configured for chainId=${chainId} ` +
        `and no NEXT_PUBLIC_SUBGRAPH_URL fallback set`
      );
    }
    return null;
  }
  if (clientCache.has(url)) return clientCache.get(url);
  const client = new ApolloClient({
    link: new HttpLink({ uri: url }),
    cache: new InMemoryCache(),
  });
  clientCache.set(url, client);
  return client;
}

const defaultClient = FALLBACK_URL
  ? new ApolloClient({
      link: new HttpLink({ uri: FALLBACK_URL }),
      cache: new InMemoryCache(),
    })
  : null;

export default defaultClient;
