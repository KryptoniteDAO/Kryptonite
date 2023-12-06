import type { Addr, BaseContractConfig, ContractDeployed, TokenInfo } from "@/types";
import type { InstantiateMsg as MarketMarketInstantiateMsg } from "@/contracts/market/Market.types";
import type { InstantiateMsg as MarketCustodyBaseInstantiateMsg } from "@/contracts/market/CustodyBase.types";
import type { InstantiateMsg as MarketCustodyBAssetsInstantiateMsg } from "@/contracts/market/CustodyBsei.types";
import type { InstantiateMsg as MarketDistributionModelInstantiateMsg } from "@/contracts/market/DistributionModel.types";
import type { InstantiateMsg as MarketInterestModelInstantiateMsg } from "@/contracts/market/InterestModel.types";
import type { InstantiateMsg as MarketLiquidationQueueInstantiateMsg } from "@/contracts/market/LiquidationQueue.types";
import type { InstantiateMsg as MarketOverseerInstantiateMsg } from "@/contracts/market/Overseer.types";


export interface MarketContractConfig extends BaseContractConfig {
  initMsg?: MarketMarketInstantiateMsg
}

export interface InterestModelContractConfig extends BaseContractConfig {
  initMsg?: MarketInterestModelInstantiateMsg
}

export interface DistributionModelContractConfig extends BaseContractConfig {
  initMsg?: MarketDistributionModelInstantiateMsg
}

export interface OverseerContractConfig extends BaseContractConfig {
  initMsg?: MarketOverseerInstantiateMsg
}

export interface LiquidationQueueContractConfig extends BaseContractConfig {
  initMsg?: MarketLiquidationQueueInstantiateMsg
}

export interface CustodyBAssetsContractConfig extends BaseContractConfig {
  initMsg?: MarketCustodyBAssetsInstantiateMsg
}

export interface CollateralPairsConfig {
  name: string;
  collateral: Addr;
  /// overseer whitelist
  overseerWhitelistConfig: {
    name: string;
    symbol: string;
    max_ltv: string;
  };
  /// liquidationQueue whitelist
  liquidationQueueWhitelistConfig: {
    bid_threshold: string;
    max_slot: number;
    premium_rate_per_slot: string;
  };
}

export interface MarketContractsConfig {
  aToken: BaseContractConfig;
  market: MarketContractConfig;
  interestModel: InterestModelContractConfig;
  distributionModel: DistributionModelContractConfig;
  overseer: OverseerContractConfig;
  liquidationQueue: LiquidationQueueContractConfig;
  custodyBAssets: CustodyBAssetsContractConfig;
  collateralPairs: CollateralPairsConfig[];
}

export interface MarketContractsDeployed {
  aToken?: ContractDeployed;
  market?: ContractDeployed;
  market_stable_denom?: string;
  interestModel?: ContractDeployed;
  distributionModel?: ContractDeployed;
  overseer?: ContractDeployed;
  liquidationQueue?: ContractDeployed;
  custodyBAssets?: ContractDeployed;
}
