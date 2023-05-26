import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData, queryContractConfig } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";

async function main(): Promise<void> {
  console.log(`--- --- deploy market contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH);
  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);

  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`--- --- deploy market contracts error, Please deploy staking contracts first --- ---`);
    process.exit(0);
    return;
  }

  const network = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH);

  console.log();
  console.log(`--- --- market contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployOraclePyth(walletData, network);
  await deployMarket(walletData, network);
  await deployInterestModel(walletData, network);
  await deployDistributionModel(walletData, network);
  await deployOracle(walletData, network);
  await deployOverseer(walletData, network);
  await deployLiquidationQueue(walletData, network);
  await deployCustodyBSei(walletData, network, reward?.address, bSeiToken?.address);


  console.log();
  console.log(`--- --- market contracts storeCode & instantiateContract end --- ---`);

  const { aToken, market, interestModel, distributionModel, oracle, oraclePyth, overseer, liquidationQueue, custodyBSei } = await loadingMarketData(network);

  await printDeployedContracts({ aToken, market, interestModel, distributionModel, oracle, overseer, liquidationQueue, custodyBSei });

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- market contracts configure enter --- ---`);

  /**oracle for local test, because local test enviroment has no oracle_pyth*/
  const marketConfigRes = await queryContractConfig(walletData, market, false);
  const interestModelConfigRes = await queryContractConfig(walletData, interestModel, false);
  const distributionModelConfigRes = await queryContractConfig(walletData, distributionModel, false);
  const oracleConfigRes = await queryContractConfig(walletData, oracle, false);
  const overseerConfigRes = await queryContractConfig(walletData, overseer, false);
  const liquidationQueueConfigRes = await queryContractConfig(walletData, liquidationQueue, false);
  const custodyBSeiConfigRes = await queryContractConfig(walletData, custodyBSei, false);
  const overseerWhitelistRes = await queryOverseerWhitelist(walletData, overseer, false);

  await doMarketConfig(walletData, marketConfigRes.initFlag, marketConfigRes?.config, market, interestModel, distributionModel, overseer, bSeiToken, rewardsDispatcher);
  await doOverseerConfig(walletData, overseerConfigRes?.config, overseer, liquidationQueue);
  await doCustodyBSeiConfig(walletData, custodyBSeiConfigRes?.config, custodyBSei, liquidationQueue);
  await doLiquidationQueueConfig(walletData, liquidationQueueConfigRes?.config, liquidationQueue, oraclePyth, overseer);
  await doOverseerWhitelist(walletData, overseerWhitelistRes, overseer, custodyBSei, bSeiToken);
  await doLiquidationQueueWhitelistCollateral(walletData, liquidationQueue, bSeiToken);

  console.log();
  console.log(`--- --- market contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy market contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

async function deployMarket(walletData: WalletData, network: any): Promise<void> {
  if (!network?.aToken?.address || !network?.market?.address) {
    if (!network?.aToken) {
      network.aToken = {};
    }
    if (!network?.market) {
      network.market = {};
    }

    if (network?.aToken?.codeId <= 0 || !network?.aToken?.codeId) {
      const filePath = chainConfigs?.aToken?.filePath || "../cw-plus/artifacts/cw20_base.wasm";
      network.aToken.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (!network?.market?.codeId || network?.market?.codeId <= 0) {
      const filePath = chainConfigs?.market?.filePath || "../krp-market-contracts/artifacts/moneymarket_market.wasm";
      network.market.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.market?.codeId > 0 && network?.aToken?.codeId > 0) {
      const admin = chainConfigs?.market?.admin || walletData.address;
      const label = chainConfigs?.market?.label;
      const initMsg = Object.assign(
        {
          atoken_code_id: network.aToken.codeId,
          stable_denom: walletData.stable_coin_denom
        },
        chainConfigs?.market?.initMsg,
        {
          owner_addr: chainConfigs?.market?.initMsg?.owner_addr || walletData.address
        }
      );
      const initCoins = chainConfigs?.market?.initCoins?.map(q => Object.assign({}, q, { denom: q?.denom || walletData.stable_coin_denom }));
      const [contract1, contract2] = await instantiateContract2ByWalletData(walletData, admin, network.market.codeId, initMsg, label, initCoins);
      network.aToken.address = contract2;
      network.market.address = contract1;
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.aToken.deploy = true;
      chainConfigs.market.deploy = true;
    }
    console.log(`aToken: `, JSON.stringify(network?.aToken));
    console.log(`market: `, JSON.stringify(network?.market));
  }
}

async function deployInterestModel(walletData: WalletData, network: any): Promise<void> {
  if (!network?.interestModel?.address) {
    if (!network?.interestModel) {
      network.interestModel = {};
    }

    if (!network?.interestModel?.codeId || network?.interestModel?.codeId <= 0) {
      const filePath = chainConfigs?.interestModel?.filePath || "../krp-market-contracts/artifacts/moneymarket_interest_model.wasm";
      network.interestModel.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.interestModel?.codeId > 0) {
      const admin = chainConfigs?.interestModel?.admin || walletData.address;
      const label = chainConfigs?.interestModel?.label;
      const initMsg = Object.assign({}, chainConfigs?.interestModel?.initMsg, {
        owner: chainConfigs?.interestModel?.initMsg?.owner || walletData.address
      });
      network.interestModel.address = await instantiateContractByWalletData(walletData, admin, network.interestModel.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.interestModel.deploy = true;
    }
    console.log(`interestModel: `, JSON.stringify(network?.interestModel));
  }
}

async function deployDistributionModel(walletData: WalletData, network: any): Promise<void> {
  if (!network?.distributionModel?.address) {
    if (!network?.distributionModel) {
      network.distributionModel = {};
    }

    if (!network?.distributionModel?.codeId || network?.distributionModel?.codeId <= 0) {
      const filePath = chainConfigs?.distributionModel?.filePath || "../krp-market-contracts/artifacts/moneymarket_distribution_model.wasm";
      network.distributionModel.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.distributionModel?.codeId > 0) {
      const admin = chainConfigs?.distributionModel?.admin || walletData.address;
      const label = chainConfigs?.distributionModel?.label;
      const initMsg = Object.assign({}, chainConfigs?.distributionModel?.initMsg, {
        owner: chainConfigs?.distributionModel?.initMsg?.owner || walletData.address
      });
      network.distributionModel.address = await instantiateContractByWalletData(walletData, admin, network.distributionModel.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.distributionModel.deploy = true;
    }
    console.log(`distributionModel: `, JSON.stringify(network?.distributionModel));
  }
}

async function deployOracle(walletData: WalletData, network: any): Promise<void> {
  if (!network?.oracle?.address) {
    if (!network?.oracle) {
      network.oracle = {};
    }

    if (!network?.oracle?.codeId || network?.oracle?.codeId <= 0) {
      const filePath = chainConfigs?.oracle?.filePath || "../krp-market-contracts/artifacts/moneymarket_oracle.wasm";
      network.oracle.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.oracle?.codeId > 0) {
      const admin = chainConfigs?.oracle?.admin || walletData.address;
      const label = chainConfigs?.oracle?.label;
      const initMsg = Object.assign({ base_asset: walletData.stable_coin_denom }, chainConfigs?.oracle?.initMsg, {
        owner: chainConfigs?.oracle?.initMsg?.owner || walletData.address
      });
      network.oracle.address = await instantiateContractByWalletData(walletData, admin, network.oracle.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.oracle.deploy = true;
    }
    console.log(`oracle: `, JSON.stringify(network?.oracle));
  }
}

async function deployOverseer(walletData: WalletData, network: any): Promise<void> {
  const marketAddress = network?.market?.address;
  const oracleAddress = network?.oraclePyth?.address;
  const liquidationQueueAddress = network?.liquidationQueue?.address;
  if (!marketAddress || !oracleAddress) {
    return;
  }

  if (!network?.overseer?.address) {
    if (!network?.overseer) {
      network.overseer = {};
    }

    if (!network?.overseer?.codeId || network?.overseer?.codeId <= 0) {
      const filePath = chainConfigs?.overseer?.filePath || "../krp-market-contracts/artifacts/moneymarket_overseer.wasm";
      network.overseer.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.overseer?.codeId > 0) {
      const admin = chainConfigs?.overseer?.admin || walletData.address;
      const label = chainConfigs?.overseer?.label;
      const initMsg = Object.assign(
        {
          market_contract: marketAddress,
          oracle_contract: oracleAddress,
          liquidation_contract: liquidationQueueAddress || walletData.address,
          stable_denom: walletData.stable_coin_denom
        },
        chainConfigs?.overseer?.initMsg,
        {
          owner_addr: chainConfigs?.overseer?.initMsg?.owner_addr || walletData.address
        }
      );
      network.overseer.address = await instantiateContractByWalletData(walletData, admin, network.overseer.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.overseer.deploy = true;
    }
    console.log(`overseer: `, JSON.stringify(network?.overseer));
  }
}

async function deployLiquidationQueue(walletData: WalletData, network: any): Promise<void> {
  const oracleAddress = network?.oraclePyth?.address;
  const overseerAddress = network?.overseer?.address;
  if (!oracleAddress) {
    return;
  }

  if (!network?.liquidationQueue?.address) {
    if (!network?.liquidationQueue) {
      network.liquidationQueue = {};
    }

    if (!network?.liquidationQueue?.codeId || network?.liquidationQueue?.codeId <= 0) {
      const filePath = chainConfigs?.liquidationQueue?.filePath || "../krp-market-contracts/artifacts/moneymarket_liquidation_queue.wasm";
      network.liquidationQueue.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.liquidationQueue?.codeId > 0) {
      const admin = chainConfigs?.liquidationQueue?.admin || walletData.address;
      const label = chainConfigs?.liquidationQueue?.label;
      const initMsg = Object.assign(
        {
          oracle_contract: oracleAddress,
          overseer: overseerAddress || walletData.address,
          stable_denom: walletData.stable_coin_denom
        },
        chainConfigs?.liquidationQueue?.initMsg,
        {
          owner: chainConfigs?.liquidationQueue?.initMsg?.owner || walletData.address
        }
      );
      network.liquidationQueue.address = await instantiateContractByWalletData(walletData, admin, network.liquidationQueue.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.liquidationQueue.deploy = true;
    }
    console.log(`liquidationQueue: `, JSON.stringify(network?.liquidationQueue));
  }
}

async function deployCustodyBSei(walletData: WalletData, network: any, rewardAddress: string, bSeiTokenAddress: string): Promise<void> {
  const marketAddress = network?.market?.address;
  const liquidationQueueAddress = network?.liquidationQueue?.address;
  const overseerAddress = network?.overseer?.address;
  if (!marketAddress || !liquidationQueueAddress || !overseerAddress || !rewardAddress || !bSeiTokenAddress) {
    return;
  }

  if (!network?.custodyBSei?.address) {
    if (!network?.custodyBSei) {
      network.custodyBSei = {};
    }

    if (!network?.custodyBSei?.codeId || network?.custodyBSei?.codeId <= 0) {
      const filePath = chainConfigs?.custodyBSei?.filePath || "../krp-market-contracts/artifacts/moneymarket_custody_bsei.wasm";
      network.custodyBSei.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.custodyBSei?.codeId > 0) {
      const admin = chainConfigs?.custodyBSei?.admin || walletData.address;
      const label = chainConfigs?.custodyBSei?.label;
      const initMsg = Object.assign(
        {
          collateral_token: bSeiTokenAddress,
          liquidation_contract: liquidationQueueAddress,
          market_contract: marketAddress,
          overseer_contract: overseerAddress,
          reward_contract: rewardAddress,
          stable_denom: walletData.stable_coin_denom
        },
        chainConfigs?.custodyBSei?.initMsg,
        {
          owner: chainConfigs?.custodyBSei?.initMsg?.owner || walletData.address
        }
      );
      network.custodyBSei.address = await instantiateContractByWalletData(walletData, admin, network.custodyBSei.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.custodyBSei.deploy = true;
    }
    console.log(`custodyBSei: `, JSON.stringify(network?.custodyBSei));
  }
}

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
        owner: chainConfigs?.oraclePyth?.initMsg?.owner || walletData.address
      });
      network.oraclePyth.address = await instantiateContractByWalletData(walletData, admin, network.oraclePyth.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.oraclePyth.deploy = true;
    }
    console.log(`oraclePyth: `, JSON.stringify(network?.oraclePyth));
  }
}

async function doMarketConfig(walletData: WalletData, marketInitFlag: boolean, marketConfigRes: any, market: DeployContract, interestModel: DeployContract, distributionModel: DeployContract, overseer: DeployContract, bSeiToken: DeployContract, rewardsDispatcher: DeployContract): Promise<void> {
  if (!market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !bSeiToken?.address || !rewardsDispatcher?.address) {
    return;
  }
  const marketConfigFlag: boolean =
    marketInitFlag &&
    overseer.address === marketConfigRes?.overseer_contract &&
    interestModel.address === marketConfigRes?.interest_model &&
    distributionModel.address === marketConfigRes?.distribution_model &&
    bSeiToken.address === marketConfigRes?.collector_contract &&
    rewardsDispatcher.address === marketConfigRes?.distributor_contract;
  if (!marketConfigFlag) {
    console.log();
    console.warn("Do market's register_contracts enter");
    const marketRegisterContractsRes = await executeContractByWalletData(walletData, market.address, {
      register_contracts: {
        interest_model: interestModel.address,
        distribution_model: distributionModel.address,
        overseer_contract: overseer.address,
        collector_contract: bSeiToken.address,
        distributor_contract: rewardsDispatcher.address
      }
    });
    console.log("Do market's register_contracts ok. \n", marketRegisterContractsRes?.transactionHash);
    await queryContractConfig(walletData, market, true);
  }
}

async function doOverseerConfig(walletData: WalletData, overseerConfigRes: any, overseer: DeployContract, liquidationQueue: DeployContract): Promise<void> {
  if (!overseer?.address || !liquidationQueue?.address) {
    return;
  }
  // {"owner_addr":"","oracle_contract":"","market_contract":"","liquidation_contract":"","collector_contract":"","threshold_deposit_rate":"","target_deposit_rate":"","buffer_distribution_factor":"","anc_purchase_factor":"","stable_denom":"","epoch_period":0,"price_timeframe":0,"dyn_rate_epoch":0,"dyn_rate_maxchange":"","dyn_rate_yr_increase_expectation":"","dyn_rate_min":"","dyn_rate_max":""}
  const overseerConfigFlag: boolean = liquidationQueue.address === overseerConfigRes?.liquidation_contract;
  if (!overseerConfigFlag) {
    console.log();
    console.warn("Do overseer's config enter");
    const overseerUpdateConfigRes = await executeContractByWalletData(walletData, overseer.address, {
      update_config: {
        liquidation_contract: liquidationQueue.address
        // epoch_period: chainConfigs?.overseer?.initMsg.epoch_period,
      }
    });
    console.log("Do overseer's config ok. \n", overseerUpdateConfigRes?.transactionHash);
    await queryContractConfig(walletData, overseer);
  }
}

async function doCustodyBSeiConfig(walletData: WalletData, custodyBSeiConfigRes: any, custodyBSei: DeployContract, liquidationQueue: DeployContract): Promise<void> {
  if (!custodyBSei?.address || !liquidationQueue?.address) {
    return;
  }

  // {"owner":"","collateral_token":"","overseer_contract":"","market_contract":"","reward_contract":"","liquidation_contract":"","stable_denom":"","basset_info":{"name":"","symbol":"","decimals":6}}
  const custodyBSeiConfigFlag: boolean = liquidationQueue.address === custodyBSeiConfigRes?.liquidation_contract;
  if (!custodyBSeiConfigFlag) {
    console.log();
    console.warn("Do custodyBSei's config enter");
    let custodyBSeiUpdateConfigRes = await executeContractByWalletData(walletData, custodyBSei.address, {
      update_config: {
        // owner: chainConfigs?.custodyBSei?.initMsg?.owner || walletData.address,
        liquidation_contract: liquidationQueue.address
      }
    });
    console.log("Do custodyBSei's config ok. \n", custodyBSeiUpdateConfigRes?.transactionHash);
    await queryContractConfig(walletData, custodyBSei);
  }
}

async function doLiquidationQueueConfig(walletData: WalletData, liquidationQueueConfigRes: any, liquidationQueue: DeployContract, oraclePyth: DeployContract, overseer: DeployContract): Promise<void> {
  if (!liquidationQueue?.address || !oraclePyth?.address || !overseer?.address) {
    return;
  }
  // {"owner":"","oracle_contract":"","stable_denom":"","safe_ratio":"","bid_fee":"","liquidator_fee":"","liquidation_threshold":"","price_timeframe": “”,"waiting_period":“”,"overseer":""}
  const liquidationQueueConfigFlag: boolean = oraclePyth.address === liquidationQueueConfigRes?.oracle_contract && overseer.address === liquidationQueueConfigRes?.overseer;
  if (!liquidationQueueConfigFlag) {
    console.log();
    console.warn("Do liquidationQueue's config enter");
    const liquidationQueueUpdateConfigRes = await executeContractByWalletData(walletData, liquidationQueue.address, {
      update_config: {
        oracle_contract: oraclePyth.address,
        overseer: overseer.address
        // owner: chainConfigs?.liquidationQueue?.initMsg?.owner || walletData.address,
        // safe_ratio: "0.8",
        // bid_fee: "0.01",
        // liquidator_fee: "0.01",
        // liquidation_threshold: "500",
        // price_timeframe: 86400,
        // waiting_period: 600,
      }
    });
    console.log("Do liquidationQueue's config ok. \n", liquidationQueueUpdateConfigRes?.transactionHash);
    await queryContractConfig(walletData, liquidationQueue);
  }
}

async function doOverseerWhitelist(walletData: WalletData, overseerWhitelistRes: any, overseer: DeployContract, custodyBSei: DeployContract, bSeiToken: DeployContract): Promise<void> {
  if (!overseer?.address || !custodyBSei?.address || !bSeiToken?.address) {
    return;
  }
  // {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
  let overseerWhitelistFlag: boolean = false;
  if (overseerWhitelistRes?.["elems"]) {
    for (const item of overseerWhitelistRes?.["elems"]) {
      if (bSeiToken.address === item?.["collateral_token"] && custodyBSei.address === item?.["custody_contract"]) {
        overseerWhitelistFlag = true;
        break;
      }
    }
  }
  if (!overseerWhitelistFlag) {
    console.log();
    console.warn("Do overseer's add whitelist enter");
    const overseerWhitelistRes = await executeContractByWalletData(walletData, overseer.address, {
      whitelist: {
        custody_contract: custodyBSei.address,
        collateral_token: bSeiToken.address,
        name: chainConfigs?.overseer?.updateMsg?.name || "Bond Sei",
        symbol: chainConfigs?.overseer?.updateMsg?.symbol || "bSEI",
        max_ltv: chainConfigs?.overseer?.updateMsg?.max_ltv || "0.65"
      }
    });
    console.log("Do overseer's add whitelist ok. \n", overseerWhitelistRes?.transactionHash);
    await queryOverseerWhitelist(walletData, overseer);
  }
}

async function doLiquidationQueueWhitelistCollateral(walletData: WalletData, liquidationQueue: DeployContract, bSeiToken: DeployContract): Promise<void> {
  if (!liquidationQueue?.address || !bSeiToken?.address) {
    return;
  }
  // overseerWhitelistFlag must be true
  let liquidationQueueWhitelistCollateralFlag = true;
  try {
    await queryWasmContractByWalletData(walletData, liquidationQueue.address, { collateral_info: { collateral_token: bSeiToken.address } });
  } catch (error: any) {
    if (error.toString().includes("Collateral is not whitelisted")) {
      liquidationQueueWhitelistCollateralFlag = false;
    }
  }
  if (!liquidationQueueWhitelistCollateralFlag) {
    console.log();
    console.warn("Do liquidationQueue's whitelist_collateral enter");
    const liquidationQueueWhitelistCollateralRes = await executeContractByWalletData(walletData, liquidationQueue.address, {
      whitelist_collateral: {
        collateral_token: bSeiToken.address,
        bid_threshold: chainConfigs?.liquidationQueue?.updateMsg?.bid_threshold,
        max_slot: chainConfigs?.liquidationQueue?.updateMsg?.max_slot,
        premium_rate_per_slot: chainConfigs?.liquidationQueue?.updateMsg?.premium_rate_per_slot
      }
    });
    console.log("Do liquidationQueue's whitelist_collateral ok. \n", liquidationQueueWhitelistCollateralRes?.transactionHash);
  }
}
//
// /**
//  * {"contract_addr":"","owner_addr":"","atoken_contract":"","interest_model":"","distribution_model":"","overseer_contract":"","collector_contract":"","distributor_contract":"","stable_denom":"","max_borrow_factor":""}
//  */
// async function queryMarketConfig(walletData: WalletData, market: DeployContract, print: boolean = true): Promise<any> {
//   if (!market || !market.address) {
//     return;
//   }
//   let marketConfigRes = null;
//   let marketInitFlag = true;
//   try {
//     print && console.log();
//     print && console.log("Query market.address config enter");
//     marketConfigRes = await queryWasmContractByWalletData(walletData, market.address, { config: {} });
//     print && console.log(`market.config: \n${JSON.stringify(marketConfigRes)}`);
//   } catch (error: any) {
//     if (error.toString().includes("addr_humanize")) {
//       marketInitFlag = false;
//       console.error(`market.config: need update config`);
//     }
//   }
//   return { marketInitFlag, marketConfigRes };
// }
//
// /**
//  * {"owner":"","base_rate":"","interest_multiplier":""}
//  */
// async function queryInterestModelConfig(walletData: WalletData, interestModel: DeployContract): Promise<any> {
//   if (!interestModel || !interestModel.address) {
//     return;
//   }
//   console.log();
//   console.log("Query interestModel.address config enter");
//   const interestModelConfigRes = await queryWasmContractByWalletData(walletData, interestModel.address, { config: {} });
//   console.log(`interestModel.config: \n${JSON.stringify(interestModelConfigRes)}`);
//   return interestModelConfigRes;
// }
//
// /**
//  * {"owner":"","emission_cap":"","emission_floor":"","increment_multiplier":"","decrement_multiplier":""}
//  */
// async function queryDistributionModelConfig(walletData: WalletData, distributionModel: DeployContract): Promise<any> {
//   if (!distributionModel || !distributionModel.address) {
//     return;
//   }
//   console.log();
//   console.log("Query distributionModel.address config enter");
//   const distributionModelConfigRes = await queryWasmContractByWalletData(walletData, distributionModel.address, { config: {} });
//   console.log(`distributionModel.config: \n${JSON.stringify(distributionModelConfigRes)}`);
//   return distributionModelConfigRes;
// }
//
// /**
//  * {"owner":"","base_asset":""}
//  */
// async function queryOracleConfig(walletData: WalletData, oracle: DeployContract): Promise<any> {
//   if (!oracle || !oracle.address) {
//     return;
//   }
//   console.log();
//   console.log("Query oracle.address config enter");
//   const oracleConfigRes = await queryWasmContractByWalletData(walletData, oracle.address, { config: {} });
//   console.log(`oracle.config: \n${JSON.stringify(oracleConfigRes)}`);
//   return oracleConfigRes;
// }
//
// /**
//  * {"owner":"","oracle_contract":"","stable_denom":"","safe_ratio":"","bid_fee":"","liquidator_fee":"","liquidation_threshold":"","price_timeframe": “”,"waiting_period":“”,"overseer":""}
//  */
// async function queryLiquidationQueueConfig(walletData: WalletData, liquidationQueue: DeployContract): Promise<any> {
//   if (!liquidationQueue || !liquidationQueue.address) {
//     return;
//   }
//   console.log();
//   console.log("Query liquidationQueue.address config enter");
//   const liquidationQueueConfigRes = await queryWasmContractByWalletData(walletData, liquidationQueue.address, { config: {} });
//   console.log(`liquidationQueue.config: \n${JSON.stringify(liquidationQueueConfigRes)}`);
//   return liquidationQueueConfigRes;
// }
//
// /**
//  * {"owner_addr":"","oracle_contract":"","market_contract":"","liquidation_contract":"","collector_contract":"","threshold_deposit_rate":"","target_deposit_rate":"","buffer_distribution_factor":"","anc_purchase_factor":"","stable_denom":"","epoch_period":0,"price_timeframe":0,"dyn_rate_epoch":0,"dyn_rate_maxchange":"","dyn_rate_yr_increase_expectation":"","dyn_rate_min":"","dyn_rate_max":""}
//  */
// async function queryOverseerConfig(walletData: WalletData, overseer: DeployContract): Promise<any> {
//   if (!overseer || !overseer.address) {
//     return;
//   }
//   console.log();
//   console.log("Query overseer.address config enter");
//   const overseerConfigRes = await queryWasmContractByWalletData(walletData, overseer.address, { config: {} });
//   console.log(`overseer.config: \n${JSON.stringify(overseerConfigRes)}`);
//   return overseerConfigRes;
// }
//
// /**
//  * {"owner":"","collateral_token":"","overseer_contract":"","market_contract":"","reward_contract":"","liquidation_contract":"","stable_denom":"","basset_info":{"name":"","symbol":"","decimals":6}}
//  */
// async function queryCustodyBSeiConfig(walletData: WalletData, custodyBSei: DeployContract): Promise<any> {
//   if (!custodyBSei || !custodyBSei.address) {
//     return;
//   }
//   console.log();
//   console.log("Query custodyBSei.address config enter");
//   const custodyBSeiConfigRes = await queryWasmContractByWalletData(walletData, custodyBSei.address, { config: {} });
//   console.log(`custodyBSei.config: \n${JSON.stringify(custodyBSeiConfigRes)}`);
//   return custodyBSeiConfigRes;
// }

/**
 * {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
 */
async function queryOverseerWhitelist(walletData: WalletData, overseer: DeployContract, print: boolean = true): Promise<any> {
  if (!overseer || !overseer.address) {
    return;
  }
  print && console.log();
  print && console.log("Query overseer.address whitelist enter");
  const overseerWhitelistRes = await queryWasmContractByWalletData(walletData, overseer.address, { whitelist: {} });
  print && console.log(`overseer.whitelist: \n${JSON.stringify(overseerWhitelistRes)}`);
  return overseerWhitelistRes;
}

async function printDeployedContracts({ aToken, market, interestModel, distributionModel, oracle, overseer, liquidationQueue, custodyBSei }): Promise<any> {
  console.log();
  console.log(`--- --- deployed market contracts info --- ---`);
  const tableData = [
    { name: `aToken`, deploy: chainConfigs?.aToken?.deploy, ...aToken },
    { name: `market`, deploy: chainConfigs?.market?.deploy, ...market },
    { name: `interestModel`, deploy: chainConfigs?.interestModel?.deploy, ...interestModel },
    { name: `distributionModel`, deploy: chainConfigs?.distributionModel?.deploy, ...distributionModel },
    { name: `oracle`, deploy: chainConfigs?.oracle?.deploy, ...oracle },
    { name: `overseer`, deploy: chainConfigs?.overseer?.deploy, ...overseer },
    { name: `liquidationQueue`, deploy: chainConfigs?.liquidationQueue?.deploy, ...liquidationQueue },
    { name: `custodyBSei`, deploy: chainConfigs?.custodyBSei?.deploy, ...custodyBSei },
    { name: `oraclePyth`, deploy: chainConfigs?.oraclePyth?.deploy, ...oracle },
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

main().catch(console.log);
