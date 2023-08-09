/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.33.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint128 = string;
export interface InstantiateMsg {
  owner: string;
  rewards_contract: string;
  rewards_denom: string;
  threshold: Uint128;
}
export type ExecuteMsg = {
  update_config: {
    owner?: string | null;
    rewards_contract?: string | null;
    rewards_denom?: string | null;
    threshold?: Uint128 | null;
  };
} | {
  distribute: {};
};
export type QueryMsg = {
  config: {};
} | {
  state: {};
};
export interface ConfigResponse {
  owner: string;
  rewards_contract: string;
  rewards_denom: string;
  threshold: Uint128;
}
export interface StateResponse {
  distributed_amount: Uint128;
  distributed_total: Uint128;
  update_time: Uint128;
}
export type KeeperExecuteMsg = ExecuteMsg;