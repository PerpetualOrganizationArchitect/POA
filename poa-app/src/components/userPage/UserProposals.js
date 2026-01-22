import React from 'react';
import CountDown from '../../templateComponents/studentOrgDAO/voting/countDown';
import {
    Box,
    HStack,
    Heading,
    Text,
    VStack,
    Badge,
} from '@chakra-ui/react';
import Link2 from 'next/link';
import { useRouter } from "next/router";

const glassLayerStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
    borderRadius: 'inherit',
    backdropFilter: 'blur(50px)',
    backgroundColor: 'rgba(0, 0, 0, .9)',
};

const UserProposals = ({ userProposals }) => {
    // Check if user proposals exist
    const router = useRouter();
    const { userDAO } = router.query;
    const userProposalsExist = userProposals && userProposals.length > 0;
    if (!userProposalsExist) {
        return <Text mt="4" ml="7">No proposals available</Text>;
    }

    function calculateRemainingTime(expirationTimestamp) {
        // Current timestamp in seconds
        const currentTimestamp = Math.floor(Date.now() / 1000);
        // Calculate the duration
        const duration = expirationTimestamp - currentTimestamp;
        return duration;
    }

   // oly display first 3 of my proposals
    const myProposals = userProposals.slice(0, 3);


    return (
        <HStack ml={2} mr={8} spacing="3.5%">
            {myProposals.map((proposal) => (
                <Box
                    _hover={{ transform: 'scale(1.04)' }}
                    key={proposal.id}
                    bg="transparent"
                    borderRadius="2xl"
                    p={2}
                    position="relative"
                    w="31%"
                    mt="-4"
                    mb="-3"
                >
                    <div style={glassLayerStyle} />
                    <Link2  href={`/voting/?poll=${proposal.id}&userDAO=${userDAO}`}>
                        <VStack textColor="white" spacing={2}>
                            <Heading ml={4} fontWeight="extrabold" mt={2} size="sm">
                                {proposal.title}
                            </Heading>
                            <Box pl="4" mt="0">
                                <CountDown duration={calculateRemainingTime(proposal.endTimestamp)} />
                            </Box>
                            <Box alignSelf={"flex-start"} ml="4" mt="0">
                                <Badge colorScheme="blue">{proposal.type}</Badge>
                            </Box>
                        </VStack>
                    </Link2>
                </Box>
            ))}
        </HStack>
    );
};

export default UserProposals;
