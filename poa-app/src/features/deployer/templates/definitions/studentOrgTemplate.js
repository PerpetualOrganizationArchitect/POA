/**
 * Student Organization Template
 *
 * "Student organizations are laboratories for democracy.
 * Learning to govern is as important as governing well."
 */

export const studentOrgTemplate = {
  id: 'student-org',
  name: 'Student Organization',
  tagline: 'Democratic clubs where students learn to lead together',
  icon: '🎓',
  color: 'blue',

  // What you can DO with this - practical capabilities
  capabilities: {
    headline: 'Run your student org like a real organization, with training wheels',
    features: [
      {
        name: 'Vote on Everything Together',
        description: 'Events, budget, policies, new initiatives—members decide democratically. Learning to vote is as important as the outcomes.',
        icon: '🗳️',
      },
      {
        name: 'Elect Your Leaders',
        description: 'Democratic elections for executive positions. Campaign, vote, hold leaders accountable. Real experience in democratic leadership.',
        icon: '🏆',
      },
      {
        name: 'Track Member Participation',
        description: 'Attendance, event organizing, committee work—participation tokens recognize engagement. See who\'s showing up and contributing.',
        icon: '⭐',
      },
      {
        name: 'Manage Events & Projects',
        description: 'Plan events, assign tasks, track who\'s responsible for what. No more "I thought someone else was doing that."',
        icon: '📋',
      },
      {
        name: 'Onboard New Members',
        description: 'Education hub teaches new members how the org works. Constitution, processes, history—all documented and accessible.',
        icon: '📚',
      },
    ],
  },

  // Philosophy - The WHY behind this model
  philosophy: {
    essence: `Student organizations are more than clubs—they're training grounds for
democratic citizenship. The goal isn't just to run events or manage projects; it's
to practice the skills of collective decision-making, leadership, and accountability.
Making mistakes here is valuable—it's much better to learn governance lessons as a
student than as an adult with real consequences.

**The 50/50 hybrid voting system** teaches both democratic equality and the value of
engagement: half your voting power is automatic (everyone matters), half is earned
through participation (showing up matters too). It's real governance practice.`,

    keyPrinciple: `Balance learning with doing. The 50/50 split between democracy
and participation creates space for everyone to learn while rewarding those who
step up. Elections for executives teach both leadership and accountability.
Education hub is essential—good governance requires understanding.`,

    historicalContext: `Student government has existed as long as universities have.
Organizations like student unions, fraternities, and clubs have always served as
laboratories for democracy. The best student organizations produce future leaders
who understand how to build consensus, manage conflict, and serve communities.`,

    whatHybridVotingMeans: `With 50/50 hybrid voting in your student org:
- 50% of voting power comes from membership (every member equal)
- 50% comes from participation tokens (earned through engagement)

**Example:** Voting on next semester's budget in a 50-member club:
- Every member has at least 1% voting power just from being a member
- An exec who attends every meeting and runs events might have 3-4%
- A member who just joined has 1.2%
- Active members matter more, but every voice counts—exactly what governance should teach`,
  },

  // Discovery Questions - Adapt settings to context
  discoveryQuestions: [
    {
      id: 'org_purpose',
      question: 'What\'s the main purpose of your organization?',
      why: `Different types of student organizations have different governance needs.
Social clubs can be lighter; student government needs more structure.`,
      options: [
        {
          value: 'social',
          label: 'Social - bringing students together around shared interests',
          impact: 'Lighter governance, focus on events and community',
          emoji: '🎉'
        },
        {
          value: 'academic',
          label: 'Academic - study groups, research, intellectual community',
          impact: 'Focus on learning and collaboration',
          emoji: '📚'
        },
        {
          value: 'service',
          label: 'Service - volunteer work, community impact',
          impact: 'Task-focused governance, project management',
          emoji: '🤝'
        },
        {
          value: 'advocacy',
          label: 'Advocacy - representing student interests',
          impact: 'Formal governance, elected positions, accountability',
          emoji: '📢'
        },
      ],
    },
    {
      id: 'member_turnover',
      question: 'How much does your membership change each year?',
      why: `High turnover (students graduating) requires strong onboarding and
knowledge transfer. Organizations that survive founder departure have figured
this out.`,
      options: [
        {
          value: 'high',
          label: 'High - most members are here 1-2 years',
          impact: 'Strong onboarding needed, education hub essential',
          emoji: '🔄'
        },
        {
          value: 'moderate',
          label: 'Moderate - mix of short and long-term members',
          impact: 'Balance continuity with fresh perspectives',
          emoji: '⚖️'
        },
        {
          value: 'low',
          label: 'Low - members stay throughout their studies',
          impact: 'Can build deeper institutional knowledge',
          emoji: '🏠'
        },
      ],
    },
    {
      id: 'org_size',
      question: 'How many active members do you expect?',
      why: `Small organizations can be informal. Larger ones need more structure
to prevent chaos and ensure everyone has voice.`,
      options: [
        {
          value: 'small',
          label: '5-20 members',
          impact: 'Can use informal consensus, everyone knows everyone',
          emoji: '👤'
        },
        {
          value: 'medium',
          label: '20-100 members',
          impact: 'Need structure but can stay relatively democratic',
          emoji: '👥'
        },
        {
          value: 'large',
          label: '100+ members',
          impact: 'Need clear roles, delegation, and representation',
          emoji: '👥👥'
        },
      ],
    },
  ],

  // Variations - Different configs for different contexts
  variations: {
    default: {
      name: 'Standard Student Org',
      settings: {
        democracyWeight: 50,
        participationWeight: 50,
        quorum: 35,
      },
      reasoning: `The 50/50 split balances equal voice with rewarding engagement.
This creates incentives to participate while ensuring every member matters.
Elections for executives provide accountability and leadership experience.`,
    },
    'social-club': {
      name: 'Social Club',
      matchConditions: { org_purpose: 'social' },
      settings: {
        democracyWeight: 70,
        participationWeight: 30,
        quorum: 25,
      },
      reasoning: `Social clubs should be welcoming and low-barrier. Higher democracy
weight ensures new members feel included. Lower quorum reflects that not every
decision needs full engagement.`,
    },
    'student-government': {
      name: 'Student Government',
      matchConditions: { org_purpose: 'advocacy' },
      settings: {
        democracyWeight: 60,
        participationWeight: 40,
        quorum: 40,
        features: {
          educationHubEnabled: true,
          electionHubEnabled: true,
        },
      },
      reasoning: `Student government represents all students and needs legitimacy
through democratic participation. Higher quorum ensures broad support for
decisions. Elections are essential.`,
    },
    'service-org': {
      name: 'Service Organization',
      matchConditions: { org_purpose: 'service' },
      settings: {
        democracyWeight: 50,
        participationWeight: 50,
        quorum: 30,
      },
      reasoning: `Service organizations balance democracy with rewarding those
who do the work. Task management and project creation are key capabilities.`,
    },
    'high-turnover': {
      name: 'High Turnover Org',
      matchConditions: { member_turnover: 'high' },
      settings: {
        democracyWeight: 60,
        participationWeight: 40,
        quorum: 30,
        features: {
          educationHubEnabled: true,
        },
      },
      reasoning: `High turnover requires accessible governance that new members
can quickly understand and participate in. Education hub is essential.`,
    },
    'large-org': {
      name: 'Large Organization',
      matchConditions: { org_size: 'large' },
      settings: {
        democracyWeight: 50,
        participationWeight: 50,
        quorum: 25,
      },
      reasoning: `Large organizations need lower quorum to function and clear
role structures. Consider working groups or committees for specific areas.`,
    },
  },

  // Growth Path - How governance evolves
  growthPath: {
    stages: [
      {
        name: 'Founding',
        timeframe: '0-1 semester',
        description: 'Establishing your organization',
        recommendedSettings: {
          democracyWeight: 50,
          participationWeight: 50,
        },
        milestones: [
          'Constitution or charter written',
          'First elections held',
          'Education hub content created',
          'First successful event or project',
        ],
        nextStageSignals: [
          'Regular meeting attendance',
          'Members understand governance process',
          'Executive team functioning well',
        ],
      },
      {
        name: 'Establishing',
        timeframe: '1-3 semesters',
        description: 'Building sustainable practices',
        recommendedSettings: {
          democracyWeight: 50,
          participationWeight: 50,
        },
        milestones: [
          'First leadership transition completed',
          'New members successfully onboarded',
          'Handled first conflict or controversy',
        ],
        nextStageSignals: [
          'Organization survives founder graduation',
          'Institutional memory preserved',
          'Clear identity and reputation',
        ],
      },
      {
        name: 'Thriving',
        timeframe: '3+ semesters',
        description: 'Sustainable student organization',
        recommendedSettings: {
          democracyWeight: 50,
          participationWeight: 50,
        },
        milestones: [
          'Multiple leadership generations',
          'Strong brand and community presence',
          'Alumni network forming',
        ],
        nextStageSignals: [
          'Consider mentoring new organizations',
          'May need more formal structure for growth',
        ],
      },
    ],
    evolutionPrinciples: [
      {
        principle: 'Learning is the goal',
        explanation: `Student organizations exist partly to teach governance skills.
Mistakes are learning opportunities. Don't let fear of mistakes prevent trying
new things.`,
      },
      {
        principle: 'Succession is essential',
        explanation: `Plan for transitions from day one. Document everything.
Create clear paths for new leaders. The organization should survive any
individual's graduation.`,
      },
      {
        principle: 'Engagement over efficiency',
        explanation: `A slower decision that engages more people is often better
than a fast decision by a few. The process teaches as much as the outcome.`,
      },
    ],
  },

  // Pitfalls - What can go wrong
  pitfalls: [
    {
      name: 'Founder Departure',
      severity: 'high',
      description: `The organization collapses when founding members graduate.
This is the #1 killer of student organizations.`,
      symptoms: [
        'All institutional knowledge in founders\' heads',
        'New members don\'t understand how things work',
        'No documentation of processes',
        'Heavy reliance on personal relationships',
      ],
      prevention: `Document everything from day one. Use the education hub to
train new members. Force knowledge transfer by having new members run events
before founders leave. Plan succession explicitly.`,
      recovery: `If you're already in trouble: capture knowledge immediately
from remaining old members. Simplify processes. Focus on rebuilding rather
than maintaining previous complexity.`,
    },
    {
      name: 'Apathy Spiral',
      severity: 'high',
      description: `Low engagement begets lower engagement. Meetings feel
pointless, so fewer people come, so meetings feel more pointless.`,
      symptoms: [
        'Declining meeting attendance',
        'Same few people doing everything',
        'Members joining but not participating',
        'Elections with few candidates',
      ],
      prevention: `Make participation meaningful. Every meeting should have
clear purpose. Celebrate contributions. Create low-barrier ways to participate.
Use the participation weight to reward engagement.`,
      recovery: `Reset expectations. Survey members about what they want.
Consider smaller, more focused meetings. Recruit actively. Sometimes you need
to shrink to grow again.`,
    },
    {
      name: 'Resume Stuffing',
      severity: 'medium',
      description: `Members join for credentials, not engagement. They want
the title without doing the work.`,
      symptoms: [
        'Executive titles with no action',
        'People joining before grad school applications',
        'Responsibilities falling through cracks',
        'Genuine members doing extra work',
      ],
      prevention: `Make roles meaningful and accountable. Regular check-ins
and expectations. Participation weight naturally addresses this—titles without
engagement don't earn influence.`,
      recovery: `Clarify expectations explicitly. Have honest conversations
about commitment. Consider removing inactive members or officers. Better to
be small and genuine than large and hollow.`,
    },
    {
      name: 'Drama Escalation',
      severity: 'medium',
      description: `Student organizations can become hothouses for interpersonal
drama, derailing the actual mission.`,
      symptoms: [
        'Personal conflicts dominating meetings',
        'Cliques forming',
        'Gossip replacing direct communication',
        'People quitting over relationships, not mission',
      ],
      prevention: `Clear conflict resolution processes. Norms about direct
communication. Focus on mission, not personalities. Advisor involvement when
needed.`,
      recovery: `External mediation (advisor, outside facilitator). Recommit
to mission. Sometimes people need to step back or leave. Don't let drama
destroy what you've built.`,
    },
  ],

  // Education - Concepts and tooltips
  education: {
    concepts: {
      'hybrid-voting': {
        title: 'Learning Balanced Governance',
        short: 'Equal membership plus earned influence—real-world governance practice',
        detailed: `The 50/50 hybrid teaches both democratic principles and the
value of engagement. Half your voting power is automatic (everyone matters
equally as members), half is earned through participation (showing up and
contributing matters too). It's how real organizations balance fairness with
rewarding effort.`,
        whenToUse: 'Keep 50/50 for most student orgs. It teaches both democratic ideals and engagement value.',
      },
      'participation-tokens': {
        title: 'Activity & Engagement Tracking',
        short: 'Recognition for showing up and contributing',
        detailed: `Participation tokens track engagement: attending meetings,
running events, serving on committees, taking on responsibilities. They help
identify who's actually contributing vs. just having a title. More engagement
= more influence in org decisions.`,
        whenToUse: 'Use tokens to recognize genuine engagement. Helps address resume-stuffing problem.',
      },
      'elections': {
        title: 'Elections',
        short: 'How leaders are chosen democratically',
        detailed: `Elections in student organizations teach leadership and
accountability. Executives are elected to serve the membership, not rule it.
Regular elections ensure fresh perspectives and prevent power concentration.`,
        whenToUse: 'Hold elections at least annually. Consider term limits to ensure leadership development.',
      },
      'executive-board': {
        title: 'Executive Board',
        short: 'Elected leaders who coordinate the organization',
        detailed: `The executive board manages day-to-day operations and
coordinates activities. But they serve at the pleasure of the membership.
Major decisions still go to the full organization.`,
        whenToUse: 'Executives should empower members, not gatekeep. Create clear scope for executive vs. membership decisions.',
      },
      'vouching': {
        title: 'Vouching',
        short: 'Existing members sponsoring new members',
        detailed: `Vouching means new members need sponsorship from existing
members. This builds community and ensures new members have a connection.
But be careful it doesn't become gatekeeping.`,
        whenToUse: 'Use vouching when community fit matters. Ensure it doesn\'t exclude people unfairly.',
      },
    },
    tooltips: {
      democracyWeight: 'How much each member\'s vote counts equally (one person, one vote)',
      participationWeight: 'How much voting power comes from active participation in the org',
      quorum: 'Minimum participation for decisions to be valid',
      vouching: 'Existing members sponsoring new members to join',
    },
    contextualHelp: {
      'education-hub': {
        trigger: { features: { educationHubEnabled: true } },
        title: 'Education Hub Enabled',
        content: `The education hub helps new members learn about your organization
and governance. This is especially important for student organizations with
high turnover. Create content about your mission, processes, and expectations.`,
      },
      'elections-enabled': {
        trigger: { features: { electionHubEnabled: true } },
        title: 'Elections Enabled',
        content: `Elections let members choose their leaders democratically.
This teaches accountability and ensures executive board serves the membership.
Consider term limits and regular election schedules.`,
      },
    },
  },

  // Default configuration
  defaults: {
    roles: [
      {
        name: 'Executive',
        hierarchy: { adminRoleIndex: null },
        vouching: { enabled: false, quorum: 0, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 10 },
      },
      {
        name: 'Member',
        hierarchy: { adminRoleIndex: 0 },
        vouching: { enabled: true, quorum: 1, voucherRoleIndex: 0 },
        hatConfig: { maxSupply: 500 },
      },
    ],
    permissions: {
      taskManagers: [0],
      projectCreators: [0],
      taskCreators: [0],
      taskReviewers: [0],
      taskClaimers: [0, 1],
      nftCreators: [0],
      quickJoinRoles: [],
      memberManagers: [0],
      ddVoters: [0, 1],
    },
    voting: {
      mode: 'HYBRID',
      democracyWeight: 50,
      participationWeight: 50,
    },
    features: {
      educationHubEnabled: true,
      electionHubEnabled: true,
    },
  },

  // UI guidance
  ui: {
    guidanceText: {
      default: 'Most student organizations have Executives (elected leaders) and Members. Executives coordinate; members participate and elect.',
      small: 'Small organizations can be informal—everyone might share executive duties.',
      large: 'Larger organizations benefit from committees or working groups under the executive board.',
      governance: 'The 50/50 split teaches both democratic participation and active engagement. Elections make executives accountable to members.',
      identity: 'Choose a name that reflects your mission and will attract the right members.',
    },
  },
};

export default studentOrgTemplate;
