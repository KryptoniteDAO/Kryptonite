import type { InstantiateMsg as ConvertBassetConverterInstantiateMsg } from "@/contracts/convert/BassetConverter.types";
import type { TokenInstantiateMsg as ConvertBassetTokenInstantiateMsg } from "@/contracts/convert/BassetToken.types";
import type { InstantiateMsg as ConvertCustodyInstantiateMsg } from "@/contracts/market/CustodyBase.types";
import { BaseFeedInfo } from "@/modules";
import type { BaseContractConfig, ContractDeployed } from "@/types";

export interface ConvertConverterContractConfig extends BaseContractConfig {
  initMsg?: ConvertBassetConverterInstantiateMsg;
}

export interface ConvertBAssetsTokenContractConfig extends BaseContractConfig {
  initMsg?: ConvertBassetTokenInstantiateMsg;
}

export interface ConvertCustodyContractConfig extends BaseContractConfig {
  initMsg?: ConvertCustodyInstantiateMsg;
}

export interface ConvertPairAssetsConfig {
  nativeName: string;
  nativeDenom: string;
  nativeDenomDecimals: number;
}

export interface ConvertPairsConfig {
  name?: string;
  assets: ConvertPairAssetsConfig;
  converter: ConvertConverterContractConfig;
  bAssetsToken: ConvertBAssetsTokenContractConfig;
  custody: ConvertCustodyContractConfig;
  marketCollateralWhitelist: boolean;
  overseerWhitelistConfig?: {
    name: string;
    symbol: string;
    max_ltv: string;
  };
  liquidationQueueWhitelistCollateralConfig?: {
    bid_threshold: string;
    max_slot: number;
    premium_rate_per_slot: string;
  };
  oracleFeedInfoConfig: BaseFeedInfo;
}

export interface ConvertContractsConfig {
  convertPairs: ConvertPairsConfig[];
}

export interface ConvertPairsContractsDeployed {
  name?: string;
  native_denom?: string;
  converter?: ContractDeployed;
  bAssetsToken?: ContractDeployed;
  custody?: ContractDeployed;
}

export interface ConvertContractsDeployed {
  convertPairs?: ConvertPairsContractsDeployed[];
}
