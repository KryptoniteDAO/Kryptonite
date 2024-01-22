import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { readDeployedContracts } from "@/modules";
import type { WalletData } from "@/types";
import { WRAP_CW20_MODULE_NAME } from "@/modules/wrap-cw20/wrap-cw20_constants";
import {
  deployWrapCw20, printDeployedWrapCw20Contracts
} from "@/modules/wrap-cw20/wrap-cw20_helpers";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${WRAP_CW20_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${WRAP_CW20_MODULE_NAME} --- ---`);

  await deployWrapCw20(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${WRAP_CW20_MODULE_NAME} --- ---`);

  const { wrapCw20Network } = network;
  await printDeployedWrapCw20Contracts(wrapCw20Network);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${WRAP_CW20_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
