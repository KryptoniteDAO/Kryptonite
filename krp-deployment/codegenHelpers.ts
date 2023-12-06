import codegen from "@cosmwasm/ts-codegen";
import * as fs from "fs";
import * as path from "path";

export type CodegenContractConfig = {
  name: string;
  dir: string;
};

/**
 * after do it
 * module: market
 * 1. Market.client.ts: `StateResponse` => `State`
 * 2. Overseer.client.ts: `EpochStateResponse` => `EpochState`, `DynrateStateResponse` => `DynrateState`
 * 3. LiquidationQueue.client.ts: `BidsByUserResponse` => `BidsResponse`, `BidPoolsByCollateralResponse` => `BidPoolsResponse`
 * module: staking
 * 1. Hub.client.ts: `ParametersResponse` => `Parameters`
 * 3. ValidatorsRegistry.client.ts: `ConfigResponse` => `Config`, `GetValidatorsForDelegationResponse` => `Validator[]`
 * module: token
 * 1.Fund.client.ts: `UserTime2fullRedemptionResponse` => `UserTime2FullRedemptionResponse`,
 */
export const doCodegenByModule = async (modulesName: string, contractsPath: string, outPath: string = "./contracts", handleContractName?: Function): Promise<void> => {
  console.log(`\n  ✨✨✨ doCodegenByModule enter. modulesName: ${modulesName}`);

  const contracts: CodegenContractConfig[] = getContractConfigByPath(contractsPath);
  if (!contracts || contracts.length <= 0) {
    console.error(`\n  ✨✨✨✨✨✨ doCodegenByModule done. modulesName: ${modulesName} / no contracts`);
    return;
  }
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
  }
  const indexFilePath: string = `${outPath}/index.ts`;
  const existsIndexFile: boolean = fs.existsSync(indexFilePath);
  const fd: number = fs.openSync(indexFilePath, "as+");
  let indexFileRes: string | undefined = undefined;
  if (existsIndexFile) {
    indexFileRes = fs.readFileSync(fd, "utf8");
  }
  const exportStatement: string = `export * from "./${modulesName}";`;
  if (!existsIndexFile || !indexFileRes?.includes(exportStatement)) {
    fs.appendFileSync(fd, exportStatement + "\n");
  }
  await fs.closeSync(fd);
  // rename contract name
  if (typeof handleContractName === "function") {
    contracts.map((val: CodegenContractConfig) => {
      val.name = handleContractName(val.name);
      // console.log(val);
    });
  }

  await doCodegen(modulesName, contracts, outPath);

  console.log(`\n  ✨✨✨ doCodegenByModule done. modulesName: ${modulesName}`);
};

/**
 * https://github.com/CosmWasm/ts-codegen/tree/main/packages/ts-codegen
 */
export const doCodegen = async (modulesName: string, contracts: CodegenContractConfig[], outPath: string = "./contracts"): Promise<void> => {
  let scope: string = `Contracts`;
  if (!!modulesName) {
    outPath = `${outPath}/${modulesName}`;
    scope = camel(`${modulesName}${scope}`.replaceAll("-", "_"));
  }
  await codegen({
    contracts: contracts,
    outPath: outPath,

    // options are completely optional ;)
    options: {
      bundle: {
        enabled: true,
        bundleFile: "index.ts",
        scope
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
      messageBuilder: {
        enabled: false
      }
    }
  });
  console.log(`\n  ✨✨✨ gen done! modulesName: ${modulesName} / contracts length: ${contracts.length}`);
};

export const getContractConfigByPath = (contractsPath: string): CodegenContractConfig[] => {
  const contractConfigs: CodegenContractConfig[] = [];
  const names: string[] = fs.readdirSync(contractsPath);
  if (names.includes("schema")) {
    const contractConfig = getContractConfigByPrePath(contractsPath);
    contractConfig && contractConfigs.push(contractConfig);
  } else {
    for (const name of names) {
      const contractConfig = getContractConfigByPrePath(path.join(contractsPath, name));
      contractConfig && contractConfigs.push(contractConfig);
    }
  }

  return contractConfigs;
};

export const getContractConfigByPrePath = (prePath: string): CodegenContractConfig => {
  const name = prePath.split(/(\\|\/)/).pop();
  const dir = path.join(prePath, "schema").replaceAll("\\", "/");
  try {
    const stats = fs.statSync(dir);
    const isDir: boolean = stats.isDirectory();
    if (isDir) {
      const jsonNames: string[] = fs.readdirSync(prePath);
      if (jsonNames && jsonNames.length > 0) {
        return { name, dir };
      }
    }
  } catch (error: any) {
    console.error(error?.message ?? error);
  }

  return undefined;
};

export const camel = (data: string): string => {
  if (!data) {
    return data;
  }
  const re = /_(\w)/g;
  return data.replace(re, function ($0, $1) {
    return $1.toUpperCase();
  });
};
