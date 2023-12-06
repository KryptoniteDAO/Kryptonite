import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { deployTokenStaking, printDeployedTokenContracts, readDeployedContracts, tokenConfigs } from "@/modules";
import type { WalletData } from "@/types";
import { TOKEN_MODULE_NAME } from "./token_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${TOKEN_MODULE_NAME}:collaterals --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${TOKEN_MODULE_NAME}:collaterals  --- ---`);

  const { stakingPairs } = tokenConfigs;
  if (!!stakingPairs && stakingPairs.length > 0) {
    for (const stakingRewardsPairConfig of stakingPairs) {
      await deployTokenStaking(walletData, network, stakingRewardsPairConfig);
    }
  }

  console.log(`\n  --- --- store code & instantiate contracts enter: ${TOKEN_MODULE_NAME}:collaterals  --- ---`);

  const { tokenNetwork } = network;
  await printDeployedTokenContracts(tokenNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${TOKEN_MODULE_NAME}:collaterals --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
