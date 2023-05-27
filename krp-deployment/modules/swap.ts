import { chainConfigs, DEPLOY_VERSION, SWAP_EXTENSION_ARTIFACTS_PATH, SWAP_EXTENSION_MODULE_NAME } from "../env_data";
import { ChainId, DeployContract, StakingDeployContracts, SwapDeployContracts, WalletData } from "../types";
import { instantiateContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "../common";
import { SwapExtentionClient, SwapExtentionQueryClient } from "../contracts/SwapExtention.client";
import { Addr, AssetInfo, Decimal } from "../contracts/SwapExtention.types";

export const ConfigSwapPairConfigList: Record<
  string,
  {
    assetInfos: AssetInfo[];
    pairAddress: Addr;
    maxSpread?: Decimal;
    to?: Addr;
  }[]
> = {
  [ChainId.ATLANTIC_2]: [{ assetInfos: [{ native_token: { denom: "usei" } }, { native_token: { denom: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt" } }], pairAddress: "sei1pqcgdn5vmf3g9ncs98vtxkydc6su0f9rk3uk73s5ku2xhthr6avswrwnrx" }]
};

export function getSwapExtentionDeployFileName(chainId: string): string {
  return `deployed_${SWAP_EXTENSION_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function swapExtentionReadArtifact(chainId: string): StakingDeployContracts {
  return readArtifact(getSwapExtentionDeployFileName(chainId), SWAP_EXTENSION_ARTIFACTS_PATH) as StakingDeployContracts;
}

export function swapExtentionWriteArtifact(networkStaking: SwapDeployContracts, chainId: string): void {
  writeArtifact(networkStaking, getSwapExtentionDeployFileName(chainId), SWAP_EXTENSION_ARTIFACTS_PATH);
}

export async function deploySwapExtention(walletData: WalletData, networkSwap: SwapDeployContracts): Promise<void> {
  if (!networkSwap?.swapExtention?.address) {
    if (!networkSwap?.swapExtention) {
      networkSwap.swapExtention = {};
    }

    if (!networkSwap?.swapExtention?.codeId || networkSwap?.swapExtention?.codeId <= 0) {
      const filePath = chainConfigs?.swapExtention?.filePath || "../swap-extention/artifacts/swap_extention.wasm";
      networkSwap.swapExtention.codeId = await storeCodeByWalletData(walletData, filePath);
      swapExtentionWriteArtifact(networkSwap, walletData.chainId);
    }
    if (networkSwap?.swapExtention?.codeId > 0) {
      const admin = chainConfigs?.swapExtention?.admin || walletData.address;
      const label = chainConfigs?.swapExtention?.label ?? "swapExtention";
      const initMsg = Object.assign({}, chainConfigs?.swapExtention?.initMsg, {
        owner: chainConfigs?.reward?.initMsg?.owner || walletData.address
      });
      networkSwap.swapExtention.address = await instantiateContractByWalletData(walletData, admin, networkSwap.swapExtention.codeId, initMsg, label);
      swapExtentionWriteArtifact(networkSwap, walletData.chainId);
      chainConfigs.swapExtention.deploy = true;
    }
    console.log(`swapExtention: `, JSON.stringify(networkSwap?.swapExtention));
  }
}

export async function doSwapExtentionSetWhitelist(
  walletData: WalletData,
  swapExtention: DeployContract,
  whitelistConfig: {
    caller: string;
    isWhitelist: boolean;
  },
  print: boolean = true
): Promise<any> {
  print && console.log();
  print && console.log(`Do swapExtention.address set_whitelist enter. caller: ${whitelistConfig?.caller}`);
  if (!swapExtention?.address || !whitelistConfig?.caller) {
    console.log();
    console.error("********* Not deploy swapExtention contract");
    return;
  }
  const swapExtentionClient: SwapExtentionClient = new SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const swapExtentionQueryClient: SwapExtentionQueryClient = new SwapExtentionQueryClient(walletData.signingCosmWasmClient, swapExtention.address);

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
  console.log(`Do swapExtention.address set_whitelist ok. \n${doRes?.transactionHash}`);

  const afterIsSwapWhitelistRes = await swapExtentionQueryClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  print && console.log(`is_swap_whitelist: ${afterIsSwapWhitelistRes}`);
}

export async function doSwapExtentionUpdatePairConfig(
  walletData: WalletData,
  swapExtention: DeployContract,
  pairConfig: {
    assetInfos: AssetInfo[];
    pairAddress: Addr;
    maxSpread?: Decimal;
    to?: Addr;
  },
  print: boolean = true
): Promise<any> {
  print && console.log();
  print && console.log(`Do swapExtention.address update_pair_config enter. pair_address: ${pairConfig?.pairAddress}`);
  if (!swapExtention?.address || !pairConfig?.pairAddress) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  const swapExtentionClient: SwapExtentionClient = new SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const swapExtentionQueryClient: SwapExtentionQueryClient = new SwapExtentionQueryClient(walletData.signingCosmWasmClient, swapExtention.address);

  let beforeConfigRes = null;
  let initFlag = true;
  try {
    beforeConfigRes = await swapExtentionQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  } catch (error: any) {
    if (error?.toString().includes("Pair config not found")) {
      initFlag = false;
      console.error(`swapExtention.address: need update_pair_config. pair_address: ${pairConfig?.pairAddress}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag) {
    console.warn(`********* The pair_address is already done. pair_address: ${pairConfig?.pairAddress}`);
    return;
  }
  const doRes = await swapExtentionClient.updatePairConfig(pairConfig);
  console.log(`Do swapExtention.address update_pair_config ok. \n${doRes?.transactionHash}`);

  const afterConfigRes = await swapExtentionQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
  print && console.log(`pair config info: \n${JSON.stringify(afterConfigRes)}`);
}

export async function printDeployedSwapContracts(networkSwap: SwapDeployContracts): Promise<void> {
  console.log();
  console.log(`--- --- deployed swap extends contracts info --- ---`);
  const tableData = [{ name: `swapExtention`, deploy: chainConfigs?.swapExtention?.deploy, codeId: networkSwap?.swapExtention?.codeId || 0, address: networkSwap?.swapExtention?.address }];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
