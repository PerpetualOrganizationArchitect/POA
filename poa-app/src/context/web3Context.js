/**
 * Web3Context - Minimal context for network modal state
 *
 * Note: All contract interactions (voting, tasks, education, etc.)
 * have been migrated to the new service layer in /services/web3/
 * Use the useWeb3 hook from /hooks for those operations.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from '@/components/ProviderConverter';

const Web3Context = createContext();

export const useWeb3Context = () => {
    return useContext(Web3Context);
}

export const Web3Provider = ({ children }) => {
    const [isNetworkModalOpen, setNetworkModalOpen] = useState(false);
    const [account, setAccount] = useState("0x00");

    const { address, chainId } = useAccount();
    const provider = useEthersProvider();
    const signer = useEthersSigner();

    useEffect(() => {
        setAccount(address);
    }, [address]);

    const checkNetwork = () => {
        if (chainId !== 560048) {
            setNetworkModalOpen(true);
            return false;
        }
        return true;
    };

    const closeNetworkModal = () => {
        setNetworkModalOpen(false);
    };

    return (
        <Web3Context.Provider value={{
            // Wallet state (also available via wagmi hooks directly)
            address,
            chainId,
            signer,
            provider,
            account,
            setAccount,
            // Network modal state
            isNetworkModalOpen,
            closeNetworkModal,
            checkNetwork,
        }}>
            {children}
        </Web3Context.Provider>
    );
};
