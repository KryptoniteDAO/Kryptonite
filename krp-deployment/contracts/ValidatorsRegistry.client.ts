/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { CanonicalAddr, Binary, Config, ExecuteMsg, Validator, InstantiateMsg, QueryMsg } from "./ValidatorsRegistry.types";
export interface ValidatorsRegistryReadOnlyInterface {
  contractAddress: string;
  getValidatorsForDelegation: () => Promise<Validator[]>;
  config: () => Promise<Config>;
}
export class ValidatorsRegistryQueryClient implements ValidatorsRegistryReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.getValidatorsForDelegation = this.getValidatorsForDelegation.bind(this);
    this.config = this.config.bind(this);
  }

  getValidatorsForDelegation = async (): Promise<Validator[]> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_validators_for_delegation: {}
    });
  };
  config = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
}
export interface ValidatorsRegistryInterface {
  contractAddress: string;
  sender: string;
  addValidator: ({
    validator
  }: {
    validator: Validator;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  removeValidator: ({
    address
  }: {
    address: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateConfig: ({
    hubContract,
    owner
  }: {
    hubContract?: string;
    owner?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class ValidatorsRegistryClient implements ValidatorsRegistryInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.addValidator = this.addValidator.bind(this);
    this.removeValidator = this.removeValidator.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
  }

  addValidator = async ({
    validator
  }: {
    validator: Validator;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      add_validator: {
        validator
      }
    }, fee, memo, _funds);
  };
  removeValidator = async ({
    address
  }: {
    address: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      remove_validator: {
        address
      }
    }, fee, memo, _funds);
  };
  updateConfig = async ({
    hubContract,
    owner
  }: {
    hubContract?: string;
    owner?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        hub_contract: hubContract,
        owner
      }
    }, fee, memo, _funds);
  };
}
