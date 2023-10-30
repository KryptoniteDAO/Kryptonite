/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Uint256, AllCollateralsResponse, CollateralsResponse, BorrowLimitResponse, Decimal256, ConfigResponse, DynrateState, EpochState, ExecuteMsg, OfBlocksPerEachDynamicRateChangePeriod, OfBlocksPerEpochPeriod, InstantiateMsg, MigrateMsg, QueryMsg, WhitelistResponse, WhitelistResponseElem } from "./Overseer.types";
export interface OverseerReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  epochState: () => Promise<EpochState>;
  dynrateState: () => Promise<DynrateState>;
  whitelist: ({
    collateralToken,
    limit,
    startAfter
  }: {
    collateralToken?: string;
    limit?: number;
    startAfter?: string;
  }) => Promise<WhitelistResponse>;
  collaterals: ({
    borrower
  }: {
    borrower: string;
  }) => Promise<CollateralsResponse>;
  allCollaterals: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<AllCollateralsResponse>;
  borrowLimit: ({
    blockTime,
    borrower
  }: {
    blockTime?: number;
    borrower: string;
  }) => Promise<BorrowLimitResponse>;
}
export class OverseerQueryClient implements OverseerReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.epochState = this.epochState.bind(this);
    this.dynrateState = this.dynrateState.bind(this);
    this.whitelist = this.whitelist.bind(this);
    this.collaterals = this.collaterals.bind(this);
    this.allCollaterals = this.allCollaterals.bind(this);
    this.borrowLimit = this.borrowLimit.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  epochState = async (): Promise<EpochState> => {
    return this.client.queryContractSmart(this.contractAddress, {
      epoch_state: {}
    });
  };
  dynrateState = async (): Promise<DynrateState> => {
    return this.client.queryContractSmart(this.contractAddress, {
      dynrate_state: {}
    });
  };
  whitelist = async ({
    collateralToken,
    limit,
    startAfter
  }: {
    collateralToken?: string;
    limit?: number;
    startAfter?: string;
  }): Promise<WhitelistResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      whitelist: {
        collateral_token: collateralToken,
        limit,
        start_after: startAfter
      }
    });
  };
  collaterals = async ({
    borrower
  }: {
    borrower: string;
  }): Promise<CollateralsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      collaterals: {
        borrower
      }
    });
  };
  allCollaterals = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<AllCollateralsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_collaterals: {
        limit,
        start_after: startAfter
      }
    });
  };
  borrowLimit = async ({
    blockTime,
    borrower
  }: {
    blockTime?: number;
    borrower: string;
  }): Promise<BorrowLimitResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      borrow_limit: {
        block_time: blockTime,
        borrower
      }
    });
  };
}
export interface OverseerInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    kptPurchaseFactor,
    bufferDistributionFactor,
    dynRateEpoch,
    dynRateMax,
    dynRateMaxchange,
    dynRateMin,
    dynRateYrIncreaseExpectation,
    epochPeriod,
    liquidationContract,
    oracleContract,
    ownerAddr,
    priceTimeframe,
    targetDepositRate,
    thresholdDepositRate
  }: {
    kptPurchaseFactor?: Decimal256;
    bufferDistributionFactor?: Decimal256;
    dynRateEpoch?: number;
    dynRateMax?: Decimal256;
    dynRateMaxchange?: Decimal256;
    dynRateMin?: Decimal256;
    dynRateYrIncreaseExpectation?: Decimal256;
    epochPeriod?: number;
    liquidationContract?: string;
    oracleContract?: string;
    ownerAddr?: string;
    priceTimeframe?: number;
    targetDepositRate?: Decimal256;
    thresholdDepositRate?: Decimal256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  whitelist: ({
    collateralToken,
    custodyContract,
    maxLtv,
    name,
    symbol
  }: {
    collateralToken: string;
    custodyContract: string;
    maxLtv: Decimal256;
    name: string;
    symbol: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateWhitelist: ({
    collateralToken,
    custodyContract,
    maxLtv
  }: {
    collateralToken: string;
    custodyContract?: string;
    maxLtv?: Decimal256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  executeEpochOperations: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateEpochState: ({
    distributedInterest,
    interestBuffer
  }: {
    distributedInterest: Uint256;
    interestBuffer: Uint256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  lockCollateral: ({
    borrower,
    collaterals
  }: {
    borrower: string;
    collaterals: string[][];
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  unlockCollateral: ({
    collaterals
  }: {
    collaterals: string[][];
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  liquidateCollateral: ({
    borrower
  }: {
    borrower: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  fundReserve: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  repayStableFromYieldReserve: ({
    borrower
  }: {
    borrower: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class OverseerClient implements OverseerInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.whitelist = this.whitelist.bind(this);
    this.updateWhitelist = this.updateWhitelist.bind(this);
    this.executeEpochOperations = this.executeEpochOperations.bind(this);
    this.updateEpochState = this.updateEpochState.bind(this);
    this.lockCollateral = this.lockCollateral.bind(this);
    this.unlockCollateral = this.unlockCollateral.bind(this);
    this.liquidateCollateral = this.liquidateCollateral.bind(this);
    this.fundReserve = this.fundReserve.bind(this);
    this.repayStableFromYieldReserve = this.repayStableFromYieldReserve.bind(this);
  }

  updateConfig = async ({
    kptPurchaseFactor,
    bufferDistributionFactor,
    dynRateEpoch,
    dynRateMax,
    dynRateMaxchange,
    dynRateMin,
    dynRateYrIncreaseExpectation,
    epochPeriod,
    liquidationContract,
    oracleContract,
    ownerAddr,
    priceTimeframe,
    targetDepositRate,
    thresholdDepositRate
  }: {
    kptPurchaseFactor?: Decimal256;
    bufferDistributionFactor?: Decimal256;
    dynRateEpoch?: number;
    dynRateMax?: Decimal256;
    dynRateMaxchange?: Decimal256;
    dynRateMin?: Decimal256;
    dynRateYrIncreaseExpectation?: Decimal256;
    epochPeriod?: number;
    liquidationContract?: string;
    oracleContract?: string;
    ownerAddr?: string;
    priceTimeframe?: number;
    targetDepositRate?: Decimal256;
    thresholdDepositRate?: Decimal256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        kpt_purchase_factor: kptPurchaseFactor,
        buffer_distribution_factor: bufferDistributionFactor,
        dyn_rate_epoch: dynRateEpoch,
        dyn_rate_max: dynRateMax,
        dyn_rate_maxchange: dynRateMaxchange,
        dyn_rate_min: dynRateMin,
        dyn_rate_yr_increase_expectation: dynRateYrIncreaseExpectation,
        epoch_period: epochPeriod,
        liquidation_contract: liquidationContract,
        oracle_contract: oracleContract,
        owner_addr: ownerAddr,
        price_timeframe: priceTimeframe,
        target_deposit_rate: targetDepositRate,
        threshold_deposit_rate: thresholdDepositRate
      }
    }, fee, memo, _funds);
  };
  whitelist = async ({
    collateralToken,
    custodyContract,
    maxLtv,
    name,
    symbol
  }: {
    collateralToken: string;
    custodyContract: string;
    maxLtv: Decimal256;
    name: string;
    symbol: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      whitelist: {
        collateral_token: collateralToken,
        custody_contract: custodyContract,
        max_ltv: maxLtv,
        name,
        symbol
      }
    }, fee, memo, _funds);
  };
  updateWhitelist = async ({
    collateralToken,
    custodyContract,
    maxLtv
  }: {
    collateralToken: string;
    custodyContract?: string;
    maxLtv?: Decimal256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_whitelist: {
        collateral_token: collateralToken,
        custody_contract: custodyContract,
        max_ltv: maxLtv
      }
    }, fee, memo, _funds);
  };
  executeEpochOperations = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      execute_epoch_operations: {}
    }, fee, memo, _funds);
  };
  updateEpochState = async ({
    distributedInterest,
    interestBuffer
  }: {
    distributedInterest: Uint256;
    interestBuffer: Uint256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_epoch_state: {
        distributed_interest: distributedInterest,
        interest_buffer: interestBuffer
      }
    }, fee, memo, _funds);
  };
  lockCollateral = async ({
    borrower,
    collaterals
  }: {
    borrower: string;
    collaterals: string[][];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      lock_collateral: {
        borrower,
        collaterals
      }
    }, fee, memo, _funds);
  };
  unlockCollateral = async ({
    collaterals
  }: {
    collaterals: string[][];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      unlock_collateral: {
        collaterals
      }
    }, fee, memo, _funds);
  };
  liquidateCollateral = async ({
    borrower
  }: {
    borrower: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      liquidate_collateral: {
        borrower
      }
    }, fee, memo, _funds);
  };
  fundReserve = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      fund_reserve: {}
    }, fee, memo, _funds);
  };
  repayStableFromYieldReserve = async ({
    borrower
  }: {
    borrower: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      repay_stable_from_yield_reserve: {
        borrower
      }
    }, fee, memo, _funds);
  };
}
