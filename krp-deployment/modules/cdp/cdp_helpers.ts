import { deployContract, getStableCoinDenom, readArtifact, writeArtifact } from "@/common";
import { cdpContracts } from "@/contracts";
import { ConfigResponse as CentralControlConfigResponse, WhitelistResponse } from "@/contracts/cdp/CentralControl.types";
import { ConfigResponse as CustodyConfigResponse } from "@/contracts/cdp/Custody.types";
import { CollateralInfoResponse, ConfigResponse as LiquidationQueueConfigResponse } from "@/contracts/cdp/LiquidationQueue.types";
import { ConfigResponse as RewardBookConfigResponse } from "@/contracts/cdp/RewardBook.types";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type { CdpCentralControlContractConfig, CdpCollateralPairsConfig, CdpCollateralPairsDeployed, CdpContractsConfig, CdpContractsDeployed, CdpCustodyContractConfig, CdpLiquidationQueueContractConfig, CdpRewardBookContractConfig, CdpStablePoolContractConfig } from "@/modules";
import { ContractsDeployed, ContractsDeployedModules, writeDeployedContracts } from "@/modules";
import type { ContractDeployed, WalletData } from "@/types";
import { CDP_ARTIFACTS_PATH, CDP_MODULE_NAME } from "./cdp_constants";

export const cdpConfigs: CdpContractsConfig = readArtifact(`${CDP_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${CDP_MODULE_NAME}/`);

export function getCdpDeployFileName(chainId: string): string {
  return `deployed_${CDP_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function cdpReadArtifact(chainId: string): CdpContractsDeployed {
  return readArtifact(getCdpDeployFileName(chainId), CDP_ARTIFACTS_PATH) as CdpContractsDeployed;
}

export function cdpWriteArtifact(cdpNetwork: CdpContractsDeployed, chainId: string): void {
  writeArtifact(cdpNetwork, getCdpDeployFileName(chainId), CDP_ARTIFACTS_PATH);
}

export async function deployCdpCentralControl(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { oracleNetwork } = network;
  const { oraclePyth } = oracleNetwork;
  const contractName: keyof Required<CdpContractsDeployed> = "cdpCentralControl";
  const config: CdpCentralControlContractConfig | undefined = cdpConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      oracle_contract: oraclePyth?.address || walletData?.activeWallet?.address,
      custody_contract: walletData?.activeWallet?.address,
      pool_contract: walletData?.activeWallet?.address,
      liquidation_contract: walletData?.activeWallet?.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.cdp}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployCdpStablePool(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { cdpNetwork } = network;
  const { cdpCentralControl } = cdpNetwork;
  if (!cdpCentralControl?.address) {
    console.error(`\n  ********* deploy error: missing info. deployCdpStablePool / ${cdpCentralControl?.address}`);
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
      owner_addr: config?.initMsg?.owner_addr || walletData?.activeWallet?.address
    }
  );
  const defaultFunds = config?.initCoins?.map(q => Object.assign({}, q, { denom: q?.denom || walletData?.nativeCurrency?.coinMinimalDenom }));
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.cdp}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, defaultFunds, writeFunc });

  if (cdpNetwork?.cdpStablePool?.address) {
    cdpNetwork.stable_coin_denom = getStableCoinDenom(cdpNetwork?.cdpStablePool?.address, config.initMsg.sub_demon);
    writeDeployedContracts(network, walletData.chainId);
  }
}

export async function deployCdpLiquidationQueue(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { cdpNetwork, oracleNetwork } = network;
  const { cdpCentralControl, stable_coin_denom } = cdpNetwork;
  const { oraclePyth } = oracleNetwork;
  if (!cdpCentralControl?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployCdpLiquidationQueue / ${cdpCentralControl?.address} / ${stable_coin_denom}`);
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpLiquidationQueue";
  const config: CdpLiquidationQueueContractConfig | undefined = cdpConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      control_contract: cdpCentralControl?.address,
      oracle_contract: oraclePyth?.address || walletData?.activeWallet?.address,
      stable_denom: stable_coin_denom
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.cdp}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployCdpPairRewardBook(walletData: WalletData, network: ContractsDeployed, collateralPairConfig: CdpCollateralPairsConfig): Promise<void> {
  const { cdpNetwork, stakingNetwork } = network;
  const { cdpCentralControl, cdpStablePool, cdpLiquidationQueue, stable_coin_denom } = cdpNetwork;
  const { reward } = stakingNetwork;
  if (!collateralPairConfig?.collateral || !cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployCdpPairRewardBook / ${collateralPairConfig?.collateral} / ${cdpCentralControl?.address} / ${cdpStablePool?.address} / ${cdpLiquidationQueue?.address} / ${stable_coin_denom}`);
    return;
  }

  const contractName: string = "cdpRewardBook";
  // set contract deployed info
  let cdpCollateralPairsDeployed: CdpCollateralPairsDeployed[] | undefined = cdpNetwork?.cdpCollateralPairs;
  if (!cdpCollateralPairsDeployed) {
    cdpCollateralPairsDeployed = [];
    cdpNetwork.cdpCollateralPairs = cdpCollateralPairsDeployed;
  }

  let cdpCollateralPairDeployed: CdpCollateralPairsDeployed | undefined = cdpCollateralPairsDeployed?.["find"]?.(value => collateralPairConfig?.collateral === value.collateral);
  if (!cdpCollateralPairDeployed) {
    cdpCollateralPairDeployed = {
      name: collateralPairConfig?.name,
      collateral: collateralPairConfig?.collateral,
      rewardBook: {} as ContractDeployed,
      custody: {} as ContractDeployed
    } as CdpCollateralPairsDeployed;
    cdpCollateralPairsDeployed.push(cdpCollateralPairDeployed);
  }
  let contractNetwork: ContractDeployed | undefined = cdpCollateralPairDeployed?.rewardBook;

  let config: CdpRewardBookContractConfig | undefined = collateralPairConfig?.rewardBook;

  // const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_custody.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      control_contract: cdpCentralControl?.address,
      reward_contract: reward?.address || walletData?.activeWallet?.address,
      custody_contract: cdpCollateralPairDeployed?.custody?.address || walletData?.activeWallet?.address,
      reward_denom: stable_coin_denom
    },
    config?.initMsg ?? {}
  );

  const writeFunc = writeDeployedContracts;
  const cdpCollateralPairDeployedIndex: number = cdpCollateralPairsDeployed?.["findIndex"]?.(value => collateralPairConfig?.collateral === value.collateral);
  const contractPath: string = `${ContractsDeployedModules.cdp}[${cdpCollateralPairDeployedIndex}].${contractName}`;

  await deployContract(walletData, contractPath, network, contractNetwork, config, { defaultInitMsg, writeFunc });
}

export async function deployCdpPairCustody(walletData: WalletData, network: ContractsDeployed, collateralPairConfig: CdpCollateralPairsConfig): Promise<void> {
  const { cdpNetwork } = network;
  const { cdpCentralControl, cdpStablePool, cdpLiquidationQueue } = cdpNetwork;
  if (!cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address || !collateralPairConfig?.collateral) {
    console.error(`\n  ********* deploy error: missing info. deployCdpPairCustody / ${collateralPairConfig?.collateral} / ${cdpCentralControl?.address} / ${cdpStablePool?.address} / ${cdpLiquidationQueue?.address}`);
    return;
  }

  const contractName: string = "cdpCustody";
  // set contract deployed info
  let cdpCollateralPairsDeployed: CdpCollateralPairsDeployed[] | undefined = cdpNetwork?.cdpCollateralPairs;
  if (!cdpCollateralPairsDeployed) {
    cdpCollateralPairsDeployed = [];
    cdpNetwork.cdpCollateralPairs = cdpCollateralPairsDeployed;
  }

  let cdpCollateralPairDeployed: CdpCollateralPairsDeployed | undefined = cdpCollateralPairsDeployed?.["find"]?.(value => collateralPairConfig?.collateral === value.collateral);
  if (!cdpCollateralPairDeployed) {
    cdpCollateralPairDeployed = {
      name: collateralPairConfig?.name,
      collateral: collateralPairConfig?.collateral,
      rewardBook: {} as ContractDeployed,
      custody: {} as ContractDeployed
    } as CdpCollateralPairsDeployed;
    cdpCollateralPairsDeployed.push(cdpCollateralPairDeployed);
  }
  let contractNetwork: ContractDeployed | undefined = cdpCollateralPairDeployed?.custody;

  let config: CdpCustodyContractConfig | undefined = collateralPairConfig?.custody;

  // const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_custody.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      collateral_contract: collateralPairConfig?.collateral,
      control_contract: cdpCentralControl?.address,
      pool_contract: cdpStablePool?.address,
      liquidation_contract: cdpLiquidationQueue?.address,
      reward_book_contract: cdpCollateralPairDeployed?.rewardBook?.address || walletData?.activeWallet?.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const cdpCollateralPairDeployedIndex: number = cdpCollateralPairsDeployed?.["findIndex"]?.(value => collateralPairConfig?.collateral === value.collateral);
  const contractPath: string = `${ContractsDeployedModules.cdp}[${cdpCollateralPairDeployedIndex}].${contractName}`;

  await deployContract(walletData, contractPath, network, contractNetwork, config, { defaultInitMsg, writeFunc });
}

export async function printDeployedCdpContracts(cdpNetwork: CdpContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed contracts info: ${CDP_MODULE_NAME} --- ---`);
  const contractNames = Object.keys(cdpNetwork);
  if (!contractNames || contractNames.length <= 0) {
    return;
  }
  const config: CdpContractsConfig = cdpConfigs;
  const tableData = [];
  const tableDataPairs = [];
  for (const contractName of contractNames) {
    if ("cdpCollateralPairs" === contractName) {
      if (cdpNetwork.cdpCollateralPairs) {
        for (let networkPair of cdpNetwork.cdpCollateralPairs) {
          const pairConfig = config?.cdpCollateralPairs?.find(v => networkPair.collateral === v.collateral);
          tableDataPairs.push({
            name: networkPair?.name || pairConfig?.name,
            contractName: "custody",
            collateral: networkPair?.collateral || pairConfig?.collateral,
            deploy: pairConfig?.custody?.deploy ?? false,
            codeId: networkPair?.custody?.codeId || 0,
            address: networkPair?.custody?.address
          });
          tableDataPairs.push({
            name: networkPair?.name || pairConfig?.name,
            contractName: "rewardBook",
            collateral: networkPair?.collateral || pairConfig?.collateral,
            deploy: pairConfig?.rewardBook?.deploy ?? false,
            codeId: networkPair?.rewardBook?.codeId || 0,
            address: networkPair?.rewardBook?.address
          });
        }
      }
      continue;
    }
    if ("stable_coin_denom" === contractName) {
      tableData.push({
        name: contractName,
        deploy: config?.[contractName]?.deploy ?? false,
        codeId: 0,
        address: cdpNetwork?.[contractName]
      });
      continue;
    }
    tableData.push({
      name: contractName,
      deploy: config?.[contractName]?.deploy ?? false,
      codeId: cdpNetwork?.[contractName]?.codeId || 0,
      address: cdpNetwork?.[contractName]?.address
    });
  }
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
  console.table(tableDataPairs, [`name`, `contractName`, `collateral`, `codeId`, `address`, `deploy`]);
}

export async function doCdpCentralControlUpdateConfig(walletData: WalletData, cdpNetwork: CdpContractsDeployed, oraclePyth: ContractDeployed, bAssetsToken: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${CDP_MODULE_NAME}.centralControl update_config enter.`);
  const { cdpCentralControl, cdpStablePool, cdpLiquidationQueue, cdpCollateralPairs } = cdpNetwork;
  const cdpCustodyBAssets = cdpCollateralPairs?.find(value => value.collateral === bAssetsToken?.address)?.custody;
  if (!cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address || !oraclePyth?.address || !cdpCustodyBAssets?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const centralControlClient = new cdpContracts.CentralControl.CentralControlClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpCentralControl.address);
  const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpCentralControl.address);

  let beforeRes: CentralControlConfigResponse = null;
  let initFlag: boolean = true;
  try {
    beforeRes = await centralControlQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  ${CDP_MODULE_NAME}.centralControl: need update_config.`);
    } else {
      throw new Error(error);
    }
  }
  // custody_contract: string;
  // liquidation_contract: string;
  // oracle_contract: string;
  // pool_contract: string;
  if (initFlag && cdpStablePool?.address === beforeRes?.pool_contract && oraclePyth?.address === beforeRes?.oracle_contract && cdpLiquidationQueue?.address === beforeRes?.liquidation_contract && cdpCustodyBAssets?.address === beforeRes?.custody_contract) {
    console.warn(`\n  ######### The ${CDP_MODULE_NAME}.centralControl config is already done. \n  ${JSON.stringify(beforeRes)}`);
    return;
  }
  const doRes = await centralControlClient.updateConfig({
    liquidationContract: cdpLiquidationQueue?.address,
    poolContract: cdpStablePool?.address,
    oracleContract: oraclePyth?.address,
    custodyContract: cdpCustodyBAssets?.address
  });
  console.log(`\n  Do ${CDP_MODULE_NAME}.centralControl update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await centralControlQueryClient.config();
  print && console.log(`\n  ${CDP_MODULE_NAME}.centralControl config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doCdpLiquidationQueueConfig(walletData: WalletData, cdpNetwork: CdpContractsDeployed, oraclePyth: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${CDP_MODULE_NAME}.liquidationQueue update_config enter.`);
  const cdpCentralControl: ContractDeployed = cdpNetwork?.cdpCentralControl;
  // const cdpStablePool: ContractDeployed = cdpNetwork?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = cdpNetwork?.cdpLiquidationQueue;
  if (!cdpCentralControl?.address || !cdpLiquidationQueue?.address || !oraclePyth?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const liquidationQueueClient = new cdpContracts.LiquidationQueue.LiquidationQueueClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpLiquidationQueue.address);
  const liquidationQueueQueryClient = new cdpContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpLiquidationQueue.address);

  let beforeRes: LiquidationQueueConfigResponse = null;
  let initFlag = true;
  try {
    beforeRes = await liquidationQueueQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  ${CDP_MODULE_NAME}.liquidationQueue: need update_config.`);
    } else {
      throw new Error(error);
    }
  }
  // control_contract: string;
  // oracle_contract: string;
  if (initFlag && cdpCentralControl?.address === beforeRes?.control_contract && oraclePyth?.address === beforeRes?.oracle_contract) {
    console.warn(`\n  ######### The ${CDP_MODULE_NAME}.liquidationQueue config is already done.\n  ${JSON.stringify(beforeRes)}`);
    return;
  }
  const doRes = await liquidationQueueClient.updateConfig({
    controlContract: cdpCentralControl?.address,
    oracleContract: oraclePyth?.address
  });
  console.log(`\n  Do ${CDP_MODULE_NAME}.liquidationQueue update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await liquidationQueueQueryClient.config();
  print && console.log(`\n  cdpLiquidationQueue.address config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doCdpCentralControlSetWhitelistCollateral(walletData: WalletData, cdpNetwork: CdpContractsDeployed, collateralPairConfig: CdpCollateralPairsConfig, custody: ContractDeployed, rewardBook: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${CDP_MODULE_NAME}.centralControl WhitelistCollateral enter. collateral: ${collateralPairConfig?.collateral}`);
  const cdpCentralControl: ContractDeployed = cdpNetwork?.cdpCentralControl;
  if (!cdpCentralControl?.address || !collateralPairConfig?.collateral || !custody?.address || !rewardBook?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const centralControlClient = new cdpContracts.CentralControl.CentralControlClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpCentralControl.address);
  const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpCentralControl.address);

  let beforeRes: WhitelistResponse = null;
  let initFlag = true;
  try {
    beforeRes = await centralControlQueryClient.whitelist({ collateralContract: collateralPairConfig?.collateral });
  } catch (error: any) {
    if (error?.toString().includes("Token is not registered as collateral")) {
      initFlag = false;
      console.error(`\n  ${CDP_MODULE_NAME}.centralControl: need set_whitelist.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && !!beforeRes?.elems?.find(value => collateralPairConfig?.collateral === value.collateral_contract && custody?.address === value.custody_contract && rewardBook?.address === value.reward_book_contract)) {
    console.warn(`\n  ######### ${CDP_MODULE_NAME}.centralControl whitelist is already done.`);
    return;
  }

  const doRes = await centralControlClient.whitelistCollateral({
    custodyContract: custody?.address,
    rewardBookContract: rewardBook?.address,
    collateralContract: collateralPairConfig?.collateral,
    name: collateralPairConfig?.centralControlWhitelistConfig?.name,
    symbol: collateralPairConfig?.centralControlWhitelistConfig?.symbol,
    maxLtv: collateralPairConfig?.centralControlWhitelistConfig?.max_ltv
  });

  console.log(`\n  Do ${CDP_MODULE_NAME}.centralControl whitelistCollateral ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await centralControlQueryClient.whitelist({ collateralContract: collateralPairConfig?.collateral });
  print && console.log(`\n  ${CDP_MODULE_NAME}.centralControl whitelist: ${JSON.stringify(afterRes)}`);
}

export async function doCdpLiquidationQueueSetWhitelistCollateral(walletData: WalletData, cdpNetwork: CdpContractsDeployed, collateralPairConfig: CdpCollateralPairsConfig, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${CDP_MODULE_NAME}.liquidationQueue WhitelistCollateral enter. collateral: ${collateralPairConfig?.collateral}`);
  const cdpLiquidationQueue: ContractDeployed = cdpNetwork?.cdpLiquidationQueue;
  if (!cdpLiquidationQueue?.address || !collateralPairConfig?.collateral) {
    console.error("\n  ********* missing info!");
    return;
  }

  const liquidationQueueClient = new cdpContracts.LiquidationQueue.LiquidationQueueClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpLiquidationQueue.address);
  const liquidationQueueQueryClient = new cdpContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpLiquidationQueue.address);

  let beforeRes: CollateralInfoResponse = null;
  let initFlag = true;
  try {
    beforeRes = await liquidationQueueQueryClient.collateralInfo({ collateralToken: collateralPairConfig?.collateral });
  } catch (error: any) {
    if (error?.toString().includes("Collateral is not whitelisted")) {
      initFlag = false;
      console.error(`\n  ${CDP_MODULE_NAME}.liquidationQueue: need set_whitelist.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes?.collateral_token === collateralPairConfig?.collateral) {
    console.warn(`\n  ######### ${CDP_MODULE_NAME}.liquidationQueue whitelist is already done.`);
    return;
  }

  const doRes = await liquidationQueueClient.whitelistCollateral({
    collateralToken: collateralPairConfig?.collateral,
    bidThreshold: collateralPairConfig?.liquidationQueueWhitelistConfig?.bid_threshold,
    maxSlot: collateralPairConfig?.liquidationQueueWhitelistConfig?.max_slot,
    premiumRatePerSlot: collateralPairConfig?.liquidationQueueWhitelistConfig?.premium_rate_per_slot
  });
  console.log(`\n  Do ${CDP_MODULE_NAME}.liquidationQueue whitelistCollateral ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await liquidationQueueQueryClient.collateralInfo({ collateralToken: collateralPairConfig?.collateral });
  print && console.log(`\n  ${CDP_MODULE_NAME}.liquidationQueue whitelist: ${JSON.stringify(afterRes)}`);
}

export async function doCdpCustodyUpdateConfig(walletData: WalletData, cdpNetwork: CdpContractsDeployed, cdpCollateralPairsDeployed: CdpCollateralPairsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${CDP_MODULE_NAME}.custody update_config enter. collateral: ${cdpCollateralPairsDeployed?.name} / ${cdpCollateralPairsDeployed?.collateral}`);
  const { cdpCentralControl, cdpStablePool, cdpLiquidationQueue } = cdpNetwork;

  const custody: ContractDeployed = cdpCollateralPairsDeployed?.custody;
  const rewardBook: ContractDeployed = cdpCollateralPairsDeployed?.rewardBook;
  if (!custody?.address || !rewardBook?.address || !cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address) {
    console.error("\n  ********* missing info!");
    return;
  }

  const custodyClient = new cdpContracts.Custody.CustodyClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, custody.address);
  const custodyQueryClient = new cdpContracts.Custody.CustodyQueryClient(walletData?.activeWallet?.signingCosmWasmClient, custody.address);

  let beforeRes: CustodyConfigResponse = null;
  let initFlag = true;
  try {
    beforeRes = await custodyQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  ######### ${CDP_MODULE_NAME}.custody: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && cdpCentralControl?.address === beforeRes?.control_contract && cdpLiquidationQueue?.address === beforeRes?.liquidation_contract && cdpStablePool?.address === beforeRes?.pool_contract && rewardBook?.address === beforeRes?.reward_book_contract) {
    console.warn(`\n  ######### The ${CDP_MODULE_NAME}.custody config is already done. \n  ${JSON.stringify(beforeRes)}`);
    return;
  }
  const doRes = await custodyClient.updateConfig({
    controlContract: cdpCentralControl?.address,
    liquidationContract: cdpLiquidationQueue?.address,
    poolContract: cdpStablePool?.address,
    rewardBookContract: rewardBook?.address
  });
  console.log(`\n  Do ${CDP_MODULE_NAME}.custody update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await custodyQueryClient.config();
  print && console.log(`\n  after ${CDP_MODULE_NAME}.custody config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doCdpRewardBookUpdateConfig(walletData: WalletData, cdpNetwork: CdpContractsDeployed, cdpCollateralPairsDeployed: CdpCollateralPairsDeployed, stakingReward: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${CDP_MODULE_NAME}.rewardBook update_config enter. collateral: ${cdpCollateralPairsDeployed?.name} / ${cdpCollateralPairsDeployed?.collateral}`);
  const { cdpCentralControl, cdpStablePool, cdpLiquidationQueue } = cdpNetwork;

  const stable_coin_denom: string = cdpNetwork?.stable_coin_denom;
  const custody: ContractDeployed = cdpCollateralPairsDeployed?.custody;
  const rewardBook: ContractDeployed = cdpCollateralPairsDeployed?.rewardBook;
  if (!custody?.address || !rewardBook?.address || !cdpCentralControl?.address || !cdpStablePool?.address || !cdpLiquidationQueue?.address || !stakingReward?.address || !stable_coin_denom) {
    console.error("\n  ********* missing info!");
    return;
  }

  const rewardBookClient = new cdpContracts.RewardBook.RewardBookClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, rewardBook.address);
  const rewardBookQueryClient = new cdpContracts.RewardBook.RewardBookQueryClient(walletData?.activeWallet?.signingCosmWasmClient, rewardBook.address);

  let beforeRes: RewardBookConfigResponse = null;
  let initFlag: boolean = true;
  try {
    beforeRes = await rewardBookQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  ######### ${CDP_MODULE_NAME}.rewardBook: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && cdpCentralControl?.address === beforeRes?.control_contract && custody?.address === beforeRes?.custody_contract && stakingReward?.address === beforeRes?.reward_contract && stable_coin_denom === beforeRes?.reward_denom) {
    console.warn(`\n  ######### The ${CDP_MODULE_NAME}.rewardBook config is already done. \n  ${JSON.stringify(beforeRes)}`);
    return;
  }
  const doRes = await rewardBookClient.updateConfig({
    controlContract: cdpCentralControl?.address,
    custodyContract: custody?.address,
    rewardContract: stakingReward?.address,
    rewardDenom: stable_coin_denom
  });
  console.log(`\n  Do ${CDP_MODULE_NAME}.rewardBook update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await rewardBookQueryClient.config();
  print && console.log(`\n  after ${CDP_MODULE_NAME}.rewardBook config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doCdpStableCoinDenomMetadata(walletData: WalletData, cdpNetwork: CdpContractsDeployed, print: boolean = true): Promise<any> {
  // print && console.log(`\n  Do ${CDP_MODULE_NAME}.cdpStablePool setTokenMetadata enter.`);
  // const { cdpStablePool, stable_coin_denom } = cdpNetwork;
  // const metadataConfig = cdpConfigs?.stableCoinDenomMetadata;
  // if (!cdpStablePool?.address || !stable_coin_denom || !metadataConfig) {
  //   console.error("\n  ********* missing info!");
  //   return;
  // }
  // const stablePoolClient = new cdpContracts.StablePool.StablePoolClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpStablePool?.address);
  // const stablePoolQueryClient = new cdpContracts.StablePool.StablePoolQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpStablePool?.address);
  //
  // let beforeRes: Metadata = null;
  // let initFlag: boolean = true;
  // try {
  //   beforeRes = await walletData?.chainGrpcClient?.bank?.fetchDenomMetadata(stable_coin_denom);
  // } catch (error: any) {
  //   if (error?.toString().includes("Metadata not found")) {
  //     initFlag = false;
  //     console.error(`\n  ######### ${CDP_MODULE_NAME}.cdpStablePool: need setTokenMetadata.`);
  //   } else {
  //     throw new Error(error);
  //   }
  // }
  //
  // if (initFlag && metadataConfig?.name === beforeRes?.name && metadataConfig?.symbol === beforeRes?.symbol && metadataConfig?.decimals === beforeRes?.denomUnits?.[1]?.exponent) {
  //   console.warn(`\n  ######### The ${CDP_MODULE_NAME}.cdpStablePool tokenMetadata is already done. \n  ${JSON.stringify(beforeRes)}`);
  //   return;
  // }
  // const doRes = await stablePoolClient.setTokenMetadata({
  //   ...metadataConfig
  // });
  // console.log(`\n  Do ${CDP_MODULE_NAME}.cdpStablePool setTokenMetadata ok. \n  ${doRes?.transactionHash}`);
  //
  // const afterRes = await walletData?.chainGrpcClient?.bank?.fetchDenomMetadata(stable_coin_denom);
  // print && console.log(`\n  after ${CDP_MODULE_NAME}.cdpStablePool tokenMetadata info: \n  ${JSON.stringify(afterRes)}`);
}
