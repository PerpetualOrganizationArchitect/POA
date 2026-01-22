/**
 * TaskBoard Styles
 * Centralized style definitions for TaskBoard components
 */

export const glassLayerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '3xl',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, .3)',
};

export const mobileGlassStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
  backdropFilter: 'blur(15px)',
  backgroundColor: 'rgba(0, 0, 0, .5)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export const mobileNavGlassStyle = {
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, .7)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
};

export const infoPopupStyle = {
  backgroundColor: 'rgba(255, 255, 255, 1)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(105, 57, 153, 0.4)',
  borderRadius: '12px',
  padding: '12px',
  maxWidth: '80%',
  textAlign: 'center',
  zIndex: 20,
};

export const columnInfo = {
  'Open': 'Tasks awaiting someone to claim them',
  'In Progress': 'Tasks currently being worked on',
  'Review': 'Tasks awaiting review by team members',
  'Completed': 'Tasks that have been completed and rewards issued'
};

export const emptyStateMessages = {
  'Open': 'Looks like a blank canvas! Create a task and start building something amazing.',
  'In Progress': 'No tasks in the works yet. Claim one from "Open" to show your skills!',
  'Review': 'Nothing to review at the moment. Good work happens before great feedback!',
  'Completed': 'The finish line is waiting for your first completed task. Keep pushing!'
};

export const emptyStateIcons = {
  'Open': '🚀',
  'In Progress': '⚙️',
  'Review': '🔍',
  'Completed': '🏆'
};
