import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";
import { ConvertDeployContracts, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- just do enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH) as StakingDeployContracts;
  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
  const networkSwap = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH) as SwapDeployContracts;
  const networkConvert = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH) as ConvertDeployContracts;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just do what you want
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////




  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  console.log();
  console.log(`--- --- just do end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}
