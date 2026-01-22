import React from "react";
import { Box, Text, Flex, Badge, VStack, HStack, Icon } from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { usePOContext } from "@/context/POContext";

// Helper to map hat IDs to role names
const getRestrictedRoleNames = (restrictedHatIds, roleHatIds, roleNames = {}) => {
    if (!restrictedHatIds?.length || !roleHatIds?.length) return [];
    return restrictedHatIds.map(hatId => {
        // First try to get name from roleNames map
        const name = roleNames[hatId] || roleNames[String(hatId)];
        if (name) return name;

        // Fallback to "Role N" based on index
        const roleIndex = roleHatIds?.findIndex(rh => rh === hatId || String(rh) === String(hatId));
        if (roleIndex >= 0) return `Role ${roleIndex + 1}`;
        return null;
    }).filter(Boolean);
};

const glassLayerStyle = {
  position: "absolute",
  height: "100%",
  width: "100%",
  zIndex: -1,
  borderRadius: "inherit",
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(0, 0, 0, .8)",
  boxShadow: "inset 0 0 15px rgba(148, 115, 220, 0.15)",
  border: "1px solid rgba(148, 115, 220, 0.2)",
};

const HistoryCard = ({ proposal, onPollClick }) => {
  const { roleHatIds, roleNames } = usePOContext();

  // Get role names for restricted voting
  const restrictedRoles = getRestrictedRoleNames(proposal.restrictedHatIds, roleHatIds, roleNames);

  const predefinedColors = [
    "#9B59B6", // Purple
    "#3498DB", // Blue
    "#F1C40F", // Yellow
    "#E74C3C", // Red
    "#2ECC71", // Green
  ];
  
  // Parse and normalize all vote counts first
  const normalizedOptions = [];
  let totalCalculatedVotes = 0;
  
  // First pass: extract and normalize all vote counts
  if (proposal.options && Array.isArray(proposal.options)) {
    proposal.options.forEach((option, index) => {
      let voteCount = 0;
      
      try {
        if (option.votes !== undefined) {
          if (typeof option.votes === 'number') {
            voteCount = option.votes;
          } else if (typeof option.votes === 'string') {
            voteCount = parseInt(option.votes, 10) || 0;
          } else if (typeof option.votes === 'object') {
            if (option.votes && option.votes._hex) {
              voteCount = parseInt(option.votes._hex, 16) || 0;
            } else if (option.votes && typeof option.votes.toNumber === 'function') {
              try {
                voteCount = option.votes.toNumber() || 0;
              } catch (e) {
                console.error("Error converting BigNumber:", e);
                voteCount = 0;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error parsing vote count:", error);
        voteCount = 0;
      }
      
      normalizedOptions.push({
        ...option,
        normalizedVotes: voteCount,
        name: option.name || `Option ${index + 1}`,
      });
      
      totalCalculatedVotes += voteCount;
    });
  }
  
  console.log("Total Calculated Votes:", totalCalculatedVotes);
  
  // Use calculated total or fall back to proposal.totalVotes if needed
  const totalVotes = totalCalculatedVotes > 0 
    ? totalCalculatedVotes 
    : (proposal.totalVotes ? Number(proposal.totalVotes) : 1);
  
  // Make sure we have valid options data
  const hasValidOptions = normalizedOptions.length > 0;
  
  // Create processed options array with correct percentages
  const processedOptions = hasValidOptions 
    ? normalizedOptions.map((option, index) => {
        const color = index < predefinedColors.length 
          ? predefinedColors[index]
          : `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
        
        // Calculate percentage from total votes
        const percentage = totalVotes > 0 
          ? (option.normalizedVotes / totalVotes) * 100
          : 0;
          
        console.log(`Option ${index} (${option.name}) - Votes: ${option.normalizedVotes} / ${totalVotes} = ${percentage.toFixed(1)}%`);
        
        return {
          name: option.name,
          optionName: option.name,
          votes: option.normalizedVotes,
          percentage: percentage,
          color: color
        };
      }) 
    : [];
  
  // Create data for the chart
  const data = [{
    name: "Options",
    values: processedOptions.map(option => ({
      value: option.percentage,
      color: option.color,
      name: option.name,
      optionName: option.optionName,
      votes: option.votes
    }))
  }];
  
  let WinnerName = "No Winner";
  if (proposal.isValid !== false &&
      proposal.winningOption !== undefined &&
      proposal.winningOption !== null &&
      normalizedOptions[proposal.winningOption]) {
    WinnerName = normalizedOptions[proposal.winningOption].name;
  }

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      borderRadius="2xl"
      boxShadow="lg"
      display="flex"
      w="100%"
      maxWidth="380px"
      bg="transparent"
      position="relative"
      color="rgba(333, 333, 333, 1)"
      p={4}
      zIndex={1}
      h="200px"
      transition="all 0.3s ease"
      cursor="pointer"
      _hover={{ 
        transform: "translateY(-5px) scale(1.02)", 
        boxShadow: "0 10px 20px rgba(148, 115, 220, 0.2)",
        "& .glass": {
          border: "1px solid rgba(148, 115, 220, 0.5)",
          boxShadow: "inset 0 0 20px rgba(148, 115, 220, 0.3)",
        }
      }}
      onClick={() => onPollClick(proposal, true)}
    >
      <Box 
        className="glass" 
        style={glassLayerStyle} 
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        borderRadius="inherit"
        zIndex={-1}
        transition="all 0.3s ease"
      />
      
      <VStack spacing={2} align="stretch" w="100%" h="100%">
        <Box h="48px" mb={1}>
          <Text 
            fontSize="md" 
            fontWeight="extrabold"
            borderBottom="2px solid rgba(148, 115, 220, 0.5)" 
            pb={1}
            textAlign="center"
            noOfLines={2}
            title={proposal.title}
          >
            {proposal.title}
          </Text>
        </Box>
        
        <Flex justify="center" flex="1" direction="column" align="center">
          <Box w="100%" h="45px">
            {hasValidOptions && processedOptions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <XAxis type="number" hide={true} />
                  <YAxis type="category" dataKey="name" hide={true} />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      try {
                        // Get option index from dataKey
                        const regex = /values\[(\d+)\]/;
                        const match = props.dataKey.match(regex);
                        
                        if (match && match[1] && processedOptions[match[1]]) {
                          const option = processedOptions[match[1]];
                          const optionName = option.optionName;
                          const voteCount = option.votes;
                          
                          // Format nicely with proper percentage and vote count
                          return [
                            `${option.percentage.toFixed(1)}% (${voteCount} vote${voteCount !== 1 ? 's' : ''})`, 
                            optionName
                          ];
                        }
                      } catch (error) {
                        console.log('Tooltip formatter error:', error);
                      }
                      return [`${value.toFixed(1)}%`, 'Votes'];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(33, 33, 33, 0.9)', 
                      borderColor: 'rgba(148, 115, 220, 0.5)',
                      padding: '8px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'white' }}
                  />
                  {data[0].values.map((option, index) => (
                    <Bar key={index} dataKey={`values[${index}].value`} stackId="a" fill={option.color} name={option.name} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Flex w="100%" h="100%" justify="center" align="center">
                <Text color="whiteAlpha.700" fontSize="sm">No voting data available</Text>
              </Flex>
            )}
          </Box>
          
          <VStack mt={1} spacing={1}>
            <Badge colorScheme="purple" px={2} py={1} borderRadius="md" fontSize="xs">
              Results
            </Badge>
            <Text fontWeight="extrabold" fontSize="sm">
              Winner: <Text as="span" color="rgba(148, 115, 220, 1)">{WinnerName}</Text>
            </Text>
            {/* Who can vote and quorum display */}
            <HStack spacing={2} justify="center" flexWrap="wrap">
              <HStack spacing={1}>
                <Icon as={LockIcon} color="purple.300" boxSize={3} />
                <Text fontSize="xs" color="gray.400">
                  {proposal.isHatRestricted && restrictedRoles.length > 0
                    ? restrictedRoles.join(", ")
                    : "Role 1"}
                </Text>
              </HStack>
              {proposal.quorum > 0 && (
                <Text fontSize="xs" color={proposal.isValid ? "green.400" : "orange.400"}>
                  Quorum: {proposal.quorum}% {proposal.isValid ? "✓" : ""}
                </Text>
              )}
            </HStack>
          </VStack>
        </Flex>
      </VStack>
    </Box>
  );
};

export default HistoryCard; 