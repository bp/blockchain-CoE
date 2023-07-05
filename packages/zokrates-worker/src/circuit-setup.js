import fs from 'fs';

import logger from './logger';
import { getVerificationKeyByCircuit, generateKeys } from './services/key';

const { CIRCUITS_FOLDER } = process.env;

async function walk(dir) {
  let files = await fs.promises.readdir(dir);
  return files.filter((file) => file.includes('.zok'));
}

export default async function setupCircuits() {
  const circuitsToSetup = await walk(CIRCUITS_FOLDER);

  for (const circuit of circuitsToSetup) {
    logger.debug(`checking for existing setup for ${circuit}`);
    const vk = getVerificationKeyByCircuit(circuit);
    if (!vk) {
      logger.debug(
        `no existing verification key. Fear not, I will make a new one: calling generate keys on ${circuit}`
      );
      await generateKeys(circuit);
      logger.debug(` ${circuit} keys gemnration is complete`);
    } else logger.info(`${circuit} verification key exists: trusted setup skipped`);
  }
}
