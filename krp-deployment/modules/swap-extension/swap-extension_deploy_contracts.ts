import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { deploySwapSparrow, printDeployedSwapContracts, readDeployedContracts } from "@/modules";
import type { WalletData } from "@/types";
import { SWAP_EXTENSION_MODULE_NAME } from "./swap-extension_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${SWAP_EXTENSION_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${SWAP_EXTENSION_MODULE_NAME}  --- ---`);

  await deploySwapSparrow(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${SWAP_EXTENSION_MODULE_NAME}  --- ---`);

  const { swapExtensionNetwork } = network;
  await printDeployedSwapContracts(swapExtensionNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${SWAP_EXTENSION_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
