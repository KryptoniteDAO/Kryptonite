import type { Addr, BaseContractConfig, ContractDeployed, InitialBalance } from "@/types";

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
    kusd_denom?: Addr;
    kusd_reward_addr?: Addr;
    exit_cycle: string;
    claim_able_time: string;
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
  pool_address?: Addr;
  stakingRewards?: StakingRewardsContractConfig;
}

export interface KptDistributeRuleConfig {
  rule_name: string;
  rule_owner?: Addr;
  rule_total_amount: string;
  start_release_amount: string;
  lock_start_time: number;
  lock_end_time: number;
  start_linear_release_time: number;
  unlock_linear_release_amount: string;
  unlock_linear_release_time: number;
}

export interface KptDistributeContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr | null;
    total_amount: string;
    rule_configs_map: Record<string, KptDistributeRuleConfig>;
  };
}

export interface KptContractsConfig {
  kusd_denom: Addr;
  kusd_reward_controller: Addr;
  kpt?: KptContractConfig;
  kptFund?: KptFundContractConfig;
  veKpt?: VeKptContractConfig;
  veKptBoost?: VeKptBoostContractConfig;
  veKptMiner?: VeKptMinerContractConfig;
  stakingRewardsPairs?: StakingRewardsPairsConfig[];
  kptDistribute?: KptDistributeContractConfig;
}

export interface StakingRewardsPairsContractsDeployed {
  name?: string;
  staking_token?: Addr;
  pool_address?: Addr;
  stakingRewards?: ContractDeployed;
}

export interface KptContractsDeployed {
  kpt?: ContractDeployed;
  kptFund?: ContractDeployed;
  veKpt?: ContractDeployed;
  veKptBoost?: ContractDeployed;
  veKptMiner?: ContractDeployed;
  stakingRewardsPairs?: StakingRewardsPairsContractsDeployed[];
  kptDistribute?: ContractDeployed;
}
