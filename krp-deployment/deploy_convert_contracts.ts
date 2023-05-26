import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData, queryContractConfig } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";
import { ConvertPairs } from "./types";

async function main(): Promise<void> {
  console.log(`--- --- deploy convert contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH);
  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);

  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`--- --- deploy convert contracts error, Please deploy staking contracts first --- ---`);
    process.exit(0);
    return;
  }

  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH);
  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBSei } = await loadingMarketData(networkMarket);
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !liquidationQueue?.address || !custodyBSei?.address) {
    console.log(`--- --- deploy convert contracts error, missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  const network = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH);

  console.log();
  console.log(`--- --- convert contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  // config native denom list
  const ConfigConvertNativeDemonList: Record<string, ConvertPairs[]>;

  const nativeDenomList = [
    {
      name: "strideSei",
      address: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/stsei",
      overseerWhitelistConfig: {
        name: "Bond stSei",
        symbol: "BSTSEI",
        max_ltv: "0.65"
      },
      liquidationQueueWhitelistCollateralConfig: {
        bid_threshold: "500000000",
        max_slot: 30,
        premium_rate_per_slot: "0.01"
      }
      // price: "100"
    },
    {
      name: "slsdi",
      address: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/slsdi",
      overseerWhitelistConfig: {
        name: "Bond slsdi",
        symbol: "BSLSDI",
        max_ltv: "0.65"
      },
      liquidationQueueWhitelistCollateralConfig: {
        bid_threshold: "500000000",
        max_slot: 30,
        premium_rate_per_slot: "0.01"
      }
      // price: "200"
    }
  ];

  for (let nativeDenom of nativeDenomList) {
    await deployConverter(walletData, network, nativeDenom.address);
    await deployBtoken(walletData, network, nativeDenom.address);
    await deployCustody(walletData, network, nativeDenom.address, reward, market, overseer, liquidationQueue);
  }

  console.log();
  console.log(`--- --- convert contracts storeCode & instantiateContract end --- ---`);

  await printDeployedContracts(nativeDenomList, network);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- convert contracts configure enter --- ---`);

  for (let nativeDenomItem of nativeDenomList) {
    const nativeDenom = nativeDenomItem?.address;
    const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
    const convertPairsNetwork = network?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
    if (!convertPairsConfig || !convertPairsNetwork) {
      continue;
    }
    // const converterConfig = convertPairsConfig?.converter;
    // const btokenConfig = convertPairsConfig?.btoken;
    // const custodyConfig = convertPairsConfig?.custody;

    const converterNetwork = convertPairsNetwork?.converter;
    const btokenNetwork = convertPairsNetwork?.btoken;
    const custodyNetwork = convertPairsNetwork?.custody;

    await doConverterRegisterTokens(walletData, nativeDenom, converterNetwork, btokenNetwork);
    await doOverseerWhitelist(walletData, nativeDenom, overseer, custodyNetwork, btokenNetwork, nativeDenomItem.overseerWhitelistConfig);
    await doLiquidationQueueWhitelistCollateral(walletData, nativeDenom, liquidationQueue, btokenNetwork, nativeDenomItem.liquidationQueueWhitelistCollateralConfig);
    // await doOracleRegisterFeeder(walletData, nativeDenom, oracle, btokenNetwork);
    // await doOracleFeedPrice(walletData, nativeDenom, oracle, btokenNetwork, nativeDenomItem?.["price"]);
  }

  console.log();
  console.log(`--- --- convert contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy convert contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

async function deployConverter(walletData: WalletData, network: any, nativeDenom: string): Promise<void> {
  const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
  if (!convertPairsConfig) {
    console.error(`unknown configuration of `, nativeDenom);
    return;
  }
  let convertPairsNetwork = network?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  if (!network?.convertPairs) {
    network.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { native_denom: nativeDenom };
    network.convertPairs.push(convertPairsNetwork);
  }
  if (!convertPairsNetwork?.converter?.address) {
    if (!convertPairsNetwork?.converter) {
      convertPairsNetwork.converter = {};
    }

    if (!convertPairsNetwork?.converter?.codeId || convertPairsNetwork?.converter?.codeId <= 0) {
      const filePath = convertPairsConfig?.converter?.filePath || "../krp-basset-convert/artifacts/krp_basset_converter.wasm";
      convertPairsNetwork.converter.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, CONVERT_ARTIFACTS_PATH);
    }
    if (convertPairsNetwork?.converter?.codeId > 0) {
      const admin = convertPairsConfig?.converter?.admin || walletData.address;
      const label = convertPairsConfig?.converter?.label;
      const initMsg = Object.assign({}, convertPairsConfig?.converter?.initMsg, {
        owner: convertPairsConfig?.converter?.initMsg?.owner || walletData.address
      });
      convertPairsNetwork.converter.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.converter.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, CONVERT_ARTIFACTS_PATH);
      convertPairsConfig.converter.deploy = true;
    }
    console.log(convertPairsNetwork?.converter?.codeId, ` converter: `, JSON.stringify(convertPairsNetwork?.converter));
  }
}

async function deployBtoken(walletData: WalletData, network: any, nativeDenom: string): Promise<void> {
  const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
  if (!convertPairsConfig) {
    console.error(`unknown configuration of `, nativeDenom);
    return;
  }
  let convertPairsNetwork = network?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  if (!network?.convertPairs) {
    network.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { native_denom: nativeDenom };
    network.convertPairs.push(convertPairsNetwork);
  }
  const converter = convertPairsNetwork?.converter;
  if (!converter?.address) {
    console.error(`please deploy converter first of `, nativeDenom);
    return;
  }
  if (!convertPairsNetwork?.btoken?.address) {
    if (!convertPairsNetwork?.btoken) {
      convertPairsNetwork.btoken = {};
    }

    if (!convertPairsNetwork?.btoken?.codeId || convertPairsNetwork?.btoken?.codeId <= 0) {
      const filePath = convertPairsConfig?.btoken?.filePath || "../krp-basset-convert/artifacts/krp_basset_token.wasm";
      convertPairsNetwork.btoken.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, CONVERT_ARTIFACTS_PATH);
    }
    if (convertPairsNetwork?.btoken?.codeId > 0) {
      const admin = convertPairsConfig?.btoken?.admin || walletData.address;
      const label = convertPairsConfig?.btoken?.label;
      const initMsg = Object.assign(
        {
          mint: converter.address
        },
        convertPairsConfig?.btoken?.initMsg
      );
      convertPairsNetwork.btoken.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.btoken.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, CONVERT_ARTIFACTS_PATH);
      convertPairsConfig.btoken.deploy = true;
    }
    console.log(convertPairsNetwork?.btoken?.codeId, ` btoken: `, JSON.stringify(convertPairsNetwork?.btoken));
  }
}

async function deployCustody(walletData: WalletData, network: any, nativeDenom: string, reward: DeployContract, market: DeployContract, overseer: DeployContract, liquidationQueue: DeployContract): Promise<void> {
  const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
  if (!convertPairsConfig) {
    console.error(`unknown configuration of `, nativeDenom);
    return;
  }
  if (!reward?.address || !market?.address || !overseer?.address || !liquidationQueue?.address) {
    return;
  }
  let convertPairsNetwork = network?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  if (!network?.convertPairs) {
    network.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { native_denom: nativeDenom };
    network.convertPairs.push(convertPairsNetwork);
  }
  const btoken = convertPairsNetwork?.btoken;
  if (!btoken?.address) {
    console.error(`please deploy btoken first of `, nativeDenom);
    return;
  }
  if (!convertPairsNetwork?.custody?.address) {
    if (!convertPairsNetwork?.custody) {
      convertPairsNetwork.custody = {};
    }

    if (!convertPairsNetwork?.custody?.codeId || convertPairsNetwork?.custody?.codeId <= 0) {
      const filePath = convertPairsConfig?.custody?.filePath || "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm";
      convertPairsNetwork.custody.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, CONVERT_ARTIFACTS_PATH);
    }
    if (convertPairsNetwork?.custody?.codeId > 0) {
      const admin = convertPairsConfig?.custody?.admin || walletData.address;
      const label = convertPairsConfig?.custody?.label;
      const initMsg = Object.assign(
        {
          collateral_token: btoken.address,
          liquidation_contract: liquidationQueue.address,
          market_contract: market.address,
          overseer_contract: overseer.address,
          reward_contract: reward.address,
          stable_denom: walletData.stable_coin_denom
        },
        chainConfigs?.custodyBSei?.initMsg,
        {
          owner: convertPairsConfig?.custody?.initMsg?.owner || walletData.address
        }
      );
      convertPairsNetwork.custody.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.custody.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, CONVERT_ARTIFACTS_PATH);
      convertPairsConfig.custody.deploy = true;
    }
    console.log(convertPairsNetwork?.custody?.codeId, ` custody: `, JSON.stringify(convertPairsNetwork?.custody));
  }
}

async function doConverterRegisterTokens(walletData: WalletData, nativeDenom: string, converter: DeployContract, btoken: DeployContract): Promise<void> {
  if (!converter?.address || !btoken?.address) {
    return;
  }
  //  {owner: '', native_denom: '', basset_token_address: ''}
  const { config } = await queryContractConfig(walletData, converter, false);
  const doneFlag: boolean = nativeDenom === config?.native_denom && btoken.address === config?.basset_token_address;
  if (!doneFlag) {
    console.log();
    console.warn("Do converter's register_contracts enter");
    const marketRegisterContractsRes = await executeContractByWalletData(walletData, converter.address, {
      register_tokens: {
        native_denom: nativeDenom,
        basset_token_address: btoken.address
      }
    });
    console.log("Do converter's register_tokens ok. \n", marketRegisterContractsRes?.transactionHash);
    await queryContractConfig(walletData, converter, true);
  }
}

async function doOverseerWhitelist(walletData: WalletData, nativeDenom: string, overseer: DeployContract, custody: DeployContract, btoken: DeployContract, updateMsg?: object): Promise<void> {
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
    console.log();
    console.warn("Do overseer's add whitelist enter. collateral " + btoken.address);
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

async function doLiquidationQueueWhitelistCollateral(walletData: WalletData, nativeDenom: string, liquidationQueue: DeployContract, btoken: DeployContract, updateMsg?: object): Promise<void> {
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
    console.log();
    console.warn("Do liquidationQueue's whitelist_collateral enter. collateral " + btoken.address);
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

async function doOracleRegisterFeeder(walletData: WalletData, nativeDenom: string, oracle: DeployContract, btoken: DeployContract): Promise<void> {
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

async function doOracleFeedPrice(walletData: WalletData, nativeDenom: string, oracle: DeployContract, btoken: DeployContract, price: string): Promise<void> {
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

/**
 * {"elems":[{"name":"","symbol":"","max_ltv":"","custody_contract":"","collateral_token":""}]}
 */
async function queryOverseerWhitelist(walletData: WalletData, overseer: DeployContract): Promise<any> {
  if (!overseer?.address) {
    return;
  }
  console.log();
  console.log("Query overseer.address whitelist enter");
  const queryRes = await queryWasmContractByWalletData(walletData, overseer.address, { whitelist: {} });
  console.log(`overseer.whitelist: \n${JSON.stringify(queryRes)}`);
  return queryRes;
}

async function printDeployedContracts(nativeDenomList, network: any): Promise<void> {
  console.log();
  console.log(`--- --- deployed convert contracts info --- ---`);

  const tableData = [];
  for (let nativeDenomItem of nativeDenomList) {
    const nativeDenom = nativeDenomItem?.address;
    const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
    const convertPairsNetwork = network?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);

    const converterData = {
      nativeDenom: nativeDenom,
      name: `converter`,
      deploy: convertPairsConfig?.converter?.deploy,
      ...convertPairsNetwork?.converter
    };
    const btokenData = {
      nativeDenom: nativeDenom,
      name: `btoken`,
      deploy: convertPairsConfig?.btoken?.deploy,
      ...convertPairsNetwork?.btoken
    };
    const custodyData = {
      nativeDenom: nativeDenom,
      name: `custody`,
      deploy: convertPairsConfig?.custody?.deploy,
      ...convertPairsNetwork?.custody
    };
    tableData.push(converterData, btokenData, custodyData);
  }
  console.table(tableData, [`nativeDenom`, `name`, `codeId`, `address`, `deploy`]);
}

main().catch(console.log);
