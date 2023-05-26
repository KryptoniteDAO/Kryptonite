import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData, queryContractQueryConfig } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";
import { ChainId } from "./types";
import { OraclePythClient, OraclePythQueryClient } from "./contracts/OraclePyth.client";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- update market contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH);
  const { aToken, market, interestModel, distributionModel, oracle, overseer, liquidationQueue, custodyBSei, oraclePyth } = await loadingMarketData(networkMarket);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const configFeedInfoList: Record<
    string,
    {
      asset: string;
      checkFeedAge: boolean;
      priceFeedAge: number;
      priceFeedDecimal: number;
      priceFeedId: string;
      priceFeedSymbol: string;
    }[]
  > = {
    [ChainId.SEI_CHAIN]: [
      {
        checkFeedAge: true,
        asset: "sei16j0hypm83zlctv7czky9n0me0k03prel3ynczn",
        priceFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
        priceFeedSymbol: "Crypto.ETH/USD",
        priceFeedDecimal: 18,
        priceFeedAge: 60
      }
    ],
    [ChainId.ATLANTIC_2]: [
      {
        checkFeedAge: true,
        asset: "sei16j0hypm83zlctv7czky9n0me0k03prel3ynczn",
        priceFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
        priceFeedSymbol: "Crypto.ETH/USD",
        priceFeedDecimal: 18,
        priceFeedAge: 60
      }
    ]
  };

  const configFeedValidList: Record<
    string,
    {
      asset: string;
      valid: boolean;
    }[]
  > = {
    [ChainId.SEI_CHAIN]: [
      {
        asset: "sei16j0hypm83zlctv7czky9n0me0k03prel3ynczn",
        valid: true
      }
    ],
    [ChainId.ATLANTIC_2]: [
      {
        asset: "sei16j0hypm83zlctv7czky9n0me0k03prel3ynczn",
        valid: true
      }
    ]
  };

  // await doConfigFeedInfo(walletData, oraclePyth, configFeedInfoList[walletData.chainId]?.[0]);
  // await doSetConfigFeedValid(walletData, oraclePyth, configFeedValidList[walletData.chainId]?.[0]);
  // await doChangeOwner(walletData, oraclePyth, "sei16j0hypm83zlctv7czky9n0me0k03prel3ynczn");

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
}

async function doSetConfigFeedValid(walletData: WalletData, oraclePyth: DeployContract, configFeedValidParams: any, print: boolean = true): Promise<void> {
  if (!oraclePyth?.address) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.warn(`Do oraclePyth.address setConfigFeedValid enter. ${JSON.stringify(configFeedValidParams)}`);

  const oraclePythClient = new OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const oraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const doRes = await oraclePythClient.setConfigFeedValid(configFeedValidParams);

  print && console.log(`Do oraclePyth.address setConfigFeedValid ok. \n${doRes?.transactionHash}`);
}

async function doChangeOwner(walletData: WalletData, oraclePyth: DeployContract, newOwner: string, print: boolean = true): Promise<void> {
  if (!oraclePyth?.address || !newOwner) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.warn(`Do oraclePyth.address ChangeOwner enter.  ${newOwner}`);

  const oraclePythClient = new OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const oraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const doRes = await oraclePythClient.changeOwner({ newOwner });

  print && console.log(`Do oraclePyth.address ChangeOwner ok. \n${doRes?.transactionHash}`);
  await queryContractQueryConfig(walletData, oraclePyth);
}

async function queryPythFeederConfig(walletData: WalletData, oraclePyth: DeployContract, assetAddress: string, print: boolean = true): Promise<any> {
  if (!oraclePyth?.address || !assetAddress) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.log("Query oracle.address PythFeederConfig enter");

  const oraclePythClient = new OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const oraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const queryRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: assetAddress });

  // const configRes = await queryWasmContractByWalletData(walletData, oraclePyth.address, { query_pyth_feeder_config: { asset_address: assetAddress } });
  print && console.log(`Query oracle.PythFeederConfig: \n${JSON.stringify(queryRes)}`);
  return queryRes;
}

async function queryPrice(walletData: WalletData, oraclePyth: DeployContract, assetAddress: string, print: boolean = true): Promise<any> {
  if (!oraclePyth?.address || !assetAddress) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.log("Query oraclePyth.address queryPrice enter");

  const oraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const priceRes = await oraclePythQueryClient.queryPrice({ asset: assetAddress });

  print && console.log(`Query oraclePyth.address queryPrice ok. asset: ${assetAddress} \n${JSON.stringify(priceRes)}`);
  return priceRes;
}
