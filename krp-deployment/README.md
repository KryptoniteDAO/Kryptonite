# About us

## Development

### Environment Setup

- nodejs v16+  

```sh
pnpm install
or 
yarn install
```

### Deploy 

1. copy environment variables from example and update
2. run the deployment script
3. after deployed contracts, update the contract addresses to corresponding environment variables
4. run the verify script that a few simple tests to make sure the contracts are not failing

#### use local environment

```sh
cp .env.example .env.local  

pnpm deploy:staking:local
or 
yarn run deploy:staking:local
```

#### use development environment

```sh
cp .env.example .env.development  

pnpm deploy:staking:dev
or 
yarn run deploy:staking:dev
```

### Verify 

#### use local environment

```sh
pnpm verify:staking:local
or 
yarn run verify:staking:local
```

#### use development environment

```sh
pnpm verify:staking:dev
or 
yarn run verify:staking:dev
```
