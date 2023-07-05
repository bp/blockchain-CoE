import express from 'express';

import setupCircuits from './circuit-setup';
import logger from './logger';
import generateProof from './services/proof';
import computeWitness from './services/witness';
import { confirmProofGeneration } from './lib/utils';

const port = 8001;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/test', function (req, res) {
  res.send('welcome');
});

app.post('/proof', async function (req, res) {
  try {
    const proofData = await generateProof(req.body);
    return res.status(200).json({ ...proofData });
  } catch (error) {
    logger.error('Error in proof route', error.message);
    return res.status(400).json({ errors: error.message });
  }
});

app.post('/witness', async function (req, res) {
  try {
    const witness = await computeWitness(req.body);
    return res.status(200).json({ ...witness });
  } catch (error) {
    logger.error('Error in witness route', error.message);
    return res.status(400).json({ errors: error.message });
  }
});

app.post('/generate-proof/:climateDaoContractAddress', async function (req, res) {
  try {
    const { climateDaoContractAddress } = req.params;
    if (!climateDaoContractAddress) {
      throw new Error('Climate dao address is missing');
    }
    confirmProofGeneration(req.body, climateDaoContractAddress);
    return res.status(200).json({ data: 'inprogress' });
  } catch (error) {
    logger.error('Error in generate-proof route', error.message);
    return res.status(400).json({ errors: error.message });
  }
});

const main = async () => {
  await setupCircuits();
  app.listen(port, async () => {
    logger.info(`zokrates-worker listening on port: ${port}`);
  });
};

main();
