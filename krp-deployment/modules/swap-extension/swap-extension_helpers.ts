import { deployContract, queryWasmContractByWalletData, readArtifact, writeArtifact } from "@/common";
import { swapExtensionContracts } from "@/contracts";
import { PairConfigResponse } from "@/contracts/swap-extension/SwapSparrow.types";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type { SwapSparrowContractConfig, SwapExtensionContractsConfig, SwapExtensionContractsDeployed, SwapPairInfo } from "@/modules";
import { ContractsDeployed, ContractsDeployedModules, writeDeployedContracts } from "@/modules";
import type { AssetInfo, ContractDeployed, WalletData } from "@/types";
import { SWAP_EXTENSION_ARTIFACTS_PATH, SWAP_EXTENSION_MODULE_NAME, SwapExtensionContracts } from "./swap-extension_constants";

export const swapExtensionConfigs: SwapExtensionContractsConfig = readArtifact(`${SWAP_EXTENSION_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${SWAP_EXTENSION_MODULE_NAME}/`);

export function getSwapExtensionDeployFileName(chainId: string): string {
  return `deployed_${SWAP_EXTENSION_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function swapExtensionReadArtifact(chainId: string): SwapExtensionContractsDeployed {
  return readArtifact(getSwapExtensionDeployFileName(chainId), SWAP_EXTENSION_ARTIFACTS_PATH) as unknown as SwapExtensionContractsDeployed;
}

export function swapExtensionWriteArtifact(stakingNetwork: SwapExtensionContractsDeployed, chainId: string): void {
  writeArtifact(stakingNetwork, getSwapExtensionDeployFileName(chainId), SWAP_EXTENSION_ARTIFACTS_PATH);
}

export async function deploySwapSparrow(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<SwapExtensionContractsDeployed> = "swapSparrow";
  const config: SwapSparrowContractConfig | undefined = swapExtensionConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.swapExtension}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
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
  print && console.log(`\n  Do ${SWAP_EXTENSION_MODULE_NAME}.swapSparrow set_whitelist enter. caller: ${whitelistConfig?.caller}`);
  if (!swapSparrow?.address || !whitelistConfig?.caller) {
    console.error(`\n  ********* Not deploy swapExtension contract`);
    return;
  }
  const swapSparrowClient = new swapExtensionContracts.SwapSparrow.SwapSparrowClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, swapSparrow.address);
  const swapSparrowQueryClient = new swapExtensionContracts.SwapSparrow.SwapSparrowQueryClient(walletData?.activeWallet?.signingCosmWasmClient, swapSparrow.address);

  let beforeIsSwapWhitelistRes = null;
  let initFlag = true;
  try {
    beforeIsSwapWhitelistRes = await swapSparrowQueryClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  } catch (error: any) {
    if (error?.toString().includes("Swap not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${SWAP_EXTENSION_MODULE_NAME}.swapSparrow: need set_whitelist, address: ${whitelistConfig?.caller}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeIsSwapWhitelistRes === whitelistConfig?.isWhitelist) {
    console.warn(`\n  ######### The address is already done. set: ${whitelistConfig?.isWhitelist} / got: ${beforeIsSwapWhitelistRes}`);
    return;
  }

  const doRes = await swapSparrowClient.setWhitelist(whitelistConfig);
  console.log(`  Do ${SWAP_EXTENSION_MODULE_NAME}.swapSparrow set_whitelist ok. \n  ${doRes?.transactionHash}`);

  const afterIsSwapWhitelistRes = await swapSparrowQueryClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  print && console.log(`  after is_swap_whitelist: ${afterIsSwapWhitelistRes}`);
}

export async function doSwapSparrowUpdatePairConfig(walletData: WalletData, swapSparrow: ContractDeployed, pairConfig: SwapPairInfo, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${SWAP_EXTENSION_MODULE_NAME}.swapSparrow update_pair_config enter. pair_address: ${pairConfig?.pairAddress}`);
  if (!swapSparrow?.address || !pairConfig?.pairAddress) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  if (!pairConfig.assetInfos) {
    const pairInfo = await queryWasmContractByWalletData<{ asset_infos: any }>(walletData, pairConfig?.pairAddress, { pair: {} });
    pairConfig.assetInfos = pairInfo?.asset_infos as AssetInfo[];
    console.log(`pairInfo: `, JSON.stringify(pairInfo));
  }
  if (!pairConfig.assetInfos) {
    console.error(`\n  ********* missing assetInfos!`);
    return;
  }

  const swapSparrowClient = new swapExtensionContracts.SwapSparrow.SwapSparrowClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, swapSparrow.address);
  const swapSparrowQueryClient = new swapExtensionContracts.SwapSparrow.SwapSparrowQueryClient(walletData?.activeWallet?.signingCosmWasmClient, swapSparrow.address);

  let beforeConfigRes: PairConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await swapSparrowQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  } catch (error: any) {
    if (error?.toString().includes("Pair config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${SWAP_EXTENSION_MODULE_NAME}.swapSparrow: need update_pair_config.`);
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
  console.log(`   Do ${SWAP_EXTENSION_MODULE_NAME}.swapSparrow update_pair_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await swapSparrowQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  print && console.log(`\n  after pair config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function printDeployedSwapContracts(swapExtensionNetwork: SwapExtensionContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed contracts info: ${SWAP_EXTENSION_MODULE_NAME} --- ---`);
  const tableData = [
    {
      name: SwapExtensionContracts.swapSparrow,
      deploy: swapExtensionConfigs?.swapSparrow?.deploy ?? false,
      codeId: swapExtensionNetwork?.swapSparrow?.codeId || 0,
      address: swapExtensionNetwork?.swapSparrow?.address
    }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
