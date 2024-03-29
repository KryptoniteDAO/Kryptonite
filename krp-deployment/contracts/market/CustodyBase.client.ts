/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Uint256, BorrowerResponse, BorrowersResponse, ConfigResponse, BAssetInfo, Cw20HookMsg, ExecuteMsg, Uint128, Binary, Cw20ReceiveMsg, InstantiateMsg, MigrateMsg, QueryMsg } from "./CustodyBase.types";
export interface CustodyBaseReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  borrower: ({
    address
  }: {
    address: string;
  }) => Promise<BorrowerResponse>;
  borrowers: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<BorrowersResponse>;
}
export class CustodyBaseQueryClient implements CustodyBaseReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.borrower = this.borrower.bind(this);
    this.borrowers = this.borrowers.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  borrower = async ({
    address
  }: {
    address: string;
  }): Promise<BorrowerResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      borrower: {
        address
      }
    });
  };
  borrowers = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<BorrowersResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      borrowers: {
        limit,
        start_after: startAfter
      }
    });
  };
}
export interface CustodyBaseInterface {
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
    liquidationContract
  }: {
    liquidationContract?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setOwner: ({
    newOwnerAddr
  }: {
    newOwnerAddr: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  acceptOwnership: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  lockCollateral: ({
    amount,
    borrower
  }: {
    amount: Uint256;
    borrower: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  unlockCollateral: ({
    amount,
    borrower
  }: {
    amount: Uint256;
    borrower: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  distributeRewards: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  liquidateCollateral: ({
    amount,
    borrower,
    liquidator
  }: {
    amount: Uint256;
    borrower: string;
    liquidator: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdrawCollateral: ({
    amount,
    borrower
  }: {
    amount?: Uint256;
    borrower: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateSwapContract: ({
    swapContract
  }: {
    swapContract: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateSwapDenom: ({
    isAdd,
    swapDenom
  }: {
    isAdd: boolean;
    swapDenom: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class CustodyBaseClient implements CustodyBaseInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.setOwner = this.setOwner.bind(this);
    this.acceptOwnership = this.acceptOwnership.bind(this);
    this.lockCollateral = this.lockCollateral.bind(this);
    this.unlockCollateral = this.unlockCollateral.bind(this);
    this.distributeRewards = this.distributeRewards.bind(this);
    this.liquidateCollateral = this.liquidateCollateral.bind(this);
    this.withdrawCollateral = this.withdrawCollateral.bind(this);
    this.updateSwapContract = this.updateSwapContract.bind(this);
    this.updateSwapDenom = this.updateSwapDenom.bind(this);
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
    liquidationContract
  }: {
    liquidationContract?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        liquidation_contract: liquidationContract
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
  lockCollateral = async ({
    amount,
    borrower
  }: {
    amount: Uint256;
    borrower: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      lock_collateral: {
        amount,
        borrower
      }
    }, fee, memo, _funds);
  };
  unlockCollateral = async ({
    amount,
    borrower
  }: {
    amount: Uint256;
    borrower: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      unlock_collateral: {
        amount,
        borrower
      }
    }, fee, memo, _funds);
  };
  distributeRewards = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      distribute_rewards: {}
    }, fee, memo, _funds);
  };
  liquidateCollateral = async ({
    amount,
    borrower,
    liquidator
  }: {
    amount: Uint256;
    borrower: string;
    liquidator: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      liquidate_collateral: {
        amount,
        borrower,
        liquidator
      }
    }, fee, memo, _funds);
  };
  withdrawCollateral = async ({
    amount,
    borrower
  }: {
    amount?: Uint256;
    borrower: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw_collateral: {
        amount,
        borrower
      }
    }, fee, memo, _funds);
  };
  updateSwapContract = async ({
    swapContract
  }: {
    swapContract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_swap_contract: {
        swap_contract: swapContract
      }
    }, fee, memo, _funds);
  };
  updateSwapDenom = async ({
    isAdd,
    swapDenom
  }: {
    isAdd: boolean;
    swapDenom: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_swap_denom: {
        is_add: isAdd,
        swap_denom: swapDenom
      }
    }, fee, memo, _funds);
  };
}