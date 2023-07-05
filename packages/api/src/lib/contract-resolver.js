import { ethers } from 'ethers';
import { getInfuraProvider } from './ethers-local';
export default class ContractResolver {
  constructor(contractAddress, chainId, abi, privateKey) {
    this.chainId = chainId;
    const provider = getInfuraProvider();
    this.provider = provider;
    this.interface = new ethers.utils.Interface(abi);
    this.contract = new ethers.Contract(contractAddress, abi, provider);
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, provider);
    }
  }
}
