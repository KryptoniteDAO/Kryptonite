/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  box_config: BoxRewardConfig;
  gov?: Addr | null;
  nft_contract: Addr;
}
export interface BoxRewardConfig {
  box_open_time: number;
  box_reward_distribute_addr: Addr;
  box_reward_distribute_rule_type: string;
  box_reward_token: Addr;
  global_reward_total_amount: number;
  ordinary_box_reward_level_config: {
    [k: string]: OrdinaryBoxRewardLevelConfig;
  };
  [k: string]: unknown;
}
export interface OrdinaryBoxRewardLevelConfig {
  max_reward_count: number;
  reward_amount: number;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  mint_receive: Cw20MintReceiveMsg;
} | {
  update_reward_config: {
    gov?: Addr | null;
    nft_contract?: Addr | null;
  };
} | {
  update_box_reward_config: {
    box_open_time?: number | null;
    box_reward_token?: Addr | null;
  };
} | {
  open_blind_box: {
    token_ids: string[];
  };
} | {
  user_claim_nft_reward: {
    token_ids: string[];
  };
};
export type Uint128 = string;
export type Binary = string;
export interface Cw20MintReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
}
export type QueryMsg = {
  query_all_config_and_state: {};
} | {
  query_box_open_info: {
    token_ids: string[];
  };
} | {
  query_box_claimable_infos: {
    token_ids: string[];
  };
};
export interface AllConfigAndStateResponse {
  box_config: BoxRewardConfig;
  box_state: BoxRewardConfigState;
  config: RewardConfig;
  [k: string]: unknown;
}
export interface BoxRewardConfigState {
  global_reward_claim_index: number;
  global_reward_claim_total_amount: number;
  ordinary_box_reward_level_config_state: {
    [k: string]: OrdinaryBoxRewardLevelConfigState;
  };
  ordinary_total_open_box_count: number;
  ordinary_total_reward_amount: number;
  [k: string]: unknown;
}
export interface OrdinaryBoxRewardLevelConfigState {
  total_open_box_count: number;
  total_reward_amount: number;
  [k: string]: unknown;
}
export interface RewardConfig {
  gov: Addr;
  nft_contract: Addr;
  [k: string]: unknown;
}
export interface QueryBoxClaimableInfoResponse {
  box_claimable_infos: BoxClaimableAmountInfoResponse[];
  next_reward_claim_index: number;
  total_claimable_amount: number;
  total_claimable_distribute_amount: number;
  [k: string]: unknown;
}
export interface BoxClaimableAmountInfoResponse {
  claimable_amount: number;
  token_id: string;
  [k: string]: unknown;
}
export type ArrayOfBoxOpenInfoResponse = BoxOpenInfoResponse[];
export interface BoxOpenInfoResponse {
  box_level_index: number;
  is_reward_box: boolean;
  open_box_time: number;
  open_reward_amount: number;
  open_user: Addr;
  token_id: string;
  [k: string]: unknown;
}
export type BlindBoxRewardExecuteMsg = ExecuteMsg;