import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";

export interface CdpCentralControlContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: Addr;
    stable_denom: Addr;
    epoch_period: number;
    redeem_fee: string;
  };
}

export interface CdpCustodyContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: Addr;
  };
}

export interface CdpRewardBookContractConfig extends BaseContractConfig {
  initMsg?: {
    threshold: string;
  };
}

export interface CdpLiquidationQueueContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
    safe_ratio: string;
    bid_fee: string;
    liquidator_fee: string;
    liquidation_threshold: string;
    price_timeframe: number;
    waiting_period: number;
  };
}

export interface CdpStablePoolContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: Addr;
    sub_demon: string;
    min_redeem_value: string;
  };
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
  cdpCentralControl: CdpCentralControlContractConfig;
  cdpStablePool: CdpStablePoolContractConfig;
  cdpLiquidationQueue: CdpLiquidationQueueContractConfig;
  // cdpCustody: CdpCustodyContractConfig;
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
  // cdpCustody?: ContractDeployed;
  cdpCollateralPairs: CdpCollateralPairsDeployed[];
}
