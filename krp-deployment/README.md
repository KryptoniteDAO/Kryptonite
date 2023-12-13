# About Deployment

Deploy contracts group by modules.

**contracts modules `[7]`:**

- swap-extension as swap
- oracle
- cdp
- staking
- market
- convert
- token

**Tips:**

1.The contracts modules `swap` and `oracle` must be deployed first.

2.The contracts modules `cdp` must be deployed before `staking`, because of `stable_coin_denom`.

3.The contracts modules `staking` must be deployed before `market`.

4.The contracts modules `convert` must be deployed after `market`.

5.When deploy contracts modules `market`, must be config the deployed contracts because of need mint `stable_coin_denom`.

## Development Core Scripts

### Environment Setup

- nodejs v16+

### initialization & update submodules

```sh
git@github.com:KryptoniteDAO/Kryptonite.git --recurse-submodules

cd ./krp-deployment

git submodule update --init --recursive

git submodule foreach git pull
```

### installation

```sh
cd ./deployment

pnpm install
or
yarn install
```

### copy environment variables

```sh
cp .env.example .env
```

### Deploy contracts

Deploy and config contracts or only deploy contracts without config.

`collaterals` mean deploy collaterals contracts pairs.

```sh
# npm run deploy:[contracts modules] or # npm run deploy:only:[contracts modules]
npm run deploy:all

# deploy && config
npm run deploy:swap
npm run deploy:oracle
npm run deploy:cdp
npm run deploy:staking
npm run deploy:cdp:collaterals
npm run deploy:market
npm run deploy:convert
npm run deploy:token
npm run deploy:token:collaterals

# deploy only contract address
npm run deploy:only:swap
npm run deploy:only:oracle
npm run deploy:only:cdp
npm run deploy:only:staking
npm run deploy:only:cdp:collaterals
npm run deploy:only:market
npm run deploy:only:convert
npm run deploy:only:token
npm run deploy:only:token:collaterals
```

### Config contracts

After deploy contracts, check and update contracts config info.

```sh
# npm run config:[contracts modules]
npm run config:all

npm run config:swap
npm run config:oracle
npm run config:cdp
npm run config:staking
npm run config:market
npm run config:convert
npm run config:token
```

### Verify contracts

Just a few simple tests to make sure the contracts are not failing

```sh
# npm run verify:[contracts modules]
npm run verify:swap
npm run verify:oracle
npm run verify:cdp
npm run verify:staking
npm run verify:market
npm run verify:convert
npm run verify:token
```

### Run with `ts-node`

```sh
# ts-node ./**/*.ts
ts-node ./just_do.ts

# node --loader ts-node/esm --dns-result-order=ipv4first -r ./suppress-experimental.cjs ./**/*.ts
node --loader ts-node/esm --dns-result-order=ipv4first -r ./suppress-experimental.cjs ./just_do.ts
```

## Deploy description

### Deploy module configuration info

Deploy contract information is in configuration file.
The configuration file is under module folder, named as:

```ts
 `./modules/${moduleName}/${moduleName}_config_${chainId}.json`
```

The configuration file includes initialization information for all contracts in the module;

```jsmin
{
  "${contractName}": {
    // contract's admin address, default current address
    admin?: Addr;
     // contract's init message object, some attribute values may be replaced in the code, recommended to fill in
    initMsg?: {
      [key: string]: any;
    };
    // contract's init coins
    initCoins?: Coin[];
    // contract's label, recommended to fill in
    label?: string;
    // contract's wasm file path, such as: "../cw-plus/artifacts/cw20_base.wasm
    filePath?: string;
  }
}
```

### Deployed module contract info

Deployed all contracts information is in deployed file.

The deployed file is under `modules` folder, named as:

```ts
 `./modules/deployed_${deployVersion}_${chainId}.json`
```

And it can sync deployed contracts into submodules self, named as:

```ts
 `../${submodulePath}/artifacts/deployed_${moduleName}_${deployVersion}_${chainId}.json`
```

run as:

```sh
ts-node .\just_do_sync_deployed_to_submodules.ts
```

**If rerun deploy scripts, will deploy the contract when the contract deployed information not in `./modules/deployed_**.json` instead of `../${submodulePath}/artifacts/deployed_**.json`**

## Special configuration

### oracle

- [`pyth_contract` on cosmwasm](https://docs.pyth.network/documentation/pythnet-price-feeds/cosmwasm#networks)
- [`pyth` price feed ids on stable](https://pyth.network/developers/price-feed-ids#cosmwasm-stable)
- [`pyth` price feed ids on edge](https://pyth.network/developers/price-feed-ids#cosmwasm-edge)

```txt
Sei Mainnet: `sei15d2tyq2jzxmpg32y3am3w62dts32qgzmds9qnr6c87r0gwwr7ynqal0x38`
Sei Testnet: `sei1w2rxq6eckak47s25crxlhmq96fzjwdtjgdwavn56ggc0qvxvw7rqczxyfy`
```

### cdp

- `cdpConfigs.stableCoinDenomMetadata`

Set stable coin denom `Metadata`.

After deployed contract `stable_coin_denom`, create a pool in [`astroport pools`](https://app.astroport.fi/pools/create) with `native/stable_coin_denom`,
then config it as a `swap pair config`.

### staking

- `stakingConfigs.validators`

Initialize validator address list, at least `1`.

- `stakingConfigs.hub.update_reward_index_addr`

### token

- `tokenConfigs.usd_reward_controller`

Used in `Fund.usd_reward_addr` and `Treasure.punish_receiver` and `Staking.reward_controller_addr`

- `tokenConfigs.stakingPairs`

Add a `staking pair config`, run as `npm run deploy:token:collaterals`.

After deployed contract `platToken`, create a pool in [`astroport pools`](https://app.astroport.fi/pools/create) with `native/platToken`,
then config it as a `staking pair config` and deploy it.

### convert

- `convertConfigs.convertPairs`

Add a `native_denom` pair config, run as `npm run deploy:convert && npm run config:convert`.

## Generate TypeScript Scripts

Converts `CosmWasm smart contracts` into dev-friendly TypeScript classes into dev-friendly TypeScript classes.

### replace code after rerun scripts

> do `replace` after rerun special module, because of Generate SDKs bugs.

```txt
module: market
1. Market.client.ts: `StateResponse` => `State`
2. Overseer.client.ts: `EpochStateResponse` => `EpochState`, `DynrateStateResponse` => `DynrateState`
3. LiquidationQueue.client.ts: `BidsByUserResponse` => `BidsResponse`, `BidPoolsByCollateralResponse` => `BidPoolsResponse`

module: staking
1. Hub.client.ts: `ParametersResponse` => `Parameters`
2. ValidatorsRegistry.client.ts: `ConfigResponse` => `Config`, `GetValidatorsForDelegationResponse` => `Validator[]`

module: token
1.Fund.client.ts: `UserTime2fullRedemptionResponse` => `UserTime2FullRedemptionResponse`,
```

### codegen scripts

```sh
# npm run codegen:[contracts modules]
npm run codegen
npm run codegen:all

npm run codegen:swap
npm run codegen:oracle
npm run codegen:cdp
npm run codegen:staking
npm run codegen:market
npm run codegen:convert
npm run codegen:token
```

### usage

```ts
import { cw20BaseContracts } from "@/contracts";
import { loadingWalletData } from "@/env_data";
import type { WalletData } from "@/types";

const walletData: WalletData = await loadingWalletData();

// new a signing client or a query client from `@/contracts`
const contractAddress = "";
// signing client = new ${moduleName}Contracts.${contractName}.${contractName}Client
// query client = new ${moduleName}Contracts.${contractName}.${contractName}QueryClient
const tokenClient = new cw20BaseContracts.Cw20Base.Cw20BaseClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, contractAddress);
const tokenQueryClient = new cw20BaseContracts.Cw20Base.Cw20BaseQueryClient(walletData?.activeWallet?.signingCosmWasmClient, contractAddress);

// do query, such as `tokenInfo` without parameters
const tokenInfoResponse = await tokenQueryClient.tokenInfo();
console.log(`Query tokenInfo: `, tokenInfoResponse);

// do query, such as `balance` with parameters
const balanceResponse = await tokenQueryClient.balance({ address: walletData?.activeWallet?.address });
console.log(`Query balance: `, balanceResponse);

// do execute, using signing client, such as `transfer`
const amount = "";
const recipient = "";
const transferRes = await tokenClient.transfer({ amount, recipient });
console.log(`Execute transfer: `, transferRes);
```
