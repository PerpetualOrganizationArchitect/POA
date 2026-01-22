/**
 * OrganizationStep - Step 1: Organization Details
 *
 * Collects basic organization information:
 * - Name
 * - Description
 * - Logo
 * - Links
 * - Auto-upgrade setting
 * - Username
 */

import React, { useState } from 'react';
import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Badge,
  Checkbox,
  Tooltip,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { useDeployer } from '../context/DeployerContext';
import { StepHeader, NavigationButtons, ValidationSummary } from '../components/common';
import { validateOrganizationStep } from '../validation/schemas';
import { useIPFScontext } from '@/context/ipfsContext';

// Import existing modals - we'll reuse these
import LinksModal from '@/components/Architect/LinksModal';
import LogoDropzoneModal from '@/components/Architect/LogoDropzoneModal';

export function OrganizationStep() {
  const { state, actions } = useDeployer();
  const { addToIpfs } = useIPFScontext();
  const toast = useToast();

  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const formPadding = useBreakpointValue({ base: 3, lg: 4, xl: 6 });
  const formSpacing = useBreakpointValue({ base: 4, lg: 6, xl: 8 });
  const labelFontSize = useBreakpointValue({ base: 'md', lg: 'lg', xl: 'xl' });
  const inputSize = useBreakpointValue({ base: 'md', lg: 'lg', xl: 'lg' });
  const buttonSize = useBreakpointValue({ base: 'md', lg: 'lg', xl: 'lg' });
  const componentSize = useBreakpointValue({ base: 'md', lg: 'lg', xl: 'xl' });

  const { organization } = state;
  const hasLinks = organization.links && organization.links.length > 0;
  const hasLogo = !!organization.logoURL;

  const handleInputChange = (field, value) => {
    actions.updateOrganization({ [field]: value });
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLinksChange = (links) => {
    actions.updateOrganization({ links });
    setIsLinksModalOpen(false);
  };

  const handleLogoChange = (logoURL) => {
    actions.setLogoURL(logoURL);
    setIsLogoModalOpen(false);
  };

  const uploadToIPFS = async () => {
    const jsonData = {
      description: organization.description,
      links: organization.links.map(link => ({
        name: link.name,
        url: link.url,
      })),
      template: organization.template || 'default',
    };

    try {
      const result = await addToIpfs(JSON.stringify(jsonData));
      actions.setIPFSHash(result.path);
      return true;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      toast({
        title: 'IPFS upload failed',
        description: 'There was an error uploading the data to IPFS.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      return false;
    }
  };

  const handleNext = async () => {
    // Validate
    const { isValid, errors } = validateOrganizationStep(organization);

    if (!isValid) {
      setValidationErrors(errors);
      toast({
        title: 'Incomplete Information',
        description: 'Please fill in all required fields.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Upload to IPFS
    setIsUploading(true);
    const uploadSuccess = await uploadToIPFS();
    setIsUploading(false);

    if (uploadSuccess) {
      actions.nextStep();
    }
  };

  return (
    <>
      <StepHeader
        description="Describe your organization to help contributors understand your goals and vision."
      />

      <ValidationSummary errors={validationErrors} />

      <Stack
        bg="white"
        spacing={formSpacing}
        p={formPadding}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        boxShadow="md"
      >
        {/* Organization Name */}
        <FormControl id="orgName" isRequired isInvalid={!!validationErrors.name}>
          <FormLabel fontSize={labelFontSize} fontWeight="medium">
            Organization Name
          </FormLabel>
          <Input
            size={inputSize}
            placeholder="Enter your organization name"
            value={organization.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </FormControl>

        {/* Description */}
        <FormControl id="orgDescription" isRequired isInvalid={!!validationErrors.description}>
          <FormLabel fontSize={labelFontSize} fontWeight="medium">
            Description
          </FormLabel>
          <Textarea
            size={inputSize}
            placeholder="Enter a brief description"
            value={organization.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
          />
        </FormControl>

        {/* Links and Logo */}
        <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
          <FormControl id="orgLinks">
            <FormLabel fontSize={labelFontSize} fontWeight="medium">
              Organization Links
            </FormLabel>
            <Button
              size={buttonSize}
              onClick={() => setIsLinksModalOpen(true)}
            >
              {hasLinks ? 'Edit Links' : 'Add Links'}
            </Button>
            {hasLinks && (
              <Badge colorScheme="green" ml={2}>
                {organization.links.length} Links Added
              </Badge>
            )}
          </FormControl>

          <FormControl id="orgLogo">
            <FormLabel fontSize={labelFontSize} fontWeight="medium">
              Organization Logo
            </FormLabel>
            <Button
              size={buttonSize}
              onClick={() => setIsLogoModalOpen(true)}
            >
              {hasLogo ? 'Change Logo' : 'Upload Logo'}
            </Button>
            {hasLogo && (
              <Badge colorScheme="green" ml={2}>
                Logo Uploaded
              </Badge>
            )}
          </FormControl>
        </Stack>

        {/* Auto-Upgrade Setting */}
        <FormControl>
          <FormLabel fontSize={labelFontSize} fontWeight="medium">
            Auto-Upgrade
            <Tooltip
              label="When enabled, your organization's contracts will automatically upgrade when new versions are released."
              fontSize="md"
            >
              <InfoIcon ml={2} color="gray.400" />
            </Tooltip>
          </FormLabel>
          <Checkbox
            size={componentSize}
            colorScheme="teal"
            isChecked={organization.autoUpgrade}
            onChange={(e) => handleInputChange('autoUpgrade', e.target.checked)}
          >
            Enable automatic contract upgrades
          </Checkbox>
        </FormControl>

        {/* Username (optional) */}
        <FormControl id="username">
          <FormLabel fontSize={labelFontSize} fontWeight="medium">
            Deployer Username (Optional)
            <Tooltip
              label="Your username that will be registered with this organization."
              fontSize="md"
            >
              <InfoIcon ml={2} color="gray.400" />
            </Tooltip>
          </FormLabel>
          <Input
            size={inputSize}
            placeholder="Enter username (optional)"
            value={organization.username || ''}
            onChange={(e) => handleInputChange('username', e.target.value)}
            maxLength={32}
          />
        </FormControl>

        <NavigationButtons
          onNext={handleNext}
          nextDisabled={!organization.name || !organization.description}
          isLoading={isUploading}
        />
      </Stack>

      {/* Modals */}
      <LinksModal
        isOpen={isLinksModalOpen}
        onSave={handleLinksChange}
        onClose={() => setIsLinksModalOpen(false)}
      />
      <LogoDropzoneModal
        isOpen={isLogoModalOpen}
        onSave={handleLogoChange}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </>
  );
}

export default OrganizationStep;
