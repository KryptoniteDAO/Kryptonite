/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  name: string;
  owner?: Addr | null;
  royalty_payment_address: Addr;
  royalty_percentage: number;
  sei_men_contract: Addr;
  symbol: string;
  token_code_id: number;
  token_uri: string;
}
export type ExecuteMsg = {
  update_config: {
    up_msg: UpdateConfigMsg;
  };
} | {
  mint: {
    sei_men_token_ids: string[];
  };
} | {
  update_ownership: Action;
};
export type Action = {
  transfer_ownership: {
    expiry?: Expiration | null;
    new_owner: string;
  };
} | "accept_ownership" | "renounce_ownership";
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export type Timestamp = Uint64;
export type Uint64 = string;
export interface UpdateConfigMsg {
  royalty_payment_address?: Addr | null;
  royalty_percentage?: number | null;
}
export type QueryMsg = {
  query_config: {};
} | {
  get_ownership: {};
} | {
  sei_men_token_claimed: {
    token_id: string;
  };
} | {
  sei_men_token_claimed_by: {
    token_id: string;
  };
} | {
  sei_men_tokens_claimed: {
    token_ids: string[];
  };
};
export interface OwnershipForAddr {
  owner?: Addr | null;
  pending_expiry?: Expiration | null;
  pending_owner?: Addr | null;
}
export interface Config {
  cw721_address: Addr;
  royalty_payment_address: Addr;
  royalty_percentage: number;
  sei_men_contract: Addr;
  token_uri: string;
  unused_token_id: number;
}
export type Boolean = boolean;
export interface MapOfBoolean {
  [k: string]: boolean;
}
export type MedalExecuteMsg = ExecuteMsg;