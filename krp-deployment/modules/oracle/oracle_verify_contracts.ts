import type { ContractDeployed, WalletData } from "@/types";
import type { BaseFeedInfo, OracleContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import {
  oracleReadArtifact,
  printDeployedOracleContracts,
  deployOraclePyth,
  oracleConfigs,
  FeedInfo,
  doOraclePythConfigFeedInfo,
  writeDeployed,
  swapExtentionReadArtifact,
  SwapExtentionContractsDeployed,
  stakingReadArtifact,
  StakingContractsDeployed,
  marketReadArtifact,
  MarketContractsDeployed,
  convertReadArtifact,
  ConvertContractsDeployed,
  swapExtentionConfigs, cdpReadArtifact, CdpContractsDeployed
} from "@/modules";
import { kptContracts, oracleContracts, swapExtentionContracts } from "@/contracts";
import { KptConfigResponse } from "@/contracts/kpt/Kpt.types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- verify deployed oracle contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const oraclePyth = networkOracle?.oraclePyth;
  if (oraclePyth?.address) {
    const oraclePythClient = new oracleContracts.OraclePyth.OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
    const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
    const configRes = oraclePythQueryClient.queryConfig();
    console.log(`\n  Query oracle.oraclePyth config ok. \n   ${JSON.stringify(configRes)}`);

    if (networkStaking?.bSeiToken?.address) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: networkStaking?.bSeiToken?.address });
      console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. bsei \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: networkStaking?.bSeiToken?.address });
      console.log(`\n  Query oracle.oraclePyth queryPrice ok. bsei \n   ${JSON.stringify(priceRes)}`);
    }

    if (networkCdp?.stable_coin_denom) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: networkCdp?.stable_coin_denom });
      console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. stable_coin_denom \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: networkCdp?.stable_coin_denom });
      console.log(`\n  Query oracle.oraclePyth queryPrice ok. stable_coin_denom \n   ${JSON.stringify(priceRes)}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed oracle contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
