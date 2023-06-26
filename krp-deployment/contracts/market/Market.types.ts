/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Decimal256 = string;
export type Uint256 = string;
export interface BorrowerInfoResponse {
  borrower: string;
  interest_index: Decimal256;
  loan_amount: Uint256;
  pending_rewards: Decimal256;
  reward_index: Decimal256;
  [k: string]: unknown;
}
export interface BorrowerInfosResponse {
  borrower_infos: BorrowerInfoResponse[];
  [k: string]: unknown;
}
export interface ConfigResponse {
  atoken_contract: string;
  collector_contract: string;
  contract_addr: string;
  distribution_model: string;
  distributor_contract: string;
  interest_model: string;
  max_borrow_factor: Decimal256;
  overseer_contract: string;
  owner_addr: string;
  stable_denom: string;
  [k: string]: unknown;
}
export type Cw20HookMsg = {
  redeem_stable: {
    [k: string]: unknown;
  };
} | {
  deposit_stable: {
    [k: string]: unknown;
  };
} | {
  repay_stable: {
    [k: string]: unknown;
  };
};
export interface EpochStateResponse {
  atoken_supply: Uint256;
  exchange_rate: Decimal256;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  receive: Cw20ReceiveMsg;
} | {
  register_contracts: {
    collector_contract: string;
    distribution_model: string;
    distributor_contract: string;
    interest_model: string;
    overseer_contract: string;
    [k: string]: unknown;
  };
} | {
  update_config: {
    distribution_model?: string | null;
    interest_model?: string | null;
    max_borrow_factor?: Decimal256 | null;
    owner_addr?: string | null;
    [k: string]: unknown;
  };
} | {
  repay_stable_from_liquidation: {
    borrower: string;
    prev_balance: Uint256;
    [k: string]: unknown;
  };
} | {
  execute_epoch_operations: {
    deposit_rate: Decimal256;
    distributed_interest: Uint256;
    target_deposit_rate: Decimal256;
    threshold_deposit_rate: Decimal256;
    [k: string]: unknown;
  };
} | {
  deposit_stable: {
    [k: string]: unknown;
  };
} | {
  borrow_stable: {
    borrow_amount: Uint256;
    to?: string | null;
    [k: string]: unknown;
  };
} | {
  repay_stable: {
    [k: string]: unknown;
  };
} | {
  claim_rewards: {
    to?: string | null;
    [k: string]: unknown;
  };
};
export type Uint128 = string;
export type Binary = string;
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
}
export interface InstantiateMsg {
  anc_emission_rate: Decimal256;
  atoken_code_id: number;
  max_borrow_factor: Decimal256;
  owner_addr: string;
  stable_denom: string;
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
  state: {
    block_height?: number | null;
    [k: string]: unknown;
  };
} | {
  epoch_state: {
    block_height?: number | null;
    distributed_interest?: Uint256 | null;
    [k: string]: unknown;
  };
} | {
  borrower_info: {
    block_height?: number | null;
    borrower: string;
    [k: string]: unknown;
  };
} | {
  borrower_infos: {
    limit?: number | null;
    start_after?: string | null;
    [k: string]: unknown;
  };
};
export interface State {
  anc_emission_rate: Decimal256;
  global_interest_index: Decimal256;
  global_reward_index: Decimal256;
  last_interest_updated: number;
  last_reward_updated: number;
  prev_atoken_supply: Uint256;
  prev_exchange_rate: Decimal256;
  total_liabilities: Decimal256;
  total_reserves: Decimal256;
  [k: string]: unknown;
}
export type MarketExecuteMsg = ExecuteMsg;