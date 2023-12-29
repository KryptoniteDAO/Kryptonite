import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { deployTokenBoost, deployTokenDispatcher, deployTokenDistribute, deployTokenFund, deployTokenKeeper, deployTokenPlatToken, deployTokenTreasure, deployTokenVeToken, printDeployedTokenContracts, readDeployedContracts } from "@/modules";
import type { WalletData } from "@/types";
import { TOKEN_MODULE_NAME } from "./token_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${TOKEN_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);
  const { cdpNetwork } = network;
  const stable_coin_denom: string = cdpNetwork?.stable_coin_denom ?? walletData?.nativeCurrency?.coinMinimalDenom;

  // const usdRewardController: string = tokenConfigs?.usd_reward_controller || walletData?.activeWallet?.address;
  // if (!tokenConfigs?.usd_reward_controller) {
  //   throw new Error(`\n  --- --- deploy ${TOKEN_MODULE_NAME} contracts error, Please set the usd info in configuration file variable --- ---`);
  // }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${TOKEN_MODULE_NAME}  --- ---`);

  await deployTokenPlatToken(walletData, network);


  await deployTokenVeToken(walletData, network);
  await deployTokenDistribute(walletData, network);
  await deployTokenFund(walletData, network, stable_coin_denom);
  await deployTokenBoost(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${TOKEN_MODULE_NAME}  --- ---`);

  const { tokenNetwork } = network;
  await printDeployedTokenContracts(tokenNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${TOKEN_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
