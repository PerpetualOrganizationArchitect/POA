/**
 * EducationService
 * Handles Education Hub operations for learning modules
 */

import EducationHubABI from '../../../../abi/EducationHubNew.json';
import { stringToBytes, ipfsCidToBytes32, parseModuleId } from '../utils/encoding';
import {
  requireAddress,
  requireString,
  requireNonNegativeNumber,
} from '../utils/validation';

/**
 * EducationService - Learning module management
 */
export class EducationService {
  /**
   * @param {ContractFactory} contractFactory - Contract factory instance
   * @param {TransactionManager} transactionManager - Transaction manager instance
   * @param {Object} ipfsService - IPFS service for content storage
   */
  constructor(contractFactory, transactionManager, ipfsService = null) {
    this.factory = contractFactory;
    this.txManager = transactionManager;
    this.ipfs = ipfsService;
  }

  /**
   * Create an education module
   * @param {string} contractAddress - EducationHub contract address
   * @param {Object} moduleData - Module data
   * @param {string} moduleData.name - Module name
   * @param {string} moduleData.description - Module description
   * @param {string[]} moduleData.quiz - Quiz questions
   * @param {string[][]} moduleData.answers - Possible answers for each question
   * @param {number[]} moduleData.correctAnswers - Correct answer indices
   * @param {number} moduleData.payout - Completion payout
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async createModule(contractAddress, moduleData, options = {}) {
    requireAddress(contractAddress, 'EducationHub contract address');
    requireString(moduleData.name, 'Module name');
    requireNonNegativeNumber(moduleData.payout, 'Payout');

    const {
      name,
      description = '',
      quiz = [],
      answers = [],
      correctAnswers = [],
      payout,
    } = moduleData;

    // Upload module content to IPFS if service available
    let contentHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    if (this.ipfs) {
      const ipfsData = {
        name,
        description,
        quiz,
        answers,
      };
      const ipfsResult = await this.ipfs.addToIpfs(JSON.stringify(ipfsData));
      contentHash = ipfsCidToBytes32(ipfsResult.path);
    }

    const contract = this.factory.createWritable(contractAddress, EducationHubABI);

    const titleBytes = stringToBytes(name);

    return this.txManager.execute(
      contract,
      'createModule',
      [titleBytes, contentHash, correctAnswers, payout],
      options
    );
  }

  /**
   * Complete a module (submit quiz answers)
   * @param {string} contractAddress - EducationHub contract address
   * @param {string|number} moduleId - Module ID
   * @param {number[]} answers - User's answer indices
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async completeModule(contractAddress, moduleId, answers, options = {}) {
    requireAddress(contractAddress, 'EducationHub contract address');

    const contract = this.factory.createWritable(contractAddress, EducationHubABI);
    const parsedModuleId = parseModuleId(moduleId);

    // Convert answers to numbers
    const answerIndices = answers.map(a => Number(a));

    return this.txManager.execute(
      contract,
      'completeModule',
      [parsedModuleId, answerIndices],
      options
    );
  }
}

/**
 * Create an EducationService instance
 * @param {ContractFactory} factory - Contract factory
 * @param {TransactionManager} txManager - Transaction manager
 * @param {Object} [ipfsService] - IPFS service
 * @returns {EducationService}
 */
export function createEducationService(factory, txManager, ipfsService = null) {
  return new EducationService(factory, txManager, ipfsService);
}
