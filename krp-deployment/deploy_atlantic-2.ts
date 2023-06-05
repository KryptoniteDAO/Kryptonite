import { parseCoins } from "@cosmjs/proto-signing";
import {
  readArtifact, writeArtifact, storeCodeByWalletData, instantiateContractByWalletData, executeContractByWalletData,
  queryWasmContractByWalletData, migrateContractByWalletData, queryAddressBalance,
  getClientDataByWalletData, queryAddressTokenBalance, queryWasmContract, instantiateContract2ByWalletData, queryContractConfig,
} from "./common";
import { marketWriteArtifact } from "./modules/market";
import { swapExtentionWriteArtifact } from "./modules/swap"
import { CustodyBaseClient } from "./contracts/CustodyBase.client";
import { loadingWalletData, loadingStakingData, loadingMarketData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { ConvertPairs, ConvertDeployContracts, DeployContract, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts, WalletData } from "./types";
import { walletSignArbitrary } from "@sei-js/core";

import { stakingReadArtifact } from "./modules/staking";
import { marketReadArtifact } from "./modules/market";
import { swapExtentionReadArtifact } from "./modules/swap";
import { convertReadArtifact } from "./modules/convert";
import { coins } from "@cosmjs/stargate";
import { DistributionModelQueryClient } from "./contracts/DistributionModel.client";
import { config } from "dotenv";

require("dotenv").config();

async function main(): Promise<void> {

  const walletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;

  console.log();

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub.address || !bSeiToken.address || !stSeiToken.address || !rewardsDispatcher.address || !validatorsRegistry.address || !reward.address) {
    console.log(`--- --- verify deployed error, missing some deployed staking address info --- ---`);
    process.exit(0);
    return;
  }

  const { overseer, market, custodyBSei, interestModel, distributionModel, oraclePyth, aToken, liquidationQueue } = await loadingMarketData(networkMarket);
  if (!overseer.address || !market.address || !custodyBSei.address || !interestModel.address || !distributionModel.address || !oraclePyth.address || !aToken.address || !liquidationQueue.address) {
    console.log(`--- --- verify deployed error, missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  const swapExtention = networkSwap?.swapExtention;


  const strideSeiDenom = "ibc/326D2E9FFBF7AE39CC404A58DED81054E23F107BC8D926D5D981C0231F1ECD2D";
  const slstiSeiDenom = "ibc/53B6183707AF4C744EE26815613D9C4D0DE40E2C18083EA5B384FAF4F6BB0C06";
  const usdtDenom = "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt";
  const usdcDenom = "factory/sei135mlnw9ndkyglgx7ma95pw22cl64mpnw58pfpd/usdc";



  
  ///Deploy swap contract
  ///yarn run deploy:swap 
  ///


  /// Deploy and staking module 
  /// yarn run deploy:staking
  ///
  

  /// Deploy money market module
  /// yarn run deploy:market
  ///

  /// Deploy money market module
  /// yarn run deploy:convert
  ///
  
  /// Deploy usdc market
  // await deployMarketForUsdc(walletData, networkMarket, usdcDenom);

  let ustcAToken = "sei19956c8jhwgpc6txjcxwt2nhp3dl6mx2d0uvnwyse736xpj8wkqfq2d8m63";
  let usdcMarketAddress = "sei13zlnvv9egw0eg2x2wz6ygn5quem6vet570ajf57eqnvgdkyl008sxczc2q";
  /*
  /// config overseer add multi stable coin
  ///
  await executeContractByWalletData(walletData, networkMarket.overseer.address, 
    {
        register_market: {
          market_contract: networkMarket.market.address,
          stable_denom: usdtDenom,
          stable_name: "USDT",
          //market config
          threshold_deposit_rate: "0.000000030572045778",
          target_deposit_rate:  "0.000000040762727704",
          buffer_distribution_factor: "0.1",
          //dynrate config
          dyn_rate_epoch: 8600,
          dyn_rate_maxchange: "0.005",
          dyn_rate_yr_increase_expectation: "0.001",
          dyn_rate_min: "0.000001",
          dyn_rate_max: "0.0000012",
      }
    });
  console.log("add usdt market to overseer succeed...");


  await executeContractByWalletData(walletData, networkMarket.overseer.address, 
    {
        register_market: {
          market_contract: usdcMarketAddress,
          stable_denom: usdcDenom,
          stable_name: "USDC",
          //market config
          threshold_deposit_rate: "0.000000030572045778",
          target_deposit_rate:  "0.000000040762727704",
          buffer_distribution_factor: "0.1",
          //dynrate config
          dyn_rate_epoch: 8600,
          dyn_rate_maxchange: "0.005",
          dyn_rate_yr_increase_expectation: "0.001",
          dyn_rate_min: "0.000001",
          dyn_rate_max: "0.0000012",
      }
    });
  console.log("add usdc market to overseer succeed...");


await executeContractByWalletData(walletData, usdcMarketAddress, 
  {
    register_contracts: {
      overseer_contract: overseer.address,
        interest_model: interestModel.address,
        distribution_model: distributionModel.address,
        collector_contract: walletData.account.address,
        distributor_contract: rewardsDispatcher.address,
        oracle_contract: oraclePyth.address,
        liquidation_contract: liquidationQueue.address,   // list to do deploy new liquidation_contract for market
    }
  });
console.log("configure usdc market succeed...");

// let overseerCfg = await queryWasmContractByWalletData(walletData, networkMarket.overseer.address, {market_list:{}});
// console.log("overseer maket list:\n", JSON.stringify(overseerCfg)); 

  /////////////////////////////////////////////// after deploy all module contracts /////////////////////////////////////////////////////////////////////////
  

  /// update oralce pyth USDT feedid
  /// reference: https://pyth.network/developers/price-feed-ids#cosmwasm-mainnet
  /// set SEI feed id:0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
  /// set USDT feed id: 0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b
  /// set USDC feed id: 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a
  /// set stSEI feed id: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
  /// set bSEI feed id: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
  /// set slsti feed id: 0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819
  ///
  /// update oralce pyth usei feedid
  ///
  await executeContractByWalletData(walletData, oraclePyth.address, 
    {
        config_feed_info: {
          asset: "usei",
          price_feed_id:"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
          price_feed_symbol:"Crypto.ETH/USD",
          price_feed_decimal:8,
          price_feed_age:720000000,
          check_feed_age:true, }
    }
  )
  console.log("configure pyth oracle add asset usei succeed...");


  await executeContractByWalletData(walletData, oraclePyth.address, 
    {
        config_feed_info: {
          asset: usdcDenom,
          price_feed_id:"eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
          price_feed_symbol:"Crypto.USDC/USD",
          price_feed_decimal:8,
          price_feed_age:720000000,
          check_feed_age:true, }
    }
  )
  console.log("configure pyth oracle add asset USDC succeed...");

  await executeContractByWalletData(walletData, oraclePyth.address, 
    {
        config_feed_info: {
          asset: usdtDenom,
          price_feed_id:"2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
          price_feed_symbol:"Crypto.USDT/USD",
          price_feed_decimal:8,
          price_feed_age:720000000,
          check_feed_age:true, }
    }
  )
  console.log("configure pyth oracle add asset USDT succeed...");

  await executeContractByWalletData(walletData, oraclePyth.address, 
      {
          config_feed_info: {
            asset: bSeiToken.address,
            price_feed_id:"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
            price_feed_symbol:"Crypto.ETH/USD",
            price_feed_decimal:8,
            price_feed_age:720000000,
            check_feed_age:true, }
      }
    )
  console.log("configure pyth oracle add asset bSei Token succeed...");

  /// configure feed id fo bstSeiToken
  await executeContractByWalletData(walletData, oraclePyth.address, 
    {
        config_feed_info: {
          asset: "sei1uh2f2yqy9qxq68j5hhn68sl9p9w0rfjzgvjqj8fqs9282ddqlzas8esama",
          price_feed_id:"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
          price_feed_symbol:"Crypto.ETH/USD",
          price_feed_decimal:8,
          price_feed_age:720000000,
          check_feed_age:true, }
    }
  )
  console.log("configure pyth oracle add asset bstSei token succeed...");

  /// configure feed id fo bslstiToken
  await executeContractByWalletData(walletData, oraclePyth.address, 
    {
        config_feed_info: {
          asset: "sei1m59f4um0tclh6zf3skynxk3k7fsvwu5plnp6vuajg6t287nf3atqpy3gtd",
          price_feed_id:"b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
          price_feed_symbol:"Crypto.ATOM/USD",
          price_feed_decimal:8,
          price_feed_age:720000000,
          check_feed_age:true, }
    }
  )
  console.log("configure pyth oracle add asset blsti token succeed...");

  ///configure list to do need to find sparrowswap pair_addresss
  /// reference： https://github.com/SparrowSwap/sparrowswap-contracts/tree/main/artifacts
  let pairAddressUsei2Usdt = "sei1pqcgdn5vmf3g9ncs98vtxkydc6su0f9rk3uk73s5ku2xhthr6avswrwnrx";
  await executeContractByWalletData(walletData, swapExtention.address,   
        {
          update_pair_config: {
            asset_infos:
            [
              { native_token: { denom: "usei" }},
              { native_token: { denom: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt"}},
            ],
            pair_address: pairAddressUsei2Usdt,  //swap usei vs usdt pair 
          },
        }
  )
  console.log("add usei vs usdt pair succeed...");

  let pairAddressUsdc2Usdt = "sei1xetkmk47s32pjn64egwz97mqc05squsysspxh4ugc98k992kfudsfx585r";
  await executeContractByWalletData(walletData, swapExtention.address,   
    {
      update_pair_config: {
        asset_infos:
        [
          { native_token: { denom: usdtDenom}},
          { native_token: { denom: usdcDenom}},
        ],
        pair_address: pairAddressUsdc2Usdt,   //swap usdt vs usdc pair
      },
    }
  )
  console.log("add usdt vs usdc pair succeed...");
  /// set vva price data to 
  /// reference: https://xc-mainnet.pyth.network/api/latest_vaas?ids[]=ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
  let pythOracleAddress = "sei1977nnu5jqatteqgve8tx7nzu9y7eh6cvq0e4g6xjx8tf5wm4nkmsfljunh";
  let dataForSei = "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";
  await executeContractByWalletData(walletData, pythOracleAddress, 
    {
      update_price_feeds: {
        data: [dataForSei,]
      }}, "set sei price", parseCoins("1usei"));
  console.log("set sei price succeed...");

  let dataForUsdc = "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";
  await executeContractByWalletData(walletData, pythOracleAddress, 
    {
      update_price_feeds: {
        data: [dataForUsdc,]
      }}, "set usdc price", parseCoins("1usei"));
  console.log("set usdc price succeed...");

 let dataForUsdt = "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";
  await executeContractByWalletData(walletData, pythOracleAddress, 
    {
      update_price_feeds: {
        data: [dataForUsdt,]
      }}, "set usdt price", parseCoins("1usei"));
  console.log("set usdt price succeed...");

 

  let dataForSlsti = "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";
  await executeContractByWalletData(walletData, pythOracleAddress, 
    {
      update_price_feeds: {
        data: [dataForSlsti,]
      }}, "set slsti price", parseCoins("1usei"));
  console.log("set slsti price succeed...");
  ///
  /// verify staking module
  /// yarn run verify:staking
  ///
  */

  /// udpate hub contract unbond time to 2

  let hubAddress = "sei1gtnjgz5v2ged7npxhfu5a0yp64dvk90wdrkjq4dq7g7apzfrmv6sl6r9w6";

  let configRet = await queryWasmContractByWalletData(walletData, hubAddress, {parameters:{}});
  console.log("hub contract config ret:\n", JSON.stringify(configRet));


  configRet = await queryWasmContractByWalletData(walletData, hub.address, {parameters:{}});
  console.log("hub contract config ret:\n", JSON.stringify(configRet));

  
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  //////###########################testing flow####################################################//
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  
  ///
  /// migrate market contract
  // const filePath = "../krp-market-contracts/artifacts/moneymarket_market.wasm";
  // const newMarketCodeId = await storeCodeByWalletData(walletData, filePath);
  // await migrateContractByWalletData(walletData, market.address,  newMarketCodeId, {});
  // console.log("migrate usdt market succeed...")

  // await migrateContractByWalletData(walletData, usdcMarketAddress,  927, {});
  // console.log("migrate usdc market succeed...")

  // const custodyBseiFilePath = "../krp-market-contracts/artifacts/moneymarket_custody_bsei.wasm";
  // const newCustodyBseiCodeId = await storeCodeByWalletData(walletData, custodyBseiFilePath);
  // await migrateContractByWalletData(walletData, custodyBSei.address,  newCustodyBseiCodeId, {});
  // console.log("migrate custody_bsei succeed...")

  // const overseerFilePath = "../krp-market-contracts/artifacts/moneymarket_overseer.wasm";
  // const newoverSeerCodeId = await storeCodeByWalletData(walletData, overseerFilePath);
  // await migrateContractByWalletData(walletData, overseer.address,  newoverSeerCodeId, {});
  // console.log("migrate overseer succeed...")


  /**
   * repay usdt
   */


  /**
  * configure money market module
  */

  /**
   * deposit usdt 
   */

  /**
   * withdraw usdt
   */

  /**
   * borrow usdt
   */

  /**
   * repay usdt
   */


}

main().catch(console.log);



async function deployOraclePythMock(walletData: WalletData): Promise<void> {

  const filePath = "../krp-market-contracts/artifacts/mock_oracle.wasm";
  const oraclePythMockcodeId = await storeCodeByWalletData(walletData, filePath);
  const label = "OralcePyth Mock service contract";
  const oraclePythMockAddress = await instantiateContractByWalletData(walletData, walletData.account.address, oraclePythMockcodeId, {}, label);
  console.log(`deploy mock oralce service succeed, codeId = ${oraclePythMockcodeId}, address = ${oraclePythMockAddress}`);

  /** set oracle_pyth feed id */
  const executeMsg = { update_price_feed: { id: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814", price: 189000000000 } };
  await executeContractByWalletData(walletData, oraclePythMockAddress, executeMsg);
  console.log(`set oracle_pyth feed id succeed!`);

}


async function deploySwapExtentionMock(walletData: WalletData, usdtDenom?: string, usdcDenom?: string): Promise<void> {
  const filePath = "../swap-extention/artifacts/mock_swap_pair.wasm";
  const swapExtentionCodeId = await storeCodeByWalletData(walletData, filePath);

  const label = "swapExtention Mock service contract";
 // const initMsg = { asset_infos: [{ native_token: { denom: "usei" } }, { native_token: { denom: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/USDT" } }], "swap_0_to_1_price": "121000000" };
 //const swapExtentionAddress = await instantiateContractByWalletData(walletData, walletData.account.address, swapExtentionCodeId, initMsg, label);
  const initMsgUSDT2USDC = { asset_infos: [{ native_token: { denom: usdtDenom}}, { native_token: { denom: usdcDenom}}], "swap_0_to_1_price": "1100000"}
  const swapExtentionAddress = await instantiateContractByWalletData(walletData, walletData.account.address, swapExtentionCodeId, initMsgUSDT2USDC, label); 

  console.log(`deploy mock swapExtention Mock service succeed, codeId = ${swapExtentionCodeId}, address = ${swapExtentionAddress}`);

  // /** set swap price */
  // const executeMsg = { "update0_to1_price": { "new_price": "101000000" } };
  // await executeContractByWalletData(walletData, swapExtentionAddress, executeMsg);
  console.log("set swap mock service succeed!")
}


async function deployMarketForUsdc(walletData: WalletData, network: any, usdcDenom: string): Promise<void> {
  let stable_denom = usdcDenom;
  const admin = chainConfigs?.market?.admin || walletData.address;
  const label = chainConfigs?.market?.label;
  const initMsg = Object.assign(
    {
      atoken_code_id: network.aToken.codeId,
      stable_denom,
      stable_name: "USDC",
    },
    chainConfigs?.market?.initMsg,
    {
      owner_addr: chainConfigs?.market?.initMsg?.owner_addr || walletData.address
    }
  );
  const initCoins = chainConfigs?.market?.initCoins?.map(q => Object.assign({}, q, { denom: q?.denom || stable_denom }));
  const [contract1, contract2] = await instantiateContract2ByWalletData(walletData, admin, network.market.codeId, initMsg, label, initCoins);
  let aTokenAddress = contract2;
  let marketUSDCAddress = contract1;

  console.log(`aToken: `, JSON.stringify(aTokenAddress));
  console.log(`market: `, JSON.stringify(marketUSDCAddress));
}

