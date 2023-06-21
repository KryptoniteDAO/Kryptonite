/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  gov?: Addr | null;
  level_infos?: BlindBoxLevelMsg[] | null;
  name: string;
  nft_base_url: string;
  nft_uri_suffix: string;
  price_token: string;
  start_mint_time?: number | null;
  symbol: string;
  token_id_prefix: string;
}
export interface BlindBoxLevelMsg {
  mint_total_count: number;
  price: number;
}
export type ExecuteMsg = {
  update_config: {
    gov?: string | null;
    nft_base_url?: string | null;
    nft_uri_suffix?: string | null;
    price_token?: string | null;
    start_mint_time?: number | null;
    token_id_prefix?: string | null;
  };
} | {
  update_config_level: {
    index: number;
    mint_total_count?: number | null;
    price?: number | null;
  };
} | {
  mint: {
    level_index: number;
    recipient?: string | null;
  };
} | {
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
  burn: {
    token_id: string;
  };
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
  query_blind_box_config: {};
} | {
  query_blind_box_config_level: {
    index: number;
  };
} | {
  query_blind_box_info: {
    token_id: string;
  };
};
export interface AllNftInfoResponseForNullable_Empty {
  access: OwnerOfResponse;
  info: NftInfoResponseForNullable_Empty;
}
export interface OwnerOfResponse {
  approvals: Approval[];
  owner: string;
}
export interface Approval {
  expires: Expiration;
  spender: string;
}
export interface NftInfoResponseForNullable_Empty {
  extension?: Empty | null;
  token_uri?: string | null;
}
export interface Empty {
  [k: string]: unknown;
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
export interface MinterResponse {
  minter?: string | null;
}
export interface NumTokensResponse {
  count: number;
}
export interface OperatorResponse {
  approval: Approval;
}
export interface BlindBoxConfigResponse {
  gov: string;
  nft_base_url: string;
  nft_uri_suffix: string;
  price_token: string;
  start_mint_time: number;
  token_id_index: number;
  token_id_prefix: string;
}
export interface BlindBoxConfigLevelResponse {
  mint_total_count: number;
  minted_count: number;
  price: number;
}
export interface BlindBoxInfoResponse {
  block_number: number;
  level_index: number;
  price: number;
}
export type BlindBoxExecuteMsg = ExecuteMsg;