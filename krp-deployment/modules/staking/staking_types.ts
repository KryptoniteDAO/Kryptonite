import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";
import type { InitialBalance } from "@/types";
import type { InstantiateMsg as StakingHubInstantiateMsg } from "@/contracts/staking/Hub.types";
import type { InstantiateMsg as StakingRewardInstantiateMsg } from "@/contracts/staking/Reward.types";
import type { InstantiateMsg as StakingRewardsDispatcherInstantiateMsg } from "@/contracts/staking/RewardsDispatcher.types";
import type { TokenInitMsg as StakingTokenBseiInstantiateMsg } from "@/contracts/staking/TokenBsei.types";
import type { TokenInitMsg as StakingTokenStseiInstantiateMsg } from "@/contracts/staking/TokenStsei.types";
import type { InstantiateMsg as StakingValidatorsRegistryInstantiateMsg } from "@/contracts/staking/ValidatorsRegistry.types";

export interface HubContractConfig extends BaseContractConfig {
  initMsg?: StakingHubInstantiateMsg;
  // initMsg?: {
  //   epoch_period: number;
  //   er_threshold: string;
  //   peg_recovery_fee: string;
  //   unbonding_period: number;
  // };
}

export interface RewardContractConfig extends BaseContractConfig {
  initMsg?: StakingRewardInstantiateMsg
  // initMsg?: {
  //   owner: string;
  // };
}

export interface BSeiTokenContractConfig extends BaseContractConfig {
  initMsg?: StakingTokenBseiInstantiateMsg
  // initMsg?: {
  //   name: string;
  //   symbol: string;
  //   decimals: number;
  //   initial_balances: InitialBalance[];
  // };
}

export interface RewardsDispatcherContractConfig extends BaseContractConfig {
  initMsg?: StakingRewardsDispatcherInstantiateMsg
  // initMsg?: {
  //   krp_keeper_address: string;
  //   krp_keeper_rate: string;
  // };
}

export interface RegistryConfig {
  active: boolean;
  total_delegated: string;
}

export interface ValidatorsRegistryContractConfig extends BaseContractConfig {
  // initMsg?: StakingValidatorsRegistryInstantiateMsg
  initMsg?: {
    registry: RegistryConfig[];
  };
}

export interface StSeiTokenContractConfig extends BaseContractConfig {
  initMsg?: StakingTokenStseiInstantiateMsg
  // initMsg?: {
  //   name: string;
  //   symbol: string;
  //   decimals: number;
  //   initial_balances: InitialBalance[];
  // };
}

export interface StakingContractsConfig {
  readonly validator: Addr;
  hub: HubContractConfig;
  reward: RewardContractConfig;
  bSeiToken: BSeiTokenContractConfig;
  rewardsDispatcher: RewardsDispatcherContractConfig;
  validatorsRegistry: ValidatorsRegistryContractConfig;
  stSeiToken: StSeiTokenContractConfig;
}

export interface StakingContractsDeployed {
  hub?: ContractDeployed;
  reward?: ContractDeployed;
  bSeiToken?: ContractDeployed;
  rewardsDispatcher?: ContractDeployed;
  validatorsRegistry?: ContractDeployed;
  stSeiToken?: ContractDeployed;
}
