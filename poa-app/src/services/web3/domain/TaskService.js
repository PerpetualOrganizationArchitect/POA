/**
 * TaskService
 * Handles Task Manager operations for projects and tasks
 */

import { ethers } from 'ethers';
import TaskManagerABI from '../../../../abi/TaskManagerNew.json';
import {
  stringToBytes,
  stringToBytes32,
  ipfsCidToBytes32,
  parseTaskId,
  parseProjectId,
} from '../utils/encoding';
import {
  requireAddress,
  requireString,
  requireValidPayout,
} from '../utils/validation';
import { getTokenByAddress } from '../../../util/tokens';

/**
 * TaskService - Project and task management
 */
export class TaskService {
  /**
   * @param {ContractFactory} contractFactory - Contract factory instance
   * @param {TransactionManager} transactionManager - Transaction manager instance
   * @param {Object} ipfsService - IPFS service for metadata storage
   */
  constructor(contractFactory, transactionManager, ipfsService = null) {
    this.factory = contractFactory;
    this.txManager = transactionManager;
    this.ipfs = ipfsService;
  }

  // ============================================
  // Project Functions
  // ============================================

  /**
   * Create a new project
   * @param {string} contractAddress - TaskManager contract address
   * @param {Object} projectData - Project data
   * @param {string} projectData.name - Project name
   * @param {string} [projectData.metadataHash=''] - IPFS metadata hash
   * @param {number} [projectData.cap=0] - Task cap (0 = unlimited)
   * @param {string[]} [projectData.managers=[]] - Manager addresses
   * @param {number[]} [projectData.createHats=[]] - Hat IDs for create permission
   * @param {number[]} [projectData.claimHats=[]] - Hat IDs for claim permission
   * @param {number[]} [projectData.reviewHats=[]] - Hat IDs for review permission
   * @param {number[]} [projectData.assignHats=[]] - Hat IDs for assign permission
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async createProject(contractAddress, projectData, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');
    requireString(projectData.name, 'Project name');

    const {
      name,
      metadataHash = '',
      cap = 0,
      managers = [],
      createHats = [],
      claimHats = [],
      reviewHats = [],
      assignHats = [],
    } = projectData;

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);

    const titleBytes = stringToBytes(name);
    const metaHash = metadataHash ? stringToBytes32(metadataHash) : ethers.constants.HashZero;

    // Debug logging
    console.log('=== createProject DEBUG ===');
    console.log('Contract address:', contractAddress);
    console.log('Name:', name);
    console.log('Title bytes:', titleBytes);
    console.log('Title bytes length:', titleBytes?.length || 'undefined');
    console.log('Metadata hash:', metaHash);
    console.log('Cap (raw):', cap);
    console.log('Cap (toString):', cap?.toString?.() || cap);
    console.log('Cap type:', typeof cap);
    console.log('Managers:', managers);
    console.log('CreateHats:', createHats);
    console.log('ClaimHats:', claimHats);
    console.log('ReviewHats:', reviewHats);
    console.log('AssignHats:', assignHats);
    console.log('=== END DEBUG ===');

    return this.txManager.execute(
      contract,
      'createProject',
      [titleBytes, metaHash, cap, managers, createHats, claimHats, reviewHats, assignHats],
      options
    );
  }

  /**
   * Delete a project
   * @param {string} contractAddress - TaskManager contract address
   * @param {string} projectId - Project ID (bytes32 or string)
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async deleteProject(contractAddress, projectId, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const pid = parseProjectId(projectId);

    return this.txManager.execute(
      contract,
      'deleteProject',
      [pid],
      { ...options, isDelete: true }
    );
  }

  // ============================================
  // Task Functions
  // ============================================

  /**
   * Create a new task
   * @param {string} contractAddress - TaskManager contract address
   * @param {Object} taskData - Task data
   * @param {number} taskData.payout - Payout amount
   * @param {string} taskData.name - Task name
   * @param {string} taskData.description - Task description
   * @param {string} taskData.projectId - Project ID (bytes32 or string)
   * @param {string} [taskData.location=''] - Task location
   * @param {string} [taskData.difficulty='medium'] - Task difficulty
   * @param {number} [taskData.estHours=0] - Estimated hours
   * @param {string} [taskData.bountyToken=AddressZero] - Bounty token address
   * @param {number} [taskData.bountyPayout=0] - Bounty payout
   * @param {boolean} [taskData.requiresApplication=false] - Requires application
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async createTask(contractAddress, taskData, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');
    requireString(taskData.name, 'Task name');
    requireValidPayout(taskData.payout);

    const {
      payout,
      name,
      description = '',
      projectId,
      location = '',
      difficulty = 'medium',
      estHours = 0,
      bountyToken = ethers.constants.AddressZero,
      bountyPayout = 0,
      requiresApplication = false,
    } = taskData;

    // Upload metadata to IPFS if service available
    let metadataHash = ethers.constants.HashZero;
    if (this.ipfs) {
      const ipfsData = {
        name,
        description,
        location,
        difficulty,
        estHours,
        submission: '',
      };
      const ipfsResult = await this.ipfs.addToIpfs(JSON.stringify(ipfsData));
      metadataHash = ipfsCidToBytes32(ipfsResult.path);
    }

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);

    const titleBytes = stringToBytes(name);
    const pid = parseProjectId(projectId);

    // Convert payout to wei (18 decimals for participation token)
    const payoutWei = ethers.utils.parseUnits(payout.toString(), 18);

    // Convert bounty payout to wei based on token decimals
    let bountyPayoutWei = 0;
    if (bountyPayout && Number(bountyPayout) > 0 && bountyToken !== ethers.constants.AddressZero) {
      const tokenInfo = getTokenByAddress(bountyToken);
      bountyPayoutWei = ethers.utils.parseUnits(bountyPayout.toString(), tokenInfo.decimals);
    }

    // Debug logging
    console.log('=== createTask DEBUG ===');
    console.log('Contract address:', contractAddress);
    console.log('Task name:', name);
    console.log('Title bytes:', titleBytes);
    console.log('Title bytes length:', titleBytes?.length || 'undefined');
    console.log('Metadata hash:', metadataHash);
    console.log('Project ID (raw):', projectId);
    console.log('Project ID (parsed):', pid);
    console.log('Payout (raw):', payout);
    console.log('Payout (wei):', payoutWei?.toString?.() || payoutWei);
    console.log('Bounty token:', bountyToken);
    console.log('Bounty payout (raw):', bountyPayout);
    console.log('Bounty payout (wei):', bountyPayoutWei?.toString?.() || bountyPayoutWei);
    console.log('Requires application:', requiresApplication);
    console.log('=== END createTask DEBUG ===');

    return this.txManager.execute(
      contract,
      'createTask',
      [payoutWei, titleBytes, metadataHash, pid, bountyToken, bountyPayoutWei, requiresApplication],
      options
    );
  }

  /**
   * Claim a task
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async claimTask(contractAddress, taskId, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);

    console.log("Claiming task with ID:", parsedTaskId);

    return this.txManager.execute(contract, 'claimTask', [parsedTaskId], options);
  }

  /**
   * Submit a task for review
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {string} submissionCid - IPFS CID of submission metadata
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async submitTask(contractAddress, taskId, submissionCid, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);
    // submissionCid is an IPFS CID (Qm...), convert to bytes32 properly
    const submissionHash = ipfsCidToBytes32(submissionCid);

    console.log('=== submitTask DEBUG ===');
    console.log('Task ID (raw):', taskId);
    console.log('Task ID (parsed):', parsedTaskId);
    console.log('Submission CID:', submissionCid);
    console.log('Submission hash (bytes32):', submissionHash);
    console.log('=== END submitTask DEBUG ===');

    return this.txManager.execute(
      contract,
      'submitTask',
      [parsedTaskId, submissionHash],
      options
    );
  }

  /**
   * Complete/approve a task
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async completeTask(contractAddress, taskId, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);

    return this.txManager.execute(contract, 'completeTask', [parsedTaskId], options);
  }

  /**
   * Update a task
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {Object} updateData - Update data
   * @param {number} updateData.payout - New payout
   * @param {string} updateData.name - New name
   * @param {string} [updateData.metadataHash] - New metadata hash
   * @param {string} [updateData.bountyToken=AddressZero] - Bounty token
   * @param {number} [updateData.bountyPayout=0] - Bounty payout
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async updateTask(contractAddress, taskId, updateData, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');
    requireString(updateData.name, 'Task name');
    requireValidPayout(updateData.payout);

    const {
      payout,
      name,
      metadataHash,
      bountyToken = ethers.constants.AddressZero,
      bountyPayout = 0,
    } = updateData;

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);
    const titleBytes = stringToBytes(name);
    const metaHash = metadataHash ? stringToBytes32(metadataHash) : ethers.constants.HashZero;

    // Convert payout to wei (18 decimals for participation token)
    const payoutWei = ethers.utils.parseUnits(payout.toString(), 18);

    // Convert bounty payout to wei based on token decimals
    let bountyPayoutWei = 0;
    if (bountyPayout && Number(bountyPayout) > 0 && bountyToken !== ethers.constants.AddressZero) {
      const tokenInfo = getTokenByAddress(bountyToken);
      bountyPayoutWei = ethers.utils.parseUnits(bountyPayout.toString(), tokenInfo.decimals);
    }

    return this.txManager.execute(
      contract,
      'updateTask',
      [parsedTaskId, payoutWei, titleBytes, metaHash, bountyToken, bountyPayoutWei],
      options
    );
  }

  /**
   * Edit a task with IPFS metadata update
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {Object} taskData - Full task data
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async editTask(contractAddress, taskId, taskData, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');
    requireString(taskData.name, 'Task name');
    requireValidPayout(taskData.payout);

    const {
      payout,
      name,
      description = '',
      location = '',
      difficulty = 'medium',
      estHours = 0,
      bountyToken = ethers.constants.AddressZero,
      bountyPayout = 0,
    } = taskData;

    // Upload new metadata to IPFS if service available
    let metadataHash = ethers.constants.HashZero;
    if (this.ipfs) {
      const ipfsData = {
        name,
        description,
        location,
        difficulty,
        estHours,
        submission: '',
      };
      const ipfsResult = await this.ipfs.addToIpfs(JSON.stringify(ipfsData));
      metadataHash = ipfsCidToBytes32(ipfsResult.path);
    }

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);
    const titleBytes = stringToBytes(name);

    // Convert payout to wei (18 decimals for participation token)
    const payoutWei = ethers.utils.parseUnits(payout.toString(), 18);

    // Convert bounty payout to wei based on token decimals
    let bountyPayoutWei = 0;
    if (bountyPayout && Number(bountyPayout) > 0 && bountyToken !== ethers.constants.AddressZero) {
      const tokenInfo = getTokenByAddress(bountyToken);
      bountyPayoutWei = ethers.utils.parseUnits(bountyPayout.toString(), tokenInfo.decimals);
    }

    return this.txManager.execute(
      contract,
      'updateTask',
      [parsedTaskId, payoutWei, titleBytes, metadataHash, bountyToken, bountyPayoutWei],
      options
    );
  }

  /**
   * Cancel/delete a task
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async cancelTask(contractAddress, taskId, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);

    return this.txManager.execute(
      contract,
      'cancelTask',
      [parsedTaskId],
      { ...options, isDelete: true }
    );
  }

  // ============================================
  // Application Functions
  // ============================================

  /**
   * Apply for a task that requires application
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {Object} applicationData - Application data to upload to IPFS
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async applyForTask(contractAddress, taskId, applicationData, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');

    // Upload application to IPFS
    let applicationHash = ethers.constants.HashZero;
    if (this.ipfs && applicationData) {
      const ipfsResult = await this.ipfs.addToIpfs(JSON.stringify(applicationData));
      applicationHash = ipfsCidToBytes32(ipfsResult.path);
    }

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);

    return this.txManager.execute(
      contract,
      'applyForTask',
      [parsedTaskId, applicationHash],
      options
    );
  }

  /**
   * Approve an application for a task
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {string} applicantAddress - Address of applicant to approve
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async approveApplication(contractAddress, taskId, applicantAddress, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');
    requireAddress(applicantAddress, 'Applicant address');

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);

    return this.txManager.execute(
      contract,
      'approveApplication',
      [parsedTaskId, applicantAddress],
      options
    );
  }

  // ============================================
  // Assignment Functions
  // ============================================

  /**
   * Assign a task to a specific user
   * @param {string} contractAddress - TaskManager contract address
   * @param {string|number} taskId - Task ID
   * @param {string} assigneeAddress - Address to assign the task to
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async assignTask(contractAddress, taskId, assigneeAddress, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');
    requireAddress(assigneeAddress, 'Assignee address');

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);
    const parsedTaskId = parseTaskId(taskId);

    return this.txManager.execute(
      contract,
      'assignTask',
      [parsedTaskId, assigneeAddress],
      options
    );
  }

  /**
   * Create and immediately assign a task to a specific user
   * @param {string} contractAddress - TaskManager contract address
   * @param {Object} taskData - Task data (same as createTask)
   * @param {string} assigneeAddress - Address to assign the task to
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async createAndAssignTask(contractAddress, taskData, assigneeAddress, options = {}) {
    requireAddress(contractAddress, 'TaskManager contract address');
    requireAddress(assigneeAddress, 'Assignee address');
    requireString(taskData.name, 'Task name');
    requireValidPayout(taskData.payout);

    const {
      payout,
      name,
      description = '',
      projectId,
      location = '',
      difficulty = 'medium',
      estHours = 0,
      bountyToken = ethers.constants.AddressZero,
      bountyPayout = 0,
      requiresApplication = false,
    } = taskData;

    // Upload metadata to IPFS if service available
    let metadataHash = ethers.constants.HashZero;
    if (this.ipfs) {
      const ipfsData = {
        name,
        description,
        location,
        difficulty,
        estHours,
        submission: '',
      };
      const ipfsResult = await this.ipfs.addToIpfs(JSON.stringify(ipfsData));
      metadataHash = ipfsCidToBytes32(ipfsResult.path);
    }

    const contract = this.factory.createWritable(contractAddress, TaskManagerABI);

    const titleBytes = stringToBytes(name);
    const pid = parseProjectId(projectId);

    // Convert payout to wei (18 decimals for participation token)
    const payoutWei = ethers.utils.parseUnits(payout.toString(), 18);

    // Convert bounty payout to wei based on token decimals
    let bountyPayoutWei = 0;
    if (bountyPayout && Number(bountyPayout) > 0 && bountyToken !== ethers.constants.AddressZero) {
      const tokenInfo = getTokenByAddress(bountyToken);
      bountyPayoutWei = ethers.utils.parseUnits(bountyPayout.toString(), tokenInfo.decimals);
    }

    return this.txManager.execute(
      contract,
      'createAndAssignTask',
      [payoutWei, titleBytes, metadataHash, pid, assigneeAddress, bountyToken, bountyPayoutWei, requiresApplication],
      options
    );
  }
}

/**
 * Create a TaskService instance
 * @param {ContractFactory} factory - Contract factory
 * @param {TransactionManager} txManager - Transaction manager
 * @param {Object} [ipfsService] - IPFS service
 * @returns {TaskService}
 */
export function createTaskService(factory, txManager, ipfsService = null) {
  return new TaskService(factory, txManager, ipfsService);
}
