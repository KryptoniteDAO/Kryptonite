/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Addr, InstantiateMsg, RewardTokenConfigMsg, RewardLevelConfigMsg, ExecuteMsg, QueryMsg, BlindBoxConfigResponse, RewardTokenConfigResponse, RewardLevelConfigResponse, ArrayOfUserClaimableRewardsResponse, UserClaimableRewardsResponse, UserClaimableRewardDetailResponse } from "./BlindBoxReward.types";
export interface BlindBoxRewardReadOnlyInterface {
  contractAddress: string;
  queryUserClaimRewards: ({
    userAddr
  }: {
    userAddr: Addr;
  }) => Promise<ArrayOfUserClaimableRewardsResponse>;
  queryBlindBoxConfig: () => Promise<BlindBoxConfigResponse>;
}
export class BlindBoxRewardQueryClient implements BlindBoxRewardReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.queryUserClaimRewards = this.queryUserClaimRewards.bind(this);
    this.queryBlindBoxConfig = this.queryBlindBoxConfig.bind(this);
  }

  queryUserClaimRewards = async ({
    userAddr
  }: {
    userAddr: Addr;
  }): Promise<ArrayOfUserClaimableRewardsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_user_claim_rewards: {
        user_addr: userAddr
      }
    });
  };
  queryBlindBoxConfig = async (): Promise<BlindBoxConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_blind_box_config: {}
    });
  };
}
export interface BlindBoxRewardInterface {
  contractAddress: string;
  sender: string;
  updateBlindBoxConfig: ({
    gov,
    nftContract
  }: {
    gov?: Addr;
    nftContract?: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateBlindBoxRewardTokenConfig: ({
    claimableTime,
    rewardToken,
    totalRewardAmount
  }: {
    claimableTime: number;
    rewardToken: Addr;
    totalRewardAmount: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateRewardTokenRewardLevel: ({
    rewardAmount,
    rewardLevel,
    rewardToken
  }: {
    rewardAmount: number;
    rewardLevel: number;
    rewardToken: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  claimReward: ({
    recipient
  }: {
    recipient?: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class BlindBoxRewardClient implements BlindBoxRewardInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateBlindBoxConfig = this.updateBlindBoxConfig.bind(this);
    this.updateBlindBoxRewardTokenConfig = this.updateBlindBoxRewardTokenConfig.bind(this);
    this.updateRewardTokenRewardLevel = this.updateRewardTokenRewardLevel.bind(this);
    this.claimReward = this.claimReward.bind(this);
  }

  updateBlindBoxConfig = async ({
    gov,
    nftContract
  }: {
    gov?: Addr;
    nftContract?: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_blind_box_config: {
        gov,
        nft_contract: nftContract
      }
    }, fee, memo, _funds);
  };
  updateBlindBoxRewardTokenConfig = async ({
    claimableTime,
    rewardToken,
    totalRewardAmount
  }: {
    claimableTime: number;
    rewardToken: Addr;
    totalRewardAmount: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_blind_box_reward_token_config: {
        claimable_time: claimableTime,
        reward_token: rewardToken,
        total_reward_amount: totalRewardAmount
      }
    }, fee, memo, _funds);
  };
  updateRewardTokenRewardLevel = async ({
    rewardAmount,
    rewardLevel,
    rewardToken
  }: {
    rewardAmount: number;
    rewardLevel: number;
    rewardToken: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_reward_token_reward_level: {
        reward_amount: rewardAmount,
        reward_level: rewardLevel,
        reward_token: rewardToken
      }
    }, fee, memo, _funds);
  };
  claimReward = async ({
    recipient
  }: {
    recipient?: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      claim_reward: {
        recipient
      }
    }, fee, memo, _funds);
  };
}