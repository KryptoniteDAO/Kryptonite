import { queryContractQueryConfig } from "@/common";
import { ChainId, loadingWalletData } from "@/env_data";
import { swapExtentionReadArtifact, stakingReadArtifact, marketReadArtifact, convertReadArtifact } from "@/modules";
import { marketContracts } from "@/contracts";
import type { ContractDeployed, WalletData } from "@/types";
import type { ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- update market contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;

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

async function doSetConfigFeedValid(walletData: WalletData, oraclePyth: ContractDeployed, configFeedValidParams: any, print: boolean = true): Promise<void> {
  if (!oraclePyth?.address) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.warn(`Do oraclePyth.address setConfigFeedValid enter. ${JSON.stringify(configFeedValidParams)}`);

  const oraclePythClient = new marketContracts.OraclePyth.OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const doRes = await oraclePythClient.setConfigFeedValid(configFeedValidParams);

  print && console.log(`Do oraclePyth.address setConfigFeedValid ok. \n${doRes?.transactionHash}`);
}

async function doChangeOwner(walletData: WalletData, oraclePyth: ContractDeployed, newOwner: string, print: boolean = true): Promise<void> {
  if (!oraclePyth?.address || !newOwner) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.warn(`Do oraclePyth.address ChangeOwner enter.  ${newOwner}`);

  const oraclePythClient = new marketContracts.OraclePyth.OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const doRes = await oraclePythClient.changeOwner({ newOwner });

  print && console.log(`Do oraclePyth.address ChangeOwner ok. \n${doRes?.transactionHash}`);
  await queryContractQueryConfig(walletData, oraclePyth);
}

async function queryPythFeederConfig(walletData: WalletData, oraclePyth: ContractDeployed, assetAddress: string, print: boolean = true): Promise<any> {
  if (!oraclePyth?.address || !assetAddress) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.log("Query oracle.address PythFeederConfig enter");

  const oraclePythClient = new marketContracts.OraclePyth.OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const queryRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: assetAddress });

  // const configRes = await queryWasmContractByWalletData(walletData, oraclePyth.address, { query_pyth_feeder_config: { asset_address: assetAddress } });
  print && console.log(`Query oracle.PythFeederConfig: \n${JSON.stringify(queryRes)}`);
  return queryRes;
}

async function queryPrice(walletData: WalletData, oraclePyth: ContractDeployed, assetAddress: string, print: boolean = true): Promise<any> {
  if (!oraclePyth?.address || !assetAddress) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.log("Query oraclePyth.address queryPrice enter");

  const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const priceRes = await oraclePythQueryClient.queryPrice({ asset: assetAddress });

  print && console.log(`Query oraclePyth.address queryPrice ok. asset: ${assetAddress} \n${JSON.stringify(priceRes)}`);
  return priceRes;
}
