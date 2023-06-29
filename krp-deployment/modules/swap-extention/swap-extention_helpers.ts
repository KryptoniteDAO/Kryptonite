import type { ContractDeployed, WalletData } from "@/types";
import type { SwapExtentionContractConfig, SwapExtentionContractsConfig, SwapPairInfo, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, readArtifact, writeArtifact } from "@/common";
import { swapExtentionContracts } from "@/contracts";

export const SWAP_EXTENSION_ARTIFACTS_PATH = "../swap-extention/artifacts";
export const SWAP_EXTENSION_CONTRACTS_PATH = "../swap-extention";
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

export async function deploySwapExtention(walletData: WalletData, networkSwap: SwapExtentionContractsDeployed): Promise<void> {
  const contractName: keyof Required<SwapExtentionContractsDeployed> = "swapExtention";
  const config: SwapExtentionContractConfig | undefined = swapExtentionConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData.address
  });
  const writeFunc = swapExtentionWriteArtifact;

  await deployContract(walletData, contractName, networkSwap, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doSwapExtentionSetWhitelist(
  walletData: WalletData,
  swapExtention: ContractDeployed,
  whitelistConfig: {
    caller: string;
    isWhitelist: boolean;
  },
  print: boolean = true
): Promise<any> {
  print && console.log(`\n  Do swapExtention.address set_whitelist enter. caller: ${whitelistConfig?.caller}`);
  if (!swapExtention?.address || !whitelistConfig?.caller) {
    console.error(`\n  ********* Not deploy swapExtention contract`);
    return;
  }
  const swapExtentionClient = new swapExtentionContracts.SwapExtention.SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const swapExtentionQueryClient = new swapExtentionContracts.SwapExtention.SwapExtentionQueryClient(walletData.signingCosmWasmClient, swapExtention.address);

  let beforeIsSwapWhitelistRes = null;
  let initFlag = true;
  try {
    beforeIsSwapWhitelistRes = await swapExtentionQueryClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  } catch (error: any) {
    if (error?.toString().includes("Swap not found")) {
      initFlag = false;
      console.error(`swapExtention.address: need set_whitelist, address: ${whitelistConfig?.caller}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeIsSwapWhitelistRes === whitelistConfig?.isWhitelist) {
    console.warn(`********* The address is already done. set: ${whitelistConfig?.isWhitelist} / got: ${beforeIsSwapWhitelistRes} / caller: ${whitelistConfig?.caller}`);
    return;
  }

  const doRes = await swapExtentionClient.setWhitelist(whitelistConfig);
  console.log(`Do swapExtention.address set_whitelist ok. \n  ${doRes?.transactionHash}`);

  const afterIsSwapWhitelistRes = await swapExtentionQueryClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  print && console.log(`is_swap_whitelist: ${afterIsSwapWhitelistRes}`);
}

export async function doSwapExtentionUpdatePairConfig(walletData: WalletData, swapExtention: ContractDeployed, pairConfig: SwapPairInfo, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do swapExtention.address update_pair_config enter. pair_address: ${pairConfig?.pairAddress}`);
  if (!swapExtention?.address || !pairConfig?.pairAddress) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const swapExtentionClient = new swapExtentionContracts.SwapExtention.SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const swapExtentionQueryClient = new swapExtentionContracts.SwapExtention.SwapExtentionQueryClient(walletData.signingCosmWasmClient, swapExtention.address);

  let beforeConfigRes = null;
  let initFlag = true;
  try {
    beforeConfigRes = await swapExtentionQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  } catch (error: any) {
    if (error?.toString().includes("Pair config not found")) {
      initFlag = false;
      console.error(`  ********* swapExtention.address: need update_pair_config. pair_address: ${pairConfig?.pairAddress}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag) {
    console.warn(`********* The pair_address is already done. pair_address: ${pairConfig?.pairAddress}`);
    return;
  }
  const doRes = await swapExtentionClient.updatePairConfig(pairConfig);
  console.log(`Do swapExtention.address update_pair_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await swapExtentionQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  print && console.log(`\n  pair config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function printDeployedSwapContracts(networkSwap: SwapExtentionContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed swap:extends contracts info --- ---`);
  const tableData = [{ name: `swapExtention`, deploy: swapExtentionConfigs?.swapExtention?.deploy ?? false, codeId: networkSwap?.swapExtention?.codeId || 0, address: networkSwap?.swapExtention?.address }];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
