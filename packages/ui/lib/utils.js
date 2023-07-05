import { ethers } from 'ethers';

export const getAddress = (address) => ethers.utils.getAddress(address);
