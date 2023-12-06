import {BnComparedTo, BnDiv, BnFormat, BnMul, extractDeployedAddress, queryAddressBalance, readArtifact, sleep, toEncodedBinary, writeArtifact} from "@/common";
import { cdpContracts, cw20BaseContracts, oracleContracts, stakingContracts } from "@/contracts";
import {DEPLOY_CHAIN_ID, DEPLOY_VERSION, loadingWalletData} from "@/env_data";
import type { CdpContractsDeployed, ContractsDeployed, ConvertContractsDeployed, MarketContractsDeployed, OracleContractsDeployed, StakingContractsDeployed, SwapExtensionContractsDeployed, TokenContractsDeployed, TokenStakingPairsContractsDeployed } from "@/modules";
import {
  cdpReadArtifact,
  cdpWriteArtifact, ContractsDeployedModules,
  convertConfigs,
  convertReadArtifact, convertWriteArtifact,
  marketReadArtifact, marketWriteArtifact,
  oracleReadArtifact, oracleWriteArtifact, stakingConfigs,
  stakingReadArtifact, stakingWriteArtifact,
  swapExtensionReadArtifact, swapExtensionWriteArtifact,
  tokenReadArtifact, tokenWriteArtifact
} from "@/modules";
import { CDP_MODULE_NAME } from "@/modules/cdp/cdp_constants";
import { CONVERT_MODULE_NAME } from "@/modules/convert/convert_constants";
import { MARKET_MODULE_NAME } from "@/modules/market/market_constants";
import { ORACLE_MODULE_NAME } from "@/modules/oracle/oracle_constants";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants";
import { SWAP_EXTENSION_MODULE_NAME } from "@/modules/swap-extension/swap-extension_constants";
import { TOKEN_MODULE_NAME } from "@/modules/token/token_constants";
import { ContractDeployed, WalletData } from "@/types";
import * as dotenv from "dotenv";

dotenv.config();

export function getDeployedFileName(deployedChainId?: string, deployedVersion?: string): string {
  return `deployed_${deployedVersion ?? DEPLOY_VERSION}_${deployedChainId ?? DEPLOY_CHAIN_ID}`;
}

export function readDeployedContracts(deployedChainId?: string, deployedVersion?: string): ContractsDeployed {
  return readArtifact(getDeployedFileName(deployedChainId, deployedVersion), "./modules") as unknown as ContractsDeployed;
}

export function writeDeployedContracts(network: ContractsDeployed, deployedChainId?: string, deployedVersion?: string): void {
  writeArtifact(network, getDeployedFileName(deployedChainId, deployedVersion), "./modules");
}

// export async function writeDeployedContractsToDApps({ deployedChainId, deployedVersion, printAble = true, writeAble = true }: { deployedChainId?: string; deployedVersion?: string; printAble?: boolean; writeAble?: boolean }): Promise<void> {
//   const chainId: string = deployedChainId || DEPLOY_CHAIN_ID;
//   const version: string = deployedVersion || DEPLOY_VERSION;
//   printAble && console.log(`\n  writeDeployedContractsForDApps enter. version: ${version} / chainId: ${chainId}`);
//
//   const { swapExtensionNetwork, oracleNetwork, cdpNetwork, stakingNetwork, marketNetwork, convertNetwork, tokenNetwork } = readDeployedContracts(chainId);
//   const stable_coin_denom = cdpNetwork?.stable_coin_denom;
//
//   const walletData: WalletData = await loadingWalletData(false, undefined, false);
//   // const swapExtension = swapExtensionReadArtifact(chainId) as SwapExtensionContractsDeployed;
//   // const oracle = oracleReadArtifact(chainId) as OracleContractsDeployed;
//   // const cdp = cdpReadArtifact(chainId) as CdpContractsDeployed;
//   // const token = tokenReadArtifact(chainId) as TokenContractsDeployed;
//   // const staking = stakingReadArtifact(chainId) as StakingContractsDeployed;
//   // const market = marketReadArtifact(chainId) as MarketContractsDeployed;
//   // const convert = convertReadArtifact(chainId) as ConvertContractsDeployed;
//
//   printAble && console.log();
//   printAble && console.log(`hubContractAddress: "${stakingNetwork?.hub?.address}",`);
//   printAble && console.log(`rewardAddress: "${stakingNetwork?.reward?.address}",`);
//   printAble && console.log(`rewardsDispatcherAddress: "${stakingNetwork?.rewardsDispatcher?.address}",`);
//   printAble && console.log(`validatorsRegistryAddress: "${stakingNetwork?.validatorsRegistry?.address}",`);
//   printAble && console.log(`bAssetsToken: "${stakingNetwork?.bAssetsToken?.address}",`);
//   printAble && console.log(`stAssetsToken: "${stakingNetwork?.stAssetsToken?.address}",`);
//
//   printAble && console.log();
//   printAble && console.log(`marketAddress: "${marketNetwork?.market?.address}",`);
//   // printAble && console.log(`aTokenAddress: "${marketNetwork?.aToken?.address}",`);
//   // printAble && console.log(`aUSTAddress: "${marketNetwork?.aToken?.address}",`);
//   printAble && console.log(`interestModelAddress: "${marketNetwork?.interestModel?.address}",`);
//   printAble && console.log(`distributionModelAddress: "${marketNetwork?.distributionModel?.address}",`);
//   // printAble && console.log(`oracleAddress: "${marketNetwork?.oracle?.address}",`);
//   printAble && console.log(`oracleAddress: "${oracleNetwork?.oraclePyth?.address}",`);
//   printAble && console.log(`liquidationQueueAddress: "${marketNetwork?.liquidationQueue?.address}",`);
//   printAble && console.log(`overseerAddress: "${marketNetwork?.overseer?.address}",`);
//   printAble && console.log(`custodyBAssetsAddress: "${marketNetwork?.custodyBAssets?.address}",`);
//   printAble && console.log();
//
//   const bAssets = [];
//   const earnCoins = [];
//   const nativeCurrencies = [];
//   const tokenCurrencies = [];
//
//   nativeCurrencies.push({
//     coinType: 0,
//     coinDenom: walletData?.nativeCurrency?.coinDenom,
//     coinMinimalDenom: walletData?.nativeCurrency?.coinMinimalDenom,
//     coinDecimals: walletData?.nativeCurrency?.coinDecimals,
//     icon: ""
//   });
//   if (!!stable_coin_denom) {
//     const metadata = cdpConfigs?.stableCoinDenomMetadata;
//     nativeCurrencies.push({
//       coinType: 0,
//       coinDenom: metadata?.symbol ?? metadata?.name ?? stable_coin_denom?.split("/")?.pop() ?? stable_coin_denom,
//       coinMinimalDenom: stable_coin_denom,
//       coinDecimals: cdpConfigs?.stableCoinDenomMetadata?.decimals ?? walletData?.nativeCurrency?.coinDecimals,
//       icon: ""
//     });
//   }
//
//   if (stakingNetwork?.bAssetsToken?.address) {
//     bAssets.push({
//       name: `${walletData?.nativeCurrency?.coinDenom}/${stakingConfigs?.bAssetsToken?.initMsg?.name}`,
//       native: walletData?.nativeCurrency?.coinMinimalDenom,
//       bAssetsToken: stakingNetwork?.bAssetsToken?.address,
//       convertAddress: stakingNetwork?.hub?.address,
//       custodyAddress: marketNetwork?.custodyBAssets?.address,
//       class: ""
//     });
//
//     earnCoins.push({
//       name: marketNetwork?.market_stable_denom?.split("/")?.pop?.() ?? marketNetwork?.market_stable_denom,
//       native: marketNetwork?.market_stable_denom,
//       marketAddress: marketNetwork?.market?.address,
//       atokenAddress: marketNetwork?.aToken?.address
//     });
//
//     tokenCurrencies.push({
//       coinType: 1,
//       coinDenom: stakingConfigs?.bAssetsToken?.initMsg?.name,
//       coinMinimalDenom: stakingNetwork?.bAssetsToken?.address,
//       coinDecimals: stakingConfigs?.bAssetsToken?.initMsg?.decimals,
//       icon: "",
//       custodyAddress: marketNetwork?.custodyBAssets?.address
//     });
//
//     tokenCurrencies.push({
//       coinType: 1,
//       coinDenom: stakingConfigs?.stAssetsToken?.initMsg?.name,
//       coinMinimalDenom: stakingNetwork?.stAssetsToken?.address,
//       coinDecimals: stakingConfigs?.stAssetsToken?.initMsg?.decimals,
//       icon: "",
//       custodyAddress: ""
//     });
//   }
//
//   const convertPairsNetwork = convertNetwork?.convertPairs;
//   if (convertPairsNetwork) {
//     for (let convertPairsItem of convertPairsNetwork) {
//       const converterNetwork = convertPairsItem?.converter;
//       const bAssetsTokenNetwork = convertPairsItem?.bAssetsToken;
//       const custodyNetwork = convertPairsItem?.custody;
//       const native_denom = convertPairsItem?.native_denom;
//
//       const pairConfig = convertConfigs?.convertPairs?.find(value => native_denom === value?.assets?.nativeDenom);
//       const pairsName = pairConfig?.name ?? "";
//       const bassetPairs = {
//         name: pairsName,
//         native: native_denom,
//         bAssetsToken: bAssetsTokenNetwork?.address,
//         convertAddress: converterNetwork?.address,
//         custodyAddress: custodyNetwork?.address,
//         class: ""
//       };
//       bAssets.push(bassetPairs);
//
//       nativeCurrencies.push({
//         coinType: 0,
//         coinDenom: pairConfig?.assets?.nativeName,
//         coinMinimalDenom: pairConfig?.assets?.nativeDenom,
//         coinDecimals: pairConfig?.assets?.nativeDenomDecimals,
//         icon: ""
//       });
//
//       tokenCurrencies.push({
//         coinType: 1,
//         coinDenom: pairsName?.split("/")?.[1],
//         coinMinimalDenom: bAssetsTokenNetwork?.address,
//         coinDecimals: pairConfig?.bAssetsToken?.initMsg?.decimals ?? walletData?.nativeCurrency?.coinDecimals,
//         icon: "",
//         custodyAddress: custodyNetwork?.address
//       });
//     }
//   }
//
//   const earnLps = [];
//   const stakingRewardsPairsNetwork: TokenStakingPairsContractsDeployed[] | undefined = tokenNetwork?.stakingPairs;
//   if (stakingRewardsPairsNetwork) {
//     for (const stakingRewardsPairNetwork of stakingRewardsPairsNetwork) {
//       const earnLpPairs = {
//         name: stakingRewardsPairNetwork?.name,
//         lp_token: stakingRewardsPairNetwork?.staking_token,
//         staking_contract: stakingRewardsPairNetwork?.staking?.address,
//         pair_contract: stakingRewardsPairNetwork?.pool_address,
//         pair_token: undefined
//       };
//       earnLps.push(earnLpPairs);
//     }
//   }
//
//   printAble && console.log(`\n  bAssetsTokens: \n  ${JSON.stringify(bAssets)}`);
//   printAble && console.log(`\n  earnCoins: \n  ${JSON.stringify(earnCoins)}`);
//   printAble && console.log(`\n  earnLps: \n  ${JSON.stringify(earnLps)}`);
//   printAble && console.log(`\n  chainInfo.nativeCurrencies: \n  ${JSON.stringify(nativeCurrencies)}`);
//   printAble && console.log(`\n  chainInfo.tokenCurrencies: \n  ${JSON.stringify(tokenCurrencies)}`);
//   printAble && console.log();
//
//   writeAble &&
//   writeArtifact(
//     {
//       [ContractsDeployedModules.swapExtension]: extractDeployedAddress(swapExtensionNetwork),
//       [ContractsDeployedModules.oracle]: extractDeployedAddress(oracleNetwork),
//       [ContractsDeployedModules.cdp]: extractDeployedAddress(cdpNetwork),
//       [ContractsDeployedModules.staking]: extractDeployedAddress(stakingNetwork),
//       [ContractsDeployedModules.market]: extractDeployedAddress(marketNetwork),
//       [ContractsDeployedModules.convert]: extractDeployedAddress(convertNetwork),
//       [ContractsDeployedModules.token]: extractDeployedAddress(tokenNetwork),
//
//       // [SWAP_EXTENSION_MODULE_NAME]: swapExtensionNetwork,
//       // [ORACLE_MODULE_NAME]: oracleNetwork,
//       // [CDP_MODULE_NAME]: cdpNetwork,
//       // [TOKEN_MODULE_NAME]: tokenNetwork,
//       // [STAKING_MODULE_NAME]: stakingNetwork,
//       // [MARKET_MODULE_NAME]: marketNetwork,
//       // [CONVERT_MODULE_NAME]: convertNetwork,
//       bAssetsTokens: bAssets,
//       earnCoins: earnCoins,
//       earnLps: earnLps,
//       nativeCurrencies: nativeCurrencies,
//       tokenCurrencies: tokenCurrencies
//     },
//     `deployed_${version}_${chainId}_DApps`,
//     "./modules"
//   );
//   printAble && console.log(`\n  writeDeployedContractsForDApps end. version: ${version} / chainId: ${chainId}`);
// }

export async function checkAndGetStableCoinDemon(walletData: WalletData, amount: string): Promise<boolean> {
  console.log(`\n  checkAndGetStableCoinDemon enter. amount: ${amount}`);
  const address: string = walletData?.activeWallet?.address;
  if (!address || !amount) {
    return false;
  }
  const { oracleNetwork, cdpNetwork, stakingNetwork } = readDeployedContracts(walletData.chainId);
  const { stable_coin_denom } = cdpNetwork;
  const { oraclePyth } = oracleNetwork;
  const { cdpCentralControl } = cdpNetwork;
  const hubAddress = stakingNetwork?.hub?.address;
  const bAssetsAddress = stakingNetwork?.bAssetsToken?.address;
  if (!oraclePyth?.address || !cdpCentralControl?.address) {
    return false;
  }
  if (!stable_coin_denom || !hubAddress || !bAssetsAddress) {
    return false;
  }
  const custodyAddress = cdpNetwork?.cdpCollateralPairs?.find(value => bAssetsAddress === value.collateral)?.custody?.address;
  if (!custodyAddress) {
    return false;
  }

  const addressBalance = await queryAddressBalance(walletData, address, stable_coin_denom);
  console.log(`\n  Query address balance ok.`, addressBalance);
  if (BnComparedTo(addressBalance.amount, amount) >= 0) {
    return true;
  }
  const bAssetsTokenQueryClient = new cw20BaseContracts.Cw20Base.Cw20BaseQueryClient(walletData?.activeWallet?.signingCosmWasmClient, bAssetsAddress);
  const bAssetsTokenBalance = await bAssetsTokenQueryClient.balance({ address });
  console.log(`\n  Query address bAssetsToken balance ok.`, bAssetsTokenBalance.balance);

  const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpCentralControl.address);
  const max_ltv = (await centralControlQueryClient.collateralElem({ collateral: bAssetsAddress })).max_ltv;

  const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData?.activeWallet?.signingCosmWasmClient, oraclePyth?.address);
  const nativePrice = (await oraclePythQueryClient.queryPrice({ asset: walletData?.nativeCurrency?.coinMinimalDenom }))?.emv_price;
  const stablePrice = (await oraclePythQueryClient.queryPrice({ asset: stable_coin_denom }))?.emv_price;
  // more * 1.2
  const bAssetsAmount = BnFormat(BnMul(BnDiv(BnMul(amount, stablePrice), BnMul(nativePrice, max_ltv)), 1.2), 0, 1);

  console.log(`------ nativePrice: ${nativePrice} / stablePrice: ${stablePrice} / max_ltv: ${max_ltv} / calc bAssetsAmount: ${bAssetsAmount} `);
  // bond bAssets
  if (BnComparedTo(bAssetsTokenBalance.balance, bAssetsAmount) < 0) {
    const hubClient = new stakingContracts.Hub.HubClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, hubAddress);
    const bondRes = await hubClient.bond(2, "bond native to bAssets", [{ amount: bAssetsAmount, denom: walletData?.nativeCurrency?.coinMinimalDenom }]);
    console.log(`\n  Do staking.hub bond ok. \n  ${bondRes?.transactionHash}`);
    if (!bondRes?.transactionHash) {
      return false;
    }
    await sleep(1000);
  } else {
    console.log("\n  skip bond bAssets");
  }

  // console.log(`\n  Do staking.bAssets send enter.`, bAssetsAddress, custodyAddress);
  const bAssetsTokenClient = new cw20BaseContracts.Cw20Base.Cw20BaseClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, bAssetsAddress);
  const msg = toEncodedBinary({
    mint_stable_coin: {
      stable_amount: amount,
      is_redemption_provider: true
    }
  });
  const mintRes = await bAssetsTokenClient.send({ amount: bAssetsAmount, contract: custodyAddress, msg });

  console.log(`\n  Do staking.bAssets send ok. ${mintRes?.transactionHash}`);
  if (!mintRes?.transactionHash) {
    return false;
  }
  await sleep(1000);
  const addressBalance2 = await queryAddressBalance(walletData, address, stable_coin_denom);

  return BnComparedTo(addressBalance2.amount, amount) >= 0;
}

export async function writeDeployedContractsToSubModules({ deployedChainId, deployedVersion, printAble = true }: { deployedChainId?: string; deployedVersion?: string; printAble?: boolean }): Promise<void> {
  const chainId: string = deployedChainId || DEPLOY_CHAIN_ID;
  const version: string = deployedVersion || DEPLOY_VERSION;
  printAble && console.log(`\n  writeDeployedContractsToSubModules enter. version: ${version} / chainId: ${chainId}`);

  const { swapExtensionNetwork, oracleNetwork, cdpNetwork, stakingNetwork, marketNetwork, convertNetwork, tokenNetwork } = readDeployedContracts(chainId);
  if (!!swapExtensionNetwork) {
    swapExtensionWriteArtifact(swapExtensionNetwork, chainId);
  }
  if (!!oracleNetwork) {
    oracleWriteArtifact(oracleNetwork, chainId);
  }
  if (!!cdpNetwork) {
    cdpWriteArtifact(cdpNetwork, chainId);
  }
  if (!!stakingNetwork) {
    stakingWriteArtifact(stakingNetwork, chainId);
  }
  if (!!marketNetwork) {
    marketWriteArtifact(marketNetwork, chainId);
  }
  if (!!convertNetwork) {
    convertWriteArtifact(convertNetwork, chainId);
  }
  if (!!tokenNetwork) {
    tokenWriteArtifact(tokenNetwork, chainId);
  }
  printAble && console.log(`\n  writeDeployedContractsToSubModules end. version: ${version} / chainId: ${chainId}`);
}

export async function writeDeployed({ chainId, writeAble = true, print = false }: { chainId?: string; writeAble?: boolean; print?: boolean }): Promise<void> {
  chainId = chainId || DEPLOY_CHAIN_ID;
  print && console.log(`\n  writeDeployed enter chainId: ${chainId} / version: ${DEPLOY_VERSION}`);

  const swapNetwork = swapExtensionReadArtifact(chainId) as SwapExtensionContractsDeployed;
  const oracleNetwork = oracleReadArtifact(chainId) as OracleContractsDeployed;
  const cdpNetwork = cdpReadArtifact(chainId) as CdpContractsDeployed;
  const { stable_coin_denom } = cdpNetwork;
  const tokenNetwork = tokenReadArtifact(chainId) as TokenContractsDeployed;
  const stakingNetwork = stakingReadArtifact(chainId) as StakingContractsDeployed;
  const marketNetwork = marketReadArtifact(chainId) as MarketContractsDeployed;
  const convertNetwork = convertReadArtifact(chainId) as ConvertContractsDeployed;

  print && console.log();
  print && console.log(`hubContractAddress: "${stakingNetwork?.hub?.address}",`);
  print && console.log(`rewardAddress: "${stakingNetwork?.reward?.address}",`);
  print && console.log(`rewardsDispatcherAddress: "${stakingNetwork?.rewardsDispatcher?.address}",`);
  print && console.log(`validatorsRegistryAddress: "${stakingNetwork?.validatorsRegistry?.address}",`);
  print && console.log(`bSeiTokenAddress: "${stakingNetwork?.bAssetsToken?.address}",`);
  print && console.log(`stSeiTokenAddress: "${stakingNetwork?.stAssetsToken?.address}",`);

  print && console.log();
  print && console.log(`marketAddress: "${marketNetwork?.market?.address}",`);
  // print && console.log(`aTokenAddress: "${marketNetwork?.aToken?.address}",`);
  // print && console.log(`aUSTAddress: "${marketNetwork?.aToken?.address}",`);
  print && console.log(`interestModelAddress: "${marketNetwork?.interestModel?.address}",`);
  print && console.log(`distributionModelAddress: "${marketNetwork?.distributionModel?.address}",`);
  // print && console.log(`oracleAddress: "${marketNetwork?.oracle?.address}",`);
  print && console.log(`oracleAddress: "${oracleNetwork?.oraclePyth?.address}",`);
  print && console.log(`liquidationQueueAddress: "${marketNetwork?.liquidationQueue?.address}",`);
  print && console.log(`overseerAddress: "${marketNetwork?.overseer?.address}",`);
  print && console.log(`custodyBseiAddress: "${marketNetwork?.custodyBAssets?.address}",`);
  print && console.log();

  const bassets = [];
  const earnCoins = [];
  const tokenCurrencies = [];
  if (stakingNetwork?.bAssetsToken?.address) {
    bassets.push({
      name: "SEI/bSEI",
      native: "usei",
      btoken: stakingNetwork?.bAssetsToken?.address,
      convertAddress: stakingNetwork?.hub?.address,
      custodyAddress: marketNetwork?.custodyBAssets?.address,
      class: ""
    });
    earnCoins.push({
      name: marketNetwork?.market_stable_denom,
      native: marketNetwork?.market_stable_denom,
      marketAddress: marketNetwork?.market?.address,
      atokenAddress: marketNetwork?.aToken?.address
    });
    tokenCurrencies.push({
      coinType: 1,
      coinDenom: "bSEI",
      coinMinimalDenom: stakingNetwork?.bAssetsToken?.address,
      coinDecimals: 6,
      icon: `new URL("@/assets/img/luna_min.svg", import.meta.url).href`,
      custodyAddress: marketNetwork?.custodyBAssets?.address
    });
  }

  const convertPairsNetwork = convertNetwork?.convertPairs;
  if (convertPairsNetwork) {
    for (let convertPairsItem of convertPairsNetwork) {
      const converterNetwork = convertPairsItem?.converter;
      const btokenNetwork = convertPairsItem?.bAssetsToken;
      const custodyNetwork = convertPairsItem?.custody;
      const native_denom = convertPairsItem?.native_denom;

      const pairsName = convertConfigs?.convertPairs?.find(value => native_denom === value?.assets?.nativeDenom)?.name ?? "";
      const bassetPairs = {
        name: pairsName,
        native: native_denom,
        btoken: btokenNetwork?.address,
        convertAddress: converterNetwork?.address,
        custodyAddress: custodyNetwork?.address,
        class: "STSEI/bSTSEI" === pairsName ? "purple" : "SLSTI/bSLSTI" === pairsName ? "pink" : ""
      };
      bassets.push(bassetPairs);

      tokenCurrencies.push({
        coinType: 1,
        coinDenom: "STSEI/bSTSEI" === pairsName ? "bSTSEI" : "SLSTI/bSLSTI" === pairsName ? "bSLSTI" : "",
        coinMinimalDenom: btokenNetwork?.address,
        coinDecimals: 6,
        icon: "STSEI/bSTSEI" === pairsName ? `new URL("@/assets/img/bstsei_normal.svg", import.meta.url).href` : "SLSTI/bSLSTI" === pairsName ? `new URL("@/assets/img/slsdi_min.png", import.meta.url).href` : "",
        custodyAddress: custodyNetwork?.address
      });
    }
  }

  const earnLps = [];
  const stakingRewardsPairsNetwork: TokenStakingPairsContractsDeployed[] | undefined = tokenNetwork?.stakingPairs;
  if (stakingRewardsPairsNetwork) {
    for (const stakingRewardsPairNetwork of stakingRewardsPairsNetwork) {
      const earnLpPairs = {
        name: stakingRewardsPairNetwork?.name,
        lp_token: stakingRewardsPairNetwork?.staking_token,
        staking_contract: stakingRewardsPairNetwork?.staking?.address,
        pair_contract: stakingRewardsPairNetwork?.pool_address,
        pair_token: undefined
      };
      earnLps.push(earnLpPairs);
    }
  }

  print && console.log(`\n  btokens: \n  ${JSON.stringify(bassets)}`);
  print && console.log(`\n  earnCoins: \n  ${JSON.stringify(earnCoins)}`);
  print && console.log(`\n  earnLps: \n  ${JSON.stringify(earnLps)}`);
  print && console.log(`\n  chainInfo.tokenCurrencies: \n  ${JSON.stringify(tokenCurrencies)}`);
  print && console.log();

  writeAble &&
    writeArtifact(
      {
        [SWAP_EXTENSION_MODULE_NAME]: swapNetwork,
        [ORACLE_MODULE_NAME]: oracleNetwork,
        [CDP_MODULE_NAME]: cdpNetwork,
        [TOKEN_MODULE_NAME]: tokenNetwork,
        [STAKING_MODULE_NAME]: stakingNetwork,
        [MARKET_MODULE_NAME]: marketNetwork,
        [CONVERT_MODULE_NAME]: convertNetwork,
        btokens: bassets,
        earnCoins: earnCoins,
        earnLps: earnLps,
        tokenCurrencies: tokenCurrencies
      },
      `deployed_${DEPLOY_VERSION}_${chainId}`,
      "./modules"
    );
}
//
// export async function checkAndGetStableCoinDemon(walletData: WalletData, oraclePyth: ContractDeployed, cdpCentralControl: ContractDeployed, amount: string): Promise<boolean> {
//   const address: string = walletData?.activeWallet?.address;
//   if (!address || !amount || !oraclePyth?.address || !cdpCentralControl?.address) {
//     return false;
//   }
//   const cdpNetwork = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
//   const stakingNetwork = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
//   const stable_coin_denom = cdpNetwork?.stable_coin_denom;
//   const hubAddress = stakingNetwork?.hub?.address;
//   const bseiAddress = stakingNetwork?.bSeiToken?.address;
//   if (!stable_coin_denom || !hubAddress || !bseiAddress) {
//     return false;
//   }
//   const custodyAddress = cdpNetwork?.cdpCollateralPairs?.find(value => bseiAddress === value.collateral)?.custody?.address;
//   if (!custodyAddress) {
//     return false;
//   }
//
//   const addressBalance = await queryAddressBalance(walletData, address, stable_coin_denom);
//   console.log(`\n  Query address balance ok.`, addressBalance);
//   if (BnComparedTo(addressBalance.amount, amount) >= 0) {
//     return true;
//   }
//   const btokenQueryClient = new cw20BaseContracts.Cw20Base.Cw20BaseQueryClient(walletData?.activeWallet?.signingCosmWasmClient, bseiAddress);
//   const btokenBalance = await btokenQueryClient.balance({ address });
//   console.log(`\n  Query address bseiToken balance ok.`, btokenBalance.balance);
//
//   const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpCentralControl.address);
//   const max_ltv = (await centralControlQueryClient.collateralElem({ collateral: bseiAddress })).max_ltv;
//
//   const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData?.activeWallet?.signingCosmWasmClient, oraclePyth?.address);
//   const useiPrice = (await oraclePythQueryClient.queryPrice({ asset: walletData?.nativeCurrency?.coinMinimalDenom }))?.emv_price;
//   const stablePrice = (await oraclePythQueryClient.queryPrice({ asset: stable_coin_denom }))?.emv_price;
//   // more * 1.2
//   const bseiAmount = BnFormat(BnMul(BnDiv(BnMul(amount, stablePrice), BnMul(useiPrice, max_ltv)), 1.2), 0, 1);
//
//   console.log(`------ seiPrice: ${useiPrice} / stablePrice: ${stablePrice} / max_ltv: ${max_ltv} / calc bseiAmount: ${bseiAmount} `);
//   // bond bsei
//   if (BnComparedTo(btokenBalance.balance, bseiAmount) < 0) {
//     const hubClient = new stakingContracts.Hub.HubClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, hubAddress);
//     const bondRes = await hubClient.bond(undefined, "bond native to bsei", [{ amount: bseiAmount, denom: walletData?.nativeCurrency?.coinMinimalDenom }]);
//     console.log(`\n  Do staking.hub bond ok. \n  ${bondRes?.transactionHash}`);
//     if (!bondRes?.transactionHash) {
//       return false;
//     }
//   }
//
//   // console.log(`\n  Do staking.bsei send enter.`, bseiAddress, custodyAddress);
//   const btokenClient = new cw20BaseContracts.Cw20Base.Cw20BaseClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, bseiAddress);
//   const msg = toEncodedBinary({
//     mint_stable_coin: {
//       stable_amount: amount,
//       is_redemption_provider: true
//     }
//   });
//   const mintRes = await btokenClient.send({ amount: bseiAmount, contract: custodyAddress, msg });
//
//   console.log(`\n  Do staking.bsei send ok. ${mintRes?.transactionHash}`);
//   if (!mintRes?.transactionHash) {
//     return false;
//   }
//   const addressBalance2 = await queryAddressBalance(walletData, address, stable_coin_denom);
//
//   return BnComparedTo(addressBalance2.amount, amount) >= 0;
// }
