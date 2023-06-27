import type { BaseContractConfig, ContractDeployed } from "../../types";

export interface CdpCentralControlContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: string;
    stable_denom: string;
    epoch_period: number;
    redeem_fee: string;
  };
}

export interface CdpCustodyContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: string;
  };
}

export interface CdpLiquidationQueueContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: string;
    safe_ratio: string;
    bid_fee: string;
    liquidator_fee: string;
    liquidation_threshold: string;
    price_timeframe: number;
    waiting_period: number;
  };
  updateMsg: {
    bid_threshold: string;
    max_slot: string;
    premium_rate_per_slot: string;
  };
}

export interface CdpStablePoolContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: string;
    sub_demon: string;
    min_redeem_value: string;
  };
  updateMsg: {
    bid_threshold: string;
    max_slot: string;
    premium_rate_per_slot: string;
  };
}

export interface CdpContractsConfig {
  cdpCentralControl: CdpCentralControlContractConfig;
  cdpCustody: CdpCustodyContractConfig;
  cdpLiquidationQueue: CdpLiquidationQueueContractConfig;
  cdpStablePool: CdpStablePoolContractConfig;
}

export interface CdpContractsDeployed {
  cdpCentralControl?: ContractDeployed;
  cdpCustody?: ContractDeployed;
  cdpLiquidationQueue?: ContractDeployed;
  cdpStablePool?: ContractDeployed;
}
