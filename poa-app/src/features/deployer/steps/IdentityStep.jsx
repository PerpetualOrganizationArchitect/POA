/**
 * IdentityStep - Visual, engaging organization identity builder
 *
 * Two-column layout with live preview badge and inline uploads.
 * All fields visible (no collapse), clear required vs optional distinction.
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Button,
  Badge,
  Checkbox,
  Text,
  Image,
  IconButton,
  useColorModeValue,
  useToast,
  Tooltip,
  Icon,
  Spinner,
  useBreakpointValue,
} from '@chakra-ui/react';
import { InfoIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
import { PiImage, PiLink, PiUploadSimple, PiGear } from 'react-icons/pi';
import { useDropzone } from 'react-dropzone';
import { useDeployer, UI_MODES } from '../context/DeployerContext';
import { StepHeader, NavigationButtons, ValidationSummary } from '../components/common';
import { validateOrganizationStep } from '../validation/schemas';
import { useIPFScontext } from '@/context/ipfsContext';

/**
 * Preview Badge - Shows logo, name, and description as user types
 */
function PreviewBadge({ name, logoURL, description }) {
  const placeholderBg = useColorModeValue('coral.50', 'warmGray.700');
  const placeholderColor = useColorModeValue('coral.300', 'warmGray.500');
  const descriptionColor = useColorModeValue('warmGray.600', 'warmGray.400');

  const hasContent = name || logoURL || description;

  return (
    <Box
      position="sticky"
      top="100px"
      bg="white"
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor="warmGray.100"
      boxShadow="0 4px 24px rgba(0, 0, 0, 0.06)"
      textAlign="center"
    >
      {/* Header label */}
      <Text
        fontSize="xs"
        fontWeight="600"
        color="coral.500"
        textTransform="uppercase"
        letterSpacing="wide"
        mb={4}
      >
        Live Preview
      </Text>

      {/* Logo placeholder or uploaded image */}
      <Box
        mx="auto"
        w="80px"
        h="80px"
        borderRadius="xl"
        bg={placeholderBg}
        mb={4}
        overflow="hidden"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="2px dashed"
        borderColor={logoURL ? 'transparent' : 'coral.200'}
      >
        {logoURL ? (
          <Image
            src={`https://ipfs.io/ipfs/${logoURL}`}
            alt="Logo"
            objectFit="cover"
            w="100%"
            h="100%"
          />
        ) : (
          <Icon as={PiImage} boxSize={7} color={placeholderColor} />
        )}
      </Box>

      {/* Name - updates live */}
      <Text
        fontWeight="700"
        fontSize="lg"
        color={name ? 'warmGray.800' : 'warmGray.300'}
        noOfLines={2}
        mb={2}
      >
        {name || 'Organization Name'}
      </Text>

      {/* Description - updates live */}
      <Text
        fontSize="sm"
        color={description ? descriptionColor : 'warmGray.300'}
        noOfLines={3}
        lineHeight="tall"
        fontStyle={description ? 'normal' : 'italic'}
      >
        {description || 'Your description will appear here...'}
      </Text>

      {/* Hint */}
      {!hasContent && (
        <Text fontSize="xs" color="warmGray.400" mt={4}>
          Start typing to see your organization come to life
        </Text>
      )}
    </Box>
  );
}

/**
 * Inline Logo Upload with drag-drop
 */
function InlineLogoUpload({ logoURL, onUpload, onRemove }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const { addToIpfs } = useIPFScontext();
  const toast = useToast();

  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const hoverBorderColor = useColorModeValue('coral.300', 'coral.500');
  const bgColor = useColorModeValue('warmGray.50', 'warmGray.800');
  const hoverBgColor = useColorModeValue('coral.50', 'rgba(240, 101, 67, 0.1)');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const addedData = await addToIpfs(file);
      const ipfsUrl = addedData.path;
      onUpload(ipfsUrl);
      toast({
        title: 'Logo uploaded!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Upload failed. Please try again.');
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  }, [addToIpfs, onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    onDrop,
    disabled: isUploading,
  });

  if (logoURL) {
    return (
      <HStack spacing={4} align="center">
        <Box
          w="80px"
          h="80px"
          borderRadius="lg"
          overflow="hidden"
          border="2px solid"
          borderColor="coral.200"
        >
          <Image
            src={`https://ipfs.io/ipfs/${logoURL}`}
            alt="Logo"
            objectFit="cover"
            w="100%"
            h="100%"
          />
        </Box>
        <VStack align="start" spacing={1}>
          <Badge colorScheme="green" fontSize="xs">Logo uploaded</Badge>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              borderColor="warmGray.300"
              onClick={() => document.getElementById('logo-upload-input').click()}
            >
              Change
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="warmGray.500"
              onClick={onRemove}
            >
              Remove
            </Button>
          </HStack>
        </VStack>
        <input
          id="logo-upload-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onDrop([e.target.files[0]]);
            }
          }}
        />
      </HStack>
    );
  }

  return (
    <Box
      {...getRootProps()}
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={isDragActive ? 'coral.400' : borderColor}
      borderRadius="xl"
      p={6}
      textAlign="center"
      cursor="pointer"
      bg={isDragActive ? hoverBgColor : bgColor}
      transition="all 0.2s"
      _hover={{
        borderColor: hoverBorderColor,
        bg: hoverBgColor,
      }}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <VStack spacing={2}>
          <Spinner size="md" color="coral.500" />
          <Text fontSize="sm" color="warmGray.600">Uploading...</Text>
        </VStack>
      ) : (
        <VStack spacing={2}>
          <Icon as={PiUploadSimple} boxSize={8} color="warmGray.400" />
          <Text fontSize="sm" color="warmGray.600" fontWeight="medium">
            {isDragActive ? 'Drop your logo here' : 'Drag logo here or click to upload'}
          </Text>
          <Text fontSize="xs" color="warmGray.400">
            PNG, JPG, or GIF up to 2MB
          </Text>
        </VStack>
      )}
      {error && (
        <Text fontSize="xs" color="red.500" mt={2}>{error}</Text>
      )}
    </Box>
  );
}

/**
 * Inline Link Tag Builder
 */
function LinkTagBuilder({ links, onAdd, onRemove }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const inputBg = useColorModeValue('white', 'warmGray.800');

  const handleAdd = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      onAdd({ name: newLinkName.trim(), url: newLinkUrl.trim() });
      setNewLinkName('');
      setNewLinkUrl('');
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newLinkName && newLinkUrl) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <VStack align="stretch" spacing={3}>
      {/* Existing links as badges */}
      {links && links.length > 0 && (
        <HStack flexWrap="wrap" spacing={2}>
          {links.map((link, i) => (
            <Badge
              key={i}
              colorScheme="coral"
              borderRadius="full"
              px={3}
              py={1.5}
              display="flex"
              alignItems="center"
              gap={2}
              fontSize="sm"
            >
              <Icon as={PiLink} boxSize={3} />
              <Text maxW="120px" isTruncated>{link.name}</Text>
              <IconButton
                icon={<CloseIcon />}
                size="xs"
                variant="ghost"
                minW="auto"
                h="auto"
                p={0}
                color="coral.700"
                _hover={{ color: 'coral.900' }}
                onClick={() => onRemove(i)}
                aria-label="Remove link"
              />
            </Badge>
          ))}
        </HStack>
      )}

      {/* Add link form */}
      {isAdding ? (
        <Box
          p={3}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          bg={inputBg}
        >
          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <Input
                placeholder="Label (e.g., Website)"
                size="sm"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <Input
                placeholder="URL"
                size="sm"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </HStack>
            <HStack justify="flex-end" spacing={2}>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewLinkName('');
                  setNewLinkUrl('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                bg="coral.500"
                color="white"
                _hover={{ bg: 'coral.600' }}
                onClick={handleAdd}
                isDisabled={!newLinkName.trim() || !newLinkUrl.trim()}
              >
                Add
              </Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <Button
          leftIcon={<AddIcon />}
          variant="outline"
          size="sm"
          borderColor="warmGray.300"
          color="warmGray.600"
          _hover={{ borderColor: 'coral.300', color: 'coral.600' }}
          onClick={() => setIsAdding(true)}
          w="fit-content"
        >
          Add link
        </Button>
      )}
    </VStack>
  );
}

/**
 * Main IdentityStep Component
 */
export function IdentityStep() {
  const { state, actions } = useDeployer();
  const { addToIpfs } = useIPFScontext();
  const toast = useToast();

  const [validationErrors, setValidationErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Responsive: show preview on desktop only
  const showPreview = useBreakpointValue({ base: false, lg: true });

  // Check if in advanced mode
  const isAdvancedMode = state.ui.mode === UI_MODES.ADVANCED;

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const optionalCardBg = useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(51, 48, 44, 0.6)');
  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const helperColor = useColorModeValue('warmGray.500', 'warmGray.400');
  const labelColor = useColorModeValue('warmGray.700', 'warmGray.300');

  const { organization } = state;

  const handleInputChange = (field, value) => {
    actions.updateOrganization({ [field]: value });
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLogoUpload = (logoURL) => {
    actions.setLogoURL(logoURL);
  };

  const handleLogoRemove = () => {
    actions.setLogoURL('');
  };

  const handleAddLink = (link) => {
    const currentLinks = organization.links || [];
    actions.updateOrganization({ links: [...currentLinks, link] });
  };

  const handleRemoveLink = (index) => {
    const currentLinks = organization.links || [];
    actions.updateOrganization({
      links: currentLinks.filter((_, i) => i !== index),
    });
  };

  const uploadToIPFS = async () => {
    const jsonData = {
      description: organization.description,
      links: (organization.links || []).map((link) => ({
        name: link.name,
        url: link.url,
      })),
      template: state.ui.selectedTemplate || 'default',
    };

    try {
      const result = await addToIpfs(JSON.stringify(jsonData));
      actions.setIPFSHash(result.path);
      return true;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to save organization data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  };

  const handleNext = async () => {
    const { isValid, errors } = validateOrganizationStep(organization);

    if (!isValid) {
      setValidationErrors(errors);
      toast({
        title: 'Step incomplete',
        description: 'You can come back to finish this step later.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      // Continue navigation even if validation fails
    }

    // Only attempt IPFS upload if we have required data
    if (organization.name && organization.description) {
      setIsUploading(true);
      await uploadToIPFS();
      setIsUploading(false);
    }

    actions.nextStep();
  };

  const handleBack = () => {
    actions.prevStep();
  };

  // Character count for description
  const descriptionLength = organization.description?.length || 0;
  const maxDescriptionLength = 500;

  return (
    <>
      <StepHeader
        title="What should we call you?"
        description="Give your community a name and tell people what you're about."
      />

      <ValidationSummary errors={validationErrors} />

      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 300px' }}
        gap={8}
      >
        {/* Form Column */}
        <GridItem>
          <VStack spacing={5} align="stretch">
            {/* Main Fields Card */}
            <Box
              bg={cardBg}
              p={{ base: 5, md: 6 }}
              borderRadius="2xl"
              borderLeft="4px solid"
              borderLeftColor="coral.400"
              boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
            >
              <VStack spacing={5} align="stretch">
                {/* Name */}
                <FormControl isRequired isInvalid={!!validationErrors.name}>
                  <FormLabel fontWeight="600" color={labelColor} fontSize="sm">
                    Name
                  </FormLabel>
                  <Input
                    size="lg"
                    placeholder="Sunrise Bakery Collective"
                    value={organization.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    autoFocus
                    bg="white"
                    borderColor="warmGray.200"
                    _hover={{ borderColor: 'warmGray.300' }}
                    _focus={{ borderColor: 'coral.400', boxShadow: '0 0 0 2px rgba(240, 101, 67, 0.15)' }}
                  />
                </FormControl>

                {/* About */}
                <FormControl isRequired isInvalid={!!validationErrors.description}>
                  <FormLabel fontWeight="600" color={labelColor} fontSize="sm">
                    About
                  </FormLabel>
                  <Textarea
                    placeholder="Tell people what you do and why this group exists..."
                    value={organization.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    resize="vertical"
                    maxLength={maxDescriptionLength}
                    bg="white"
                    borderColor="warmGray.200"
                    _hover={{ borderColor: 'warmGray.300' }}
                    _focus={{ borderColor: 'coral.400', boxShadow: '0 0 0 2px rgba(240, 101, 67, 0.15)' }}
                  />
                  <HStack justify="flex-end" mt={1}>
                    <Text
                      fontSize="xs"
                      color={descriptionLength > 50 ? 'green.500' : 'warmGray.400'}
                    >
                      {descriptionLength}/{maxDescriptionLength}
                    </Text>
                  </HStack>
                </FormControl>

                {/* Logo */}
                <FormControl>
                  <HStack mb={2}>
                    <FormLabel fontWeight="600" color={labelColor} fontSize="sm" mb={0}>
                      Logo
                    </FormLabel>
                    <Badge
                      bg="warmGray.100"
                      color="warmGray.500"
                      fontSize="xs"
                      fontWeight="500"
                    >
                      optional
                    </Badge>
                  </HStack>
                  <InlineLogoUpload
                    logoURL={organization.logoURL}
                    onUpload={handleLogoUpload}
                    onRemove={handleLogoRemove}
                  />
                </FormControl>
              </VStack>
            </Box>

            {/* Extra Details Card */}
            <Box
              bg={optionalCardBg}
              backdropFilter="blur(8px)"
              p={{ base: 4, md: 5 }}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
            >
              <Text fontSize="xs" fontWeight="600" color="warmGray.400" textTransform="uppercase" letterSpacing="wide" mb={4}>
                Extra Details
              </Text>

              <VStack spacing={4} align="stretch">
                {/* Links */}
                <FormControl>
                  <FormLabel fontWeight="600" color={labelColor} fontSize="sm">
                    Links
                  </FormLabel>
                  <LinkTagBuilder
                    links={organization.links}
                    onAdd={handleAddLink}
                    onRemove={handleRemoveLink}
                  />
                  <FormHelperText color={helperColor} fontSize="xs">
                    Add your website, Twitter, Discord, etc.
                  </FormHelperText>
                </FormControl>
              </VStack>
            </Box>

            {/* Advanced Settings Card - Only in Advanced Mode */}
            {isAdvancedMode && (
              <Box
                bg={optionalCardBg}
                backdropFilter="blur(8px)"
                p={{ base: 4, md: 5 }}
                borderRadius="xl"
                border="1px solid"
                borderColor="amethyst.200"
              >
                <HStack spacing={2} mb={4}>
                  <Icon as={PiGear} color="amethyst.500" boxSize={4} />
                  <Text fontSize="xs" fontWeight="600" color="amethyst.500" textTransform="uppercase" letterSpacing="wide">
                    Advanced Settings
                  </Text>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {/* Contract Upgrades */}
                  <Box>
                    <FormControl>
                      <HStack align="flex-start" spacing={3}>
                        <Checkbox
                          isChecked={organization.autoUpgrade}
                          onChange={(e) =>
                            handleInputChange('autoUpgrade', e.target.checked)
                          }
                          colorScheme="purple"
                          size="md"
                          mt={1}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="600" color="warmGray.700" mb={1}>
                            Automatic Contract Upgrades
                          </Text>
                          <Text fontSize="xs" color={helperColor} lineHeight="tall">
                            When enabled, your organization's smart contracts will automatically
                            upgrade to new beacon implementations. This ensures you receive
                            security patches and new features without manual intervention.
                            Upgrades are deployed through the protocol's governance process.
                          </Text>
                        </Box>
                      </HStack>
                    </FormControl>
                  </Box>

                  {/* Placeholder for future advanced options */}
                  <Text fontSize="xs" color="warmGray.400" fontStyle="italic">
                    More configuration options coming soon...
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Navigation */}
            <NavigationButtons
              onBack={handleBack}
              onNext={handleNext}
              isLoading={isUploading}
              nextLabel="Continue"
            />
          </VStack>
        </GridItem>

        {/* Preview Column - Desktop only */}
        {showPreview && (
          <GridItem>
            <PreviewBadge
              name={organization.name}
              logoURL={organization.logoURL}
              description={organization.description}
            />
          </GridItem>
        )}
      </Grid>
    </>
  );
}

export default IdentityStep;
