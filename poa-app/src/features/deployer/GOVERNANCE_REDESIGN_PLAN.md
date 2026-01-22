# Governance Step Redesign Plan

## Overview
Redesign the Governance step to be more intuitive, remove the simple/advanced mode distinction (all users get full features), and improve the philosophy slider visualization.

## Current State Analysis
- Philosophy slider (0-100) with confusing "member = voting power vs contribution" diagram
- Education Hub / Election Hub toggles (to be removed - out of scope)
- Voting Permissions section only visible in advanced mode
- Copy/text is technical and not aligned with community-owned values

## Goals
1. Remove simple/advanced mode distinction - everyone sees the same intuitive UI
2. Remove Education Hub and Election Hub toggles
3. Redesign philosophy slider to be clearer and more friendly
4. Improve all copy to reflect worker/community-owned infrastructure values
5. Maintain zen, warm, inviting aesthetic

---

## Implementation Steps

### Step 1: Remove Feature Toggles Section
**File:** `GovernanceStep.jsx`

Remove the entire "Optional Features" section (lines 127-170) that contains:
- Education Hub toggle
- Election Hub toggle

This section is moving to the next step and is out of scope.

### Step 2: Remove Simple/Advanced Mode Distinction
**File:** `GovernanceStep.jsx`

- Remove `isSimpleMode` and `isAdvancedMode` checks
- Remove the conditional rendering that hides voting permissions in simple mode
- Remove the "Show advanced voting options" collapse section (lines 278-316)
- Always show voting permissions (who can vote, who can create proposals)

### Step 3: Redesign Philosophy Slider Visualization
**File:** `PhilosophySlider.jsx`

Current problem: The "member icon = voting power circle vs contribution circle" diagram is abstract and confusing.

**New Design Concept:**
Replace with a more intuitive spectrum visualization:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  "How should voting power work?"                                │
│                                                                 │
│  ◀─────────────────────●─────────────────────────────────────▶ │
│                                                                 │
│  CONTRIBUTION-WEIGHTED          ●          EQUAL VOICE          │
│  "Reward active participation"       "Every member counts the same" │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Key changes:
- Remove the confusing equation/diagram visual
- Use clear, human-readable labels on each end
- Add a simple description below the slider showing what the current position means
- Use warm colors (coral gradient) for the slider track
- Show a live preview card explaining the current setting

### Step 4: Simplify Voting Permissions UI
**File:** `GovernanceStep.jsx`

Redesign the voting permissions section to be:
- Always visible (not advanced-only)
- More compact and friendly
- Use pill-style toggles that feel like tags

New layout:
```
┌─────────────────────────────────────────────────────────────────┐
│ Who participates in governance?                                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Can Vote                                                    ││
│ │ [Admin ✓] [Member ✓] [Contributor ✓]                       ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Can Create Proposals                                        ││
│ │ [Admin ✓] [Member ✓] [Contributor ○]                       ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Improve Copy/Text
**All governance-related files**

Current → New copy transformations:

| Current | New |
|---------|-----|
| "How Will You Decide Together?" | "Making Decisions Together" |
| "Governance Philosophy" | "How Voting Works" |
| "Choose how voting power is distributed between direct democracy and contribution-based voting" | "Choose how much weight to give participation vs equal voice" |
| "Community-Led" | "Equal Voice" |
| "Balanced" | "Balanced Approach" |
| "Leader-Led" | "Contribution-Weighted" |
| "More weight to contributors" | "Active participants have more say" |
| "One person, one vote" | "Every voice counts equally" |

Philosophy descriptions should feel warm and accessible:
- **Equal Voice (75-100):** "Every member has the same voting power. Perfect for communities that value equal participation."
- **Balanced (25-75):** "A mix of equal voting and rewarding active participation. Great for most organizations."
- **Contribution-Weighted (0-25):** "Members who contribute more have more say. Ideal for meritocratic structures."

### Step 6: Update PhilosophySlider Component
**File:** `PhilosophySlider.jsx`

Complete redesign:

```jsx
// New structure
<VStack spacing={6}>
  {/* Main Question */}
  <Heading size="md">How should voting power work?</Heading>

  {/* Slider with gradient track */}
  <Box w="100%">
    <Slider value={value} onChange={onChange} colorScheme="coral">
      {/* Gradient track from coral to amethyst */}
      <SliderTrack bg="warmGray.100">
        <SliderFilledTrack bg="linear-gradient(...)" />
      </SliderTrack>
      <SliderThumb boxSize={6} />
    </Slider>

    {/* Labels below slider */}
    <HStack justify="space-between" mt={2}>
      <Text fontSize="sm">Contribution-weighted</Text>
      <Text fontSize="sm">Equal voice</Text>
    </HStack>
  </Box>

  {/* Current setting description card */}
  <Box bg="coral.50" p={4} borderRadius="lg">
    <Text fontWeight="600">{currentSettingTitle}</Text>
    <Text fontSize="sm" color="warmGray.600">
      {currentSettingDescription}
    </Text>
  </Box>
</VStack>
```

### Step 7: Clean Up Configuration Summary
**File:** `GovernanceStep.jsx`

Simplify the bottom summary section:
- Remove feature badges (Education/Elections moving out)
- Keep philosophy badge with new naming
- Add quick summary of who can vote/create proposals

---

## File Changes Summary

| File | Changes |
|------|---------|
| `GovernanceStep.jsx` | Remove features section, remove mode conditionals, simplify voting permissions, update copy |
| `PhilosophySlider.jsx` | Complete visual redesign with new slider and description card |
| `philosophyMapper.js` | Update `describeVotingSetup()` with new friendly copy |

## Design Tokens to Use
- Primary accent: `coral.500` / `coral.100` for backgrounds
- Secondary: `amethyst.500` for secondary actions
- Backgrounds: `warmGray.50`, `warmGray.100`
- Text: `warmGray.800` (primary), `warmGray.500` (helper)
- Border radius: `xl` (16px) for cards, `full` for pills/badges

## Success Criteria
- [ ] No simple/advanced mode distinction in Governance step
- [ ] Education Hub and Election Hub toggles removed
- [ ] Philosophy slider is intuitive without needing explanation
- [ ] All copy reflects worker/community-owned values
- [ ] Voting permissions always visible and easy to configure
- [ ] Maintains zen, warm aesthetic consistent with other steps
