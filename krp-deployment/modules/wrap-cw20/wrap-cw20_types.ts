import { BaseContractConfig, ContractDeployed } from "@/types";

import type { InstantiateMsg as WrapCw20InstantiateMsg } from "@/contracts/wrap-cw20/KrpWrapCw20.types.ts";
export interface WrapCw20ContractConfig extends BaseContractConfig {
  initMsg?: WrapCw20InstantiateMsg;
}


export interface WrapCw20ContractsConfig {
  wrapCw20: WrapCw20ContractConfig;
}

export interface WrapCw20ContractsDeployed {
  wrapCw20?: ContractDeployed;
}
