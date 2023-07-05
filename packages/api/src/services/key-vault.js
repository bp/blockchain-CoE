import { getSecret } from '../lib/azureKeyVault';
import { ENV, adminKey, itxKey } from '../lib/config';

export const getAdminKey = async () => {
  if (process.env.NODE_ENV === ENV.PROD) {
    const adminPrivateKey = await getSecret('OWNER-PRIVATE-KEY');
    return {
      address: adminKey.address,
      key: adminPrivateKey.value
    };
  } else {
    return adminKey;
  }
};

export const getItxKey = async () => {
  if (process.env.NODE_ENV === ENV.PROD) {
    const itxPrivateKey = await getSecret('ITX-PRIVATE-KEY');
    return {
      address: itxKey.address,
      key: itxPrivateKey.value
    };
  } else {
    return itxKey;
  }
};
