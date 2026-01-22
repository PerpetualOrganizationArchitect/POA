/**
 * Creative Collective Template
 *
 * "Creative work thrives when artists have autonomy and equal voice.
 * The collective amplifies individual vision, not constrains it."
 */

export const creativeCollectiveTemplate = {
  id: 'creative-collective',
  name: 'Creative Collective',
  tagline: 'Where artists govern as equals and creativity flows freely',
  icon: '🎨',
  color: 'pink',

  // What you can DO with this - practical capabilities
  capabilities: {
    headline: 'Run your creative collective with tools that serve the art, not bureaucracy',
    features: [
      {
        name: 'Vote on Collective Decisions',
        description: 'Studio space, equipment purchases, exhibition schedules, shared expenses—decide together as equals. Your art stays yours.',
        icon: '🗳️',
      },
      {
        name: 'Track Contributions to the Collective',
        description: 'Who organized the show? Who maintained the website? Participation tokens recognize engagement with collective matters (not creative output).',
        icon: '✨',
      },
      {
        name: 'Manage Shared Projects',
        description: 'Collaborative exhibitions, group commissions, collective events. Assign tasks, track progress, share credit.',
        icon: '🎭',
      },
      {
        name: 'Share Revenue Fairly',
        description: 'When collective work generates income, distribute it based on actual contribution. Transparent, automatic, no awkward conversations.',
        icon: '💰',
      },
      {
        name: 'Vouch for New Artists',
        description: 'Existing members sponsor new artists. Ensures community fit while keeping doors open to fresh voices.',
        icon: '👥',
      },
    ],
  },

  // Philosophy - The WHY behind this model
  philosophy: {
    essence: `Creative collectives exist because art flourishes in community—sharing
resources, skills, and support while preserving individual creative vision. The
collective's role is to amplify, not constrain. Good governance creates space for
creativity; bad governance becomes another obstacle to overcome.

**The 90/10 hybrid setup** reflects this: 90% democracy means every artist has nearly
equal say in collective decisions. The small 10% participation weight recognizes
those who engage with governance work—organizing shows, managing finances, maintaining
the space—without undermining fundamental equality.`,

    keyPrinciple: `Distinguish between collective decisions (space, money, shared
projects) and individual creative choices (your art, your process). Democracy
governs the collective; autonomy governs the creative work.`,

    historicalContext: `From the Bauhaus to Factory Records, creative collectives
have shaped art history. The most successful ones balance shared resources with
individual vision. Black Mountain College lasted only 24 years but produced
Robert Rauschenberg, John Cage, and Buckminster Fuller—by giving artists both
community and creative freedom.`,

    whatHybridVotingMeans: `With a 90/10 hybrid in your creative collective:
- 90% of voting power comes from being an artist member (everyone nearly equal)
- 10% comes from engagement with collective governance (organizing, admin, etc.)

**Example:** Voting on a $5K equipment purchase in an 8-artist collective:
- Most artists have roughly 12% voting power each
- An artist who also manages finances might have 13-14%
- This keeps decisions democratic while acknowledging that running a collective takes work`,
  },

  // Discovery Questions - Adapt settings to context
  discoveryQuestions: [
    {
      id: 'creative_process',
      question: 'How do you make creative decisions together?',
      why: `Some collectives collaborate on every piece. Others share resources
but keep creative work individual. This fundamentally shapes your governance.`,
      options: [
        {
          value: 'consensus',
          label: 'Consensus on everything - we create together',
          impact: 'Higher quorum, more discussion, slower but unified',
          emoji: '🤝'
        },
        {
          value: 'individual',
          label: 'Individual ownership - we share resources, not creative control',
          impact: 'Lower quorum for collective matters, full autonomy for creative work',
          emoji: '🎭'
        },
        {
          value: 'mixed',
          label: 'Mixed - some collaborative projects, some individual',
          impact: 'Flexible governance with clear boundaries',
          emoji: '🎪'
        },
      ],
    },
    {
      id: 'conflict_style',
      question: 'How do you prefer to resolve creative disagreements?',
      why: `Creative visions can clash. Your conflict resolution style should
match your collective's culture, not fight against it.`,
      options: [
        {
          value: 'discussion',
          label: 'Extended discussion until we find common ground',
          impact: 'Higher quorum, longer timelines, consensus-focused',
          emoji: '💭'
        },
        {
          value: 'vote',
          label: 'Vote and move on - we respect the majority decision',
          impact: 'Lower quorum, faster decisions, some may disagree',
          emoji: '🗳️'
        },
        {
          value: 'defer',
          label: 'Defer to the creator - whoever leads the project decides',
          impact: 'Project-level autonomy, collective governance minimal',
          emoji: '🎬'
        },
      ],
    },
    {
      id: 'collective_size',
      question: 'How many artists are in your collective?',
      why: `Small collectives can govern informally. Larger ones need more
structure to prevent chaos or invisible hierarchies.`,
      options: [
        {
          value: 'small',
          label: '2-5 artists',
          impact: 'Can discuss everything, informal governance works',
          emoji: '🎨'
        },
        {
          value: 'medium',
          label: '6-15 artists',
          impact: 'Need some structure, but can stay relatively flat',
          emoji: '🎨🎨'
        },
        {
          value: 'large',
          label: '15+ artists',
          impact: 'Need clear processes to prevent informal hierarchies',
          emoji: '🎨🎨🎨'
        },
      ],
    },
  ],

  // Variations - Different configs for different contexts
  variations: {
    default: {
      name: 'Balanced Collective',
      settings: {
        democracyWeight: 90,
        participationWeight: 10,
        quorum: 50,
      },
      reasoning: `High democracy weight ensures equal creative voice. The small
participation weight recognizes those who engage with collective governance
while preserving fundamental equality.`,
    },
    'consensus-focused': {
      name: 'Consensus Collective',
      matchConditions: { creative_process: 'consensus', conflict_style: 'discussion' },
      settings: {
        democracyWeight: 100,
        participationWeight: 0,
        quorum: 80,
      },
      reasoning: `Pure democracy with high quorum ensures broad agreement before
action. This works for collectives where unity is more important than speed.`,
    },
    'autonomous-artists': {
      name: 'Autonomous Artists',
      matchConditions: { creative_process: 'individual' },
      settings: {
        democracyWeight: 95,
        participationWeight: 5,
        quorum: 40,
      },
      reasoning: `Lower quorum for collective matters (space, money, events) while
preserving democracy. Individual creative work isn't governed by the collective.`,
    },
    'project-based': {
      name: 'Project-Based Collective',
      matchConditions: { conflict_style: 'defer', creative_process: 'mixed' },
      settings: {
        democracyWeight: 85,
        participationWeight: 15,
        quorum: 35,
      },
      reasoning: `Projects have creators who lead. Collective governance handles
shared resources. Participation weight rewards those who engage with collective
matters.`,
    },
    'large-collective': {
      name: 'Large Collective',
      matchConditions: { collective_size: 'large' },
      settings: {
        democracyWeight: 85,
        participationWeight: 15,
        quorum: 35,
      },
      reasoning: `Larger collectives need lower quorum to function and slightly
more participation weight to encourage engagement in governance.`,
    },
  },

  // Growth Path - How governance evolves
  growthPath: {
    stages: [
      {
        name: 'Forming',
        timeframe: '0-6 months',
        description: 'Finding your collective identity',
        recommendedSettings: {
          democracyWeight: 90,
          participationWeight: 10,
        },
        milestones: [
          'First collective decision made (space, name, mission)',
          'Agreed on what\'s individual vs. collective',
          'Handled first creative disagreement',
        ],
        nextStageSignals: [
          'Clear sense of what the collective is for',
          'Comfortable discussing money and resources',
          'Individual styles coexisting peacefully',
        ],
      },
      {
        name: 'Establishing',
        timeframe: '6-18 months',
        description: 'Building sustainable practices',
        recommendedSettings: {
          democracyWeight: 90,
          participationWeight: 10,
        },
        milestones: [
          'Financial sustainability (or plan for it)',
          'New member successfully integrated',
          'Public-facing work or exhibition',
        ],
        nextStageSignals: [
          'Governance feels natural, not burdensome',
          'Collective survives member transitions',
          'Clear reputation in creative community',
        ],
      },
      {
        name: 'Flourishing',
        timeframe: '18+ months',
        description: 'The collective as creative infrastructure',
        recommendedSettings: {
          democracyWeight: 90,
          participationWeight: 10,
        },
        milestones: [
          'Multiple generations of members',
          'Collective identity distinct from any individual',
          'Supporting member projects and careers',
        ],
        nextStageSignals: [
          'May consider formal legal structure',
          'Could mentor other collectives',
        ],
      },
    ],
    evolutionPrinciples: [
      {
        principle: 'Governance serves creativity',
        explanation: `If governance is consuming creative energy, something is
wrong. The goal is to minimize governance friction while ensuring fairness.`,
      },
      {
        principle: 'Protect individual vision',
        explanation: `The collective amplifies individual work. It should never
force creative compromise. Distinguish clearly between collective decisions and
individual creative choices.`,
      },
      {
        principle: 'Make the invisible visible',
        explanation: `Creative collectives often have informal hierarchies (who
gets the best studio space, whose opinion carries most weight). Good governance
makes these dynamics visible and addressable.`,
      },
    ],
  },

  // Pitfalls - What can go wrong
  pitfalls: [
    {
      name: 'Consensus Paralysis',
      severity: 'high',
      description: `Every decision requires full agreement, leading to endless
discussion and nothing getting done.`,
      symptoms: [
        'Simple decisions take weeks',
        'Meetings run long with no resolution',
        'Same topics discussed repeatedly',
        'Artists stop engaging with governance',
      ],
      prevention: `Clearly define what needs consensus vs. what can be decided
by majority or delegated entirely. Reserve consensus for truly important matters.`,
      recovery: `Audit your decision-making. What actually needs full agreement?
Consider tiered governance: consensus for mission/values, majority for operations,
delegation for routine matters.`,
    },
    {
      name: 'Creative Ego Clash',
      severity: 'high',
      description: `Strong creative visions collide, turning the collective into
a battleground rather than a support system.`,
      symptoms: [
        'Personal conflicts dressed up as creative disagreements',
        'Members undermining each other\'s work',
        'Cliques forming within the collective',
        'Artists leaving over conflicts',
      ],
      prevention: `Separate collective governance from creative control. Each
artist's work is their own. The collective handles shared resources and mutual
support—not creative direction.`,
      recovery: `External facilitation often helps. Recommit to the principle
that the collective supports individual vision. Sometimes a clean break is
healthiest for everyone.`,
    },
    {
      name: 'Invisible Hierarchy',
      severity: 'medium',
      description: `The collective claims to be flat, but informal power
structures mean some voices matter more than others.`,
      symptoms: [
        'Some members consistently get their way',
        'Certain voices are louder without formal authority',
        'Decisions made in side conversations, not meetings',
        'New members struggle to have influence',
      ],
      prevention: `Acknowledge that influence isn't equal—it's about tenure,
personality, and social dynamics. Create explicit processes that give quieter
voices space.`,
      recovery: `Name the dynamic openly. Rotate leadership of meetings. Create
anonymous input channels. Consider explicit roles with term limits.`,
    },
    {
      name: 'Money Silence',
      severity: 'medium',
      description: `The collective avoids talking about money, leading to
resentment and unsustainable practices.`,
      symptoms: [
        'Financial decisions made without full transparency',
        'Some members subsidizing others unknowingly',
        'No clear policy on shared expenses vs. individual costs',
        'Resentment building around contributions',
      ],
      prevention: `Talk about money early and often. Create clear, written
policies about shared costs, income from collective work, and individual
contributions.`,
      recovery: `Full financial transparency—lay it all out. Acknowledge past
inequities. Create sustainable policies going forward.`,
    },
  ],

  // Education - Concepts and tooltips
  education: {
    concepts: {
      'hybrid-voting': {
        title: 'Democratic Voting for Collectives',
        short: 'Nearly equal votes, with small recognition for governance engagement',
        detailed: `The 90/10 hybrid means artists are almost entirely equal in
collective decisions. The small 10% participation weight just recognizes those
who do the unglamorous work of running the collective—finances, scheduling,
space management. Your art is yours; collective decisions are democratic.`,
        whenToUse: 'Keep democracy high (90%+) for creative collectives. Equality preserves creative freedom.',
      },
      'participation-tokens': {
        title: 'Collective Engagement Tokens',
        short: 'Recognition for contributing to collective operations',
        detailed: `Participation tokens in a creative collective track engagement
with collective matters—NOT creative output. Organizing shows, managing finances,
maintaining shared space, attending meetings. This separates "helping run the
collective" from "making art," so creative output stays individual.`,
        whenToUse: 'Use tokens for governance work only. Never tokenize creative output—that stays individual.',
      },
      'creative-autonomy': {
        title: 'Creative Autonomy',
        short: 'Individual control over your own creative work',
        detailed: `In a healthy creative collective, individual artists maintain
full control over their own work. The collective governs shared resources and
mutual support—not creative direction. This boundary is essential for the
collective to serve artists rather than constrain them.`,
        whenToUse: 'Always clearly distinguish collective decisions from individual creative choices.',
      },
      'collective-infrastructure': {
        title: 'Collective Infrastructure',
        short: 'Shared resources and support systems',
        detailed: `What the collective actually provides: space, equipment,
promotion, community, critique, collaboration opportunities. Governance should
focus on managing these shared resources fairly.`,
        whenToUse: 'Be explicit about what the collective offers and what remains individual.',
      },
      'creative-conflict': {
        title: 'Creative Conflict',
        short: 'Disagreements about artistic direction',
        detailed: `Creative conflict is natural and can be generative—different
visions push everyone to grow. The key is distinguishing productive creative
tension from personal conflict dressed up as creative disagreement.`,
        whenToUse: 'When conflicts arise, ask: is this about the work, or about relationships?',
      },
    },
    tooltips: {
      democracyWeight: 'In creative collectives, high democracy (90%+) ensures every artist has equal voice in collective matters',
      participationWeight: 'Low participation weight (5-15%) recognizes engagement without undermining equality',
      quorum: 'How many must participate for collective decisions. Higher for consensus-focused, lower for autonomous collectives',
    },
    contextualHelp: {
      'pure-democracy': {
        trigger: { democracyWeight: { gte: 100 } },
        title: 'Pure Democracy',
        content: `100% democracy weight means every voice counts equally. This is
appropriate for creative collectives where equality is a core value. Just ensure
your quorum is achievable—pure democracy with high quorum can lead to paralysis.`,
      },
      'high-quorum-warning': {
        trigger: { quorum: { gte: 80 } },
        title: 'High Quorum',
        content: `80%+ quorum means almost everyone must participate for decisions
to be valid. This ensures broad agreement but can slow things down. Consider
whether this is sustainable for your collective's size and engagement patterns.`,
      },
    },
  },

  // Default configuration
  defaults: {
    roles: [
      {
        name: 'Artist',
        hierarchy: { adminRoleIndex: null },
        vouching: { enabled: true, quorum: 2, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 50 },
      },
    ],
    permissions: {
      taskManagers: [0],
      projectCreators: [0],
      taskCreators: [0],
      taskReviewers: [0],
      taskClaimers: [0],
      nftCreators: [0],
      quickJoinRoles: [],
      memberManagers: [0],
      ddVoters: [0],
    },
    voting: {
      mode: 'HYBRID',
      democracyWeight: 90,
      participationWeight: 10,
    },
    features: {
      educationHubEnabled: false,
      electionHubEnabled: false,
    },
  },

  // UI guidance
  ui: {
    guidanceText: {
      default: 'Most creative collectives have a single role where all artists are equals. Add roles only if your collective has distinct responsibilities.',
      small: 'With a small collective, everyone can participate in everything. Keep it simple.',
      large: 'Larger collectives may need working groups or committees for specific responsibilities.',
      governance: 'Creative collectives typically favor high democracy. Focus governance on shared resources, not creative direction.',
      identity: 'Your collective\'s name and mission should reflect your shared creative vision while leaving room for individual expression.',
    },
  },
};

export default creativeCollectiveTemplate;
