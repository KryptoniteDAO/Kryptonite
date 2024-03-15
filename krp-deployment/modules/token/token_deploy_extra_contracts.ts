import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import {
   deployTokenDistributeCo,
  deployTokenBoost,
  deployTokenDispatcher,
  deployTokenDistribute,
  deployTokenFund,
  deployTokenKeeper,
  deployTokenPlatToken,
  deployTokenTreasure,
  deployTokenVeToken,
  printDeployedTokenContracts,
  readDeployedContracts
} from "@/modules";
import type { WalletData } from "@/types";
import { TOKEN_MODULE_NAME } from "./token_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${TOKEN_MODULE_NAME} --- --- extra`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);



  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${TOKEN_MODULE_NAME}  --- --- extra`);

  // deploy distribute co contract
  await deployTokenDistributeCo(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${TOKEN_MODULE_NAME}  --- --- extra`);

  const { tokenNetwork } = network;
  await printDeployedTokenContracts(tokenNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${TOKEN_MODULE_NAME} --- --- extra`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
