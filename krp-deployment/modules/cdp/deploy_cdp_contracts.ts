import { printChangeBalancesByWalletData } from "../../common";
import { loadingWalletData } from "../../env_data";
import type { MarketDeployContracts, WalletData } from "../../types";
import type { CdpContractsDeployed } from "../../types";
import { cdpReadArtifact, deployCdpCentralControl, deployCdpCustody, deployCdpLiquidationQueue, deployCdpStablePool, printDeployedCdpContracts } from "./cdp_helpers";
import { marketReadArtifact } from "../market";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy cdp contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  // const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  // const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  // const networkKpt = kptReadArtifact(walletData.chainId) as KptDeployContracts;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;

  console.log();
  console.log(`--- --- cdp contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployCdpCentralControl(walletData, networkCdp);
  await deployCdpStablePool(walletData, networkCdp);
  await deployCdpCustody(walletData, networkCdp);
  await deployCdpLiquidationQueue(walletData, networkCdp, networkMarket?.oraclePyth);

  console.log();
  console.log(`--- --- cdp contracts storeCode & instantiateContract end --- ---`);

  await printDeployedCdpContracts(networkCdp);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- cdp contracts configure enter --- ---`);
  const print: boolean = true;

  // await doKptUpdateConfig(walletData, networkCdp?.kpt, networkCdp?.kptFund, print);
  // await doVeKptUpdateConfig(walletData, networkCdp?.veKpt, networkCdp?.kptFund, print);

  console.log();
  console.log(`--- --- cdp contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy cdp contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
