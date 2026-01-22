/**
 * Community DAO Template
 *
 * "Community governance works best when close to the people affected.
 * Everyone deserves voice; engagement earns influence."
 */

export const communityDaoTemplate = {
  id: 'community-dao',
  name: 'Community DAO',
  tagline: 'Self-governance for communities that share a common purpose',
  icon: '🏘️',
  color: 'green',

  // What you can DO with this - practical capabilities
  capabilities: {
    headline: 'Govern your community with tools that scale from local to global',
    features: [
      {
        name: 'Vote on Community Decisions',
        description: 'Proposals, budgets, initiatives, rules—the community decides together. Everyone has voice; engaged members have more influence.',
        icon: '🗳️',
      },
      {
        name: 'Coordinate Projects & Initiatives',
        description: 'Create working groups, assign tasks, track progress. Whether it\'s a neighborhood cleanup or a global campaign, everyone knows who\'s doing what.',
        icon: '📋',
      },
      {
        name: 'Track Engagement',
        description: 'Participation tokens recognize those who show up consistently. Attending meetings, voting, volunteering—it all counts and it all matters.',
        icon: '⭐',
      },
      {
        name: 'Elect Stewards',
        description: 'Choose community leaders democratically. Clear terms, accountable to members, transparent elections.',
        icon: '🏆',
      },
      {
        name: 'Manage Treasury',
        description: 'Pool resources, fund initiatives, distribute grants. Every dollar traceable, every decision voted on.',
        icon: '💰',
      },
    ],
  },

  // Philosophy - The WHY behind this model
  philosophy: {
    essence: `Communities exist wherever people share something—a neighborhood, an
interest, a profession, a cause. When communities govern themselves, they make
better decisions because they understand local context and live with the results.
The challenge is making governance accessible enough that everyone can participate,
while still rewarding those who consistently show up.

**Hybrid voting with a 50/50 split** captures this balance perfectly: half your
voting power comes from membership (democracy), half from engagement (participation
tokens). Everyone matters, but those who consistently show up have earned more
influence. It's the digital town hall that actually works.`,

    keyPrinciple: `Balance voice with presence. Everyone deserves the right to
participate, but those who consistently engage with governance have earned
additional influence. The 50/50 split between democracy and participation
reflects this balance.`,

    historicalContext: `From town halls to online forums, communities have always
found ways to make collective decisions. The DAO adds transparency and programmable
rules to ancient practices of community governance. Successful DAOs like GitcoinDAO
and Bankless prove that decentralized communities can coordinate at scale.`,

    whatHybridVotingMeans: `With a 50/50 hybrid in your community DAO:
- 50% of voting power comes from membership (one person, one vote)
- 50% comes from participation tokens (earned through engagement)

**Example:** Voting on a community grant program in a 100-member DAO:
- Every member has at least 0.5% voting power just from membership
- A highly engaged member who attends meetings and contributes might have 2-3%
- A casual member who rarely participates might have 0.6%
- This rewards engagement while ensuring everyone's voice counts`,
  },

  // Discovery Questions - Adapt settings to context
  discoveryQuestions: [
    {
      id: 'community_type',
      question: 'What kind of community are you building?',
      why: `Geographic communities have different dynamics than interest-based or
professional ones. Local communities often need representation; digital communities
can be more direct.`,
      options: [
        {
          value: 'geographic',
          label: 'Geographic - neighbors, local area, city',
          impact: 'May need elected representatives for non-digital members',
          emoji: '📍'
        },
        {
          value: 'interest',
          label: 'Interest-based - hobby, cause, fandom',
          impact: 'Can use direct participation more easily',
          emoji: '🎯'
        },
        {
          value: 'professional',
          label: 'Professional - industry, field, practice',
          impact: 'Balance expertise with democratic participation',
          emoji: '💼'
        },
      ],
    },
    {
      id: 'existing_structure',
      question: 'Does your community have existing governance?',
      why: `New communities can design governance from scratch. Established
communities with existing structures need to transition carefully.`,
      options: [
        {
          value: 'none',
          label: 'None - we\'re starting fresh',
          impact: 'Can design governance optimally from day one',
          emoji: '🌱'
        },
        {
          value: 'informal',
          label: 'Informal - we have leaders but no formal structure',
          impact: 'Need to formalize existing power dynamics',
          emoji: '🤝'
        },
        {
          value: 'formal',
          label: 'Formal - we have bylaws, committees, or similar',
          impact: 'Need to map existing structure to new governance',
          emoji: '📋'
        },
      ],
    },
    {
      id: 'expected_participation',
      question: 'How engaged do you expect members to be?',
      why: `Some communities have highly engaged members. Others have many
casual members. Your governance needs to work with your actual participation
patterns, not ideal ones.`,
      options: [
        {
          value: 'high',
          label: 'High - most members actively participate',
          impact: 'Can use higher quorums, more direct democracy',
          emoji: '🔥'
        },
        {
          value: 'moderate',
          label: 'Moderate - a core group plus occasional participants',
          impact: 'Balance direct participation with delegation',
          emoji: '⚖️'
        },
        {
          value: 'low',
          label: 'Low - many members, few consistently active',
          impact: 'Need low quorums, strong delegates, async voting',
          emoji: '🌙'
        },
      ],
    },
  ],

  // Variations - Different configs for different contexts
  variations: {
    default: {
      name: 'Balanced Community',
      settings: {
        democracyWeight: 50,
        participationWeight: 50,
        quorum: 30,
      },
      reasoning: `The 50/50 split balances equal voice with rewarding engagement.
30% quorum acknowledges that not everyone participates in every decision while
ensuring decisions have legitimacy.`,
    },
    'active-community': {
      name: 'Active Community',
      matchConditions: { expected_participation: 'high' },
      settings: {
        democracyWeight: 70,
        participationWeight: 30,
        quorum: 40,
      },
      reasoning: `High-engagement communities can lean more democratic because
participation is already strong. Higher quorum ensures broad agreement.`,
    },
    'broad-community': {
      name: 'Broad Community',
      matchConditions: { expected_participation: 'low' },
      settings: {
        democracyWeight: 30,
        participationWeight: 70,
        quorum: 20,
      },
      reasoning: `When participation is low, weight governance toward those who
do show up. Low quorum prevents paralysis. This rewards engagement while
keeping the door open for all members.`,
    },
    'neighborhood': {
      name: 'Neighborhood DAO',
      matchConditions: { community_type: 'geographic' },
      settings: {
        democracyWeight: 60,
        participationWeight: 40,
        quorum: 25,
      },
      reasoning: `Geographic communities include people with varying digital
access. Moderate democracy weight ensures non-digital participants still
have voice. Consider elected representatives for those who can't participate
directly.`,
    },
    'professional-community': {
      name: 'Professional Community',
      matchConditions: { community_type: 'professional' },
      settings: {
        democracyWeight: 40,
        participationWeight: 60,
        quorum: 25,
      },
      reasoning: `Professional communities benefit from weighting toward active
contributors who understand the field deeply. But democracy ensures newcomers
and diverse perspectives have voice.`,
    },
    'transitioning': {
      name: 'Transitioning Community',
      matchConditions: { existing_structure: 'formal' },
      settings: {
        democracyWeight: 50,
        participationWeight: 50,
        quorum: 35,
      },
      reasoning: `Transitioning from existing governance needs careful balance.
Start at 50/50 and adjust based on how the community adapts. Higher quorum
ensures legitimacy during the transition.`,
    },
  },

  // Growth Path - How governance evolves
  growthPath: {
    stages: [
      {
        name: 'Launching',
        timeframe: '0-6 months',
        description: 'Establishing democratic culture',
        recommendedSettings: {
          democracyWeight: 50,
          participationWeight: 50,
        },
        milestones: [
          'First community-wide vote completed',
          'Core contributors identified',
          'Governance process documented and shared',
        ],
        nextStageSignals: [
          'Consistent participation from core group',
          'Members understand how to propose and vote',
          'Community identity forming',
        ],
      },
      {
        name: 'Growing',
        timeframe: '6-18 months',
        description: 'Scaling participation',
        recommendedSettings: {
          democracyWeight: 50,
          participationWeight: 50,
        },
        milestones: [
          'Successfully onboarded new members',
          'Handled controversial decision well',
          'Working groups or committees functioning',
        ],
        nextStageSignals: [
          'Governance runs without constant founder attention',
          'New members stepping into leadership',
          'Clear community values and norms',
        ],
      },
      {
        name: 'Thriving',
        timeframe: '18+ months',
        description: 'Sustainable community governance',
        recommendedSettings: {
          democracyWeight: 50,
          participationWeight: 50,
        },
        milestones: [
          'Leadership transitions handled smoothly',
          'Community survives founding team changes',
          'Clear impact and value for members',
        ],
        nextStageSignals: [
          'May need to consider sub-communities or federation',
          'Could formalize legal structure if needed',
        ],
      },
    ],
    evolutionPrinciples: [
      {
        principle: 'Legitimacy through participation',
        explanation: `Decisions gain legitimacy when people participate in making
them. Design governance to maximize meaningful participation, not just votes.`,
      },
      {
        principle: 'Access before influence',
        explanation: `Everyone should be able to participate before worrying about
influence distribution. Remove barriers to entry first.`,
      },
      {
        principle: 'Local knowledge matters',
        explanation: `Communities succeed when governance incorporates local
knowledge—the lived experience of members. Create channels for this knowledge
to inform decisions.`,
      },
    ],
  },

  // Pitfalls - What can go wrong
  pitfalls: [
    {
      name: 'Voter Apathy',
      severity: 'high',
      description: `Low turnout undermines the legitimacy of decisions and
concentrates power in the hands of the few who vote.`,
      symptoms: [
        'Consistently low turnout on votes',
        'Same small group making most decisions',
        'Members feel governance doesn\'t affect them',
        'Declining engagement over time',
      ],
      prevention: `Make voting easy (mobile, async). Keep decisions focused and
meaningful. Celebrate participation. Use delegation so busy members can still
have voice.`,
      recovery: `Audit why people aren't participating. Reduce voting frequency—
fewer but more meaningful decisions. Consider delegation or representation.
Meet people where they are, not where you wish they were.`,
    },
    {
      name: 'NIMBY Capture',
      severity: 'high',
      description: `A vocal minority dominates governance, pushing the community
toward narrow interests at the expense of broader good.`,
      symptoms: [
        'Decisions favor a particular subgroup consistently',
        'Loud voices drowning out quieter members',
        'New members feel unwelcome or ignored',
        'Community purpose drifting toward minority interests',
      ],
      prevention: `Anonymous voting options. Clear community mission. Explicit
inclusion of diverse voices. Quorum requirements that prevent small group capture.`,
      recovery: `Return to mission: what is this community for? Create space for
unheard voices. Consider governance reforms to dilute concentrated influence.`,
    },
    {
      name: 'Delegate Disconnect',
      severity: 'medium',
      description: `Elected representatives stop representing. They become
detached from the community they're supposed to serve.`,
      symptoms: [
        'Delegates voting without consulting constituents',
        'Complaints that representatives don\'t understand members',
        'Delegate decisions contradicting community sentiment',
        'Low trust in representative system',
      ],
      prevention: `Regular delegate-member communication. Clear expectations for
representatives. Term limits. Easy recall mechanisms.`,
      recovery: `Strengthen accountability: require delegates to explain votes.
Consider more direct democracy if representation isn't working. Fresh elections
with new candidates.`,
    },
    {
      name: 'Governance Theater',
      severity: 'medium',
      description: `Voting happens but doesn't matter. Real decisions are made
elsewhere, and governance becomes performative.`,
      symptoms: [
        'Votes always go the way leadership wants',
        'Important decisions never come to vote',
        'Members feel their votes don\'t matter',
        'Decreasing seriousness about governance',
      ],
      prevention: `All significant decisions should go through governance.
Create clear scope for what requires community approval. Transparency about
all decision-making.`,
      recovery: `Acknowledge the problem. Commit to bringing real decisions to
the community. May need governance reform to give votes actual power.`,
    },
  ],

  // Education - Concepts and tooltips
  education: {
    concepts: {
      'hybrid-voting': {
        title: 'Balanced Community Voting',
        short: 'Equal membership rights plus earned influence from engagement',
        detailed: `The 50/50 hybrid means half your voting power comes from just
being a community member (everyone equal), and half from your participation
tokens (earned through engagement). This balances the democratic ideal that
everyone matters with the practical reality that engaged members understand
issues more deeply.`,
        whenToUse: 'Start at 50/50. Shift toward democracy for high-engagement communities, toward participation for low-engagement.',
      },
      'participation-tokens': {
        title: 'Engagement Recognition',
        short: 'Tokens that track your community engagement',
        detailed: `Participation tokens recognize consistent community engagement:
voting, attending meetings, volunteering, contributing to initiatives. They're
not currency—they're a record of who shows up. Members who engage more have
earned more influence in community decisions.`,
        whenToUse: 'Define what counts as engagement for your community. Voting? Events? Volunteering? All of the above?',
      },
      'community-governance': {
        title: 'Community Governance',
        short: 'How communities make collective decisions',
        detailed: `Community governance is the process by which a community makes
decisions that affect everyone. Good governance is accessible, transparent, and
reflects the community's values. It should feel like an expression of community,
not a burden.`,
        whenToUse: 'Design governance to match your community\'s culture and participation patterns.',
      },
      'delegation': {
        title: 'Delegation',
        short: 'Letting someone vote on your behalf',
        detailed: `Delegation allows busy members to participate by choosing
someone they trust to vote for them. Good delegation systems let you delegate
to different people for different topics, and let you override your delegate
on specific votes.`,
        whenToUse: 'Enable delegation when many members can\'t participate directly in every vote.',
      },
      'quorum': {
        title: 'Quorum',
        short: 'Minimum participation for valid decisions',
        detailed: `Quorum prevents decisions from being made by tiny minorities.
But set it too high and nothing gets decided. The right quorum depends on your
community's actual participation patterns.`,
        whenToUse: 'Set quorum based on realistic participation, not ideal participation.',
      },
    },
    tooltips: {
      democracyWeight: 'How much voting power comes from equal membership (one person, one vote)',
      participationWeight: 'How much voting power comes from active engagement in the community',
      quorum: 'Minimum participation needed for a decision to be valid',
    },
    contextualHelp: {
      'low-quorum-warning': {
        trigger: { quorum: { lte: 15 } },
        title: 'Very Low Quorum',
        content: `Quorum below 15% means a small fraction of members can make
decisions. This might be necessary for low-engagement communities, but be
aware that decisions may not reflect broad community sentiment.`,
      },
      'high-participation-weight': {
        trigger: { participationWeight: { gte: 80 } },
        title: 'High Participation Weight',
        content: `With 80%+ participation weight, active members have much more
influence than occasional participants. This rewards engagement but may
discourage casual members from voting. Make sure paths to participation are
clear and accessible.`,
      },
    },
  },

  // Default configuration
  defaults: {
    roles: [
      {
        name: 'Community Member',
        hierarchy: { adminRoleIndex: null },
        vouching: { enabled: false, quorum: 0, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 10000 },
      },
      {
        name: 'Steward',
        hierarchy: { adminRoleIndex: 0 },
        vouching: { enabled: false, quorum: 0, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 20 },
      },
    ],
    permissions: {
      taskManagers: [0, 1],
      projectCreators: [1],
      taskCreators: [0, 1],
      taskReviewers: [1],
      taskClaimers: [0, 1],
      nftCreators: [1],
      quickJoinRoles: [0],
      memberManagers: [1],
      ddVoters: [0, 1],
    },
    voting: {
      mode: 'HYBRID',
      democracyWeight: 50,
      participationWeight: 50,
    },
    features: {
      educationHubEnabled: false,
      electionHubEnabled: true,
    },
  },

  // UI guidance
  ui: {
    guidanceText: {
      default: 'Define roles for your community. Most communities have Members and elected Stewards who help coordinate.',
      small: 'Small communities can often operate with just Members—everyone participates equally.',
      large: 'Larger communities benefit from Stewards, working groups, or committees to help coordinate.',
      governance: 'Balance equal voice (democracy) with rewarding engagement (participation). 50/50 is a good starting point.',
      identity: 'Choose a name that reflects what brings your community together.',
    },
  },
};

export default communityDaoTemplate;
