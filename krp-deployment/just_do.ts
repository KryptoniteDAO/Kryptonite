import { BnAdd, BnComparedTo, BnDiv, BnMul, BnPow, BnSub, printChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { DeployContract, WalletData } from "./types";
import { ConvertDeployContracts, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";
import { stakingReadArtifact } from "./modules/staking";
import { marketReadArtifact } from "./modules/market";
import { swapExtentionReadArtifact } from "./modules/swap";
import { convertReadArtifact } from "./modules/convert";
import { OraclePythQueryClient } from "./contracts/OraclePyth.client";
import { OverseerQueryClient } from "./contracts/Overseer.client";

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

  const blocksPerYear = 63_072_000;
  const blocksPerYear2 = 4656810;

  const oraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, networkMarket?.oraclePyth?.address);
  // const queryRes = oraclePythQueryClient.queryPrice({asset: walletData.stable_coin_denom})
  // const queryRes = oraclePythQueryClient.queryPrice({ asset: networkStaking.bSeiToken.address });
  // console.log(queryRes);
  const overseerQueryClient = new OverseerQueryClient(walletData.signingCosmWasmClient, networkMarket?.overseer?.address);
  const epochStateRes = await overseerQueryClient.epochState();
  const epochConfigRes = await overseerQueryClient.config();
  const dynrateStateRes = await overseerQueryClient.dynrateState();

  console.log(epochStateRes);
  console.log(epochConfigRes);
  console.log(dynrateStateRes);
  console.log(computeApy(epochStateRes.deposit_rate, blocksPerYear, epochConfigRes.epoch_period));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  console.log();
  console.log(`--- --- just do end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}

function computeApy(depositRate: string, blocksPerYear: number, epochPeriod: number): string {
  const compoundTimes = BnDiv(blocksPerYear, epochPeriod);
  const perCompound = BnMul(depositRate ?? "0", epochPeriod);

  // const apy = new Decimal(Math.pow(perCompound.add(1).toNumber(), compoundTimes) - 1);
  const apy = BnSub(BnPow(BnAdd(perCompound, 1), compoundTimes), 1);
  console.log(`depositRate`, depositRate);
  console.log(`blocksPerYear`, blocksPerYear);
  console.log(`epochPeriod`, epochPeriod);
  console.log(`compoundTimes`, compoundTimes);
  console.log(`perCompound`, perCompound);
  console.log(`apy`, apy);
  if (BnComparedTo(apy, "0.2") >= 0) {
    return computeApr(depositRate, blocksPerYear);
  }

  return apy;
}

function computeApr(depositRate: string, blocksPerYear: number): string {
  return BnMul(depositRate ?? "0", blocksPerYear);
}
