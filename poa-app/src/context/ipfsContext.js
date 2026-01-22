import { create } from 'ipfs-http-client';
import { createContext, useContext, useMemo, useCallback } from 'react';
import { IPFSError, IPFSErrorCode, IPFSOperation } from '@/lib/errors';

const IPFScontext = createContext();

export const useIPFScontext = () => {
    return useContext(IPFScontext);
};

/**
 * Validate IPFS CID format
 * @param {string} hash - IPFS hash to validate
 * @returns {boolean} True if valid CID format
 */
function isValidIpfsCid(hash) {
    if (!hash || typeof hash !== 'string') return false;
    // Skip if it's a hex bytes value from POP subgraph (starts with 0x)
    if (hash.startsWith('0x')) return false;
    // Valid CIDs start with Qm (v0) or ba (v1)
    return hash.startsWith('Qm') || hash.startsWith('ba');
}

/**
 * Check if a hash is a zero/empty bytes32 value
 * @param {string} hash - Hash to check
 * @returns {boolean} True if it's an empty/zero hash
 */
function isZeroHash(hash) {
    if (!hash) return true;
    // Check for common zero hash formats
    if (hash === '0x0' || hash === '0x') return true;
    // Check for full zero bytes32
    if (hash.startsWith('0x') && /^0x0+$/.test(hash)) return true;
    return false;
}

/**
 * Convert bytes hash to displayable format (for future IPFS gateway use)
 * @param {string} bytesHash - Hash to convert
 * @returns {string|null} Valid CID or null
 */
function bytesHashToString(bytesHash) {
    if (!bytesHash) return null;
    // If already a valid CID, return as-is
    if (isValidIpfsCid(bytesHash)) return bytesHash;
    // If it's a hex string, it needs to be decoded differently
    // For now, just return null as we can't directly use it with IPFS
    if (bytesHash.startsWith('0x')) {
        console.log('IPFS hash is in bytes format, cannot fetch directly:', bytesHash);
        return null;
    }
    return bytesHash;
}

/**
 * Simple retry utility with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} Result of the function
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on validation errors
            if (error instanceof IPFSError && error.code === IPFSErrorCode.INVALID_CID) {
                throw error;
            }

            // Don't retry on the last attempt
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`IPFS operation failed, retrying in ${delay}ms...`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

export const IPFSprovider = ({ children }) => {
    // Setup Infura IPFS client for fetch operations
    const fetchIpfs = useMemo(() => {
        const auth = 'Basic ' + Buffer.from(
            process.env.NEXT_PUBLIC_INFURA_PROJECTID + ':' + process.env.NEXT_PUBLIC_INFURA_IPFS
        ).toString('base64');

        return create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            apiPath: '/api/v0',
            headers: {
                authorization: auth,
            },
        });
    }, []);

    // Setup The Graph IPFS client for add operations
    const addIpfs = useMemo(() => {
        return create({
            host: 'api.thegraph.com',
            port: 443,
            protocol: 'https',
            apiPath: '/ipfs/api/v0',
        });
    }, []);

    /**
     * Add content to IPFS
     * @param {string|Buffer} content - Content to add
     * @returns {Promise<Object>} IPFS add result with path property
     * @throws {IPFSError} If add operation fails
     */
    const addToIpfs = useCallback(async (content) => {
        console.log("[IPFS] Starting upload to The Graph's IPFS endpoint...");
        console.log("[IPFS] Content type:", typeof content);
        console.log("[IPFS] Content length:", typeof content === 'string' ? content.length : content?.length || 'unknown');
        if (typeof content === 'string') {
            console.log("[IPFS] Content preview:", content.substring(0, 200) + (content.length > 200 ? '...' : ''));
        }

        try {
            const addedData = await withRetry(async () => {
                console.log("[IPFS] Attempting add to api.thegraph.com/ipfs...");
                const result = await addIpfs.add({ content });
                console.log("[IPFS] Add successful!");
                console.log("[IPFS] Result:", JSON.stringify(result, null, 2));
                return result;
            });

            console.log("[IPFS] Final CID (path):", addedData.path);
            console.log("[IPFS] CID format check - starts with 'Qm':", addedData.path?.startsWith('Qm'));
            console.log("[IPFS] Full result object:", addedData);
            console.log("[IPFS] You can verify at: https://api.thegraph.com/ipfs/api/v0/cat?arg=" + addedData.path);
            console.log("[IPFS] Public gateway: https://ipfs.io/ipfs/" + addedData.path);

            return addedData;
        } catch (error) {
            console.error("[IPFS] ERROR - Failed to add to IPFS via The Graph:", error);
            console.error("[IPFS] Error name:", error.name);
            console.error("[IPFS] Error message:", error.message);
            console.error("[IPFS] Error stack:", error.stack);

            // If already an IPFSError, rethrow
            if (error instanceof IPFSError) {
                throw error;
            }

            // Wrap in IPFSError for consistent error handling
            throw IPFSError.addFailed(error);
        }
    }, [addIpfs]);

    /**
     * Fetch JSON content from IPFS
     * @param {string} ipfsHash - IPFS CID to fetch
     * @returns {Promise<Object|null>} Parsed JSON content or null for empty hashes
     * @throws {IPFSError} If fetch or parse fails
     */
    const fetchFromIpfs = useCallback(async (ipfsHash) => {
        console.log("fetching from IPFS", ipfsHash);

        // Zero/empty hashes are valid - they mean "no content"
        if (isZeroHash(ipfsHash)) {
            console.log("IPFS hash is empty/zero, returning null");
            return null;
        }

        // Validate and convert hash
        const validHash = bytesHashToString(ipfsHash);
        if (!validHash) {
            // For hex strings that aren't zero, log and return null (not an error)
            // These are bytes32 hashes that need decoding but we can't do it yet
            console.warn("IPFS hash is in unsupported format, returning null:", ipfsHash);
            return null;
        }

        try {
            const result = await withRetry(async () => {
                let stringData = '';
                for await (const chunk of fetchIpfs.cat(validHash)) {
                    console.log("chunk:", chunk);
                    stringData += new TextDecoder().decode(chunk);
                }
                console.log("stringData:", stringData);
                return stringData;
            });

            // Parse JSON
            try {
                return JSON.parse(result);
            } catch (parseError) {
                console.error("Error parsing IPFS content as JSON:", parseError);
                throw IPFSError.parseFailed(validHash, parseError);
            }
        } catch (error) {
            console.error("Error fetching from IPFS:", error, "hash:", validHash);

            // If already an IPFSError, rethrow
            if (error instanceof IPFSError) {
                throw error;
            }

            // Wrap in IPFSError for consistent error handling
            throw IPFSError.fetchFailed(validHash, error);
        }
    }, [fetchIpfs]);

    /**
     * Fetch image from IPFS and return as blob URL
     * @param {string} ipfsHash - IPFS CID of the image
     * @returns {Promise<string|null>} Blob URL of the image or null for empty hashes
     * @throws {IPFSError} If fetch fails
     */
    const fetchImageFromIpfs = useCallback(async (ipfsHash) => {
        console.log("fetching image from IPFS", ipfsHash);

        // Zero/empty hashes are valid - they mean "no image"
        if (isZeroHash(ipfsHash)) {
            console.log("IPFS image hash is empty/zero, returning null");
            return null;
        }

        // Validate and convert hash
        const validHash = bytesHashToString(ipfsHash);
        if (!validHash) {
            console.warn("IPFS image hash is in unsupported format, returning null:", ipfsHash);
            return null;
        }

        try {
            const binaryData = await withRetry(async () => {
                const chunks = [];
                for await (const chunk of addIpfs.cat(validHash)) {
                    chunks.push(chunk);
                }
                return chunks;
            });

            // Convert binary data to Blob
            const blob = new Blob(binaryData, { type: 'image/png' });

            // Create Object URL from Blob
            const imageUrl = URL.createObjectURL(blob);
            console.log("Image URL:", imageUrl);

            return imageUrl;
        } catch (error) {
            console.error("Error fetching image from IPFS:", error);

            // If already an IPFSError, rethrow
            if (error instanceof IPFSError) {
                throw error;
            }

            // Wrap in IPFSError for consistent error handling
            throw new IPFSError(
                IPFSOperation.FETCH_IMAGE,
                validHash,
                error,
                IPFSErrorCode.FETCH_FAILED
            );
        }
    }, [addIpfs]);

    /**
     * Safely fetch from IPFS, returning null on error (for backwards compatibility)
     * Use this when you want to handle missing data gracefully
     * @param {string} ipfsHash - IPFS CID to fetch
     * @returns {Promise<Object|null>} Parsed JSON content or null on error
     */
    const safeFetchFromIpfs = useCallback(async (ipfsHash) => {
        try {
            return await fetchFromIpfs(ipfsHash);
        } catch (error) {
            console.error("Safe fetch failed:", error.message);
            return null;
        }
    }, [fetchFromIpfs]);

    /**
     * Safely fetch image from IPFS, returning null on error
     * @param {string} ipfsHash - IPFS CID of the image
     * @returns {Promise<string|null>} Blob URL or null on error
     */
    const safeFetchImageFromIpfs = useCallback(async (ipfsHash) => {
        try {
            return await fetchImageFromIpfs(ipfsHash);
        } catch (error) {
            console.error("Safe image fetch failed:", error.message);
            return null;
        }
    }, [fetchImageFromIpfs]);

    // Memoize context value
    const value = useMemo(() => ({
        // Standard operations (throw on error)
        fetchFromIpfs,
        fetchImageFromIpfs,
        addToIpfs,
        // Safe operations (return null on error - backwards compatible)
        safeFetchFromIpfs,
        safeFetchImageFromIpfs,
        // Utilities
        isValidIpfsCid,
    }), [fetchFromIpfs, fetchImageFromIpfs, addToIpfs, safeFetchFromIpfs, safeFetchImageFromIpfs]);

    return (
        <IPFScontext.Provider value={value}>
            {children}
        </IPFScontext.Provider>
    );
};
