import { getItxKey } from './key-vault';
import InfuraTransaction from '../lib/infura-transaction';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import { chainId } from '../lib/config';

export const getItxBalance = async () => {
  const { address: itxAddress, key: itxPrivateKey } = await getItxKey();
  const infuraTransaction = new InfuraTransaction(
    chainId,
    climateDaoJson.abi,
    itxAddress,
    itxPrivateKey
  );
  return infuraTransaction.getBalance();
};
