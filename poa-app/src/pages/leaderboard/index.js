import React, { useEffect, useState} from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';

import { useRouter } from 'next/router';

import { usePOContext } from '@/context/POContext';
import Navbar from "@/templateComponents/studentOrgDAO/NavBar";



const glassLayerStyle = {
  position: 'absolute',
  height: '100%',
  width: '100%',
  zIndex: -1,
  borderRadius: 'inherit',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, .8)',
};



const Leaderboard = () => {

    const router = useRouter();
    const { userDAO } = router.query;
    

    const { leaderboardDisplayData } = usePOContext();
    const [data, setData] = useState([]);

    useEffect(() => {
        if (leaderboardDisplayData) {
            setData(leaderboardDisplayData);
        }
    }, [leaderboardDisplayData]);



  const getMedalColor = (rank) => {
    switch (rank) {
      case 0:
        return 'gold';
      case 1:
        return 'silver';
      case 2:
        return '#cd7f32';
      default:
        return null;
    }
  };

  return (
    <>
    <Navbar />
    <Box position="relative" w="100%" minH="100vh" p={4} >
      <VStack spacing={4}>
        <Heading as="h1">Leaderboard</Heading>
        <Flex justifyContent="center" alignItems="center">
          <Box
            w="100%"
            mt="2"
            borderRadius="2xl"
            bg="transparent"
            boxShadow="lg"
            position="relative"
            zIndex={1}
          >
            <div style={glassLayerStyle} />
            <Table variant="simple" className="leaderboard-table">
              <Thead>
                <Tr>
                  <Th color="ghostwhite">Rank</Th>
                  <Th color="ghostwhite">Name</Th>
                  <Th color="ghostwhite">
                    Tokens

                  </Th>
                </Tr>
              </Thead>
              <Tbody>
              {data?.length > 0 && data.map((entry, index) => {
                  const medalColor = getMedalColor(index);
                  return (
                    <Tr
                      key={entry.id}
                      fontWeight={medalColor ? 'extrabold' : null}
                      _last={{ borderBottom: 'none' }}
                    >
                      <Td borderBottom="none" style={{ color: medalColor || 'ghostwhite' }}>{index + 1}</Td>
                    <Td borderBottom="none" color="ghostwhite">{entry.name}</Td>
                    <Td borderBottom="none" style={{ color: medalColor || 'ghostwhite' }}>{entry.token}</Td>

                    </Tr>

                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Flex>
      </VStack>
    </Box>
    </>
  );
};

export default Leaderboard;

