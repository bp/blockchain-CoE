import { ethers } from 'ethers';
import { getNetwork, chainId } from './lib/config';
import logger from './logger';
import queue from './lib/queue';
import climateJSON from '../artifacts/Climate.json';

/**
 * Connects to network using the given project id and the network
 *  and then sets proper handlers for events
 */
export const startConnection = async () => {
  const { infuraProjectId, climateDaoContractAddress } = getNetwork(chainId);
  const provider = new ethers.providers.InfuraWebSocketProvider(chainId, infuraProjectId);

  provider._websocket.on('open', async () => {
    logger.info(`WebSocket Connection established...`);
  });

  provider._websocket.on('error', async () => {
    logger.error(`Unable to connect webSocket, retrying in 5s...`);
    setTimeout(startConnection, 5000);
  });

  const filter = { address: climateDaoContractAddress };
  provider.on(filter, async (log) => {
    let iface = new ethers.utils.Interface(climateJSON.abi);
    let parsed = iface.parseLog(log);
    const [from, value] = parsed.args;

    const contractEvent = {
      eventName: parsed.name,
      data: {
        from: from,
        value: value.toString(),
        transactionHash: log.transactionHash,
        timestamp: Date.now()
      }
    };
    if (contractEvent) {
      await queue.sendToQueue(contractEvent);
      logger.info('Message Sent to bull MQ');
    }
  });

  /**
   * tries to establish connection in case if its disconnected
   * executes in a specific interval of time
   */
  provider._websocket.on('close', async (code) => {
    logger.info(`Connection lost with code ${code}! Attempting reconnect in 5s...`);
    provider._websocket.terminate();
    setTimeout(startConnection, 5000);
  });
};
