/**
 * Templates module - Public exports
 *
 * This module exports both:
 * 1. Runtime template defaults for deployment (from templateDefinitions.js)
 * 2. Rich template content for the discovery flow (from definitions/)
 */

// Runtime defaults for deployment
export {
  TEMPLATES,
  TEMPLATE_LIST,
  TEMPLATE_IDS,
  POWER_BUNDLES,
  getTemplateById,
  getTemplateDefaults,
} from './templateDefinitions';

// Rich template content with philosophy, discovery questions, etc.
export {
  TEMPLATE_LIST as RICH_TEMPLATE_LIST,
  TEMPLATES_BY_ID,
  getTemplateById as getRichTemplateById,
  getTemplateOptions,
} from './definitions';

// Variation matcher utilities
export {
  findBestVariation,
  findAllMatchingVariations,
  applyVariationSettings,
  getCurrentGrowthStage,
  getRelevantPitfalls,
  getContextualHelp,
} from './variations/variationMatcher';
