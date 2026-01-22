/**
 * Template Definitions Index
 *
 * Exports all rich template definitions with their philosophy,
 * discovery questions, variations, growth paths, and pitfalls.
 */

export { workerCoopTemplate } from './workerCoopTemplate';
export { openSourceTemplate } from './openSourceTemplate';
export { creativeCollectiveTemplate } from './creativeCollectiveTemplate';
export { communityDaoTemplate } from './communityDaoTemplate';
export { studentOrgTemplate } from './studentOrgTemplate';
export { customTemplate } from './customTemplate';

// All templates as a list (for iteration)
import { workerCoopTemplate } from './workerCoopTemplate';
import { openSourceTemplate } from './openSourceTemplate';
import { creativeCollectiveTemplate } from './creativeCollectiveTemplate';
import { communityDaoTemplate } from './communityDaoTemplate';
import { studentOrgTemplate } from './studentOrgTemplate';
import { customTemplate } from './customTemplate';

export const TEMPLATE_LIST = [
  workerCoopTemplate,
  openSourceTemplate,
  creativeCollectiveTemplate,
  communityDaoTemplate,
  studentOrgTemplate,
  customTemplate,
];

// Templates by ID (for lookup)
export const TEMPLATES_BY_ID = {
  'worker-coop': workerCoopTemplate,
  'open-source': openSourceTemplate,
  'creative-collective': creativeCollectiveTemplate,
  'community-dao': communityDaoTemplate,
  'student-org': studentOrgTemplate,
  'custom': customTemplate,
};

/**
 * Get a template by ID
 */
export function getTemplateById(templateId) {
  return TEMPLATES_BY_ID[templateId] || null;
}

/**
 * Get all template options for display
 */
export function getTemplateOptions() {
  return TEMPLATE_LIST.map((template) => ({
    id: template.id,
    name: template.name,
    tagline: template.tagline,
    icon: template.icon,
    color: template.color,
    philosophy: template.philosophy,
  }));
}

export default TEMPLATE_LIST;
