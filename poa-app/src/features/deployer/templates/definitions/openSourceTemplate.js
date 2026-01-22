/**
 * Open Source Project Template
 *
 * "Those who write the code should guide the project. But meritocracy must be
 * earned, not assumed, and paths must remain open for newcomers."
 */

export const openSourceTemplate = {
  id: 'open-source',
  name: 'Open Source Project',
  tagline: 'Contributor-driven governance for software that belongs to everyone',
  icon: '💻',
  color: 'purple',

  // What you can DO with this - practical capabilities
  capabilities: {
    headline: 'Coordinate your open source project with transparent, contributor-driven tools',
    features: [
      {
        name: 'Make Decisions Together',
        description: 'Vote on RFCs, roadmap priorities, and breaking changes. Contributors who do the work have more say, while newcomers still have voice.',
        icon: '🗳️',
      },
      {
        name: 'Track Contributions',
        description: 'Every PR, review, issue triage, and documentation update earns participation tokens. Contributions are visible and recognized.',
        icon: '📊',
      },
      {
        name: 'Manage Issues & Tasks',
        description: 'Create bounties, assign issues, and track who\'s working on what. Contributors claim work and get credit when it ships.',
        icon: '✅',
      },
      {
        name: 'Promote Maintainers',
        description: 'Clear path from first PR to maintainer. Vouching and governance track who\'s earned more responsibility.',
        icon: '⭐',
      },
      {
        name: 'Distribute Rewards',
        description: 'If your project has sponsorships or grants, distribute funds based on actual contributions. Transparent, automatic, fair.',
        icon: '💰',
      },
    ],
  },

  // Philosophy - The WHY behind this model
  philosophy: {
    essence: `Open source projects succeed when those who contribute most help guide
the project's direction. But healthy open source isn't a closed club—it's a ladder
that anyone can climb through contribution. The best projects balance rewarding
active contributors with keeping the door open for newcomers.

**Hybrid voting** makes this concrete: the 30/70 split means 30% of voting power
comes from simply being a contributor (democracy), while 70% comes from your
participation tokens (meritocracy). Active maintainers guide the project, but
newcomers always have a voice and path to influence.`,

    keyPrinciple: `Meritocracy is earned through contribution, but the path to
contribution must stay open. Weight decisions toward active contributors while
ensuring newcomers have voice and visibility.`,

    historicalContext: `Projects like Linux, Apache, and Python demonstrate that
successful open source governance evolves over time. Most successful projects start
more democratic to attract contributors, then shift toward meritocracy as the
contributor base matures. The key is that influence is always earnable through
contribution—never inherited or purchased.`,

    whatHybridVotingMeans: `When your project votes with a 30/70 hybrid system:
- 30% of voting power comes from being a contributor (everyone equal)
- 70% comes from participation tokens (earned through merged PRs, reviews, docs, etc.)

**Example:** Voting on a breaking API change in a 20-contributor project:
- A core maintainer with 500 participation tokens might have ~8% of total voting power
- A new contributor with 10 tokens might have ~2%
- But that new contributor's voice still matters, and their influence grows with every contribution`,
  },

  // Discovery Questions - Adapt settings to context
  discoveryQuestions: [
    {
      id: 'project_maturity',
      question: 'What stage is your project in?',
      why: `Early projects need to attract contributors and benefit from more
democratic governance. Established projects have earned the trust for stronger
meritocracy.`,
      options: [
        {
          value: 'new',
          label: 'New - just getting started',
          impact: 'More democratic to attract initial contributors',
          emoji: '🌱'
        },
        {
          value: 'growing',
          label: 'Growing - have some contributors, building momentum',
          impact: 'Balance democracy with rewarding active contributors',
          emoji: '🌿'
        },
        {
          value: 'established',
          label: 'Established - stable contributor base, mature codebase',
          impact: 'Can lean more heavily on contribution-based governance',
          emoji: '🌳'
        },
      ],
    },
    {
      id: 'contributor_count',
      question: 'How many active contributors do you have?',
      why: `Small teams can make decisions more informally. Larger contributor
bases need clearer structures to coordinate effectively.`,
      options: [
        {
          value: 'small',
          label: '1-5 contributors',
          impact: 'Can use informal consensus for most decisions',
          emoji: '👤'
        },
        {
          value: 'medium',
          label: '6-20 contributors',
          impact: 'Need some structure but can stay relatively flat',
          emoji: '👥'
        },
        {
          value: 'large',
          label: '20+ contributors',
          impact: 'Need clear governance structures and delegation',
          emoji: '👥👥'
        },
      ],
    },
    {
      id: 'contribution_types',
      question: 'What types of contributions does your project value?',
      why: `Some projects are code-focused. Others thrive on diverse contributions
like documentation, community building, design, and testing. This affects how
you measure participation.`,
      options: [
        {
          value: 'code_only',
          label: 'Primarily code contributions',
          impact: 'Simpler contribution tracking, clearer metrics',
          emoji: '⌨️'
        },
        {
          value: 'mixed',
          label: 'Code, docs, community, design, etc.',
          impact: 'Need broader definition of contribution, more complex tracking',
          emoji: '🎨'
        },
      ],
    },
  ],

  // Variations - Different configs for different contexts
  variations: {
    default: {
      name: 'Standard Open Source',
      settings: {
        democracyWeight: 30,
        participationWeight: 70,
        quorum: 25,
      },
      reasoning: `The 30/70 split rewards active contributors while ensuring
all contributors have meaningful voice. Low quorum acknowledges that not everyone
can participate in every decision.`,
    },
    'early-stage': {
      name: 'Early Stage Project',
      matchConditions: { project_maturity: 'new' },
      settings: {
        democracyWeight: 50,
        participationWeight: 50,
        quorum: 40,
      },
      reasoning: `New projects need to attract contributors. Higher democracy
weight gives newcomers meaningful voice from day one, encouraging them to
stay and contribute more.`,
    },
    'growing-project': {
      name: 'Growing Project',
      matchConditions: { project_maturity: 'growing', contributor_count: 'medium' },
      settings: {
        democracyWeight: 35,
        participationWeight: 65,
        quorum: 30,
      },
      reasoning: `As the project grows, shift toward rewarding active contributors
while keeping the door open. This stage is about building a strong contributor
culture.`,
    },
    'large-established': {
      name: 'Large Established Project',
      matchConditions: { project_maturity: 'established', contributor_count: 'large' },
      settings: {
        democracyWeight: 20,
        participationWeight: 80,
        quorum: 20,
      },
      reasoning: `Established projects with many contributors need strong
meritocracy to coordinate effectively. Low quorum and high participation weight
empower those actively building the project.`,
    },
    'community-focused': {
      name: 'Community-Focused Project',
      matchConditions: { contribution_types: 'mixed' },
      settings: {
        democracyWeight: 40,
        participationWeight: 60,
        quorum: 30,
      },
      reasoning: `Projects that value diverse contributions benefit from higher
democracy weight, ensuring non-code contributors have meaningful voice even
if contribution tracking is harder.`,
    },
  },

  // Growth Path - How governance evolves
  growthPath: {
    stages: [
      {
        name: 'Bootstrap',
        timeframe: '0-6 months',
        description: 'Attract your first contributors',
        recommendedSettings: {
          democracyWeight: 50,
          participationWeight: 50,
        },
        milestones: [
          'First external contribution merged',
          '5+ contributors have made at least one contribution',
          'Basic governance documented (CONTRIBUTING.md)',
        ],
        nextStageSignals: [
          'Regular contributions from multiple people',
          'Contributors returning to make additional contributions',
          'Community starting to form',
        ],
      },
      {
        name: 'Building',
        timeframe: '6-18 months',
        description: 'Develop contributor culture',
        recommendedSettings: {
          democracyWeight: 35,
          participationWeight: 65,
        },
        milestones: [
          'Core contributors identified and recognized',
          'Governance decisions made collaboratively',
          'Clear path from first contribution to maintainer',
        ],
        nextStageSignals: [
          'Stable core team with shared values',
          'Contributors self-organizing around issues',
          'Project survives absence of original creator',
        ],
      },
      {
        name: 'Scaling',
        timeframe: '18+ months',
        description: 'Sustainable open source governance',
        recommendedSettings: {
          democracyWeight: 25,
          participationWeight: 75,
        },
        milestones: [
          'Multiple maintainers across areas of the project',
          'Clear escalation paths for decisions',
          'Contributor to maintainer pipeline working',
        ],
        nextStageSignals: [
          'Consider working groups for different project areas',
          'May need more formal structures (foundation, etc.)',
        ],
      },
    ],
    evolutionPrinciples: [
      {
        principle: 'Start democratic, earn meritocracy',
        explanation: `New projects should lean democratic to attract contributors.
As contributor culture matures, shift toward meritocracy.`,
      },
      {
        principle: 'Keep the ladder open',
        explanation: `No matter how much you weight participation, ensure there's
always a clear path from first contribution to full influence.`,
      },
      {
        principle: 'Document everything',
        explanation: `Open source governance only works when it's visible and
documented. Contributors need to understand how decisions are made.`,
      },
    ],
  },

  // Pitfalls - What can go wrong
  pitfalls: [
    {
      name: 'Maintainer Burnout',
      severity: 'high',
      description: `Core maintainers take on too much responsibility, leading to
exhaustion and project stagnation or abandonment.`,
      symptoms: [
        'Issues and PRs pile up without response',
        'Same few people doing all the reviews',
        'Maintainers expressing frustration or disappearing',
        'Project releases slow down or stop',
      ],
      prevention: `Actively cultivate new maintainers. Make the path from
contributor to maintainer clear and achievable. Share responsibility explicitly.`,
      recovery: `Acknowledge burnout publicly. Ask for help. Consider "office
hours" or limiting scope temporarily. Sometimes taking a break and coming back
is the healthiest option.`,
    },
    {
      name: 'Closed Core',
      severity: 'high',
      description: `The project appears open but power concentrates in a closed
group that resists new voices.`,
      symptoms: [
        'Long-time contributors can\'t become maintainers',
        'Decisions made in private channels',
        'PRs from non-core contributors languish',
        'New ideas dismissed without real consideration',
      ],
      prevention: `Make governance visible. Document how maintainers are added.
Create explicit contributor ladder with clear criteria.`,
      recovery: `Acknowledge the problem. Create explicit process for new
maintainer addition. Consider term limits or rotation for core team.`,
    },
    {
      name: 'Contribution Counting',
      severity: 'medium',
      description: `Not all contributions are equal. Treating lines of code as
the primary metric misses important contributions.`,
      symptoms: [
        'Documentation contributors undervalued',
        'Community builders not recognized',
        'Drive-by contributors get same weight as maintainers',
        'Quality vs. quantity not distinguished',
      ],
      prevention: `Define contribution broadly. Weight sustained contribution
over one-time contributions. Recognize different types of value.`,
      recovery: `Expand your definition of contribution. Consider qualitative
recognition alongside quantitative metrics.`,
    },
    {
      name: 'Bus Factor of One',
      severity: 'high',
      description: `The project depends entirely on one person. If they leave,
the project dies.`,
      symptoms: [
        'One person makes all significant decisions',
        'Others wait for approval rather than acting',
        'Knowledge not documented or shared',
        'Project identity tied to one person',
      ],
      prevention: `Actively share knowledge and responsibility from day one.
Make decisions collectively even when one person could decide faster.`,
      recovery: `The key person needs to actively step back and let others
lead. This requires trust and patience as others grow into responsibility.`,
    },
  ],

  // Education - Concepts and tooltips
  education: {
    concepts: {
      'hybrid-voting': {
        title: 'Hybrid Voting for Open Source',
        short: 'Balancing equal contributor voice with earned influence from contributions',
        detailed: `Hybrid voting in open source combines democracy (every contributor
has a vote) with meritocracy (more votes for more contributions). The 30/70 default
split means your base vote plus your earned contributions together determine your
influence. This rewards maintainers while keeping the door open for newcomers.`,
        whenToUse: 'Use 30/70 for established projects. More democratic (50/50) for new projects attracting contributors.',
      },
      'participation-tokens': {
        title: 'Contribution Tracking',
        short: 'Tokens that represent your contributions to the project',
        detailed: `Participation tokens are earned through contributions: merged PRs,
code reviews, documentation, issue triage, community support. They're not cryptocurrency
or money—they're a transparent record of who's doing the work. More tokens = more
influence when the project votes on decisions.`,
        whenToUse: 'Define what counts as contribution for your project. Code-only? Or docs, community, design too?',
      },
      'meritocracy': {
        title: 'Contribution-Based Governance',
        short: 'Those who contribute more have more influence',
        detailed: `In open source, "meritocracy" means influence earned through
contribution. This isn't about credentials or status—it's about showing up
and doing the work. The key is that the path to influence is always open
to anyone willing to contribute.`,
        whenToUse: 'Higher participation weight (70%+) for established projects with strong contributor culture.',
      },
      'contributor-ladder': {
        title: 'Contributor Ladder',
        short: 'Clear path from first contribution to maintainer',
        detailed: `A healthy open source project has a clear progression:
Newcomer → Contributor → Regular Contributor → Maintainer. Each step should
have clear criteria and be achievable through contribution.`,
        whenToUse: 'Document your contributor ladder early. Make criteria explicit.',
      },
      'maintainer': {
        title: 'Maintainer',
        short: 'Someone with commit access and decision-making authority',
        detailed: `Maintainers are trusted contributors who can merge PRs and
make decisions about project direction. The title carries responsibility:
maintainers shape the project for everyone.`,
        whenToUse: 'Add maintainers intentionally. Too few leads to burnout. Too many leads to coordination problems.',
      },
    },
    tooltips: {
      democracyWeight: 'The percentage of voting power from equal contributor rights',
      participationWeight: 'The percentage of voting power earned through active contribution',
      quorum: 'The minimum participation needed for a decision to be valid',
    },
    contextualHelp: {
      'high-meritocracy-warning': {
        trigger: { participationWeight: { gte: 85 } },
        title: 'Is the Door Still Open?',
        content: `Very high participation weight (85%+) strongly rewards active
contributors. This works for mature projects but can discourage newcomers.
Make sure your contributor ladder is clear and achievable.`,
      },
      'new-project-democracy': {
        trigger: { democracyWeight: { gte: 60 }, project_maturity: 'new' },
        title: 'Good Choice for Early Stage',
        content: `Higher democracy weight helps attract contributors to new
projects. As your contributor base matures, you can shift toward more
contribution-based governance.`,
      },
    },
  },

  // Default configuration
  defaults: {
    roles: [
      {
        name: 'Maintainer',
        hierarchy: { adminRoleIndex: null },
        vouching: { enabled: false, quorum: 0, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 20 },
      },
      {
        name: 'Contributor',
        hierarchy: { adminRoleIndex: 0 },
        vouching: { enabled: false, quorum: 0, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 1000 },
      },
    ],
    permissions: {
      taskManagers: [0],
      projectCreators: [0],
      taskCreators: [0, 1],
      taskReviewers: [0],
      taskClaimers: [0, 1],
      nftCreators: [0],
      quickJoinRoles: [1],
      memberManagers: [0],
      ddVoters: [0, 1],
    },
    voting: {
      mode: 'HYBRID',
      democracyWeight: 30,
      participationWeight: 70,
    },
    features: {
      educationHubEnabled: false,
      electionHubEnabled: false,
    },
  },

  // UI guidance
  ui: {
    guidanceText: {
      default: 'Define your project roles. Most open source projects have Maintainers (with merge access) and Contributors.',
      small: 'Small projects can keep it simple. Everyone might be a maintainer at the start.',
      large: 'Consider working groups or area-specific maintainers for large projects.',
      governance: 'Set how much weight to give active contributors vs. equal voice. We recommend starting more democratic for new projects.',
      identity: 'Your project name and description will help contributors find and understand your project.',
    },
  },
};

export default openSourceTemplate;
