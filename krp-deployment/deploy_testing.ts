import { storeCodeByWalletData, instantiateContractByWalletData, executeContractByWalletData, queryWasmContractByWalletData, logChangeBalancesByWalletData, migrateContractByWalletData, queryAddressBalance, getClientDataByWalletData, queryAddressTokenBalance } from "./common";
import { loadingWalletData, loadingStakingData, loadingMarketData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { ConvertPairs, ConvertDeployContracts, DeployContract, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts, WalletData } from "./types";
import { swapExtentionReadArtifact } from "./modules/swap";
import { stakingReadArtifact } from "./modules/staking";
import { marketReadArtifact } from "./modules/market";
import { convertReadArtifact } from "./modules/convert";
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

  const { overseer, market, custodyBSei, interestModel, distributionModel, oracle, aToken, liquidationQueue } = await loadingMarketData(networkMarket);
  if (!overseer.address || !market.address || !custodyBSei.address || !interestModel.address || !distributionModel.address || !oracle.address || !aToken.address || !liquidationQueue.address) {
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
  const oraclepyth_filePath = "../krp-market-contracts/artifacts/moneymarket_oracle_pyth.wasm";
  let oraclePythCodeId = await storeCodeByWalletData(walletData, oraclepyth_filePath);
  await migrateContractByWalletData(walletData, networkMarket.oraclePyth.address, oraclePythCodeId, {});
  console.log("migrate oralce succeed!");
  await executeContractByWalletData(walletData, networkMarket.oraclePyth.address, { change_pyth_contract: { pyth_contract: "sei1977nnu5jqatteqgve8tx7nzu9y7eh6cvq0e4g6xjx8tf5wm4nkmsfljunh" } });
  console.log("configur oralce succeed!");

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
}

main().catch(console.log);
