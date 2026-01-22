/**
 * usePermissionToast - Hook for displaying permission-related toast notifications
 * Replaces browser alert() calls with Chakra UI toasts for better UX
 */
import { useToast } from '@chakra-ui/react';
import { PERMISSION_MESSAGES } from '../util/permissions';

/**
 * Custom hook for displaying permission-related toast notifications
 * @returns {Object} Object containing toast helper functions
 */
export function usePermissionToast() {
    const toast = useToast();

    /**
     * Show a permission error toast
     * @param {string} message - The error message to display
     */
    const showPermissionError = (message) => {
        toast({
            title: 'Permission Required',
            description: message,
            status: 'warning',
            duration: 4000,
            isClosable: true,
            position: 'top',
        });
    };

    /**
     * Show a success toast
     * @param {string} title - The toast title
     * @param {string} description - The toast description
     */
    const showSuccess = (title, description) => {
        toast({
            title,
            description,
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top',
        });
    };

    /**
     * Show an error toast
     * @param {string} title - The toast title
     * @param {string} description - The toast description
     */
    const showError = (title, description) => {
        toast({
            title,
            description,
            status: 'error',
            duration: 4000,
            isClosable: true,
            position: 'top',
        });
    };

    /**
     * Show an info toast
     * @param {string} title - The toast title
     * @param {string} description - The toast description
     */
    const showInfo = (title, description) => {
        toast({
            title,
            description,
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top',
        });
    };

    // Pre-built permission error helpers
    return {
        // Generic toast functions
        showPermissionError,
        showSuccess,
        showError,
        showInfo,

        // Specific permission error shortcuts
        requireMember: () => showPermissionError(PERMISSION_MESSAGES.REQUIRE_MEMBER),
        requireExecutive: () => showPermissionError(PERMISSION_MESSAGES.REQUIRE_EXECUTIVE),
        requireMemberClaim: () => showPermissionError(PERMISSION_MESSAGES.TASK_CLAIM_MEMBER),
        requireMemberSubmit: () => showPermissionError(PERMISSION_MESSAGES.TASK_SUBMIT_MEMBER),
        requireExecReview: () => showPermissionError(PERMISSION_MESSAGES.TASK_REVIEW_EXEC),
        requireExecCreate: () => showPermissionError(PERMISSION_MESSAGES.TASK_CREATE_EXEC),
        requireExecDelete: () => showPermissionError(PERMISSION_MESSAGES.TASK_DELETE_EXEC),
        requireExecEdit: () => showPermissionError(PERMISSION_MESSAGES.TASK_EDIT_EXEC),
        requireExecProject: () => showPermissionError(PERMISSION_MESSAGES.PROJECT_MANAGE_EXEC),
        cannotMoveCompleted: () => showPermissionError(PERMISSION_MESSAGES.CANNOT_MOVE_COMPLETED),
    };
}

export default usePermissionToast;
