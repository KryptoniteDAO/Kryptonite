/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Decimal256 = string;
export interface AncEmissionRateResponse {
  emission_rate: Decimal256;
  [k: string]: unknown;
}
export interface ConfigResponse {
  decrement_multiplier: Decimal256;
  emission_cap: Decimal256;
  emission_floor: Decimal256;
  increment_multiplier: Decimal256;
  owner: string;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  update_config: {
    decrement_multiplier?: Decimal256 | null;
    emission_cap?: Decimal256 | null;
    emission_floor?: Decimal256 | null;
    increment_multiplier?: Decimal256 | null;
    owner?: string | null;
    [k: string]: unknown;
  };
};
export interface InstantiateMsg {
  decrement_multiplier: Decimal256;
  emission_cap: Decimal256;
  emission_floor: Decimal256;
  increment_multiplier: Decimal256;
  owner: string;
  [k: string]: unknown;
}
export type QueryMsg = {
  config: {
    [k: string]: unknown;
  };
} | {
  kpt_emission_rate: {
    current_emission_rate: Decimal256;
    deposit_rate: Decimal256;
    target_deposit_rate: Decimal256;
    threshold_deposit_rate: Decimal256;
    [k: string]: unknown;
  };
};
export type DistributionModelExecuteMsg = ExecuteMsg;