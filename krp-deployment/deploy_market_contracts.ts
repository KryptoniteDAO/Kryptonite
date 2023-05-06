import { coins, parseCoins } from "@cosmjs/stargate";
import { storeCode, instantiateContract, executeContract, queryWasmContract, queryAddressBalance, instantiateContract2 } from "./common";
import { loadingBaseData, loadingMarketData, loadingStakingData } from "./env_data";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- deploy market contracts enter --- ---`);

  const { LCD_ENDPOINT, RPC_ENDPOINT, mnemonic, privateKey, wallet, account, address1NativeBalance, address1StableCoinBalance, mnemonic2, privateKey2, wallet2, account2, address2NativeBalance, address2StableCoinBalance, validator, stable_coin_denom, prefix } = await loadingBaseData();

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData();

  if (!(hub.address && bSeiToken.address && stSeiToken.address && rewardsDispatcher.address && validatorsRegistry.address && reward.address)) {
    console.log(`--- --- deploy market contracts error, Please deploy staking contracts first --- ---`);
    process.exit(0);
    return;
  }

  const { overseer, market, custodyBSei, interestModel, distributionModel, oracle, aToken, liquidationQueue } = await loadingMarketData();

  let deployAddressFlag: boolean = false;

  if (!market.address || !aToken.address) {
    if (market.codeId <= 0) {
      market.codeId = await storeCode(RPC_ENDPOINT, wallet, market.filePath);
    }
    if (aToken.codeId <= 0) {
      aToken.codeId = await storeCode(RPC_ENDPOINT, wallet, aToken.filePath);
    }
    if (market.codeId > 0 && aToken.codeId > 0) {
      const [contract1, contract2] = await instantiateContract2(
        RPC_ENDPOINT,
        wallet,
        market.codeId,
        {
          anc_emission_rate: "6793787.950524103374549206",
          atoken_code_id: aToken.codeId,
          max_borrow_factor: "0.95",
          owner_addr: account.address,
          reserve_factor: "0.0",
          stable_denom: stable_coin_denom
        },
        coins(1_000_000, stable_coin_denom),
        "money market contract"
      );
      market.address = contract1;
      aToken.address = contract2;
      deployAddressFlag = true;
      market.deploy = true;
      aToken.deploy = true;
    }
    console.log(`market: `, JSON.stringify(market));
    console.log(`aToken: `, JSON.stringify(aToken));
  }

  if (!interestModel.address) {
    if (interestModel.codeId <= 0) {
      interestModel.codeId = await storeCode(RPC_ENDPOINT, wallet, interestModel.filePath);
    }
    if (interestModel.codeId > 0) {
      interestModel.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        interestModel.codeId,
        {
          base_rate: "0.000000004076272770",
          interest_multiplier: "0.000000085601728176",
          owner: account.address
        },
        parseCoins(""),
        "interest model contract"
      );
      deployAddressFlag = true;
      interestModel.deploy = true;
    }
    console.log(`interestModel: `, JSON.stringify(interestModel));
  }

  if (!distributionModel.address) {
    if (distributionModel.codeId <= 0) {
      distributionModel.codeId = await storeCode(RPC_ENDPOINT, wallet, distributionModel.filePath);
    }
    if (distributionModel.codeId > 0) {
      distributionModel.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        distributionModel.codeId,
        {
          decrement_multiplier: "0.997102083349256160",
          emission_cap: "20381363.851572310123647620",
          emission_floor: "6793787.950524103374549206",
          increment_multiplier: "1.007266723782294841",
          owner: account.address
        },
        parseCoins(""),
        "distribution model contract"
      );
      deployAddressFlag = true;
      distributionModel.deploy = true;
    }
    console.log(`distributionModel: `, JSON.stringify(distributionModel));
  }

  if (!oracle.address) {
    if (oracle.codeId <= 0) {
      oracle.codeId = await storeCode(RPC_ENDPOINT, wallet, oracle.filePath);
    }
    if (oracle.codeId > 0) {
      oracle.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        oracle.codeId,
        {
          base_asset: stable_coin_denom,
          owner: account.address
        },
        parseCoins(""),
        "oracle contract"
      );
      deployAddressFlag = true;
      oracle.deploy = true;
    }
    console.log(`oracle: `, JSON.stringify(oracle));
  }

  if (!overseer.address && market.address && oracle.address) {
    if (overseer.codeId <= 0) {
      overseer.codeId = await storeCode(RPC_ENDPOINT, wallet, overseer.filePath);
    }
    if (overseer.codeId > 0) {
      overseer.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        overseer.codeId,
        {
          anc_purchase_factor: "0.1",
          buffer_distribution_factor: "0.1",
          collector_contract: "sei1xxrlcs6kekmh63ks26yuf47qxdrkkqw0srvh7w", //ANC里面一个合约协议收入10%(暂时用一个临时地址代替)
          epoch_period: 1681,
          liquidation_contract: liquidationQueue.address || account.address,
          market_contract: market.address,
          oracle_contract: oracle.address,
          owner_addr: account.address,
          price_timeframe: 86400,
          stable_denom: stable_coin_denom,
          target_deposit_rate: "0.000000040762727704",
          threshold_deposit_rate: "0.000000030572045778",
          dyn_rate_epoch: 8600,
          dyn_rate_maxchange: "0.005",
          dyn_rate_yr_increase_expectation: "0.001",
          dyn_rate_min: "0.000001",
          dyn_rate_max: "0.0000012"
        },
        parseCoins(""),
        "overseer contract"
      );
      deployAddressFlag = true;
      overseer.deploy = true;
    }
    console.log(`overseer: `, JSON.stringify(overseer));
  }

  if (!liquidationQueue.address && oracle.address) {
    if (liquidationQueue.codeId <= 0) {
      liquidationQueue.codeId = await storeCode(RPC_ENDPOINT, wallet, liquidationQueue.filePath);
    }
    if (liquidationQueue.codeId > 0) {
      liquidationQueue.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        liquidationQueue.codeId,
        {
          owner: account.address,
          oracle_contract: oracle.address,
          stable_denom: stable_coin_denom,
          safe_ratio: "0.8",
          bid_fee: "0.01",
          liquidator_fee: "0.01",
          liquidation_threshold: "500",
          price_timeframe: 86400,
          waiting_period: 600,
          overseer: overseer.address || account.address
        },
        parseCoins(""),
        "liquidation queue contract"
      );
      deployAddressFlag = true;
      liquidationQueue.deploy = true;
    }
    console.log(`liquidationQueue: `, JSON.stringify(liquidationQueue));
  }

  if (!custodyBSei.address && bSeiToken.address && liquidationQueue.address && market.address && overseer.address && reward.address) {
    if (custodyBSei.codeId <= 0) {
      custodyBSei.codeId = await storeCode(RPC_ENDPOINT, wallet, custodyBSei.filePath);
    }
    if (custodyBSei.codeId > 0) {
      custodyBSei.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        custodyBSei.codeId,
        {
          basset_info: {
            decimals: 6,
            name: "Bonded Sei",
            symbol: "BSEI"
          },
          collateral_token: bSeiToken.address,
          liquidation_contract: liquidationQueue.address,
          market_contract: market.address,
          overseer_contract: overseer.address,
          owner: account.address,
          reward_contract: reward.address,
          stable_denom: stable_coin_denom
        },
        parseCoins(""),
        "custody bond sei contract"
      );
      deployAddressFlag = true;
      custodyBSei.deploy = true;
    }
    console.log(`custodyBSei: `, JSON.stringify(custodyBSei));
  }

  console.log();
  console.log(`marketCodeId: "${market.codeId}"`);
  console.log(`aTokenCodeId: "${aToken.codeId}"`);
  console.log(`interestModelCodeId: "${interestModel.codeId}"`);
  console.log(`distributionModelCodeId: "${distributionModel.codeId}"`);
  console.log(`oracleCodeId: "${oracle.codeId}"`);
  console.log(`liquidationQueueCodeId: "${liquidationQueue.codeId}"`);
  console.log(`overseerCodeId: "${overseer.codeId}"`);
  console.log(`custodyBSeiCodeId: "${custodyBSei.codeId}"`);

  console.log();
  console.log(`marketAddress: "${market.address}"`);
  console.log(`aTokenAddress: "${aToken.address}"`);
  console.log(`interestModelAddress: "${interestModel.address}"`);
  console.log(`distributionModelAddress: "${distributionModel.address}"`);
  console.log(`oracleAddress: "${oracle.address}"`);
  console.log(`liquidationQueueAddress: "${liquidationQueue.address}"`);
  console.log(`overseerAddress: "${overseer.address}"`);
  console.log(`custodyBSeiAddress: "${custodyBSei.address}"`);
  console.log();
  console.log(`--- --- deployed market contracts info --- ---`);
  const tableData = [
    { name: `market`, ...market },
    { name: `aToken`, ...aToken },
    { name: `interestModel`, ...interestModel },
    { name: `distributionModel`, ...distributionModel },
    { name: `oracle`, ...oracle },
    { name: `liquidationQueue`, ...liquidationQueue },
    { name: `overseer`, ...overseer },
    { name: `custodyBSei`, ...custodyBSei }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- market contracts configure enter --- ---`);

  const marketConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, market.address, { config: {} });
  console.log();
  console.log(`marketConfig: ${JSON.stringify(marketConfigRes)}`);
  // {"contract_addr":"","owner_addr":"","atoken_contract":"","interest_model":"","distribution_model":"","overseer_contract":"","collector_contract":"","distributor_contract":"","stable_denom":"","max_borrow_factor":""}

  const interestModelConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, interestModel.address, { config: {} });
  console.log();
  console.log(`interestModelConfig: ${JSON.stringify(interestModelConfigRes)}`);
  // {"owner":"","base_rate":"","interest_multiplier":""}

  const distributionModelConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, distributionModel.address, { config: {} });
  console.log();
  console.log(`distributionModelConfig: ${JSON.stringify(distributionModelConfigRes)}`);
  // {"owner":"","emission_cap":"","emission_floor":"","increment_multiplier":"","decrement_multiplier":""}

  const oracleConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, oracle.address, { config: {} });
  console.log();
  console.log(`oracleConfig: ${JSON.stringify(oracleConfigRes)}`);
  //  {"owner":"","base_asset":""}

  const liquidationQueueConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, liquidationQueue.address, { config: {} });
  console.log();
  console.log(`liquidationQueueConfig: ${JSON.stringify(liquidationQueueConfigRes)}`);
  // {"owner":"","oracle_contract":"","stable_denom":"","safe_ratio":"","bid_fee":"","liquidator_fee":"","liquidation_threshold":"","price_timeframe": “”,"waiting_period":“”,"overseer":""}

  const overseerConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, { config: {} });
  console.log();
  console.log(`overseerConfig: ${JSON.stringify(overseerConfigRes)}`);
  // {"owner_addr":"","oracle_contract":"","market_contract":"","liquidation_contract":"","collector_contract":"","threshold_deposit_rate":"","target_deposit_rate":"","buffer_distribution_factor":"","anc_purchase_factor":"","stable_denom":"","epoch_period":0,"price_timeframe":0,"dyn_rate_epoch":0,"dyn_rate_maxchange":"","dyn_rate_yr_increase_expectation":"","dyn_rate_min":"","dyn_rate_max":""}

  const custodyBSeiConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, custodyBSei.address, { config: {} });
  console.log();
  console.log(`custodyBSeiConfig: ${JSON.stringify(custodyBSeiConfigRes)}`);
  // {"owner":"","collateral_token":"","overseer_contract":"","market_contract":"","reward_contract":"","liquidation_contract":"","stable_denom":"","basset_info":{"name":"","symbol":"","decimals":6}}

  // const liquidationCollateralInfoRes = await queryWasmContract(RPC_ENDPOINT, wallet, liquidationQueue.address, { collateral_info: { collateral_token: bSeiToken.address } });
  // console.log();
  // console.log(`liquidationCollateralInfo: ${JSON.stringify(liquidationCollateralInfoRes)}`);
  // {"collateral_token":"","bid_threshold":"","max_slot":0,"premium_rate_per_slot":""}

  const overseerWhitelistRes = await queryWasmContract(RPC_ENDPOINT, wallet, overseer.address, { whitelist: {} });
  console.log();
  console.log(`overseerWhitelist: ${JSON.stringify(overseerWhitelistRes)}`);
  // {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}

  if (overseer.address && market.address && custodyBSei.address && interestModel.address && distributionModel.address && oracle.address && aToken.address && liquidationQueue.address) {
    // {"contract_addr":"","owner_addr":"","atoken_contract":"","interest_model":"","distribution_model":"","overseer_contract":"","collector_contract":"","distributor_contract":"","stable_denom":"","max_borrow_factor":""}
    const marketConfigFlag: boolean =
      overseer.address === marketConfigRes?.overseer_contract &&
      interestModel.address === marketConfigRes?.interest_model &&
      distributionModel.address === marketConfigRes?.distribution_model &&
      bSeiToken.address === marketConfigRes?.collector_contract &&
      rewardsDispatcher.address === marketConfigRes?.distributor_contract;
    if (!marketConfigFlag) {
      console.log();
      console.log("Update market's register_contracts enter");
      const marketRegisterContractsRes = await executeContract(RPC_ENDPOINT, wallet, market.address, {
        register_contracts: {
          overseer_contract: overseer.address,
          interest_model: interestModel.address,
          distribution_model: distributionModel.address,
          collector_contract: bSeiToken.address,
          distributor_contract: rewardsDispatcher.address
        }
      });
      console.log("Update market's register_contracts ok. \n", marketRegisterContractsRes?.transactionHash);
    }

    // {"owner_addr":"","oracle_contract":"","market_contract":"","liquidation_contract":"","collector_contract":"","threshold_deposit_rate":"","target_deposit_rate":"","buffer_distribution_factor":"","anc_purchase_factor":"","stable_denom":"","epoch_period":0,"price_timeframe":0,"dyn_rate_epoch":0,"dyn_rate_maxchange":"","dyn_rate_yr_increase_expectation":"","dyn_rate_min":"","dyn_rate_max":""}
    const overseerConfigFlag: boolean = liquidationQueue.address === overseerConfigRes?.liquidation_contract;
    if (!overseerConfigFlag) {
      console.log();
      console.log("Update overseer's config enter");
      const overseerUpdateConfigRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
        update_config: {
          liquidation_contract: liquidationQueue.address,
          epoch_period: 90
        }
      });
      console.log("Update overseer's config ok. \n", overseerUpdateConfigRes?.transactionHash);
    }

    // {"owner":"","collateral_token":"","overseer_contract":"","market_contract":"","reward_contract":"","liquidation_contract":"","stable_denom":"","basset_info":{"name":"","symbol":"","decimals":6}}
    const custodyBSeiConfigFlag: boolean = liquidationQueue.address === custodyBSeiConfigRes?.liquidation_contract;
    if (!custodyBSeiConfigFlag) {
      console.log();
      console.log("Update custodyBSei's config enter");
      let custodyBSeiUpdateConfigRes = await executeContract(RPC_ENDPOINT, wallet, custodyBSei.address, {
        update_config: {
          owner: account.address,
          liquidation_contract: liquidationQueue.address
        }
      });
      console.log("Update custodyBSei's config ok. \n", custodyBSeiUpdateConfigRes?.transactionHash);
    }

    // {"owner":"","oracle_contract":"","stable_denom":"","safe_ratio":"","bid_fee":"","liquidator_fee":"","liquidation_threshold":"","price_timeframe": “”,"waiting_period":“”,"overseer":""}
    const liquidationQueueConfigFlag: boolean = oracle.address === liquidationQueueConfigRes?.oracle_contract && overseer.address === liquidationQueueConfigRes?.overseer;
    if (!liquidationQueueConfigFlag) {
      console.log();
      console.log("Update liquidationQueue's config enter");
      const liquidationQueueUpdateConfigRes = await executeContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
        update_config: {
          owner: account.address,
          oracle_contract: oracle.address,
          safe_ratio: "0.8",
          bid_fee: "0.01",
          liquidator_fee: "0.01",
          liquidation_threshold: "500",
          price_timeframe: 86400,
          waiting_period: 600,
          overseer: overseer.address
        }
      });
      console.log("Update liquidationQueue's config ok. \n", liquidationQueueUpdateConfigRes?.transactionHash);
    }

    let liquidationQueueWhitelistCollateralFlag = true;
    try {
      await queryWasmContract(RPC_ENDPOINT, wallet, liquidationQueue.address, { collateral_info: { collateral_token: bSeiToken.address } });
    } catch (error: any) {
      if (error.toString().includes("Collateral is not whitelisted")) {
        liquidationQueueWhitelistCollateralFlag = false;
      }
    }
    if (!liquidationQueueWhitelistCollateralFlag) {
      console.log();
      console.log("Update liquidationQueue's whitelist_collateral enter");
      const liquidationQueueWhitelistCollateralRes = await executeContract(RPC_ENDPOINT, wallet, liquidationQueue.address, {
        whitelist_collateral: {
          collateral_token: bSeiToken.address,
          bid_threshold: "500000000",
          max_slot: 30,
          premium_rate_per_slot: "0.01"
        }
      });
      console.log("Update liquidationQueue's whitelist_collateral ok. \n", liquidationQueueWhitelistCollateralRes?.transactionHash);
    }

    // {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
    let overseerWhitelistFlag: boolean = false;
    for (const item of overseerWhitelistRes?.["elems"]) {
      if (bSeiToken.address === item?.["collateral_token"] && custodyBSei.address === item?.["custody_contract"]) {
        overseerWhitelistFlag = true;
        break;
      }
    }

    if (!overseerWhitelistFlag) {
      console.log();
      console.log("Update overseer's add collateral whitelist enter");
      const overseerWhitelistRes = await executeContract(RPC_ENDPOINT, wallet, overseer.address, {
        whitelist: {
          name: "Bond Sei",
          symbol: "bSEI",
          collateral_token: bSeiToken.address,
          custody_contract: custodyBSei.address,
          max_ltv: "0.65"
        }
      });
      console.log("Update overseer's add collateral whitelist ok. \n", overseerWhitelistRes?.transactionHash);
    }
  }

  console.log();
  console.log(`--- --- market contracts configure end --- ---`);

  const address1NativeBalance2 = await queryAddressBalance(LCD_ENDPOINT, account.address, "usei");
  const address1StableCoinBalance2 = await queryAddressBalance(LCD_ENDPOINT, account.address, stable_coin_denom);
  const address2NativeBalance2 = await queryAddressBalance(LCD_ENDPOINT, account2.address, "usei");
  const address2StableCoinBalance2 = await queryAddressBalance(LCD_ENDPOINT, account2.address, stable_coin_denom);

  console.log();
  console.log(`--- --- after balances --- ---`);
  console.table(
    [
      { address: account.address, nativeBalance: JSON.stringify(address1NativeBalance2.balance), stableCoinBalance: JSON.stringify(address1StableCoinBalance2.balance) },
      { address: account2.address, nativeBalance: JSON.stringify(address2NativeBalance2.balance), stableCoinBalance: JSON.stringify(address2StableCoinBalance2.balance) }
    ],
    [`address`, `nativeBalance`, `stableCoinBalance`]
  );

  console.log();
  console.log(`--- --- deploy market contracts end --- ---`);
  console.log();
}

main().catch(console.log);
