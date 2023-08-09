# About us

## Development Core Scripts

### Environment Setup

- nodejs v16+

```sh
pnpm install
or
yarn install
```

### Deploy on `testnet`

- Set `validator` address in corresponding config or create new one in configs, see [doc](https://docs.seinetwork.io/develop/get-started#3.-run-a-chain-locally) or [resources](https://docs.sei.io/develop/resources)

[//]: # (- Set `stable coin denom` in corresponding config or create new one in configs, see [doc]&#40;https://docs.seinetwork.io/advanced/tokenfactory&#41;)

##### copy environment variables

```sh
cp .env.example .env
```

##### Deploy contracts

contracts modules:
- swap-extention as swap
- oracle
- staking
- market
- convert
- seilor
- cdp

**Deployment contracts modules order: `swap` -> `oracle` -> `cdp` -> `seilor` -> `staking` -> `cdp:collaterals` -> `market` -> `convert`**

```sh
# npm run deploy:[contracts modules]
npm run deploy:swap
npm run deploy:oracle
npm run deploy:cdp
npm run deploy:seilor
npm run deploy:staking
npm run deploy:cdp:collaterals
npm run deploy:market
npm run deploy:convert
...

```

##### Verify contracts

just a few simple tests to make sure the contracts are not failing

```sh
# npm run verify:[contracts modules]
npm run verify:swap
npm run verify:oracle
npm run verify:cdp
npm run verify:seilor
npm run verify:staking
npm run verify:market
npm run verify:convert
...

```

### With ts-node

```shell
ts-node -r tsconfig-paths/register just_do.ts
```
