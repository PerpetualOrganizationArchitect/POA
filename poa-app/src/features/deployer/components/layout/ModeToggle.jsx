/**
 * ModeToggle - Switch between Simple and Advanced modes
 * Uses gear icon and coral color scheme
 */

import React from 'react';
import {
  HStack,
  Text,
  Switch,
  Icon,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { PiGear } from 'react-icons/pi';
import { useDeployer, UI_MODES } from '../../context/DeployerContext';

export function ModeToggle() {
  const { state, actions } = useDeployer();
  const isAdvanced = state.ui.mode === UI_MODES.ADVANCED;

  const handleToggle = () => {
    const newMode = isAdvanced ? UI_MODES.SIMPLE : UI_MODES.ADVANCED;
    actions.setUIMode(newMode);
  };

  return (
    <FormControl display="flex" alignItems="center" w="auto">
      <Icon
        as={PiGear}
        boxSize={4}
        color={isAdvanced ? 'coral.500' : 'warmGray.400'}
        mr={2}
      />
      <FormLabel
        htmlFor="advanced-mode"
        mb={0}
        fontSize="sm"
        color={isAdvanced ? 'coral.600' : 'warmGray.500'}
        fontWeight="500"
        cursor="pointer"
        userSelect="none"
      >
        Advanced mode
      </FormLabel>
      <Switch
        id="advanced-mode"
        size="sm"
        isChecked={isAdvanced}
        onChange={handleToggle}
        colorScheme="coral"
      />
    </FormControl>
  );
}

export default ModeToggle;
