import { coins } from "@cosmjs/stargate";
import { executeContract, sendCoinToOtherAddress, executeContractByWalletData, queryWasmContractByWalletData, getClientData2ByWalletData, printChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH } from "./env_data";
import { swapExtentionReadArtifact } from "./modules/swap";
import { ConvertDeployContracts, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";
import { stakingReadArtifact } from "./modules/staking";
import { marketReadArtifact } from "./modules/market";
import { convertReadArtifact } from "./modules/convert";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- verify deployed market contracts enter --- ---`);

  const walletData = await loadingWalletData();


  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`--- --- verify deployed error, missing some deployed staking address info --- ---`);
    process.exit(0);
    return;
  }

  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBSei } = await loadingMarketData(networkMarket);
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !liquidationQueue?.address || !custodyBSei?.address) {
    console.log(`--- --- verify deployed error, missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  /// 2. market deposit_stable test
  /// 2.1. deposit stable to money market
  // console.log();
  // console.warn("Do market.address deposit_stable enter");
  // const marketDepositStableRes = await executeContractByWalletData(walletData, market.address, { deposit_stable: {} }, "", coins(10_000_000_000, walletData.stable_coin_denom));
  // console.log("Do market.address deposit_stable ok. \n", marketDepositStableRes?.transactionHash);

  ///  Send stable coin to other address
  const senderAddress = walletData.address;
  const receiverAddress = walletData.address2;
  let senderUseiBalance = walletData.addressesBalances.find(v => senderAddress === v?.address && walletData.nativeCurrency.coinMinimalDenom === v?.balance?.denom)?.balance?.amount;
  let senderStableCoinBalance = walletData.addressesBalances.find(v => senderAddress === v?.address && walletData.stable_coin_denom === v?.balance?.denom)?.balance?.amount;
  let receiverUseiBalance = walletData.addressesBalances.find(v => receiverAddress === v?.address && walletData.nativeCurrency.coinMinimalDenom === v?.balance?.denom)?.balance?.amount;
  let receiverStableCoinBalance = walletData.addressesBalances.find(v => receiverAddress === v?.address && walletData.stable_coin_denom === v?.balance?.denom)?.balance?.amount;
  const sendUseiAmount = "10";
  const sendStableCoinAmount = "1000";
  // await sendCoinToOtherAddress(walletData, receiverAddress, walletData.nativeCurrency.coinMinimalDenom, sendUseiAmount, senderUseiBalance, receiverUseiBalance);
  // await sendCoinToOtherAddress(walletData, receiverAddress, walletData.stable_coin_denom, sendStableCoinAmount, senderStableCoinBalance, receiverStableCoinBalance);

  /// 3. CustodyBSei deposits collateral.
  /// Issued when a user sends bAsset tokens to the Custody contract.
  console.log();
  console.log("Do custodyBSei.address deposit collateral and lock collateral enter");
  const custodyBSeiDepositCollateralRes = await executeContractByWalletData(walletData, bSeiToken.address, {
    send: {
      contract: custodyBSei.address,
      amount: "1000000",
      msg: Buffer.from(JSON.stringify({ deposit_collateral: {} })).toString("base64")
    }
  });
  console.log("Do custodyBSei.address deposit and lock collateral ok. \n", custodyBSeiDepositCollateralRes?.transactionHash);


  //step5: unlock collateral and withdraw bSeiToken
  console.log();
  console.log("Do custodyBase.address unlock collateral and withdraw collateral enter");
  const withdrawBSTSeiCollateralRes = await executeContractByWalletData(
    walletData,
    overseer.address,
    {
      unlock_collateral: {
        collaterals: [
          [bSeiToken.address, "500000"] // (CW20 contract address, Amount to unlock)
        ]
      }
    },
    "unlock and withdraw collateral"
  );
  console.log("Do custodyBase.address unlock and withdraw collateral ok. \n", withdrawBSTSeiCollateralRes?.transactionHash);

  /// 6. borrow stable
  /// Borrows stable coins from Anchor.
  console.log();
  console.log("Do market.address borrow_stable enter");
  const marketBorrowStableRes = await executeContractByWalletData(walletData, market.address, {
    borrow_stable: {
      borrow_amount: "10000000",
      to: walletData.address
    }
  });
  console.log("Do market.address borrow_stable ok. \n", marketBorrowStableRes?.transactionHash);

  /// 7. query borrow stable coin info
  console.log();
  console.log("Query market.address borrower_info enter");
  const marketBorrowerInfoRes = await queryWasmContractByWalletData(walletData, market.address, {
    borrower_info: {
      borrower: walletData.address
    }
  });
  console.log("Query market.address borrower_info ok. \n", JSON.stringify(marketBorrowerInfoRes));

  ////////////////////test////////////////////////////////////////////////////////////////////////////////
  ///////////////liquidatequeue///////////////////////////////////////////////////////////////////////////////

  /// 14.2 feed Price
  /// Feeds new price data. Can only be issued by the owner.
  // console.log();
  // console.log("Do oracle.address feed_price 2 enter");
  // let oracleFeedPriceRes2 = await executeContractByWalletData(walletData, oracle.address, {
  //   feed_price: {
  //     prices: [[bSeiToken.address, "5"]]
  //   }
  // });
  // console.log("Do oracle.address feed_price 2 ok. \n", oracleFeedPriceRes2?.transactionHash);

  /// 15.Liquidate Collateral
  /// 15.2 query collateral borrow limit
  console.log();
  console.log("Query overseer.address borrow_limit enter");
  const currentTimestamp = Date.parse(new Date().toString()) / 1000;
  const overseerBorrowLimitRes = await queryWasmContractByWalletData(walletData, overseer.address, {
    borrow_limit: {
      borrower: walletData.address,
      block_time: currentTimestamp
    }
  });
  console.log("Query overseer.address borrow_limit ok. \n", JSON.stringify(overseerBorrowLimitRes));

  ///  15.3 liquidate collateral
  /// Submits a new bid for the specified Cw20 collateral with the specified premium rate.
  /// Requires stable coins to be sent beforehand.
  console.log();
  console.log("Do liquidationQueue.address submit_bid enter");
  const clientData2 = getClientData2ByWalletData(walletData);
  const liquidationQueueSubmitBidRes = await executeContract(
    clientData2,
    liquidationQueue.address,
    {
      submit_bid: {
        collateral_token: bSeiToken.address,
        premium_slot: 10
      }
    },
    "",
    coins(100000000, walletData.stable_coin_denom)
  );
  console.log("Do liquidationQueue.address submit_bid  ok. \n", liquidationQueueSubmitBidRes?.transactionHash);

  ///////////////////////////////////////////////////////////////////////////////
  //                                                                           //
  ///////////////////////////////////////////////////////////////////////////////

  /// Gets the collateral balance of the specified borrower.

  console.log();
  console.log(`Query custodyBSei.address borrower enter`);
  const custodyBSeiBorrowerRes = await queryWasmContractByWalletData(walletData, custodyBSei.address, {
    borrower: {
      address: walletData.address
    }
  });
  console.log("Query custodyBSei.address borrower ok. \n", JSON.stringify(custodyBSeiBorrowerRes));

  /// Feeds new price data. Can only be issued by the owner.
  // console.log();
  // console.log("Do oracle.address feed_price 3 enter");
  // let oracleFeedPriceRes3 = await executeContractByWalletData(walletData, oracle.address, {
  //   feed_price: {
  //     prices: [[bSeiToken.address, "5"]]
  //   }
  // });
  // console.log("Do oracle.address feed_price 3 ok. \n", oracleFeedPriceRes3?.transactionHash);

  /// 12.1 query borrow stable coin info
  console.log();
  console.log("Query market.address borrower_info 2 enter");
  const marketBorrowerInfoRes2 = await queryWasmContractByWalletData(walletData, market.address, {
    borrower_info: {
      borrower: walletData.address,
      block_height: null
    }
  });
  console.log("Query market.address borrower_info 2 ok. \n", JSON.stringify(marketBorrowerInfoRes2));

  /// 15.2 query collateral borrow limit
  console.log();
  console.log("Query overseer.address borrow_limit enter");
  const currentTimestamp2 = Date.parse(new Date().toString()) / 1000;
  const overseerBorrowLimitRes2 = await queryWasmContractByWalletData(walletData, overseer.address, {
    borrow_limit: {
      borrower: walletData.address,
      block_time: currentTimestamp2
    }
  });
  console.log("Query overseer.address borrow_limit 2 ok. \n", JSON.stringify(overseerBorrowLimitRes2));

  console.log();
  console.log("Query overseer.address whitelist enter");
  const overseerWhitelistRes = await queryWasmContractByWalletData(walletData, overseer.address, {
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
  const liquidationQueueLiquidationAmountRes = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
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
  const liquidationQueueConfigRes = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
    config: {}
  });
  console.log("Query liquidationQueue.address config ok. \n", JSON.stringify(liquidationQueueConfigRes));

  /// 15.4 liquidate collateral call contract custody bSei =====step4==============
  console.log();
  console.log("Do overseer.address liquidate_collateral enter");
  const clientData22 = getClientData2ByWalletData(walletData);
  const overseerLiquidateCollateralRes = await executeContract(clientData22, overseer.address, {
    liquidate_collateral: {
      borrower: walletData.address
    }
  });
  console.log("Do overseer.address liquidate_collateral ok. \n", overseerLiquidateCollateralRes?.transactionHash);

  /// 15.5 query liquidationQueue config
  console.log();
  console.log("Query liquidationQueue.address config 2 enter");
  const liquidationQueueConfigRes2 = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
    config: {}
  });
  console.log("Query liquidationQueue.address config 2 ok. \n", JSON.stringify(liquidationQueueConfigRes2));

  /// 15.6 query liquidate pool
  console.log();
  console.log("Query liquidationQueue.address bid_pool enter");
  const liquidationQueueBidPoolRes = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
    bid_pool: {
      collateral_token: bSeiToken.address,
      bid_slot: 10
    }
  });
  console.log("Query liquidationQueue.address bid_pool ok. \n", JSON.stringify(liquidationQueueBidPoolRes));

  console.log();
  console.log("Query reward.address state enter");
  const rewardStateRes = await queryWasmContractByWalletData(walletData, reward.address, { state: {} });
  console.log("Query reward.address state ok. \n", JSON.stringify(rewardStateRes));

  console.log();
  console.log("Do hub.address update_global_index enter");
  const hubUpdateGlobalIndexRes = await executeContractByWalletData(walletData, hub.address, { update_global_index: {} });
  console.log("Do hub.address update_global_index ok. \n", hubUpdateGlobalIndexRes?.transactionHash);

  console.log();
  console.log("Query reward.address accrued_rewards enter");
  const rewardAccruedRewardsRes = await queryWasmContractByWalletData(walletData, reward.address, {
    accrued_rewards: {
      address: walletData.address
    }
  });
  console.log("Query reward.address accrued_rewards ok. \n", JSON.stringify(rewardAccruedRewardsRes));

  console.log();
  console.log("Query interestModel.address config enter");
  const interestModelConfigRes = await queryWasmContractByWalletData(walletData, interestModel.address, { config: {} });
  console.log("Query interestModel.address config ok. \n", JSON.stringify(interestModelConfigRes));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log("Query market.address state enter");
  const marketStateRes = await queryWasmContractByWalletData(walletData, market.address, { state: {} });
  console.log("Query market.address state ok. \n", JSON.stringify(marketStateRes));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed market contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}

main().catch(console.log);
