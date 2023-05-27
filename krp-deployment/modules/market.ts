import { chainConfigs, DEPLOY_VERSION, MARKET_ARTIFACTS_PATH, MARKET_MODULE_NAME } from "../env_data";
import { instantiateContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "../common";
import { ChainId, DeployContract, MarketDeployContracts, WalletData } from "../types";
import { OraclePythClient, OraclePythQueryClient } from "../contracts/OraclePyth.client";

export const ConfigOraclePythBaseFeedInfoList: Record<
  string,
  {
    checkFeedAge: boolean;
    priceFeedAge: number;
    priceFeedDecimal: number;
    priceFeedId: string;
    priceFeedSymbol: string;
  }
> = {
  [ChainId.SEI_CHAIN]: {
    checkFeedAge: true,
    priceFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    priceFeedSymbol: "Crypto.ETH/USD",
    priceFeedDecimal: 18,
    priceFeedAge: 60
  },
  [ChainId.ATLANTIC_2]: {
    checkFeedAge: true,
    priceFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    priceFeedSymbol: "Crypto.ETH/USD",
    priceFeedDecimal: 8,
    priceFeedAge: 720000000
  }
};

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
      asset: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt",
      priceFeedId: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
      priceFeedSymbol: "Crypto.USDT/USD",
      priceFeedDecimal: 8,
      priceFeedAge: 60
    },
    Object.assign({ asset: "usei" }, ConfigOraclePythBaseFeedInfoList[ChainId.SEI_CHAIN])
  ],
  // usei and btokens
  [ChainId.ATLANTIC_2]: [
    {
      checkFeedAge: true,
      asset: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt",
      priceFeedId: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
      priceFeedSymbol: "Crypto.USDT/USD",
      priceFeedDecimal: 8,
      priceFeedAge: 720000000
    },
    Object.assign({ asset: "usei" }, ConfigOraclePythBaseFeedInfoList[ChainId.ATLANTIC_2])
  ]
};

export function getMarketDeployFileName(chainId: string): string {
  return `deployed_${MARKET_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function marketReadArtifact(chainId: string): MarketDeployContracts {
  return readArtifact(getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
}

export function marketWriteArtifact(networkMarket: MarketDeployContracts, chainId: string): void {
  writeArtifact(networkMarket, getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH);
}

export async function deployOraclePyth(walletData: WalletData, networkMarket: MarketDeployContracts): Promise<void> {
  // if ("atlantic-2" !== walletData.chainId) {
  //   return;
  // }

  if (!networkMarket?.oraclePyth?.address) {
    if (!networkMarket?.oraclePyth) {
      networkMarket.oraclePyth = {};
    }

    if (!networkMarket?.oraclePyth?.codeId || networkMarket?.oraclePyth?.codeId <= 0) {
      const filePath = chainConfigs?.oraclePyth?.filePath || "../krp-market-contracts/artifacts/moneymarket_oracle_pyth.wasm";
      networkMarket.oraclePyth.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(networkMarket, walletData.chainId);
    }
    if (networkMarket?.oraclePyth?.codeId > 0) {
      const admin = chainConfigs?.oraclePyth?.admin || walletData.address;
      const label = chainConfigs?.oraclePyth?.label;
      const initMsg = Object.assign({}, chainConfigs?.oraclePyth?.initMsg, {
        owner: chainConfigs?.oraclePyth?.initMsg?.owner || walletData.address
      });
      networkMarket.oraclePyth.address = await instantiateContractByWalletData(walletData, admin, networkMarket.oraclePyth.codeId, initMsg, label);
      marketWriteArtifact(networkMarket, walletData.chainId);
      chainConfigs.oraclePyth.deploy = true;
    }
    console.log(`oraclePyth: `, JSON.stringify(networkMarket?.oraclePyth));
  }
}

export async function doOraclePythConfigFeedInfo(walletData: WalletData, oraclePyth: DeployContract, configFeedInfoParams: { asset: string; checkFeedAge: boolean; priceFeedAge: number; priceFeedDecimal: number; priceFeedId: string; priceFeedSymbol: string }, print: boolean = true): Promise<void> {
  print && console.log();
  print && console.warn(`Do oraclePyth.address ConfigFeedInfo enter. asset: ${configFeedInfoParams.asset}`);
  if (!oraclePyth?.address || !configFeedInfoParams?.asset || !configFeedInfoParams?.priceFeedId) {
    console.log();
    console.error("********* missing info!");
    return;
  }

  const oraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);

  let configRes = null;
  let initFlag = true;
  try {
    configRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: configFeedInfoParams.asset });
  } catch (error: any) {
    if (error?.toString().includes("Pyth feeder config not found")) {
      initFlag = false;
      console.error(`oraclePyth.address: need ConfigFeedInfo, asset: ${configFeedInfoParams.asset}`);
    } else {
      throw new Error(error);
    }
  }
  // print && console.log(`queryPythFeederConfig ok. asset: ${configFeedInfoParams.asset} \n${JSON.stringify(configRes)}`);
  if (initFlag) {
    console.warn(`********* The asset is already done. asset: ${configFeedInfoParams.asset} \n${JSON.stringify(configRes)}`);
    return;
  }

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
