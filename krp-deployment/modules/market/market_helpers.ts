import { deployContract, executeContractByWalletData, instantiateContract2ByWalletData, queryContractConfig, queryWasmContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "@/common";
import type { BAssetInfo } from "@/contracts/market/CustodyBase.types";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type { ContractsDeployed, CustodyBAssetsContractConfig, DistributionModelContractConfig, InterestModelContractConfig, LiquidationQueueContractConfig, MarketContractsConfig, MarketContractsDeployed, OverseerContractConfig } from "@/modules";
import { ContractsDeployedModules, stakingConfigs, writeDeployedContracts } from "@/modules";
import type { ContractDeployed, WalletData } from "@/types";
import { MARKET_ARTIFACTS_PATH, MARKET_MODULE_NAME } from "./market_constants";

export const marketConfigs: MarketContractsConfig = readArtifact(`${MARKET_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${MARKET_MODULE_NAME}/`);

export function getMarketDeployFileName(chainId: string): string {
  return `deployed_${MARKET_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function marketReadArtifact(chainId: string): MarketContractsDeployed {
  return readArtifact(getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH) as MarketContractsDeployed;
}

export function marketWriteArtifact(marketNetwork: MarketContractsDeployed, chainId: string): void {
  writeArtifact(marketNetwork, getMarketDeployFileName(chainId), MARKET_ARTIFACTS_PATH);
}

export async function deployMarket(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { cdpNetwork } = network;
  const { stable_coin_denom } = cdpNetwork;
  let marketNetwork = network?.[ContractsDeployedModules.market];
  if (!stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployMarket / ${stable_coin_denom}`);
    return;
  }
  if (!marketNetwork) {
    marketNetwork = {};
    network.marketNetwork = marketNetwork;
  }

  if (!marketNetwork?.aToken?.address || !marketNetwork?.market?.address) {
    if (!marketNetwork?.aToken) {
      marketNetwork.aToken = {};
    }
    if (!marketNetwork?.market) {
      marketNetwork.market = {};
    }

    if (marketNetwork?.aToken?.codeId <= 0 || !marketNetwork?.aToken?.codeId) {
      const filePath = marketConfigs?.aToken?.filePath || "../cw-plus/artifacts/cw20_base.wasm";
      marketNetwork.aToken.codeId = await storeCodeByWalletData(walletData, filePath);
      writeDeployedContracts(network, walletData.chainId);
    }
    if (!marketNetwork?.market?.codeId || marketNetwork?.market?.codeId <= 0) {
      const filePath = marketConfigs?.market?.filePath || "../krp-market-contracts/artifacts/moneymarket_market.wasm";
      marketNetwork.market.codeId = await storeCodeByWalletData(walletData, filePath);
      writeDeployedContracts(network, walletData.chainId);
    }
    if (marketNetwork?.market?.codeId > 0 && marketNetwork?.aToken?.codeId > 0) {
      const admin = marketConfigs?.market?.admin || walletData?.activeWallet?.address;
      const label = marketConfigs?.market?.label;
      const initMsg = Object.assign(
        {
          atoken_code_id: marketNetwork.aToken.codeId,
          stable_denom: stable_coin_denom,
          stable_name: "USDT"
        },
        marketConfigs?.market?.initMsg,
        {
          owner_addr: marketConfigs?.market?.initMsg?.owner_addr || walletData?.activeWallet?.address
        }
      );
      const initCoins = marketConfigs?.market?.initCoins?.map(q => Object.assign({}, q, { denom: q?.denom || stable_coin_denom }));
      const [contract1, contract2] = await instantiateContract2ByWalletData(walletData, admin, marketNetwork.market.codeId, initMsg, label, initCoins);
      marketNetwork.market.address = contract1;
      marketNetwork.aToken.address = contract2;
      marketNetwork.market_stable_denom = stable_coin_denom;
      writeDeployedContracts(network, walletData.chainId);
      marketConfigs.aToken.deploy = true;
      marketConfigs.market.deploy = true;
    }
    console.log(`  aToken: `, JSON.stringify(marketNetwork?.aToken));
    console.log(`  market: `, JSON.stringify(marketNetwork?.market));
  }
}

export async function deployMarketInterestModel(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<MarketContractsDeployed> = "interestModel";
  const config: InterestModelContractConfig | undefined = marketConfigs?.[contractName];

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.market}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployMarketDistributionModel(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<MarketContractsDeployed> = "distributionModel";
  const config: DistributionModelContractConfig | undefined = marketConfigs?.[contractName];

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.market}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployMarketOverseer(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { marketNetwork, oracleNetwork, cdpNetwork } = network;
  const { market, liquidationQueue } = marketNetwork;
  const { oraclePyth } = oracleNetwork;
  const { stable_coin_denom } = cdpNetwork;
  if (!market?.address || !oraclePyth?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployMarketOverseer / ${market?.address} / ${oraclePyth?.address} / ${stable_coin_denom}`);
    return;
  }

  const contractName: keyof Required<MarketContractsDeployed> = "overseer";
  const config: OverseerContractConfig | undefined = marketConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      market_contract: market?.address,
      oracle_contract: oraclePyth?.address,
      liquidation_contract: liquidationQueue?.address || walletData?.activeWallet?.address,
      stable_denom: stable_coin_denom
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData?.activeWallet?.address,
      collector_contract: config?.initMsg?.collector_contract || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.market}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployMarketLiquidationQueue(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { marketNetwork, oracleNetwork, cdpNetwork } = network;
  const { overseer } = marketNetwork;
  const { oraclePyth } = oracleNetwork;
  const { stable_coin_denom } = cdpNetwork;
  if (!oraclePyth?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployMarketLiquidationQueue / ${oraclePyth?.address} / ${stable_coin_denom}`);
    return;
  }

  const contractName: keyof Required<MarketContractsDeployed> = "liquidationQueue";
  const config: LiquidationQueueContractConfig | undefined = marketConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      oracle_contract: oraclePyth?.address,
      overseer: overseer?.address || walletData?.activeWallet?.address,
      stable_denom: stable_coin_denom
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.market}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployMarketCustodyBAssets(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { marketNetwork, oracleNetwork, cdpNetwork, stakingNetwork, swapExtensionNetwork } = network;
  const { market, liquidationQueue, overseer } = marketNetwork;
  const { reward, bAssetsToken } = stakingNetwork;
  const { oraclePyth } = oracleNetwork;
  const { swapSparrow } = swapExtensionNetwork;
  const { stable_coin_denom } = cdpNetwork;
  if (!market?.address || !liquidationQueue?.address || !overseer?.address || !reward?.address || !bAssetsToken?.address || !swapSparrow?.address || !oraclePyth?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployMarketCustodyBAssets / ${market?.address} / ${liquidationQueue?.address} / ${overseer?.address} / ${reward?.address} / ${bAssetsToken?.address} / ${swapSparrow?.address} / ${oraclePyth?.address} / ${stable_coin_denom}`);
    return;
  }

  const contractName: keyof Required<MarketContractsDeployed> = "custodyBAssets";
  const config: CustodyBAssetsContractConfig | undefined = marketConfigs?.[contractName];
  const basset_info: BAssetInfo = {
    name: stakingConfigs?.bAssetsToken?.initMsg?.name || config?.initMsg?.basset_info?.name,
    symbol: stakingConfigs?.bAssetsToken?.initMsg?.symbol || config?.initMsg?.basset_info?.symbol,
    decimals: stakingConfigs?.bAssetsToken?.initMsg?.decimals || config?.initMsg?.basset_info?.decimals
  };
  const defaultInitMsg: object | undefined = Object.assign(
    {
      collateral_token: bAssetsToken?.address,
      liquidation_contract: liquidationQueue?.address,
      market_contract: market?.address,
      overseer_contract: overseer?.address,
      reward_contract: reward?.address,
      stable_denom: stable_coin_denom,
      swap_contract: swapSparrow?.address,
      swap_denoms: [walletData?.nativeCurrency?.coinMinimalDenom],
      oracle_contract: oraclePyth?.address
    },
    config?.initMsg ?? {},
    {
      basset_info: basset_info || config?.initMsg?.basset_info,
      owner: config?.initMsg?.owner || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.market}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doMarketConfig(walletData: WalletData, marketNetwork: MarketContractsDeployed, marketInitFlag: boolean, marketConfigRes: any, bAssetsToken: ContractDeployed, rewardsDispatcher: ContractDeployed, oraclePyth: ContractDeployed): Promise<void> {
  console.warn(`\n  Do ${MARKET_MODULE_NAME}.market update_config enter.`);
  const market: ContractDeployed | undefined = marketNetwork?.market;
  const interestModel: ContractDeployed | undefined = marketNetwork?.interestModel;
  const distributionModel: ContractDeployed | undefined = marketNetwork?.distributionModel;
  const overseer: ContractDeployed | undefined = marketNetwork?.overseer;
  if (!market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !bAssetsToken?.address || !rewardsDispatcher?.address || !oraclePyth?.address) {
    console.error(`\n  ********* missing info`);
    return;
  }
  const liquidationQueueAddress = marketNetwork?.liquidationQueue?.address;
  const marketConfigFlag: boolean =
    marketInitFlag &&
    overseer.address === marketConfigRes?.overseer_contract &&
    interestModel.address === marketConfigRes?.interest_model &&
    distributionModel.address === marketConfigRes?.distribution_model &&
    bAssetsToken.address === marketConfigRes?.collector_contract &&
    rewardsDispatcher.address === marketConfigRes?.distributor_contract;
  if (!marketConfigFlag) {
    const marketRegisterContractsRes = await executeContractByWalletData(walletData, market.address, {
      register_contracts: {
        interest_model: interestModel.address,
        distribution_model: distributionModel.address,
        overseer_contract: overseer.address,
        collector_contract: bAssetsToken.address,
        distributor_contract: rewardsDispatcher.address,
        oracle_contract: oraclePyth?.address,
        liquidation_contract: liquidationQueueAddress
      }
    });
    console.log(`  Do ${MARKET_MODULE_NAME}.market update_config ok. \n  ${marketRegisterContractsRes?.transactionHash}`);
    await queryContractConfig(walletData, market, true);
  }
}

export async function doOverseerConfig(walletData: WalletData, overseerConfigRes: any, overseer: ContractDeployed, liquidationQueue: ContractDeployed): Promise<void> {
  console.warn(`\n  Do ${MARKET_MODULE_NAME}.overseer config enter`);
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
    console.log(`  Do ${MARKET_MODULE_NAME}.overseer config ok. \n  ${overseerUpdateConfigRes?.transactionHash}`);
    await queryContractConfig(walletData, overseer);
  }
}

export async function doCustodyBAssetsConfig(walletData: WalletData, custodyBAssetsConfigRes: any, custodyBAssets: ContractDeployed, liquidationQueue: ContractDeployed): Promise<void> {
  console.warn(`\n  Do ${MARKET_MODULE_NAME}.custodyBAssets config enter.`, custodyBAssetsConfigRes, liquidationQueue?.address);
  if (!custodyBAssets?.address || !liquidationQueue?.address) {
    console.error(`\n  ********* missing info`);
    return;
  }

  // {"owner":"","collateral_token":"","overseer_contract":"","market_contract":"","reward_contract":"","liquidation_contract":"","stable_denom":"","basset_info":{"name":"","symbol":"","decimals":6}}
  const custodyBAssetsConfigFlag: boolean = liquidationQueue.address === custodyBAssetsConfigRes?.liquidation_contract;
  if (!custodyBAssetsConfigFlag) {
    let custodyBAssetsUpdateConfigRes = await executeContractByWalletData(walletData, custodyBAssets.address, {
      update_config: {
        // owner: marketConfigs?.custodyBAssets?.initMsg?.owner || walletData?.activeWallet?.address,
        liquidation_contract: liquidationQueue.address
      }
    });
    console.log(`  Do ${MARKET_MODULE_NAME}.custodyBAssets config ok. \n  ${custodyBAssetsUpdateConfigRes?.transactionHash}`);
    await queryContractConfig(walletData, custodyBAssets);
  }
}

export async function doLiquidationQueueConfig(walletData: WalletData, liquidationQueueConfigRes: any, liquidationQueue: ContractDeployed, oraclePyth: ContractDeployed, overseer: ContractDeployed): Promise<void> {
  console.warn(`\n  Do ${MARKET_MODULE_NAME}.liquidationQueue config enter`);
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
        // owner: marketConfigs?.liquidationQueue?.initMsg?.owner || walletData?.activeWallet?.address,
        // safe_ratio: "0.8",
        // bid_fee: "0.01",
        // liquidator_fee: "0.01",
        // liquidation_threshold: "500",
        // price_timeframe: 86400,
        // waiting_period: 600,
      }
    });
    console.log(`Do ${MARKET_MODULE_NAME}.liquidationQueue config ok. \n  ${liquidationQueueUpdateConfigRes?.transactionHash}`);
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
  console.warn(`\n  Do ${MARKET_MODULE_NAME}.overseer add whitelist enter. collateral_token: ${collateral} / custody: ${custody?.address}}`);
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
        name: updateMsg?.name || "Bonded SEI",
        symbol: updateMsg?.symbol || "bSEI",
        max_ltv: updateMsg?.max_ltv || "0"
      }
    });
    console.log(`  Do ${MARKET_MODULE_NAME}.overseer add whitelist ok. \n  ${doRes?.transactionHash}`);
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
  console.warn(`\n  Do ${MARKET_MODULE_NAME}.liquidationQueue whitelist_collateral enter. collateral: ${collateral}`);
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
    console.log(`  Do ${MARKET_MODULE_NAME}.liquidationQueue whitelist_collateral ok. \n  ${doRes?.transactionHash}`);
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
  print && console.log(`\n  Query ${MARKET_MODULE_NAME}.overseer whitelist enter`);
  const overseerWhitelistRes = await queryWasmContractByWalletData(walletData, overseer.address, { whitelist: {} });
  print && console.log(`  ${MARKET_MODULE_NAME}.overseer whitelist: \n  ${JSON.stringify(overseerWhitelistRes)}`);
  return overseerWhitelistRes;
}

export async function printDeployedMarketContracts(marketNetwork: MarketContractsDeployed): Promise<any> {
  console.log(`\n  --- --- deployed contracts info: ${MARKET_MODULE_NAME} --- ---`);
  const tableData = [
    { name: `aToken`, deploy: marketConfigs?.aToken?.deploy, codeId: marketNetwork?.aToken?.codeId, address: marketNetwork?.aToken?.address },
    { name: `market`, deploy: marketConfigs?.market?.deploy, codeId: marketNetwork?.market?.codeId, address: marketNetwork?.market?.address },
    { name: `interestModel`, deploy: marketConfigs?.interestModel?.deploy, codeId: marketNetwork?.interestModel?.codeId, address: marketNetwork?.interestModel?.address },
    { name: `distributionModel`, deploy: marketConfigs?.distributionModel?.deploy, codeId: marketNetwork?.distributionModel?.codeId, address: marketNetwork?.distributionModel?.address },
    { name: `overseer`, deploy: marketConfigs?.overseer?.deploy, codeId: marketNetwork?.overseer?.codeId, address: marketNetwork?.overseer?.address },
    { name: `liquidationQueue`, deploy: marketConfigs?.liquidationQueue?.deploy, codeId: marketNetwork?.liquidationQueue?.codeId, address: marketNetwork?.liquidationQueue?.address },
    { name: `custodyBAssets`, deploy: marketConfigs?.custodyBAssets?.deploy, codeId: marketNetwork?.custodyBAssets?.codeId, address: marketNetwork?.custodyBAssets?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
