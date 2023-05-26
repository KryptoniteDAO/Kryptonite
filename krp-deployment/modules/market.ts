import { MARKET_ARTIFACTS_PATH, MARKET_MODULE_NAME } from "../env_data";
import { readArtifact, writeArtifact } from "../common";
import { ChainId, DeployContract, MarketDeployContracts, WalletData } from "../types";
import { OraclePythClient, OraclePythQueryClient } from "../contracts/OraclePyth.client";

export const ConfigOraclePythFeedInfoList: Record<
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
  // usei and btokens
  [ChainId.ATLANTIC_2]: [
    {
      checkFeedAge: true,
      asset: "usei",
      priceFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      priceFeedSymbol: "Crypto.ETH/USD",
      priceFeedDecimal: 8,
      priceFeedAge: 720000000
    },
  ]
};

export function getMarketDeployFileName(chainId: string): string {
  return `deployed_${MARKET_MODULE_NAME}_${chainId}`;
}

export function marketReadArtifact(networkMarket: MarketDeployContracts, chainId: string): MarketDeployContracts {
  return readArtifact(getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
}

export function marketWriteArtifact(networkMarket: MarketDeployContracts, chainId: string): void {
  writeArtifact(networkMarket, getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH);
}

export async function doOraclePythConfigFeedInfo(walletData: WalletData, oraclePyth: DeployContract, configFeedInfoParams: { asset: string; checkFeedAge: boolean; priceFeedAge: number; priceFeedDecimal: number; priceFeedId: string; priceFeedSymbol: string }, print: boolean = true): Promise<void> {
  if (!oraclePyth?.address || !configFeedInfoParams) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.warn("Do oraclePyth.address ConfigFeedInfo enter");

  const oraclePythClient = new OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const doRes = await oraclePythClient.configFeedInfo(configFeedInfoParams);

  print && console.log(`Do oraclePyth.address ConfigFeedInfo ok. \n${doRes?.transactionHash}`);
  // await queryPythFeederConfig(walletData, oraclePyth, configFeedInfoParams.asset_address);
}

export async function queryPythFeederConfig(walletData: WalletData, oraclePyth: DeployContract, assetAddress: string, print: boolean = true): Promise<any> {
  if (!oraclePyth?.address || !assetAddress) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.log("Query oracle.address PythFeederConfig enter");

  const oraclePythQueryClient: OraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const queryRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: assetAddress });

  // const configRes = await queryWasmContractByWalletData(walletData, oraclePyth.address, { query_pyth_feeder_config: { asset_address: assetAddress } });
  print && console.log(`Query oracle.PythFeederConfig: \n${JSON.stringify(queryRes)}`);
  return queryRes;
}
