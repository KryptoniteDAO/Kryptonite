/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Decimal256, AncEmissionRateResponse, ConfigResponse, ExecuteMsg, InstantiateMsg, QueryMsg } from "./DistributionModel.types";
export interface DistributionModelReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  ancEmissionRate: ({
    currentEmissionRate,
    depositRate,
    targetDepositRate,
    thresholdDepositRate
  }: {
    currentEmissionRate: Decimal256;
    depositRate: Decimal256;
    targetDepositRate: Decimal256;
    thresholdDepositRate: Decimal256;
  }) => Promise<AncEmissionRateResponse>;
}
export class DistributionModelQueryClient implements DistributionModelReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.ancEmissionRate = this.ancEmissionRate.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  ancEmissionRate = async ({
    currentEmissionRate,
    depositRate,
    targetDepositRate,
    thresholdDepositRate
  }: {
    currentEmissionRate: Decimal256;
    depositRate: Decimal256;
    targetDepositRate: Decimal256;
    thresholdDepositRate: Decimal256;
  }): Promise<AncEmissionRateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      anc_emission_rate: {
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
    incrementMultiplier,
    owner
  }: {
    decrementMultiplier?: Decimal256;
    emissionCap?: Decimal256;
    emissionFloor?: Decimal256;
    incrementMultiplier?: Decimal256;
    owner?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
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
  }

  updateConfig = async ({
    decrementMultiplier,
    emissionCap,
    emissionFloor,
    incrementMultiplier,
    owner
  }: {
    decrementMultiplier?: Decimal256;
    emissionCap?: Decimal256;
    emissionFloor?: Decimal256;
    incrementMultiplier?: Decimal256;
    owner?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        decrement_multiplier: decrementMultiplier,
        emission_cap: emissionCap,
        emission_floor: emissionFloor,
        increment_multiplier: incrementMultiplier,
        owner
      }
    }, fee, memo, _funds);
  };
}