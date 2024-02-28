import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import ArchitectInput from "@/components/Architect/ArchitectInput";
import { Box, Flex, VStack } from "@chakra-ui/react";
import ConversationLog from "@/components/Architect/ConversationLog";
import Character from "@/components/Architect/Character";
import Selection from "@/components/Architect/Selection";

const ArchitectPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [showSelection, setShowSelection] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Simulating a greeting message from "POA" on initial load
    const greetingMessage1 = {
      speaker: "POA",
      text: "Hello!, I'm Poa, your perpetual organization architect.",
    };

    const greetingMessage2 = {
      speaker: "POA",
      text: "Click the button below when you're ready to get started.",
    };
    setMessages([...messages, greetingMessage1, greetingMessage2]);

    setShowSelection(true);
  }, []);

  useEffect(() => {
    // Simulate the greeting message and show options
    generateOptions();
  }, []);

  const generateOptions = () => {
    // For the greeting, generate one option
    const greetingOptions = [
      {
        title: "I'm Ready!",
        action: () => {
          // Close the selection
          setShowSelection(false);
          // Add new system messages
          setMessages((prevMessages) => [
            ...prevMessages,
            { speaker: "system", text: "Let's start building!" },
            {
              speaker: "system",
              text: "What type of community are you looking to build?",
            },
          ]);
        },
      },
    ];
    setOptions(greetingOptions);
    setShowSelection(true);
  };

  const handleOptionSelected = (action) => {
    action(); // Perform the action associated with the option
  };
  const handleSendClick = () => {
    if (!userInput.trim()) return;

    const newUserMessage = { speaker: "user", text: userInput };
    const newResponseMessage = {
      speaker: "system",
      text: "This is a hardcoded response.",
    };

    setMessages([...messages, newUserMessage, newResponseMessage]);
    setUserInput("");
  };
  // Define the selectionHeight based on the visibility of the Selection component
  const selectionHeight = showSelection ? "50%" : "0%"; // If Selection is shown, it takes 50% of the screen height

  return (
    <Layout isArchitectPage>
      <Box position="fixed" top="0" left="0" right="0" zIndex="sticky">
        <Character />
      </Box>

      <Box
        position="fixed"
        top="115px" // This should be the height of the Character component
        bottom="60px" // Adjust this value to the height of the ArchitectInput component
        overflowY="auto"
        width="full"
        pt="4"
        px="4"
      >
        <ConversationLog messages={messages} />
      </Box>

      {showSelection && (
        <Box
          position="fixed"
          bottom="60px" // This should be the height of the ArchitectInput component
          left="0"
          right="0"
          height={selectionHeight}
          p="4"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="purple.50"
          borderTop="2px solid"
          borderColor="gray.200"
          zIndex="sticky"
        >
          <Selection
            options={options}
            onOptionSelected={handleOptionSelected}
          />
        </Box>
      )}

      <Box
        position="fixed"
        bottom="0"
        width="full"
        p={4}
        paddingRight={10}
        zIndex="sticky"
      >
        <ArchitectInput
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onSubmit={handleSendClick}
        />
      </Box>
    </Layout>
  );
};

export default ArchitectPage;
