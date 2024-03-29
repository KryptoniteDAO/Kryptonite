/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Addr, Uint128, InstantiateMsg, ExecuteMsg, Action, Expiration, Timestamp, Uint64, WhiteListUserMsg, QueryMsg, OwnershipForAddr, Config, WhiteListUser } from "./SeiYanSeiNft.types";
export interface SeiYanSeiNftReadOnlyInterface {
  contractAddress: string;
  queryWhiteListUserInfo: ({
    user
  }: {
    user: Addr;
  }) => Promise<WhiteListUser>;
  queryConfig: () => Promise<Config>;
  getOwnership: () => Promise<OwnershipForAddr>;
}
export class SeiYanSeiNftQueryClient implements SeiYanSeiNftReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.queryWhiteListUserInfo = this.queryWhiteListUserInfo.bind(this);
    this.queryConfig = this.queryConfig.bind(this);
    this.getOwnership = this.getOwnership.bind(this);
  }

  queryWhiteListUserInfo = async ({
    user
  }: {
    user: Addr;
  }): Promise<WhiteListUser> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_white_list_user_info: {
        user
      }
    });
  };
  queryConfig = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_config: {}
    });
  };
  getOwnership = async (): Promise<OwnershipForAddr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_ownership: {}
    });
  };
}
export interface SeiYanSeiNftInterface {
  contractAddress: string;
  sender: string;
  setWhiteList: ({
    writeList
  }: {
    writeList: WhiteListUserMsg[];
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  mint: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateOwnership: (action: Action, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class SeiYanSeiNftClient implements SeiYanSeiNftInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.setWhiteList = this.setWhiteList.bind(this);
    this.mint = this.mint.bind(this);
    this.updateOwnership = this.updateOwnership.bind(this);
  }

  setWhiteList = async ({
    writeList
  }: {
    writeList: WhiteListUserMsg[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_white_list: {
        write_list: writeList
      }
    }, fee, memo, _funds);
  };
  mint = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      mint: {}
    }, fee, memo, _funds);
  };
  updateOwnership = async (action: Action, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_ownership: action
    }, fee, memo, _funds);
  };
}