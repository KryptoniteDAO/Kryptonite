import { coins } from "@cosmjs/stargate";
import { queryStakingDelegations, queryAddressBalance, queryStaking, queryStakingParameters, readArtifact, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData, queryAddressTokenBalance } from "./common";
import { loadingWalletData, loadingStakingData, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import { ConvertDeployContracts, DeployContract, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts, WalletData } from "./types";
import Decimal from "decimal.js";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- verify deployed swap contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH) as StakingDeployContracts;
  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
  const networkSwap = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH) as SwapDeployContracts;
  const networkConvert = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH) as ConvertDeployContracts;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////



  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed swap contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}
