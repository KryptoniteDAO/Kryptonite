import type { ContractDeployed, WalletData } from "@/types";
import type { CustodyBSeiContractConfig, DistributionModelContractConfig, InterestModelContractConfig, LiquidationQueueContractConfig, OracleContractsConfig, OracleContractsDeployed, OraclePythContractConfig } from "@/modules";
import { ChainId, DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, executeContractByWalletData, instantiateContract2ByWalletData, instantiateContractByWalletData, queryContractConfig, queryWasmContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "@/common";
import { cdpConfigs, CdpContractsConfig } from "@/modules";
import { marketContracts } from "@/contracts";
import { PythFeederConfigResponse } from "@/contracts/market/OraclePyth.types";

export const ORACLE_ARTIFACTS_PATH = "../krp-market-contracts/artifacts";
// export const ORACLE_CONTRACTS_PATH = "../krp-oracle-contracts/contracts";
export const ORACLE_MODULE_NAME = "oracle";
export const oracleConfigs: OracleContractsConfig = readArtifact(`${ORACLE_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${ORACLE_MODULE_NAME}/`);

export function getOracleDeployFileName(chainId: string): string {
  return `deployed_${ORACLE_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function oracleReadArtifact(chainId: string): OracleContractsDeployed {
  return readArtifact(getOracleDeployFileName(chainId), ORACLE_ARTIFACTS_PATH) as OracleContractsDeployed;
}

export function oracleWriteArtifact(networkOracle: OracleContractsDeployed, chainId: string): void {
  writeArtifact(networkOracle, getOracleDeployFileName(chainId), ORACLE_ARTIFACTS_PATH);
}

export async function deployOraclePyth(walletData: WalletData, networkOracle: OracleContractsDeployed): Promise<void> {
  const contractName: keyof Required<OracleContractsDeployed> = "oraclePyth";
  const config: OraclePythContractConfig | undefined = oracleConfigs?.[contractName];

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData.address
  });
  const writeFunc = oracleWriteArtifact;

  await deployContract(walletData, contractName, networkOracle, undefined, config, { defaultInitMsg, writeFunc });
}

export async function printDeployedOracleContracts(networkOracle: OracleContractsDeployed): Promise<any> {
  console.log(`\n  --- --- deployed oracle contracts info --- ---`);
  const contractNames: string[] = Object.keys(networkOracle);
  if (!contractNames || contractNames.length <= 0) {
    return;
  }
  const config: OracleContractsConfig = oracleConfigs;
  const tableData = [];
  for (const contractName of contractNames) {
    tableData.push({
      name: contractName,
      deploy: config?.[contractName]?.deploy ?? false,
      codeId: networkOracle?.[contractName]?.codeId || 0,
      address: networkOracle?.[contractName]?.address
    });
  }
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

export async function doOraclePythConfigFeedInfo(walletData: WalletData, oraclePyth: ContractDeployed, configFeedInfoParams: { asset: string; checkFeedAge: boolean; priceFeedAge: number; priceFeedDecimal: number; priceFeedId: string; priceFeedSymbol: string }, print: boolean = true): Promise<void> {
  print && console.warn(`\n  Do oracle.oraclePyth ConfigFeedInfo enter. asset: ${configFeedInfoParams.asset}`);
  if (!oraclePyth?.address || !configFeedInfoParams?.asset || !configFeedInfoParams?.priceFeedId) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const oraclePythClient = new marketContracts.OraclePyth.OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);

  let configRes = null;
  let initFlag = true;
  try {
    configRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: configFeedInfoParams.asset });
  } catch (error: any) {
    if (error?.toString().includes("Pyth feeder config not found")) {
      initFlag = false;
      console.error(`\n  ********* oracle.oraclePyth: need config FeederInfo.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag) {
    console.warn(`\n  ######### oracle.oraclePyth FeederInfo is already done. \n  ${JSON.stringify(configRes)}`);
    return;
  }

  const doRes = await oraclePythClient.configFeedInfo(configFeedInfoParams);

  print && console.log(`\n  Do oraclePyth.address ConfigFeedInfo ok. \n  ${doRes?.transactionHash}`);
}

export async function queryOraclePythFeederConfig(walletData: WalletData, oraclePyth: ContractDeployed, assetAddress: string, print: boolean = true): Promise<PythFeederConfigResponse | boolean> {
  print && console.log(`\n  Query oracle.oraclePyth PythFeederConfig enter. assetAddress: ${assetAddress}`);
  if (!oraclePyth?.address || !assetAddress) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);

  let configRes = null;
  let initFlag = true;
  try {
    configRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: assetAddress });
  } catch (error: any) {
    if (error?.toString().includes("Pyth feeder config not found")) {
      initFlag = false;
      console.error(`\n  ********* oracle.oraclePyth: need config FeederInfo.`);
    } else {
      throw new Error(error);
    }
  }

  print && console.log(`\n  Query oracle.oraclePyth PythFeederConfig ok. \n  ${JSON.stringify(configRes)}`);
  return configRes || initFlag;
}

// export async function doOracleRegisterFeeder(walletData: WalletData, nativeDenom: string, oracle: ContractDeployed, btoken: ContractDeployed, print: boolean = true): Promise<void> {
//   if (!oracle?.address || !btoken?.address) {
//     return;
//   }
//
//   let initFlag = true;
//   let feederRes = undefined;
//   try {
//     feederRes = await queryWasmContractByWalletData(walletData, oracle.address, { feeder: { asset: btoken.address } });
//   } catch (error: any) {
//     if (error?.toString().includes("No feeder data for the specified asset exist")) {
//       initFlag = false;
//       console.error(`\n  ********* No feeder data for the specified asset exist`);
//     } else {
//       throw new Error(error);
//     }
//   }
//   // const feederRes = await queryWasmContractByWalletData(walletData, oracle.address, { feeder: { asset: btoken.address } });
//   const doneFlag: boolean = initFlag && walletData.address === feederRes?.feeder && btoken.address === feederRes?.asset;
//   if (!doneFlag) {
//     console.warn(`\n  ######### Do oracle's register_feeder enter. collateral ` + btoken.address);
//     const doRes = await executeContractByWalletData(walletData, oracle.address, {
//       register_feeder: {
//         asset: btoken.address,
//         feeder: walletData.address
//       }
//     });
//     console.log("Do oracle's register_feeder ok. \n", btoken.address, doRes?.transactionHash);
//   }
// }
