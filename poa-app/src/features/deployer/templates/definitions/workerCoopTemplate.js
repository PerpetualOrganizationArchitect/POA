/**
 * Worker Cooperative Template
 *
 * "Worker cooperatives rest on a simple truth: those who do the work
 * should control the work. But democracy is a skill that improves with practice."
 */

export const workerCoopTemplate = {
  id: 'worker-coop',
  name: 'Worker Cooperative',
  tagline: 'Democratic workplaces where workers own and govern together',
  icon: '🏭',
  color: 'orange',

  // What You Can Do - Practical capabilities
  capabilities: {
    headline: 'Run your cooperative with transparent, democratic tools',
    description: `This system gives your cooperative the infrastructure to operate
democratically at any scale—from a founding team to hundreds of worker-owners.`,
    features: [
      {
        name: 'Vote Together on Decisions',
        description: `Create proposals for anything—from approving new hires to
major strategic decisions. Members vote based on your hybrid voting rules,
combining equal voice with recognition for active participation.`,
        icon: '🗳️',
      },
      {
        name: 'Track Work & Contributions',
        description: `Create tasks and projects that members can claim and complete.
The system tracks who does what, building a transparent record of contributions
that can inform profit-sharing and participation-based voting power.`,
        icon: '✅',
      },
      {
        name: 'Share Revenue Fairly',
        description: `Participation tokens accumulate as members complete work and
engage with governance. Use these tokens to inform profit distribution—those
who contribute more can earn more, while democratic voice remains protected.`,
        icon: '💰',
      },
      {
        name: 'Manage Membership',
        description: `Control who joins your cooperative with vouching requirements.
Existing members can vouch for new applicants, ensuring cultural fit while
keeping the door open to new worker-owners.`,
        icon: '👥',
      },
      {
        name: 'Elect Leaders Democratically',
        description: `If you have coordinator or steward roles, use democratic
elections to fill them. Term limits and regular elections prevent power
from concentrating in any individual.`,
        icon: '🏆',
      },
    ],
  },

  // Philosophy - The WHY behind this model
  philosophy: {
    essence: `Worker cooperatives give workers ownership and control over their
workplace. Unlike traditional businesses where owners and workers have different
interests, cooperatives align everyone's incentives—when the business succeeds,
everyone benefits.

**Hybrid voting** lets you balance two important values:
- **Democracy** (one person, one vote): Every worker-owner has equal voice
- **Participation** (contribution-based): Those who engage more have earned more influence

An 80/20 split means 80% of voting power comes from equal membership, while 20%
rewards active participation. This isn't anti-democratic—it recognizes that those
who show up consistently have valuable context for decisions.`,

    keyPrinciple: `Start with some participation weight (20-30%) even in a highly
democratic cooperative. This creates healthy incentives for engagement and builds
the "democratic muscle" your organization needs. You can always increase democracy
weight as your culture matures—it's much harder to add structure later.`,

    whatHybridVotingMeans: `When you vote with an 80/20 hybrid system:
- 80% of your voting power comes from being a member (everyone equal)
- 20% comes from your participation tokens (earned through work and engagement)

**Example:** In a 10-person cooperative voting on a $50K equipment purchase:
- With pure democracy, each person has 10% of voting power
- With 80/20 hybrid, a very active member might have 12-13% while a less active member has 8-9%

The active member's voice is stronger, but not dominant. This rewards engagement
without silencing anyone.`,

    historicalContext: `The Mondragon Corporation in Spain—the world's largest worker
cooperative with 80,000+ worker-owners—succeeds because of pragmatic governance
that adapts to scale, not ideological purity. They've learned that pure democracy
works beautifully in small teams but needs structure as organizations grow.`,
  },

  // Discovery Questions - Adapt settings to context
  discoveryQuestions: [
    {
      id: 'group_size',
      question: 'How many people will be in your cooperative?',
      why: `Group size fundamentally changes how democracy works. Small groups can
make decisions around a table. Larger groups need more structure to coordinate
effectively without endless meetings.`,
      options: [
        {
          value: 'small',
          label: '2-10 people',
          impact: 'Can handle more direct democracy—everyone knows everyone',
          emoji: '👥'
        },
        {
          value: 'medium',
          label: '11-50 people',
          impact: 'Benefits from clear processes while staying highly democratic',
          emoji: '👥👥'
        },
        {
          value: 'large',
          label: '50+ people',
          impact: 'Needs delegation and working groups to function smoothly',
          emoji: '👥👥👥'
        },
      ],
    },
    {
      id: 'trust_level',
      question: 'How well do the founding members know each other?',
      why: `Trust determines how much structure you need initially. Close friends
can make informal decisions. New acquaintances benefit from clear processes
that build trust over time through consistent, fair governance.`,
      options: [
        {
          value: 'high',
          label: 'Close friends or long-time colleagues',
          impact: 'Can lean more democratic from day one',
          emoji: '🤝'
        },
        {
          value: 'medium',
          label: 'Know each other somewhat',
          impact: 'Moderate structure helps build deeper trust',
          emoji: '🤝'
        },
        {
          value: 'low',
          label: 'Just met or new acquaintances',
          impact: 'More structure builds trust through consistent process',
          emoji: '🤝'
        },
      ],
    },
    {
      id: 'decision_speed',
      question: 'How quickly do you need to make decisions?',
      why: `Fast-moving industries need efficient governance. More deliberative
organizations can take time for consensus-building. Neither is better—it
depends on your context.`,
      options: [
        {
          value: 'fast',
          label: 'Fast - competitive industry, need to move quickly',
          impact: 'Delegate routine decisions, reserve voting for big ones',
          emoji: '⚡'
        },
        {
          value: 'moderate',
          label: 'Moderate - some decisions are time-sensitive',
          impact: 'Balanced approach with clear escalation paths',
          emoji: '⏱️'
        },
        {
          value: 'slow',
          label: 'Deliberative - can take time for consensus',
          impact: 'More discussion and broader participation per decision',
          emoji: '🐢'
        },
      ],
    },
  ],

  // Variations - Different configs for different contexts
  variations: {
    default: {
      name: 'Standard Cooperative',
      settings: {
        democracyWeight: 80,
        participationWeight: 20,
        quorum: 50,
      },
      reasoning: `80% democracy / 20% participation is the sweet spot for most
cooperatives. Everyone has strong voice, but active engagement is rewarded.
Half the members need to participate for decisions to be valid.`,
    },
    'small-high-trust': {
      name: 'Founding Team',
      matchConditions: { group_size: 'small', trust_level: 'high' },
      settings: {
        democracyWeight: 95,
        participationWeight: 5,
        quorum: 60,
      },
      reasoning: `With high trust and small numbers, you can embrace near-pure
democracy. The small participation weight still rewards consistent engagement
without dominating outcomes. Higher quorum ensures broad buy-in.`,
    },
    'growing-mixed-trust': {
      name: 'Growing Cooperative',
      matchConditions: { group_size: 'medium', trust_level: ['medium', 'low'] },
      settings: {
        democracyWeight: 70,
        participationWeight: 30,
        quorum: 40,
      },
      reasoning: `As you grow and bring in people who don't know each other yet,
more participation weight creates healthy structure. Lower quorum prevents
decision paralysis. Increase democracy weight as trust develops.`,
    },
    'large-enterprise': {
      name: 'Enterprise Cooperative',
      matchConditions: { group_size: 'large' },
      settings: {
        democracyWeight: 60,
        participationWeight: 40,
        quorum: 30,
      },
      reasoning: `At scale, you need efficient coordination. 60/40 maintains
democratic foundations while empowering engaged members to move things forward.
Lower quorum acknowledges that not everyone can participate in every decision.`,
    },
    'fast-paced': {
      name: 'Agile Cooperative',
      matchConditions: { decision_speed: 'fast', group_size: ['small', 'medium'] },
      settings: {
        democracyWeight: 70,
        participationWeight: 30,
        quorum: 35,
      },
      reasoning: `Fast-moving environments need efficient decision-making. Higher
participation weight empowers those actively engaged to move quickly on routine
matters while preserving democracy for strategic decisions.`,
    },
  },

  // Growth Path - How governance evolves
  growthPath: {
    stages: [
      {
        name: 'Founding',
        timeframe: '0-6 months',
        description: 'Building democratic muscle together',
        recommendedSettings: {
          democracyWeight: 70,
          participationWeight: 30,
        },
        milestones: [
          'Complete 10 decisions together through your voting system',
          'Every member has participated in at least one vote',
          'First disagreement resolved through governance (not just founder decision)',
          'Established regular rhythm for check-ins and proposals',
        ],
        nextStageSignals: [
          'Decisions feel easier and more natural',
          'Members trust the process even when they disagree with outcomes',
          'New members are successfully onboarded and participating',
        ],
      },
      {
        name: 'Growing',
        timeframe: '6-18 months',
        description: 'Increasing democracy as trust deepens',
        recommendedSettings: {
          democracyWeight: 80,
          participationWeight: 20,
        },
        milestones: [
          'Handled a significant disagreement constructively',
          'Profit-sharing or revenue distribution decided democratically',
          'Routine decisions happen without friction',
          'Working groups or committees formed for specific responsibilities',
        ],
        nextStageSignals: [
          'High trust across the organization',
          'Strong participation culture—people want to engage',
          'Governance feels natural, not burdensome',
        ],
      },
      {
        name: 'Mature',
        timeframe: '18+ months',
        description: 'Democracy as second nature',
        recommendedSettings: {
          democracyWeight: 90,
          participationWeight: 10,
        },
        milestones: [
          'Governance processes are well-documented and understood',
          'Organization has survived leadership transitions',
          'Culture attracts people who value democratic work',
          'Financial sustainability achieved through collective effort',
        ],
        nextStageSignals: [
          'Consider if pure democracy (100/0) suits your culture',
          'You might also keep some participation weight as recognition',
        ],
      },
    ],
    evolutionPrinciples: [
      {
        principle: 'Start structured, earn looseness',
        explanation: `Resist the temptation to start with pure democracy.
Structure isn't anti-democratic—it builds the skills needed for democracy to work.
It's much easier to reduce structure than to add it later.`,
      },
      {
        principle: 'Democracy is a skill',
        explanation: `Like any skill, democratic participation improves with
practice. Early governance should create regular opportunities to practice
making decisions together.`,
      },
      {
        principle: 'Trust builds through fair process',
        explanation: `When decisions follow a clear, consistent process, people
trust outcomes even when they disagree. This is the foundation of healthy
democratic culture.`,
      },
    ],
  },

  // Pitfalls - What can go wrong
  pitfalls: [
    {
      name: 'The 100% Democracy Trap',
      severity: 'high',
      description: `Jumping to pure democracy before trust and skills are built.
This often leads to decision fatigue, low turnout, and eventual abandonment of
democratic principles—the opposite of what you wanted.`,
      symptoms: [
        'Low voter turnout on routine decisions',
        'Same few people making most decisions despite equal rights',
        'Members feeling overwhelmed by constant voting',
        'Important decisions delayed while waiting for quorum',
      ],
      prevention: `Start with 70-80% democracy weight and increase gradually.
The 20-30% participation weight isn't anti-democratic—it recognizes engagement
while still preserving everyone's voice.`,
      recovery: `Reduce voting frequency by delegating routine decisions.
Increase participation weight temporarily. Focus on fewer but more meaningful
votes. Rebuild engagement before expanding democracy.`,
    },
    {
      name: 'Founder Syndrome',
      severity: 'high',
      description: `Founders struggle to let go of control as the cooperative
grows. This undermines the cooperative principles they championed.`,
      symptoms: [
        'Founders override or delay democratic decisions',
        'New members feel like "second-class" workers',
        'Informal power structures bypass formal governance',
        'Founders make excuses for why "we can\'t do that yet"',
      ],
      prevention: `Build succession into governance from day one. Term limits,
rotation of responsibilities, and explicit founder exit plans help prevent
entrenchment.`,
      recovery: `Have an honest conversation about power dynamics. Sometimes
founders need to step back entirely for a period. External facilitation can
help navigate these transitions.`,
    },
    {
      name: 'Meeting Overload',
      severity: 'medium',
      description: `Every decision becomes a discussion. Members spend more
time in meetings than doing actual work.`,
      symptoms: [
        'Meetings run long and frequently',
        'Same topics discussed repeatedly without resolution',
        'Members dread governance activities',
        'Decisions made in meetings get relitigated later',
      ],
      prevention: `Distinguish between decisions that need full discussion and
those that can be delegated. Use async voting for routine matters. Set clear
decision authority for different decision types.`,
      recovery: `Audit your meeting time. Categorize decisions by importance
and delegate aggressively. Reserve full-group discussion for truly strategic
decisions.`,
    },
    {
      name: 'Free Rider Problem',
      severity: 'medium',
      description: `Some members enjoy cooperative benefits without contributing
to governance or collective work.`,
      symptoms: [
        'Consistently low participation from some members',
        'Active members feel resentful',
        'Quality of decisions suffers from lack of diverse input',
        'Cooperative values erode over time',
      ],
      prevention: `The participation weight in voting naturally addresses this
by rewarding engagement. Clear expectations during onboarding help too.`,
      recovery: `Have direct conversations with disengaged members. Understand
barriers (time, understanding, interest) and address them. Sometimes people
need to leave if they don't share cooperative values.`,
    },
  ],

  // Education - Concepts and tooltips
  education: {
    concepts: {
      'hybrid-voting': {
        title: 'Hybrid Voting',
        short: 'Combines equal voice with recognition for active participation',
        detailed: `Hybrid voting splits voting power between two sources:

**Democracy weight** (e.g., 80%): Everyone gets equal voting power just for
being a member. This is the one-person-one-vote principle.

**Participation weight** (e.g., 20%): Additional voting power earned through
engagement—completing tasks, participating in votes, contributing to the
cooperative.

This isn't about creating inequality. It's about recognizing that those who
show up consistently bring valuable context to decisions. A member who attends
every meeting and completes tasks has earned slightly more influence than
someone who rarely engages.`,
        whenToUse: 'Use hybrid voting when you want to reward engagement while maintaining democratic foundations.',
      },
      'participation-tokens': {
        title: 'Participation Tokens',
        short: 'Digital record of your contributions and engagement',
        detailed: `Participation tokens accumulate as you engage with your
cooperative:
- Complete tasks and projects
- Vote on proposals
- Attend meetings (if tracked)
- Take on responsibilities

These tokens serve multiple purposes:
- Inform the participation portion of hybrid voting
- Provide transparent record for profit-sharing discussions
- Recognize contributions publicly

Tokens aren't about creating hierarchy—they're about making contributions
visible and fairly recognizing those who do the work.`,
        whenToUse: 'Track participation when you want transparent contribution records and fair engagement incentives.',
      },
      'quorum': {
        title: 'Quorum',
        short: 'Minimum participation for valid decisions',
        detailed: `Quorum prevents decisions from being made by tiny minorities.
But setting it too high can cause decision paralysis.

**Higher quorum (50-60%):** For major decisions—strategy, large expenses,
membership changes. Ensures broad buy-in.

**Lower quorum (25-35%):** For routine matters—task assignments, small
expenses, operational decisions. Keeps things moving.

The right quorum depends on your expected participation rate. If only 40%
typically vote, a 50% quorum means nothing ever passes.`,
        whenToUse: 'Adjust quorum based on decision importance and realistic participation rates.',
      },
    },
    tooltips: {
      democracyWeight: 'Percentage of voting power from equal membership (one person, one vote)',
      participationWeight: 'Percentage of voting power earned through active contribution',
      quorum: 'Minimum percentage of members who must participate for a decision to be valid',
      hybridVoting: 'Combines democratic equality with recognition for active engagement',
    },
    contextualHelp: {
      'high-democracy-warning': {
        trigger: { democracyWeight: { gte: 95 } },
        title: 'Ready for Pure Democracy?',
        content: `Pure democracy (95%+) works beautifully when trust is high and
participation is strong. But it requires active engagement from everyone.

Consider: Does your group have a strong participation culture? Have you
practiced making decisions together? If you're just starting, consider
building up to this over time.`,
      },
      'low-democracy-warning': {
        trigger: { democracyWeight: { lte: 50 } },
        title: 'Is This Still a Cooperative?',
        content: `Below 50% democracy weight, you're moving away from cooperative
principles toward a participation-heavy model. This might make sense for some
contexts, but consider whether "cooperative" is still the right frame.

Cooperatives are built on the principle of democratic member control.`,
      },
    },
  },

  // Default configuration
  defaults: {
    roles: [
      {
        name: 'Worker-Owner',
        hierarchy: { adminRoleIndex: null },
        vouching: { enabled: true, quorum: 2, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 1000 },
      },
      {
        name: 'Coordinator',
        hierarchy: { adminRoleIndex: 0 },
        vouching: { enabled: false, quorum: 0, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 10 },
      },
    ],
    permissions: {
      taskManagers: [0, 1],
      projectCreators: [0, 1],
      taskCreators: [0, 1],
      taskReviewers: [0, 1],
      taskClaimers: [0, 1],
      nftCreators: [0],
      quickJoinRoles: [],
      memberManagers: [0],
      ddVoters: [0, 1],
    },
    voting: {
      mode: 'HYBRID',
      democracyWeight: 80,
      participationWeight: 20,
    },
    features: {
      educationHubEnabled: false,
      electionHubEnabled: true,
    },
  },

  // UI guidance
  ui: {
    guidanceText: {
      default: 'Define the roles in your cooperative. Worker-Owners are the heart of the organization—everyone who works is also an owner.',
      small: 'With a small team, you can keep it simple. Consider just Worker-Owner for everyone.',
      large: 'Larger cooperatives benefit from Coordinator roles, but be careful not to create hierarchy that undermines democratic principles.',
      governance: 'Set your voting philosophy. We recommend 80/20 (democracy/participation) to start—it rewards engagement while keeping everyone\'s voice strong.',
      identity: 'Give your cooperative a name that reflects your shared purpose and values.',
    },
  },
};

export default workerCoopTemplate;
