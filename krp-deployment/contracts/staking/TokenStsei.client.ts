/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { AllAccountsResponse, Uint128, Expiration, Timestamp, Uint64, AllAllowancesResponse, AllowanceInfo, AllSpenderAllowancesResponse, SpenderAllowanceInfo, AllowanceResponse, BalanceResponse, Cw20ExecuteMsg, Binary, Logo, EmbeddedLogo, DownloadLogoResponse, LogoInfo, Addr, MarketingInfoResponse, MinterResponse, QueryMsg, TokenInfoResponse, TokenInitMsg, Cw20Coin, InstantiateMarketingInfo } from "./TokenStsei.types";
export interface TokenStseiReadOnlyInterface {
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
  allSpenderAllowances: ({
    limit,
    spender,
    startAfter
  }: {
    limit?: number;
    spender: string;
    startAfter?: string;
  }) => Promise<AllSpenderAllowancesResponse>;
  allAccounts: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<AllAccountsResponse>;
  marketingInfo: () => Promise<MarketingInfoResponse>;
  downloadLogo: () => Promise<DownloadLogoResponse>;
}
export class TokenStseiQueryClient implements TokenStseiReadOnlyInterface {
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
    this.allSpenderAllowances = this.allSpenderAllowances.bind(this);
    this.allAccounts = this.allAccounts.bind(this);
    this.marketingInfo = this.marketingInfo.bind(this);
    this.downloadLogo = this.downloadLogo.bind(this);
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
  allSpenderAllowances = async ({
    limit,
    spender,
    startAfter
  }: {
    limit?: number;
    spender: string;
    startAfter?: string;
  }): Promise<AllSpenderAllowancesResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_spender_allowances: {
        limit,
        spender,
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
  marketingInfo = async (): Promise<MarketingInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      marketing_info: {}
    });
  };
  downloadLogo = async (): Promise<DownloadLogoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      download_logo: {}
    });
  };
}