import { readArtifact, writeArtifact, storeCodeByWalletData, instantiateContractByWalletData, executeContractByWalletData, queryWasmContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { CustodyBaseClient } from "./contracts/CustodyBase.client";
import { loadingWalletData, loadingStakingData, loadingMarketData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { ConvertPairs, DeployContract, WalletData } from "./types";


require("dotenv").config();

async function main(): Promise<void> {


  console.log(`--- --- deploy staking contracts enter --- ---`);

  const walletData = await loadingWalletData();
  const network = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH);
  const network_market = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH);
  const network_swap = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH);
  const network_convert = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH);
  console.log(`--- --- staking contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(network);
  if (!hub.address || !bSeiToken.address || !stSeiToken.address || !rewardsDispatcher.address || !validatorsRegistry.address || !reward.address) {
    console.log(`--- --- verify deployed error, missing some deployed staking address info --- ---`);
    process.exit(0);
    return;
  }

  const { overseer, market, custodyBSei, interestModel, distributionModel, oracle, aToken, liquidationQueue } = await loadingMarketData(network_market);
  if (!overseer.address || !market.address || !custodyBSei.address || !interestModel.address || !distributionModel.address || !oracle.address || !aToken.address || !liquidationQueue.address) {
    console.log(`--- --- verify deployed error, missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  const swapExtention = network_swap?.swapExtention;

  

  console.log("--- -- test support stSEI and SLSTI asset start --- ---");
  //const strideSeiDenom = "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/stsei";
  //const slstiSeiDenom = "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/slsdi";
  const strideSeiDenom = "ibc/326D2E9FFBF7AE39CC404A58DED81054E23F107BC8D926D5D981C0231F1ECD2D";
  const slstiDenom = "ibc/53B6183707AF4C744EE26815613D9C4D0DE40E2C18083EA5B384FAF4F6BB0C06";




  
  //**configure overseer、liquidation_queue、 custody array */
  const nativeDenomList = [
    {
      name: "strideSei",
      address: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/stsei",
      convertNativeToBasset: "1000000",
      convertBassetToNative: "1000000"
    },
    {
      name: "slsdi",
      address: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/slsdi",
      convertNativeToBasset: "1000000",
      convertBassetToNative: "1000000"
    }
  ];


  for (let nativeDenomItem of nativeDenomList) {
    const nativeDenom = nativeDenomItem?.address;
    const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
    const convertPairsNetwork = network_convert?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
    if (!convertPairsConfig || !convertPairsNetwork) {
      continue;
    }
    // const converterConfig = convertPairsConfig?.converter;
    // const btokenConfig = convertPairsConfig?.btoken;
    // const custodyConfig = convertPairsConfig?.custody;

    const converterNetwork = convertPairsNetwork?.converter;
    const btokenNetwork = convertPairsNetwork?.btoken;
    const custodyNetwork = convertPairsNetwork?.custody;


    
    await executeContractByWalletData(walletData, custodyNetwork.address, {update_swap_contract:{ swap_contract : network_swap.}});

    await executeContractByWalletData()


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

  //*************************************************************************************************************************************
  //**********************************************config STSEI asset begin***************************************************************
  //*************************************************************************************************************************************
  // let bassertConverter: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-basset-convert/artifacts/krp_basset_converter.wasm",
  //   deploy: false
  // };
  // bassertConverter.codeId = 526;
  // bassertConverter.address = "sei16lwqvzljtvas043u45tvh8le097xeved6k7nxajwzh85zte7syms22j0ps";
  // bassertConverter.codeId = await storeCode(RPC_ENDPOINT, wallet, bassertConverter.filePath);
  // bassertConverter.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   bassertConverter.codeId,
  //   {
  //     owner: account.address,
  //   },
  //   " basset_stsei and native token convert contract"
  // );
  // bassertConverter.deploy = true;
  // console.log(`bstsei_native_convert: `, JSON.stringify(bassertConverter));

  // let bstSEI: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-basset-convert/artifacts/krp_basset_token.wasm",
  //   deploy: false
  // };
  // bstSEI.codeId = 527;
  // bstSEI.address = "sei1rp8hkjedps3xnpjzrmdrmh3tghjgkmje0akd2qqxlxqa0vz0g63snw78gx";
  // bstSEI.codeId = await storeCode(RPC_ENDPOINT, wallet, bstSEI.filePath);
  // bstSEI.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   bstSEI.codeId,
  //   {
  //     name: "Bonded stSei",
  //     symbol: "stSEI",
  //     decimals: 6,
  //     initial_balances: [],
  //     mint: bassertConverter.address,
  //   },
  //   " bond stsei to cw20 token"
  // );
  // bstSEI.deploy = true;
  // console.log(`bst_sei: `, JSON.stringify(bstSEI));

  //register two native coin and cw20 token
  // console.log();
  // console.log("Do register native coin and cw20 token address enter");
  // let convertRegisterRes = await executeContract(RPC_ENDPOINT, wallet, bassertConverter.address, {
  //   register_tokens: {
  //     native_denom: strideSeiDenom,
  //     basset_token_address: bstSEI.address,
  //   }
  // });

  // let configRes = await queryWasmContract(RPC_ENDPOINT, wallet, bassertConverter.address, { config: {} });
  // console.log("query convert contract config:\n", JSON.stringify(configRes));

  //convert native coin to cw20 token
  // console.log();
  // console.log("Do convert native coin to cw20 token enter");
  // const convertToCw20Res = await executeContract(RPC_ENDPOINT, wallet, bassertConverter.address, { convert_native_to_basset: {} }, "convert native to cw20", coins("100000", strideSeiDenom))
  // console.log("Do convert native coin to cw20 token ok. \n", convertToCw20Res?.transactionHash);

  // let queryBalance = await queryWasmContract(RPC_ENDPOINT, wallet, bstSEI.address, {balance: {address:account.address}})
  // console.log("query bstSei balance:\n", JSON.stringify(queryBalance));

  // //convert cw20 coin to native token
  // console.log();
  // console.log("Do convert cw20 token to native coin enter");
  // const convertToNativeRes = await executeContract(RPC_ENDPOINT, wallet, bstSEI.address, {
  //   send: {
  //     contract: bassertConverter.address,
  //     amount: "100000",
  //     msg: Buffer.from(JSON.stringify({ convert_basset_to_native: {} })).toString("base64")
  //   }
  // })

  // store custdy_base contract
  // let custodyBasebstSEI: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm",
  //   deploy: false
  // };
  // custodyBasebstSEI.codeId = 534;
  // custodyBasebstSEI.address = "sei142dfwrth7j9ax59n8xf606ex6asa6radg3kapapmw2ma9erpkrlq645s4e";
  //custodyBasebstSEI.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBasebstSEI.filePath);
  // custodyBasebstSEI.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   custodyBasebstSEI.codeId,
  //   {
  //     basset_info: {
  //       decimals: 6,
  //       name: "stride stSei",
  //       symbol: "stSEI"
  //     },
  //     collateral_token: bstSEI.address,
  //     liquidation_contract: liquidationQueue.address,
  //     market_contract: market.address,
  //     overseer_contract: overseer.address,
  //     owner: account.address,
  //     reward_contract: reward.address,
  //     stable_denom: stable_coin_denom
  //   },
  //   "custody bond stsei contract"
  // );
  //console.log(`custody_base_bstSEI: `, JSON.stringify(custodyBasebstSEI));

  // overseer contract add collateral to whitelist
  // console.log();
  // console.log("Do overseer's add collateral bstSEI whitelist enter");
  // const overseerWhitelistRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
  //   whitelist: {
  //     name: "Bond stSei",
  //     symbol: "bSTSEI",
  //     collateral_token: bstSEI.address,
  //     custody_contract: custodyBasebstSEI.address,
  //     max_ltv: "0.65"
  //   }
  // });
  // console.log("Do overseer's add collateral bstsei whitelist ok. \n", overseerWhitelistRes?.transactionHash);

  // configure liquidate_queue contract
  // console.log();
  // console.log("Do liquidationQueue's whitelist_collateral bstSEI enter");
  // const liquidationQueueWhitelistCollateralRes = await executeContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
  //   whitelist_collateral: {
  //     collateral_token: bstSEI.address,
  //     bid_threshold: "500000000",
  //     max_slot: 30,
  //     premium_rate_per_slot: "0.01"
  //   }
  // });
  // console.log("Do liquidationQueue's whitelist_collateral bstSEI ok. \n", liquidationQueueWhitelistCollateralRes?.transactionHash);

  /// configure oracle contract
  // console.log();
  // console.log("Do oracle.address register_feeder enter");
  // let overseerRegisterFeederRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   register_feeder: {
  //     asset: bstSEI.address,
  //    // feeder: account.address
  //    feeder: "sei1xm3mccak0yjfts96jszdldxka6xkw00ywv6au0"
  //   }
  // });
  // console.log("Do oracle.address register_feeder ok. \n", overseerRegisterFeederRes?.transactionHash);

  /// feed price
  // console.log();
  // console.log("Do oracle.address feed_price enter");
  // let oracleFeedPriceRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   feed_price: {
  //     prices: [[bstSEI.address, "100"]]
  //   }
  // });
  // console.log("Do oracle.address feed_price ok. \n", oracleFeedPriceRes?.transactionHash);

  // console.log();
  // console.log("Query oracle bstSEI price enter");
  // let oracleQuery = await queryWasmContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   prices: {}
  // });
  // console.log("Query price :\n", JSON.stringify(oracleQuery));
  //*************************************************************************************************************************************
  //**********************************************deploy SLSTI asset begin*********************************************************
  //*************************************************************************************************************************************

  // let bassertSlstiConverter: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-basset-convert/artifacts/krp_basset_converter.wasm",
  //   deploy: false
  // };

  // bassertSlstiConverter.address = "sei1s5qxh87j33n059xgpfghgxv26fkyr2kzz76nncqwaapcp64nj95s38dcjr";
  // // bassertSlstiConverter.address = await instantiateContract(RPC_ENDPOINT, wallet, bassertConverter.codeId, { owner: account.address, }, "bslsti and slsti convert contract");
  // bassertSlstiConverter.deploy = true;
  // console.log(`bassert slsdi Converter: `, JSON.stringify(bassertSlstiConverter));

  // let bSlstiToken: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-basset-convert/artifacts/krp_basset_token.wasm",
  //   deploy: false
  // };

  // bSlstiToken.codeId = await storeCode(RPC_ENDPOINT, wallet, bSlstiToken.filePath);
  //bSlstiToken.address = "sei17qz3cgc9ehyt8n0sv8cyk3ahc4pl9qxhxtf883kc8tef4lfp7hvsk885el";
  // bSlstiToken.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   bstSEI.codeId,
  //   {
  //     name: "Bonded slsdi",
  //     symbol: "BSLSTI",
  //     decimals: 6,
  //     initial_balances: [],
  //     mint: bassertSlstiConverter.address,
  //   },
  //   " slsdi cw20 token"
  // );
  // bSlstiToken.deploy = true;
  // console.log(`bslsdi: `, JSON.stringify(bSlstiToken));

  //register two native coin and cw20 token
  // console.log();
  // console.log("Do register native coin and cw20 token address enter");
  // const convertSlsdiRegisterRes = await executeContract(RPC_ENDPOINT, wallet, bassertSlstiConverter.address, {
  //   register_tokens: {
  //     native_denom: slstiDenom,
  //     basset_token_address: bSlstiToken.address,
  //   }
  // });

  // //convert native coin to cw20 token
  // console.log();
  // console.log("Do convert native coin to cw20 token enter");
  // const convertToCw20Res = await executeContract(RPC_ENDPOINT, wallet, bassertSlstiConverter.address, { convert_native_to_basset: {} }, "convert native to cw20", coins("100000", slstiDenom))
  // console.log("Do convert native coin to cw20 token ok. \n", convertToCw20Res?.transactionHash);

  // let queryBalance = await queryWasmContract(RPC_ENDPOINT, wallet, bSlstiToken.address, {balance: {address:account.address}})
  // console.log("query bSlstiToken balance:\n", JSON.stringify(queryBalance));

  // //convert cw20 coin to native token
  // console.log();
  // console.log("Do convert cw20 token to native coin enter");
  // const convertToNativeRes = await executeContract(RPC_ENDPOINT, wallet, bSlstiToken.address, {
  //   send: {
  //     contract: bassertSlstiConverter.address,
  //     amount: "100000",
  //     msg: Buffer.from(JSON.stringify({ convert_basset_to_native: {} })).toString("base64")
  //   }
  // })
  //  queryBalance = await queryWasmContract(RPC_ENDPOINT, wallet, bSlstiToken.address, {balance: {address:account.address}})
  // console.log("query bSlstiToken balance:\n", JSON.stringify(queryBalance));

  // let custodyBasebSLSTI: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm",
  //   deploy: false
  // };
  // custodyBasebSLSTI.codeId = 534;
  // custodyBasebSLSTI.address = "sei1zhzyrf7pmacss6zu43yyg5lkr0ulcs80d4ym75yfjx60pjhqv98s5es07p";
  //custodyBasebSLSTI.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBasebSLSTI.filePath);
  // custodyBasebSLSTI.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   custodyBasebstSEI.codeId,
  //   {
  //     basset_info: {
  //       decimals: 6,
  //       name: "bond defund SLSTI",
  //       symbol: "bSLSTI"
  //     },
  //     collateral_token: bSlstiToken.address,
  //     liquidation_contract: liquidationQueue.address,
  //     market_contract: market.address,
  //     overseer_contract: overseer.address,
  //     owner: account.address,
  //     reward_contract: reward.address,
  //     stable_denom: stable_coin_denom
  //   },
  //   "custody bond sei contract"
  // );

  //overseer contract add collateral to whitelist
  // console.log();
  // console.log("Do overseer's add collateral bstSEI whitelist enter");
  // const overseerSlsdiWhitelistRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
  //   whitelist: {
  //     name: "Bond slsdi",
  //     symbol: "bSLSTI",
  //     collateral_token: bSlstiToken.address,
  //     custody_contract: custodyBasebSLSTI.address,
  //     max_ltv: "0.70"
  //   }
  // });
  // console.log("Do overseer's add collateral bstsei whitelist ok. \n", overseerSlsdiWhitelistRes?.transactionHash);

  // //configure liquidate_queue contract
  // console.log();
  // console.log("Do liquidationQueue's whitelist_collateral bslsdi enter");
  // const liquidationQueueWhitelistCollateraSlsdilRes = await executeContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
  //   whitelist_collateral: {
  //     collateral_token: bSlstiToken.address,
  //     bid_threshold: "500000000",
  //     max_slot: 30,
  //     premium_rate_per_slot: "0.01"
  //   }
  // });
  // console.log("Do liquidationQueue's whitelist_collateral bslsdi ok. \n", liquidationQueueWhitelistCollateraSlsdilRes?.transactionHash);

  // console.log();
  // console.log("Do oracle.address register_feeder enter");
  // let overseerRegisterSlsdiFeederRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   register_feeder: {
  //     asset: bSlstiToken.address,
  //     feeder: account.address
  //   }
  // });
  // console.log("Do oracle.address register_feeder ok. \n", overseerRegisterSlsdiFeederRes?.transactionHash);

  // console.log();
  // console.log("Do oracle.address feed_price enter");
  // let oracleFeedSlsdiPriceRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   feed_price: {
  //     prices: [[bSlstiToken.address, "200"]]
  //   }
  // });
  // console.log("Do oracle.address feed_price ok. \n", oracleFeedSlsdiPriceRes?.transactionHash);
  // console.log("Do oracle.address register_feeder enter");
  // let overseerRegisterFeederRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   register_feeder: {
  //     asset: bSlstiToken.address,
  //     // feeder: account.address
  //     feeder: "sei1xm3mccak0yjfts96jszdldxka6xkw00ywv6au0"
  //   }
  // });
  // console.log("Do oracle.address register_feeder ok. \n", overseerRegisterFeederRes?.transactionHash);

  // console.log();
  // console.log(`# new contracts uploaded codeId [optional]`);
  // console.log(`convertCodeId: "${bassertConverter.codeId}"`);
  // console.log(`bAssetTokenCodeId: "${bstSEI.codeId}"`);
  // console.log(`custodyBaseCodeId: "${custodyBasebstSEI.codeId}"`);

  // console.log();
  // console.log(`# new contracts deployed address [optional]`);
  // console.log(`bstseiConvertAddress: "${bassertConverter.address}"`);
  // console.log(`bstseiAddress: "${bstSEI.address}"`);
  // console.log(`custodyBaseBstseiAddress: "${custodyBasebstSEI.address}"`);
  // console.log(`bslstiConvertAddress: "${bassertSlstiConverter.address}"`);
  // console.log(`bslstiTokenAddress: "${bSlstiToken.address}"`);
  // console.log(`custodyBaseBslstiAddress: "${custodyBasebSLSTI.address}"`);

  // console.log();
  // console.log(`--- --- deployed staking contracts info --- ---`);
  //*************************************************************************************************************************************
  //**********************************************deploy SLSTI STSEI asset end***********************************************************
  //*************************************************************************************************************************************
}

main().catch(console.log);
