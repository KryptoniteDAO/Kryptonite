import type { ContractDeployed, WalletData } from "@/types";
import type { CustodyBSeiContractConfig, DistributionModelContractConfig, InterestModelContractConfig, LiquidationQueueContractConfig, MarketContractsConfig, MarketContractsDeployed, OverseerContractConfig } from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, executeContractByWalletData, instantiateContract2ByWalletData, queryContractConfig, queryWasmContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "@/common";

export const MARKET_ARTIFACTS_PATH = "../krp-market-contracts/artifacts";
export const MARKET_CONTRACTS_PATH = "../krp-market-contracts/contracts";
export const MARKET_MODULE_NAME = "market";
export const marketConfigs: MarketContractsConfig = readArtifact(`${MARKET_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${MARKET_MODULE_NAME}/`);

export function getMarketDeployFileName(chainId: string): string {
  return `deployed_${MARKET_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function marketReadArtifact(chainId: string): MarketContractsDeployed {
  return readArtifact(getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH) as MarketContractsDeployed;
}

export function marketWriteArtifact(networkMarket: MarketContractsDeployed, chainId: string): void {
  writeArtifact(networkMarket, getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH);
}

/**
 * aToken
 * market
 * interestModel
 * distributionModel
 * oracle
 * overseer
 * liquidationQueue
 * custodyBSei
 * oraclePyth
 */
export async function loadingMarketData(networkMarket: MarketContractsDeployed | undefined) {
  const aToken: ContractDeployed = {
    codeId: networkMarket?.aToken?.codeId || 0,
    address: networkMarket?.aToken?.address
  };
  const market: ContractDeployed = {
    codeId: networkMarket?.market?.codeId || 0,
    address: networkMarket?.market?.address
  };
  const interestModel: ContractDeployed = {
    codeId: networkMarket?.interestModel?.codeId || 0,
    address: networkMarket?.interestModel?.address
  };
  const distributionModel: ContractDeployed = {
    codeId: networkMarket?.distributionModel?.codeId || 0,
    address: networkMarket?.distributionModel?.address
  };
  // const oracle: ContractDeployed = {
  //   codeId: networkMarket?.oracle?.codeId || 0,
  //   address: networkMarket?.oracle?.address
  // };
  const overseer: ContractDeployed = {
    codeId: networkMarket?.overseer?.codeId || 0,
    address: networkMarket?.overseer?.address
  };
  const liquidationQueue: ContractDeployed = {
    codeId: networkMarket?.liquidationQueue?.codeId || 0,
    address: networkMarket?.liquidationQueue?.address
  };
  const custodyBSei: ContractDeployed = {
    codeId: networkMarket?.custodyBSei?.codeId || 0,
    address: networkMarket?.custodyBSei?.address
  };
  // const oraclePyth: ContractDeployed = {
  //   codeId: networkMarket?.oraclePyth?.codeId || 0,
  //   address: networkMarket?.oraclePyth?.address
  // };

  return {
    aToken,
    market,
    interestModel,
    distributionModel,
    // oracle,
    overseer,
    liquidationQueue,
    custodyBSei
    // oraclePyth
  };
}

export async function deployMarket(walletData: WalletData, networkMarket: MarketContractsDeployed): Promise<void> {
  if (!networkMarket?.aToken?.address || !networkMarket?.market?.address) {
    if (!networkMarket?.aToken) {
      networkMarket.aToken = {};
    }
    if (!networkMarket?.market) {
      networkMarket.market = {};
    }

    if (networkMarket?.aToken?.codeId <= 0 || !networkMarket?.aToken?.codeId) {
      const filePath = marketConfigs?.aToken?.filePath || "../cw-plus/artifacts/cw20_base.wasm";
      networkMarket.aToken.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(networkMarket, walletData.chainId);
    }
    if (!networkMarket?.market?.codeId || networkMarket?.market?.codeId <= 0) {
      const filePath = marketConfigs?.market?.filePath || "../krp-market-contracts/artifacts/moneymarket_market.wasm";
      networkMarket.market.codeId = await storeCodeByWalletData(walletData, filePath);
      marketWriteArtifact(networkMarket, walletData.chainId);
    }
    if (networkMarket?.market?.codeId > 0 && networkMarket?.aToken?.codeId > 0) {
      const admin = marketConfigs?.market?.admin || walletData.address;
      const label = marketConfigs?.market?.label;
      const initMsg = Object.assign(
        {
          atoken_code_id: networkMarket.aToken.codeId,
          stable_denom: walletData.stable_coin_denom,
          stable_name: "USDT"
        },
        marketConfigs?.market?.initMsg,
        {
          owner_addr: marketConfigs?.market?.initMsg?.owner_addr || walletData.address
        }
      );
      const initCoins = marketConfigs?.market?.initCoins?.map(q => Object.assign({}, q, { denom: q?.denom || walletData.stable_coin_denom }));
      const [contract1, contract2] = await instantiateContract2ByWalletData(walletData, admin, networkMarket.market.codeId, initMsg, label, initCoins);
      networkMarket.aToken.address = contract2;
      networkMarket.market.address = contract1;
      networkMarket.market_stable_denom = walletData.stable_coin_denom;
      marketWriteArtifact(networkMarket, walletData.chainId);
      marketConfigs.aToken.deploy = true;
      marketConfigs.market.deploy = true;
    }
    console.log(`  aToken: `, JSON.stringify(networkMarket?.aToken));
    console.log(`  market: `, JSON.stringify(networkMarket?.market));
  }
}

export async function deployInterestModel(walletData: WalletData, networkMarket: MarketContractsDeployed): Promise<void> {
  const contractName: keyof Required<MarketContractsDeployed> = "interestModel";
  const config: InterestModelContractConfig | undefined = marketConfigs?.[contractName];

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData.address
  });
  const writeFunc = marketWriteArtifact;

  await deployContract(walletData, contractName, networkMarket, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployDistributionModel(walletData: WalletData, networkMarket: MarketContractsDeployed): Promise<void> {
  const contractName: keyof Required<MarketContractsDeployed> = "distributionModel";
  const config: DistributionModelContractConfig | undefined = marketConfigs?.[contractName];

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData.address
  });
  const writeFunc = marketWriteArtifact;

  await deployContract(walletData, contractName, networkMarket, undefined, config, { defaultInitMsg, writeFunc });
}

// export async function deployOracle(walletData: WalletData, networkMarket: MarketContractsDeployed): Promise<void> {
//   const contractName: keyof Required<MarketContractsDeployed> = "oracle";
//   const config: OracleContractConfig | undefined = marketConfigs?.[contractName];
//
//   const defaultInitMsg: object | undefined = Object.assign({ base_asset: walletData.stable_coin_denom }, config?.initMsg ?? {}, {
//     owner: config?.initMsg?.owner || walletData.address
//   });
//   const writeFunc = marketWriteArtifact;
//
//   await deployContract(walletData, contractName, networkMarket, undefined, config, { defaultInitMsg, writeFunc });
// }

export async function deployOverseer(walletData: WalletData, networkMarket: MarketContractsDeployed, oraclePyth: ContractDeployed): Promise<void> {
  const market: ContractDeployed | undefined = networkMarket?.market;
  const liquidationQueue: ContractDeployed | undefined = networkMarket?.liquidationQueue;
  if (!market?.address || !oraclePyth?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<MarketContractsDeployed> = "overseer";
  const config: OverseerContractConfig | undefined = marketConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      market_contract: market?.address,
      oracle_contract: oraclePyth?.address,
      liquidation_contract: liquidationQueue?.address || walletData.address,
      stable_denom: walletData.stable_coin_denom
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const writeFunc = marketWriteArtifact;

  await deployContract(walletData, contractName, networkMarket, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployLiquidationQueue(walletData: WalletData, networkMarket: MarketContractsDeployed, oraclePyth: ContractDeployed): Promise<void> {
  const overseer: ContractDeployed | undefined = networkMarket?.overseer;
  if (!oraclePyth?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }
  const contractName: keyof Required<MarketContractsDeployed> = "liquidationQueue";
  const config: LiquidationQueueContractConfig | undefined = marketConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      oracle_contract: oraclePyth?.address,
      overseer: overseer?.address || walletData.address,
      stable_denom: walletData.stable_coin_denom
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData.address
    }
  );
  const writeFunc = marketWriteArtifact;

  await deployContract(walletData, contractName, networkMarket, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployCustodyBSei(walletData: WalletData, networkMarket: MarketContractsDeployed, oraclePyth: ContractDeployed, reward: ContractDeployed, bSeiToken: ContractDeployed, swapSparrow: ContractDeployed): Promise<void> {
  const market: ContractDeployed | undefined = networkMarket?.market;
  // const oraclePyth: ContractDeployed | undefined = networkMarket?.oraclePyth;
  const overseer: ContractDeployed | undefined = networkMarket?.overseer;
  const liquidationQueue: ContractDeployed | undefined = networkMarket?.liquidationQueue;
  if (!market?.address || !oraclePyth?.address || !liquidationQueue?.address || !overseer?.address || !liquidationQueue?.address || !reward?.address || !bSeiToken?.address || !swapSparrow?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }
  const contractName: keyof Required<MarketContractsDeployed> = "custodyBSei";
  const config: CustodyBSeiContractConfig | undefined = marketConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      collateral_token: bSeiToken?.address,
      liquidation_contract: liquidationQueue?.address,
      market_contract: market?.address,
      overseer_contract: overseer?.address,
      reward_contract: reward?.address,
      stable_denom: walletData.stable_coin_denom,
      swap_contract: swapSparrow?.address,
      swap_denoms: [walletData.nativeCurrency.coinMinimalDenom],
      oracle_contract: oraclePyth?.address
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData.address
    }
  );
  const writeFunc = marketWriteArtifact;

  await deployContract(walletData, contractName, networkMarket, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doMarketConfig(walletData: WalletData, networkMarket: MarketContractsDeployed, marketInitFlag: boolean, marketConfigRes: any, bSeiToken: ContractDeployed, rewardsDispatcher: ContractDeployed, oraclePyth: ContractDeployed): Promise<void> {
  console.warn(`\n  Do market.market update_config enter.`);
  const market: ContractDeployed | undefined = networkMarket?.market;
  const interestModel: ContractDeployed | undefined = networkMarket?.interestModel;
  const distributionModel: ContractDeployed | undefined = networkMarket?.distributionModel;
  const overseer: ContractDeployed | undefined = networkMarket?.overseer;
  if (!market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !oraclePyth?.address) {
    console.error(`\n  ********* missing info`);
    return;
  }
  const liquidationQueueAddress = networkMarket?.liquidationQueue?.address;
  const marketConfigFlag: boolean =
    marketInitFlag &&
    overseer.address === marketConfigRes?.overseer_contract &&
    interestModel.address === marketConfigRes?.interest_model &&
    distributionModel.address === marketConfigRes?.distribution_model &&
    bSeiToken.address === marketConfigRes?.collector_contract &&
    rewardsDispatcher.address === marketConfigRes?.distributor_contract;
  if (!marketConfigFlag) {
    const marketRegisterContractsRes = await executeContractByWalletData(walletData, market.address, {
      register_contracts: {
        interest_model: interestModel.address,
        distribution_model: distributionModel.address,
        overseer_contract: overseer.address,
        collector_contract: bSeiToken.address,
        distributor_contract: rewardsDispatcher.address,
        oracle_contract: oraclePyth?.address,
        liquidation_contract: liquidationQueueAddress
      }
    });
    console.log(`  Do market.market update_config ok. \n  ${marketRegisterContractsRes?.transactionHash}`);
    await queryContractConfig(walletData, market, true);
  }
}

export async function doOverseerConfig(walletData: WalletData, overseerConfigRes: any, overseer: ContractDeployed, liquidationQueue: ContractDeployed): Promise<void> {
  console.warn(`\n  Do market.overseer config enter`);
  if (!overseer?.address || !liquidationQueue?.address) {
    console.error(`\n  ********* missing info`);
    return;
  }
  // {"owner_addr":"","oracle_contract":"","market_contract":"","liquidation_contract":"","collector_contract":"","threshold_deposit_rate":"","target_deposit_rate":"","buffer_distribution_factor":"","anc_purchase_factor":"","stable_denom":"","epoch_period":0,"price_timeframe":0,"dyn_rate_epoch":0,"dyn_rate_maxchange":"","dyn_rate_yr_increase_expectation":"","dyn_rate_min":"","dyn_rate_max":""}
  const overseerConfigFlag: boolean = liquidationQueue.address === overseerConfigRes?.liquidation_contract;
  if (!overseerConfigFlag) {
    const overseerUpdateConfigRes = await executeContractByWalletData(walletData, overseer.address, {
      update_config: {
        liquidation_contract: liquidationQueue.address
        // epoch_period: marketConfigs?.overseer?.initMsg.epoch_period,
      }
    });
    console.log(`  Do market.overseer config ok. \n  ${overseerUpdateConfigRes?.transactionHash}`);
    await queryContractConfig(walletData, overseer);
  }
}

export async function doCustodyBSeiConfig(walletData: WalletData, custodyBSeiConfigRes: any, custodyBSei: ContractDeployed, liquidationQueue: ContractDeployed): Promise<void> {
  console.warn(`\n  Do market.custodyBSei config enter.`, custodyBSeiConfigRes, liquidationQueue?.address);
  if (!custodyBSei?.address || !liquidationQueue?.address) {
    console.error(`\n  ********* missing info`);
    return;
  }

  // {"owner":"","collateral_token":"","overseer_contract":"","market_contract":"","reward_contract":"","liquidation_contract":"","stable_denom":"","basset_info":{"name":"","symbol":"","decimals":6}}
  const custodyBSeiConfigFlag: boolean = liquidationQueue.address === custodyBSeiConfigRes?.liquidation_contract;
  if (!custodyBSeiConfigFlag) {
    let custodyBSeiUpdateConfigRes = await executeContractByWalletData(walletData, custodyBSei.address, {
      update_config: {
        // owner: marketConfigs?.custodyBSei?.initMsg?.owner || walletData.address,
        liquidation_contract: liquidationQueue.address
      }
    });
    console.log(`  Do market.custodyBSei config ok. \n  ${custodyBSeiUpdateConfigRes?.transactionHash}`);
    await queryContractConfig(walletData, custodyBSei);
  }
}

export async function doLiquidationQueueConfig(walletData: WalletData, liquidationQueueConfigRes: any, liquidationQueue: ContractDeployed, oraclePyth: ContractDeployed, overseer: ContractDeployed): Promise<void> {
  console.warn(`\n  Do market.liquidationQueue config enter`);
  if (!liquidationQueue?.address || !oraclePyth?.address || !overseer?.address) {
    console.error(`\n  ********* missing info`);
    return;
  }
  // {"owner":"","oracle_contract":"","stable_denom":"","safe_ratio":"","bid_fee":"","liquidator_fee":"","liquidation_threshold":"","price_timeframe": “”,"waiting_period":“”,"overseer":""}
  const liquidationQueueConfigFlag: boolean = oraclePyth.address === liquidationQueueConfigRes?.oracle_contract && overseer.address === liquidationQueueConfigRes?.overseer;
  if (!liquidationQueueConfigFlag) {
    const liquidationQueueUpdateConfigRes = await executeContractByWalletData(walletData, liquidationQueue.address, {
      update_config: {
        oracle_contract: oraclePyth.address,
        overseer: overseer.address
        // owner: marketConfigs?.liquidationQueue?.initMsg?.owner || walletData.address,
        // safe_ratio: "0.8",
        // bid_fee: "0.01",
        // liquidator_fee: "0.01",
        // liquidation_threshold: "500",
        // price_timeframe: 86400,
        // waiting_period: 600,
      }
    });
    console.log(`Do market.liquidationQueue config ok. \n  ${liquidationQueueUpdateConfigRes?.transactionHash}`);
    await queryContractConfig(walletData, liquidationQueue);
  }
}

export async function doOverseerWhitelist(
  walletData: WalletData,
  overseer: ContractDeployed,
  custody: ContractDeployed,
  collateral: string,
  updateMsg?: {
    name: string;
    symbol: string;
    max_ltv: string;
  }
): Promise<void> {
  console.warn(`\n  Do market.overseer add whitelist enter. collateral_token: ${collateral}`);
  if (!overseer?.address || !custody?.address || !collateral) {
    console.error(`\n  ********* missing info`);
    return;
  }
  // {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
  let overseerWhitelistFlag: boolean = false;
  const overseerWhitelistRes: any = await queryOverseerWhitelist(walletData, overseer);
  if (overseerWhitelistRes?.["elems"]) {
    for (const item of overseerWhitelistRes?.["elems"]) {
      if (collateral === item?.["collateral_token"] && custody.address === item?.["custody_contract"]) {
        overseerWhitelistFlag = true;
        break;
      }
    }
  }
  if (!overseerWhitelistFlag) {
    const doRes = await executeContractByWalletData(walletData, overseer.address, {
      whitelist: {
        collateral_token: collateral,
        custody_contract: custody.address,
        name: updateMsg?.name || "Bond Sei",
        symbol: updateMsg?.symbol || "bSEI",
        max_ltv: updateMsg?.max_ltv || "0"
      }
    });
    console.log(`  Do market.overseer add whitelist ok. \n  ${doRes?.transactionHash}`);
    await queryOverseerWhitelist(walletData, overseer);
  }
}

export async function doLiquidationQueueWhitelistCollateral(
  walletData: WalletData,
  liquidationQueue: ContractDeployed,
  collateral: string,
  updateMsg?: {
    bid_threshold: string;
    max_slot: number;
    premium_rate_per_slot: string;
  }
): Promise<void> {
  console.warn(`\n  Do market.liquidationQueue whitelist_collateral enter. collateral: ${collateral}`);
  if (!liquidationQueue?.address || !collateral) {
    console.error(`\n  ********* missing info`);
    return;
  }
  // overseerWhitelistFlag must be true
  let liquidationQueueWhitelistCollateralFlag = true;
  try {
    await queryWasmContractByWalletData(walletData, liquidationQueue.address, { collateral_info: { collateral_token: collateral } });
  } catch (error: any) {
    if (error.toString().includes("Collateral is not whitelisted")) {
      liquidationQueueWhitelistCollateralFlag = false;
    }
  }
  if (!liquidationQueueWhitelistCollateralFlag) {
    const doRes = await executeContractByWalletData(walletData, liquidationQueue.address, {
      whitelist_collateral: {
        collateral_token: collateral,
        bid_threshold: updateMsg?.bid_threshold,
        max_slot: updateMsg?.max_slot,
        premium_rate_per_slot: updateMsg?.premium_rate_per_slot
      }
    });
    console.log(`  Do market.liquidationQueue whitelist_collateral ok. \n  ${doRes?.transactionHash}`);
  }
}

/**
 * {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
 */
export async function queryOverseerWhitelist(walletData: WalletData, overseer: ContractDeployed, print: boolean = true): Promise<any> {
  if (!overseer || !overseer.address) {
    console.error(`\n  ********* missing info`);
    return;
  }
  print && console.log(`\n  Query overseer.address whitelist enter`);
  const overseerWhitelistRes = await queryWasmContractByWalletData(walletData, overseer.address, { whitelist: {} });
  print && console.log(`  overseer.whitelist: \n  ${JSON.stringify(overseerWhitelistRes)}`);
  return overseerWhitelistRes;
}

export async function printDeployedMarketContracts(networkMarket: MarketContractsDeployed): Promise<any> {
  console.log(`\n  --- --- deployed market contracts info --- ---`);
  const tableData = [
    { name: `aToken`, deploy: marketConfigs?.aToken?.deploy, codeId: networkMarket?.aToken?.codeId, address: networkMarket?.aToken?.address },
    { name: `market`, deploy: marketConfigs?.market?.deploy, codeId: networkMarket?.market?.codeId, address: networkMarket?.market?.address },
    { name: `interestModel`, deploy: marketConfigs?.interestModel?.deploy, codeId: networkMarket?.interestModel?.codeId, address: networkMarket?.interestModel?.address },
    { name: `distributionModel`, deploy: marketConfigs?.distributionModel?.deploy, codeId: networkMarket?.distributionModel?.codeId, address: networkMarket?.distributionModel?.address },
    // { name: `oracle`, deploy: marketConfigs?.oracle?.deploy, codeId: networkMarket?.oracle?.codeId, address: networkMarket?.oracle?.address },
    { name: `overseer`, deploy: marketConfigs?.overseer?.deploy, codeId: networkMarket?.overseer?.codeId, address: networkMarket?.overseer?.address },
    { name: `liquidationQueue`, deploy: marketConfigs?.liquidationQueue?.deploy, codeId: networkMarket?.liquidationQueue?.codeId, address: networkMarket?.liquidationQueue?.address },
    { name: `custodyBSei`, deploy: marketConfigs?.custodyBSei?.deploy, codeId: networkMarket?.custodyBSei?.codeId, address: networkMarket?.custodyBSei?.address }
    // { name: `oraclePyth`, deploy: marketConfigs?.oraclePyth?.deploy, codeId: networkMarket?.oraclePyth?.codeId, address: networkMarket?.oraclePyth?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
