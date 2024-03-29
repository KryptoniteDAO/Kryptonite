/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint256 = string;
export interface AllCollateralsResponse {
  all_collaterals: CollateralsResponse[];
  [k: string]: unknown;
}
export interface CollateralsResponse {
  borrower: string;
  collaterals: [string, Uint256][];
  [k: string]: unknown;
}
export interface BorrowLimitResponse {
  borrow_limit: Uint256;
  borrower: string;
  [k: string]: unknown;
}
export type Decimal256 = string;
export interface ConfigResponse {
  buffer_distribution_factor: Decimal256;
  collector_contract: string;
  dyn_rate_epoch: number;
  dyn_rate_max: Decimal256;
  dyn_rate_maxchange: Decimal256;
  dyn_rate_min: Decimal256;
  dyn_rate_yr_increase_expectation: Decimal256;
  epoch_period: number;
  kpt_purchase_factor: Decimal256;
  liquidation_contract: string;
  market_contract: string;
  oracle_contract: string;
  owner_addr: string;
  price_timeframe: number;
  stable_denom: string;
  target_deposit_rate: Decimal256;
  threshold_deposit_rate: Decimal256;
  [k: string]: unknown;
}
export interface DynrateState {
  last_executed_height: number;
  prev_yield_reserve: Decimal256;
  [k: string]: unknown;
}
export interface EpochState {
  deposit_rate: Decimal256;
  last_executed_height: number;
  prev_atoken_supply: Uint256;
  prev_exchange_rate: Decimal256;
  prev_interest_buffer: Uint256;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  update_config: {
    buffer_distribution_factor?: Decimal256 | null;
    dyn_rate_epoch?: number | null;
    dyn_rate_max?: Decimal256 | null;
    dyn_rate_maxchange?: Decimal256 | null;
    dyn_rate_min?: Decimal256 | null;
    dyn_rate_yr_increase_expectation?: Decimal256 | null;
    epoch_period?: number | null;
    kpt_purchase_factor?: Decimal256 | null;
    liquidation_contract?: string | null;
    oracle_contract?: string | null;
    price_timeframe?: number | null;
    target_deposit_rate?: Decimal256 | null;
    threshold_deposit_rate?: Decimal256 | null;
    [k: string]: unknown;
  };
} | {
  set_owner: {
    new_owner_addr: string;
    [k: string]: unknown;
  };
} | {
  accept_ownership: {
    [k: string]: unknown;
  };
} | {
  whitelist: {
    collateral_token: string;
    custody_contract: string;
    max_ltv: Decimal256;
    name: string;
    symbol: string;
    [k: string]: unknown;
  };
} | {
  update_whitelist: {
    collateral_token: string;
    custody_contract?: string | null;
    max_ltv?: Decimal256 | null;
    [k: string]: unknown;
  };
} | {
  execute_epoch_operations: {
    [k: string]: unknown;
  };
} | {
  update_epoch_state: {
    distributed_interest: Uint256;
    interest_buffer: Uint256;
    [k: string]: unknown;
  };
} | {
  lock_collateral: {
    borrower: string;
    collaterals: [string, Uint256][];
    [k: string]: unknown;
  };
} | {
  unlock_collateral: {
    collaterals: [string, Uint256][];
    [k: string]: unknown;
  };
} | {
  liquidate_collateral: {
    borrower: string;
    [k: string]: unknown;
  };
} | {
  fund_reserve: {
    [k: string]: unknown;
  };
} | {
  repay_stable_from_yield_reserve: {
    borrower: string;
    [k: string]: unknown;
  };
};
export type OfBlocksPerEachDynamicRateChangePeriod = number;
export type OfBlocksPerEpochPeriod = number;
export interface InstantiateMsg {
  buffer_distribution_factor: Decimal256;
  collector_contract: string;
  dyn_rate_epoch: OfBlocksPerEachDynamicRateChangePeriod;
  dyn_rate_max: Decimal256;
  dyn_rate_maxchange: Decimal256;
  dyn_rate_min: Decimal256;
  dyn_rate_yr_increase_expectation: Decimal256;
  epoch_period: OfBlocksPerEpochPeriod;
  kpt_purchase_factor: Decimal256;
  liquidation_contract: string;
  market_contract: string;
  oracle_contract: string;
  owner_addr: string;
  price_timeframe: number;
  stable_denom: string;
  target_deposit_rate: Decimal256;
  threshold_deposit_rate: Decimal256;
  [k: string]: unknown;
}
export interface MigrateMsg {
  [k: string]: unknown;
}
export type QueryMsg = {
  config: {
    [k: string]: unknown;
  };
} | {
  epoch_state: {
    [k: string]: unknown;
  };
} | {
  dynrate_state: {
    [k: string]: unknown;
  };
} | {
  whitelist: {
    collateral_token?: string | null;
    limit?: number | null;
    start_after?: string | null;
    [k: string]: unknown;
  };
} | {
  collaterals: {
    borrower: string;
    [k: string]: unknown;
  };
} | {
  all_collaterals: {
    limit?: number | null;
    start_after?: string | null;
    [k: string]: unknown;
  };
} | {
  borrow_limit: {
    block_time?: number | null;
    borrower: string;
    [k: string]: unknown;
  };
};
export interface WhitelistResponse {
  elems: WhitelistResponseElem[];
  [k: string]: unknown;
}
export interface WhitelistResponseElem {
  collateral_token: string;
  custody_contract: string;
  max_ltv: Decimal256;
  name: string;
  symbol: string;
  [k: string]: unknown;
}
export type OverseerExecuteMsg = ExecuteMsg;