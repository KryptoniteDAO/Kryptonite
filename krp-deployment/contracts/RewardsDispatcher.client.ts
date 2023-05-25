/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { ExecuteMsg, Uint128, Decimal, InstantiateMsg, QueryMsg } from "./RewardsDispatcher.types";
export interface RewardsDispatcherReadOnlyInterface {
  contractAddress: string;
  getBufferedRewards: () => Promise<GetBufferedRewardsResponse>;
  config: () => Promise<ConfigResponse>;
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
  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
}
export interface RewardsDispatcherInterface extends RewardsDispatcherReadOnlyInterface {
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
    lidoFeeAddress,
    lidoFeeRate,
    owner,
    stseiRewardDenom
  }: {
    bseiRewardContract?: string;
    bseiRewardDenom?: string;
    hubContract?: string;
    lidoFeeAddress?: string;
    lidoFeeRate?: Decimal;
    owner?: string;
    stseiRewardDenom?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  dispatchRewards: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class RewardsDispatcherClient extends RewardsDispatcherQueryClient implements RewardsDispatcherInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.swapToRewardDenom = this.swapToRewardDenom.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.dispatchRewards = this.dispatchRewards.bind(this);
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
    lidoFeeAddress,
    lidoFeeRate,
    owner,
    stseiRewardDenom
  }: {
    bseiRewardContract?: string;
    bseiRewardDenom?: string;
    hubContract?: string;
    lidoFeeAddress?: string;
    lidoFeeRate?: Decimal;
    owner?: string;
    stseiRewardDenom?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        bsei_reward_contract: bseiRewardContract,
        bsei_reward_denom: bseiRewardDenom,
        hub_contract: hubContract,
        lido_fee_address: lidoFeeAddress,
        lido_fee_rate: lidoFeeRate,
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
}