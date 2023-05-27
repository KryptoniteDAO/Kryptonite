import { parseCoins } from "@cosmjs/proto-signing";
import { readArtifact, writeArtifact, storeCodeByWalletData, instantiateContractByWalletData, executeContractByWalletData,
   queryWasmContractByWalletData, logChangeBalancesByWalletData, migrateContractByWalletData, queryAddressBalance,
   getClientDataByWalletData, queryAddressTokenBalance, queryWasmContract } from "./common";
import { CustodyBaseClient } from "./contracts/CustodyBase.client";
import { loadingWalletData, loadingStakingData, loadingMarketData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { ConvertPairs, ConvertDeployContracts, DeployContract, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts, WalletData } from "./types";
require("dotenv").config();

async function main(): Promise<void> {


  const walletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH);
  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH);
  const networkSwap = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH);
  //const networkConvert = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH);

  console.log();

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub.address || !bSeiToken.address || !stSeiToken.address || !rewardsDispatcher.address || !validatorsRegistry.address || !reward.address) {
    console.log(`--- --- verify deployed error, missing some deployed staking address info --- ---`);
    process.exit(0);
    return;
  }

  const { overseer, market, custodyBSei, interestModel, distributionModel, oraclePyth, aToken, liquidationQueue } = await loadingMarketData(networkMarket);
  if (!overseer.address || !market.address || !custodyBSei.address || !interestModel.address || !distributionModel.address  || !oraclePyth.address || !aToken.address || !liquidationQueue.address) {
    console.log(`--- --- verify deployed error, missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  const swapExtention = networkSwap?.swapExtention;

  


  //const strideSeiDenom = "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/stsei";
  //const slstiSeiDenom = "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/slsdi";
  const strideSeiDenom = "ibc/326D2E9FFBF7AE39CC404A58DED81054E23F107BC8D926D5D981C0231F1ECD2D";
  const slstiDenom = "ibc/53B6183707AF4C744EE26815613D9C4D0DE40E2C18083EA5B384FAF4F6BB0C06";



   //**update overseer */
  
   const filePath = chainConfigs?.overseer?.filePath || "../krp-market-contracts/artifacts/moneymarket_overseer.wasm";
   //let overseerCodeId = await storeCodeByWalletData(walletData, filePath);
    let overseerCodeId = 645; 
   // await migrateContract(walletData.RPC_ENDPOINT, walletData.wallet, networkMarket.overseer.address, overseerCodeId, {}, "");
  //await migrateContractByWalletData(walletData, networkMarket.overseer.address, overseerCodeId, {})

  // let userAddress = "sei16j0hypm83zlctv7czky9n0me0k03prel3ynczn";

  // let balance = await queryAddressTokenBalance(walletData.signingCosmWasmClient, userAddress, bSeiToken.address);
  // console.log("balance:", JSON.stringify(balance));
  
  //** configure oralce pyth_contract address */

  // deployOraclePyth(walletData, networkMarket);

  // let marketState = await queryWasmContractByWalletData(walletData, networkMarket.market.address, {state:{}})
  // console.log("market state:\n", JSON.stringify(marketState));

  /**
   * configure overseer and liquidation_queue oracle contract address
   */
  // let configRet = await executeContractByWalletData(walletData, networkMarket.overseer.address, {update_config: {oracle_contract: oraclePyth.address}})
  // console.log("configure overseer contract parameter oracle contract address succeed.");

  // let configureLiquidationQueue = await executeContractByWalletData(walletData, liquidationQueue.address, {update_config:{oracle_contract:oraclePyth.address}})
  // console.log("configure liquidationQueue contract parameter oracle contract address succeed.")


  /***
   * migrate hub and reward dispatcher
   */

  // let update_filePath = "../krp-staking-contracts/artifacts/basset_sei_hub.wasm";
  // let update_CodeId = await storeCodeByWalletData(walletData, update_filePath);
  // await migrateContractByWalletData(walletData, hub.address, update_CodeId, 
  //   {
  //   reward_dispatcher_contract: rewardsDispatcher.address,
  //   validators_registry_contract: validatorsRegistry.address,
  //   stsei_token_contract: stSeiToken.address,
  //   rewards_contract: reward.address,
  //   });
  // console.log("update hub contract succeed.");
  // let update_filePath = "../krp-staking-contracts/artifacts/basset_sei_rewards_dispatcher.wasm";
  // let update_CodeId = await storeCodeByWalletData(walletData, update_filePath);
  // await migrateContractByWalletData(walletData, rewardsDispatcher.address, update_CodeId, {});
  // console.log("update reward dispatcher contract succeed.");


  // console.log();
  // console.log(`Do hub.address update_global_index enter.`);

  // let dispatcherConfigRes = await queryWasmContractByWalletData(walletData, rewardsDispatcher.address,{config :{}});
  // console.log(`${JSON.stringify(dispatcherConfigRes)}`);

  // await executeContractByWalletData(walletData, rewardsDispatcher.address, 
  //   {
  //     update_oracle_contract : {
  //     oracle_contract: oraclePyth.address, 
  //   }})
  // console.log("configure reward dispatcher oracle succeed.")
  // await executeContractByWalletData(walletData, rewardsDispatcher.address, 
  //   {
  //     update_swap_contract : {
  //       swap_contract: swapExtention.address,
  //   }})
  //  console.log("configure reward dispatcher oracle succeed.")
  // dispatcherConfigRes = await queryWasmContractByWalletData(walletData, rewardsDispatcher.address,{config :{}});
  // console.log(`${JSON.stringify(dispatcherConfigRes)}`);

//   await executeContractByWalletData(walletData, networkMarket.oraclePyth.address, 
//     {
//         config_feed_info: {
//           asset: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt",
//           price_feed_id:"5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
//           price_feed_symbol:"Crypto.USDT/USD",
//           price_feed_decimal:8,
//           price_feed_age:720000000,
//           check_feed_age:true, }
//     }
// )
// console.log("configure pyth oracle add asset usdt succeed.");

  // const doRes = await executeContractByWalletData(
  //   walletData,
  //   hub.address,
  //   {
  //     update_global_index: {}
  //   },
  //   "send rewards",
  //   parseCoins("")
  // );
  // console.log(`Do hub.address update_global_index ok. \n${doRes?.transactionHash}`);
  // console.log(`${JSON.stringify(doRes)}`)

  //**configure overseer、liquidation_queue、 */
  // await executeContractByWalletData(walletData, networkMarket.overseer.address, {update_config : {oracle_contract: networkMarket.oraclePyth.address}})
  // await executeContractByWalletData(walletData, networkMarket.liquidationQueue.address, {update_config : {oracle_contract: networkMarket.oraclePyth.address}})

  //**configure pyth oracle */
  // await executeContractByWalletData(walletData, networkMarket.oraclePyth.address, 
  //       {
  //           config_feed_info: {
  //             asset: "usei",
  //             price_feed_id:"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  //             price_feed_symbol:"Crypto.ETH/USD",
  //             price_feed_decimal:8,
  //             price_feed_age:720000000,
  //             check_feed_age:true, }
  //       }
  // )
  // console.log("configure pyth oracle add asset usei succeed.");



  // await executeContractByWalletData(walletData, networkMarket.oraclePyth.address, 
  //   {
  //       config_feed_info: {
  //         asset: "sei10p4e7pk2crzpyfxsrgxefq2yh4ptvuehcmcweg8f37ajshegnfxqhvxs4s",
  //         price_feed_id:"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  //         price_feed_symbol:"Crypto.ETH/USD",
  //         price_feed_decimal:8,
  //         price_feed_age:720000000,
  //         check_feed_age:true, }
  //   }
  // )
  // console.log("configure pyth oracle add asset bSei Token succeed.");

  // await executeContractByWalletData(walletData, networkMarket.oraclePyth.address, 
  //   {
  //       config_feed_info: {
  //         asset: "sei17ajcveawtzazmwfa2yjs7ykmqhgr3skn44dlm9ucc9l2wc5seals3lexh2",
  //         price_feed_id:"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  //         price_feed_symbol:"Crypto.ETH/USD",
  //         price_feed_decimal:8,
  //         price_feed_age:720000000,
  //         check_feed_age:true, }
  //   }
  // )
  // console.log("configure pyth oracle add asset bstSei token succeed.");

  // await executeContractByWalletData(walletData, networkMarket.oraclePyth.address, 
  //   {
  //       config_feed_info: {
  //         asset: "sei1ka3w6ru87dlzgu0xq3uts8ur7lqgzu32h5n5vjqtewps56mamtaqd7vr5l",
  //         price_feed_id:"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  //         price_feed_symbol:"Crypto.ETH/USD",
  //         price_feed_decimal:8,
  //         price_feed_age:720000000,
  //         check_feed_age:true, }
  //   }
  // )
  // console.log("configure pyth oracle add asset blsti token succeed.");

  // console.log("configure swap extension whitelist enter")
  // await executeContractByWalletData(walletData, swapExtention.address, 
  //   {
  //     set_whitelist: {
  //     caller:"sei18cefcl58v7zr3k9zkgnzj8vnhjqr5790qym0xjn7qxucdtj7ywtq2hmlxr",
  //     is_whitelist: true,}})
  // console.log("configure swap extension add reward address to whitelist succeed.");

  // await executeContractByWalletData(walletData, swapExtention.address, 
  //   {
  //     set_whitelist: {
  //     caller:"sei10fp080zlnlny5tc26qsw24vjujppu982za46smyuk2rd4d5lyvkqk7q458",
  //     is_whitelist: true,}})
  // console.log("configure swap extension add reward dispatcher address to whitelist succeed.");

  // await executeContractByWalletData(walletData, swapExtention.address, 
  //   {
  //     set_whitelist: {
  //     caller:"sei1srmw733n0cfkh9twuh5wwt43s4xj9d3x5q5zgy6q9m8qh7vsgjkqn6q723",
  //     is_whitelist: true,}})
  // console.log("configure swap extension add custody bsei address to whitelist succeed.");

  // await executeContractByWalletData(walletData, swapExtention.address, 
  //   {
  //     update_pair_config: {
  //       asset_infos: [
  //         {
  //           native_token:
  //             { denom: "usei"}
  //         },
  //         {
  //           native_token:
  //           {denom: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt"}
  //         }],
  //       pair_address:"sei1pqcgdn5vmf3g9ncs98vtxkydc6su0f9rk3uk73s5ku2xhthr6avswrwnrx"}
  //   })
  // console.log("configure swap extension add a swap pair succeed ")
      
   //** configure swap extention */

  //  let overseerRet = await queryWasmContractByWalletData(walletData, networkMarket.overseer.address, {config:{}})
  //  console.log("ret:",JSON.stringify(overseerRet));

   
  //  let liquidationRet = await queryWasmContractByWalletData(walletData, networkMarket.liquidationQueue.address, {config:{}})
  //  console.log("ret:",JSON.stringify(liquidationRet));

  // await executeContractByWalletData(walletData, networkMarket.liquidationQueue.address, {update_config : {oracle_contract: networkMarket.oraclePyth.address}})
   
  // //** custody array */
  // const nativeDenomList = [
  //   {
  //     name: "strideSei",
  //     address: "ibc/326D2E9FFBF7AE39CC404A58DED81054E23F107BC8D926D5D981C0231F1ECD2D",
  //     convertNativeToBasset: "1000000",
  //     convertBassetToNative: "1000000"
  //   },
  //   {
  //     name: "slsdi",
  //     address: "ibc/53B6183707AF4C744EE26815613D9C4D0DE40E2C18083EA5B384FAF4F6BB0C06",
  //     convertNativeToBasset: "1000000",
  //     convertBassetToNative: "1000000"
  //   }
  // ];


  // for (let nativeDenomItem of nativeDenomList) {
  //   const nativeDenom = nativeDenomItem?.address;
  //   const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
  //   const convertPairsNetwork = networkConvert?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  //   if (!convertPairsConfig || !convertPairsNetwork) {
  //     continue;
  //   }
  //   // const converterConfig = convertPairsConfig?.converter;
  //   // const btokenConfig = convertPairsConfig?.btoken;
  //   // const custodyConfig = convertPairsConfig?.custody;

  //   const converterNetwork = convertPairsNetwork?.converter;
  //   const btokenNetwork = convertPairsNetwork?.btoken;
  //   const custodyNetwork = convertPairsNetwork?.custody;

  //   await executeContractByWalletData(walletData, custodyNetwork.address, { update_swap_contract:{ swap_contract : networkSwap.swapExtention.address}});

  //   await executeContractByWalletData(walletData, custodyNetwork.address, { update_swap_denom: {swap_denom : "usei", is_add: true}});

  // }
  //**********************************************upgrade custody_bsei and overseer contract begin*************************************

  //   // migrage custody_base contract
  // console.log("upgrade custody_bsei contract enter");
  // custodyBSei.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBSei.filePath);
  // let custodyBaseMigrateRes = await migrateContract(RPC_ENDPOINT, wallet, custodyBSei.address, custodyBSei.codeId, {}, "update custody_bsei contract");
  // console.log("upgrade custody_bsei succeed!");

  // migrage overseer contract
  // console.log("upgrade overseer contract enter");
  // overseer.codeId = await storeCode(RPC_ENDPOINT, wallet, overseer.filePath);
  // let overseerMigrateRes = await migrateContract(RPC_ENDPOINT, wallet, overseer.address, overseer.codeId, {}, "upgrade overseer contract");
  // console.log("upgrade overseer contract succeed!");

  //**********************************************upgrade custody_bsei and overseer contract end*****************************************

  /**
   * test market contract temp
   */

  /** update market contract */

  
  /** External test network */
  //  let marketAddress = "sei1wjnjkjlj9qegs9zajkz44rzupq86lcqp0ak657x4cuqpqpkz5e9q889pmc";
   

  /** Internal test network */
   let marketAddress = "sei18js0g9k77ujs0d8sy64wdz8p09npf3k3uw4wc97hwcncnhaklt2sdj020q";
  // let marketFilePath = "../krp-market-contracts/artifacts/moneymarket_market.wasm";
  // let marketNewCodeId = await storeCodeByWalletData(walletData, marketFilePath);
  // await migrateContractByWalletData(walletData, marketAddress, 720, {});
  // console.log("update market contract succeed!");

  let marketStateRes = await queryWasmContractByWalletData(walletData, marketAddress, {state:{}});
  console.log("query maket state res:\n", JSON.stringify(marketStateRes));

  let epochStateRes = await queryWasmContractByWalletData(walletData, marketAddress, {epoch_state:{}});
  console.log("query epoch state res:\n", JSON.stringify(epochStateRes));

  let borrowerAddress = "sei1vfxlpud2txs7en5z7qgf4qk93e64p7r3qlqjpn";
  let borrowInfoRes = await queryWasmContractByWalletData(walletData, marketAddress, {borrower_info:{borrower: borrowerAddress}})
  console.log("query borrower info res:\n", JSON.stringify(borrowInfoRes));

  //*********************************************************market contract test end */

  /**
   * testing update_globle_index reward
   */
  let rewardAddress = "sei1ma823rlqazgs0dqawyncwggpj0t5xwjrw03gvyal0p4tnxdhl3rspujl20";
  let rewardRes = await queryWasmContractByWalletData(walletData, rewardAddress, {state:{}})
  console.log("reward response:\n", JSON.stringify(rewardRes));
 
}

main().catch(console.log);


async function deployOraclePyth(walletData: WalletData, network: any): Promise<void> {
  if ("atlantic-2" !== walletData.chainId) {
    return;
  }

  if (!network?.oraclePyth?.address) {
    if (!network?.oraclePyth) {
      network.oraclePyth = {};
    }

    if (!network?.oraclePyth?.codeId || network?.oraclePyth?.codeId <= 0) {
      const filePath = chainConfigs?.oraclePyth?.filePath || "../krp-market-contracts/artifacts/moneymarket_oracle_pyth.wasm";
      network.oraclePyth.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.oraclePyth?.codeId > 0) {
      const admin = chainConfigs?.oraclePyth?.admin || walletData.address;
      const label = chainConfigs?.oraclePyth?.label;
      const initMsg = Object.assign({}, chainConfigs?.oraclePyth?.initMsg, {
        owner: chainConfigs?.oraclePyth?.initMsg?.owner || walletData.address,
        pyth_contract: "sei1977nnu5jqatteqgve8tx7nzu9y7eh6cvq0e4g6xjx8tf5wm4nkmsfljunh",
      });
      network.oraclePyth.address = await instantiateContractByWalletData(walletData, admin, network.oraclePyth.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.oraclePyth.deploy = true;
    }
    console.log(`oraclePyth: `, JSON.stringify(network?.oraclePyth));
  }
}