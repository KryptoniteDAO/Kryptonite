/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Decimal256, Uint256, InstantiateMsg, ExecuteMsg, Uint128, Binary, Cw20ReceiveMsg, QueryMsg, BidResponse, BidPoolResponse, BidPoolsResponse, BidsResponse, CollateralInfoResponse, ConfigResponse, LiquidationAmountResponse } from "./LiquidationQueue.types";
export interface LiquidationQueueReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  liquidationAmount: ({
    borrowAmount,
    borrowLimit,
    collateralPrices,
    collaterals
  }: {
    borrowAmount: Uint256;
    borrowLimit: Uint256;
    collateralPrices: Decimal256[];
    collaterals: string[][];
  }) => Promise<LiquidationAmountResponse>;
  collateralInfo: ({
    collateralToken
  }: {
    collateralToken: string;
  }) => Promise<CollateralInfoResponse>;
  bid: ({
    bidIdx
  }: {
    bidIdx: Uint128;
  }) => Promise<BidResponse>;
  bidsByUser: ({
    bidder,
    collateralToken,
    limit,
    startAfter
  }: {
    bidder: string;
    collateralToken: string;
    limit?: number;
    startAfter?: Uint128;
  }) => Promise<BidsResponse>;
  bidPool: ({
    bidSlot,
    collateralToken
  }: {
    bidSlot: number;
    collateralToken: string;
  }) => Promise<BidPoolResponse>;
  bidPoolsByCollateral: ({
    collateralToken,
    limit,
    startAfter
  }: {
    collateralToken: string;
    limit?: number;
    startAfter?: number;
  }) => Promise<BidPoolsResponse>;
}
export class LiquidationQueueQueryClient implements LiquidationQueueReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.liquidationAmount = this.liquidationAmount.bind(this);
    this.collateralInfo = this.collateralInfo.bind(this);
    this.bid = this.bid.bind(this);
    this.bidsByUser = this.bidsByUser.bind(this);
    this.bidPool = this.bidPool.bind(this);
    this.bidPoolsByCollateral = this.bidPoolsByCollateral.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  liquidationAmount = async ({
    borrowAmount,
    borrowLimit,
    collateralPrices,
    collaterals
  }: {
    borrowAmount: Uint256;
    borrowLimit: Uint256;
    collateralPrices: Decimal256[];
    collaterals: string[][];
  }): Promise<LiquidationAmountResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      liquidation_amount: {
        borrow_amount: borrowAmount,
        borrow_limit: borrowLimit,
        collateral_prices: collateralPrices,
        collaterals
      }
    });
  };
  collateralInfo = async ({
    collateralToken
  }: {
    collateralToken: string;
  }): Promise<CollateralInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      collateral_info: {
        collateral_token: collateralToken
      }
    });
  };
  bid = async ({
    bidIdx
  }: {
    bidIdx: Uint128;
  }): Promise<BidResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      bid: {
        bid_idx: bidIdx
      }
    });
  };
  bidsByUser = async ({
    bidder,
    collateralToken,
    limit,
    startAfter
  }: {
    bidder: string;
    collateralToken: string;
    limit?: number;
    startAfter?: Uint128;
  }): Promise<BidsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      bids_by_user: {
        bidder,
        collateral_token: collateralToken,
        limit,
        start_after: startAfter
      }
    });
  };
  bidPool = async ({
    bidSlot,
    collateralToken
  }: {
    bidSlot: number;
    collateralToken: string;
  }): Promise<BidPoolResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      bid_pool: {
        bid_slot: bidSlot,
        collateral_token: collateralToken
      }
    });
  };
  bidPoolsByCollateral = async ({
    collateralToken,
    limit,
    startAfter
  }: {
    collateralToken: string;
    limit?: number;
    startAfter?: number;
  }): Promise<BidPoolsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      bid_pools_by_collateral: {
        collateral_token: collateralToken,
        limit,
        start_after: startAfter
      }
    });
  };
}
export interface LiquidationQueueInterface {
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
  updateConfig: ({
    bidFee,
    controlContract,
    liquidationThreshold,
    liquidatorFee,
    oracleContract,
    owner,
    priceTimeframe,
    safeRatio,
    stableDenom,
    waitingPeriod
  }: {
    bidFee?: Decimal256;
    controlContract?: string;
    liquidationThreshold?: Uint256;
    liquidatorFee?: Decimal256;
    oracleContract?: string;
    owner?: string;
    priceTimeframe?: number;
    safeRatio?: Decimal256;
    stableDenom?: string;
    waitingPeriod?: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  whitelistCollateral: ({
    bidThreshold,
    collateralToken,
    maxSlot,
    premiumRatePerSlot
  }: {
    bidThreshold: Uint256;
    collateralToken: string;
    maxSlot: number;
    premiumRatePerSlot: Decimal256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateCollateralInfo: ({
    bidThreshold,
    collateralToken,
    maxSlot
  }: {
    bidThreshold?: Uint256;
    collateralToken: string;
    maxSlot?: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  submitBid: ({
    collateralToken,
    premiumSlot
  }: {
    collateralToken: string;
    premiumSlot: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  retractBid: ({
    amount,
    bidIdx
  }: {
    amount?: Uint256;
    bidIdx: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  activateBids: ({
    bidsIdx,
    collateralToken
  }: {
    bidsIdx?: Uint128[];
    collateralToken: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  claimLiquidations: ({
    bidsIdx,
    collateralToken
  }: {
    bidsIdx?: Uint128[];
    collateralToken: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  executeBid: ({
    amount,
    collateralDenom,
    feeAddress,
    liquidator,
    repayAddress
  }: {
    amount: Uint256;
    collateralDenom: string;
    feeAddress: string;
    liquidator: string;
    repayAddress: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class LiquidationQueueClient implements LiquidationQueueInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.whitelistCollateral = this.whitelistCollateral.bind(this);
    this.updateCollateralInfo = this.updateCollateralInfo.bind(this);
    this.submitBid = this.submitBid.bind(this);
    this.retractBid = this.retractBid.bind(this);
    this.activateBids = this.activateBids.bind(this);
    this.claimLiquidations = this.claimLiquidations.bind(this);
    this.executeBid = this.executeBid.bind(this);
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
  updateConfig = async ({
    bidFee,
    controlContract,
    liquidationThreshold,
    liquidatorFee,
    oracleContract,
    owner,
    priceTimeframe,
    safeRatio,
    stableDenom,
    waitingPeriod
  }: {
    bidFee?: Decimal256;
    controlContract?: string;
    liquidationThreshold?: Uint256;
    liquidatorFee?: Decimal256;
    oracleContract?: string;
    owner?: string;
    priceTimeframe?: number;
    safeRatio?: Decimal256;
    stableDenom?: string;
    waitingPeriod?: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        bid_fee: bidFee,
        control_contract: controlContract,
        liquidation_threshold: liquidationThreshold,
        liquidator_fee: liquidatorFee,
        oracle_contract: oracleContract,
        owner,
        price_timeframe: priceTimeframe,
        safe_ratio: safeRatio,
        stable_denom: stableDenom,
        waiting_period: waitingPeriod
      }
    }, fee, memo, _funds);
  };
  whitelistCollateral = async ({
    bidThreshold,
    collateralToken,
    maxSlot,
    premiumRatePerSlot
  }: {
    bidThreshold: Uint256;
    collateralToken: string;
    maxSlot: number;
    premiumRatePerSlot: Decimal256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      whitelist_collateral: {
        bid_threshold: bidThreshold,
        collateral_token: collateralToken,
        max_slot: maxSlot,
        premium_rate_per_slot: premiumRatePerSlot
      }
    }, fee, memo, _funds);
  };
  updateCollateralInfo = async ({
    bidThreshold,
    collateralToken,
    maxSlot
  }: {
    bidThreshold?: Uint256;
    collateralToken: string;
    maxSlot?: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_collateral_info: {
        bid_threshold: bidThreshold,
        collateral_token: collateralToken,
        max_slot: maxSlot
      }
    }, fee, memo, _funds);
  };
  submitBid = async ({
    collateralToken,
    premiumSlot
  }: {
    collateralToken: string;
    premiumSlot: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      submit_bid: {
        collateral_token: collateralToken,
        premium_slot: premiumSlot
      }
    }, fee, memo, _funds);
  };
  retractBid = async ({
    amount,
    bidIdx
  }: {
    amount?: Uint256;
    bidIdx: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      retract_bid: {
        amount,
        bid_idx: bidIdx
      }
    }, fee, memo, _funds);
  };
  activateBids = async ({
    bidsIdx,
    collateralToken
  }: {
    bidsIdx?: Uint128[];
    collateralToken: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      activate_bids: {
        bids_idx: bidsIdx,
        collateral_token: collateralToken
      }
    }, fee, memo, _funds);
  };
  claimLiquidations = async ({
    bidsIdx,
    collateralToken
  }: {
    bidsIdx?: Uint128[];
    collateralToken: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      claim_liquidations: {
        bids_idx: bidsIdx,
        collateral_token: collateralToken
      }
    }, fee, memo, _funds);
  };
  executeBid = async ({
    amount,
    collateralDenom,
    feeAddress,
    liquidator,
    repayAddress
  }: {
    amount: Uint256;
    collateralDenom: string;
    feeAddress: string;
    liquidator: string;
    repayAddress: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      execute_bid: {
        amount,
        collateral_denom: collateralDenom,
        fee_address: feeAddress,
        liquidator,
        repay_address: repayAddress
      }
    }, fee, memo, _funds);
  };
}