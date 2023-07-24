import type { AssetInfo, ContractDeployed, WalletData } from "@/types";
import type { SwapSparrowContractConfig, SwapExtentionContractsConfig, SwapPairInfo, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, queryWasmContractByWalletData, readArtifact, writeArtifact } from "@/common";
import { swapExtentionContracts } from "@/contracts";
import { PairConfigResponse } from "@/contracts/swap-extention/SwapSparrow.types";

export const SWAP_EXTENSION_ARTIFACTS_PATH = "../swap-extention/artifacts";
export const SWAP_EXTENSION_CONTRACTS_PATH = "../swap-extention/contracts";
export const SWAP_EXTENSION_MODULE_NAME = "swap-extention";
export const swapExtentionConfigs: SwapExtentionContractsConfig = readArtifact(`${SWAP_EXTENSION_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${SWAP_EXTENSION_MODULE_NAME}/`);

export function getSwapExtentionDeployFileName(chainId: string): string {
  return `deployed_${SWAP_EXTENSION_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function swapExtentionReadArtifact(chainId: string): StakingContractsDeployed {
  return readArtifact(getSwapExtentionDeployFileName(chainId), SWAP_EXTENSION_ARTIFACTS_PATH) as StakingContractsDeployed;
}

export function swapExtentionWriteArtifact(networkStaking: SwapExtentionContractsDeployed, chainId: string): void {
  writeArtifact(networkStaking, getSwapExtentionDeployFileName(chainId), SWAP_EXTENSION_ARTIFACTS_PATH);
}

export async function deploySwapSparrow(walletData: WalletData, networkSwap: SwapExtentionContractsDeployed): Promise<void> {
  const contractName: keyof Required<SwapExtentionContractsDeployed> = "swapSparrow";
  const config: SwapSparrowContractConfig | undefined = swapExtentionConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData.address
  });
  const writeFunc = swapExtentionWriteArtifact;

  await deployContract(walletData, contractName, networkSwap, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doSwapSparrowSetWhitelist(
  walletData: WalletData,
  swapSparrow: ContractDeployed,
  whitelistConfig: {
    caller: string;
    isWhitelist: boolean;
  },
  print: boolean = true
): Promise<any> {
  print && console.log(`\n  Do swapExtention.swapSparrow set_whitelist enter. caller: ${whitelistConfig?.caller}`);
  if (!swapSparrow?.address || !whitelistConfig?.caller) {
    console.error(`\n  ********* Not deploy swapExtention contract`);
    return;
  }
  const swapSparrowClient = new swapExtentionContracts.SwapSparrow.SwapSparrowClient(walletData.signingCosmWasmClient, walletData.address, swapSparrow.address);
  const swapSparrowQueryClient = new swapExtentionContracts.SwapSparrow.SwapSparrowQueryClient(walletData.signingCosmWasmClient, swapSparrow.address);

  let beforeIsSwapWhitelistRes = null;
  let initFlag = true;
  try {
    beforeIsSwapWhitelistRes = await swapSparrowQueryClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  } catch (error: any) {
    if (error?.toString().includes("Swap not found")) {
      initFlag = false;
      console.warn(`\n  ######### swapExtention.swapSparrow: need set_whitelist, address: ${whitelistConfig?.caller}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeIsSwapWhitelistRes === whitelistConfig?.isWhitelist) {
    console.warn(`\n  ######### The address is already done. set: ${whitelistConfig?.isWhitelist} / got: ${beforeIsSwapWhitelistRes}`);
    return;
  }

  const doRes = await swapSparrowClient.setWhitelist(whitelistConfig);
  console.log(`  Do swapExtention.swapSparrow set_whitelist ok. \n  ${doRes?.transactionHash}`);

  const afterIsSwapWhitelistRes = await swapSparrowQueryClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  print && console.log(`  after is_swap_whitelist: ${afterIsSwapWhitelistRes}`);
}

export async function doSwapSparrowUpdatePairConfig(walletData: WalletData, swapExtention: ContractDeployed, pairConfig: SwapPairInfo, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do swapExtention.swapSparrow update_pair_config enter. pair_address: ${pairConfig?.pairAddress}`);
  if (!swapExtention?.address || !pairConfig?.pairAddress) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  if (!pairConfig.assetInfos) {
    const pairInfo = await queryWasmContractByWalletData(walletData, pairConfig?.pairAddress, { pair: {} });
    pairConfig.assetInfos = pairInfo?.asset_infos as AssetInfo[];
    console.log(`pairInfo: `, JSON.stringify(pairInfo));
  }
  if (!pairConfig.assetInfos) {
    console.error(`\n  ********* missing assetInfos!`);
    return;
  }

  const swapSparrowClient = new swapExtentionContracts.SwapSparrow.SwapSparrowClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const swapSparrowQueryClient = new swapExtentionContracts.SwapSparrow.SwapSparrowQueryClient(walletData.signingCosmWasmClient, swapExtention.address);

  let beforeConfigRes: PairConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await swapSparrowQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  } catch (error: any) {
    if (error?.toString().includes("Pair config not found")) {
      initFlag = false;
      console.warn(`\n  ######### swapExtention.address: need update_pair_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag) {
    console.warn(`\n  ######### The pair_address is already done.`);
    return;
  }
  const doRes = await swapSparrowClient.updatePairConfig({
    assetInfos: pairConfig.assetInfos,
    pairAddress: pairConfig.pairAddress,
    maxSpread: pairConfig.maxSpread,
    to: pairConfig.to
  });
  console.log(`   Do swapExtention.swapSparrow update_pair_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await swapSparrowQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  print && console.log(`\n  after pair config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function printDeployedSwapContracts(networkSwap: SwapExtentionContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed swap:extends contracts info --- ---`);
  const tableData = [
    {
      name: `swapSparrow`,
      deploy: swapExtentionConfigs?.swapSparrow?.deploy ?? false,
      codeId: networkSwap?.swapSparrow?.codeId || 0,
      address: networkSwap?.swapSparrow?.address
    }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
