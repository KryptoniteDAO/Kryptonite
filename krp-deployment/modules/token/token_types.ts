import type { InstantiateMsg as TokenBoostInstantiateMsg } from "@/contracts/token/Boost.types";
import type { InstantiateMsg as TokenDispatcherInstantiateMsg } from "@/contracts/token/Dispatcher.types";
import type { InstantiateMsg as TokenDistributeInstantiateMsg } from "@/contracts/token/Distribute.types";
import type { InstantiateMsg as TokenFundInstantiateMsg } from "@/contracts/token/Fund.types";
import type { InstantiateMsg as TokenKeeperInstantiateMsg } from "@/contracts/token/Keeper.types";
import type { InstantiateMsg as TokenPlatTokenInstantiateMsg } from "@/contracts/token/Seilor.types";
import type { InstantiateMsg as TokenStakingInstantiateMsg } from "@/contracts/token/Staking.types";
import type { InstantiateMsg as TokenTreasureInstantiateMsg } from "@/contracts/token/Treasure.types";
import type { InstantiateMsg as TokenVeTokenInstantiateMsg } from "@/contracts/token/VeSeilor.types";
import type { FeedInfo } from "@/modules";
import type { Addr, AssetInfo, BaseContractConfig, ContractDeployed, Uint128 } from "@/types";

export interface TokenPlatTokenContractConfig extends BaseContractConfig {
  initMsg?: TokenPlatTokenInstantiateMsg;
}

export interface TokenFundContractConfig extends BaseContractConfig {
  initMsg?: TokenFundInstantiateMsg;
}

export interface TokenVeTokenContractConfig extends BaseContractConfig {
  initMsg?: TokenVeTokenInstantiateMsg;
}

export interface VeTokenLockSetting {
  duration: Uint128;
  mining_boost: Uint128;
}

export interface TokenBoostContractConfig extends BaseContractConfig {
  initMsg?: TokenBoostInstantiateMsg;
}

export interface TokenTreasureContractConfig extends BaseContractConfig {
  initMsg?: TokenTreasureInstantiateMsg;
}

export interface TokenStakingContractConfig extends BaseContractConfig {
  initMsg?: TokenStakingInstantiateMsg;
}

export interface TokenStakingPairsConfig {
  name?: string;
  staking_token?: Addr;
  pool_address?: Addr;
  assetInfos?: AssetInfo[];
  oracleFeedInfoConfigs?: FeedInfo[];
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
  initMsg?: TokenDistributeInstantiateMsg;
}

export interface TokenDispatcherContractConfig extends BaseContractConfig {
  initMsg?: TokenDispatcherInstantiateMsg;
}

export interface TokenKeeperContractConfig extends BaseContractConfig {
  initMsg?: TokenKeeperInstantiateMsg;
}

export interface TokenContractsConfig {
  usd_reward_controller: Addr;
  boost?: TokenBoostContractConfig;
  dispatcher?: TokenDispatcherContractConfig;
  distribute?: TokenDistributeContractConfig;
  fund?: TokenFundContractConfig;
  keeper?: TokenKeeperContractConfig;
  platToken?: TokenPlatTokenContractConfig;
  veToken?: TokenVeTokenContractConfig;
  treasure?: TokenTreasureContractConfig;
  stakingPairs?: TokenStakingPairsConfig[];
}

export interface TokenStakingPairsContractsDeployed {
  name?: string;
  staking_token?: Addr;
  pool_address?: Addr;
  assetInfos?: AssetInfo[];
  staking?: ContractDeployed;
}

export interface TokenContractsDeployed {
  boost?: ContractDeployed;
  dispatcher?: ContractDeployed;
  distribute?: ContractDeployed;
  fund?: ContractDeployed;
  keeper?: ContractDeployed;
  platToken?: ContractDeployed;
  veToken?: ContractDeployed;
  treasure?: ContractDeployed;
  stakingPairs?: TokenStakingPairsContractsDeployed[];
}
