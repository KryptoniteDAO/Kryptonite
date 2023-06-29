import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";
import { InitialBalance } from "@/types";

export interface KptContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    cw20_init_msg: {
      name: string;
      symbol: string;
      decimals: number;
      initial_balances: InitialBalance[];
    };
    max_supply: string;
  };
}

export interface KptFundContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    kusd_denom?: string;
    kusd_reward_addr?: string;
    exit_cycle?: string;
    claim_able_time?: string;
  };
}

export interface VeKptContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    cw20_init_msg: {
      name: string;
      symbol: string;
      decimals: number;
      initial_balances: InitialBalance[];
    };
    max_supply: string;
    max_minted: string;
  };
}

export interface VeKptBoostLockSettingConfig {
  duration: string;
  mining_boost: string;
}

export interface VeKptBoostContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    ve_kpt_lock_settings: VeKptBoostLockSettingConfig[];
  };
}

export interface VeKptMinerContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: string;
    // kusd_denom: string;
    // kusd_reward_addr: string;
    duration: string;
    lockdown_period: string;
    extra_rate?: string;
  };
}

export interface StakingRewardsContractConfig extends BaseContractConfig {
  initMsg?: {
    reward_controller_addr?: Addr;
    duration: string;
  };
}

export interface StakingRewardsPairsConfig {
  name?: string;
  staking_token?: Addr;
  stakingRewards?: StakingRewardsContractConfig;
}

export interface BlindBoxLevelMsgConfig {
  mint_total_count: number;
  price: number;
}

export interface BlindBoxContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr | null;
    level_infos?: BlindBoxLevelMsgConfig[] | null;
    name: string;
    nft_base_url: string;
    nft_uri_suffix: string;
    price_token: string;
    start_mint_time?: number | null;
    symbol: string;
    token_id_prefix: string;
  };
}

export interface RewardLevelConfigMsgConfig {
  reward_amount?: number | null;
}

export interface RewardTokenConfigMsgConfig {
  claimable_time?: number | null;
  reward_levels?: RewardLevelConfigMsgConfig[] | null;
  reward_token: string;
  total_reward_amount?: number | null;
}

export interface BlindBoxRewardContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr | null;
    // nft_contract: Addr;
    reward_token_map_msgs: RewardTokenConfigMsgConfig[];
  };
}

export interface KptContractsConfig {
  kpt?: KptContractConfig;
  kptFund?: KptFundContractConfig;
  veKpt?: VeKptContractConfig;
  veKptBoost?: VeKptBoostContractConfig;
  veKptMiner?: VeKptMinerContractConfig;
  stakingRewardsPairs?: StakingRewardsPairsConfig[];
  blindBox?: BlindBoxContractConfig;
  blindBoxReward?: BlindBoxRewardContractConfig;
}

export interface StakingRewardsPairsContractsDeployed {
  name?: string;
  staking_token?: string;
  stakingRewards?: ContractDeployed;
}

export interface KptContractsDeployed {
  kpt?: ContractDeployed;
  kptFund?: ContractDeployed;
  veKpt?: ContractDeployed;
  veKptBoost?: ContractDeployed;
  veKptMiner?: ContractDeployed;
  stakingRewardsPairs?: StakingRewardsPairsContractsDeployed[];
  blindBox?: ContractDeployed;
  blindBoxReward?: ContractDeployed;
}

export type KptStakingRewardsConfig = {
  name?: string;
  staking_token: string;
  duration: string;
};
