/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export type Uint256 = string;
export interface InstantiateMsg {
  claim_token: Addr;
  duration_per_period: number;
  gov?: Addr | null;
  periods: number;
  start_lock_period_time: number;
  total_lock_amount: Uint256;
}
export type ExecuteMsg = {
  update_config: UpdateGlobalConfigMsg;
} | {
  add_user: AddUserMsg[];
} | {
  user_claim: {};
} | {
  set_gov: {
    gov: Addr;
  };
} | {
  accept_gov: {};
};
export interface UpdateGlobalConfigMsg {
  claim_token?: Addr | null;
  start_lock_period_time?: number | null;
  total_lock_amount?: Uint256 | null;
}
export interface AddUserMsg {
  lock_amount: Uint256;
  replace: boolean;
  user: Addr;
}
export type QueryMsg = {
  query_global_config: {};
} | {
  query_user_info: {
    user: Addr;
  };
} | {
  query_user_infos: {
    limit?: number | null;
    start_after?: Addr | null;
  };
};
export interface GlobalInfosResponse {
  config: GlobalConfig;
  state: GlobalState;
}
export interface GlobalConfig {
  claim_token: Addr;
  duration_per_period: number;
  gov: Addr;
  new_gov?: Addr | null;
  periods: number;
  start_lock_period_time: number;
  total_lock_amount: Uint256;
  [k: string]: unknown;
}
export interface GlobalState {
  total_user_claimed_lock_amount: Uint256;
  total_user_lock_amount: Uint256;
  [k: string]: unknown;
}
export interface UserInfoResponse {
  claimable_lock_amount: Uint256;
  current_period: number;
  state: UserState;
}
export interface UserState {
  claimed_lock_amount: Uint256;
  last_claimed_period: number;
  total_user_lock_amount: Uint256;
  user: Addr;
  user_per_lock_amount: Uint256;
  [k: string]: unknown;
}
export type ArrayOfUserInfoResponse = UserInfoResponse[];
export type DispatcherExecuteMsg = ExecuteMsg;