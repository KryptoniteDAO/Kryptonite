/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Decimal256 = string;
export type Uint256 = string;
export interface InstantiateMsg {
  bid_fee: Decimal256;
  control_contract: string;
  liquidation_threshold: Uint256;
  liquidator_fee: Decimal256;
  oracle_contract: string;
  owner: string;
  price_timeframe: number;
  safe_ratio: Decimal256;
  stable_denom: string;
  waiting_period: number;
}
export type ExecuteMsg = {
  receive: Cw20ReceiveMsg;
} | {
  update_config: {
    bid_fee?: Decimal256 | null;
    control_contract?: string | null;
    liquidation_threshold?: Uint256 | null;
    liquidator_fee?: Decimal256 | null;
    oracle_contract?: string | null;
    owner?: string | null;
    price_timeframe?: number | null;
    safe_ratio?: Decimal256 | null;
    stable_denom?: string | null;
    waiting_period?: number | null;
  };
} | {
  whitelist_collateral: {
    bid_threshold: Uint256;
    collateral_token: string;
    max_slot: number;
    premium_rate_per_slot: Decimal256;
  };
} | {
  update_collateral_info: {
    bid_threshold?: Uint256 | null;
    collateral_token: string;
    max_slot?: number | null;
  };
} | {
  submit_bid: {
    collateral_token: string;
    premium_slot: number;
  };
} | {
  retract_bid: {
    amount?: Uint256 | null;
    bid_idx: Uint128;
  };
} | {
  activate_bids: {
    bids_idx?: Uint128[] | null;
    collateral_token: string;
  };
} | {
  claim_liquidations: {
    bids_idx?: Uint128[] | null;
    collateral_token: string;
  };
} | {
  execute_bid: {
    amount: Uint256;
    collateral_denom: string;
    fee_address: string;
    liquidator: string;
    repay_address: string;
  };
};
export type Uint128 = string;
export type Binary = string;
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
}
export type QueryMsg = {
  config: {};
} | {
  liquidation_amount: {
    borrow_amount: Uint256;
    borrow_limit: Uint256;
    collateral_prices: Decimal256[];
    collaterals: [string, Uint256][];
  };
} | {
  collateral_info: {
    collateral_token: string;
  };
} | {
  bid: {
    bid_idx: Uint128;
  };
} | {
  bids_by_user: {
    bidder: string;
    collateral_token: string;
    limit?: number | null;
    start_after?: Uint128 | null;
  };
} | {
  bid_pool: {
    bid_slot: number;
    collateral_token: string;
  };
} | {
  bid_pools_by_collateral: {
    collateral_token: string;
    limit?: number | null;
    start_after?: number | null;
  };
};
export interface BidResponse {
  amount: Uint256;
  bidder: string;
  collateral_token: string;
  epoch_snapshot: Uint128;
  idx: Uint128;
  pending_liquidated_collateral: Uint256;
  premium_slot: number;
  product_snapshot: Decimal256;
  scale_snapshot: Uint128;
  sum_snapshot: Decimal256;
  wait_end?: number | null;
}
export interface BidPoolResponse {
  current_epoch: Uint128;
  current_scale: Uint128;
  premium_rate: Decimal256;
  product_snapshot: Decimal256;
  sum_snapshot: Decimal256;
  total_bid_amount: Uint256;
}
export interface BidPoolsResponse {
  bid_pools: BidPoolResponse[];
}
export interface BidsResponse {
  bids: BidResponse[];
}
export interface CollateralInfoResponse {
  bid_threshold: Uint256;
  collateral_token: string;
  max_slot: number;
  premium_rate_per_slot: Decimal256;
}
export interface ConfigResponse {
  bid_fee: Decimal256;
  control_contract: string;
  liquidation_threshold: Uint256;
  liquidator_fee: Decimal256;
  oracle_contract: string;
  owner: string;
  price_timeframe: number;
  safe_ratio: Decimal256;
  stable_denom: string;
  waiting_period: number;
}
export interface LiquidationAmountResponse {
  collaterals: [string, Uint256][];
}
export type LiquidationQueueExecuteMsg = ExecuteMsg;