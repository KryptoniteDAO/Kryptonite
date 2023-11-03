/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Addr, Uint256, InstantiateMsg, ExecuteMsg, UpdateGlobalConfigMsg, AddUserMsg, QueryMsg, GlobalInfosResponse, GlobalConfig, GlobalState, UserInfoResponse, UserState, ArrayOfUserInfoResponse } from "./Dispatcher.types";
export interface DispatcherReadOnlyInterface {
  contractAddress: string;
  queryGlobalConfig: () => Promise<GlobalInfosResponse>;
  queryUserInfo: ({
    user
  }: {
    user: Addr;
  }) => Promise<UserInfoResponse>;
  queryUserInfos: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: Addr;
  }) => Promise<ArrayOfUserInfoResponse>;
}
export class DispatcherQueryClient implements DispatcherReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.queryGlobalConfig = this.queryGlobalConfig.bind(this);
    this.queryUserInfo = this.queryUserInfo.bind(this);
    this.queryUserInfos = this.queryUserInfos.bind(this);
  }

  queryGlobalConfig = async (): Promise<GlobalInfosResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_global_config: {}
    });
  };
  queryUserInfo = async ({
    user
  }: {
    user: Addr;
  }): Promise<UserInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_user_info: {
        user
      }
    });
  };
  queryUserInfos = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: Addr;
  }): Promise<ArrayOfUserInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_user_infos: {
        limit,
        start_after: startAfter
      }
    });
  };
}
export interface DispatcherInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    claimToken,
    startLockPeriodTime,
    totalLockAmount
  }: {
    claimToken?: Addr;
    startLockPeriodTime?: number;
    totalLockAmount?: Uint256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  addUser: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  userClaim: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setGov: ({
    gov
  }: {
    gov: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  acceptGov: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class DispatcherClient implements DispatcherInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.addUser = this.addUser.bind(this);
    this.userClaim = this.userClaim.bind(this);
    this.setGov = this.setGov.bind(this);
    this.acceptGov = this.acceptGov.bind(this);
  }

  updateConfig = async ({
    claimToken,
    startLockPeriodTime,
    totalLockAmount
  }: {
    claimToken?: Addr;
    startLockPeriodTime?: number;
    totalLockAmount?: Uint256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        claim_token: claimToken,
        start_lock_period_time: startLockPeriodTime,
        total_lock_amount: totalLockAmount
      }
    }, fee, memo, _funds);
  };
  addUser = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      add_user: {}
    }, fee, memo, _funds);
  };
  userClaim = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      user_claim: {}
    }, fee, memo, _funds);
  };
  setGov = async ({
    gov
  }: {
    gov: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_gov: {
        gov
      }
    }, fee, memo, _funds);
  };
  acceptGov = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      accept_gov: {}
    }, fee, memo, _funds);
  };
}