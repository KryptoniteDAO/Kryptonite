/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export interface InstantiateMsg {
  minter: string;
  name: string;
  symbol: string;
  withdraw_address?: string | null;
}
export type ExecuteMsg = {
  transfer_nft: {
    recipient: string;
    token_id: string;
  };
} | {
  send_nft: {
    contract: string;
    msg: Binary;
    token_id: string;
  };
} | {
  approve: {
    expires?: Expiration | null;
    spender: string;
    token_id: string;
  };
} | {
  revoke: {
    spender: string;
    token_id: string;
  };
} | {
  approve_all: {
    expires?: Expiration | null;
    operator: string;
  };
} | {
  revoke_all: {
    operator: string;
  };
} | {
  mint: {
    extension?: Metadata | null;
    owner: string;
    token_id: string;
    token_uri?: string | null;
  };
} | {
  burn: {
    token_id: string;
  };
} | {
  extension: {
    msg: Empty;
  };
} | {
  set_withdraw_address: {
    address: string;
  };
} | {
  remove_withdraw_address: {};
} | {
  withdraw_funds: {
    amount: Coin;
  };
} | {
  update_ownership: Action;
};
export type Binary = string;
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export type Timestamp = Uint64;
export type Uint64 = string;
export type Uint128 = string;
export type Action = {
  transfer_ownership: {
    expiry?: Expiration | null;
    new_owner: string;
  };
} | "accept_ownership" | "renounce_ownership";
export interface Metadata {
  animation_url?: string | null;
  attributes?: Trait[] | null;
  background_color?: string | null;
  description?: string | null;
  external_url?: string | null;
  image?: string | null;
  image_data?: string | null;
  name?: string | null;
  royalty_payment_address?: string | null;
  royalty_percentage?: number | null;
  youtube_url?: string | null;
}
export interface Trait {
  display_type?: string | null;
  trait_type: string;
  value: string;
}
export interface Empty {
  [k: string]: unknown;
}
export interface Coin {
  amount: Uint128;
  denom: string;
  [k: string]: unknown;
}
export type QueryMsg = {
  owner_of: {
    include_expired?: boolean | null;
    token_id: string;
  };
} | {
  approval: {
    include_expired?: boolean | null;
    spender: string;
    token_id: string;
  };
} | {
  approvals: {
    include_expired?: boolean | null;
    token_id: string;
  };
} | {
  operator: {
    include_expired?: boolean | null;
    operator: string;
    owner: string;
  };
} | {
  all_operators: {
    include_expired?: boolean | null;
    limit?: number | null;
    owner: string;
    start_after?: string | null;
  };
} | {
  num_tokens: {};
} | {
  contract_info: {};
} | {
  nft_info: {
    token_id: string;
  };
} | {
  all_nft_info: {
    include_expired?: boolean | null;
    token_id: string;
  };
} | {
  tokens: {
    limit?: number | null;
    owner: string;
    start_after?: string | null;
  };
} | {
  all_tokens: {
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  minter: {};
} | {
  extension: {
    msg: Cw2981QueryMsg;
  };
} | {
  get_withdraw_address: {};
} | {
  ownership: {};
};
export type Cw2981QueryMsg = {
  royalty_info: {
    sale_price: Uint128;
    token_id: string;
  };
} | {
  check_royalties: {};
};
export interface AllNftInfoResponseForCw2981QueryMsg {
  access: OwnerOfResponse;
  info: NftInfoResponseForCw2981QueryMsg;
}
export interface OwnerOfResponse {
  approvals: Approval[];
  owner: string;
}
export interface Approval {
  expires: Expiration;
  spender: string;
}
export interface NftInfoResponseForCw2981QueryMsg {
  extension: Cw2981QueryMsg;
  token_uri?: string | null;
}
export interface OperatorsResponse {
  operators: Approval[];
}
export interface TokensResponse {
  tokens: string[];
}
export interface ApprovalResponse {
  approval: Approval;
}
export interface ApprovalsResponse {
  approvals: Approval[];
}
export interface ContractInfoResponse {
  name: string;
  symbol: string;
}
export type Null = null;
export type NullableString = string | null;
export interface MinterResponse {
  minter?: string | null;
}
export interface NumTokensResponse {
  count: number;
}
export interface OperatorResponse {
  approval: Approval;
}
export interface OwnershipForString {
  owner?: string | null;
  pending_expiry?: Expiration | null;
  pending_owner?: string | null;
}
export type Cw2981RoyaltiesExecuteMsg = ExecuteMsg;