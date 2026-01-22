import { gql } from '@apollo/client';

// ============================================
// POP SUBGRAPH QUERIES (Hoodi testnet)
// Schema: https://api.studio.thegraph.com/query/73367/poa-2/version/latest
// ============================================

// Fetch all organizations for browsing
export const FETCH_ALL_ORGS = gql`
  query FetchAllOrgs {
    organizations(first: 100, orderBy: deployedAt, orderDirection: desc) {
      id
      name
      metadataHash
      deployedAt
      topHatId
      participationToken {
        id
        totalSupply
      }
      quickJoin {
        id
      }
      hybridVoting {
        id
      }
      directDemocracyVoting {
        id
      }
      taskManager {
        id
      }
      educationHub {
        id
      }
    }
  }
`;

// Fetch single organization by orgId (bytes)
export const FETCH_ORG_BY_ID = gql`
  query FetchOrgById($id: Bytes!) {
    organization(id: $id) {
      id
      name
      metadataHash
      deployedAt
      topHatId
      roleHatIds
      participationToken {
        id
        name
        symbol
        totalSupply
      }
      quickJoin {
        id
      }
      hybridVoting {
        id
        quorum
      }
      directDemocracyVoting {
        id
        quorumPercentage
      }
      taskManager {
        id
        projects {
          id
          title
          deleted
        }
      }
      educationHub {
        id
        nextModuleId
      }
      executorContract {
        id
      }
      users {
        id
        address
        username
        participationTokenBalance
        membershipStatus
        currentHatIds
      }
      roles(where: { isUserRole: true }) {
        id
        hatId
        name
        image
        canVote
        isUserRole
      }
    }
  }
`;

// Fetch username from UniversalAccountRegistry
export const FETCH_USERNAME_NEW = gql`
  query FetchUsernameNew($id: Bytes!) {
    account(id: $id) {
      id
      username
    }
  }
`;

// Lookup account by username (returns address)
export const GET_ACCOUNT_BY_USERNAME = gql`
  query GetAccountByUsername($username: String!) {
    accounts(where: { username: $username }, first: 1) {
      id
      user
      username
    }
  }
`;

// Lookup multiple accounts by usernames (batch lookup)
export const GET_ACCOUNTS_BY_USERNAMES = gql`
  query GetAccountsByUsernames($usernames: [String!]!) {
    accounts(where: { username_in: $usernames }) {
      id
      user
      username
    }
  }
`;

// Lookup organization by name (returns ID for further queries)
export const GET_ORG_BY_NAME = gql`
  query GetOrgByName($name: String!) {
    organizations(where: { name: $name }, first: 1) {
      id
      name
    }
  }
`;

// Fetch full organization data
export const FETCH_ORG_FULL_DATA = gql`
  query FetchOrgFullData($orgId: Bytes!) {
    organization(id: $orgId) {
      id
      name
      metadataHash
      metadata {
        id
        description
        template
        links {
          name
          url
          index
        }
      }
      deployedAt
      topHatId
      roleHatIds
      participationToken {
        id
        name
        symbol
        totalSupply
      }
      quickJoin {
        id
      }
      hybridVoting {
        id
        quorum
      }
      directDemocracyVoting {
        id
        quorumPercentage
      }
      taskManager {
        id
        creatorHatIds
        projects(where: { deleted: false }, first: 100) {
          id
          tasks(first: 200) {
            id
            status
          }
        }
      }
      educationHub {
        id
        modules {
          id
          moduleId
          title
          contentHash
          payout
          status
          completions {
            learner
          }
        }
      }
      executorContract {
        id
      }
      users(orderBy: participationTokenBalance, orderDirection: desc, first: 100) {
        id
        address
        username
        participationTokenBalance
        membershipStatus
        currentHatIds
        totalTasksCompleted
        totalVotes
        firstSeenAt
      }
      roles(where: { isUserRole: true }) {
        id
        hatId
        name
        image
        canVote
        isUserRole
        hat {
          name
        }
      }
    }
  }
`;

// Fetch voting data (proposals for both hybrid and DD voting)
export const FETCH_VOTING_DATA_NEW = gql`
  query FetchVotingDataNew($orgId: Bytes!) {
    organization(id: $orgId) {
      id
      hybridVoting {
        id
        quorum
        votingClasses(where: { isActive: true }, orderBy: classIndex, orderDirection: asc) {
          id
          classIndex
          strategy
          slicePct
          quadratic
          minBalance
          asset
          hatIds
          isActive
        }
        proposals(orderBy: startTimestamp, orderDirection: desc, first: 50) {
          id
          proposalId
          title
          descriptionHash
          numOptions
          startTimestamp
          endTimestamp
          status
          winningOption
          isValid
          wasExecuted
          isHatRestricted
          restrictedHatIds
          votes {
            voter
            voterUsername
            optionIndexes
            optionWeights
            classRawPowers
            votedAt
          }
        }
      }
      directDemocracyVoting {
        id
        quorumPercentage
        ddvProposals(orderBy: startTimestamp, orderDirection: desc, first: 50) {
          id
          proposalId
          title
          descriptionHash
          numOptions
          startTimestamp
          endTimestamp
          status
          winningOption
          isValid
          isHatRestricted
          restrictedHatIds
          votes {
            voter
            optionIndexes
            optionWeights
          }
        }
      }
    }
  }
`;

// Fetch projects and tasks data
export const FETCH_PROJECTS_DATA_NEW = gql`
  query FetchProjectsDataNew($orgId: Bytes!) {
    organization(id: $orgId) {
      id
      taskManager {
        id
        creatorHatIds
        projects(where: { deleted: false }, first: 50) {
          id
          title
          metadataHash
          cap
          createdAt
          rolePermissions {
            hatId
            canCreate
            canClaim
            canReview
            canAssign
          }
          tasks(first: 100) {
            id
            taskId
            title
            metadataHash
            payout
            bountyToken
            bountyPayout
            status
            assignee
            assigneeUsername
            completer
            completerUsername
            requiresApplication
            createdAt
            assignedAt
            submittedAt
            completedAt
            applications {
              applicant
              approved
            }
          }
        }
      }
    }
  }
`;

// Fetch user data within an organization
export const FETCH_USER_DATA_NEW = gql`
  query FetchUserDataNew($orgUserID: String!, $userAddress: Bytes!) {
    user(id: $orgUserID) {
      id
      address
      username
      participationTokenBalance
      membershipStatus
      currentHatIds
      joinMethod
      totalTasksCompleted
      totalVotes
      totalModulesCompleted
      firstSeenAt
      lastActiveAt
      assignedTasks(first: 20) {
        id
        taskId
        title
        payout
        status
      }
      completedTasks(first: 20) {
        id
        taskId
        title
        payout
      }
      hybridProposalsCreated(first: 20) {
        id
        proposalId
        title
        status
        startTimestamp
        endTimestamp
      }
      modulesCompleted(first: 20) {
        moduleId
        completedAt
      }
    }
    account(id: $userAddress) {
      id
      username
    }
  }
`;

// Fetch education hub data
export const FETCH_EDUCATION_DATA = gql`
  query FetchEducationData($orgId: Bytes!) {
    organization(id: $orgId) {
      id
      educationHub {
        id
        modules(first: 50) {
          id
          moduleId
          title
          contentHash
          payout
          status
          createdAt
          completions {
            learner
            completedAt
          }
        }
      }
    }
  }
`;

// Fetch organization structure data for /org-structure page
export const FETCH_ORG_STRUCTURE_DATA = gql`
  query FetchOrgStructureData($orgId: Bytes!) {
    organization(id: $orgId) {
      id
      name
      metadataHash
      metadata {
        id
        description
        template
        links {
          name
          url
        }
      }
      deployedAt
      topHatId
      roleHatIds

      roles(where: { isUserRole: true }) {
        id
        hatId
        name
        image
        canVote
        isUserRole
        hat {
          hatId
          parentHatId
          level
          defaultEligible
          mintedCount
          name
          metadataCID
          metadataUpdatedAt
          metadataUpdatedAtBlock
          wearers {
            wearer
            wearerUsername
            eligible
            standing
          }
          vouchConfig {
            enabled
            quorum
            membershipHatId
          }
        }
        permissions {
          permissionRole
          contractType
          allowed
        }
        wearers {
          wearer
          wearerUsername
          isActive
        }
      }

      hybridVoting {
        id
        quorum
      }

      directDemocracyVoting {
        id
        quorumPercentage
      }

      hatPermissions {
        hatId
        permissionRole
        contractType
        allowed
      }

      users(first: 200) {
        id
        address
        username
        participationTokenBalance
        membershipStatus
        currentHatIds
        totalTasksCompleted
        totalVotes
        firstSeenAt
        lastActiveAt
      }

      quickJoin {
        id
      }

      taskManager {
        id
      }

      educationHub {
        id
      }

      executorContract {
        id
      }

      participationToken {
        id
        name
        symbol
        totalSupply
      }

      eligibilityModule {
        id
      }
    }
  }
`;

// Fetch infrastructure contract addresses from the subgraph
// This replaces hardcoded addresses with dynamic lookups
// Fetches: PoaManager (with infrastructure proxies), OrgRegistry, UniversalAccountRegistry, and all Beacons
export const FETCH_INFRASTRUCTURE_ADDRESSES = gql`
  query FetchInfrastructureAddresses {
    universalAccountRegistries(first: 1) {
      id
      totalAccounts
    }
    poaManagerContracts(first: 1) {
      id
      registry
      # Infrastructure proxy addresses (the actual contracts to call)
      orgDeployerProxy
      orgRegistryProxy
      paymasterHubProxy
      globalAccountRegistryProxy
    }
    orgRegistryContracts(first: 1) {
      id
      totalOrgs
    }
    beacons {
      id
      typeName
      beaconAddress
      currentImplementation
      version
    }
  }
`;

// ============================================
// TOKEN REQUEST QUERIES
// ============================================

// Fetch pending token requests for approvers to review
export const FETCH_PENDING_TOKEN_REQUESTS = gql`
  query FetchPendingTokenRequests($tokenAddress: String!) {
    tokenRequests(
      where: { participationToken: $tokenAddress, status: Pending }
      orderBy: createdAt
      orderDirection: desc
      first: 100
    ) {
      id
      requestId
      requester
      amount
      ipfsHash
      status
      createdAt
      createdAtBlock
      transactionHash
    }
  }
`;

// Fetch a user's own token request history
export const FETCH_USER_TOKEN_REQUESTS = gql`
  query FetchUserTokenRequests($tokenAddress: String!, $userAddress: Bytes!) {
    tokenRequests(
      where: { participationToken: $tokenAddress, requester: $userAddress }
      orderBy: createdAt
      orderDirection: desc
      first: 50
    ) {
      id
      requestId
      amount
      ipfsHash
      status
      createdAt
      approvedAt
      cancelledAt
      approver
      transactionHash
    }
  }
`;

// Fetch all token requests for an organization (admin view)
export const FETCH_ALL_TOKEN_REQUESTS = gql`
  query FetchAllTokenRequests($tokenAddress: String!) {
    tokenRequests(
      where: { participationToken: $tokenAddress }
      orderBy: createdAt
      orderDirection: desc
      first: 100
    ) {
      id
      requestId
      requester
      amount
      ipfsHash
      status
      createdAt
      approvedAt
      cancelledAt
      approver
      transactionHash
    }
  }
`;

// Fetch approver hat permissions for a participation token
export const FETCH_TOKEN_APPROVER_HATS = gql`
  query FetchTokenApproverHats($tokenAddress: Bytes!) {
    hatPermissions(
      where: { contractAddress: $tokenAddress, permissionRole: Approver, allowed: true }
    ) {
      hatId
      permissionRole
      allowed
    }
  }
`;
