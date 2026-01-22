/**
 * Custom Template
 *
 * "Sometimes you need to build something new.
 * But with great power comes great responsibility."
 */

export const customTemplate = {
  id: 'custom',
  name: 'Custom',
  tagline: 'Design your own governance from scratch',
  icon: '🔧',
  color: 'gray',

  // What you can DO with this - practical capabilities
  capabilities: {
    headline: 'Build exactly the governance your organization needs',
    features: [
      {
        name: 'Vote Your Way',
        description: 'Set your own democracy/participation balance. Pure democracy? Full meritocracy? Anything in between. You decide what fits.',
        icon: '🗳️',
      },
      {
        name: 'Define Custom Roles',
        description: 'Create the exact role structure you need. Hierarchies, permissions, vouching rules—all configurable.',
        icon: '👥',
      },
      {
        name: 'Track What Matters',
        description: 'Participation tokens can track whatever contributions you value. Define what "engagement" means for your context.',
        icon: '📊',
      },
      {
        name: 'Manage Tasks & Projects',
        description: 'Create projects, assign tasks, track completion. Whatever your organization does, coordinate it transparently.',
        icon: '✅',
      },
      {
        name: 'Enable What You Need',
        description: 'Education hub? Elections? Revenue sharing? Enable the features that matter, skip what doesn\'t.',
        icon: '⚙️',
      },
    ],
  },

  // Philosophy - The WHY behind this model
  philosophy: {
    essence: `Sometimes your organization doesn't fit neatly into existing templates.
Custom governance lets you build exactly what you need. But custom comes with
responsibility: you're making design decisions that will affect how your
community functions for years to come.

**Hybrid voting is the foundation:** you set the balance between democracy (equal voice)
and participation (earned influence). This slider is the most important decision in
custom governance—it determines whether your org leans democratic, meritocratic, or
balanced.`,

    keyPrinciple: `Before going custom, ask: is this truly unique, or am I
reinventing the wheel? Most governance problems have been solved before.
Custom governance should build on proven patterns, not ignore them.`,

    historicalContext: `The history of governance is full of well-intentioned
experiments that failed. Novel designs often look great on paper but struggle
in practice. The most successful custom governance starts with existing
patterns and adapts them thoughtfully.`,

    whatHybridVotingMeans: `Hybrid voting combines two sources of voting power:
- **Democracy weight:** Equal voice for every member (one person, one vote portion)
- **Participation weight:** Influence earned through engagement (contribution-based portion)

**How to set your balance:**
- 100/0 = Pure democracy. Everyone equal regardless of engagement.
- 80/20 = Mostly democratic. Engagement matters a little.
- 50/50 = Balanced. Equal voice and earned influence both matter.
- 30/70 = Meritocratic. Those who contribute most guide decisions.
- 0/100 = Pure meritocracy. Influence only through contribution.

Start with 50/50 if unsure. You can always adjust based on experience.`,
  },

  // Self-Assessment Questions - Before proceeding
  selfAssessment: [
    {
      id: 'why_custom',
      question: 'Why are you choosing custom governance?',
      why: `Understanding your motivation helps determine if custom is the right
choice. Sometimes custom is necessary; sometimes a template would serve you better.`,
      options: [
        {
          value: 'unique',
          label: 'Our organization is genuinely unique and doesn\'t fit templates',
          feedback: 'Custom may be appropriate. Consider what makes you unique and why templates don\'t work.',
          riskLevel: 'low',
          emoji: '✨'
        },
        {
          value: 'control',
          label: 'I want full control over every setting',
          feedback: 'Consider: is this about control or about meeting specific needs? Templates can be customized too.',
          riskLevel: 'medium',
          emoji: '🎛️'
        },
        {
          value: 'learning',
          label: 'I want to learn how governance works by building it',
          feedback: 'Great reason! Just remember that learning experiments can be forked later if they don\'t work.',
          riskLevel: 'medium',
          emoji: '📚'
        },
        {
          value: 'unsure',
          label: 'Not sure - none of the templates seemed right',
          feedback: 'Consider looking at templates again. They\'re flexible and might work with customization.',
          riskLevel: 'high',
          emoji: '🤔'
        },
      ],
    },
    {
      id: 'experience_level',
      question: 'How much experience do you have with governance design?',
      why: `Governance design is harder than it looks. Honest self-assessment helps
you know when to rely on patterns vs. innovate.`,
      options: [
        {
          value: 'expert',
          label: 'Expert - I\'ve designed or led multiple organizations',
          feedback: 'You likely know the tradeoffs. Trust your experience, but stay humble.',
          riskLevel: 'low',
          emoji: '🎯'
        },
        {
          value: 'moderate',
          label: 'Moderate - I\'ve been part of organizations and understand basics',
          feedback: 'Start with simpler governance and evolve. You don\'t need everything figured out day one.',
          riskLevel: 'medium',
          emoji: '📈'
        },
        {
          value: 'beginner',
          label: 'Beginner - this is my first time designing governance',
          feedback: 'Strongly consider starting with a template and customizing. You can always change later.',
          riskLevel: 'high',
          emoji: '🌱'
        },
      ],
    },
    {
      id: 'studied_similar',
      question: 'Have you studied similar organizations?',
      why: `The best custom governance builds on what's worked elsewhere. Original
doesn't mean ignoring prior art.`,
      options: [
        {
          value: 'yes_deeply',
          label: 'Yes - I\'ve researched several similar organizations',
          feedback: 'Excellent. Apply what you\'ve learned.',
          riskLevel: 'low',
          emoji: '📚'
        },
        {
          value: 'somewhat',
          label: 'Somewhat - I know of some but haven\'t studied deeply',
          feedback: 'Consider spending more time researching before finalizing. It\'s worth the investment.',
          riskLevel: 'medium',
          emoji: '🔍'
        },
        {
          value: 'no',
          label: 'No - I\'m building something new',
          feedback: 'Strong recommendation: study at least 3 similar organizations before proceeding.',
          riskLevel: 'high',
          emoji: '⚠️'
        },
      ],
    },
  ],

  // Discovery Questions - Help guide custom setup
  discoveryQuestions: [
    {
      id: 'governance_style',
      question: 'What\'s your preferred decision-making style?',
      why: `This fundamental choice shapes everything else about your governance.`,
      options: [
        {
          value: 'democratic',
          label: 'Democratic - every member has equal say',
          impact: 'High democracy weight (70-100%)',
          emoji: '🗳️'
        },
        {
          value: 'meritocratic',
          label: 'Meritocratic - influence earned through contribution',
          impact: 'High participation weight (60-80%)',
          emoji: '🏆'
        },
        {
          value: 'balanced',
          label: 'Balanced - mix of equal voice and earned influence',
          impact: 'Even split (40-60% democracy)',
          emoji: '⚖️'
        },
        {
          value: 'hierarchical',
          label: 'Hierarchical - leaders decide with input from members',
          impact: 'Lower quorum, stronger role distinctions',
          emoji: '📊'
        },
      ],
    },
    {
      id: 'decision_frequency',
      question: 'How often will your organization make collective decisions?',
      why: `Frequent voting requires different governance than occasional major decisions.`,
      options: [
        {
          value: 'frequent',
          label: 'Frequently - multiple decisions per week',
          impact: 'Lower quorum, streamlined processes',
          emoji: '⚡'
        },
        {
          value: 'moderate',
          label: 'Moderately - a few decisions per month',
          impact: 'Balanced quorum and process',
          emoji: '📅'
        },
        {
          value: 'rare',
          label: 'Rarely - only major decisions come to vote',
          impact: 'Higher quorum, more deliberation',
          emoji: '🏔️'
        },
      ],
    },
    {
      id: 'member_commitment',
      question: 'What level of commitment do you expect from members?',
      why: `Governance should match realistic engagement levels, not ideal ones.`,
      options: [
        {
          value: 'high',
          label: 'High - members are deeply committed',
          impact: 'Can expect higher participation, more complex processes work',
          emoji: '🔥'
        },
        {
          value: 'medium',
          label: 'Medium - members are engaged but have other priorities',
          impact: 'Need accessible governance, async options',
          emoji: '⚖️'
        },
        {
          value: 'low',
          label: 'Low - casual membership, variable engagement',
          impact: 'Simple governance, low barriers, delegation',
          emoji: '🌊'
        },
      ],
    },
  ],

  // Pitfalls - What can go wrong with custom governance
  pitfalls: [
    {
      name: 'Complexity Trap',
      severity: 'high',
      description: `Over-engineering governance makes it unusable. Every feature
adds cognitive load. Simple governance that people use beats complex governance
that nobody understands.`,
      symptoms: [
        'Members don\'t understand how decisions work',
        'Documentation required to do basic things',
        'Processes abandoned in favor of informal decisions',
        'Governance becomes burden rather than empowerment',
      ],
      prevention: `Start simple. Add complexity only when you have a specific
problem that requires it. Every feature should earn its place.`,
      recovery: `Audit what's actually being used. Remove everything that isn't.
Simplify ruthlessly. It's easier to add features than remove them.`,
    },
    {
      name: 'Untested Assumptions',
      severity: 'high',
      description: `Novel governance designs often fail in practice because they're
based on how people should behave, not how they actually do.`,
      symptoms: [
        'Participation lower than expected',
        'People gaming the system in unexpected ways',
        'Outcomes not matching intentions',
        'Frustration with "why isn\'t this working?"',
      ],
      prevention: `Test assumptions before committing. Start with a pilot group.
Be ready to iterate quickly. Build in feedback mechanisms.`,
      recovery: `Accept that the design needs revision. Gather data on what's
actually happening. Adapt based on reality, not ideals.`,
    },
    {
      name: 'Reinventing the Wheel',
      severity: 'medium',
      description: `Custom governance that recreates solved problems, just worse.
Original isn't always better.`,
      symptoms: [
        'Struggling with problems other orgs solved long ago',
        'Missing obvious features that templates include',
        'Spending time on governance infrastructure instead of mission',
      ],
      prevention: `Study existing patterns. Use templates as starting points.
Only go custom where you have specific needs templates don't meet.`,
      recovery: `Be humble. Look at what works elsewhere. Consider migrating
to a template and customizing from there.`,
    },
    {
      name: 'Specification Creep',
      severity: 'medium',
      description: `Spending so much time designing governance that you never
actually start governing. Analysis paralysis disguised as thoroughness.`,
      symptoms: [
        'Months of discussion before first vote',
        'Endless debates about theoretical scenarios',
        'Perfect becoming enemy of good',
        'Organization exists on paper but not in practice',
      ],
      prevention: `Time-box governance design. Launch with minimum viable
governance and iterate. Real experience beats theoretical planning.`,
      recovery: `Stop planning. Launch now. Fix problems as they emerge.
You'll learn more from two weeks of operation than two months of planning.`,
    },
  ],

  // Education - Concepts for custom governance
  education: {
    concepts: {
      'hybrid-voting': {
        title: 'Understanding Hybrid Voting',
        short: 'The balance between equal voice and earned influence',
        detailed: `Hybrid voting is your most important design decision. The
democracy/participation slider determines your organization's character:
- High democracy (80%+): Everyone nearly equal, accessible, inclusive
- Balanced (40-60%): Both membership and engagement matter
- High participation (70%+): Meritocratic, rewards active contributors

There's no "right" answer—only what fits your organization's values and goals.`,
        whenToUse: 'Start at 50/50 if unsure. Adjust based on your values and observed behavior.',
      },
      'participation-tokens': {
        title: 'Custom Participation Tracking',
        short: 'Define what "engagement" means for your organization',
        detailed: `Participation tokens track engagement—but you decide what counts.
For some orgs, it's completing tasks. For others, it's voting or meeting
attendance. For DAOs, it might be on-chain activity. Define clearly what earns
tokens in your context, and communicate it to members.`,
        whenToUse: 'Be explicit about what earns tokens. Ambiguity creates frustration and gaming.',
      },
      'governance-design': {
        title: 'Governance Design',
        short: 'The art and science of structuring collective decision-making',
        detailed: `Good governance design balances multiple tensions: efficiency
vs. participation, simplicity vs. flexibility, individual vs. collective.
There are no perfect answers—only tradeoffs suited to your context.`,
        whenToUse: 'Take governance design seriously, but don\'t let it become an end in itself.',
      },
      'minimum-viable-governance': {
        title: 'Minimum Viable Governance',
        short: 'Start with the simplest governance that could work',
        detailed: `Like minimum viable product, minimum viable governance gets
you started with just enough structure. You can always add complexity later.
Starting complex is much harder to fix than starting simple.`,
        whenToUse: 'Always start simpler than you think you need. Add complexity only when you have specific problems.',
      },
      'iteration': {
        title: 'Governance Iteration',
        short: 'Evolving governance based on experience',
        detailed: `The best governance evolves through use. Build in mechanisms
for review and change. Expect to iterate. First-time-right is unrealistic.`,
        whenToUse: 'Plan for change from day one. Schedule governance reviews. Make amendment processes clear.',
      },
    },
    tooltips: {
      democracyWeight: 'How much voting power comes from equal membership (one person, one vote)',
      participationWeight: 'How much voting power is earned through active engagement',
      quorum: 'Minimum participation for valid decisions',
    },
    contextualHelp: {
      'high-risk-warning': {
        trigger: { selfAssessment: { riskLevel: 'high' } },
        title: 'Consider Starting with a Template',
        content: `Based on your self-assessment, custom governance may be more
challenging than expected. Consider starting with a template and customizing
it—this gives you a proven foundation to build on.`,
      },
    },
  },

  // Default configuration - minimal starting point
  defaults: {
    roles: [
      {
        name: 'Member',
        hierarchy: { adminRoleIndex: null },
        vouching: { enabled: false, quorum: 0, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 1000 },
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
      democracyWeight: 50,
      participationWeight: 50,
    },
    features: {
      educationHubEnabled: false,
      electionHubEnabled: false,
    },
  },

  // UI guidance
  ui: {
    guidanceText: {
      default: 'You\'re building custom governance. Start simple and add complexity only when needed.',
      governance: 'Think carefully about your voting setup. This is the foundation of your governance.',
      identity: 'Choose a name that reflects your organization\'s unique purpose.',
    },
    warnings: {
      beforeStart: `Custom governance gives you full control, but also full
responsibility. Before proceeding, we recommend:
1. Studying at least 3 similar organizations
2. Starting with minimum viable governance
3. Planning for iteration—your first design won't be perfect`,
    },
  },
};

export default customTemplate;
