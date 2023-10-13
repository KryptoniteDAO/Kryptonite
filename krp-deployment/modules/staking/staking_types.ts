import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";
import { InitialBalance } from "@/types";

export interface HubContractConfig extends BaseContractConfig {
  initMsg?: {
    epoch_period: number;
    er_threshold: string;
    peg_recovery_fee: string;
    unbonding_period: number;
  };
}

export interface RewardContractConfig extends BaseContractConfig {
  initMsg?: {
    owner: string;
  };
}

export interface BSeiTokenContractConfig extends BaseContractConfig {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
  };
}

export interface RewardsDispatcherContractConfig extends BaseContractConfig {
  initMsg?: {
    krp_keeper_address: string;
    krp_keeper_rate: string;
  };
}

export interface RegistryConfig {
  active: boolean;
  total_delegated: string;
}

export interface ValidatorsRegistryContractConfig extends BaseContractConfig {
  initMsg?: {
    registry: RegistryConfig[];
  };
}

export interface StSeiTokenContractConfig extends BaseContractConfig {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
  };
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
