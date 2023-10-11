import type { Addr, Uint64, Uint128, Uint256, BaseContractConfig, ContractDeployed, Cw20InstantiateMsg } from "@/types";

export interface TokenContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    cw20_init_msg: Cw20InstantiateMsg;
    max_supply: string;
  };
}

export interface TokenFundContractConfig extends BaseContractConfig {
  initMsg?: {
    claim_able_time: Uint64;
    exit_cycle: Uint64;
    gov?: Addr | null;
    kusd_denom: string;
    kusd_reward_addr: Addr;
    seilor_addr?: Addr;
    ve_seilor_addr?: Addr;
  };
}

export interface TokenVeSeilorContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    cw20_init_msg: Cw20InstantiateMsg;
    max_supply: string;
    max_minted: string;
  };
}

export interface VeSeilorLockSetting {
  duration: Uint128;
  mining_boost: Uint128;
}

export interface TokenBoostContractConfig extends BaseContractConfig {
  initMsg?: {
    gov?: Addr;
    ve_seilor_lock_settings: VeSeilorLockSetting[];
  };
}

export interface TokenTreasureContractConfig extends BaseContractConfig {
  initMsg?: {
    dust_reward_per_second: Uint128;
    end_lock_time: number;
    gov?: Addr | null;
    lock_token: Addr | null;
    mint_nft_cost_dust: Uint128;
    mod_num: number;
    nft_end_pre_mint_time: number;
    nft_start_pre_mint_time: number;
    no_delay_punish_coefficient: Uint128;
    punish_receiver: Addr | null;
    start_lock_time: number;
    winning_num: number[];
    withdraw_delay_duration: number;
  };
}

export interface TokenStakingContractConfig extends BaseContractConfig {
  initMsg?: {
    boost?: Addr;
    duration: Uint128;
    fund?: Addr;
    gov?: Addr | null;
    reward_controller_addr?: Addr;
    rewards_token?: Addr;
    staking_token?: Addr;
  };
}

export interface TokenStakingPairsConfig {
  name?: string;
  staking_token?: Addr;
  pool_address?: Addr;
  staking?: TokenStakingContractConfig;
}

export interface TokenDistributeRuleConfig {
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

export interface TokenDistributeContractConfig extends BaseContractConfig {
  initMsg?: {
    distribute_token?: Addr;
    gov?: Addr | null;
    total_amount: string;
    rule_configs_map: Record<string, TokenDistributeRuleConfig>;
  };
}

export interface TokenDispatcherContractConfig extends BaseContractConfig {
  initMsg?: {
    claim_token: Addr;
    duration_per_period: number;
    gov?: Addr | null;
    periods: number;
    start_lock_period_time: number;
    total_lock_amount: Uint256;
  };
}

export interface TokenKeeperContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr | null;
    threshold: Uint128;
    rewards_contract?: string;
    rewards_denom?: string;
  };
}

export interface TokenContractsConfig {
  kusd_reward_controller: Addr;
  boost?: TokenBoostContractConfig;
  dispatcher?: TokenDispatcherContractConfig;
  distribute?: TokenDistributeContractConfig;
  fund?: TokenFundContractConfig;
  keeper?: TokenKeeperContractConfig;
  seilor?: TokenContractConfig;
  veSeilor?: TokenVeSeilorContractConfig;
  treasure?: TokenTreasureContractConfig;
  stakingPairs?: TokenStakingPairsConfig[];
}

export interface TokenStakingPairsContractsDeployed {
  name?: string;
  staking_token?: Addr;
  pool_address?: Addr;
  staking?: ContractDeployed;
}

export interface TokenContractsDeployed {
  boost?: ContractDeployed;
  dispatcher?: ContractDeployed;
  distribute?: ContractDeployed;
  fund?: ContractDeployed;
  keeper?: ContractDeployed;
  seilor?: ContractDeployed;
  veSeilor?: ContractDeployed;
  treasure?: ContractDeployed;
  stakingPairs?: TokenStakingPairsContractsDeployed[];
}
