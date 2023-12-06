import { executeContract, executeContractByWalletData, getClientData2ByWalletData, printChangeBalancesByWalletData, queryWasmContractByWalletData } from "@/common";
import { cw20BaseContracts, marketContracts } from "@/contracts";
import { loadingWalletData } from "@/env_data";
import { printDeployedMarketContracts, printDeployedStakingContracts, readDeployedContracts } from "@/modules";
import { MARKET_MODULE_NAME } from "@/modules/market/market_constants.ts";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants.ts";
import type { WalletData } from "@/types";
import { coins } from "@cosmjs/stargate";

(async (): Promise<void> => {
  console.log(`\n  --- --- verify deployed contracts enter: ${MARKET_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const { swapExtensionNetwork, oracleNetwork, stakingNetwork, marketNetwork, cdpNetwork } = readDeployedContracts(walletData.chainId);

  if (!stakingNetwork) {
    throw new Error(`\n  --- --- verify deployed error, Please deploy ${STAKING_MODULE_NAME} contracts first --- ---`);
  }
  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;
  if (!hub?.address || !reward?.address || !bAssetsToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stAssetsToken?.address) {
    throw new Error(`\n  --- --- verify deployed error, missing some deployed ${STAKING_MODULE_NAME} address info --- ---`);
  }
  if (!marketNetwork) {
    throw new Error(`\n  --- --- verify deployed error, missing some deployed ${MARKET_MODULE_NAME} address info --- ---`);
  }
  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBAssets } = marketNetwork;
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !liquidationQueue?.address || !custodyBAssets?.address) {
    throw new Error(`\n  --- --- verify deployed error, missing some deployed ${MARKET_MODULE_NAME} address info --- ---`);
  }
  await printDeployedStakingContracts(stakingNetwork);
  await printDeployedMarketContracts(marketNetwork);
  const { stable_coin_denom } = cdpNetwork;
  console.log(`  stable_coin_denom: ${stable_coin_denom}`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;
  const printConfig: boolean = true;

  /// 2. market deposit_stable test
  /// 2.1. deposit stable to money market
  // console.warn("Do market.address deposit_stable enter");
  // const marketDepositStableRes = await executeContractByWalletData(walletData, market.address, { deposit_stable: {} }, "", coins(10_000_000_000, stable_coin_denom));
  // console.log("Do market.address deposit_stable ok. \n", marketDepositStableRes?.transactionHash);

  ///  Send stable coin to other address
  const senderAddress = walletData?.activeWallet?.address;
  const receiverAddress = getClientData2ByWalletData(walletData, 0)?.senderAddress;
  let senderNativeBalance = walletData?.addressesBalances.find(v => senderAddress === v?.address && walletData?.nativeCurrency?.coinMinimalDenom === v?.balance?.denom)?.balance?.amount;
  let senderStableCoinBalance = walletData?.addressesBalances.find(v => senderAddress === v?.address && stable_coin_denom === v?.balance?.denom)?.balance?.amount;
  let receiverNativeBalance = walletData?.addressesBalances.find(v => receiverAddress === v?.address && walletData?.nativeCurrency?.coinMinimalDenom === v?.balance?.denom)?.balance?.amount;
  let receiverStableCoinBalance = walletData?.addressesBalances.find(v => receiverAddress === v?.address && stable_coin_denom === v?.balance?.denom)?.balance?.amount;
  const sendNativeAmount = "10";
  const sendStableCoinAmount = "1000";
  // await sendCoinToOtherAddress(walletData, receiverAddress, walletData?.nativeCurrency?.coinMinimalDenom, sendNativeAmount, senderNativeBalance, receiverNativeBalance);
  // await sendCoinToOtherAddress(walletData, receiverAddress, stable_coin_denom, sendStableCoinAmount, senderStableCoinBalance, receiverStableCoinBalance);

  /// 3. CustodyBAssets deposits collateral.
  /// Issued when a user sends bAsset tokens to the Custody contract.
  console.log(`\n  Do custodyBAssets.address deposit collateral and lock collateral enter`);
  const marketClient = new marketContracts.Market.MarketClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, market?.address);

  const atokenQueryClient = new cw20BaseContracts.Cw20Base.Cw20BaseQueryClient(walletData?.activeWallet?.signingCosmWasmClient, aToken?.address);
  const marketQueryClient = new marketContracts.Market.MarketQueryClient(walletData?.activeWallet?.signingCosmWasmClient, market?.address);
  const interestModelQueryClient = new marketContracts.InterestModel.InterestModelQueryClient(walletData?.activeWallet?.signingCosmWasmClient, interestModel?.address);
  const distributionModelQueryClient = new marketContracts.DistributionModel.DistributionModelQueryClient(walletData?.activeWallet?.signingCosmWasmClient, distributionModel?.address);
  const overseerQueryClient = new marketContracts.Overseer.OverseerQueryClient(walletData?.activeWallet?.signingCosmWasmClient, overseer?.address);
  const liquidationQueueQueryClient = new marketContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData?.activeWallet?.signingCosmWasmClient, liquidationQueue?.address);
  const custodyBAssetsQueryClient = new marketContracts.CustodyBsei.CustodyBseiQueryClient(walletData?.activeWallet?.signingCosmWasmClient, custodyBAssets?.address);
  const bAssetsTokenQueryClient = new cw20BaseContracts.Cw20Base.Cw20BaseQueryClient(walletData?.activeWallet?.signingCosmWasmClient, bAssetsToken?.address);

  printConfig && console.log(`\n  market.aToken config \n`, await atokenQueryClient.tokenInfo());
  printConfig && console.log(`\n  market.Market config \n`, await marketQueryClient.config());
  printConfig && console.log(`\n  market.InterestModel config \n`, await interestModelQueryClient.config());
  printConfig && console.log(`\n  market.DistributionModel config \n`, await distributionModelQueryClient.config());
  printConfig && console.log(`\n  market.Overseer config \n`, await overseerQueryClient.config());
  printConfig && console.log(`\n  market.LiquidationQueue config \n`, await liquidationQueueQueryClient.config());
  printConfig && console.log(`\n  market.CustodyBAssets config \n`, await custodyBAssetsQueryClient.config());
  print && console.log(`\n  market.Overseer whitelist \n`, await overseerQueryClient.whitelist({ collateralToken: bAssetsToken.address }));
  print && console.log(`\n  address bAssetsToken.balance \n`, await bAssetsTokenQueryClient.balance({ address: walletData?.activeWallet?.address }));

  const custodyBAssetsDepositCollateralRes = await executeContractByWalletData(walletData, bAssetsToken.address, {
    send: {
      contract: custodyBAssets.address,
      amount: "1000000",
      msg: Buffer.from(JSON.stringify({ deposit_collateral: {} })).toString("base64")
    }
  });
  console.log("Do custodyBAssets.address deposit and lock collateral ok. \n", custodyBAssetsDepositCollateralRes?.transactionHash);

  //step5: unlock collateral and withdraw bAssetsToken
  console.log(`\n  Do custodyBase.address unlock collateral and withdraw collateral enter`);
  const withdrawBSTAssetsCollateralRes = await executeContractByWalletData(
    walletData,
    overseer.address,
    {
      unlock_collateral: {
        collaterals: [
          [bAssetsToken.address, "500000"] // (CW20 contract address, Amount to unlock)
        ]
      }
    },
    "unlock and withdraw collateral"
  );
  console.log("Do custodyBase.address unlock and withdraw collateral ok. \n", withdrawBSTAssetsCollateralRes?.transactionHash);

  /// 6. borrow stable
  /// Borrows stable coins from Anchor.
  console.log(`\n  Do market.address borrow_stable enter`);
  const marketBorrowStableRes = await executeContractByWalletData(walletData, market.address, {
    borrow_stable: {
      borrow_amount: "10000000",
      to: walletData?.activeWallet?.address
    }
  });
  console.log("Do market.address borrow_stable ok. \n", marketBorrowStableRes?.transactionHash);

  /// 7. query borrow stable coin info
  console.log(`\n  Query market.address borrower_info enter`);
  const marketBorrowerInfoRes = await queryWasmContractByWalletData(walletData, market.address, {
    borrower_info: {
      borrower: walletData?.activeWallet?.address
    }
  });
  console.log("Query market.address borrower_info ok. \n", JSON.stringify(marketBorrowerInfoRes));

  ////////////////////test////////////////////////////////////////////////////////////////////////////////
  ///////////////liquidatequeue///////////////////////////////////////////////////////////////////////////////

  /// 15.Liquidate Collateral
  /// 15.2 query collateral borrow limit
  console.log(`\n  Query overseer.address borrow_limit enter`);
  const currentTimestamp = Date.parse(new Date().toString()) / 1000;
  const overseerBorrowLimitRes = await queryWasmContractByWalletData(walletData, overseer.address, {
    borrow_limit: {
      borrower: walletData?.activeWallet?.address,
      block_time: currentTimestamp
    }
  });
  console.log(`  Query overseer.address borrow_limit ok. \n`, JSON.stringify(overseerBorrowLimitRes));

  ///  15.3 liquidate collateral
  /// Submits a new bid for the specified Cw20 collateral with the specified premium rate.
  /// Requires stable coins to be sent beforehand.
  console.log(`\n  Do liquidationQueue.address submit_bid enter`);
  const clientData2 = getClientData2ByWalletData(walletData);
  const liquidationQueueSubmitBidRes = await executeContract(
    clientData2,
    liquidationQueue.address,
    {
      submit_bid: {
        collateral_token: bAssetsToken.address,
        premium_slot: 10
      }
    },
    "",
    coins(100000000, stable_coin_denom)
  );
  console.log(`  Do liquidationQueue.address submit_bid  ok. \n`, liquidationQueueSubmitBidRes?.transactionHash);

  ///////////////////////////////////////////////////////////////////////////////
  //                                                                           //
  ///////////////////////////////////////////////////////////////////////////////

  /// Gets the collateral balance of the specified borrower.

  console.log(`\n  Query custodyBAssets.address borrower enter`);
  const custodyBAssetsBorrowerRes = await queryWasmContractByWalletData(walletData, custodyBAssets.address, {
    borrower: {
      address: walletData?.activeWallet?.address
    }
  });
  console.log(`  Query custodyBAssets.address borrower ok. \n`, JSON.stringify(custodyBAssetsBorrowerRes));

  /// 12.1 query borrow stable coin info
  console.log(`\n  Query market.address borrower_info 2 enter`);
  const marketBorrowerInfoRes2 = await queryWasmContractByWalletData(walletData, market.address, {
    borrower_info: {
      borrower: walletData?.activeWallet?.address,
      block_height: null
    }
  });
  console.log(`\n  Query market.address borrower_info 2 ok. \n`, JSON.stringify(marketBorrowerInfoRes2));

  /// 15.2 query collateral borrow limit
  console.log(`\n  Query overseer.address borrow_limit enter`);
  const currentTimestamp2 = Date.parse(new Date().toString()) / 1000;
  const overseerBorrowLimitRes2 = await queryWasmContractByWalletData(walletData, overseer.address, {
    borrow_limit: {
      borrower: walletData?.activeWallet?.address,
      block_time: currentTimestamp2
    }
  });
  console.log(`\n  Query overseer.address borrow_limit 2 ok. \n`, JSON.stringify(overseerBorrowLimitRes2));

  console.log(`\n  Query overseer.address whitelist enter`);
  const overseerWhitelistRes = await queryWasmContractByWalletData(walletData, overseer.address, {
    whitelist: {
      collateral_token: bAssetsToken.address,
      start_after: null,
      limit: null
    }
  });
  console.log(`\n  Query overseer.address whitelist ok. \n`, JSON.stringify(overseerWhitelistRes));

  /////////////////////////////////////////////////////////////////////
  ////must execute submit bid operation to avoid error ////////////////

  console.log(`\n  Query liquidationQueue.address liquidation_amount enter`);
  const liquidationQueueLiquidationAmountRes = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
    liquidation_amount: {
      borrow_amount: "10000067",
      borrow_limit: "6500000",
      collaterals: [[bAssetsToken.address, "2000000"]],
      collateral_prices: ["5"]
    }
  });
  console.log(`  Query liquidationQueue.address liquidation_amount ok. \n`, JSON.stringify(liquidationQueueLiquidationAmountRes));

  console.log(`\n  Query liquidationQueue.address config enter`);
  const liquidationQueueConfigRes = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
    config: {}
  });
  console.log(`  Query liquidationQueue.address config ok. \n`, JSON.stringify(liquidationQueueConfigRes));

  /// 15.4 liquidate collateral call contract custody bAssets =====step4==============
  console.log(`\n  Do overseer.address liquidate_collateral enter`);
  const clientData22 = getClientData2ByWalletData(walletData);
  const overseerLiquidateCollateralRes = await executeContract(clientData22, overseer.address, {
    liquidate_collateral: {
      borrower: walletData?.activeWallet?.address
    }
  });
  console.log(`  Do overseer.address liquidate_collateral ok. \n`, overseerLiquidateCollateralRes?.transactionHash);

  /// 15.5 query liquidationQueue config
  console.log(`\n  Query liquidationQueue.address config 2 enter`);
  const liquidationQueueConfigRes2 = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
    config: {}
  });
  console.log(`  Query liquidationQueue.address config 2 ok. \n`, JSON.stringify(liquidationQueueConfigRes2));

  /// 15.6 query liquidate pool
  console.log(`\n  Query liquidationQueue.address bid_pool enter`);
  const liquidationQueueBidPoolRes = await queryWasmContractByWalletData(walletData, liquidationQueue.address, {
    bid_pool: {
      collateral_token: bAssetsToken.address,
      bid_slot: 10
    }
  });
  console.log(`  Query liquidationQueue.address bid_pool ok. \n`, JSON.stringify(liquidationQueueBidPoolRes));

  console.log(`\n  Query reward.address state enter`);
  const rewardStateRes = await queryWasmContractByWalletData(walletData, reward.address, { state: {} });
  console.log("Query reward.address state ok. \n", JSON.stringify(rewardStateRes));

  console.log(`\n  Do hub.address update_global_index enter`);
  const hubUpdateGlobalIndexRes = await executeContractByWalletData(walletData, hub.address, { update_global_index: {} });
  console.log(`  Do hub.address update_global_index ok. \n`, hubUpdateGlobalIndexRes?.transactionHash);

  console.log(`\n  Query reward.address accrued_rewards enter`);
  const rewardAccruedRewardsRes = await queryWasmContractByWalletData(walletData, reward.address, {
    accrued_rewards: {
      address: walletData?.activeWallet?.address
    }
  });
  console.log(`  Query reward.address accrued_rewards ok. \n`, JSON.stringify(rewardAccruedRewardsRes));

  console.log(`\n  Query interestModel.address config enter`);
  const interestModelConfigRes = await queryWasmContractByWalletData(walletData, interestModel.address, { config: {} });
  console.log(`  Query interestModel.address config ok. \n`, JSON.stringify(interestModelConfigRes));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  Query market.address state enter`);
  const marketStateRes = await queryWasmContractByWalletData(walletData, market.address, { state: {} });
  console.log(`  Query market.address state ok. \n`, JSON.stringify(marketStateRes));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed contracts end: ${MARKET_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
