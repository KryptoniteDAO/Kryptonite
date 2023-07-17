import type { WalletData, ContractDeployed } from "@/types";
import type {
  CdpCentralControlContractConfig,
  CdpContractsConfig,
  CdpContractsDeployed,
  CdpStablePoolContractConfig,
  CdpCustodyContractConfig,
  CdpLiquidationQueueContractConfig,
  CdpCollateralPairsDeployed,
  CdpCollateralPairsConfig
} from "@/modules";
import { DEPLOY_VERSION, DEPLOY_CHAIN_ID } from "@/env_data";
import { deployContract, readArtifact, writeArtifact } from "@/common";
import { cdpContracts } from "@/contracts";
import { ConfigResponse as CentralControlConfigResponse, WhitelistResponse } from "@/contracts/cdp/CentralControl.types";
import { ConfigResponse as CustodyConfigResponse } from "@/contracts/cdp/Custody.types";
import { CollateralInfoResponse, ConfigResponse as LiquidationQueueConfigResponse } from "@/contracts/cdp/LiquidationQueue.types";

export const CDP_ARTIFACTS_PATH = "../krp-cdp-contracts/artifacts";
export const CDP_CONTRACTS_PATH = "../krp-cdp-contracts/contracts";
export const CDP_MODULE_NAME = "cdp";
export const cdpConfigs: CdpContractsConfig = readArtifact(`${CDP_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${CDP_MODULE_NAME}/`);

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
  const config: CdpCentralControlContractConfig | undefined = cdpConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      oracle_contract: oraclePyth?.address || walletData.address,
      pool_contract: walletData.address,
      liquidation_contract: walletData.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployCdpStablePool(walletData: WalletData, networkCdp: CdpContractsDeployed): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  if (!cdpCentralControl?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpStablePool";
  const config: CdpStablePoolContractConfig | undefined = cdpConfigs?.[contractName];
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

  await deployContract(walletData, contractName, networkCdp, undefined, config, { defaultInitMsg, defaultFunds, writeFunc });
}

export async function deployCdpLiquidationQueue(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth?: ContractDeployed): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  if (!cdpCentralControl?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpLiquidationQueue";
  const config: CdpLiquidationQueueContractConfig | undefined = cdpConfigs?.[contractName];
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

  await deployContract(walletData, contractName, networkCdp, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployCdpCustody(walletData: WalletData, networkCdp: CdpContractsDeployed, collateralPairConfig: CdpCollateralPairsConfig): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  if (!cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address || !collateralPairConfig?.collateral) {
    return;
  }

  const contractName: string = "cdpCustody";
  // set contract deployed info
  let cdpCollateralPairsDeployed: CdpCollateralPairsDeployed[] | undefined = networkCdp?.cdpCollateralPairs;
  if (!cdpCollateralPairsDeployed) {
    cdpCollateralPairsDeployed = [];
    networkCdp.cdpCollateralPairs = cdpCollateralPairsDeployed;
  }

  let cdpCollateralPairDeployed: CdpCollateralPairsDeployed | undefined = cdpCollateralPairsDeployed?.["find"]?.(value => collateralPairConfig?.collateral === value.collateral);
  if (!cdpCollateralPairDeployed) {
    cdpCollateralPairDeployed = {
      name: collateralPairConfig?.name,
      collateral: collateralPairConfig?.collateral,
      custody: {} as ContractDeployed
    } as CdpCollateralPairsDeployed;
    cdpCollateralPairsDeployed.push(cdpCollateralPairDeployed);
  }
  let contractNetwork: ContractDeployed | undefined = cdpCollateralPairDeployed?.custody;

  // set contract config info
  // let cdpCollateralPairsConfigs: CdpCollateralPairsConfig[] | undefined = cdpConfigs?.cdpCollateralPairs;
  // if (!cdpCollateralPairsConfigs) {
  //   cdpCollateralPairsConfigs = [];
  //   cdpConfigs.cdpCollateralPairs = cdpCollateralPairsConfigs;
  // }
  // let cdpCollateralPairsConfig: CdpCollateralPairsConfig | undefined = cdpCollateralPairsConfigs?.["find"]?.(value => collateral === value.collateral);
  // if (!cdpCollateralPairsConfig) {
  //   cdpCollateralPairsConfig = {
  //     name: collateralName,
  //     collateral: collateral,
  //     custody: {} as CdpCustodyContractConfig
  //   } as CdpCollateralPairsConfig;
  //   cdpCollateralPairsConfigs.push(cdpCollateralPairsConfig);
  // }
  let config: CdpCustodyContractConfig | undefined = collateralPairConfig?.custody;

  // const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_custody.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      collateral_contract: collateralPairConfig?.collateral,
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

  await deployContract(walletData, contractName, networkCdp, contractNetwork, config, { defaultInitMsg, writeFunc });
}

export async function printDeployedCdpContracts(networkCdp: CdpContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed cdp contracts info --- ---`);
  const contractNames = Object.keys(networkCdp);
  if (!contractNames || contractNames.length <= 0) {
    return;
  }
  const config: CdpContractsConfig = cdpConfigs;
  const tableData = [];
  const tableDataPairs = [];
  for (const contractName of contractNames) {
    if ("cdpCollateralPairs" === contractName) {
      if (networkCdp.cdpCollateralPairs) {
        for (let networkPair of networkCdp.cdpCollateralPairs) {
          const pairConfig = config?.cdpCollateralPairs?.find(v => networkPair.collateral === v.collateral);
          tableDataPairs.push({
            name: networkPair?.name || pairConfig?.name,
            collateral: networkPair?.collateral || pairConfig?.collateral,
            deploy: pairConfig?.custody?.deploy ?? false,
            codeId: networkPair?.custody?.codeId || 0,
            address: networkPair?.custody?.address
          });
        }
      }
      continue;
    }
    tableData.push({
      name: contractName,
      deploy: config?.[contractName]?.deploy ?? false,
      codeId: networkCdp?.[contractName]?.codeId || 0,
      address: networkCdp?.[contractName]?.address
    });
  }
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
  console.table(tableDataPairs, [`name`, `collateral`, `codeId`, `address`, `deploy`]);
}

export async function doCdpCentralControlUpdateConfig(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do cdpCentralControl.address update_config enter.`);
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  if (!cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address || !oraclePyth?.address) {
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

  if (initFlag && cdpStablePool?.address === beforeRes?.pool_contract && oraclePyth?.address === beforeRes?.oracle_contract) {
    console.warn(`\n  ######### The cdpCentralControl.address config is already done. \n  ${JSON.stringify(beforeRes)}`);
    return;
  }
  const doRes = await centralControlClient.updateConfig({
    liquidationContract: cdpLiquidationQueue?.address,
    poolContract: cdpStablePool?.address,
    oracleContract: oraclePyth?.address
  });
  console.log(`\n  Do cdpCentralControl.address update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await centralControlQueryClient.config();
  print && console.log(`\n  cdpLiquidationQueue.address config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doCdpLiquidationQueueConfig(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do cdpLiquidationQueue.address update_config enter.`);
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  // const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  if (!cdpCentralControl?.address || !cdpLiquidationQueue?.address || !oraclePyth?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const liquidationQueueClient = new cdpContracts.LiquidationQueue.LiquidationQueueClient(walletData.signingCosmWasmClient, walletData.address, cdpLiquidationQueue.address);
  const liquidationQueueQueryClient = new cdpContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData.signingCosmWasmClient, cdpLiquidationQueue.address);

  let beforeRes: LiquidationQueueConfigResponse = null;
  let initFlag = true;
  try {
    beforeRes = await liquidationQueueQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  cdpLiquidationQueue.address: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && cdpCentralControl?.address === beforeRes?.control_contract && oraclePyth?.address === beforeRes?.oracle_contract) {
    console.warn(`\n  ######### The cdpLiquidationQueue.address config is already done.\n  ${JSON.stringify(beforeRes)}`);
    return;
  }
  const doRes = await liquidationQueueClient.updateConfig({
    controlContract: cdpCentralControl?.address,
    oracleContract: oraclePyth?.address
  });
  console.log(`\n  Do cdpLiquidationQueue.address update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await liquidationQueueQueryClient.config();
  print && console.log(`\n  cdpLiquidationQueue.address config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doCdpCentralControlSetWhitelistCollateral(walletData: WalletData, networkCdp: CdpContractsDeployed, collateralPairConfig: CdpCollateralPairsConfig, custody: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do cdp.cdpCentralControl WhitelistCollateral enter. collateral: ${collateralPairConfig?.collateral}`);
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  if (!cdpCentralControl?.address || !collateralPairConfig?.collateral || !custody?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const centralControlClient = new cdpContracts.CentralControl.CentralControlClient(walletData.signingCosmWasmClient, walletData.address, cdpCentralControl.address);
  const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData.signingCosmWasmClient, cdpCentralControl.address);

  let beforeRes: WhitelistResponse = null;
  let initFlag = true;
  try {
    beforeRes = await centralControlQueryClient.whitelist({ collateralContract: collateralPairConfig?.collateral });
  } catch (error: any) {
    if (error?.toString().includes("Token is not registered as collateral")) {
      initFlag = false;
      console.error(`\n  cdp.cdpCentralControl: need set_whitelist.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && !!beforeRes?.elems?.find(value => collateralPairConfig?.collateral === value.collateral_contract && custody?.address === value.custody_contract)) {
    console.warn(`\n  ######### cdp.cdpCentralControl whitelist is already done.`);
    return;
  }

  const doRes = await centralControlClient.whitelistCollateral({
    custodyContract: custody?.address,
    rewardBookContract: walletData?.address,
    collateralContract: collateralPairConfig?.collateral,
    name: collateralPairConfig?.centralControlWhitelistConfig?.name,
    symbol: collateralPairConfig?.centralControlWhitelistConfig?.symbol,
    maxLtv: collateralPairConfig?.centralControlWhitelistConfig?.max_ltv
  });

  console.log(`\n  Do cdpCentralControl.address whitelistCollateral ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await centralControlQueryClient.whitelist({ collateralContract: collateralPairConfig?.collateral });
  print && console.log(`\n  cdp.cdpCentralControl whitelist: ${JSON.stringify(afterRes)}`);
}

export async function doCdpLiquidationQueueSetWhitelistCollateral(walletData: WalletData, networkCdp: CdpContractsDeployed, collateralPairConfig: CdpCollateralPairsConfig, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do cdp.cdpLiquidationQueue WhitelistCollateral enter. collateral: ${collateralPairConfig?.collateral}`);
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  if (!cdpLiquidationQueue?.address || !collateralPairConfig?.collateral) {
    console.error("\n  ********* missing info!");
    return;
  }

  const liquidationQueueClient = new cdpContracts.LiquidationQueue.LiquidationQueueClient(walletData.signingCosmWasmClient, walletData.address, cdpLiquidationQueue.address);
  const liquidationQueueQueryClient = new cdpContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData.signingCosmWasmClient, cdpLiquidationQueue.address);

  let beforeRes: CollateralInfoResponse = null;
  let initFlag = true;
  try {
    beforeRes = await liquidationQueueQueryClient.collateralInfo({ collateralToken: collateralPairConfig?.collateral });
  } catch (error: any) {
    if (error?.toString().includes("Collateral is not whitelisted")) {
      initFlag = false;
      console.error(`\n  cdp.cdpLiquidationQueue: need set_whitelist.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes?.collateral_token === collateralPairConfig?.collateral) {
    console.warn(`\n  ######### cdp.cdpLiquidationQueue whitelist is already done.`);
    return;
  }

  const doRes = await liquidationQueueClient.whitelistCollateral({
    collateralToken: collateralPairConfig?.collateral,
    bidThreshold: collateralPairConfig?.liquidationQueueWhitelistConfig?.bid_threshold,
    maxSlot: collateralPairConfig?.liquidationQueueWhitelistConfig?.max_slot,
    premiumRatePerSlot: collateralPairConfig?.liquidationQueueWhitelistConfig?.premium_rate_per_slot
  });
  console.log(`\n  Do cdp.cdpLiquidationQueue whitelistCollateral ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await liquidationQueueQueryClient.collateralInfo({ collateralToken: collateralPairConfig?.collateral });
  print && console.log(`\n  cdp.cdpLiquidationQueue whitelist: ${JSON.stringify(afterRes)}`);
}
