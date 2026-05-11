import { ChakraProvider, extendTheme, CSSReset } from "@chakra-ui/react";
import { IPFSprovider } from "@/context/ipfsContext";
import { Web3Provider } from "@/context/web3Context";
import { DataBaseProvider } from "@/context/dataBaseContext";
import { ProfileHubProvider } from "@/context/profileHubContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { UserProvider } from "@/context/UserContext";
import { POProvider } from "@/context/POContext";
import { VotingProvider } from "@/context/VotingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import '/public/css/prism.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  polygonAmoy,
  gnosis,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import NetworkModalControl from "@/components/NetworkModalControl";
import { ApolloProvider } from '@apollo/client';
import client from '../util//apolloClient';
import Notification from '@/components/Notifications';



const queryClient = new QueryClient();
const config = getDefaultConfig({
  appName: 'Poa',
  projectId: '7dc7409d6ef96f46e91e9d5797e4deac',
  // Chains list expanded for #517 multi-chain support (paired with the
  // chainId-aware contract-config in src/util/networks.js + checkNetwork
  // generalization in web3Context.js). polygonAmoy remains initialChain
  // because it's the only chain with deployed AccountManager today; the
  // others surface in RainbowKit so a connected wallet on Arb / Gnosis
  // can at least browse via the chainId-aware subgraph routing from #460.
  chains: [polygonAmoy, polygon, sepolia, arbitrum, gnosis],
  ssr: false,
});


const theme = extendTheme({
  fonts: {
    heading: "'Roboto Mono', monospace", 
    body: "'Roboto Mono', monospace", 
  },
  styles: {
    global: {
     
      body: {
        bgGradient: "linear(to-r, orange.200, pink.200)",
        color: "#001443",
      },
      
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider  initialChain={polygonAmoy}>
          <IPFSprovider>
            <ProfileHubProvider>
              <POProvider>
                <VotingProvider>
                  <ProjectProvider>
                  <UserProvider>
                    <NotificationProvider>
                      <Web3Provider>
                        <DataBaseProvider>
                          <ChakraProvider theme={theme}>
                            <NetworkModalControl />
                            <Notification />  
                            <Component {...pageProps} />
                          </ChakraProvider>
                        </DataBaseProvider>
                      </Web3Provider>
                    </NotificationProvider>
                    </UserProvider>
                  </ProjectProvider>
                </VotingProvider>
              </POProvider>
            </ProfileHubProvider>
          </IPFSprovider>
        </RainbowKitProvider>
      </QueryClientProvider>
      </ApolloProvider>
    </WagmiProvider>
  );
}

export default MyApp;
