/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Decimal256, Uint256, BorrowerInfoResponse, BorrowerInfosResponse, ConfigResponse, Cw20HookMsg, EpochStateResponse, ExecuteMsg, Uint128, Binary, Cw20ReceiveMsg, InstantiateMsg, MigrateMsg, QueryMsg, State } from "./Market.types";
export interface MarketReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  state: ({
    blockHeight
  }: {
    blockHeight?: number;
  }) => Promise<StateResponse>;
  epochState: ({
    blockHeight,
    distributedInterest
  }: {
    blockHeight?: number;
    distributedInterest?: Uint256;
  }) => Promise<EpochStateResponse>;
  borrowerInfo: ({
    blockHeight,
    borrower
  }: {
    blockHeight?: number;
    borrower: string;
  }) => Promise<BorrowerInfoResponse>;
  borrowerInfos: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<BorrowerInfosResponse>;
}
export class MarketQueryClient implements MarketReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.state = this.state.bind(this);
    this.epochState = this.epochState.bind(this);
    this.borrowerInfo = this.borrowerInfo.bind(this);
    this.borrowerInfos = this.borrowerInfos.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  state = async ({
    blockHeight
  }: {
    blockHeight?: number;
  }): Promise<StateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      state: {
        block_height: blockHeight
      }
    });
  };
  epochState = async ({
    blockHeight,
    distributedInterest
  }: {
    blockHeight?: number;
    distributedInterest?: Uint256;
  }): Promise<EpochStateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      epoch_state: {
        block_height: blockHeight,
        distributed_interest: distributedInterest
      }
    });
  };
  borrowerInfo = async ({
    blockHeight,
    borrower
  }: {
    blockHeight?: number;
    borrower: string;
  }): Promise<BorrowerInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      borrower_info: {
        block_height: blockHeight,
        borrower
      }
    });
  };
  borrowerInfos = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<BorrowerInfosResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      borrower_infos: {
        limit,
        start_after: startAfter
      }
    });
  };
}
export interface MarketInterface extends MarketReadOnlyInterface {
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
  registerContracts: ({
    collectorContract,
    distributionModel,
    distributorContract,
    interestModel,
    overseerContract
  }: {
    collectorContract: string;
    distributionModel: string;
    distributorContract: string;
    interestModel: string;
    overseerContract: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateConfig: ({
    distributionModel,
    interestModel,
    maxBorrowFactor,
    ownerAddr
  }: {
    distributionModel?: string;
    interestModel?: string;
    maxBorrowFactor?: Decimal256;
    ownerAddr?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  repayStableFromLiquidation: ({
    borrower,
    prevBalance
  }: {
    borrower: string;
    prevBalance: Uint256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  executeEpochOperations: ({
    depositRate,
    distributedInterest,
    targetDepositRate,
    thresholdDepositRate
  }: {
    depositRate: Decimal256;
    distributedInterest: Uint256;
    targetDepositRate: Decimal256;
    thresholdDepositRate: Decimal256;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  depositStable: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  borrowStable: ({
    borrowAmount,
    to
  }: {
    borrowAmount: Uint256;
    to?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  repayStable: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  claimRewards: ({
    to
  }: {
    to?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class MarketClient extends MarketQueryClient implements MarketInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.registerContracts = this.registerContracts.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.repayStableFromLiquidation = this.repayStableFromLiquidation.bind(this);
    this.executeEpochOperations = this.executeEpochOperations.bind(this);
    this.depositStable = this.depositStable.bind(this);
    this.borrowStable = this.borrowStable.bind(this);
    this.repayStable = this.repayStable.bind(this);
    this.claimRewards = this.claimRewards.bind(this);
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
  registerContracts = async ({
    collectorContract,
    distributionModel,
    distributorContract,
    interestModel,
    overseerContract
  }: {
    collectorContract: string;
    distributionModel: string;
    distributorContract: string;
    interestModel: string;
    overseerContract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      register_contracts: {
        collector_contract: collectorContract,
        distribution_model: distributionModel,
        distributor_contract: distributorContract,
        interest_model: interestModel,
        overseer_contract: overseerContract
      }
    }, fee, memo, _funds);
  };
  updateConfig = async ({
    distributionModel,
    interestModel,
    maxBorrowFactor,
    ownerAddr
  }: {
    distributionModel?: string;
    interestModel?: string;
    maxBorrowFactor?: Decimal256;
    ownerAddr?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        distribution_model: distributionModel,
        interest_model: interestModel,
        max_borrow_factor: maxBorrowFactor,
        owner_addr: ownerAddr
      }
    }, fee, memo, _funds);
  };
  repayStableFromLiquidation = async ({
    borrower,
    prevBalance
  }: {
    borrower: string;
    prevBalance: Uint256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      repay_stable_from_liquidation: {
        borrower,
        prev_balance: prevBalance
      }
    }, fee, memo, _funds);
  };
  executeEpochOperations = async ({
    depositRate,
    distributedInterest,
    targetDepositRate,
    thresholdDepositRate
  }: {
    depositRate: Decimal256;
    distributedInterest: Uint256;
    targetDepositRate: Decimal256;
    thresholdDepositRate: Decimal256;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      execute_epoch_operations: {
        deposit_rate: depositRate,
        distributed_interest: distributedInterest,
        target_deposit_rate: targetDepositRate,
        threshold_deposit_rate: thresholdDepositRate
      }
    }, fee, memo, _funds);
  };
  depositStable = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      deposit_stable: {}
    }, fee, memo, _funds);
  };
  borrowStable = async ({
    borrowAmount,
    to
  }: {
    borrowAmount: Uint256;
    to?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      borrow_stable: {
        borrow_amount: borrowAmount,
        to
      }
    }, fee, memo, _funds);
  };
  repayStable = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      repay_stable: {}
    }, fee, memo, _funds);
  };
  claimRewards = async ({
    to
  }: {
    to?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      claim_rewards: {
        to
      }
    }, fee, memo, _funds);
  };
}