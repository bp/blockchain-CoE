## Development stack
1. Next.js
2. Nodejs v14
3. MongoDB
4. Truffle
5. Docker
6. Git
7. Lerna


## Prerequisite

This application runs in docker containers so you will need Docker and docker-compose installed and must allocate 12 GB of RAM and 4 GB of swap to the Docker. If enough resources are not allocated to docker, zokrates worker will not work as expected. We also recommend allocating at least 8 cores to Docker if you are running in a virtual linux environment (e.g. on a Mac).

Note: This application has tested only on MacBook pro and Windows isn't supported.

Make sure you have node.js version 14 installed as well.

## Getting Started

1. Clone the repository `https://github.com/EYBlockchain/Climate-DAO/`
2. CD to Climate-DAO and Run `npm i`.
3. Run `npx lerna bootstrap --hoist` to install all the dependent node-modules unders /packages/* to the root folder.

<img src=./docs/readmeFiles/dir.png width=1000px>

4. Run `npm install truffle -g` to install truffle.
5. Set up the environment file `.env` as described [below](#environment).
6. Run `docker-compose up`. Wait until all services are up.
   Note: When you run `docker-compose up` for the first time zokrates-worker will run the circuit set up to generate the proving key and verification key. Wait until the circuit set up is completed before proceeding to next step. The below mentioned message will be printed to the logs once the circuit set up has been completed.

<img src=./docs/readmeFiles/setup-logs.png width=1000px>

7. Copy the file docker-compose.example.override.yml in root directory and save as docker-compose.override.yml

8. Run `truffle migrate -f 1 --to 1 --network ropsten` to deploy the contracts. This will deploy a USDCStub and climate dao contract. Copy the usdcStub and climateDao contract address from the truffle logs and update the env variables in docker-compose.override.yml for both ui and api services.

9. If you haven't already, create an account in [https://infura.io/](https://infura.io/) to get the ropsten endpoint. Update the `JSON_RPC` and `INFURA_PROJECTID` in the docker-compose.override.yml. Be sure to enable Infura ITX in your settings and add the address and private key you used to sign up to `ITX_ADDRESS` and `ITX_PRIVATE_KEY` respectively. The `CHAIN_ID` is 3 for Ropsten, 1 for Mainnet.
10. Hit Control+C to stop the services and run `docker-compose up` again to pick the update environment variables
11. Application can be accessed using [http://localhost:3000](http://localhost:3000)

## Environment

This application refers to environment variables (some secret) stored in a `.env` file. See `.env.sample` for an example. You will need these variables:

 - `JSON_RPC` - the URL for blockchain provider. When using ganache, this is `http://localhost:8545`, but for ropsten you will need an Infura account.

 Create an account in [https://infura.io/](https://infura.io/) to get the URL, which will look like `https://ropsten.infura.io/v3/<some project id>`. Also add the `ws` version (`wss://ropsten.infura.io/ws/v3/...`) to `JSON_RPC_WS`.
  - `ADMIN_PRIVATE_KEY` - an Ethereum private key for the deployer and owner of the Climate DAO contract.

  - `ADMIN_ADDRESS` - the Ethereum address corresponding to the private key above.

## Smart Contract Test

Make sure you have completed all the steps in 'Getting Started' section.

Run `docker-compose up` then `truffle test test/climateZKP.js --network development --compile-none`

This will test the smart contract throughout the voting process, from deployment to voting to tallying. It requires a valid proof to distribute the final tally, so it must call `generate-proof` which can take around **10 minutes** to complete.

You can skip this step by commenting out (or adding `.skip` in front of) the generate proof *and* verify tally tests.

The other truffle tests cover edge cases. To test the contract correctly handles the voting process if cancelled run:

`truffle test test/climateCancel.js --network development --compile-none`

And, to test changing start and end times of the voting process, run:

`truffle test test/climateTiming.js --network development --compile-none`

All of the above tests work with the ropsten testnet `--network ropsten` as well. Make sure to replace the values `JSON_RPC`, `ADMIN_PRIVATE_KEY`, and `ADMIN_ADDRESS` in the `.env` file before proceeding.

Two additional addresses, a voter Alice (currently `0xE657bf2Bf2576a39f593C9423c08c43766509213`), and a non-voter Eve (currently `0x607543df950f75a1adcBe0784D343dBdD83a4BfA`) need a small amount of eth to pay for gas fees during these tests on ropsten.

## Postman Api Testing

1. Import the postman collection that contains `Climate-DAO.postman_collection.json` to your postman application.
2. Login to the Climate-DAO Application from the browser, so that Cookies gets set, which the postman could use for its requests as well.
   Note: Since User Authentication involves user signing up the message via metamask, it is recommended to login from the application before using postman api's.
3. Install `Postman Interceptor` Chrome Plugin if you are using Postman from chrome or turn on the `Postman Interceptor` from the Postman application.

## High Level Architecture
[bp Climate DAO - Architecture.pdf](./docs/architecture/bp%20Climate%20DAO%20-%20Architecture.pdf)

## ZKP Protocol
[bp-EY-ZKP-Protocol.pdf](./docs/bp-EY-ZKP-Protocol.pdf)

## User Contribution Flow
[user-contribution-flow.pdf](./docs/user-contribution-flow.pdf)

## Smart Contract
[Smart contract function diagram](./docs/architecture/climateDAO-contract-diagram.png)

## Dev deployment steps
[dev.deployment.md](./docs/dev.deployment.md)

## Production deployment steps
[prod.deployment.md](./docs/prod.deployment.md)

## Contributing
   We have integrated [commitlint](https://github.com/conventional-changelog/commitlint),
   so make sure to use proper method for commit messages. eg `git commit -m "fix: fix login bug"`
