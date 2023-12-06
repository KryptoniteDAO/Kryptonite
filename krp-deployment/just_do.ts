import { readDeployedContracts } from "@/modules";
import { printChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { WalletData } from "./types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- just do enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { swapExtensionNetwork = {}, oracleNetwork = {}, cdpNetwork: { stable_coin_denom } = {}, stakingNetwork = {}, marketNetwork = {}, convertNetwork = {}, tokenNetwork = {} } = readDeployedContracts(walletData?.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- just do end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
