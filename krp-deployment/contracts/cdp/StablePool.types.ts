/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint256 = string;
export interface InstantiateMsg {
  control_contract: string;
  min_redeem_value: Uint256;
  owner_addr: string;
  sub_demon: string;
}
export type ExecuteMsg = {
  update_config: {
    control_contract?: string | null;
    min_redeem_value?: Uint256 | null;
    owner_addr?: string | null;
  };
} | {
  mint_stable_coin: {
    minter: string;
    stable_amount: Uint128;
  };
} | {
  repay_stable_coin: {};
} | {
  redeem_stable_coin: {
    minter: string;
  };
} | {
  repay_stable_from_liquidation: {
    minter: string;
    pre_balance: Uint256;
  };
};
export type Uint128 = string;
export type QueryMsg = {
  config: {};
} | {
  state: {};
};
export interface ConfigResponse {
  control_contract: string;
  owner_addr: string;
  stable_denom: string;
}
export interface StateResponse {
  total_supply: Uint256;
}
export type StablePoolExecuteMsg = ExecuteMsg;