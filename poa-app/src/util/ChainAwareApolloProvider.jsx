import { useAccount } from 'wagmi';
import { ApolloProvider } from '@apollo/client';
import { getApolloClient } from './apolloClient';
import defaultClient from './apolloClient';

const FALLBACK_CHAIN_ID = 80002;

export default function ChainAwareApolloProvider({ children }) {
  const { chainId } = useAccount();
  const effectiveChainId = chainId || FALLBACK_CHAIN_ID;
  const client = getApolloClient(effectiveChainId) || defaultClient;
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
