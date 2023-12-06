import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";
import type { InstantiateMsg as CdpCentralControlInstantiateMsg } from "@/contracts/cdp/CentralControl.types";
import type { InstantiateMsg as CdpCustodyInstantiateMsg } from "@/contracts/cdp/Custody.types";
import type { InstantiateMsg as CdpLiquidationQueueInstantiateMsg } from "@/contracts/cdp/LiquidationQueue.types";
import type { InstantiateMsg as CdpRewardBookInstantiateMsg } from "@/contracts/cdp/RewardBook.types";
import type { InstantiateMsg as CdpStablePoolInstantiateMsg } from "@/contracts/cdp/StablePool.types";

export interface CdpStableCoinDenomMetadataConfig {
  decimals: number;
  symbol: string;
  name: string;
}

export interface CdpCentralControlContractConfig extends BaseContractConfig {
  initMsg?: CdpCentralControlInstantiateMsg;
}

export interface CdpCustodyContractConfig extends BaseContractConfig {
  initMsg?: CdpCustodyInstantiateMsg;
}

export interface CdpRewardBookContractConfig extends BaseContractConfig {
  initMsg?: CdpRewardBookInstantiateMsg;
}

export interface CdpLiquidationQueueContractConfig extends BaseContractConfig {
  initMsg?: CdpLiquidationQueueInstantiateMsg;
}

export interface CdpStablePoolContractConfig extends BaseContractConfig {
  initMsg?: CdpStablePoolInstantiateMsg;
}

export interface CdpCollateralPairsConfig {
  name: string;
  collateral: Addr;
  custody: CdpCustodyContractConfig;
  rewardBook: CdpRewardBookContractConfig;
  /// centralControl whitelist
  centralControlWhitelistConfig: {
    name: string;
    symbol: string;
    max_ltv: string;
  };
  /// liquidationQueue whitelist
  liquidationQueueWhitelistConfig: {
    bid_threshold: string;
    max_slot: number;
    premium_rate_per_slot: string;
  };
}

export interface CdpContractsConfig {
  stableCoinDenomMetadata: CdpStableCoinDenomMetadataConfig;
  cdpCentralControl: CdpCentralControlContractConfig;
  cdpStablePool: CdpStablePoolContractConfig;
  cdpLiquidationQueue: CdpLiquidationQueueContractConfig;
  cdpCollateralPairs: CdpCollateralPairsConfig[];
}

export interface CdpCollateralPairsDeployed {
  name?: string;
  collateral?: string;
  custody?: ContractDeployed;
  rewardBook?: ContractDeployed;
}

export interface CdpContractsDeployed {
  stable_coin_denom: string;
  cdpCentralControl?: ContractDeployed;
  cdpStablePool?: ContractDeployed;
  cdpLiquidationQueue?: ContractDeployed;
  cdpCollateralPairs: CdpCollateralPairsDeployed[];
}
