import codegen from "@cosmwasm/ts-codegen";
import * as fs from "fs";
import * as path from "path";
import { CDP_MODULE_NAME, CONVERT_MODULE_NAME, KPT_MODULE_NAME, MARKET_MODULE_NAME, STAKING_MODULE_NAME, SWAP_EXTENSION_MODULE_NAME } from "./env_data";
export const STAKING_CONTRACTS_PATH = "../krp-staking-contracts/contracts";
export const MARKET_CONTRACTS_PATH = "../krp-market-contracts/contracts";
export const CONVERT_CONTRACTS_PATH = "../krp-basset-convert/contracts";
export const SWAP_EXTENSION_CONTRACTS_PATH = "../swap-extention";
export const KPT_CONTRACTS_PATH = "../krp-token-contracts/contracts";
export const CDP_CONTRACTS_PATH = "../krp-cdp-contracts/contracts";

main().catch(console.error);

type ContractConfig = {
  name: string;
  dir: string;
};

/**
 * after do it
 * module: market
 * 1. OraclePyth.client.ts: `<Query` => `<`, `ExchangeRateByAssetLabelResponse` => `Decimal256`
 * 2. Market.client.ts: `StateResponse` => `State`
 * 3. Overseer.client.ts: `EpochStateResponse` => `EpochState`, `DynrateStateResponse` => `DynrateState`
 * module: staking
 * 1. Hub.client.ts: `ParametersResponse` => `Parameters[]`
 * 2. RewardsDispatcher.client.ts: `ConfigResponse` => `Config`
 * 3. ValidatorsRegistry.client.ts: `ConfigResponse` => `Config`, `GetValidatorsForDelegationResponse` => `Validator[]`
 */
async function main(): Promise<void> {
  console.log(`✨✨✨ do code generate enter.`);

  /// code gen by modules
  const modulesMap: Map<string, ContractConfig[]> = new Map<string, ContractConfig[]>();

  /// custom modules - start
  modulesMap.set(STAKING_MODULE_NAME, getContractConfigByPath(STAKING_CONTRACTS_PATH));
  modulesMap.set(MARKET_MODULE_NAME, getContractConfigByPath(MARKET_CONTRACTS_PATH));
  modulesMap.set(CONVERT_MODULE_NAME, getContractConfigByPath(CONVERT_CONTRACTS_PATH));
  modulesMap.set(SWAP_EXTENSION_MODULE_NAME, getContractConfigByPath(SWAP_EXTENSION_CONTRACTS_PATH));
  modulesMap.set(KPT_MODULE_NAME, getContractConfigByPath(KPT_CONTRACTS_PATH));
  modulesMap.set(CDP_MODULE_NAME, getContractConfigByPath(CDP_CONTRACTS_PATH));
  /// custom modules - end

  if (modulesMap.size <= 0) {
    return;
  }
  console.log(`\n✨✨✨ code generate info, modules: ${modulesMap.size} / `, modulesMap.keys());

  const outPath = "./contracts";

  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
  }
  const indexFilePath = `${outPath}/index.ts`;
  const existsIndexFile = fs.existsSync(indexFilePath);
  const fd = fs.openSync(indexFilePath, "as+");
  let indexFileRes: string | undefined = undefined;
  if (existsIndexFile) {
    indexFileRes = fs.readFileSync(fd, "utf8");
  }
  for (const key of modulesMap.keys()) {
    const exportStatement: string = `export * from "./${key}";`;
    if (!existsIndexFile || !indexFileRes?.includes(exportStatement)) {
      fs.appendFileSync(fd, exportStatement + "\n");
    }
  }
  await fs.closeSync(fd);

  for (const [key, value] of modulesMap.entries()) {
    // rename contract name
    value.map((val: ContractConfig) => {
      val.name = val.name.replaceAll("basset_sei_", "").replaceAll("krp_", "");
      // console.log(val);
    });
    await doCodegen(key, value, outPath);
  }

  console.log(`\n✨✨✨ do code generate all done!\n`);
}

/**
 * https://github.com/CosmWasm/ts-codegen/tree/main/packages/ts-codegen
 */
export const doCodegen = async (modulesName: string, contracts: ContractConfig[], outPath: string = "./contracts"): Promise<void> => {
  if (!!modulesName) {
    outPath = `${outPath}/${modulesName}`;
  }
  await codegen({
    contracts: contracts,
    outPath: outPath,

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
  });
  console.log(`\n✨✨✨ gen done! modulesName: ${modulesName} / contracts length: ${contracts.length}`);
};

export const getContractConfigByPath = (contractsPath: string): ContractConfig[] => {
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
};

export const getContractConfigByPrePath = (prePath: string): ContractConfig => {
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
};
