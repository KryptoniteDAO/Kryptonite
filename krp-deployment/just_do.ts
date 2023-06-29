import type { WalletData } from "./types";
import type { CdpContractsDeployed, ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "./modules";
import { BnAdd, BnComparedTo, BnDiv, BnMul, BnPow, BnSub, printChangeBalancesByWalletData, queryAddressBalance, queryAddressTokenBalance, queryWasmContractByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import { stakingReadArtifact, marketReadArtifact, swapExtentionReadArtifact, convertReadArtifact, kptReadArtifact, KptContractsDeployed, cdpReadArtifact } from "./modules";

import { cdpContracts, cw20BaseContracts, kptContracts, marketContracts } from "./contracts";
import Cw20Base = cw20BaseContracts.Cw20Base;
import { BalanceResponse } from "@/contracts/cw20Base/Cw20Base.types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- just do enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;
  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just do what you want
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  // const blocksPerYear = 63_072_000;
  // const blocksPerYear2 = 4656810;
  //
  if (networkKpt?.kpt?.address) {
    const kptClient = new Cw20Base.Cw20BaseClient(walletData.signingCosmWasmClient, walletData.address, networkKpt?.kpt?.address);
    const kptQueryClient = new Cw20Base.Cw20BaseQueryClient(walletData.signingCosmWasmClient, networkKpt?.kpt?.address);
    const balanceResponse: BalanceResponse = await kptQueryClient.balance({ address: walletData.address });
    console.log(balanceResponse);
    // await kptClient.transfer({amount:"1000000000000", recipient:""})
  }

  // const oraclePythQueryClient = new marketContracts.OraclePyth.OraclePythQueryClient(walletData.signingCosmWasmClient, networkMarket?.oraclePyth?.address);
  // // const queryRes = oraclePythQueryClient.queryPrice({asset: walletData.stable_coin_denom})
  // // const queryRes = oraclePythQueryClient.queryPrice({ asset: networkStaking.bSeiToken.address });
  // // console.log(queryRes);
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
      const balanceRaw = (await queryAddressBalance(walletData, pairToken, assetInfo?.["native_token"].denom))?.amount ?? 0;
      const balance = BnDiv(balanceRaw, BnPow(10, 6));
      const price = await getAssetPrice(walletData, pairToken, assetInfo);
      const asset_value = BnMul(balance, price);
      pairTotalValue = BnAdd(pairTotalValue, asset_value);
      assetDataInfoList.push({ asset_info: assetInfo, price, asset_balance: { balanceRaw, balance }, asset_value });
    } else if (!!assetInfo?.["token"]) {
      const balanceRaw = (await queryAddressTokenBalance(walletData.signingCosmWasmClient, pairToken, assetInfo?.["token"].contract_addr))?.amount ?? 0;
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
