import { chainConfigs, DEPLOY_VERSION, MARKET_ARTIFACTS_PATH, MARKET_MODULE_NAME } from "../env_data";
import { executeContractByWalletData, instantiateContract2ByWalletData, instantiateContractByWalletData, queryContractConfig, queryWasmContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "../common";
import { ChainId, DeployContract, MarketDeployContracts, WalletData } from "../types";
import { OraclePythClient, OraclePythQueryClient } from "../contracts/OraclePyth.client";

export const ConfigOraclePythBaseFeedInfoList: Record<
  string,
  {
    checkFeedAge: boolean;
    priceFeedAge: number;
    priceFeedDecimal: number;
    priceFeedId: string;
    priceFeedSymbol: string;
  }
> = {
  [ChainId.SEI_CHAIN]: {
    checkFeedAge: true,
    priceFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    priceFeedSymbol: "Crypto.ETH/USD",
    priceFeedDecimal: 18,
    priceFeedAge: 60
  },
  [ChainId.ATLANTIC_2]: {
    checkFeedAge: true,
    priceFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    priceFeedSymbol: "Crypto.ETH/USD",
    priceFeedDecimal: 8,
    priceFeedAge: 720000000
  }
};

export const ConfigOraclePythFeedInfoList: Record<
  string,
  {
    asset: string;
    checkFeedAge: boolean;
    priceFeedAge: number;
    priceFeedDecimal: number;
    priceFeedId: string;
    priceFeedSymbol: string;
  }[]
> = {
  [ChainId.SEI_CHAIN]: [
    {
      checkFeedAge: true,
      asset: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/USDT",
      priceFeedId: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
      priceFeedSymbol: "Crypto.USDT/USD",
      priceFeedDecimal: 8,
      priceFeedAge: 60
    },
    Object.assign({ asset: "usei" }, ConfigOraclePythBaseFeedInfoList[ChainId.SEI_CHAIN])
    
  ],
  // usei and btokens
  [ChainId.ATLANTIC_2]: [
    {
      checkFeedAge: true,
      asset: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt",
      priceFeedId: "5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
      priceFeedSymbol: "Crypto.USDT/USD",
      priceFeedDecimal: 8,
      priceFeedAge: 720000000
    },
    Object.assign({ asset: "usei" }, ConfigOraclePythBaseFeedInfoList[ChainId.ATLANTIC_2])
  ]
};

export function getMarketDeployFileName(chainId: string): string {
  return `deployed_${MARKET_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function marketReadArtifact(chainId: string): MarketDeployContracts {
  return readArtifact(getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
}

export function marketWriteArtifact(networkMarket: MarketDeployContracts, chainId: string): void {
  writeArtifact(networkMarket, getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH);
}

export async function deployOraclePyth(walletData: WalletData, networkMarket: MarketDeployContracts): Promise<void> {
  // if ("atlantic-2" !== walletData.chainId) {
  //   return;
  // }

  if (!networkMarket?.oraclePyth?.address) {
    if (!networkMarket?.oraclePyth) {
      networkMarket.oraclePyth = {};
    }

    if (!networkMarket?.oraclePyth?.codeId || networkMarket?.oraclePyth?.codeId <= 0) {
      const filePath = chainConfigs?.oraclePyth?.filePath || "../krp-market-contracts/artifacts/moneymarket_oracle_pyth.wasm";
      networkMarket.oraclePyth.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(networkMarket, walletData.chainId);
    }
    if (networkMarket?.oraclePyth?.codeId > 0) {
      const admin = chainConfigs?.oraclePyth?.admin || walletData.address;
      const label = chainConfigs?.oraclePyth?.label;
      const initMsg = Object.assign({}, chainConfigs?.oraclePyth?.initMsg, {
        owner: chainConfigs?.oraclePyth?.initMsg?.owner || walletData.address
      });
      networkMarket.oraclePyth.address = await instantiateContractByWalletData(walletData, admin, networkMarket.oraclePyth.codeId, initMsg, label);
      marketWriteArtifact(networkMarket, walletData.chainId);
      chainConfigs.oraclePyth.deploy = true;
    }
    console.log(`oraclePyth: `, JSON.stringify(networkMarket?.oraclePyth));
  }
}

export async function deployMarket(walletData: WalletData, network: MarketDeployContracts): Promise<void> {
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
      marketWriteArtifact(network, walletData.chainId);
    }
    if (!network?.market?.codeId || network?.market?.codeId <= 0) {
      const filePath = chainConfigs?.market?.filePath || "../krp-market-contracts/artifacts/moneymarket_market.wasm";
      network.market.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(network, walletData.chainId);
    }
    if (network?.market?.codeId > 0 && network?.aToken?.codeId > 0) {
      const admin = chainConfigs?.market?.admin || walletData.address;
      const label = chainConfigs?.market?.label;
      const initMsg = Object.assign(
        {
          atoken_code_id: network.aToken.codeId,
          stable_denom: walletData.stable_coin_denom, 
          stable_name: "USDT"
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
      network.market_stable_denom = walletData.stable_coin_denom;
      marketWriteArtifact(network, walletData.chainId);
      chainConfigs.aToken.deploy = true;
      chainConfigs.market.deploy = true;
    }
    console.log(`aToken: `, JSON.stringify(network?.aToken));
    console.log(`market: `, JSON.stringify(network?.market));
  }
}

export async function deployInterestModel(walletData: WalletData, network: MarketDeployContracts): Promise<void> {
  if (!network?.interestModel?.address) {
    if (!network?.interestModel) {
      network.interestModel = {};
    }

    if (!network?.interestModel?.codeId || network?.interestModel?.codeId <= 0) {
      const filePath = chainConfigs?.interestModel?.filePath || "../krp-market-contracts/artifacts/moneymarket_interest_model.wasm";
      network.interestModel.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(network, walletData.chainId);
    }
    if (network?.interestModel?.codeId > 0) {
      const admin = chainConfigs?.interestModel?.admin || walletData.address;
      const label = chainConfigs?.interestModel?.label;
      const initMsg = Object.assign({}, chainConfigs?.interestModel?.initMsg, {
        owner: chainConfigs?.interestModel?.initMsg?.owner || walletData.address
      });
      network.interestModel.address = await instantiateContractByWalletData(walletData, admin, network.interestModel.codeId, initMsg, label);
      marketWriteArtifact(network, walletData.chainId);
      chainConfigs.interestModel.deploy = true;
    }
    console.log(`interestModel: `, JSON.stringify(network?.interestModel));
  }
}

export async function deployDistributionModel(walletData: WalletData, network: MarketDeployContracts): Promise<void> {
  if (!network?.distributionModel?.address) {
    if (!network?.distributionModel) {
      network.distributionModel = {};
    }

    if (!network?.distributionModel?.codeId || network?.distributionModel?.codeId <= 0) {
      const filePath = chainConfigs?.distributionModel?.filePath || "../krp-market-contracts/artifacts/moneymarket_distribution_model.wasm";
      network.distributionModel.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(network, walletData.chainId);
    }
    if (network?.distributionModel?.codeId > 0) {
      const admin = chainConfigs?.distributionModel?.admin || walletData.address;
      const label = chainConfigs?.distributionModel?.label;
      const initMsg = Object.assign({}, chainConfigs?.distributionModel?.initMsg, {
        owner: chainConfigs?.distributionModel?.initMsg?.owner || walletData.address
      });
      network.distributionModel.address = await instantiateContractByWalletData(walletData, admin, network.distributionModel.codeId, initMsg, label);
      marketWriteArtifact(network, walletData.chainId);
      chainConfigs.distributionModel.deploy = true;
    }
    console.log(`distributionModel: `, JSON.stringify(network?.distributionModel));
  }
}

export async function deployOracle(walletData: WalletData, network: MarketDeployContracts): Promise<void> {
  if (!network?.oracle?.address) {
    if (!network?.oracle) {
      network.oracle = {};
    }

    if (!network?.oracle?.codeId || network?.oracle?.codeId <= 0) {
      const filePath = chainConfigs?.oracle?.filePath || "../krp-market-contracts/artifacts/moneymarket_oracle.wasm";
      network.oracle.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(network, walletData.chainId);
    }
    if (network?.oracle?.codeId > 0) {
      const admin = chainConfigs?.oracle?.admin || walletData.address;
      const label = chainConfigs?.oracle?.label;
      const initMsg = Object.assign({ base_asset: walletData.stable_coin_denom }, chainConfigs?.oracle?.initMsg, {
        owner: chainConfigs?.oracle?.initMsg?.owner || walletData.address
      });
      network.oracle.address = await instantiateContractByWalletData(walletData, admin, network.oracle.codeId, initMsg, label);
      marketWriteArtifact(network, walletData.chainId);
      chainConfigs.oracle.deploy = true;
    }
    console.log(`oracle: `, JSON.stringify(network?.oracle));
  }
}

export async function deployOverseer(walletData: WalletData, network: MarketDeployContracts): Promise<void> {
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
      marketWriteArtifact(network, walletData.chainId);
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
      marketWriteArtifact(network, walletData.chainId);
      chainConfigs.overseer.deploy = true;
    }
    console.log(`overseer: `, JSON.stringify(network?.overseer));
  }
}

export async function deployLiquidationQueue(walletData: WalletData, network: MarketDeployContracts): Promise<void> {
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
      marketWriteArtifact(network, walletData.chainId);
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
      marketWriteArtifact(network, walletData.chainId);
      chainConfigs.liquidationQueue.deploy = true;
    }
    console.log(`liquidationQueue: `, JSON.stringify(network?.liquidationQueue));
  }
}

export async function deployCustodyBSei(walletData: WalletData, network: MarketDeployContracts, rewardAddress: string, bSeiTokenAddress: string, swapExtention: DeployContract): Promise<void> {
  const marketAddress = network?.market?.address;
  const liquidationQueueAddress = network?.liquidationQueue?.address;
  const overseerAddress = network?.overseer?.address;
  const oraclepythAddress = network?.oraclePyth?.address;
  if (!marketAddress || !liquidationQueueAddress || !overseerAddress || !rewardAddress || !bSeiTokenAddress || !swapExtention?.address) {
    return;
  }

  if (!network?.custodyBSei?.address) {
    if (!network?.custodyBSei) {
      network.custodyBSei = {};
    }

    if (!network?.custodyBSei?.codeId || network?.custodyBSei?.codeId <= 0) {
      const filePath = chainConfigs?.custodyBSei?.filePath || "../krp-market-contracts/artifacts/moneymarket_custody_bsei.wasm";
      network.custodyBSei.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(network, walletData.chainId);
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
          stable_denom: walletData.stable_coin_denom,
          swap_contract: swapExtention?.address,
          swap_denoms: [walletData.nativeCurrency.coinMinimalDenom],
          oracle_contract: oraclepythAddress,
        },
        chainConfigs?.custodyBSei?.initMsg,
        {
          owner: chainConfigs?.custodyBSei?.initMsg?.owner || walletData.address
        }
      );
      network.custodyBSei.address = await instantiateContractByWalletData(walletData, admin, network.custodyBSei.codeId, initMsg, label);
      marketWriteArtifact(network, walletData.chainId);
      chainConfigs.custodyBSei.deploy = true;
    }
    console.log(`custodyBSei: `, JSON.stringify(network?.custodyBSei));
  }
}

export async function doMarketConfig(
  walletData: WalletData,
  network: any, 
  marketInitFlag: boolean,
  marketConfigRes: any,
  market: DeployContract,
  interestModel: DeployContract,
  distributionModel: DeployContract,
  overseer: DeployContract,
  bSeiToken: DeployContract,
  rewardsDispatcher: DeployContract
): Promise<void> {
  if (!market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !bSeiToken?.address || !rewardsDispatcher?.address) {
    return;
  }
  const oraclepythAddress = network?.oraclePyth?.address;
  const liquidationQueueAddress = network?.liquidationQueue?.address;
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
        distributor_contract: rewardsDispatcher.address, 
        oracle_contract: oraclepythAddress,
        liquidation_contract: liquidationQueueAddress,
      }
    });
    console.log("Do market's register_contracts ok. \n", marketRegisterContractsRes?.transactionHash);
    await queryContractConfig(walletData, market, true);
  }
}

export async function doOverseerConfig(walletData: WalletData, overseerConfigRes: any, overseer: DeployContract, liquidationQueue: DeployContract): Promise<void> {
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

export async function doCustodyBSeiConfig(walletData: WalletData, custodyBSeiConfigRes: any, custodyBSei: DeployContract, liquidationQueue: DeployContract): Promise<void> {
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

export async function doLiquidationQueueConfig(walletData: WalletData, liquidationQueueConfigRes: any, liquidationQueue: DeployContract, oraclePyth: DeployContract, overseer: DeployContract): Promise<void> {
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

export async function doOverseerWhitelist(walletData: WalletData, nativeDenom: string, overseer: DeployContract, custody: DeployContract, btoken: DeployContract, updateMsg?: object): Promise<void> {
  console.log();
  console.warn("Do overseer's add whitelist enter. collateral_token: " + btoken.address);
  if (!overseer?.address || !custody?.address || !btoken?.address) {
    return;
  }
  // {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
  let overseerWhitelistFlag: boolean = false;
  const overseerWhitelistRes: any = await queryOverseerWhitelist(walletData, overseer);
  if (overseerWhitelistRes?.["elems"]) {
    for (const item of overseerWhitelistRes?.["elems"]) {
      if (btoken.address === item?.["collateral_token"] && custody.address === item?.["custody_contract"]) {
        overseerWhitelistFlag = true;
        break;
      }
    }
  }
  if (!overseerWhitelistFlag) {
    const overseerWhitelistRes = await executeContractByWalletData(walletData, overseer.address, {
      whitelist: {
        collateral_token: btoken.address,
        custody_contract: custody.address,
        name: updateMsg?.["name"] || chainConfigs?.overseer?.updateMsg?.name || "Bond Sei",
        symbol: updateMsg?.["symbol"] || chainConfigs?.overseer?.updateMsg?.symbol || "bSEI",
        max_ltv: updateMsg?.["max_ltv"] || chainConfigs?.overseer?.updateMsg?.max_ltv || "0"
      }
    });
    console.log("Do overseer's add whitelist ok. \n", btoken.address, overseerWhitelistRes?.transactionHash);
    await queryOverseerWhitelist(walletData, overseer);
  }
}

export async function doLiquidationQueueWhitelistCollateral(walletData: WalletData, nativeDenom: string, liquidationQueue: DeployContract, btoken: DeployContract, updateMsg?: object): Promise<void> {
  console.log();
  console.warn("Do liquidationQueue's whitelist_collateral enter. collateral_token: " + btoken.address);
  if (!liquidationQueue?.address || !btoken?.address) {
    return;
  }
  // overseerWhitelistFlag must be true
  let liquidationQueueWhitelistCollateralFlag = true;
  try {
    await queryWasmContractByWalletData(walletData, liquidationQueue.address, { collateral_info: { collateral_token: btoken.address } });
  } catch (error: any) {
    if (error.toString().includes("Collateral is not whitelisted")) {
      liquidationQueueWhitelistCollateralFlag = false;
    }
  }
  if (!liquidationQueueWhitelistCollateralFlag) {
    const liquidationQueueWhitelistCollateralRes = await executeContractByWalletData(walletData, liquidationQueue.address, {
      whitelist_collateral: {
        collateral_token: btoken.address,
        bid_threshold: updateMsg?.["bid_threshold"] || chainConfigs?.liquidationQueue?.updateMsg?.bid_threshold,
        max_slot: updateMsg?.["max_slot"] || chainConfigs?.liquidationQueue?.updateMsg?.max_slot,
        premium_rate_per_slot: updateMsg?.["premium_rate_per_slot"] || chainConfigs?.liquidationQueue?.updateMsg?.premium_rate_per_slot
      }
    });
    console.log("Do liquidationQueue's whitelist_collateral ok. \n", btoken.address, liquidationQueueWhitelistCollateralRes?.transactionHash);
  }
}

/**
 * {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
 */
export async function queryOverseerWhitelist(walletData: WalletData, overseer: DeployContract, print: boolean = true): Promise<any> {
  if (!overseer || !overseer.address) {
    return;
  }
  print && console.log();
  print && console.log("Query overseer.address whitelist enter");
  const overseerWhitelistRes = await queryWasmContractByWalletData(walletData, overseer.address, { whitelist: {} });
  print && console.log(`overseer.whitelist: \n${JSON.stringify(overseerWhitelistRes)}`);
  return overseerWhitelistRes;
}

export async function doOraclePythConfigFeedInfo(walletData: WalletData, oraclePyth: DeployContract, configFeedInfoParams: { asset: string; checkFeedAge: boolean; priceFeedAge: number; priceFeedDecimal: number; priceFeedId: string; priceFeedSymbol: string }, print: boolean = true): Promise<void> {
  print && console.log();
  print && console.warn(`Do oraclePyth.address ConfigFeedInfo enter. asset: ${configFeedInfoParams.asset}`);
  if (!oraclePyth?.address || !configFeedInfoParams?.asset || !configFeedInfoParams?.priceFeedId) {
    console.log();
    console.error("********* missing info!");
    return;
  }

  const oraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);

  let configRes = null;
  let initFlag = true;
  try {
    configRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: configFeedInfoParams.asset });
  } catch (error: any) {
    if (error?.toString().includes("Pyth feeder config not found")) {
      initFlag = false;
      console.error(`oraclePyth.address: need ConfigFeedInfo, asset: ${configFeedInfoParams.asset}`);
    } else {
      throw new Error(error);
    }
  }
  // print && console.log(`queryPythFeederConfig ok. asset: ${configFeedInfoParams.asset} \n${JSON.stringify(configRes)}`);
  if (initFlag) {
    console.warn(`********* The asset is already done. asset: ${configFeedInfoParams.asset} \n${JSON.stringify(configRes)}`);
    return;
  }

  const oraclePythClient = new OraclePythClient(walletData.signingCosmWasmClient, walletData.address, oraclePyth.address);
  const doRes = await oraclePythClient.configFeedInfo(configFeedInfoParams);

  print && console.log(`Do oraclePyth.address ConfigFeedInfo ok. \n${doRes?.transactionHash}`);
  // await queryPythFeederConfig(walletData, oraclePyth, configFeedInfoParams.asset_address);
}

export async function queryPythFeederConfig(walletData: WalletData, oraclePyth: DeployContract, assetAddress: string, print: boolean = true): Promise<any> {
  if (!oraclePyth?.address || !assetAddress) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  print && console.log();
  print && console.log("Query oracle.address PythFeederConfig enter");

  const oraclePythQueryClient: OraclePythQueryClient = new OraclePythQueryClient(walletData.signingCosmWasmClient, oraclePyth.address);
  const queryRes = await oraclePythQueryClient.queryPythFeederConfig({ asset: assetAddress });

  // const configRes = await queryWasmContractByWalletData(walletData, oraclePyth.address, { query_pyth_feeder_config: { asset_address: assetAddress } });
  print && console.log(`Query oracle.PythFeederConfig: \n${JSON.stringify(queryRes)}`);
  return queryRes;
}

export async function doOracleRegisterFeeder(walletData: WalletData, nativeDenom: string, oracle: DeployContract, btoken: DeployContract): Promise<void> {
  if (!oracle?.address || !btoken?.address) {
    return;
  }

  let initFlag = true;
  let feederRes = undefined;
  try {
    feederRes = await queryWasmContractByWalletData(walletData, oracle.address, { feeder: { asset: btoken.address } });
  } catch (error: any) {
    if (error?.toString().includes("No feeder data for the specified asset exist")) {
      initFlag = false;
      console.log();
      console.error(`No feeder data for the specified asset exist`);
    } else {
      throw new Error(error);
    }
  }
  // const feederRes = await queryWasmContractByWalletData(walletData, oracle.address, { feeder: { asset: btoken.address } });
  const doneFlag: boolean = initFlag && walletData.address === feederRes?.feeder && btoken.address === feederRes?.asset;
  if (!doneFlag) {
    console.log();
    console.warn("Do oracle's register_feeder enter. collateral " + btoken.address);
    const doRes = await executeContractByWalletData(walletData, oracle.address, {
      register_feeder: {
        asset: btoken.address,
        feeder: walletData.address
      }
    });
    console.log("Do oracle's register_feeder ok. \n", btoken.address, doRes?.transactionHash);
  }
}

export async function doOracleFeedPrice(walletData: WalletData, nativeDenom: string, oracle: DeployContract, btoken: DeployContract, price: string): Promise<void> {
  if (!oracle?.address || !btoken?.address || !price) {
    return;
  }
  let doFlag = false;
  if (!doFlag) {
    console.log();
    console.warn(`Do oracle's feed_price enter. collateral ${btoken.address} ${price}`);
    const doRes = await executeContractByWalletData(walletData, oracle.address, {
      feed_price: {
        prices: [[btoken.address, price]]
      }
    });
    console.log("Do oracle's feed_price ok. \n", btoken.address, doRes?.transactionHash);
  }
}

export async function printDeployedMarketContracts(networkMarket: MarketDeployContracts): Promise<any> {
  console.log();
  console.log(`--- --- deployed market contracts info --- ---`);
  const tableData = [
    { name: `aToken`, deploy: chainConfigs?.aToken?.deploy, codeId: networkMarket?.aToken?.codeId, address: networkMarket?.aToken?.address },
    { name: `market`, deploy: chainConfigs?.market?.deploy, codeId: networkMarket?.market?.codeId, address: networkMarket?.market?.address },
    { name: `interestModel`, deploy: chainConfigs?.interestModel?.deploy, codeId: networkMarket?.interestModel?.codeId, address: networkMarket?.interestModel?.address },
    { name: `distributionModel`, deploy: chainConfigs?.distributionModel?.deploy, codeId: networkMarket?.distributionModel?.codeId, address: networkMarket?.distributionModel?.address },
    // { name: `oracle`, deploy: chainConfigs?.oracle?.deploy, codeId: networkMarket?.oracle?.codeId, address: networkMarket?.oracle?.address },
    { name: `overseer`, deploy: chainConfigs?.overseer?.deploy, codeId: networkMarket?.overseer?.codeId, address: networkMarket?.overseer?.address },
    { name: `liquidationQueue`, deploy: chainConfigs?.liquidationQueue?.deploy, codeId: networkMarket?.liquidationQueue?.codeId, address: networkMarket?.liquidationQueue?.address },
    { name: `custodyBSei`, deploy: chainConfigs?.custodyBSei?.deploy, codeId: networkMarket?.custodyBSei?.codeId, address: networkMarket?.custodyBSei?.address },
    { name: `oraclePyth`, deploy: chainConfigs?.oraclePyth?.deploy, codeId: networkMarket?.oraclePyth?.codeId, address: networkMarket?.oraclePyth?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
