import { DEPLOY_VERSION, DEPLOY_CHAIN_ID } from "@/env_data";
import { deployContract, readArtifact, writeArtifact } from "@/common";
import type { WalletData, ContractDeployed, CdpCentralControlContractConfig, CdpContractsConfig, CdpContractsDeployed, CdpStablePoolContractConfig, CdpCustodyContractConfig, CdpLiquidationQueueContractConfig } from "@/types";
import { cdpContracts } from "@/contracts";
import { KptConfigResponse } from "@/contracts/kpt/Kpt.types";
import { CdpCollateralPairsConfig, KptDeployContracts } from "@/types";
import { ConfigResponse as CentralControlConfigResponse } from "@/contracts/cdp/CentralControl.types";
import { ConfigResponse as CustodyConfigResponse } from "@/contracts/cdp/Custody.types";

export const CDP_ARTIFACTS_PATH = "../krp-cdp-contracts/artifacts";
export const CDP_MODULE_NAME = "cdp";

export const cdpConfig: CdpContractsConfig = readArtifact(`${CDP_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${CDP_MODULE_NAME}/`);

export function getCdpDeployFileName(chainId: string): string {
  return `deployed_${CDP_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function cdpReadArtifact(chainId: string): CdpContractsDeployed {
  return readArtifact(getCdpDeployFileName(chainId), CDP_ARTIFACTS_PATH) as CdpContractsDeployed;
}

export function cdpWriteArtifact(networkStaking: CdpContractsDeployed, chainId: string): void {
  writeArtifact(networkStaking, getCdpDeployFileName(chainId), CDP_ARTIFACTS_PATH);
}

export async function deployCdpCentralControl(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth?: ContractDeployed): Promise<void> {
  const contractName: keyof Required<CdpContractsDeployed> = "cdpCentralControl";
  const config: CdpCentralControlContractConfig | undefined = cdpConfig?.[contractName];
  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_central_control.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      oracle_contract: oraclePyth?.address || walletData.address,
      pool_contract: walletData.address,
      custody_contract: walletData.address,
      liquidation_contract: walletData.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, writeFunc });
}

export async function deployCdpStablePool(walletData: WalletData, networkCdp: CdpContractsDeployed): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  if (!cdpCentralControl?.address) {
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpStablePool";
  const config: CdpStablePoolContractConfig | undefined = cdpConfig?.[contractName];
  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_stable_pool.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      control_contract: cdpCentralControl?.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const defaultFunds = config?.initCoins?.map(q => Object.assign({}, q, { denom: q?.denom || walletData.nativeCurrency.coinMinimalDenom }));
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, defaultFunds, writeFunc });
}

export async function deployCdpLiquidationQueue(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth?: ContractDeployed): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  if (!cdpCentralControl?.address) {
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpLiquidationQueue";
  const config: CdpLiquidationQueueContractConfig | undefined = cdpConfig?.[contractName];
  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_liquidation_queue.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      control_contract: cdpCentralControl?.address,
      oracle_contract: oraclePyth?.address || walletData.address,
      stable_denom: walletData.stable_coin_denom
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData.address
    }
  );
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, writeFunc });
}

export async function deployCdpCustody(walletData: WalletData, networkCdp: CdpContractsDeployed, { collateral, collateralName }: { collateral: string; collateralName?: string }): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  if (!cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address || !collateral) {
    return;
  }

  const contractName: string = "cdpCustody";
  // let cdpCollateralPairsConfigs: CdpCollateralPairsConfig[] | undefined = cdpConfig?.cdpCollateralPairs;

  let cdpCollateralPairsConfigs: CdpCollateralPairsConfig[] | undefined = cdpConfig?.cdpCollateralPairs;
  if (!cdpCollateralPairsConfigs) {
    cdpCollateralPairsConfigs = [] as CdpCollateralPairsConfig[];
    cdpConfig.cdpCollateralPairs = cdpCollateralPairsConfigs;
  }

  let cdpCollateralPairsConfig: CdpCollateralPairsConfig | undefined = cdpCollateralPairsConfigs?.["find"]?.(value => collateral === value.collateral);
  if (!cdpCollateralPairsConfig) {
    cdpCollateralPairsConfig = {} as CdpCollateralPairsConfig;
    cdpCollateralPairsConfig.name = collateralName;
    cdpCollateralPairsConfig.collateral = collateral;
    cdpCollateralPairsConfig.custody = {} as CdpCustodyContractConfig;
    cdpCollateralPairsConfigs.push(cdpCollateralPairsConfig);
  }
  let config: CdpCustodyContractConfig | undefined = cdpCollateralPairsConfig?.custody;

  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_custody.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      collateral_contract: collateral,
      control_contract: cdpCentralControl?.address,
      pool_contract: cdpStablePool?.address,
      liquidation_contract: cdpLiquidationQueue?.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, writeFunc });
}

export async function printDeployedCdpContracts(networkCdp: CdpContractsDeployed): Promise<void> {
  console.log();
  console.log(`--- --- deployed cdp contracts info --- ---`);
  const contractNames = Object.keys(networkCdp);
  if (!contractNames || contractNames.length <= 0) {
    return;
  }
  const config: CdpContractsConfig = cdpConfig;
  const tableData = [];
  for (const contractName of contractNames) {
    tableData.push({
      name: contractName,
      deploy: config?.[contractName]?.deploy ?? false,
      codeId: networkCdp?.[contractName]?.codeId || 0,
      address: networkCdp?.[contractName]?.address
    });
  }
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

export async function doCdpCentralControlUpdateConfig(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do cdpCentralControl.address update_config enter.`);
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpCustody: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  if (!cdpCentralControl?.address || !cdpStablePool?.address || !cdpCustody?.address || !!cdpLiquidationQueue?.address || !oraclePyth?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const centralControlClient = new cdpContracts.CentralControl.CentralControlClient(walletData.signingCosmWasmClient, walletData.address, cdpCentralControl.address);
  const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData.signingCosmWasmClient, cdpCentralControl.address);

  let beforeRes: CentralControlConfigResponse = null;
  let initFlag = true;
  try {
    beforeRes = await centralControlQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  cdpCentralControl.address: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && cdpStablePool?.address === beforeRes?.pool_contract && cdpCustody?.address === beforeRes?.custody_contract && oraclePyth?.address === beforeRes?.oracle_contract) {
    console.warn(`\n  ********* The cdpCentralControl.address config is already done.`);
    return;
  }
  const doRes = await centralControlClient.updateConfig({
    custodyContract: cdpCustody?.address,
    liquidationContract: cdpLiquidationQueue?.address,
    poolContract: cdpStablePool?.address,
    oracleContract: oraclePyth.address
  });
  console.log(`\n  Do cdpCentralControl.address update_config ok. \n${doRes?.transactionHash}`);

  const afterRes = await centralControlQueryClient.config();
  print && console.log(`\n  config info: \n${JSON.stringify(afterRes)}`);
}

export async function doCdpCustodyUpdateConfig(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do cdpCustody.address update_config enter.`);
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpCustody: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  if (!cdpCentralControl?.address || !cdpStablePool?.address || !cdpCustody?.address || !!cdpLiquidationQueue?.address || !oraclePyth?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const custodyClient = new cdpContracts.Custody.CustodyClient(walletData.signingCosmWasmClient, walletData.address, cdpCustody.address);
  const custodyQueryClient = new cdpContracts.Custody.CustodyQueryClient(walletData.signingCosmWasmClient, cdpCustody.address);

  let beforeRes: CustodyConfigResponse = null;
  let initFlag = true;
  try {
    beforeRes = await custodyQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  cdpStablePool.address: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && cdpStablePool?.address === beforeRes?.pool_contract && cdpCustody?.address === beforeRes?.custody_contract && oraclePyth?.address === beforeRes?.oracle_contract) {
    console.warn(`\n  ********* The cdpStablePool.address config is already done.`);
    return;
  }
  const doRes = await custodyClient.updateConfig({
    custodyContract: cdpCustody?.address,
    liquidationContract: cdpLiquidationQueue?.address,
    poolContract: cdpStablePool?.address,
    oracleContract: oraclePyth.address
  });
  console.log(`\n  Do cdpStablePool.address update_config ok. \n${doRes?.transactionHash}`);

  const afterRes = await custodyQueryClient.config();
  print && console.log(`\n  config info: \n${JSON.stringify(afterRes)}`);
}
