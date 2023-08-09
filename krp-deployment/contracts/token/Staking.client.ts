/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.33.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Addr, Uint128, InstantiateMsg, ExecuteMsg, Binary, Cw20ReceiveMsg, UpdateStakingConfigStruct, QueryMsg, BalanceOfResponse, EarnedResponse, GetBoostResponse, GetUserRewardPerTokenPaidResponse, GetUserUpdatedAtResponse, LastTimeRewardApplicableResponse, StakingConfigResponse, Uint256, StakingStateResponse, RewardPerTokenResponse } from "./Staking.types";
export interface StakingReadOnlyInterface {
  contractAddress: string;
  rewardPerToken: () => Promise<RewardPerTokenResponse>;
  lastTimeRewardApplicable: () => Promise<LastTimeRewardApplicableResponse>;
  getBoost: ({
    account
  }: {
    account: Addr;
  }) => Promise<GetBoostResponse>;
  earned: ({
    account
  }: {
    account: Addr;
  }) => Promise<EarnedResponse>;
  queryStakingConfig: () => Promise<StakingConfigResponse>;
  queryStakingState: () => Promise<StakingStateResponse>;
  getUserUpdatedAt: ({
    account
  }: {
    account: Addr;
  }) => Promise<GetUserUpdatedAtResponse>;
  getUserRewardPerTokenPaid: ({
    account
  }: {
    account: Addr;
  }) => Promise<GetUserRewardPerTokenPaidResponse>;
  balanceOf: ({
    account
  }: {
    account: Addr;
  }) => Promise<BalanceOfResponse>;
}
export class StakingQueryClient implements StakingReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.rewardPerToken = this.rewardPerToken.bind(this);
    this.lastTimeRewardApplicable = this.lastTimeRewardApplicable.bind(this);
    this.getBoost = this.getBoost.bind(this);
    this.earned = this.earned.bind(this);
    this.queryStakingConfig = this.queryStakingConfig.bind(this);
    this.queryStakingState = this.queryStakingState.bind(this);
    this.getUserUpdatedAt = this.getUserUpdatedAt.bind(this);
    this.getUserRewardPerTokenPaid = this.getUserRewardPerTokenPaid.bind(this);
    this.balanceOf = this.balanceOf.bind(this);
  }

  rewardPerToken = async (): Promise<RewardPerTokenResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      reward_per_token: {}
    });
  };
  lastTimeRewardApplicable = async (): Promise<LastTimeRewardApplicableResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      last_time_reward_applicable: {}
    });
  };
  getBoost = async ({
    account
  }: {
    account: Addr;
  }): Promise<GetBoostResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_boost: {
        account
      }
    });
  };
  earned = async ({
    account
  }: {
    account: Addr;
  }): Promise<EarnedResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      earned: {
        account
      }
    });
  };
  queryStakingConfig = async (): Promise<StakingConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_staking_config: {}
    });
  };
  queryStakingState = async (): Promise<StakingStateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_staking_state: {}
    });
  };
  getUserUpdatedAt = async ({
    account
  }: {
    account: Addr;
  }): Promise<GetUserUpdatedAtResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_user_updated_at: {
        account
      }
    });
  };
  getUserRewardPerTokenPaid = async ({
    account
  }: {
    account: Addr;
  }): Promise<GetUserRewardPerTokenPaidResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_user_reward_per_token_paid: {
        account
      }
    });
  };
  balanceOf = async ({
    account
  }: {
    account: Addr;
  }): Promise<BalanceOfResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      balance_of: {
        account
      }
    });
  };
}
export interface StakingInterface {
  contractAddress: string;
  sender: string;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateStakingConfig: ({
    configMsg
  }: {
    configMsg: UpdateStakingConfigStruct;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateStakingState: ({
    duration
  }: {
    duration: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  getReward: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdraw: ({
    amount
  }: {
    amount: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  notifyRewardAmount: ({
    amount
  }: {
    amount: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class StakingClient implements StakingInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.updateStakingConfig = this.updateStakingConfig.bind(this);
    this.updateStakingState = this.updateStakingState.bind(this);
    this.getReward = this.getReward.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.notifyRewardAmount = this.notifyRewardAmount.bind(this);
  }

  receive = async ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      receive: {
        amount,
        msg,
        sender
      }
    }, fee, memo, _funds);
  };
  updateStakingConfig = async ({
    configMsg
  }: {
    configMsg: UpdateStakingConfigStruct;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_staking_config: {
        config_msg: configMsg
      }
    }, fee, memo, _funds);
  };
  updateStakingState = async ({
    duration
  }: {
    duration: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_staking_state: {
        duration
      }
    }, fee, memo, _funds);
  };
  getReward = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      get_reward: {}
    }, fee, memo, _funds);
  };
  withdraw = async ({
    amount
  }: {
    amount: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw: {
        amount
      }
    }, fee, memo, _funds);
  };
  notifyRewardAmount = async ({
    amount
  }: {
    amount: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      notify_reward_amount: {
        amount
      }
    }, fee, memo, _funds);
  };
}