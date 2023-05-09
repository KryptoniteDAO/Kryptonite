import { parseCoins, coins, coin } from "@cosmjs/stargate";
import { executeContract, queryWasmContract, sendCoin, loadAddressesBalances, sendCoinToOtherAddress } from "./common";
import { loadingBaseData, loadingMarketData, loadingStakingData } from "./env_data";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- verify deployed market contracts enter --- ---`);

  const { LCD_ENDPOINT, RPC_ENDPOINT, mnemonic, privateKey, wallet, account, mnemonic2, privateKey2, wallet2, account2, validator, stable_coin_denom, prefix, addressesBalances } =
    await loadingBaseData();

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

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  // //just a few simple tests to make sure the contracts are not failing
  // //for more accurate tests we must use integration-tests repo

  /// 2. market deposit_stable test
  /// 2.1. deposit stable to money market
  // console.log();
  // console.log("Do market.address deposit_stable enter");
  // const marketDepositStableRes = await executeContract(RPC_ENDPOINT, wallet, market.address, { deposit_stable: {} }, "", coins(1_000_000, stable_coin_denom));
  // console.log("Do market.address deposit_stable ok. \n", marketDepositStableRes?.transactionHash);

  ///  Send stable coin to other address
  const senderAddress = account.address;
  const receiverAddress = account2.address;
  let senderUseiBalance = addressesBalances.find(v => senderAddress === v?.address && "usei" === v?.balance?.denom)?.balance?.amount;
  let senderStableCoinBalance = addressesBalances.find(v => senderAddress === v?.address && stable_coin_denom === v?.balance?.denom)?.balance?.amount;
  let receiverUseiBalance = addressesBalances.find(v => receiverAddress === v?.address && "usei" === v?.balance?.denom)?.balance?.amount;
  let receiverStableCoinBalance = addressesBalances.find(v => receiverAddress === v?.address && stable_coin_denom === v?.balance?.denom)?.balance?.amount;
  const sendUseiAmount = "10";
  const sendStableCoinAmount = "10";
  await sendCoinToOtherAddress(LCD_ENDPOINT, RPC_ENDPOINT, wallet, senderAddress, receiverAddress, "usei", sendUseiAmount, senderUseiBalance, receiverUseiBalance);
  await sendCoinToOtherAddress(LCD_ENDPOINT, RPC_ENDPOINT, wallet, senderAddress, receiverAddress, stable_coin_denom, sendStableCoinAmount, senderStableCoinBalance, receiverStableCoinBalance);

  /// 3. CustodyBSei deposits collateral.
  /// Issued when a user sends bAsset tokens to the Custody contract.
  console.log();
  console.log("Do custodyBSei.address deposit_collateral enter");
  const custodyBSeiDepositCollateralRes = await executeContract(RPC_ENDPOINT, wallet, bSeiToken.address, {
    send: {
      contract: custodyBSei.address,
      amount: "1000000",
      msg: Buffer.from(JSON.stringify({ deposit_collateral: {} })).toString("base64")
    }
  });
  console.log("Do custodyBSei.address deposit_collateral ok. \n", custodyBSeiDepositCollateralRes?.transactionHash);

  /// 4. Overseer lock collateral
  console.log();
  console.log("Do overseer.address lock_collateral enter");
  const overseerLockCollateralRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
    lock_collateral: {
      collaterals: [[bSeiToken.address, "1000000"]]
    }
  });
  console.log("Do overseer.address lock_collateral ok. \n", overseerLockCollateralRes?.transactionHash);

  /// 5. Overseer register feeder for asset in oracle contract
  console.log();
  console.log("Do overseer.address register_feeder enter");
  let overseerRegisterFeederRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
    register_feeder: {
      asset: bSeiToken.address,
      feeder: account.address
    }
  });
  console.log("Do overseer.address register_feeder ok. \n", overseerRegisterFeederRes?.transactionHash);

  ///  5.1 feed Price
  /// Feeds new price data. Can only be issued by the owner.
  console.log();
  console.log("Do oracle.address feed_price enter");
  let oracleFeedPriceRes = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
    feed_price: {
      prices: [[bSeiToken.address, "100"]]
    }
  });
  console.log("Do oracle.address feed_price ok. \n", oracleFeedPriceRes?.transactionHash);

  /// 6. borrow stable
  /// Borrows stable coins from Anchor.
  console.log();
  console.log("Do market.address borrow_stable enter");
  const marketBorrowStableRes = await executeContract(RPC_ENDPOINT, wallet, market.address, {
    borrow_stable: {
      borrow_amount: "10000000",
      to: account.address
    }
  });
  console.log("Do market.address borrow_stable ok. \n", marketBorrowStableRes?.transactionHash);

  /// 7. query borrow stable coin info
  console.log();
  console.log("Query market.address borrower_info enter");
  const marketBorrowerInfoRes = await queryWasmContract(RPC_ENDPOINT, wallet, market.address, {
    borrower_info: {
      borrower: account.address
    }
  });
  console.log("Query market.address borrower_info ok. \n", JSON.stringify(marketBorrowerInfoRes));

  ////////////////////test////////////////////////////////////////////////////////////////////////////////
  ///////////////liquidatequeue///////////////////////////////////////////////////////////////////////////////

  /// 14.2 feed Price
  /// Feeds new price data. Can only be issued by the owner.
  console.log();
  console.log("Do oracle.address feed_price 2 enter");
  let oracleFeedPriceRes2 = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
    feed_price: {
      prices: [[bSeiToken.address, "50"]]
    }
  });
  console.log("Do oracle.address feed_price 2 ok. \n", oracleFeedPriceRes2?.transactionHash);

  /// 15.Liquidate Collateral
  /// 15.2 query collateral borrow limit
  console.log();
  console.log("Query overseer.address borrow_limit enter");
  const currentTimestamp = Date.parse(new Date().toString()) / 1000;
  const overseerBorrowLimitRes = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, {
    borrow_limit: {
      borrower: account.address,
      block_time: currentTimestamp
    }
  });
  console.log("Query overseer.address borrow_limit ok. \n", JSON.stringify(overseerBorrowLimitRes));

  ///  15.3 liquidate collateral
  /// Submits a new bid for the specified Cw20 collateral with the specified premium rate.
  /// Requires stable coins to be sent beforehand.
  console.log();
  console.log("Do liquidationQueue.address submit_bid enter");
  const liquidationQueueSubmitBidRes = await executeContract(
    RPC_ENDPOINT,
    wallet2,
    liquidationQueue.address,
    {
      submit_bid: {
        collateral_token: bSeiToken.address,
        premium_slot: 10
      }
    },
    "",
    coins(100000000, stable_coin_denom)
  );
  console.log("Do liquidationQueue.address submit_bid  ok. \n",liquidationQueueSubmitBidRes?.transactionHash);

  ///////////////////////////////////////////////////////////////////////////////
  //                                                                           //
  ///////////////////////////////////////////////////////////////////////////////

  /// Gets the collateral balance of the specified borrower.

  console.log(`Query custodyBSei.address borrower enter`);
  const custodyBSeiBorrowerRes = await queryWasmContract(RPC_ENDPOINT, wallet, custodyBSei.address, {
    borrower: {
      address: account.address
    }
  });
  console.log("Query custodyBSei.address borrower ok. \n", JSON.stringify(custodyBSeiBorrowerRes));

  /// Feeds new price data. Can only be issued by the owner.
  console.log();
  console.log("Do oracle.address feed_price 3 enter");
  let oracleFeedPriceRes3 = await executeContract(RPC_ENDPOINT, wallet, oracle.address, {
    feed_price: {
      prices: [[bSeiToken.address, "5"]]
    }
  });
  console.log("Do oracle.address feed_price 3 ok. \n", oracleFeedPriceRes3?.transactionHash);

  /// 12.1 query borrow stable coin info
  console.log();
  console.log("Query market.address borrower_info 2 enter");
  const marketBorrowerInfoRes2 = await queryWasmContract(RPC_ENDPOINT, wallet, market.address, {
    borrower_info: {
      borrower: account.address,
      block_height: null
    }
  });
  console.log("Query market.address borrower_info 2 ok. \n", JSON.stringify(marketBorrowerInfoRes2));

  /// 15.2 query collateral borrow limit
  console.log();
  console.log("Query overseer.address borrow_limit enter");
  const currentTimestamp2 = Date.parse(new Date().toString()) / 1000;
  const overseerBorrowLimitRes2 = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, {
    borrow_limit: {
      borrower: account.address,
      block_time: currentTimestamp2
    }
  });
  console.log("Query overseer.address borrow_limit 2 ok. \n", JSON.stringify(overseerBorrowLimitRes2));

  console.log();
  console.log("Query overseer.address whitelist enter");
  const overseerWhitelistRes = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, {
    whitelist: {
      collateral_token: bSeiToken.address,
      start_after: null,
      limit: null
    }
  });
  console.log("Query overseer.address whitelist ok. \n", JSON.stringify(overseerWhitelistRes));

  /////////////////////////////////////////////////////////////////////
  ////must execute submit bid operation to avoid error ////////////////

  console.log();
  console.log("Query liquidationQueue.address liquidation_amount enter");
  const liquidationQueueLiquidationAmountRes = await queryWasmContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
    liquidation_amount: {
      borrow_amount: "10000067",
      borrow_limit: "6500000",
      collaterals: [[bSeiToken.address, "2000000"]],
      collateral_prices: ["5"]
    }
  });
  console.log("Query liquidationQueue.address liquidation_amount ok. \n", JSON.stringify(liquidationQueueLiquidationAmountRes));

  console.log();
  console.log("Query liquidationQueue.address config enter");
  const liquidationQueueConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
    config: {}
  });
  console.log("Query liquidationQueue.address config ok. \n", JSON.stringify(liquidationQueueConfigRes));

  /// 15.4 liquidate collateral call contract custody bSei =====step4==============
  console.log();
  console.log("Do overseer.address liquidate_collateral enter");
  const overseerLiquidateCollateralRes = await executeContract(RPC_ENDPOINT, wallet2, overseer.address, {
    liquidate_collateral: {
      borrower: account.address
    }
  });
  console.log("Do overseer.address liquidate_collateral ok. \n", overseerLiquidateCollateralRes?.transactionHash);

  /// 15.5 query liquidationQueue config
  console.log();
  console.log("Query liquidationQueue.address config 2 enter");
  const liquidationQueueConfigRes2 = await queryWasmContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
    config: {}
  });
  console.log("Query liquidationQueue.address config 2 ok. \n", JSON.stringify(liquidationQueueConfigRes2));

  /// 15.6 query liquidate pool
  console.log();
  console.log("Query liquidationQueue.address bid_pool enter");
  const liquidationQueueBidPoolRes = await queryWasmContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
    bid_pool: {
      collateral_token: bSeiToken.address,
      bid_slot: 10
    }
  });
  console.log("Query liquidationQueue.address bid_pool ok. \n", JSON.stringify(liquidationQueueBidPoolRes));

  console.log();
  console.log("Query reward.address state enter");
  const rewardStateRes = await queryWasmContract(RPC_ENDPOINT, wallet, reward.address, { state: {} });
  console.log("Query reward.address state ok. \n", JSON.stringify(rewardStateRes));

  console.log();
  console.log("Do hub.address update_global_index enter");
  const hubUpdateGlobalIndexRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, { update_global_index: {} });
  console.log("Do hub.address update_global_index ok. \n", hubUpdateGlobalIndexRes?.transactionHash);

  console.log();
  console.log("Query reward.address accrued_rewards enter");
  const rewardAccruedRewardsRes = await queryWasmContract(RPC_ENDPOINT, wallet, reward.address, {
    accrued_rewards: {
      address: account.address
    }
  });
  console.log("Query reward.address accrued_rewards ok. \n", JSON.stringify(rewardAccruedRewardsRes));

  console.log();
  console.log("Query interestModel.address config enter");
  const interestModelConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, interestModel.address, { config: {} });
  console.log("Query interestModel.address config ok. \n", JSON.stringify(interestModelConfigRes));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log("Query market.address state enter");
  const marketStateRes = await queryWasmContract(RPC_ENDPOINT, wallet, market.address, { state: {} });
  console.log("Query market.address state ok. \n", JSON.stringify(marketStateRes));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed market contracts end --- ---`);

  await loadAddressesBalances(LCD_ENDPOINT, [account.address, account2.address], ["usei", stable_coin_denom]);
}

main().catch(console.log);
