import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";
import type { InstantiateMsg as StakingHubInstantiateMsg } from "@/contracts/staking/Hub.types";
import type { InstantiateMsg as StakingRewardInstantiateMsg } from "@/contracts/staking/Reward.types";
import type { InstantiateMsg as StakingRewardsDispatcherInstantiateMsg } from "@/contracts/staking/RewardsDispatcher.types";
import type { TokenInitMsg as StakingTokenBAssetsInstantiateMsg } from "@/contracts/staking/TokenBsei.types";
import type { TokenInitMsg as StakingTokenStAssetsInstantiateMsg } from "@/contracts/staking/TokenStsei.types";
import type { InstantiateMsg as StakingValidatorsRegistryInstantiateMsg } from "@/contracts/staking/ValidatorsRegistry.types";

export interface HubContractConfig extends BaseContractConfig {
  initMsg?: StakingHubInstantiateMsg;
}

export interface RewardContractConfig extends BaseContractConfig {
  initMsg?: StakingRewardInstantiateMsg
}

export interface BAssetsTokenContractConfig extends BaseContractConfig {
  initMsg?: StakingTokenBAssetsInstantiateMsg
}

export interface RewardsDispatcherContractConfig extends BaseContractConfig {
  initMsg?: StakingRewardsDispatcherInstantiateMsg
}

export interface ValidatorsRegistryContractConfig extends BaseContractConfig {
  initMsg?: StakingValidatorsRegistryInstantiateMsg
}

export interface StAssetsTokenContractConfig extends BaseContractConfig {
  initMsg?: StakingTokenStAssetsInstantiateMsg
}

export interface StakingContractsConfig {
  readonly validators: Addr[];
  hub: HubContractConfig;
  reward: RewardContractConfig;
  bAssetsToken: BAssetsTokenContractConfig;
  rewardsDispatcher: RewardsDispatcherContractConfig;
  validatorsRegistry: ValidatorsRegistryContractConfig;
  stAssetsToken: StAssetsTokenContractConfig;
}

export interface StakingContractsDeployed {
  hub?: ContractDeployed;
  reward?: ContractDeployed;
  bAssetsToken?: ContractDeployed;
  rewardsDispatcher?: ContractDeployed;
  validatorsRegistry?: ContractDeployed;
  stAssetsToken?: ContractDeployed;
}
