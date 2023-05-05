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

- copy environment variables and update

#### use local environment

```sh
cp .env.example .env.local  

pnpm deploy:local
or 
yarn run deploy:local
```

#### use development environment

```sh
cp .env.example .env.development  

pnpm deploy:dev
or 
yarn run deploy:dev
```