/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export type Uint128 = string;
export interface InstantiateMsg {
  gov?: Addr | null;
  ve_seilor_lock_settings: VeSeilorLockSetting[];
}
export interface VeSeilorLockSetting {
  duration: Uint128;
  mining_boost: Uint128;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  add_lock_setting: {
    duration: Uint128;
    mining_boost: Uint128;
  };
} | {
  set_gov: {
    gov: Addr;
  };
} | {
  accept_gov: {};
} | {
  set_lock_status: {
    index: number;
  };
};
export type QueryMsg = {
  get_unlock_time: {
    user: Addr;
  };
} | {
  get_user_lock_status: {
    user: Addr;
  };
} | {
  get_user_boost: {
    finish_at: Uint128;
    user: Addr;
    user_updated_at: Uint128;
  };
} | {
  get_boost_config: {};
};
export interface GetBoostConfigResponse {
  gov: Addr;
  new_gov?: Addr | null;
  ve_seilor_lock_settings: VeSeilorLockSetting[];
}
export interface GetUnlockTimeResponse {
  unlock_time: Uint128;
}
export interface GetUserBoostResponse {
  user_boost: Uint128;
}
export interface LockStatusResponse {
  duration: Uint128;
  mining_boost: Uint128;
  unlock_time: Uint128;
}
export type BoostExecuteMsg = ExecuteMsg;