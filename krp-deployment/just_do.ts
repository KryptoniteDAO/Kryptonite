import { getQueryClient } from "@sei-js/core";
import Decimal from "decimal.js";
import {ContractDeployed} from "./types";
import type { WalletData } from "./types";
import type { CdpContractsDeployed, ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, TokenContractsDeployed, SwapExtentionContractsDeployed, OracleContractsDeployed } from "./modules";
import { stakingReadArtifact, marketReadArtifact, swapExtentionReadArtifact, convertReadArtifact, tokenReadArtifact, cdpReadArtifact, oracleReadArtifact, checkAndGetStableCoinDemon, TokenFundContractConfig, tokenConfigs, tokenWriteArtifact } from "./modules";
import {
  BnAdd,
  BnComparedTo,
  BnDiv,
  BnMul,
  BnPow,
  BnSub,
  checkAddress,
  deployContract,
  executeContractByWalletData,
  printChangeBalancesByWalletData,
  queryAddressBalance,
  queryAddressTokenBalance,
  queryWasmContractByWalletData,
  sendCoinToOtherAddress,
  sendTokensByWalletData,
  sleep
} from "./common";
import { loadingWalletData } from "./env_data";

import { cdpContracts, cw20BaseContracts, tokenContracts, marketContracts, oracleContracts, stakingContracts } from "@/contracts";
import Cw20Base = cw20BaseContracts.Cw20Base;
import { BalanceResponse } from "@/contracts/cw20Base/Cw20Base.types";
import { coins } from "@cosmjs/stargate";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- just do enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  const { stable_coin_denom } = networkCdp;
  const networkToken = tokenReadArtifact(walletData.chainId) as TokenContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;
  // console.log(checkAddress("factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt", "sei"));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just do what you want
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // await deployCustom(walletData);

  // console.log((await walletData.signingCosmWasmClient.getContract("sei1chjhkfkkzhmdu3q3vrurmdm6qalyduvnn0tqkmduy3vqpw7chfcsw4ennj"))?.codeId);
  // console.log((await walletData.signingCosmWasmClient.getContract("sei1hv323zzsxprczf8um7uqmhfwgu9nvwfx2zum0uesajw8d6526kpsnmzckp"))?.codeId);
  // console.log(await queryWasmContractByWalletData(walletData, "sei1pqcgdn5vmf3g9ncs98vtxkydc6su0f9rk3uk73s5ku2xhthr6avswrwnrx", { pair: {} }));
  // console.log(await queryWasmContractByWalletData(walletData, "sei1e0d0mfgxlmpypf68w4jq2eclk9hc5mcdw8mwurj8rld4yx3qncxsn0q88f", { pair: {} }));
  //
  // const stakingRewardsClient = new kptContracts.StakingRewards.StakingRewardsClient(walletData.signingCosmWasmClient, walletData.address, "sei1fgw0ttpxr034xcqc39jnpe4mw39ygdrtcyy7peudfk8n5k249xgs8fdpxr");
  // const dRes = await stakingRewardsClient.notifyRewardAmount({amount: "1000000000"})
  // console.log(dRes)

  // console.log(await checkAndGetStableCoinDemon(walletData, networkOracle?.oraclePyth, networkCdp?.cdpCentralControl, "1000000"));
  // const blindBoxClient = new blindBoxContracts.BlindBox.BlindBoxClient(walletData.signingCosmWasmClient, walletData.address, networkBlindBox?.blindBox.address);
  // const doRes = await blindBoxClient.updateConfig({
  //   receiverPriceAddr: walletData.address
  // });
  // console.log(`  Do blindBox.blindBox update_config ok. \n  ${doRes?.transactionHash}`);

  // const blocksPerYear = 63_072_000;
  // const blocksPerYear2 = 4656810;
  //

  // const seilorClient = new Cw20Base.Cw20BaseClient(walletData.signingCosmWasmClient, walletData.address, networkToken?.seilor?.address);
  // const res = await seilorClient.transfer({ amount: "1000000000", recipient: "sei1vjv4wg7lllt32rng08r4r9lhmtu6gyrhvpn4ce556an4htl3klnq5c6gkj" });
  // console.log(res);

  if (networkStaking?.hub?.address) {
    const hubClient = new stakingContracts.Hub.HubClient(walletData.signingCosmWasmClient, walletData.address, networkStaking?.hub?.address);
    const hubClient2 = new stakingContracts.Hub.HubClient(walletData.signingCosmWasmClient2, walletData.address2, networkStaking?.hub?.address);
    const hubQueryClient = new stakingContracts.Hub.HubQueryClient(walletData.signingCosmWasmClient, networkStaking?.hub?.address);
    console.log(await (await getQueryClient(walletData.LCD_ENDPOINT)).cosmos.staking.v1beta1.params());
    // console.log(await (await getQueryClient(walletData.LCD_ENDPOINT)).cosmos.staking.v1beta1.historicalInfo({ height: Long.fromInt(10000) }));
    // console.log(await (await getQueryClient(walletData.LCD_ENDPOINT)).cosmos.staking.v1beta1.historicalInfo({ height: Long.fromInt(10000) }));
    console.log(await hubQueryClient.parameters());
    console.log(await hubQueryClient.config());

    // console.log(`bond ------ `, await hubClient2.updateParams({ epochPeriod: 3, unbondingPeriod: 180 }));
    // console.log(`bond ------ `, await hubClient.bond(1.3, undefined, coins("100000", "usei") as unknown as any));
    // console.log(`bond ------ `, await hubClient.withdrawUnbonded());
    // const len:number = 10;
    // for (let i = 0; i < 10; i++) {
    //   console.log(`---------------- ${i}`)
    //   await doHubUnbondBseiToNative(walletData, walletData.nativeCurrency.coinMinimalDenom, networkStaking?.bSeiToken, networkStaking?.hub, "1000");
    //   await sleep(26000);
    // }
  }

  if (networkMarket?.market?.address) {
    // const marketClient = new marketContracts.Market.MarketClient(walletData.signingCosmWasmClient, walletData.address, networkMarket?.market?.address);
    // const marketQueryClient = new marketContracts.Market.MarketQueryClient(walletData.signingCosmWasmClient, networkMarket?.market?.address);
    // let res = await marketClient.depositStable(undefined, undefined, coins(1000000, stable_coin_denom));
    // console.log(res);

    const atokenClient = new Cw20Base.Cw20BaseClient(walletData.signingCosmWasmClient, walletData.address, networkMarket?.aToken?.address);
    const atokenQueryClient = new Cw20Base.Cw20BaseQueryClient(walletData.signingCosmWasmClient, networkMarket?.aToken?.address);
    const balanceResponse: BalanceResponse = await atokenQueryClient.balance({ address: walletData.address });
    console.log(balanceResponse);
  }
  if (networkToken?.seilor?.address) {
    const seilorClient = new Cw20Base.Cw20BaseClient(walletData.signingCosmWasmClient, walletData.address, networkToken?.seilor?.address);
    const seilorQueryClient = new Cw20Base.Cw20BaseQueryClient(walletData.signingCosmWasmClient, networkToken?.seilor?.address);
    const balanceResponse: BalanceResponse = await seilorQueryClient.balance({ address: walletData.address });
    console.log(balanceResponse);
    // const doRes = await seilorClient.transfer({ amount: "1000000", recipient: "sei17cylnnnxa92pd6w40y6af78zk3yslr3n8st588" });
    // console.log(doRes);
  }

  // const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, networkOracle?.oraclePyth?.address);
  // const queryRes = await oraclePythQueryClient.queryPrice({asset: stable_coin_denom})
  // // // const queryRes = oraclePythQueryClient.queryPrice({ asset: networkStaking.bSeiToken.address });
  // console.log(queryRes);
  // const overseerQueryClient = new OverseerQueryClient(walletData.signingCosmWasmClient, networkMarket?.overseer?.address);
  // const epochStateRes = await overseerQueryClient.epochState();
  // const epochConfigRes = await overseerQueryClient.config();
  // const dynrateStateRes = await overseerQueryClient.dynrateState();
  //
  // console.log(epochStateRes);
  // console.log(epochConfigRes);
  // console.log(dynrateStateRes);
  // console.log(computeApy(epochStateRes.deposit_rate, blocksPerYear, epochConfigRes.epoch_period));

  // const pairToken: string = "sei1dgs47p8fe384pepp4q09fqwxu0xpr99j69d7avhqkfs5vsyzvl2sajz57m";
  // console.log(`\n  +++++++ `, await getPairPrice(walletData, pairToken));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- just do end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}

const deployCustom = async walletData => {
  const contractName: string = "crossDistribution";
  const defaultInitMsg = {
    cross_rule: "sei1mlwyp04y5g95klqzq92tun0xsz7t5sef4h88a3",
    cross_token: "sei1chjhkfkkzhmdu3q3vrurmdm6qalyduvnn0tqkmduy3vqpw7chfcsw4ennj",
    fee_receiver: "sei1mlwyp04y5g95klqzq92tun0xsz7t5sef4h88a3",
    max_cross_amount: "10000000000"
  };
  const writeAble = false;
  const defaultFilePath = "..\\..\\sei-bridge\\artifacts\\cross_distribution.wasm";

  await deployContract(walletData, contractName, {}, { codeId: 2371 }, {}, { defaultFilePath, defaultInitMsg, writeAble });
};

export type Addr = string;
export type AssetInfo =
  | {
      token: {
        contract_addr: Addr;
      };
    }
  | {
      native_token: {
        denom: string;
      };
    };
export type PairInfo = {
  asset_infos: AssetInfo[];
  contract_addr: Addr;
  liquidity_token: Addr;
  pair_type: Record<string, any>;
};
export type Uint128 = string;

export interface TokenInfoResponse {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: Uint128;
}

export type CoinBalance = {
  balance?: string;
  balanceRaw?: string;
};
export type AssetDataInfo = {
  asset_info: AssetInfo;
  asset_balance: CoinBalance;
  asset_value: string;
  price: string;
};

/**
 * 1.get pair() => asset_infos
 */
const getPairPrice = async (walletData: WalletData, pairToken: string): Promise<string> => {
  const pairRes: PairInfo = await queryWasmContractByWalletData(walletData, pairToken, {
    pair: {}
  });
  console.log(`\n  pairRes: ${JSON.stringify(pairRes)}`);
  const liquidityToken: string = pairRes.liquidity_token;
  const totalInfoRes: TokenInfoResponse = await queryWasmContractByWalletData(walletData, liquidityToken, {
    token_info: {}
  });
  console.log(`\n  totalInfoRes: ${JSON.stringify(totalInfoRes)}`);
  const liquidityTokenTotalSupply: string = BnDiv(totalInfoRes.total_supply, BnPow(10, totalInfoRes.decimals));

  if ((BnComparedTo(liquidityTokenTotalSupply, "0") ?? -1) <= 0) {
    return "0";
  }
  const assetDataInfoList: AssetDataInfo[] = [];
  let pairTotalValue = "0";
  for (const assetInfo of pairRes.asset_infos) {
    if (!!assetInfo?.["native_token"]) {
      const balanceRaw = (await queryAddressBalance(walletData, pairToken, assetInfo?.["native_token"].denom))?.amount ?? "0";
      const balance = BnDiv(balanceRaw, BnPow(10, 6));
      const price = await getAssetPrice(walletData, pairToken, assetInfo);
      const asset_value = BnMul(balance, price);
      pairTotalValue = BnAdd(pairTotalValue, asset_value);
      assetDataInfoList.push({ asset_info: assetInfo, price, asset_balance: { balanceRaw, balance }, asset_value });
    } else if (!!assetInfo?.["token"]) {
      const balanceRaw = (await queryAddressTokenBalance(walletData.signingCosmWasmClient, pairToken, assetInfo?.["token"].contract_addr))?.amount ?? "0";
      const balance = BnDiv(balanceRaw, BnPow(10, 6));
      const price = await getAssetPrice(walletData, pairToken, assetInfo);
      const asset_value = BnMul(balance, price);
      pairTotalValue = BnAdd(pairTotalValue, asset_value);
      assetDataInfoList.push({ asset_info: assetInfo, price, asset_balance: { balanceRaw, balance }, asset_value });
    }
  }
  console.log(`\n  assetDataInfoList: ${JSON.stringify(assetDataInfoList)}`);
  return BnDiv(pairTotalValue, liquidityTokenTotalSupply);
};

const getAssetPrice = async (walletData: WalletData, pairToken: string, assetInfo: AssetInfo): Promise<string> => {
  const asset: string = assetInfo?.["native_token"].denom ?? assetInfo?.["token"].contract_addr;
  const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, "sei1astmpzef62a0anfqqwkau9prtcd58njvpjcmskemzhzas009xpgs2u3dgp");

  let configRes = null;
  let initFlag = true;
  try {
    configRes = await oraclePythQueryClient.queryPythFeederConfig({ asset });
  } catch (error: any) {
    if (error?.toString().includes("Pyth feeder config not found")) {
      initFlag = false;
    } else {
      throw new Error(error);
    }
  }
  await getAssetPriceFromSwapPair(walletData, pairToken, assetInfo);
  if (!initFlag || !configRes?.is_valid) {
    return await getAssetPriceFromSwapPair(walletData, pairToken, assetInfo);
  }

  const priceResponse = await oraclePythQueryClient.queryPrice({ asset });
  console.log(`\n  priceResponse: ${JSON.stringify(priceResponse)}`);
  return priceResponse?.emv_price ?? "0";
};

const getAssetPriceFromSwapPair = async (walletData: WalletData, pairToken: string, assetInfo: AssetInfo): Promise<string> => {
  const simulationRes = await queryWasmContractByWalletData(walletData, pairToken, {
    simulation: { offer_asset: { info: assetInfo, amount: "1000000" } }
  });
  console.log(`\n ----------- simulationRes: ${JSON.stringify(assetInfo)} / ${JSON.stringify(simulationRes)}`);

  return BnDiv(simulationRes?.return_amount ?? 0, BnPow(10, 6));
};

function computeApy(depositRate: string, blocksPerYear: number, epochPeriod: number): string {
  const compoundTimes = BnDiv(blocksPerYear, epochPeriod);
  const perCompound = BnMul(depositRate ?? "0", epochPeriod);

  // const apy = new Decimal(Math.pow(perCompound.add(1).toNumber(), compoundTimes) - 1);
  const apy = BnSub(BnPow(BnAdd(perCompound, 1), compoundTimes), 1);
  console.log(`depositRate`, depositRate);
  console.log(`blocksPerYear`, blocksPerYear);
  console.log(`epochPeriod`, epochPeriod);
  console.log(`compoundTimes`, compoundTimes);
  console.log(`perCompound`, perCompound);
  console.log(`apy`, apy);
  if (BnComparedTo(apy, "0.2") >= 0) {
    return computeApr(depositRate, blocksPerYear);
  }

  return apy;
}

function computeApr(depositRate: string, blocksPerYear: number): string {
  return BnMul(depositRate ?? "0", blocksPerYear);
}

async function doHubUnbondBseiToNative(walletData: WalletData, nativeDenom: string, btoken: ContractDeployed, hub: ContractDeployed, amount: string): Promise<void> {
  if (!btoken?.address || !hub?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do hub.address unbond bsei to native coin enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  if (new Decimal(beforeTokenBalanceRes?.balance ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeTokenBalanceRes?.balance ?? 0}`);
    return;
  }
  const beforeUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData.address } });
  console.log(`before unbond_requests ok. \n  ${JSON.stringify(beforeUnbondRequestRes)}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${btoken.address}`);
  const doRes = await executeContractByWalletData(
    walletData,
    btoken.address,
    {
      send: {
        contract: hub.address,
        amount: amount,
        msg: Buffer.from(JSON.stringify({ unbond: {} })).toString("base64")
      }
    },
    "unbond bsei to native"
  );
  console.log(`Do hub.address unbond bsei to native coin ok. \n  ${doRes?.transactionHash}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${btoken.address}`);
  const afterUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData.address } });
  console.log(`after unbond_requests ok. \n  ${JSON.stringify(afterUnbondRequestRes)}`);
}
