import { ethers } from 'ethers';
import { getAddress } from './utils';
import { chainId, climateDaoContractAddress } from './config';
import climateJSON from '../artifacts/ClimateDAO.json';

export default class Metamask {
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
  }

  async checkNetwork() {
    if (Number(window.ethereum.chainId) !== chainId) {
      throw new Error('Network not supported');
    }
  }

  async checkAddress(signerAddress, user) {
    if (getAddress(signerAddress) !== getAddress(user.address)) {
      throw new Error('Account mismatch');
    }
  }

  //currently checking if the user have atleast 0.5 ethers in his account
  async checkEtherBalance(signerAddress) {
    const etherBalance = await this.provider.getBalance(signerAddress);
    if (ethers.utils.formatUnits(etherBalance, 'ether') < 0.5) {
      throw new Error('no sufficient ether balance to perform transaction');
    }
  }

  async signMessage(signingMessage) {
    await this.checkNetwork();
    const signer = this.provider.getSigner();
    return signer.signMessage(signingMessage);
  }

  async signTypedData(domain, types, data, user) {
    const signerAddress = await this.createCustomConnection();
    await this.checkNetwork();
    await this.checkAddress(signerAddress, user);
    const signer = this.provider.getSigner();
    return signer._signTypedData(domain, types, data);
  }

  async createCustomConnection() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return ethers.utils.getAddress(accounts[0]);
  }

  /**
   * contribution to the projects with user himself paying the transaction fee,
   * which gets initiated directly via metamask
   *
   * @param {Object} user - logged in user data
   * @param {Object} data - transaction object
   * @param {String} userSignature - user signature
   * @param {String} adminSignature - admin signature
   */
  async sendTransaction(user, data, userSignature, adminSignature) {
    const signerAddress = await this.createCustomConnection();
    await this.checkNetwork();
    await this.checkAddress(signerAddress, user);
    try {
      const signer = this.provider.getSigner();
      const contractInstance = new ethers.Contract(
        climateDaoContractAddress,
        climateJSON.abi,
        signer
      );
      const { from, to, value, validAfter, validBefore, nonce } = data;

      const {
        v: ownerSigV,
        r: ownerSigR,
        s: ownerSigS
      } = ethers.utils.splitSignature(adminSignature);

      const { v, r, s } = ethers.utils.splitSignature(userSignature); //user signature

      return contractInstance.contributeSigned(
        from,
        to,
        value,
        validAfter,
        validBefore,
        nonce,
        [v, r, s],
        [ownerSigV, ownerSigR, ownerSigS]
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
