import type { CdpContractsDeployed, StakingRewardsPairsContractsDeployed, ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, KptContractsDeployed, SwapExtentionContractsDeployed, OracleContractsDeployed } from "@/modules";
import {
  stakingReadArtifact,
  marketReadArtifact,
  swapExtentionReadArtifact,
  convertReadArtifact,
  kptReadArtifact,
  cdpReadArtifact,
  oracleReadArtifact,
  convertConfigs,
  CDP_MODULE_NAME,
  SWAP_EXTENSION_MODULE_NAME,
  ORACLE_MODULE_NAME,
  STAKING_MODULE_NAME,
  MARKET_MODULE_NAME,
  CONVERT_MODULE_NAME,
  KPT_MODULE_NAME
} from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { BnComparedTo, executeContractByWalletData, queryAddressBalance, toEncodedBinary, writeArtifact } from "@/common";
import { WalletData } from "@/types";
import { cw20BaseContracts, stakingContracts } from "@/contracts";
import { coins } from "@cosmjs/stargate";
require("dotenv").config();

export async function writeDeployed({ chainId, writeAble = true, print = false }: { chainId?: string; writeAble?: boolean; print?: boolean }): Promise<void> {
  chainId = chainId || DEPLOY_CHAIN_ID;
  print && console.log(`\n  writeDeployed enter chainId: ${chainId} / version: ${DEPLOY_VERSION}`);

  const networkSwap = swapExtentionReadArtifact(chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(chainId) as OracleContractsDeployed;
  const networkStaking = stakingReadArtifact(chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(chainId) as ConvertContractsDeployed;
  const networkKpt = kptReadArtifact(chainId) as KptContractsDeployed;
  const networkCdp = cdpReadArtifact(chainId) as CdpContractsDeployed;

  print && console.log();
  print && console.log(`hubContractAddress: "${networkStaking?.hub?.address}",`);
  print && console.log(`rewardAddress: "${networkStaking?.reward?.address}",`);
  print && console.log(`rewardsDispatcherAddress: "${networkStaking?.rewardsDispatcher?.address}",`);
  print && console.log(`validatorsRegistryAddress: "${networkStaking?.validatorsRegistry?.address}",`);
  print && console.log(`bSeiTokenAddress: "${networkStaking?.bSeiToken?.address}",`);
  print && console.log(`stSeiTokenAddress: "${networkStaking?.stSeiToken?.address}",`);

  print && console.log();
  print && console.log(`marketAddress: "${networkMarket?.market?.address}",`);
  // print && console.log(`aTokenAddress: "${networkMarket?.aToken?.address}",`);
  // print && console.log(`aUSTAddress: "${networkMarket?.aToken?.address}",`);
  print && console.log(`interestModelAddress: "${networkMarket?.interestModel?.address}",`);
  print && console.log(`distributionModelAddress: "${networkMarket?.distributionModel?.address}",`);
  // print && console.log(`oracleAddress: "${networkMarket?.oracle?.address}",`);
  print && console.log(`oracleAddress: "${networkOracle?.oraclePyth?.address}",`);
  print && console.log(`liquidationQueueAddress: "${networkMarket?.liquidationQueue?.address}",`);
  print && console.log(`overseerAddress: "${networkMarket?.overseer?.address}",`);
  print && console.log(`custodyBseiAddress: "${networkMarket?.custodyBSei?.address}",`);
  print && console.log();

  const bassets = [];
  const earnCoins = [];
  const tokenCurrencies = [];
  if (networkStaking?.bSeiToken?.address) {
    bassets.push({
      name: "SEI/bSEI",
      native: "usei",
      btoken: networkStaking?.bSeiToken?.address,
      convertAddress: networkStaking?.hub?.address,
      custodyAddress: networkMarket?.custodyBSei?.address,
      class: ""
    });
    earnCoins.push({
      name: networkMarket?.market_stable_denom,
      native: networkMarket?.market_stable_denom,
      marketAddress: networkMarket?.market?.address,
      atokenAddress: networkMarket?.aToken?.address
    });
    tokenCurrencies.push({
      coinType: 1,
      coinDenom: "bSEI",
      coinMinimalDenom: networkStaking?.bSeiToken?.address,
      coinDecimals: 6,
      icon: `new URL("@/assets/img/luna_min.svg", import.meta.url).href`,
      custodyAddress: networkMarket?.custodyBSei?.address
    });
  }

  const convertPairsNetwork = networkConvert?.convertPairs;
  if (convertPairsNetwork) {
    for (let convertPairsItem of convertPairsNetwork) {
      const converterNetwork = convertPairsItem?.converter;
      const btokenNetwork = convertPairsItem?.btoken;
      const custodyNetwork = convertPairsItem?.custody;
      const native_denom = convertPairsItem?.native_denom;

      const pairsName = convertConfigs?.convertPairs?.find(value => native_denom === value.native_denom)?.name ?? "";
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
  const stakingRewardsPairsNetwork: StakingRewardsPairsContractsDeployed[] | undefined = networkKpt?.stakingRewardsPairs;
  if (stakingRewardsPairsNetwork) {
    for (const stakingRewardsPairNetwork of stakingRewardsPairsNetwork) {
      const earnLpPairs = {
        name: stakingRewardsPairNetwork?.name,
        lp_token: stakingRewardsPairNetwork?.staking_token,
        staking_contract: stakingRewardsPairNetwork?.stakingRewards?.address,
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
        [SWAP_EXTENSION_MODULE_NAME]: networkSwap,
        [ORACLE_MODULE_NAME]: networkOracle,
        [STAKING_MODULE_NAME]: networkStaking,
        [MARKET_MODULE_NAME]: networkMarket,
        [CONVERT_MODULE_NAME]: networkConvert,
        [KPT_MODULE_NAME]: networkKpt,
        [CDP_MODULE_NAME]: networkCdp,
        btokens: bassets,
        earnCoins: earnCoins,
        earnLps: earnLps,
        tokenCurrencies: tokenCurrencies
      },
      `deployed_${DEPLOY_VERSION}_${chainId}`,
      "./modules"
    );
}

export async function checkAndGetStableCoinDemon(walletData: WalletData, amount: string): Promise<boolean> {
  const address: string = walletData.address;
  if (!address || !amount) {
    return false;
  }
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const stable_coin_denom = networkCdp?.stable_coin_denom;
  const hubAddress = networkStaking?.hub?.address;
  const bseiAddress = networkStaking?.bSeiToken?.address;
  if (!stable_coin_denom || !hubAddress || !bseiAddress) {
    return false;
  }
  const custodyAddress = networkCdp?.cdpCollateralPairs?.find(value => bseiAddress === value.collateral)?.custody?.address;
  if (!custodyAddress) {
    return false;
  }
  const addressBalance = await queryAddressBalance(walletData, address, stable_coin_denom);
  console.log(`\n  Do staking.bsei send enter.`, addressBalance);
  if (BnComparedTo(addressBalance.amount, amount) >= 0) {
    return true;
  }
  const btokenQueryClient = new cw20BaseContracts.Cw20Base.Cw20BaseQueryClient(walletData.signingCosmWasmClient, bseiAddress);
  const btokenBalance = await btokenQueryClient.balance({ address });

  console.log(`\n  Do staking.bsei send enter.`, btokenBalance.balance);
  // bond bsei
  if (BnComparedTo(btokenBalance.balance, amount) < 0) {
    const hubClient = new stakingContracts.Hub.HubClient(walletData.signingCosmWasmClient, walletData.address, hubAddress);
    const bondRes = await hubClient.bond(undefined, "bond native to bsei", [{ amount, denom: "usei" }]);
    console.log(`\n  Do staking.hub bond ok. ${bondRes?.transactionHash}`);
    if (!bondRes?.transactionHash) {
      return false;
    }
  }

  console.log(`\n  Do staking.bsei send enter.`, bseiAddress, custodyAddress);
  // const btokenClient = new cw20BaseContracts.Cw20Base.Cw20BaseClient(walletData.signingCosmWasmClient, walletData.address, bseiAddress);
  // const msg = toEncodedBinary({
  //   mint_stable_coin: {
  //     stable_amount: amount,
  //     is_redemption_provider: true
  //   }
  // });
  // const mintRes = await btokenClient.send({ amount, contract: custodyAddress, msg });

  const mintRes = await executeContractByWalletData(walletData, bseiAddress, {
    send: {
      contract: custodyAddress,
      amount: "1000000",
      msg: Buffer.from(JSON.stringify({ mint_stable_coin: {stable_amount: amount,is_redemption_provider: true} })).toString("base64")
    }
  });
  console.log(`\n  Do staking.bsei send ok. ${mintRes?.transactionHash}`);
  if (!mintRes?.transactionHash) {
    return false;
  }
  const addressBalance2 = await queryAddressBalance(walletData, address, stable_coin_denom);

  return BnComparedTo(addressBalance2.amount, amount) >= 0;
}
