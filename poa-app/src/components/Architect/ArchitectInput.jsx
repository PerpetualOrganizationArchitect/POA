// components/ArchitectInput.jsx
import React from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Box
} from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";

const ArchitectInput = ({ value, onChange, onSubmit, isDisabled }) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSubmit(); // Execute the onSubmit function if Enter key is pressed
    }
  };
  return (
    <Box ml="13%" mr="13%">
    <InputGroup>
      <Input
        value={value}
        onChange={onChange}
        placeholder="Type here..."
        borderColor="blue.900"
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
      />
      <InputRightElement>
        <IconButton
          icon={<ArrowUpIcon color="teal" />}
          variant="ghost"
          aria-label="Send"
          onClick={onSubmit}
        />
      </InputRightElement>
    </InputGroup>
    </Box>
  );
};

export default ArchitectInput;
