import codegen from "@cosmwasm/ts-codegen";
import * as fs from "fs";
import * as path from "path";
export const STAKING_CONTRACTS_PATH = "../krp-staking-contracts/contracts";
export const MARKET_CONTRACTS_PATH = "../krp-market-contracts/contracts";
export const CONVERT_CONTRACTS_PATH = "../krp-basset-convert/contracts";
export const SWAP_EXTENSION_CONTRACTS_PATH = "../swap-extention";
export const KPT_CONTRACTS_PATH = "../krp-token-contracts/contracts";

main().catch(console.error);

type ContractConfig = {
  name: string;
  dir: string;
};

/**
 * after do it
 * 1. OraclePyth.client.ts: `<Query` => `<`, `ExchangeRateByAssetLabelResponse` => `Decimal256`
 * 2. Hub.client.ts: `ParametersResponse` => `Parameters[]`
 * 3. Market.client.ts: `StateResponse` => `State`
 * 4. Overseer.client.ts: `EpochStateResponse` => `EpochState`, `DynrateStateResponse` => `DynrateState`
 * 5. RewardsDispatcher.client.ts: `ConfigResponse` => `Config`
 * 6. ValidatorsRegistry.client.ts: `ConfigResponse` => `Config`, `GetValidatorsForDelegationResponse` => `Validator[]`
 */
async function main(): Promise<void> {
  console.log("✨✨✨ do code generate enter!");
  const contracts: ContractConfig[] = [];
  contracts.push(...getContractConfigByPath(STAKING_CONTRACTS_PATH));
  contracts.push(...getContractConfigByPath(MARKET_CONTRACTS_PATH));
  contracts.push(...getContractConfigByPath(CONVERT_CONTRACTS_PATH));
  contracts.push(...getContractConfigByPath(SWAP_EXTENSION_CONTRACTS_PATH));
  contracts.push(...getContractConfigByPath(KPT_CONTRACTS_PATH));

  // rename & print it
  contracts.map((value: ContractConfig) => {
    value.name = value.name.replaceAll("basset_sei_", "").replaceAll("krp_", "");
    console.log(value);
  });

  console.log(`contracts size: ${contracts.length}`);

  await doCodegen(contracts);
}

/**
 * https://github.com/CosmWasm/ts-codegen/tree/main/packages/ts-codegen
 */
async function doCodegen(contracts): Promise<void> {
  codegen({
    contracts: contracts,
    outPath: "./contracts",

    // options are completely optional ;)
    options: {
      bundle: {
        bundleFile: "index.ts",
        scope: "contracts"
      },
      types: {
        enabled: true,
        aliasExecuteMsg: true,
        aliasEntryPoints: true
      },
      client: {
        enabled: true,
        execExtendsQuery: false,
        noImplicitOverride: false
      },
      reactQuery: {
        enabled: false,
        optionalClient: true,
        version: "v4",
        mutations: true,
        camelize: true,
        queryKeys: true,
        queryFactory: true
      },
      recoil: {
        enabled: false
      },
      messageComposer: {
        enabled: false
      },
      msgBuilder: {
        enabled: false
      }
    }
  })
    .then(() => {
      console.log("✨ all done!");
    })
    .catch((error: any) => {
      console.error(error?.message ?? error);
    });
}

function getContractConfigByPath(contractsPath: string): ContractConfig[] {
  const contractConfigs: ContractConfig[] = [];
  const names: string[] = fs.readdirSync(contractsPath);
  if (names.includes("schema")) {
    const contractConfig = getContractConfigByPrePath(contractsPath);
    contractConfig && contractConfigs.push(contractConfig);
  } else {
    for (let name of names) {
      const contractConfig = getContractConfigByPrePath(path.join(contractsPath, name));
      contractConfig && contractConfigs.push(contractConfig);
    }
  }

  return contractConfigs;
}

function getContractConfigByPrePath(prePath: string): ContractConfig {
  const name = prePath.split(/(\\|\/)/).pop();
  const dir = path.join(prePath, "schema").replaceAll("\\", "/");
  try {
    const stats = fs.statSync(dir);
    const isDir = stats.isDirectory();
    if (isDir) {
      const jsonNames = fs.readdirSync(prePath);
      if (jsonNames && jsonNames.length > 0) {
        return { name, dir };
      }
    }
  } catch (error: any) {
    console.error(error?.message ?? error);
  }

  return undefined;
}
