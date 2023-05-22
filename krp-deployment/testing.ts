import { parseCoins, coins, coin } from "@cosmjs/stargate";
import { storeCode, instantiateContract, executeContract, queryStakingDelegations, queryWasmContract, queryAddressBalance, queryStaking, queryStakingParameters, sendCoin, queryAddressAllBalances, loadAddressesBalances, migrateContract } from "./common";
import { loadingBaseData, loadingStakingData, loadingMarketData } from "./env_data";
import type { DeployContractInfo } from "./types";
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

require("dotenv").config();

async function main(): Promise<void> {

  const { LCD_ENDPOINT, RPC_ENDPOINT, mnemonic, privateKey, wallet, account, mnemonic2, privateKey2, wallet2, account2, validator, stable_coin_denom, prefix, addressesBalances } = await loadingBaseData();

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData();
  if (!hub.address || !bSeiToken.address || !stSeiToken.address || !rewardsDispatcher.address || !validatorsRegistry.address || !reward.address) {
    console.log(`--- --- verify deployed error, missing some deployed staking address info --- ---`);
    process.exit(0);
    return;
  }

  const { overseer, market, custodyBSei, interestModel, distributionModel, oracle, aToken, liquidationQueue } = await loadingMarketData();
  if (!overseer.address || !market.address || !custodyBSei.address || !interestModel.address || !distributionModel.address || !oracle.address || !aToken.address || !liquidationQueue.address) {
    console.log(`--- --- verify deployed error, missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  // create new mnemonic world 
  // const new_mnemonic = "slow police brother honey train asset vital hand alter glare wrong foil steel across laptop butter airport error old print firm figure dune thumb";
  // //let new_wallet = DirectSecp256k1HdWallet.generate(24, {prefix});
  // const new_wallet = await DirectSecp256k1HdWallet.fromMnemonic(new_mnemonic, { prefix });
  // const [new_account] = await new_wallet.getAccounts();
  // console.log("new account address:\n", new_account.address);


  // console.log(`--- --- test stride enter --- ---`);
  // let testAddress = account.address;
  // let qryBalance = await queryAddressAllBalances(LCD_ENDPOINT, testAddress);
  // console.log(`address ${testAddress} balance:\n${JSON.stringify(qryBalance)}`);

  // //##add collateral asset stride stSEI  
  // const ibc_stsei_denom = "ibc/326D2E9FFBF7AE39CC404A58DED81054E23F107BC8D926D5D981C0231F1ECD2D";


  //   let custodystrideCodeId = await storeCode(RPC_ENDPOINT, wallet, "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm");


  //   let custodystrideAddress = await instantiateContract(
  //       RPC_ENDPOINT,
  //       wallet,
  //       custodystrideCodeId
  //       {
  //         basset_info: {
  //           decimals: 6,
  //           name: "staking Sei",
  //           symbol: "stSEI"
  //         },
  //         collateral_token: bSeiToken.address,
  //         liquidation_contract: liquidationQueue.address,
  //         market_contract: market.address,
  //         overseer_contract: overseer.address,
  //         owner: account.address,
  //         reward_contract: reward.address,
  //         stable_denom: stable_coin_denom
  //       },
  //       "custody bond sei contract"
  //     );
  //     custodyBSei.deploy = true;
  //   }
  //   console.log(`custodyBSei: `, JSON.stringify(custodyBSei));
  // }

  // //await sendCoin(RPC_ENDPOINT, wallet, account2.address, "ibc transfer test", coin(10000, ibc_stsei_denom))
  // qryBalance = await queryAddressAllBalances(LCD_ENDPOINT, testAddress);
  // console.log(`address ${testAddress} balance:\n${JSON.stringify(qryBalance)}`);
  // qryBalance = await queryAddressAllBalances(LCD_ENDPOINT,  account2.address);
  // console.log(`address ${account2.address} balance:\n${JSON.stringify(qryBalance)}`);


  // console.log(`--- --- test stride end --- ---`);


  // console.log(`--- --- test migrate contract enter --- ---`);

  // let originalHubCodeId = await storeCode(RPC_ENDPOINT, wallet, hub.filePath,"original contract");
  // console.log(`original hub code id:${originalHubCodeId}`);

  // let originalHubAddress = await instantiateContract(RPC_ENDPOINT, wallet, originalHubCodeId, {
  //   epoch_period: 30,
  //   er_threshold: "1.0",
  //   peg_recovery_fee: "0",
  //   reward_denom: stable_coin_denom,
  //   unbonding_period: 120,
  //   underlying_coin_denom: "usei",
  //   validator: validator // local node validator address
  // }, "lido sei hub")
  // console.log(`original hub address:${originalHubAddress}`);

  // let newHubCodeId = await storeCode(RPC_ENDPOINT, wallet, hub.filePath,"new contract");

  // let  migrateRet = await migrateContract(RPC_ENDPOINT, wallet, originalHubAddress, newHubCodeId, {
  //   reward_dispatcher_contract: "sei1unrtd527zahqrl28lkvl8s766xd35uaj038ra7p0an3n9ja7mvws89p39f",
  //   validators_registry_contract: "sei1z35jvaa9eac0amyn4u8afwg73hk9tpcxjjhqdms2nnw4xqq8aejq07lndl",
  //   stsei_token_contract: "sei1hulpe05w6n7p2n9395xu022nuu2luqxclm0t40e998xqr8f0nzkq4r7hul",
  //   stable_contract: "sei1e8r3m4grvqe632cwulfnnn9jl5rjk8qvwpanyg2azphf4vztnhcss8t4ar",
  //   rewards_contract: "sei130str5m04mxly7kxvz6pf00sh078jjdw6c8may9npaqknrrdad2s69ct02"
  // }, "");
  // console.log(`migrate ret:${migrateRet}`)

  console.log(`--- --- test migrate contract end --- ---`);
  console.log("--- -- test support stSEI and SLSDI asset start --- ---");
  const strideSeiDenom = "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/stsei";
  const slsdiSeiDenom = "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/slsdi";

  //**********************************************config STSEI asset begin***************************************************************
  //*************************************************************************************************************************************
  // let bassertConverter: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-basset-convert/artifacts/krp_basset_converter.wasm",
  //   deploy: false,
  // }
  // bassertConverter.address = "sei1u0rhts9ymup34jvrsjc5yxfjupdphqnxevp78p44923x7uvunp6q9psy7e";
  // bassertConverter.codeId = await storeCode(RPC_ENDPOINT, wallet, bassertConverter.filePath);
  // bassertConverter.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   bassertConverter.codeId,
  //   {
  //     owner: account.address,
  //   },
  //   " basset and native token convert contract"
  // );
  // bassertConverter.deploy = true;
  // console.log(`bassert_convert: `, JSON.stringify(bassertConverter));


  let bstSEI: DeployContractInfo = {
    codeId: 0,
    address: "",
    filePath: "../krp-basset-convert/artifacts/krp_basset_token.wasm",
    deploy: false,
  }
  bstSEI.address = "sei12g87edhzyhwdqg9w9ft95v7uxjxgjtsae3x7v0t0p0sf46nk298sxzu5qp";
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
  //   " bond stsei cw20 token"
  // );
  // bstSEI.deploy = true;
  // console.log(`bst_sei: `, JSON.stringify(bstSEI));

  // register two native coin and cw20 token 
  // console.log();
  // console.log("Do register native coin and cw20 token address enter");
  // const convertRegisterRes = await executeContract(RPC_ENDPOINT, wallet, bassertConverter.address, {
  //   register_tokens: {
  //     native_denom: strideSeiDenom,
  //     basset_token_address: bstSEI.address,
  //   }
  // });

  // let configRes = await queryWasmContract(RPC_ENDPOINT, wallet, bassertConverter.address, { config: {} });
  // console.log("query convert contract config:\n", JSON.stringify(configRes));

  // convert native coin to cw20 token
  // console.log();
  // console.log("Do convert native coin to cw20 token enter");
  // const convertToCw20Res = await executeContract(RPC_ENDPOINT, wallet, bassertConverter.address, { convert_native_to_basset: {} }, "convert native to cw20", coins("100000000", strideSeiDenom))
  // console.log("Do convert native coin to cw20 token ok. \n", convertToCw20Res?.transactionHash);


  // convert cw20 coin to native token
  // console.log();
  // console.log("Do convert cw20 token to native coin enter");
  // const convertToNativeRes = await executeContract(RPC_ENDPOINT, wallet, bstSEI.address, {
  //   send: {
  //     contract: bassertConverter.address,
  //     amount: "1000000",
  //     msg: Buffer.from(JSON.stringify({ convert_basset_to_native: {} })).toString("base64")
  //   }
  // })

  // // store custdy_base contract
    let custodyBaseBstsei: DeployContractInfo = {
      codeId: 0,
      address: "",
      filePath: "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm",
      deploy: false
    };
    custodyBaseBstsei.address = "sei15262862m8qmu5fdcvzvzy0w48tnzhagaz8pq508kjkusvew42qtq3wvyk8";
  // custodyBase.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBase.filePath);
  // custodyBase.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   custodyBase.codeId,
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
  //   "custody bond sei contract"
  // );

  // //overseer contract add collateral to whitelist
  // console.log();
  // console.log("Do overseer's add collateral bstSEI whitelist enter");
  // const overseerWhitelistRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
  //   whitelist: {
  //     name: "Bond stSei",
  //     symbol: "BSTSEI",
  //     collateral_token: bstSEI.address,
  //     custody_contract: custodyBase.address,
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


  // /// configure oracle contract 
  // console.log();
  // console.log("Do oracle.address register_feeder enter");
  // let overseerRegisterbstseiFeederRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   register_feeder: {
  //     asset: bstSEI.address,
  //     feeder: account.address
  //   }
  // });
  // console.log("Do oracle.address register_feeder ok. \n", overseerRegisterbstseiFeederRes?.transactionHash);

  // /// feed price  
  // console.log();
  // console.log("Do oracle.address feed_price enter");
  // let oracleFeedPriceRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   feed_price: {
  //     prices: [[bstSEI.address, "100"]]
  //   }
  // });
  // console.log("Do oracle.address feed_price ok. \n", oracleFeedPriceRes?.transactionHash);

   // // migrage custody_base contract
  // custodyBase.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBase.filePath);
  // let custodyBaseMigrateRes = await migrateContract(RPC_ENDPOINT, wallet, custodyBase.address, custodyBase.codeId, {}, "update custody_base contract");
  // console.log("upgrade custody_base succeed!");

  // // migrage overseer contract
  // overseer.codeId = await storeCode(RPC_ENDPOINT, wallet, overseer.filePath);
  // let overseerMigrateRes = await migrateContract(RPC_ENDPOINT, wallet, overseer.address, overseer.codeId, {}, "upgrade overseer contract");
  // console.log("upgrade overseer contract succeed!");
  // let collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bstSEI.address, { balance: { address: account.address } });
  // console.log("Query bstSEI balance:\n", JSON.stringify(collateralBalanceRes));

  // // migrage custody_bsei contract
  // custodyBSei.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBSei.filePath);
  // let custodyBseiMigrateRes = await migrateContract(RPC_ENDPOINT, wallet, custodyBSei.address, custodyBSei.codeId, {}, "update custody_bsei contract");
  // console.log("upgrade custody_bsei succeed!");

  // //step1: depoist stSei and lock collateral 
  // console.log();
  // console.log("Do custodyBase.address deposit collateral enter");
  // const custodyBSeiDepositCollateralRes = await executeContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   bstSEI.address,
  //   {
  //     send: {
  //       contract: custodyBase.address,
  //       amount: "3000000",
  //       msg: Buffer.from(JSON.stringify({ deposit_collateral: {} })).toString("base64")
  //     }
  //   },
  //   "deposit collateral");
  // console.log("Do custodyBase.address deposit_collateral ok. \n", custodyBSeiDepositCollateralRes?.transactionHash);

  // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bstSEI.address, { balance: { address: account.address } });
  // console.log("Query bstSEI balance:\n", JSON.stringify(collateralBalanceRes));


  // //step2: unlock collateral and withdraw bstSEI 
  // console.log();
  // console.log("Do custodyBase.address unlock collateral enter");
  // const withdrawBSTSeiCollateralRes = await executeContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   overseer.address,
  //   {
  //     unlock_collateral: {
  //       collaterals: [
  //         [bstSEI.address, "2000000"], // (CW20 contract address, Amount to unlock)

  //       ]
  //     }
  //   },
  //   "deposit collateral");
  // console.log("Do custodyBase.address unlock collateral ok. \n", withdrawBSTSeiCollateralRes?.transactionHash);
  // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bstSEI.address, { balance: { address: account.address } });
  // console.log("Query bstSEI balance:\n", JSON.stringify(collateralBalanceRes));


  // /// step2. borrow stable
  // /// Borrows stable coins from Kryptonite.
  // console.log();
  // console.log("Do market.address borrow_stable enter");
  // const marketBorrowStableRes = await executeContract(RPC_ENDPOINT, wallet, market.address, {
  //   borrow_stable: {
  //     borrow_amount: "10000000",
  //     to: account.address
  //   }
  // });
  // console.log("Do market.address borrow_stable ok. \n", marketBorrowStableRes?.transactionHash);

  // /// step3. query borrow stable coin info
  // console.log();
  // console.log("Query market.address borrower_info enter");
  // const marketBorrowerInfoRes = await queryWasmContract(RPC_ENDPOINT, wallet, market.address, {
  //   borrower_info: {
  //     borrower: account.address
  //   }
  // });
  // console.log("Query market.address borrower_info ok. \n", JSON.stringify(marketBorrowerInfoRes));

  // /// step4. repay stable coin 
  // console.log()
  // console.log("repay stable coin");

  // /// step5. query collateral balance
  // console.log("Query custody contract collateral balance enter");
  // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, custodyBase.address, {
  //   borrower: {
  //     address: account.address
  //   }
  // });
  // console.log("Query address borrower collateral balance:\n", JSON.stringify(collateralBalanceRes));
  // // step6: query borrow limit;
  // console.log("Query overseer.address borrow_limit enter");
  // const currentTimestamp2 = Date.parse(new Date().toString()) / 1000;
  // const overseerBorrowLimitRes2 = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, {
  //   borrow_limit: {
  //     borrower: account.address,
  //     block_time: currentTimestamp2
  //   }
  // });
  // console.log("Query address borrow limit:\n", JSON.stringify(overseerBorrowLimitRes2));

  //**********************************************config STSEI asset end*****************************************************************
  //*************************************************************************************************************************************

  //**********************************************config SLSDI asset begin***************************************************************
  //*************************************************************************************************************************************

  // let bassertSlsdiConverter: DeployContractInfo = {
  //   codeId: 0,
  //   address: "",
  //   filePath: "../krp-basset-convert/artifacts/krp_basset_converter.wasm",
  //   deploy: false,
  // }
  // bassertSlsdiConverter.address = "sei1cqh34te8aujsa2jfdgxu7l7cnhwwjx4hstv4g0vj0de5chsh730sukpw6p";
  // // bassertSlsdiConverter.codeId = await storeCode(RPC_ENDPOINT, wallet, bassertSlsdiConverter.filePath);
  // // bassertSlsdiConverter.address = await instantiateContract(RPC_ENDPOINT, wallet, bassertSlsdiConverter.codeId, { owner: account.address, }, "bslsdi and slsdi convert contract");
  // bassertSlsdiConverter.deploy = true;
  // console.log(`bassert slsdi Converter: `, JSON.stringify(bassertSlsdiConverter));


  let bSlsdiToken: DeployContractInfo = {
    codeId: 0,
    address: "",
    filePath: "../krp-basset-convert/artifacts/krp_basset_token.wasm",
    deploy: false,
  }
  bSlsdiToken.address = "sei1r4q3x3ps8tl6lu7j2lmkedht8jegu6uacfm9qq3y79sxffhkl2wq5z8m95";
  // bSlsdiToken.codeId = await storeCode(RPC_ENDPOINT, wallet, bSlsdiToken.filePath);
  // bSlsdiToken.address = await instantiateContract(
  //   RPC_ENDPOINT,
  //   wallet,
  //   bSlsdiToken.codeId,
  //   {
  //     name: "Bonded slsdi",
  //     symbol: "BSLSDI",
  //     decimals: 6,
  //     initial_balances: [],
  //     mint: bassertSlsdiConverter.address,
  //   },
  //   " bond slsdi to cw20 token"
  // );
  // bSlsdiToken.deploy = true;
  // console.log(`bslsdi: `, JSON.stringify(bSlsdiToken));

  // //register two native coin and cw20 token 
  // console.log();
  // console.log("Do register native coin and cw20 token address enter");
  // const convertRegisterRes = await executeContract(RPC_ENDPOINT, wallet, bassertSlsdiConverter.address, {
  //   register_tokens: {
  //     native_denom: slsdiSeiDenom,
  //     basset_token_address: bSlsdiToken.address,
  //   }
  // });

  // configRes = await queryWasmContract(RPC_ENDPOINT, wallet, bassertSlsdiConverter.address, { config: {} });
  // console.log("query slsdi convert contract config:\n", JSON.stringify(configRes));

  // //convert native coin to cw20 token
  // console.log();
  // console.log("Do convert native coin to cw20 token enter");
  // const convertToCw20Res = await executeContract(RPC_ENDPOINT, wallet, bassertSlsdiConverter.address, { convert_native_to_basset: {} }, "convert native to cw20", coins("100000000", slsdiSeiDenom))
  // console.log("Do convert native coin to cw20 token ok. \n", convertToCw20Res?.transactionHash);


  // //convert cw20 coin to native token
  // console.log();
  // console.log("Do convert cw20 token to native coin enter");
  // const convertToNativeRes = await executeContract(RPC_ENDPOINT, wallet, bSlsdiToken.address, {
  //   send: {
  //     contract: bassertSlsdiConverter.address,
  //     amount: "1000000",
  //     msg: Buffer.from(JSON.stringify({ convert_basset_to_native: {} })).toString("base64")
  //   }
  // })
  // console.log("Do convert cw20 token to slsdi native coin ok. \n", convertToNativeRes?.transactionHash);

    let custodyBaseSLSDI: DeployContractInfo = {
      codeId: 0,
      address: "",
      filePath: "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm",
      deploy: false
    };
    custodyBaseSLSDI.address = "sei1ufcfvdp7qkgewye454w2r3m0788zr28caxqwhe4wtcear6a2tkdsf95ggq";
    // custodyBaseSLSDI.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBaseSLSDI.filePath);
    // custodyBaseSLSDI.address = await instantiateContract(
    //   RPC_ENDPOINT,
    //   wallet,
    //   custodyBaseSLSDI.codeId,
    //   {
    //     basset_info: {
    //       decimals: 6,
    //       name: "bond defund SLSDI",
    //       symbol: "bSLSDI"
    //     },
    //     collateral_token: bSlsdiToken.address,
    //     liquidation_contract: liquidationQueue.address,
    //     market_contract: market.address,
    //     overseer_contract: overseer.address,
    //     owner: account.address,
    //     reward_contract: reward.address,
    //     stable_denom: stable_coin_denom
    //   },
    //   "custody bond sei contract"
    // );

    // query overseer contract config
    // console.log();
    // console.log("Do overseer's query collateral whitelist enter");
    // const queryOverseerWhitelistRes = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, {whitelist:{}});
    // console.log("query collateral token list:\n", JSON.stringify(queryOverseerWhitelistRes));


    //overseer contract add collateral to whitelist
    // console.log();
    // console.log("Do overseer's add collateral bstSEI whitelist enter");
    // const overseerWhitelistRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
    //   whitelist: {
    //     name: "Bond slsdi",
    //     symbol: "bSLSDI",
    //     collateral_token: bSlsdiToken.address,
    //     custody_contract: custodyBaseSLSDI.address,
    //     max_ltv: "0.65"
    //   }
    // });
    // console.log("Do overseer's add collateral bstsei whitelist ok. \n", overseerWhitelistRes?.transactionHash);

    //configure liquidate_queue contract
    // console.log();
    // console.log("Do liquidationQueue's whitelist_collateral bslsdi enter");
    // const liquidationQueueWhitelistCollateralRes = await executeContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
    //   whitelist_collateral: {
    //     collateral_token: bSlsdiToken.address,
    //     bid_threshold: "500000000",
    //     max_slot: 30,
    //     premium_rate_per_slot: "0.01"
    //   }
    // });
    // console.log("Do liquidationQueue's whitelist_collateral bslsdi ok. \n", liquidationQueueWhitelistCollateralRes?.transactionHash);


    /// configure oracle contract 
    // console.log();
    // console.log("Do oracle.address register_feeder bslsditoken enter");
    // let overseerRegisterFeederRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
    //   register_feeder: {
    //     asset: bSlsdiToken.address,
    //     feeder: account.address
    //   }
    // });
    // console.log("Do oracle.address register_feeder bslsditoken ok. \n", overseerRegisterFeederRes?.transactionHash);


    // console.log();
    // console.log("Do oracle.address register_feeder bseitoken enter");
    // let overseerRegisterFeederRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
    //   register_feeder: {
    //     asset: bSeiToken.address,
    //     feeder: account.address
    //   }
    // });
    // console.log("Do oracle.address register_feeder bseitoken ok. \n", overseerRegisterFeederRes?.transactionHash);

    /// feed price  
    console.log();
    console.log("Do oracle.address feed_price enter");
    let oracleFeedPriceRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
      feed_price: {
        prices: [
          [bSlsdiToken.address, "200.68"],
          [bstSEI.address, "106.18"],
          [bSeiToken.address, "99.98"],
        ]
      }
    });
    console.log("Do oracle.address feed_price ok. \n", oracleFeedPriceRes?.transactionHash);

    // update collateral max ltv
    // console.log("Do update collater whitelist slsdi ltv enter. ");
    // let updateWhiteList = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {      
    //     update_whitelist: {
    //       collateral_token: bSlsdiToken.address, 
    //       custody_contract: custodyBaseSLSDI.address, 
    //       max_ltv: "0.75" 
    //     }
    // })
    // console.log("Do update collater whitelist ltv enter. \n", updateWhiteList?.transactionHash);
    
    // console.log("Do update collater whitelist bsei ltv enter. ");
    // updateWhiteList = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {      
    //     update_whitelist: {
    //       collateral_token: bSeiToken.address, 
    //       custody_contract: custodyBSei.address, 
    //       max_ltv: "0.6" 
    //     }
    // })
    // console.log("Do update collater whitelist bsei ltv ok. \n", updateWhiteList?.transactionHash);

    // console.log("Do update collater whitelist stSei ltv enter. ");
    // updateWhiteList = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {      
    //     update_whitelist: {
    //       collateral_token: bstSEI.address, 
    //       custody_contract: custodyBaseBstsei.address, 
    //       max_ltv: "0.6" 
    //     }
    // })
    // console.log("Do update collater whitelist stSei ltv ok. \n", updateWhiteList?.transactionHash);

    // let collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSlsdiToken.address, { balance: { address: account.address } });
    // console.log("Query bSlsdiToken balance:\n", JSON.stringify(collateralBalanceRes));

    // //step1: depoist stSei and lock collateral 
    // console.log();
    // console.log("Do custodyBaseSLSDI.address deposit collateral enter");
    // const custodyBSLSDIDepositCollateralRes = await executeContract(
    //   RPC_ENDPOINT,
    //   wallet,
    //   bSlsdiToken.address,
    //   {
    //     send: {
    //       contract: custodyBaseSLSDI.address,
    //       amount: "3000000",
    //       msg: Buffer.from(JSON.stringify({ deposit_collateral: {} })).toString("base64")
    //     }
    //   },
    //   "deposit collateral");
    // console.log("Do custodyBaseSLSDI.address deposit_collateral ok. \n", custodyBSLSDIDepositCollateralRes?.transactionHash);

    // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSlsdiToken.address, { balance: { address: account.address } });
    // console.log("Query bSlsdiToken balance:\n", JSON.stringify(collateralBalanceRes));


    // //step2: unlock collateral and withdraw bstSEI 
    // console.log();
    // console.log("Do custodyBaseSLSDI.address unlock collateral enter");
    // const withdrawBslsdiCollateralRes = await executeContract(
    //   RPC_ENDPOINT,
    //   wallet,
    //   overseer.address,
    //   {
    //     unlock_collateral: {
    //       collaterals: [
    //         [bSlsdiToken.address, "2000000"], // (CW20 contract address, Amount to unlock)

    //       ]
    //     }
    //   },
    //   "deposit collateral");
    // console.log("Do custodyBaseSLSDI.address unlock collateral ok. \n", withdrawBslsdiCollateralRes?.transactionHash);
    // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSlsdiToken.address, { balance: { address: account.address } });
    // console.log("Query bSlsdiToken balance:\n", JSON.stringify(collateralBalanceRes));


    // /// step2. borrow stable
    // /// Borrows stable coins from Kryptonite.
    // console.log();
    // console.log("Do market.address borrow_stable enter");
    // const marketBorrowStableRes = await executeContract(RPC_ENDPOINT, wallet, market.address, {
    //   borrow_stable: {
    //     borrow_amount: "10000000",
    //     to: account.address
    //   }
    // });
    // console.log("Do market.address borrow_stable ok. \n", marketBorrowStableRes?.transactionHash);

    // /// step3. query borrow stable coin info
    // console.log();
    // console.log("Query market.address borrower_info enter");
    // const marketBorrowerInfoRes = await queryWasmContract(RPC_ENDPOINT, wallet, market.address, {
    //   borrower_info: {
    //     borrower: account.address
    //   }
    // });
    // console.log("Query market.address borrower_info ok. \n", JSON.stringify(marketBorrowerInfoRes));

    // /// step4. repay stable coin 
    // console.log()
    // console.log("repay stable coin");

    // /// step5. query collateral balance
    // console.log("Query custody contract collateral balance enter");
    // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, custodyBaseSLSDI.address, {
    //   borrower: {
    //     address: account.address
    //   }
    // });
    // console.log("Query address borrower collateral balance:\n", JSON.stringify(collateralBalanceRes));
    // // step6: query borrow limit;
    // console.log("Query overseer.address borrow_limit enter");
    // const currentTimestamp2 = Date.parse(new Date().toString()) / 1000;
    // const overseerBorrowLimitRes2 = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, {
    //   borrow_limit: {
    //     borrower: account.address,
    //     block_time: currentTimestamp2
    //   }
    // });
    // console.log("Query address borrow limit:\n", JSON.stringify(overseerBorrowLimitRes2));

      /// 2. market deposit_stable test
  /// 2.1. deposit stable to money market
  // console.log();
  // console.log("Do market.address deposit_stable enter");
  // const marketDepositStableRes = await executeContract(RPC_ENDPOINT, wallet, market.address, { deposit_stable: {} }, "", coins(10_000_000_000, stable_coin_denom));
  // console.log("Do market.address deposit_stable ok. \n", marketDepositStableRes?.transactionHash);

      // console.log();
      // console.log("Do hub.address bond enter");
      // const hubBondRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, { bond: {} }, "", parseCoins("5000000usei"));
      // console.log("Do hub.address bond ok. \n", hubBondRes?.transactionHash);

      // let collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSeiToken.address, { balance: { address: account.address } });
      // console.log("Query bSeiToken balance:\n", JSON.stringify(collateralBalanceRes));

      // //step1: depoist bSei and lock collateral 
      // console.log();
      // console.log("Do custodyBsei.address deposit collateral enter");
      // const custodyBSLSDIDepositCollateralRes = await executeContract(
      //   RPC_ENDPOINT,
      //   wallet,
      //   bSeiToken.address,
      //   {
      //     send: {
      //       contract: custodyBSei.address,
      //       amount: "3000000",
      //       msg: Buffer.from(JSON.stringify({ deposit_collateral: {} })).toString("base64")
      //     }
      //   },
      //   "deposit collateral");
      // console.log("Do custodyBsei.address deposit_collateral ok. \n", custodyBSLSDIDepositCollateralRes?.transactionHash);

      // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSeiToken.address, { balance: { address: account.address } });
      // console.log("Query bSeiToken balance:\n", JSON.stringify(collateralBalanceRes));


      // //step2: unlock collateral and withdraw bSEI 
      // console.log();
      // console.log("Do custodyBsei.address unlock collateral enter");
      // const withdrawBslsdiCollateralRes = await executeContract(
      //   RPC_ENDPOINT,
      //   wallet,
      //   overseer.address,
      //   {
      //     unlock_collateral: {
      //       collaterals: [
      //         [bSeiToken.address, "2000000"], // (CW20 contract address, Amount to unlock)
      //       ]
      //     }
      //   },
      //   "deposit collateral");
      // console.log("Do custodyBsei.address unlock collateral ok. \n", withdrawBslsdiCollateralRes?.transactionHash);
      // collateralBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSeiToken.address, { balance: { address: account.address } });
      // console.log("Query bSeiToken balance:\n", JSON.stringify(collateralBalanceRes));


  let address = "sei1vzekeq7mfnxcvlcf9d5gpxhlp2kdzzwg676t4z";
  let collaterRes = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, {collaterals : { borrower: address }})
  console.log("Query collaterals list:\n", JSON.stringify(collaterRes));

  let unlockRes = await queryWasmContract(RPC_ENDPOINT, wallet, custodyBSei.address, {borrower: {address : address}});
  console.log("Query collaterals bsei list:\n", JSON.stringify(unlockRes));


  unlockRes = await queryWasmContract(RPC_ENDPOINT, wallet, custodyBaseBstsei.address, {borrower: {address : address}});
  console.log("Query collaterals bsei list:\n", JSON.stringify(unlockRes));

  
  unlockRes = await queryWasmContract(RPC_ENDPOINT, wallet, custodyBaseSLSDI.address, {borrower: {address : address}});
  console.log("Query collaterals bsei list:\n", JSON.stringify(unlockRes));
  console.log(`--- --- test support stSEI and SLSDI asset end --- ---`);



  //console.log (`--- --- test borrow module start --- ---`);
  // //***step1: bond to get bSei asset
  // console.log();
  // console.log("Do hub.address bond enter");
  // const hubBondRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, { bond: {} }, "", parseCoins("200000usei"));
  // console.log("Do hub.address bond ok. \n", hubBondRes?.transactionHash);

  // //***step2: deposit collateral to custody contract
  // console.log();
  // console.log("Do custodyBSei.address deposit_collateral enter");
  // const custodyBSeiDepositCollateralRes = await executeContract(RPC_ENDPOINT, wallet, bSeiToken.address, {
  //   send: {
  //     contract: custodyBSei.address,
  //     amount: "200000",
  //     msg: Buffer.from(JSON.stringify({ deposit_collateral: {} })).toString("base64")
  //   }
  // });
  // console.log("Do custodyBSei.address deposit_collateral ok. \n", custodyBSeiDepositCollateralRes?.transactionHash);

  // //***step3: lock collateral to get loan amount
  // console.log();
  // console.log("Do overseer.address lock_collateral enter");
  // const overseerLockCollateralRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
  //   lock_collateral: {
  //     collaterals: [[bSeiToken.address, "200000"]]
  //   }
  // });
  // console.log("Do overseer.address lock_collateral ok. \n", overseerLockCollateralRes?.transactionHash);

  // console.log()
  // console.log("Do query oracle price");
  // const ret = await queryWasmContract(RPC_ENDPOINT, wallet, oracle.address, {
  //   price:{
  //     base: bSeiToken.address,   // Asset token contract HumanAddr in String form
  //     quote: stable_coin_denom, 
  //   }
  // })
  // console.log("Query oracle price ok. \n", JSON.stringify(ret))

  // //***step4: borrow stable coin
  // console.log();
  // console.log("Do market.address borrow_stable enter");
  // const marketBorrowStableRes = await executeContract(RPC_ENDPOINT, wallet, market.address, {
  //   borrow_stable: {
  //     borrow_amount: "1000000",
  //     to: account.address
  //   }
  // });
  // console.log("Do market.address borrow_stable ok. \n", marketBorrowStableRes?.transactionHash);

  // //***step5: query borrow info
  // console.log();
  // console.log("Query market.address borrower_info enter");
  // const marketBorrowerInfoRes = await queryWasmContract(RPC_ENDPOINT, wallet, market.address, {
  //   borrower_info: {
  //     borrower: account.address
  //   }
  // });
  // console.log("Query market.address borrower_info ok. \n", JSON.stringify(marketBorrowerInfoRes));

  // console.log (`--- --- test borrow module end --- ---`);
}

main().catch(console.log);
