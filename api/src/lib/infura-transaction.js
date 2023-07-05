import { ethers } from 'ethers';
import { getInfuraProvider } from './ethers-local';
import logger from '../logger';

export default class InfuraTransaction {
  constructor(chainId, abi, itxAddress, itxPrivateKey) {
    this.chainId = chainId;
    this.itxAddress = itxAddress;
    const provider = getInfuraProvider();
    this.provider = provider;
    this.interface = new ethers.utils.Interface(abi);
    if (itxPrivateKey) {
      this.signer = new ethers.Wallet(itxPrivateKey, provider);
    }
  }

  /**
   * checks if the signing account has any gas tank balance registered with ITX
   * @returns the balance of the account
   */
  async getBalance() {
    return this.provider.send('relay_getBalance', [this.itxAddress]);
  }

  /**
   * checks if the relay request is mined
   * @param {String} relayTransactionHash - Relay transaction hash
   * @returns transaction receipt
   */
  async verifyItxTransaction(relayTransactionHash) {
    const statusResponse = await this.provider.send('relay_getTransactionStatus', [
      relayTransactionHash
    ]);

    if (statusResponse.broadcasts) {
      for (let i = 0; i < statusResponse.broadcasts.length; i++) {
        const bc = statusResponse.broadcasts[i];
        const receipt = await this.provider.getTransactionReceipt(bc.ethTxHash);
        if (receipt && receipt.confirmations && receipt.confirmations > 1) {
          // logger.info('receipt', receipt);
          logger.info(
            {
              msg: 'receipt',
              service: 'api'
            },
            receipt
          );
          return receipt;
        }
      }
    }
  }

  /**
   * Checks if the relay request is mined
   * @param {String} relayTransactionHash - Relay transaction hash
   * @returns transaction receipt
   */
  async getRelayTransactionStatus(relayTransactionHash) {
    const { broadcasts } = await this.provider.send('relay_getTransactionStatus', [
      relayTransactionHash
    ]);

    // check each of these hashes to see if their receipt exists and
    // has confirmations
    if (broadcasts) {
      for (const broadcast of broadcasts) {
        const { ethTxHash } = broadcast;
        const receipt = await this.provider.getTransactionReceipt(ethTxHash);
        if (receipt && receipt.confirmations && receipt.confirmations > 1) {
          // The transaction is now on chain!
          return receipt;
        }
      }
    }
  }

  /**
   * Signing a relay request and sending a transaction
   * @param {String} tx - transaction object
   * @returns relay Transaction Hash
   */
  async send(tx) {
    if (!tx) throw new Error('Relay transaction data missing');
    const relayTransactionHashToSign = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'bytes', 'uint', 'uint', 'string'],
        [tx.to, tx.data, tx.gas, this.chainId, tx.schedule]
      )
    );
    const itxSignature = await this.signer.signMessage(
      ethers.utils.arrayify(relayTransactionHashToSign)
    );
    return this.provider.send('relay_sendTransaction', [tx, itxSignature]);
  }
}
