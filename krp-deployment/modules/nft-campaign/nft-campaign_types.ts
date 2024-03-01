import { BaseContractConfig, ContractDeployed } from "@/types";

import type { InstantiateMsg as DragonPartInstantiateMsg } from "@/contracts/nft-campaign/DragonPart.types";
import type { InstantiateMsg as DragonsInstantiateMsg } from "@/contracts/nft-campaign/Dragons.types";
import type { InstantiateMsg as RandomInstantiateMsg } from "@/contracts/nft-campaign/Random.types";
import type { InstantiateMsg as RewardsPoolInstantiateMsg } from "@/contracts/nft-campaign/RewardsPool.types";
import type { InstantiateMsg as MedalInstantiateMsg } from "@/contracts/nft-campaign/Medal.types.ts";

import { TokenStakingOnlyPairsContractsDeployed, TokenStakingPairsContractsDeployed } from "@/modules";

export interface DragonPartContractConfig extends BaseContractConfig {
  initMsg?: DragonPartInstantiateMsg;
}


export interface DragonPartContractsDeployed {
  dragonPart?: ContractDeployed;
}


export interface DragonsContractConfig extends BaseContractConfig {
  initMsg?: DragonsInstantiateMsg;
}


export interface DragonsContractsDeployed {
  dragons?: ContractDeployed;
}


export interface RandomContractConfig extends BaseContractConfig {
  initMsg?: RandomInstantiateMsg;
}



export interface RandomContractsDeployed {
  random?: ContractDeployed;
}


export interface RewardsPoolContractConfig extends BaseContractConfig {
  initMsg?: RewardsPoolInstantiateMsg;
}


export interface RewardsPoolContractsDeployed {
  rewardsPool?: ContractDeployed;
}

export interface MedalContractConfig extends BaseContractConfig {
  initMsg?: MedalInstantiateMsg;
}

export interface MedalContractsDeployed {
  medal?: ContractDeployed;
}


export interface NftCampaignContractsConfig {
  dragonPart: DragonPartContractConfig;
  dragons: DragonsContractConfig;
  random: RandomContractConfig;
  rewardsPool: RewardsPoolContractConfig;
  medal: MedalContractConfig;
}


export interface NftCampaignContractsDeployed {
  dragonPart?: ContractDeployed;
  dragons?: ContractDeployed;
  random?: ContractDeployed;
  rewardsPool?: ContractDeployed;
  medal?: ContractDeployed;
}
