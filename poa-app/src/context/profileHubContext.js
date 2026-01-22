//profileHubContext

import React, { createContext, useReducer, useContext, useState, useEffect } from 'react';


const ProfileHubContext = createContext();

export const useprofileHubContext = () => {
    return useContext(ProfileHubContext);
    }


export const ProfileHubProvider = ({ children }) => {
    
    const [profileHubLoaded, setprofileHubLoaded] = useState(false);
    const [perpetualOrganizations, setPerpetualOrganizations] = useState([]);

    useEffect(() => {
        console.log("profileHubed load", profileHubLoaded)
        if (profileHubLoaded) {
            fetchPOs().then((data) => {
                console.log(data);
                setPerpetualOrganizations(data);
            });
            
        }
    }
    , [profileHubLoaded]);



    // POP subgraph on Hoodi testnet
    const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
        'https://api.studio.thegraph.com/query/73367/poa-2/version/latest';

    async function querySubgraph(query) {
        try {
            console.log('Fetching from subgraph:', SUBGRAPH_URL);
            const response = await fetch(SUBGRAPH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                console.error('Subgraph request failed:', response.status, response.statusText);
                return null;
            }

            const data = await response.json();

            if (data.errors) {
                console.error('Subgraph query errors:', data.errors);
                return null;
            }

            return data.data;
        } catch (error) {
            console.error('Error querying subgraph:', error);
            return null;
        }
    }

    async function fetchPOs() {
        // Updated for POP subgraph schema (Hoodi testnet)
        const query = `
        {
          organizations(first: 100, orderBy: deployedAt, orderDirection: desc) {
            id
            name
            metadataHash
            deployedAt
            participationToken {
              id
              totalSupply
            }
            quickJoin {
              id
            }
            users {
              id
            }
          }
        }`;

        const data = await querySubgraph(query);

        // Transform to match old structure expected by browser page
        const orgs = data?.organizations || [];
        return orgs.map(org => ({
            id: org.name || org.id, // Use name as display ID, fallback to bytes ID
            orgId: org.id, // Keep original bytes ID for navigation
            logoHash: org.metadataHash, // Will need IPFS fetch to get actual logo
            totalMembers: org.users?.length || 0,
            aboutInfo: null, // Not available in new schema - would need IPFS fetch
            deployedAt: org.deployedAt,
            quickJoinContract: org.quickJoin?.id,
            participationToken: org.participationToken
        }));
    }



    return (
        <ProfileHubContext.Provider value={{perpetualOrganizations, setprofileHubLoaded}}>
        {children}
        </ProfileHubContext.Provider>
    );
}




