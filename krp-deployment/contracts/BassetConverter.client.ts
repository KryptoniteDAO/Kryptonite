/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { ConfigResponse, ExecuteMsg, Uint128, Binary, Cw20ReceiveMsg, InstantiateMsg, MigrateMsg, QueryMsg } from "./BassetConverter.types";
export interface BassetConverterReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
}
export class BassetConverterQueryClient implements BassetConverterReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
}
export interface BassetConverterInterface extends BassetConverterReadOnlyInterface {
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
  registerTokens: ({
    bassetTokenAddress,
    nativeDenom
  }: {
    bassetTokenAddress: string;
    nativeDenom: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  convertNativeToBasset: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class BassetConverterClient extends BassetConverterQueryClient implements BassetConverterInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.registerTokens = this.registerTokens.bind(this);
    this.convertNativeToBasset = this.convertNativeToBasset.bind(this);
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
  registerTokens = async ({
    bassetTokenAddress,
    nativeDenom
  }: {
    bassetTokenAddress: string;
    nativeDenom: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      register_tokens: {
        basset_token_address: bassetTokenAddress,
        native_denom: nativeDenom
      }
    }, fee, memo, _funds);
  };
  convertNativeToBasset = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      convert_native_to_basset: {}
    }, fee, memo, _funds);
  };
}