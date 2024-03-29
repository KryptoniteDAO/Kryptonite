/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Decimal256, ConfigResponse, ExecuteMsg, InstantiateMsg, KptEmissionRateResponse, QueryMsg } from "./DistributionModel.types";
export interface DistributionModelReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  kptEmissionRate: ({
    currentEmissionRate,
    depositRate,
    targetDepositRate,
    thresholdDepositRate
  }: {
    currentEmissionRate: Decimal256;
    depositRate: Decimal256;
    targetDepositRate: Decimal256;
    thresholdDepositRate: Decimal256;
  }) => Promise<KptEmissionRateResponse>;
}
export class DistributionModelQueryClient implements DistributionModelReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.kptEmissionRate = this.kptEmissionRate.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  kptEmissionRate = async ({
    currentEmissionRate,
    depositRate,
    targetDepositRate,
    thresholdDepositRate
  }: {
    currentEmissionRate: Decimal256;
    depositRate: Decimal256;
    targetDepositRate: Decimal256;
    thresholdDepositRate: Decimal256;
  }): Promise<KptEmissionRateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      kpt_emission_rate: {
        current_emission_rate: currentEmissionRate,
        deposit_rate: depositRate,
        target_deposit_rate: targetDepositRate,
        threshold_deposit_rate: thresholdDepositRate
      }
    });
  };
}
export interface DistributionModelInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    decrementMultiplier,
    emissionCap,
    emissionFloor,
    incrementMultiplier
  }: {
    decrementMultiplier?: Decimal256;
    emissionCap?: Decimal256;
    emissionFloor?: Decimal256;
    incrementMultiplier?: Decimal256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setOwner: ({
    newOwnerAddr
  }: {
    newOwnerAddr: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  acceptOwnership: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class DistributionModelClient implements DistributionModelInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.setOwner = this.setOwner.bind(this);
    this.acceptOwnership = this.acceptOwnership.bind(this);
  }

  updateConfig = async ({
    decrementMultiplier,
    emissionCap,
    emissionFloor,
    incrementMultiplier
  }: {
    decrementMultiplier?: Decimal256;
    emissionCap?: Decimal256;
    emissionFloor?: Decimal256;
    incrementMultiplier?: Decimal256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        decrement_multiplier: decrementMultiplier,
        emission_cap: emissionCap,
        emission_floor: emissionFloor,
        increment_multiplier: incrementMultiplier
      }
    }, fee, memo, _funds);
  };
  setOwner = async ({
    newOwnerAddr
  }: {
    newOwnerAddr: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_owner: {
        new_owner_addr: newOwnerAddr
      }
    }, fee, memo, _funds);
  };
  acceptOwnership = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      accept_ownership: {}
    }, fee, memo, _funds);
  };
}