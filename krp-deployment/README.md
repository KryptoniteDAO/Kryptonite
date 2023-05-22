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
- Set `stable coin denom` in corresponding config or create new one in configs, see [doc](https://docs.seinetwork.io/advanced/tokenfactory)

##### copy environment variables

```sh
cp .env.example .env
```

##### Deploy contracts

contracts modules:
- staking
- market
- convert

**Deployment contracts modules order: `staking` -> `market` -> `convert`**

```sh
# npm run deploy:[contracts modules]
npm run deploy:staking
npm run deploy:market
npm run deploy:convert
...

```

##### Verify contracts

just a few simple tests to make sure the contracts are not failing

```sh
# npm run verify:[contracts modules]
npm run verify:staking
npm run verify:market
...

```
