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
   */

  /// set vva price data to 
  /// eth reference: https://xc-mainnet.pyth.network/api/latest_vaas?ids[]=ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
  let pythOracleAddress = "sei1977nnu5jqatteqgve8tx7nzu9y7eh6cvq0e4g6xjx8tf5wm4nkmsfljunh";
  // let dataForSei = "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";
  // await executeContractByWalletData(walletData, pythOracleAddress, 
  //   {
  //     update_price_feeds: {
  //       data: [dataForSei,]
  //     }}, "set sei price", parseCoins("1usei"));
  // console.log("set sei price succeed...");

  /// usdc reference: https://xc-mainnet.pyth.network/api/latest_vaas?ids[]=eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a
  // let dataForUsdc = "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";
  // await executeContractByWalletData(walletData, pythOracleAddress, 
  //   {
  //     update_price_feeds: {
  //       data: [dataForUsdc,]
  //     }}, "set usdc price", parseCoins("1usei"));
  // console.log("set usdc price succeed...");

 /// usdt reference: https://xc-mainnet.pyth.network/api/latest_vaas?ids[]=2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b
//  let dataForUsdt = "AQAAAAMNAP4O8zUNL25bRWNCnuvbbMTsB52a2thNwDfc8HB3DjU2AqLekBdcHHVAf72/2yeYdC4J/Nz1XJyPE4gFtPmHVs4BAb3x4lgXH0WBI1ZsQAjfyqR7Hjg9MgGtGDPnDKJOYOd3T9we9sawDa8X3PrDzXH7BMAYver/VXhlyBkRW5AADHoAAq8P7wEgq1hz1EzwGlcw0clkHEXKsNSU8/81zS9UKIYNRY/ftHM5SnW3p/UxbwZjW+cDAS1C87bM5CySKDtTG0sBA/1MqQ/B0GilQKmArYdBdS1qcbkM4zjui8JfU5rYensmfIZrJapGb6djrTwLNVmndROJASEDrfLPS+XsyZ9EIP0ABE9LwH1cJ/eJH7T6sGV98wFwlRNXRuBqrAmOLKDhhLhZe4nBAaKOlnCnNIFzI06OpZb1D8WcWOimyDnjlZRmgEgACiAzwcQy1PYmoz6GFRW5f1RX+30tlwj/3L8j+MHBrGHQd43cZuuHz28gYFRXl1TB0SjWQpd4NBWfWomqPu7xLuAAC/QUsCafCqHr4M79t7z0l1UH2Lj4jnhen10h7h2WZRiLGLyWl1XN0C9YwHwY1JiJCORawlq1L7WxS/mei02mQa4ADBUbxKJhp4XvxalJi6O768XSEon9pXeY8seBMvhf9B6oYLv9xZgTehlC9qXSR44Gr9PoL60/ekHHkKLOHCS8IA4BDSAugLWPgLuHYXu6vGhT2XpTQYdWeDuyHIx6Ghinmq6Ya0TwVFeZw0qVew+4Wc3YEWv//y7s2rCw8KzDsY4X73sAD2yFDhwLGgHQ9WejS1hB7dyhiwk4/i3QqNkgWW/OlYtPGQ6sW6H9DXB1n9nw6MruIQw/KjbXiUSUtJZBm2Bg+q4AEM5FTCrjRby/bRLlPxNgoLeDFovBm4l2uHpeL135jf1+CfGQFpIvn/vb9pjSFktonatKcBhP/zaLzpsJAbNz0v4BEVJpni/HpSaefgCjCChHvrYG/IYJtH4vvqo3q6nsEgeiV4OFDRyOvEuIDUwk+hK4192AwJQ6bJMtZr8izWVIXKsBEroXeMdHjCo6uqfcDT1OEy8IakaU4tmIw4i/ZKkAe9CXdf3ZKMNtPPhFrcw4cFHxYc4MDZLXBVA5DX7GNmg3E+EBZH3Z9wAAAAAAGvjNI8KrkSN3MHcLvqCNYQBc3aCYQ0jz9u7LVZY4wLugAAAAABs4cDQBUDJXSAADAAEAAQIABQCdk1M48x54PE41Tzq+GsCAO/gBMoYulR6DxhIUOV2uo5Yribncj9+fNHCaWxBrRy8PObtsqc4EsP1/LpcWiOLlOwAAAAAF9fSIAAAAAAAAr7T////4AAAAAAX2GHcAAAAAAACQ9QEAAAARAAAAFwAAAABkfdn3AAAAAGR92fcAAAAAZH3Z9gAAAAAF9fSIAAAAAAAAr7QAAAAAZH3Z9QkkoXBSbCFTqcAk5L6D7riG96KA64bra3L7L2rvQ/GilpXiuW6ns4Wdqe0lt6Rqkgp3bi/a4Zp7z98rIZIwRS0AAAAAAh0jQAAAAAAAAFrS////+wAAAAACHUlHAAAAAAAAEGgAAAAAAAAAAA4AAAAAZH3Z9wAAAABkfdmnAAAAAGR6SoIAAAAAAh0jQAAAAAAAAFrSAAAAAGR6SoKqhmX0qu1Eo1Bg0Rd6V47uF7SQXIDaSMCDqLWwg7nvQRngm7gFRWraOXmn0cu0ttY7q8Og+OipUJ9or6XEwRzVAAAAAAKM5KAAAAAAAAALuP////sAAAAAAo1FPAAAAAAAABbJAAAAAAAAAAAOAAAAAGR92fcAAAAAZH3ZpwAAAABkekt3AAAAAAKM5KAAAAAAAAALuAAAAABkekt3rowawRDeDwFU3rD5mfvoSQq/Ijfj/eRWeqHQ6P+NZltnpvkwMEIMHJ4/43watrd5Zq+C+ZWUSp/vzjV6IoVKgAAAAAAAAQHCAAAAAAAAAAX////7AAAAAAABAXMAAAAAAAAABQEAAAAHAAAACwAAAABkfdn3AAAAAGR92fcAAAAAZH3Z9gAAAAAAAQHCAAAAAAAAAAcAAAAAZH3Z9naMZW+5yAQu/eNAKQL82qbWz5nU6xN5xu65J3JJBV0CqZXQC7NqY873/SwofcEF/I89k3efBi8JVRsK8+gewwsAAAAAAAGhHwAAAAAAAAAy////+wAAAAAAAaF4AAAAAAAAABMBAAAACQAAAA4AAAAAZH3Z9wAAAABkfdn3AAAAAGR92fYAAAAAAAGhHwAAAAAAAAAyAAAAAGR92fY=";
//   await executeContractByWalletData(walletData, pythOracleAddress, 
//     {
//       update_price_feeds: {
//         data: [dataForUsdt,]
//       }}, "set usdt price", parseCoins("1usei"));
//   console.log("set usdt price succeed...");

 
 /// atom reference: https://xc-mainnet.pyth.network/api/latest_vaas?ids[]=b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819
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
 

  ///* udpate hub contract unbond time to 2
  // let hubAddress = "sei1gtnjgz5v2ged7npxhfu5a0yp64dvk90wdrkjq4dq7g7apzfrmv6sl6r9w6";

  // let configRet = await queryWasmContractByWalletData(walletData, hubAddress, {parameters:{}});
  // console.log("hub contract config ret:\n", JSON.stringify(configRet));


  // configRet = await queryWasmContractByWalletData(walletData, hub.address, {parameters:{}});
  // console.log("hub contract config ret:\n", JSON.stringify(configRet));

  
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

