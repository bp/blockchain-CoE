const { ClientSecretCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
import logger from '../logger';
import { azureKeyVaultUrl, azureTenantId, azureClientId, azureClientSecret } from './config';

/** * KEY VAULT ** */

const getKeyVaultClient = () => {
  if (azureKeyVaultUrl) {
    const credential = new ClientSecretCredential(azureTenantId, azureClientId, azureClientSecret);
    const keyVaultClient = new SecretClient(azureKeyVaultUrl, credential);

    if (keyVaultClient) {
      return keyVaultClient;
    }
  }
  throw Error('Unable to connect to key vault');
};

/**
 * Gets the latest version's secret value from KeyVault
 * @param secretName: key to find within the key vault
 * @returns secret found
 */
export const getSecret = (secretName) => {
  try {
    const keyVaultClient = getKeyVaultClient();
    return keyVaultClient.getSecret(secretName);
  } catch (err) {
    return {};
  }
};

/**
 * Stores an specific secret name with its value into the Azure Key Vault
 * @param secretName: key to store within the key vault
 * @param secretValue: value to store related to a key in the key vault
 * @returns stored secret
 */
export const storeSecret = (secretName, secretValue) => {
  try {
    const keyVaultClient = getKeyVaultClient();
    return keyVaultClient.setSecret(secretName.replace(/[@._/]/g, ''), secretValue);
  } catch (err) {
    // logger.error('ERROR at azure keyvault ', err);
    logger.error(
      {
        msg: 'ERROR at azure keyvault',
        service: 'api'
      },
      err
    );
    throw Error(`Unable to create secret key vault: ${JSON.stringify(err)}`);
  }
};

/**
 * Delete and purge an specific secret
 * @param secretName: key to store within the key vault
 * @returns operation result
 */
export const purgeSecret = async (secretName) => {
  try {
    const keyVaultClient = getKeyVaultClient();
    const deletePoller = await keyVaultClient.beginDeleteSecret(secretName);
    await deletePoller.pollUntilDone();
    return keyVaultClient.purgeDeletedSecret(secretName);
  } catch (err) {
    // logger.error('ERROR at key vault ', err);
    logger.error(
      {
        msg: 'ERROR at azure keyvault',
        service: 'api'
      },
      err
    );
    throw Error(`Unable to delete secret in key vault: ${secretName}`);
  }
};
