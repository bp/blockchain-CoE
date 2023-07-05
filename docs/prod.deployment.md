## Prerequisite
This document assumes 
1. You have an azure cloud environment set up with below services deployed.
  - AKS with a minimum of 3 nodes (8 core, 16 GB memory each)
  - Azure redis cache
  - Azure key vault
  - Cosmos DB
2. Ingress controller is deployed to the AKS
3. Have a github package registry to store docker images
4. Cosmos DB aggregation pipeline is enabled and collections are indexed

## Steps to deploy application to AKS

### Create an admin Ethereum wallet.

   Create an admin wallet using metamask. This wallet requires some Eth to deploy contract and perform admin activities. 
   bp will transfer $15k+ equivalent of Ether to Admin wallet. EY will then deposit $10K equivalent of Ether to ITX contract.
   (see details on ITX below).

### Create an infura account.

   We are using infura to interact with Ethereum blockchain. Follow the below steps to get started with infura.
   1. Create an account in [https://infura.io/](infura).
   2. Create a project and enable the Infura transaction services (ITX). The project will provide end point to interact with Ethereum. 
      ITX is a service provided by infura to send relay transactions.

### Create an ITX wallet using metamask.

   Create an ITX wallet using metamask. ITX wallet is used only to prove we own that ITX wallet private key to send a relay transaction.
   We do not need to transfer Ether directly to it.
   To perform relay transaction we need to deposit Ether to ITX contract calling (https://etherscan.io/address/0x015c7c7a7d65bbdb117c573007219107bd7486f9#writeContract)[depositFor] method in the ITX contract. 
   EY will deposit $10K equivalent of Ether to ITX contract by using funds in Admin wallet.
   Follow this documentation [https://infura.io/docs/transactions](ITX) to fund ether to the ITX contract. This Ether will be used
   for paying gas fee on behalf of the user.

### Set up an Accuant account for KYC.

   We need to connect with Accuant to set this up. 
   1. Create Accuant go form with template "Public data + Doc auth". Sample form used for dev environment 
      [kyc form](https://go-stg.acuant.com/accounts/plugin/update_form/kyc-free/2624). Production form will be same as dev.
   2. Register callback url in [merchant preferences](https://staging.identitymind.com/merchantedna/#!admin) 
   3. Blacklist countries in [merchant preferences](https://staging.identitymind.com/merchantedna/#!admin) 

### Add Admin and ITX private keys to key vault.

   For relaying we need to use Admin and ITX private keys to sign authorization and sign transaction respectively. So create two secrets 
   manually in azure key vault with below secret names.

   1. ADMIN_PRIVATE_KEY: '************'
   2. ITX_PRIVATE_KEY: '*****'

### Clone the repo

   1. Clone the repository `https://github.com/EYBlockchain/Climate-DAO/`
   2. CD to Climate-DAO/manifests/dev

### Build the images and push to container/github registry

Build all the four images and push to registry.
   1. prod.ui.Dockerfile
   2. prod.api.Dockerfile
   3. prod.listener.Dockerfile
   4. prod.zokrates.Dockerfile
### Login to azure using azure cli and set context

1. Install azure cli [install-azure-cli-macos](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-macos)
2. Run `az login`. This open a browser window where you need to login in to your azure account. Based on the security configured in
   azure, you might need to perform some additional steps.
3. Get access credentials for a managed Kubernetes cluster by running 
   `az aks get-credentials --name MyManagedCluster --resource-group MyResourceGroup --subscription MySubscription
4. Verify the current context is set to your AKS cluster by running `kubectl get pods --all-namespaces`.

### Deploy to kubernetes

1. Create a namespace to deploy all the application specific objects by running `Kubectl create namespace climatedao`
2. Rename manifests/dev/configmap.sample.yml to manifests/dev/configmap.yml and update with appropriate values.
   Create config map which contains all the environment variables shared by all services by running.

   `kubectl apply -f configmap.yml`

3. Rename manifests/dev/secrets.sample.yml to manifests/dev/secrets.yml and update with appropriate values. 
   Create kubernetes secret by running.

    `kubectl apply -f secrets.yml`

4. Create an image pull secret by running.

   `kubectl create secret docker-registry climatedaoregistry --docker-server=https://ghcr.io --docker-username=******** --docker-password=*********** --namespace=climatedao`

5. Now we can proceed with creation of deployment and services.
   Make sure to use appropriate environment variables once moving to real production. Eg: use proper cert for Acuant 
   https://go-help.acuant.com/en/articles/2430874-3-response-and-user-flow

    - Run the below commands to deploy ui.

     `kubectl apply -f ui/deployment.yml`
     `kubectl apply -f ui/service.yml`

    - Run the below commands to deploy api.
     `kubectl apply -f api/deployment.yml`
     `kubectl apply -f api/service.yml`

    - Run the below commands to deploy event-listener.
     `kubectl apply -f event-listener/deployment.yml`
     `kubectl apply -f event-listener/service.yml`

    - Run the below commands to deploy zokrates-worker.

     `kubectl apply -f zokrates-worker/pvc.yml`
     `kubectl apply -f zokrates-worker/deployment.yml`
     `kubectl apply -f zokrates-worker/service.yml`

Now we have completed deployment of all micro services, we can proceed with exposing the ui and api to the internet.

6. Attach DNS label to ingress external IP. Skip this step if you are not using azure dns.

   `PUBLICIPID=$(az network public-ip list --query "[?ipAddress!=null]|[?contains(ipAddress, 'your-ip-here')].[id]" --output tsv)
    echo $PUBLICIPID       
    az network public-ip update --ids $PUBLICIPID --dns-name "your-dns-name-here"  
    az network public-ip show --ids $PUBLICIPID --query "[dnsSettings.fqdn]" --output tsv
   `

7. Create ingress to access the kubernetes cluster from internet.

   `kubectl apply -f ingress-class.yml`
   `kubectl apply -f ingress.yml`

8. Now you can access the ui with the dns name you have configured. Final step is to secure your connection. 
   We use cert-manager and letsencypt for ssl.

   `helm install cert-manager jetstack/cert-manager --set installCRDs=true --version v1.3.1 --namespace climatedao
    kubectl apply -f cluster-issuer.yml
    kubectl apply -f ingress.yaml
   `

Now your connection is secure as well.

   The last step is to deploy contract. Follow the below section to complete the deployment.

### Deploy contract

   1. Contract deployment depends on verification key generated by zokrates-worker. When you spin up the zokrates-worker for the 
      first time it will mount the verification key to persistent volume. Go to the Azure portal, download the `decrypt-tally-hash_vk.key`
      file from azure file storage created as part of persistent storage and copy it to the folder `proving-files-prod` in root directory.
   2. Update the voting starting and ending time in the ClimateDao.sol smart contract. Run `truffle compile` to compile the contract.
   3. To deploy contract run `node prod.deploy.js`.
   4. Copy the USDC and ClimateDAO address and update manifests/dev/configmap.yml and packages/ui/next.config.js with the copied values.
   5. Run the command to apply new changes `kubectl apply -f configmap.yml`.
   6. Build the new ui image and push to package registry.
   7. Restart all deployments to reflect the changes.

### Transfer USDC to DAO contract

   bp can now transfer 250k USDC to the DAO contract address. bp will transfer 100 USDC and make sure 
   contract address has a balance of 100 USDC before transfering the rest.

We have now completed the deployment process and the DAO is now open for voting.

Once the voting is over, EY and bp together will verify the contributions and quadratic fund matching offchain. Once verified, distribution 
will be triggered from UI.

note: Only admin can perform the admin functionalities. So we need to update role of admin user to 'admin' manually in database.


