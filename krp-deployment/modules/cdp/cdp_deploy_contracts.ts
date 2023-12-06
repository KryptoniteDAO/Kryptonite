import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { deployCdpCentralControl, deployCdpLiquidationQueue, deployCdpStablePool, printDeployedCdpContracts, readDeployedContracts } from "@/modules";
import { CDP_MODULE_NAME } from "@/modules/cdp/cdp_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${CDP_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${CDP_MODULE_NAME} --- ---`);

  await deployCdpCentralControl(walletData, network);
  await deployCdpStablePool(walletData, network);
  await deployCdpLiquidationQueue(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${CDP_MODULE_NAME} --- ---`);

  const { cdpNetwork } = network;
  await printDeployedCdpContracts(cdpNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${CDP_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
