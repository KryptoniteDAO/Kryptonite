import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";

export interface BlindBoxLevelMsgConfig {
  mint_total_count: number;
  price: number;
  // is_random_box: boolean;
}
export interface BlindBoxRewardConfig {
  reward_token_config: Record<string, BlindBoxRewardTokenConfig>;
}
export interface BlindBoxRewardTokenConfig {
  reward_token: Addr;
  conversion_ratio: string;
}
export interface BlindBoxLevelRewardBoxConfig {
  recommended_quantity: string;
  reward_box: Record<string, number>;
}
export interface BlindBoxLevelConfig {
  min_referral_total_amount: string;
  max_referral_total_amount: string;
  inviter_reward_rate: string;
  invitee_discount_rate: string;
  reward_box_config: BlindBoxLevelRewardBoxConfig;
}

export interface BlindBoxContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    level_infos?: BlindBoxLevelMsgConfig[] | null;
    name: string;
    symbol: string;
    nft_base_url: string;
    nft_uri_suffix: string;
    price_token?: Addr;
    token_id_prefix: string;
    receiver_price_addr?: Addr;
    start_mint_time?: number | null;
    end_mint_time?: number | null;
    can_transfer_time?: number | null;
    // referral_reward_config?: BlindBoxRewardConfig;
    referral_level_config: BlindBoxLevelConfig;
  };
}

export interface RewardLevelConfigMsgConfig {
  reward_amount?: number | null;
}

// export interface RewardTokenConfigMsgConfig {
//   claimable_time?: number | null;
//   reward_levels?: RewardLevelConfigMsgConfig[] | null;
//   reward_token: string;
//   total_reward_amount?: number | null;
// }
export interface RewardBoxRewardLevelConfig {
  reward_amount: string;
  max_reward_count: string;
}
export interface RewardBoxRewardRuleConfig {
  random_box_index: number;
  random_total_count: number;
  random_reward_amount: string;
  max_reward_count: number;
}
export interface RewardBoxConfig {
  // box_reward_token: Addr;
  box_open_time: number;
  random_in_box_level_index: number;
  ordinary_box_reward_level_config: Record<string, RewardBoxRewardLevelConfig>;
  random_box_reward_rule_config: RewardBoxRewardRuleConfig[];
  box_reward_distribute_rule_type: string;
  global_reward_total_amount: string;
}

export interface BlindBoxRewardContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr | null;
    // nft_contract: Addr;
    // reward_token_map_msgs: RewardTokenConfigMsgConfig[];
    box_config: RewardBoxConfig;
  };
}

export interface BlindBoxInviterRewardContractConfig extends BaseContractConfig {
  initMsg?: {
    reward_native_token?: Addr;
    start_mint_box_time: number;
    end_mint_box_time: number;
    start_claim_token_time: number;
    end_claim_token_time: number;
  };
}

export interface BlindBoxContractsConfig {
  blindBox?: BlindBoxContractConfig;
  blindBoxReward?: BlindBoxRewardContractConfig;
  blindBoxInviterReward?: BlindBoxInviterRewardContractConfig;
}

export interface BlindBoxContractsDeployed {
  blindBox?: ContractDeployed;
  blindBoxReward?: ContractDeployed;
  blindBoxInviterReward?: ContractDeployed;
}
