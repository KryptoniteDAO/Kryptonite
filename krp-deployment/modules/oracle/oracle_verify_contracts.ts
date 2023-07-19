import type { WalletData } from "@/types";
import type { OracleContractsDeployed, SwapExtentionContractsDeployed, StakingContractsDeployed, MarketContractsDeployed, ConvertContractsDeployed, CdpContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { oracleReadArtifact, printDeployedOracleContracts, swapExtentionReadArtifact, stakingReadArtifact, marketReadArtifact, convertReadArtifact, cdpReadArtifact } from "@/modules";
import { oracleContracts } from "@/contracts";
import { ConfigResponse } from "@/contracts/oracle/OraclePyth.types";

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

  await printDeployedOracleContracts(networkOracle);
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = true;
  const print: boolean = false;
  const oraclePyth = networkOracle?.oraclePyth;
  const mockOracle = networkOracle?.mockOracle;
  if (oraclePyth?.address) {
    const oraclePythClient = new oracleContracts.OraclePyth.OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
    const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);

    // const doRes = await oraclePythClient.configFeedInfo({
    //   asset: "usei",
    //   checkFeedAge: true,
    //   priceFeedId: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
    //   priceFeedSymbol: "Crypto.ETH/USD",
    //   priceFeedDecimal: 8,
    //   priceFeedAge: 60
    // });
    // console.log(`\n  Query oracle.oraclePyth configFeedInfo ok. \n   ${JSON.stringify(doRes)}`);

    if (mockOracle?.address) {
      // const mockOracleClient = new oracleContracts.MockOracle.MockOracleClient(walletData.signingCosmWasmClient, walletData.address, mockOracle?.address);
      // const doMockRes = await mockOracleClient.updatePriceFeed({ id: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82815", price: 1 });
      // console.log(`\n  Do oracle.MockOracle updatePriceFeed ok. \n  ${doMockRes?.transactionHash}`);

      const mockOracleQueryClient = new oracleContracts.MockOracle.MockOracleQueryClient(walletData.signingCosmWasmClient, mockOracle.address);
      const priceFeedRes = await mockOracleQueryClient.priceFeed({ id: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82815" });
      print && console.log(`\n  Query oracle.oraclePyth configFeedInfo ok. \n   ${JSON.stringify(priceFeedRes)}`);
    }

    const configRes: ConfigResponse = await oraclePythQueryClient.queryConfig();
    print && console.log(`\n  Query oracle.oraclePyth config ok. \n   ${JSON.stringify(configRes)}`);

    if (walletData?.nativeCurrency?.coinMinimalDenom) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: walletData?.nativeCurrency?.coinMinimalDenom });
      print && console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. usei \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: walletData?.nativeCurrency?.coinMinimalDenom });
      print && console.log(`\n  Query oracle.oraclePyth queryPrice ok. usei \n   ${JSON.stringify(priceRes)}`);
    }

    if (networkStaking?.bSeiToken?.address) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: networkStaking?.bSeiToken?.address });
      print && console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. bsei \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: networkStaking?.bSeiToken?.address });
      print && console.log(`\n  Query oracle.oraclePyth queryPrice ok. bsei \n   ${JSON.stringify(priceRes)}`);
    }

    if (networkCdp?.stable_coin_denom) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: networkCdp?.stable_coin_denom });
      print && console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. stable_coin_denom \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: networkCdp?.stable_coin_denom });
      print && console.log(`\n  Query oracle.oraclePyth queryPrice ok. stable_coin_denom \n   ${JSON.stringify(priceRes)}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed oracle contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
