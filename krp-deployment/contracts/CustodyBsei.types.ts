/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint256 = string;
export interface BorrowerResponse {
  balance: Uint256;
  borrower: string;
  spendable: Uint256;
  [k: string]: unknown;
}
export interface BorrowersResponse {
  borrowers: BorrowerResponse[];
  [k: string]: unknown;
}
export interface ConfigResponse {
  basset_info: BAssetInfo;
  collateral_token: string;
  liquidation_contract: string;
  market_contract: string;
  overseer_contract: string;
  owner: string;
  reward_contract: string;
  stable_denom: string;
  swap_contract?: string | null;
  swap_denoms?: string[] | null;
  [k: string]: unknown;
}
export interface BAssetInfo {
  decimals: number;
  name: string;
  symbol: string;
  [k: string]: unknown;
}
export type Cw20HookMsg = {
  deposit_collateral: {
    [k: string]: unknown;
  };
};
export type ExecuteMsg = {
  receive: Cw20ReceiveMsg;
} | {
  update_config: {
    liquidation_contract?: string | null;
    owner?: string | null;
    [k: string]: unknown;
  };
} | {
  lock_collateral: {
    amount: Uint256;
    borrower: string;
    [k: string]: unknown;
  };
} | {
  unlock_collateral: {
    amount: Uint256;
    borrower: string;
    [k: string]: unknown;
  };
} | {
  distribute_rewards: {
    [k: string]: unknown;
  };
} | {
  liquidate_collateral: {
    amount: Uint256;
    borrower: string;
    liquidator: string;
    [k: string]: unknown;
  };
} | {
  withdraw_collateral: {
    amount?: Uint256 | null;
    borrower: string;
    [k: string]: unknown;
  };
} | {
  update_swap_contract: {
    swap_contract: string;
    [k: string]: unknown;
  };
} | {
  update_swap_denom: {
    is_add: boolean;
    swap_denom: string;
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
  basset_info: BAssetInfo;
  collateral_token: string;
  liquidation_contract: string;
  market_contract: string;
  overseer_contract: string;
  owner: string;
  reward_contract: string;
  stable_denom: string;
  swap_contract: string;
  swap_denoms: string[];
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
  borrower: {
    address: string;
    [k: string]: unknown;
  };
} | {
  borrowers: {
    limit?: number | null;
    start_after?: string | null;
    [k: string]: unknown;
  };
};
export type CustodyBseiExecuteMsg = ExecuteMsg;