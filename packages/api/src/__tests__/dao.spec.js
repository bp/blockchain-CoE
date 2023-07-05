import request from 'supertest';
import { ethers } from 'ethers';
const randomBytes = require('randombytes');
const { CONSTANTS } = require('../__fixtures__/constants');
import app from '../app';
import { connectDB, disconnectDB, connectRedis } from '../../utils/test-utils/dbHandler.utils';
import {
  signTransferAuthorization,
  getSigningMessage,
  sendTransaction,
  verifyRelayTransaction
} from '../__fixtures__/helpers';

describe('Climate DAO Tests', () => {
  let climateDaoContractAddress;
  let relayTransactionHash;

  let owner = {
    address: process.env.ADMIN_ADDRESS,
    key: process.env.ADMIN_PRIVATE_KEY
  };

  let alice = {
    address: '0xaE782688108DC82D3563fE4CA78c679aE9613Ec1',
    key: '2787879db43d715f740305f2763c2e13dbae8eb7587ba49266615304a3994d58'
  };

  let bob = {
    address: '0x4Edd80557F2cc893de5397d0508efe7EcBa7B98d',
    key: 'dad57e191799c38233bb7897f5ca66eb42d4f2f6d05ec657f8121b57e5d3bde6'
  };

  let provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC);
  let aliceWallet = new ethers.Wallet(alice.key, provider);
  let ownerWallet = new ethers.Wallet(owner.key, provider);
  let bobWallet = new ethers.Wallet(bob.key, provider);
  let aliceToken;
  let ownerToken;
  let bobToken;
  let adminSignature;
  let userSignature;

  beforeAll(async () => {
    await connectDB();
    await connectRedis();
  });

  afterAll(async () => disconnectDB());

  it('Should get the deployed contract address', async () => {
    const res = await request(app).post('/sapi/contract').send({});
    expect(res.status).toEqual(200);
    climateDaoContractAddress = res.body.address;
    // usdcContractAddress = res.body.usdcAddress;
    process.env.CLIMATE_DAO_CONTRACT = climateDaoContractAddress;
    console.log('climateDaoContract Addr:', climateDaoContractAddress);
  });

  it('Should not create an user when address is not passed', async () => {
    const res = await request(app).post('/sapi/user').send({});
    expect(res.status).toEqual(400);
  });

  it('Should create an account for alice when address is passed', async () => {
    const res = await request(app).post('/sapi/user').send({ address: alice.address });
    expect(res.status).toEqual(201);
    alice = { ...alice, ...res.body.user };
  });

  it('Should create an account for bob when address is passed', async () => {
    const res = await request(app).post('/sapi/user').send({ address: bob.address });
    expect(res.status).toEqual(201);
    bob = { ...bob, ...res.body.user };
  });

  it('Should create an account for owner when address is passed', async () => {
    const res = await request(app).post('/sapi/user').send({ address: owner.address });
    expect(res.status).toEqual(201);
    owner = { ...owner, ...res.body.user };
  });

  it('Should change the role of owner to admin ', async () => {
    const res = await request(app).patch(`/sapi/user/${owner._id}`).send({ role: 'admin' });
    expect(res.status).toEqual(201);
    owner = { ...owner, ...res.body.user };
  });

  it('Login should fail when wrong nonce is passed', async () => {
    let message = getSigningMessage(12345, owner.address);
    let signature = await aliceWallet.signMessage(message);
    const res = await request(app).post('/sapi/login').send({ address: alice.address, signature });
    expect(res.status).toEqual(400);
  });

  it('Alice should be able to login when nonce is passed', async () => {
    let message = getSigningMessage(alice.nonce, alice.address);
    let signature = await aliceWallet.signMessage(message);
    const res = await request(app).post('/sapi/login').send({ address: alice.address, signature });
    aliceToken = res.headers['set-cookie'][0];
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        user: {
          _id: alice._id,
          address: alice.address,
          role: alice.role,
          kyc: 'Not Started'
        }
      })
    );
  });

  it('Bob should be able to login when nonce is passed', async () => {
    let message = getSigningMessage(bob.nonce, bob.address);
    let signature = await bobWallet.signMessage(message);
    const res = await request(app).post('/sapi/login').send({ address: bob.address, signature });
    bobToken = res.headers['set-cookie'][0];
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        user: {
          _id: bob._id,
          address: bob.address,
          role: bob.role,
          kyc: 'Not Started'
        }
      })
    );
  });

  it('Should have enough itx balance, for Bp to relay transaction', async () => {
    const res = await request(app)
      .get('/sapi/itx/balance')
      .set({ Cookie: [aliceToken] });
    expect(res.status).toEqual(200);
    expect(
      parseInt(ethers.utils.formatUnits(res.body.balance.toString(), 'ether'))
    ).toBeGreaterThan(0.2);
  });

  it('Alice should be able to add projects to the basket', async () => {
    const res = await request(app)
      .post('/sapi/basket')
      .set({ Cookie: [aliceToken] })
      .send({
        1: '1',
        2: '',
        3: '',
        4: '',
        5: ''
      });
    expect(res.status).toEqual(200);
  });

  it('Alice should not be able to contribute in an incorrect network', async () => {
    const { signature, data, domainData } = await signTransferAuthorization(
      owner.address,
      climateDaoContractAddress,
      CONSTANTS.contribution,
      0,
      1931525157,
      '0x' + randomBytes(32).toString('hex'),
      alice.key,
      CONSTANTS.usdcContractAddress
    );
    const domain = { ...domainData, chainId: 1332 };
    const res = await request(app)
      .post('/sapi/contribution')
      .set({ Cookie: [aliceToken] })
      .send({
        signature,
        votes: CONSTANTS.vote,
        contribution: CONSTANTS.contribution,
        data,
        domain
      });
    expect(res.status).toEqual(400);
  });

  it('Alice should not be able to contribute on behalf of others', async () => {
    const { signature, data, domain } = await signTransferAuthorization(
      owner.address,
      climateDaoContractAddress,
      CONSTANTS.contribution,
      0,
      1931525157,
      '0x' + randomBytes(32).toString('hex'),
      alice.key,
      CONSTANTS.usdcContractAddress
    );
    const res = await request(app)
      .post('/sapi/contribution')
      .set({ Cookie: [aliceToken] })
      .send({
        signature,
        votes: CONSTANTS.vote,
        contribution: CONSTANTS.contribution,
        data,
        domain
      });
    expect(res.status).toEqual(400);
    // expect(res.body.errors.data.from).toBe('invalid address');
  });

  it('Alice should be able to contribute during voting period', async () => {
    const { signature, data, domain } = await signTransferAuthorization(
      alice.address,
      climateDaoContractAddress,
      CONSTANTS.contribution,
      0,
      1931525157,
      '0x' + randomBytes(32).toString('hex'),
      alice.key,
      CONSTANTS.usdcContractAddress
    );
    const res = await request(app)
      .post('/sapi/contribution')
      .set({ Cookie: [aliceToken] })
      .send({
        signature,
        votes: CONSTANTS.vote,
        contribution: CONSTANTS.contribution,
        data,
        domain
      });
    relayTransactionHash = res.body.relayTransactionHash;
    expect(res.status).toEqual(201);
  });

  it('Alice should not be able to contribute again, if she has contributed already', async () => {
    const { signature, data, domain } = await signTransferAuthorization(
      alice.address,
      climateDaoContractAddress,
      CONSTANTS.contribution,
      0,
      1931525157,
      '0x' + randomBytes(32).toString('hex'),
      alice.key,
      CONSTANTS.usdcContractAddress
    );
    const res = await request(app)
      .post('/sapi/contribution')
      .set({ Cookie: [aliceToken] })
      .send({
        signature,
        votes: CONSTANTS.vote,
        contribution: CONSTANTS.contribution,
        data,
        domain
      });
    expect(res.body.errors).toEqual(['Only one contribution allowed per user']);
    expect(res.status).toEqual(400);
  });

  it('User should be able to see contributions details', async () => {
    const res = await request(app)
      .get('/sapi/contribution')
      .set({ Cookie: [aliceToken] });
    expect(res.status).toEqual(200);
    console.log('status before-', res.body.contribution.status);
    const actualValue = res.body.contribution;
    expect(actualValue.status).toBe('pending');
    expect(actualValue.relayTransactionHash).toBe(relayTransactionHash);
    expect(actualValue.data.value).toEqual(CONSTANTS.contribution);
  });

  it('Should update the db after the transaction gets mined', async () => {
    return verifyRelayTransaction(relayTransactionHash).then(async (result) => {
      const res = await request(app)
        .get('/sapi/contribution')
        .set({ Cookie: [aliceToken] });
      expect(res.status).toEqual(200);
      const actualValue = res.body.contribution;
      expect(actualValue.status).toBe('success');
      expect(actualValue.relayTransactionHash).toBe(relayTransactionHash);
      expect(actualValue.data.value).toEqual(CONSTANTS.contribution);
    });
  });

  it('Should be able to see successfull contribution', async () => {
    const res = await request(app).get('/sapi/contribution/succeeded');
    expect(res.status).toEqual(200);
    console.log('Contributions:::', res.body.count);
    expect(res.body.count).toEqual(1);
  });

  it('Owner should be able to login when nonce is passed', async () => {
    let message = getSigningMessage(owner.nonce, owner.address);
    let signature = await ownerWallet.signMessage(message);
    const res = await request(app).post('/sapi/login').send({ address: owner.address, signature });
    ownerToken = res.headers['set-cookie'][0];
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        user: {
          _id: owner._id,
          address: owner.address,
          role: owner.role,
          kyc: 'Not Started'
        }
      })
    );
  });

  it('Owner should be able to view matching pool', async () => {
    const res = await request(app)
      .get('/sapi/quadraticFunding')
      .set({ Cookie: [ownerToken] });
    expect(res.status).toEqual(200);
  });

  it('Bob should be able to contribute during voting period', async () => {
    const { signature, data, domain } = await signTransferAuthorization(
      bob.address,
      climateDaoContractAddress,
      CONSTANTS.contribution,
      0,
      1931525157,
      '0x' + randomBytes(32).toString('hex'),
      bob.key,
      CONSTANTS.usdcContractAddress
    );
    const res = await request(app)
      .post('/sapi/contribution/draft')
      .set({ Cookie: [bobToken] })
      .send({
        signature,
        votes: CONSTANTS.vote,
        contribution: CONSTANTS.contribution,
        data,
        domain
      });

    adminSignature = res.body.contribution.adminSignature;
    userSignature = signature;

    const transactionHash = await sendTransaction(data, userSignature, adminSignature);
    console.log('Transaction hash of Bob contribution:', transactionHash);
    expect(transactionHash).toBeTruthy();
    expect(res.status).toEqual(201);
  });

  it('Bob should be able to see contributions details', async () => {
    const res = await request(app)
      .get('/sapi/contribution')
      .set({ Cookie: [bobToken] });
    expect(res.status).toEqual(200);
    const actualValue = res.body.contribution;
    expect(actualValue.status).toBe('draft');
    expect(actualValue.data.value).toEqual(CONSTANTS.contribution);
  });

  //owner Functionalities
  it('Should fail if any user one other than admin try to cancel the contract', async () => {
    const res = await request(app)
      .post('/sapi/contract/cancel')
      .send({})
      .set({ Cookie: [aliceToken] });
    expect(res.status).toEqual(401);
    // expect(res.body.errors).toBe(['Unauthorized']);
  });

  //owner Functionalities
  it('Owner should be able cancel the active Climate DAO contract', async () => {
    const res = await request(app)
      .post('/sapi/contract/cancel')
      .send({})
      .set({ Cookie: [ownerToken] });
    expect(res.status).toEqual(200);
  });

  //TODO:include in the last, since voting period will be active during test
  /*
  it('Alice should not be able to contribute once the voting period is completed', async () => {
    const { signature, data, domain } = await signTransferAuthorization(
      alice.address,
      climateDaoContractAddress,
      CONSTANTS.contribution,
      0,
      1931525157,
      '0x' + randomBytes(32).toString('hex'),
      alice.key,
      CONSTANTS.usdcContractAddress
    );
    const res = await request(app)
      .post('/sapi/contribution')
      .set({ Cookie: [aliceToken] })
      .send({
        signature,
        votes: CONSTANTS.vote,
        contribution: CONSTANTS.contribution,
        data,
        domain
      });
    relayTransactionHash = res.body.relayTransactionHash;
    expect(res.status).toEqual(400);
    expect(res.body).toBe(['Can contribute only during voting period']);
  });

  it('Owner should be able to split the matching pool and return the quadratic breakdown for each of the projects', async () => {
    const res = await request(app)
      .post('/sapi/quadraticFunding')
      .set({ Cookie: [ownerToken] });
    expect(res.status).toEqual(200);
    expect(res.body.qfBreakdown.length).toBe(5);
  });
  */
});
