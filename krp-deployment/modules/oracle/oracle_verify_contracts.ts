import { printChangeBalancesByWalletData } from "@/common";
import { oracleContracts } from "@/contracts";
import { ConfigResponse } from "@/contracts/oracle/OraclePyth.types";
import { loadingWalletData } from "@/env_data";
import { printDeployedOracleContracts, readDeployedContracts } from "@/modules";
import { ORACLE_MODULE_NAME } from "@/modules/oracle/oracle_constants.ts";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- verify deployed contracts enter: ${ORACLE_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const { oracleNetwork, stakingNetwork, cdpNetwork } = readDeployedContracts(walletData.chainId);
  await printDeployedOracleContracts(oracleNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;
  const oraclePyth = oracleNetwork?.oraclePyth;
  const mockOracle = oracleNetwork?.mockOracle;

  if (oraclePyth?.address) {
    const oraclePythClient = new oracleContracts.OraclePyth.OraclePythClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, oraclePyth.address);
    const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData?.activeWallet?.signingCosmWasmClient, oraclePyth.address);
    // const doRes = await oraclePythClient.configFeedInfo({
    //   asset: "",
    //   checkFeedAge: true,
    //   priceFeedId: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
    //   priceFeedSymbol: "Crypto.ETH/USD",
    //   priceFeedDecimal: 8,
    //   priceFeedAge: 60
    // });
    // console.log(`\n  Query oracle.oraclePyth configFeedInfo ok. \n   ${JSON.stringify(doRes)}`);

    const configRes: ConfigResponse = await oraclePythQueryClient.queryConfig();
    print && console.log(`\n  Query oracle.oraclePyth config ok. \n   ${JSON.stringify(configRes)}`);

    if (mockOracle?.address) {
      const mockOracleClient = new oracleContracts.MockOracle.MockOracleClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, mockOracle?.address);
      if (doFunc) {
        const doMockRes = await mockOracleClient.updatePriceFeed({ id: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82815", price: 1 });
        console.log(`\n  Do oracle.MockOracle updatePriceFeed ok. \n  ${doMockRes?.transactionHash}`);
      }

      const mockOracleQueryClient = new oracleContracts.MockOracle.MockOracleQueryClient(walletData?.activeWallet?.signingCosmWasmClient, mockOracle.address);
      const priceFeedRes = await mockOracleQueryClient.priceFeed({ id: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82815" });
      print && console.log(`\n  Query oracle.oraclePyth configFeedInfo ok. \n   ${JSON.stringify(priceFeedRes)}`);
    }

    if (walletData?.nativeCurrency?.coinMinimalDenom) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: walletData?.nativeCurrency?.coinMinimalDenom });
      print && console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. ${walletData?.nativeCurrency?.coinMinimalDenom} \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: walletData?.nativeCurrency?.coinMinimalDenom });
      print && console.log(`\n  Query oracle.oraclePyth queryPrice ok. ${walletData?.nativeCurrency?.coinMinimalDenom} \n   ${JSON.stringify(priceRes)}`);
    }

    if (stakingNetwork?.bAssetsToken?.address) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: stakingNetwork?.bAssetsToken?.address });
      print && console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. nAsset \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: stakingNetwork?.bAssetsToken?.address });
      print && console.log(`\n  Query oracle.oraclePyth queryPrice ok. nAsset \n   ${JSON.stringify(priceRes)}`);
    }

    if (cdpNetwork?.stable_coin_denom) {
      const feederConfig = await oraclePythQueryClient.queryPythFeederConfig({ asset: cdpNetwork?.stable_coin_denom });
      print && console.log(`\n  Query oracle.oraclePyth queryPythFeederConfig ok. stable_coin_denom \n   ${JSON.stringify(feederConfig)}`);
      const priceRes = await oraclePythQueryClient.queryPrice({ asset: cdpNetwork?.stable_coin_denom });
      print && console.log(`\n  Query oracle.oraclePyth queryPrice ok. stable_coin_denom \n   ${JSON.stringify(priceRes)}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed contracts end: ${ORACLE_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
