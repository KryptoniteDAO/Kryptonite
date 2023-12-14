/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export interface ConfigResponse {
  basset_token_address?: string | null;
  native_denom?: string | null;
  owner: string;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  receive: Cw20ReceiveMsg;
} | {
  register_tokens: {
    basset_token_address: string;
    denom_decimals: number;
    native_denom: string;
    [k: string]: unknown;
  };
} | {
  convert_native_to_basset: {
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
};
export type Uint128 = string;
export type Binary = string;
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
}
export interface InstantiateMsg {
  owner: string;
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
  new_owner: {
    [k: string]: unknown;
  };
};
export type BassetConverterExecuteMsg = ExecuteMsg;