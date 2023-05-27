import { logChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { DeployContract, WalletData } from "./types";
import { ConvertDeployContracts, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";
import { stakingReadArtifact } from "./modules/staking";
import { marketReadArtifact } from "./modules/market";
import { swapExtentionReadArtifact } from "./modules/swap";
import { convertReadArtifact } from "./modules/convert";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- just do enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;

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
