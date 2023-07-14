/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { CanonicalAddr, Binary, Decimal, Config, ExecuteMsg, Uint128, GetBufferedRewardsResponse, InstantiateMsg, QueryMsg } from "./RewardsDispatcher.types";
export interface RewardsDispatcherReadOnlyInterface {
  contractAddress: string;
  getBufferedRewards: () => Promise<GetBufferedRewardsResponse>;
  config: () => Promise<Config>;
}
export class RewardsDispatcherQueryClient implements RewardsDispatcherReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.getBufferedRewards = this.getBufferedRewards.bind(this);
    this.config = this.config.bind(this);
  }

  getBufferedRewards = async (): Promise<GetBufferedRewardsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_buffered_rewards: {}
    });
  };
  config = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
}
export interface RewardsDispatcherInterface {
  contractAddress: string;
  sender: string;
  swapToRewardDenom: ({
    bseiTotalBonded,
    stseiTotalBonded
  }: {
    bseiTotalBonded: Uint128;
    stseiTotalBonded: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateConfig: ({
    bseiRewardContract,
    bseiRewardDenom,
    hubContract,
    krpKeeperAddress,
    krpKeeperRate,
    owner,
    stseiRewardDenom
  }: {
    bseiRewardContract?: string;
    bseiRewardDenom?: string;
    hubContract?: string;
    krpKeeperAddress?: string;
    krpKeeperRate?: Decimal;
    owner?: string;
    stseiRewardDenom?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  dispatchRewards: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateSwapContract: ({
    swapContract
  }: {
    swapContract: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateSwapDenom: ({
    isAdd,
    swapDenom
  }: {
    isAdd: boolean;
    swapDenom: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateOracleContract: ({
    oracleContract
  }: {
    oracleContract: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class RewardsDispatcherClient implements RewardsDispatcherInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.swapToRewardDenom = this.swapToRewardDenom.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.dispatchRewards = this.dispatchRewards.bind(this);
    this.updateSwapContract = this.updateSwapContract.bind(this);
    this.updateSwapDenom = this.updateSwapDenom.bind(this);
    this.updateOracleContract = this.updateOracleContract.bind(this);
  }

  swapToRewardDenom = async ({
    bseiTotalBonded,
    stseiTotalBonded
  }: {
    bseiTotalBonded: Uint128;
    stseiTotalBonded: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      swap_to_reward_denom: {
        bsei_total_bonded: bseiTotalBonded,
        stsei_total_bonded: stseiTotalBonded
      }
    }, fee, memo, _funds);
  };
  updateConfig = async ({
    bseiRewardContract,
    bseiRewardDenom,
    hubContract,
    krpKeeperAddress,
    krpKeeperRate,
    owner,
    stseiRewardDenom
  }: {
    bseiRewardContract?: string;
    bseiRewardDenom?: string;
    hubContract?: string;
    krpKeeperAddress?: string;
    krpKeeperRate?: Decimal;
    owner?: string;
    stseiRewardDenom?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        bsei_reward_contract: bseiRewardContract,
        bsei_reward_denom: bseiRewardDenom,
        hub_contract: hubContract,
        krp_keeper_address: krpKeeperAddress,
        krp_keeper_rate: krpKeeperRate,
        owner,
        stsei_reward_denom: stseiRewardDenom
      }
    }, fee, memo, _funds);
  };
  dispatchRewards = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      dispatch_rewards: {}
    }, fee, memo, _funds);
  };
  updateSwapContract = async ({
    swapContract
  }: {
    swapContract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_swap_contract: {
        swap_contract: swapContract
      }
    }, fee, memo, _funds);
  };
  updateSwapDenom = async ({
    isAdd,
    swapDenom
  }: {
    isAdd: boolean;
    swapDenom: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_swap_denom: {
        is_add: isAdd,
        swap_denom: swapDenom
      }
    }, fee, memo, _funds);
  };
  updateOracleContract = async ({
    oracleContract
  }: {
    oracleContract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_oracle_contract: {
        oracle_contract: oracleContract
      }
    }, fee, memo, _funds);
  };
}
