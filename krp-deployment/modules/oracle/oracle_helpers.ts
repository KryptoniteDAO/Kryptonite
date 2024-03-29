import { deployContract, readArtifact, writeArtifact } from "@/common";
import { oracleContracts } from "@/contracts";
import { PythFeederConfigResponse } from "@/contracts/oracle/OraclePyth.types";
import { ChainId, DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type { ContractsDeployed, OracleContractsConfig, OracleContractsDeployed, OraclePythContractConfig } from "@/modules";
import { ContractsDeployedModules, writeDeployedContracts } from "@/modules";
import type { BaseContractConfig, ContractDeployed, WalletData } from "@/types";
import { ORACLE_ARTIFACTS_PATH, ORACLE_MODULE_NAME } from "./oracle_constants";

export const oracleConfigs: OracleContractsConfig = readArtifact(`${ORACLE_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${ORACLE_MODULE_NAME}/`);

export function getOracleDeployFileName(chainId: string): string {
  return `deployed_${ORACLE_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function oracleReadArtifact(chainId: string): OracleContractsDeployed {
  return readArtifact(getOracleDeployFileName(chainId), ORACLE_ARTIFACTS_PATH) as OracleContractsDeployed;
}

export function oracleWriteArtifact(oracleNetwork: OracleContractsDeployed, chainId: string): void {
  writeArtifact(oracleNetwork, getOracleDeployFileName(chainId), ORACLE_ARTIFACTS_PATH);
}

export async function deployMockOracle(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<OracleContractsDeployed> = "mockOracle";
  const config: BaseContractConfig | undefined = oracleConfigs?.[contractName];

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {});
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.oracle}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

/**
 * https://docs.pyth.network/documentation/pythnet-price-feeds/cosmwasm#networks
 */
export async function deployOraclePyth(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { oracleNetwork } = network;
  const contractName: keyof Required<OracleContractsDeployed> = "oraclePyth";
  const config: OraclePythContractConfig | undefined = oracleConfigs?.[contractName];

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData?.activeWallet?.address
  });
  if (ChainId.PACIFIC_1 !== walletData.chainId && ChainId.ATLANTIC_2 !== walletData.chainId) {
    Object.assign(defaultInitMsg, { pyth_contract: oracleNetwork?.mockOracle?.address });
  }
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.oracle}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function printDeployedOracleContracts(oracleNetwork: OracleContractsDeployed): Promise<any> {
  console.log(`\n  --- --- deployed contracts info: ${ORACLE_MODULE_NAME} --- ---`);
  const contractNames: string[] = Object.keys(oracleNetwork);
  if (!contractNames || contractNames.length <= 0) {
    return;
  }
  const config: OracleContractsConfig = oracleConfigs;
  const tableData = [];
  for (const contractName of contractNames) {
    tableData.push({
      name: contractName,
      deploy: config?.[contractName]?.deploy ?? false,
      codeId: oracleNetwork?.[contractName]?.codeId || 0,
      address: oracleNetwork?.[contractName]?.address
    });
  }
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

export async function doOraclePythConfigFeedInfo(
  walletData: WalletData,
  oracleNetwork: OracleContractsDeployed,
  configFeedInfoParams: { asset: string; checkFeedAge: boolean; priceFeedAge: number; priceFeedDecimal: number; priceFeedId: string; priceFeedSymbol: string; mockPrice?: number },
  print: boolean = true
): Promise<void> {
  console.warn(`\n  Do ${ORACLE_MODULE_NAME}.oraclePyth ConfigFeedInfo enter. asset: ${configFeedInfoParams.asset}`);
  const oraclePyth: ContractDeployed = oracleNetwork?.oraclePyth;
  if (!oraclePyth?.address || !configFeedInfoParams?.asset || !configFeedInfoParams?.priceFeedId) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const oraclePythClient = new oracleContracts.OraclePyth.OraclePythClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, oraclePyth.address);
  const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData?.activeWallet?.signingCosmWasmClient, oraclePyth.address);

  let configRes: PythFeederConfigResponse = null;
  let initFlag = true;
  try {
    configRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: configFeedInfoParams.asset });
  } catch (error: any) {
    if (error?.toString().includes("Pyth feeder config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${ORACLE_MODULE_NAME}.oraclePyth: need config FeederInfo.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && configFeedInfoParams.priceFeedId === configRes?.price_feed_id) {
    console.warn(`\n  ######### ${ORACLE_MODULE_NAME}.oraclePyth FeederInfo is already done. \n  ${JSON.stringify(configRes)}`);
    return;
  }

  const doRes = await oraclePythClient.configFeedInfo(configFeedInfoParams);

  console.log(`\n  Do ${ORACLE_MODULE_NAME}.oraclePyth ConfigFeedInfo ok. \n  ${doRes?.transactionHash}`);
  let afterRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: configFeedInfoParams.asset });
  print && console.log(`\n  after ${ORACLE_MODULE_NAME}.oraclePyth ConfigFeedInfo. \n  ${JSON.stringify(afterRes)}`);

  if (oracleNetwork?.mockOracle?.address) {
    const mockOracleClient = new oracleContracts.MockOracle.MockOracleClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, oracleNetwork?.mockOracle?.address);
    const doMockRes = await mockOracleClient.updatePriceFeed({ id: configFeedInfoParams.priceFeedId, price: configFeedInfoParams?.mockPrice ?? 1 });
    print && console.log(`\n  Do ${ORACLE_MODULE_NAME}.MockOracle updatePriceFeed ok. \n  ${doMockRes?.transactionHash}`);
  }
}

export async function queryOraclePythFeederConfig(walletData: WalletData, oraclePyth: ContractDeployed, assetAddress: string, print: boolean = true): Promise<PythFeederConfigResponse | boolean> {
  print && console.log(`\n  Query ${ORACLE_MODULE_NAME}.oraclePyth PythFeederConfig enter. assetAddress: ${assetAddress}`);
  if (!oraclePyth?.address || !assetAddress) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData?.activeWallet?.signingCosmWasmClient, oraclePyth.address);

  let configRes = null;
  let initFlag = true;
  try {
    configRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: assetAddress });
  } catch (error: any) {
    if (error?.toString().includes("Pyth feeder config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${ORACLE_MODULE_NAME}.oraclePyth: need config FeederInfo.`);
    } else {
      throw new Error(error);
    }
  }

  print && console.log(`\n  Query ${ORACLE_MODULE_NAME}.oraclePyth PythFeederConfig ok. \n  ${JSON.stringify(configRes)}`);
  return configRes || initFlag;
}

// export async function doOracleRegisterFeeder(walletData: WalletData, nativeDenom: string, oracle: ContractDeployed, bAssetsToken: ContractDeployed, print: boolean = true): Promise<void> {
//   if (!oracle?.address || !bAssetsToken?.address) {
//     return;
//   }
//
//   let initFlag = true;
//   let feederRes = undefined;
//   try {
//     feederRes = await queryWasmContractByWalletData(walletData, oracle.address, { feeder: { asset: bAssetsToken.address } });
//   } catch (error: any) {
//     if (error?.toString().includes("No feeder data for the specified asset exist")) {
//       initFlag = false;
//       console.warn(`\n  ######### No feeder data for the specified asset exist`);
//     } else {
//       throw new Error(error);
//     }
//   }
//   // const feederRes = await queryWasmContractByWalletData(walletData, oracle.address, { feeder: { asset: bAssetsToken.address } });
//   const doneFlag: boolean = initFlag && walletData?.activeWallet?.address === feederRes?.feeder && bAssetsToken.address === feederRes?.asset;
//   if (!doneFlag) {
//     console.warn(`\n  ######### Do oracle's register_feeder enter. collateral ` + bAssetsToken.address);
//     const doRes = await executeContractByWalletData(walletData, oracle.address, {
//       register_feeder: {
//         asset: bAssetsToken.address,
//         feeder: walletData?.activeWallet?.address
//       }
//     });
//     console.log("Do oracle's register_feeder ok. \n", bAssetsToken.address, doRes?.transactionHash);
//   }
// }
