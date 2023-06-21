/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  gov?: Addr | null;
  nft_contract: Addr;
  reward_token_map_msgs: RewardTokenConfigMsg[];
}
export interface RewardTokenConfigMsg {
  claimable_time?: number | null;
  reward_levels?: RewardLevelConfigMsg[] | null;
  reward_token: string;
  total_reward_amount?: number | null;
}
export interface RewardLevelConfigMsg {
  reward_amount?: number | null;
}
export type ExecuteMsg = {
  update_blind_box_config: {
    gov?: Addr | null;
    nft_contract?: Addr | null;
  };
} | {
  update_blind_box_reward_token_config: {
    claimable_time: number;
    reward_token: Addr;
    total_reward_amount: number;
  };
} | {
  update_reward_token_reward_level: {
    reward_amount: number;
    reward_level: number;
    reward_token: Addr;
  };
} | {
  claim_reward: {
    recipient?: Addr | null;
  };
};
export type QueryMsg = {
  query_user_claim_rewards: {
    user_addr: Addr;
  };
} | {
  query_blind_box_config: {};
};
export interface BlindBoxConfigResponse {
  gov: Addr;
  nft_contract: Addr;
  reward_token_map_msgs: RewardTokenConfigResponse[];
}
export interface RewardTokenConfigResponse {
  claimable_time: number;
  reward_levels: RewardLevelConfigResponse[];
  reward_token: string;
  total_claimed_amount: number;
  total_claimed_count: number;
  total_reward_amount: number;
}
export interface RewardLevelConfigResponse {
  level_total_claimed_amount: number;
  reward_amount: number;
}
export type ArrayOfUserClaimableRewardsResponse = UserClaimableRewardsResponse[];
export interface UserClaimableRewardsResponse {
  claimable_reward: number;
  claimable_reward_details: UserClaimableRewardDetailResponse[];
  reward_token: string;
}
export interface UserClaimableRewardDetailResponse {
  claimable_reward: number;
  level_index: number;
}
export type BlindBoxRewardExecuteMsg = ExecuteMsg;