/**
 * Variation Matcher
 *
 * Matches discovery question answers to the best template variation.
 * Returns the variation settings and reasoning for the user's context.
 */

/**
 * Check if a single condition matches
 * @param {*} condition - The condition value (string, array, or object)
 * @param {*} answer - The user's answer
 * @returns {boolean}
 */
function matchCondition(condition, answer) {
  if (condition === undefined || condition === null) {
    return true; // No condition means always match
  }

  // Array condition: answer must match any value in array
  if (Array.isArray(condition)) {
    return condition.includes(answer);
  }

  // Object condition: special operators (gte, lte, etc.)
  if (typeof condition === 'object') {
    if ('gte' in condition && answer < condition.gte) return false;
    if ('lte' in condition && answer > condition.lte) return false;
    if ('gt' in condition && answer <= condition.gt) return false;
    if ('lt' in condition && answer >= condition.lt) return false;
    if ('eq' in condition && answer !== condition.eq) return false;
    if ('ne' in condition && answer === condition.ne) return false;
    return true;
  }

  // Simple equality
  return condition === answer;
}

/**
 * Calculate how well a variation matches the user's answers
 * @param {Object} variation - The variation to check
 * @param {Object} answers - The user's discovery question answers
 * @returns {Object} { matches: boolean, score: number }
 */
function calculateVariationMatch(variation, answers) {
  const conditions = variation.matchConditions;

  // Default variation always matches with low score
  if (!conditions) {
    return { matches: true, score: 0 };
  }

  let matchCount = 0;
  let totalConditions = Object.keys(conditions).length;

  for (const [questionId, condition] of Object.entries(conditions)) {
    const answer = answers[questionId];

    if (answer === undefined) {
      // Question not answered yet - partial match
      continue;
    }

    if (matchCondition(condition, answer)) {
      matchCount++;
    } else {
      // A single mismatch means this variation doesn't match
      return { matches: false, score: 0 };
    }
  }

  // Score is the number of matching conditions
  // Higher score = more specific match
  return { matches: true, score: matchCount };
}

/**
 * Find the best matching variation for the user's answers
 * @param {Object} template - The full template object
 * @param {Object} answers - The user's discovery question answers
 * @returns {Object} { variationKey, variation, score, isDefault }
 */
export function findBestVariation(template, answers) {
  if (!template.variations) {
    return {
      variationKey: 'default',
      variation: null,
      score: 0,
      isDefault: true,
    };
  }

  let bestMatch = {
    variationKey: 'default',
    variation: template.variations.default,
    score: 0,
    isDefault: true,
  };

  for (const [key, variation] of Object.entries(template.variations)) {
    if (key === 'default') continue;

    const { matches, score } = calculateVariationMatch(variation, answers);

    if (matches && score > bestMatch.score) {
      bestMatch = {
        variationKey: key,
        variation,
        score,
        isDefault: false,
      };
    }
  }

  return bestMatch;
}

/**
 * Get all variations that match the user's answers
 * @param {Object} template - The full template object
 * @param {Object} answers - The user's discovery question answers
 * @returns {Array} Array of matching variations sorted by score
 */
export function findAllMatchingVariations(template, answers) {
  if (!template.variations) {
    return [];
  }

  const matches = [];

  for (const [key, variation] of Object.entries(template.variations)) {
    const { matches: isMatch, score } = calculateVariationMatch(variation, answers);

    if (isMatch) {
      matches.push({
        variationKey: key,
        variation,
        score,
        isDefault: key === 'default',
      });
    }
  }

  // Sort by score descending (best match first)
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Apply variation settings to the template defaults
 * @param {Object} template - The full template object
 * @param {string} variationKey - The key of the variation to apply
 * @returns {Object} The merged defaults with variation settings
 */
export function applyVariationSettings(template, variationKey) {
  const variation = template.variations?.[variationKey];

  if (!variation) {
    return template.defaults;
  }

  // Deep merge variation settings into defaults
  return {
    ...template.defaults,
    voting: {
      ...template.defaults.voting,
      ...(variation.settings?.democracyWeight !== undefined && {
        democracyWeight: variation.settings.democracyWeight,
      }),
      ...(variation.settings?.participationWeight !== undefined && {
        participationWeight: variation.settings.participationWeight,
      }),
    },
    // Apply quorum to voting classes if present
    ...(variation.settings?.quorum !== undefined && {
      votingClasses: template.defaults.votingClasses?.map((vc) => ({
        ...vc,
        quorum: variation.settings.quorum,
      })),
    }),
  };
}

/**
 * Get the current growth stage based on time since founding
 * @param {Object} template - The full template object
 * @param {Date|string} foundingDate - When the organization was founded
 * @returns {Object|null} The current growth stage or null
 */
export function getCurrentGrowthStage(template, foundingDate) {
  if (!template.growthPath?.stages) {
    return null;
  }

  const now = new Date();
  const founded = new Date(foundingDate);
  const monthsSinceFounding = Math.floor(
    (now - founded) / (1000 * 60 * 60 * 24 * 30)
  );

  // Find the appropriate stage
  for (let i = template.growthPath.stages.length - 1; i >= 0; i--) {
    const stage = template.growthPath.stages[i];
    const timeframe = stage.timeframe;

    // Parse timeframe like "0-6 months" or "18+ months"
    const match = timeframe.match(/(\d+)[\+-]?/);
    if (match) {
      const stageStart = parseInt(match[1]);
      if (monthsSinceFounding >= stageStart) {
        return {
          ...stage,
          index: i,
          isLast: i === template.growthPath.stages.length - 1,
          monthsSinceFounding,
        };
      }
    }
  }

  // Default to first stage
  return {
    ...template.growthPath.stages[0],
    index: 0,
    isLast: template.growthPath.stages.length === 1,
    monthsSinceFounding,
  };
}

/**
 * Get relevant pitfalls based on current settings
 * @param {Object} template - The full template object
 * @param {Object} settings - Current governance settings
 * @returns {Array} Array of relevant pitfalls
 */
export function getRelevantPitfalls(template, settings) {
  if (!template.pitfalls) {
    return [];
  }

  // For now, return all pitfalls
  // In the future, this could be more intelligent based on settings
  return template.pitfalls.map((pitfall) => ({
    ...pitfall,
    // Add relevance info
    isHighPriority: pitfall.severity === 'high',
  }));
}

/**
 * Get contextual help that should be shown based on settings
 * @param {Object} template - The full template object
 * @param {Object} settings - Current governance settings
 * @returns {Array} Array of contextual help items to show
 */
export function getContextualHelp(template, settings) {
  const help = [];
  const contextualHelp = template.education?.contextualHelp;

  if (!contextualHelp) {
    return help;
  }

  for (const [key, helpItem] of Object.entries(contextualHelp)) {
    const trigger = helpItem.trigger;

    // Check if trigger conditions are met
    let shouldShow = true;
    for (const [field, condition] of Object.entries(trigger)) {
      const value = settings[field] ?? settings.voting?.[field];

      if (value !== undefined && !matchCondition(condition, value)) {
        shouldShow = false;
        break;
      }
    }

    if (shouldShow) {
      help.push({
        key,
        ...helpItem,
      });
    }
  }

  return help;
}

export default {
  findBestVariation,
  findAllMatchingVariations,
  applyVariationSettings,
  getCurrentGrowthStage,
  getRelevantPitfalls,
  getContextualHelp,
};
