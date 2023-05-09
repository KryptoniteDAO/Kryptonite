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

1. Choose the environment: copy environment variables from example and update, such as `development`,`production`,`local`  
2. run related deployment script,such as `staking`,`market`, see `package.json scripts`  
3. after deployed, update the `codeId` and `address` of the contract to the corresponding environment variables in the file `.env.[environment]`  
4. run related verify script that just a few simple tests to make sure the contracts are not failing  
5. Deployment contracts modules order: `staking` -> `market`  

#### use `development` environment as an example

##### copy environment variables

```sh
# cp .env.example .env.[environment]

cp .env.example .env.development
```

##### deploy contracts script

`development` shorten `dev`  
`production` shorten `prod`  
`local`  shorten `local`

```txt
# pnpm deploy:[contracts modules]:[environment shorten]
```

###### deploy staking contracts

```sh
pnpm deploy:staking:dev
or 
yarn run deploy:staking:dev
```

###### deploy market contracts

```sh
pnpm deploy:market:dev
or 
yarn run deploy:market:dev
```

##### verify contracts script

```txt
# pnpm verify:[contracts modules]:[environment shorten]
```

###### verify staking contracts

```sh
pnpm verify:staking:dev
or 
yarn run verify:staking:dev
```

###### verify market contracts

```sh
pnpm verify:market:dev
or 
yarn run verify:market:dev
```
 