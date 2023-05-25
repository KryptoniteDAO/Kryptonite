/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { AllAccountsResponse, Uint128, Expiration, Timestamp, Uint64, AllAllowancesResponse, AllowanceInfo, AllowanceResponse, BalanceResponse, ExecuteMsg, Binary, QueryMsg, TokenInfoResponse, TokenInitMsg, Cw20Coin } from "./TokenBsei.types";
export interface TokenBseiReadOnlyInterface {
  contractAddress: string;
  balance: ({
    address
  }: {
    address: string;
  }) => Promise<BalanceResponse>;
  tokenInfo: () => Promise<TokenInfoResponse>;
  minter: () => Promise<MinterResponse>;
  allowance: ({
    owner,
    spender
  }: {
    owner: string;
    spender: string;
  }) => Promise<AllowanceResponse>;
  allAllowances: ({
    limit,
    owner,
    startAfter
  }: {
    limit?: number;
    owner: string;
    startAfter?: string;
  }) => Promise<AllAllowancesResponse>;
  allAccounts: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<AllAccountsResponse>;
}
export class TokenBseiQueryClient implements TokenBseiReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.balance = this.balance.bind(this);
    this.tokenInfo = this.tokenInfo.bind(this);
    this.minter = this.minter.bind(this);
    this.allowance = this.allowance.bind(this);
    this.allAllowances = this.allAllowances.bind(this);
    this.allAccounts = this.allAccounts.bind(this);
  }

  balance = async ({
    address
  }: {
    address: string;
  }): Promise<BalanceResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      balance: {
        address
      }
    });
  };
  tokenInfo = async (): Promise<TokenInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      token_info: {}
    });
  };
  minter = async (): Promise<MinterResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      minter: {}
    });
  };
  allowance = async ({
    owner,
    spender
  }: {
    owner: string;
    spender: string;
  }): Promise<AllowanceResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      allowance: {
        owner,
        spender
      }
    });
  };
  allAllowances = async ({
    limit,
    owner,
    startAfter
  }: {
    limit?: number;
    owner: string;
    startAfter?: string;
  }): Promise<AllAllowancesResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_allowances: {
        limit,
        owner,
        start_after: startAfter
      }
    });
  };
  allAccounts = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<AllAccountsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_accounts: {
        limit,
        start_after: startAfter
      }
    });
  };
}
export interface TokenBseiInterface extends TokenBseiReadOnlyInterface {
  contractAddress: string;
  sender: string;
  transfer: ({
    amount,
    recipient
  }: {
    amount: Uint128;
    recipient: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  burn: ({
    amount
  }: {
    amount: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  send: ({
    amount,
    contract,
    msg
  }: {
    amount: Uint128;
    contract: string;
    msg: Binary;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  mint: ({
    amount,
    recipient
  }: {
    amount: Uint128;
    recipient: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  increaseAllowance: ({
    amount,
    expires,
    spender
  }: {
    amount: Uint128;
    expires?: Expiration;
    spender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  decreaseAllowance: ({
    amount,
    expires,
    spender
  }: {
    amount: Uint128;
    expires?: Expiration;
    spender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  transferFrom: ({
    amount,
    owner,
    recipient
  }: {
    amount: Uint128;
    owner: string;
    recipient: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  sendFrom: ({
    amount,
    contract,
    msg,
    owner
  }: {
    amount: Uint128;
    contract: string;
    msg: Binary;
    owner: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  burnFrom: ({
    amount,
    owner
  }: {
    amount: Uint128;
    owner: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class TokenBseiClient extends TokenBseiQueryClient implements TokenBseiInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.transfer = this.transfer.bind(this);
    this.burn = this.burn.bind(this);
    this.send = this.send.bind(this);
    this.mint = this.mint.bind(this);
    this.increaseAllowance = this.increaseAllowance.bind(this);
    this.decreaseAllowance = this.decreaseAllowance.bind(this);
    this.transferFrom = this.transferFrom.bind(this);
    this.sendFrom = this.sendFrom.bind(this);
    this.burnFrom = this.burnFrom.bind(this);
  }

  transfer = async ({
    amount,
    recipient
  }: {
    amount: Uint128;
    recipient: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      transfer: {
        amount,
        recipient
      }
    }, fee, memo, _funds);
  };
  burn = async ({
    amount
  }: {
    amount: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      burn: {
        amount
      }
    }, fee, memo, _funds);
  };
  send = async ({
    amount,
    contract,
    msg
  }: {
    amount: Uint128;
    contract: string;
    msg: Binary;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      send: {
        amount,
        contract,
        msg
      }
    }, fee, memo, _funds);
  };
  mint = async ({
    amount,
    recipient
  }: {
    amount: Uint128;
    recipient: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      mint: {
        amount,
        recipient
      }
    }, fee, memo, _funds);
  };
  increaseAllowance = async ({
    amount,
    expires,
    spender
  }: {
    amount: Uint128;
    expires?: Expiration;
    spender: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      increase_allowance: {
        amount,
        expires,
        spender
      }
    }, fee, memo, _funds);
  };
  decreaseAllowance = async ({
    amount,
    expires,
    spender
  }: {
    amount: Uint128;
    expires?: Expiration;
    spender: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      decrease_allowance: {
        amount,
        expires,
        spender
      }
    }, fee, memo, _funds);
  };
  transferFrom = async ({
    amount,
    owner,
    recipient
  }: {
    amount: Uint128;
    owner: string;
    recipient: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      transfer_from: {
        amount,
        owner,
        recipient
      }
    }, fee, memo, _funds);
  };
  sendFrom = async ({
    amount,
    contract,
    msg,
    owner
  }: {
    amount: Uint128;
    contract: string;
    msg: Binary;
    owner: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      send_from: {
        amount,
        contract,
        msg,
        owner
      }
    }, fee, memo, _funds);
  };
  burnFrom = async ({
    amount,
    owner
  }: {
    amount: Uint128;
    owner: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      burn_from: {
        amount,
        owner
      }
    }, fee, memo, _funds);
  };
}