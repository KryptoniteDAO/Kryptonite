/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  can_transfer_time?: number | null;
  end_mint_time?: number | null;
  gov?: Addr | null;
  level_infos?: BlindBoxLevelMsg[] | null;
  name: string;
  nft_base_url: string;
  nft_uri_suffix: string;
  price_token: string;
  receiver_price_addr: Addr;
  referral_reward_config?: ReferralRewardConfigMsg | null;
  start_mint_time?: number | null;
  symbol: string;
  token_id_prefix: string;
}
export interface BlindBoxLevelMsg {
  is_random_box: boolean;
  mint_total_count: number;
  price: number;
}
export interface ReferralRewardConfigMsg {
  referral_level_config: {
    [k: string]: ReferralLevelConfig;
  };
  reward_token_config?: {
    [k: string]: ReferralRewardTokenConfig;
  } | null;
}
export interface ReferralLevelConfig {
  invitee_discount_rate: number;
  inviter_reward_rate: number;
  max_referral_total_amount: number;
  min_referral_total_amount: number;
  reward_box_config: ReferralLevelRewardBoxConfig;
  [k: string]: unknown;
}
export interface ReferralLevelRewardBoxConfig {
  recommended_quantity: number;
  reward_box: {
    [k: string]: number;
  };
  [k: string]: unknown;
}
export interface ReferralRewardTokenConfig {
  conversion_ratio: number;
  reward_token: string;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  update_config: {
    can_transfer_time?: number | null;
    end_mint_time?: number | null;
    gov?: string | null;
    inviter_reward_box_contract?: Addr | null;
    nft_base_url?: string | null;
    nft_uri_suffix?: string | null;
    price_token?: string | null;
    receiver_price_addr?: Addr | null;
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
  update_reward_token_config: {
    conversion_ratio: number;
    reward_token: string;
    reward_token_type: string;
  };
} | {
  update_referral_level_config: {
    referral_level_config_msg: ReferralLevelConfigMsg;
  };
} | {
  update_referral_level_box_config: {
    level_reward_box_config_msg: ReferralLevelRewardBoxConfigMsg;
  };
} | {
  create_referral_info: {
    referral_code: string;
    reward_token_type: string;
  };
} | {
  modify_reward_token_type: {
    reward_token_type: string;
  };
} | {
  do_inviter_reward_mint: {
    inviter: Addr;
    level_index: number;
    mint_num: number;
  };
} | {
  mint: {
    level_index: number;
    mint_num: number;
    recipient?: string | null;
    referral_code?: string | null;
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
export interface ReferralLevelConfigMsg {
  invitee_discount_rate?: number | null;
  inviter_reward_rate?: number | null;
  max_referral_total_amount?: number | null;
  min_referral_total_amount?: number | null;
  referral_level: number;
}
export interface ReferralLevelRewardBoxConfigMsg {
  recommended_quantity?: number | null;
  referral_level: number;
  reward_box?: {
    [k: string]: number;
  } | null;
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
  query_blind_box_config: {};
} | {
  query_blind_box_config_level: {
    index: number;
  };
} | {
  query_blind_box_info: {
    token_id: string;
  };
} | {
  query_blind_box_infos: {
    token_ids: string[];
  };
} | {
  query_all_referral_reward_config: {};
} | {
  query_inviter_records: {
    inviter: Addr;
    limit?: number | null;
    start_after?: Addr | null;
  };
} | {
  cal_mint_info: {
    level_index: number;
    mint_num: Uint128;
    referral_code?: string | null;
  };
} | {
  check_referral_code: {
    referral_code: string;
  };
} | {
  get_user_info: {
    user: Addr;
  };
};
export type Uint128 = string;
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
export interface CalMintInfoResponse {
  current_inviter_reward_level?: number | null;
  inviter?: Addr | null;
  mint_discount_rate: Uint128;
  next_inviter_reward_level?: number | null;
  paid_amount: Uint128;
  price: Uint128;
}
export interface CheckReferralCodeResponse {
  exists: boolean;
  user: Addr;
}
export interface ContractInfoResponse {
  name: string;
  symbol: string;
}
export interface UserInfoResponse {
  current_reward_level: number;
  invitee_count: number;
  inviter: Addr;
  inviter_referral_code: string;
  last_mint_discount_rate: number;
  referral_code: string;
  user_referral_level_count: {
    [k: string]: number;
  };
  user_referral_total_amount: number;
  user_reward_box: {
    [k: string]: number;
  };
  user_reward_token_type: string;
  user_reward_total_base_amount: number;
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
export interface ReferralRewardConfigResponse {
  referral_level_config: {
    [k: string]: ReferralLevelConfigResponse;
  };
  referral_reward_box_total: {
    [k: string]: number;
  };
  referral_reward_total_base_amount: number;
  reward_token_config: {
    [k: string]: ReferralRewardTokenConfigResponse;
  };
}
export interface ReferralLevelConfigResponse {
  invitee_discount_rate: number;
  inviter_reward_rate: number;
  max_referral_total_amount: number;
  min_referral_total_amount: number;
  reward_box_config: ReferralLevelRewardBoxConfigResponse;
}
export interface ReferralLevelRewardBoxConfigResponse {
  recommended_quantity: number;
  reward_box: {
    [k: string]: number;
  };
}
export interface ReferralRewardTokenConfigResponse {
  conversion_ratio: number;
  reward_token: string;
}
export interface BlindBoxConfigResponse {
  can_transfer_time: number;
  gov: string;
  inviter_reward_box_contract: Addr;
  level_infos: BlindBoxConfigLevelResponse[];
  nft_base_url: string;
  nft_uri_suffix: string;
  price_token: string;
  receiver_price_addr: Addr;
  start_mint_time: number;
  token_id_index: number;
  token_id_prefix: string;
}
export interface BlindBoxConfigLevelResponse {
  level_index: number;
  mint_total_count: number;
  minted_count: number;
  price: number;
  received_total_amount: number;
}
export interface BlindBoxInfoResponse {
  block_number: number;
  is_random_box: boolean;
  is_reward_box: boolean;
  level_index: number;
  price: number;
}
export type ArrayOfBlindBoxInfoResponse = BlindBoxInfoResponse[];
export interface InviterReferralRecordResponse {
  invitee: Addr;
  invitee_index: number;
  mint_box_level_index: number;
  mint_pay_amount: number;
  mint_price: number;
  mint_time: number;
  reward_level: number;
  reward_to_inviter_base_amount: number;
  token_ids: string[];
}
export type BlindBoxExecuteMsg = ExecuteMsg;