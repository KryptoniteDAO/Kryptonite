/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Addr, Uint128, InstantiateMsg, Metadata, Trait, RandomConfig, ExecuteMsg, Binary, UpdateConfigMsg, Cw20ReceiveMsg, QueryMsg, Empty, Expiration, Timestamp, Uint64, AllNftInfoResponseForEmpty, OwnerOfResponse, Approval, NftInfoResponseForEmpty, OperatorsResponse, TokensResponse, ApprovalResponse, ApprovalsResponse, ContractInfoResponse, Null, MinterResponse, NumTokensResponse, OperatorResponse, Config } from "./DragonPart.types";
export interface DragonPartReadOnlyInterface {
  contractAddress: string;
  ownerOf: ({
    includeExpired,
    tokenId
  }: {
    includeExpired?: boolean;
    tokenId: string;
  }) => Promise<OwnerOfResponse>;
  approval: ({
    includeExpired,
    spender,
    tokenId
  }: {
    includeExpired?: boolean;
    spender: string;
    tokenId: string;
  }) => Promise<ApprovalResponse>;
  approvals: ({
    includeExpired,
    tokenId
  }: {
    includeExpired?: boolean;
    tokenId: string;
  }) => Promise<ApprovalsResponse>;
  operator: ({
    includeExpired,
    operator,
    owner
  }: {
    includeExpired?: boolean;
    operator: string;
    owner: string;
  }) => Promise<OperatorResponse>;
  allOperators: ({
    includeExpired,
    limit,
    owner,
    startAfter
  }: {
    includeExpired?: boolean;
    limit?: number;
    owner: string;
    startAfter?: string;
  }) => Promise<OperatorsResponse>;
  numTokens: () => Promise<NumTokensResponse>;
  contractInfo: () => Promise<ContractInfoResponse>;
  nftInfo: ({
    tokenId
  }: {
    tokenId: string;
  }) => Promise<NftInfoResponseForEmpty>;
  allNftInfo: ({
    includeExpired,
    tokenId
  }: {
    includeExpired?: boolean;
    tokenId: string;
  }) => Promise<AllNftInfoResponseForEmpty>;
  tokens: ({
    limit,
    owner,
    startAfter
  }: {
    limit?: number;
    owner: string;
    startAfter?: string;
  }) => Promise<TokensResponse>;
  allTokens: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<TokensResponse>;
  minter: () => Promise<MinterResponse>;
  extension: ({
    msg
  }: {
    msg: Empty;
  }) => Promise<Null>;
  queryConfig: () => Promise<Config>;
}
export class DragonPartQueryClient implements DragonPartReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.ownerOf = this.ownerOf.bind(this);
    this.approval = this.approval.bind(this);
    this.approvals = this.approvals.bind(this);
    this.operator = this.operator.bind(this);
    this.allOperators = this.allOperators.bind(this);
    this.numTokens = this.numTokens.bind(this);
    this.contractInfo = this.contractInfo.bind(this);
    this.nftInfo = this.nftInfo.bind(this);
    this.allNftInfo = this.allNftInfo.bind(this);
    this.tokens = this.tokens.bind(this);
    this.allTokens = this.allTokens.bind(this);
    this.minter = this.minter.bind(this);
    this.extension = this.extension.bind(this);
    this.queryConfig = this.queryConfig.bind(this);
  }

  ownerOf = async ({
    includeExpired,
    tokenId
  }: {
    includeExpired?: boolean;
    tokenId: string;
  }): Promise<OwnerOfResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      owner_of: {
        include_expired: includeExpired,
        token_id: tokenId
      }
    });
  };
  approval = async ({
    includeExpired,
    spender,
    tokenId
  }: {
    includeExpired?: boolean;
    spender: string;
    tokenId: string;
  }): Promise<ApprovalResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      approval: {
        include_expired: includeExpired,
        spender,
        token_id: tokenId
      }
    });
  };
  approvals = async ({
    includeExpired,
    tokenId
  }: {
    includeExpired?: boolean;
    tokenId: string;
  }): Promise<ApprovalsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      approvals: {
        include_expired: includeExpired,
        token_id: tokenId
      }
    });
  };
  operator = async ({
    includeExpired,
    operator,
    owner
  }: {
    includeExpired?: boolean;
    operator: string;
    owner: string;
  }): Promise<OperatorResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      operator: {
        include_expired: includeExpired,
        operator,
        owner
      }
    });
  };
  allOperators = async ({
    includeExpired,
    limit,
    owner,
    startAfter
  }: {
    includeExpired?: boolean;
    limit?: number;
    owner: string;
    startAfter?: string;
  }): Promise<OperatorsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_operators: {
        include_expired: includeExpired,
        limit,
        owner,
        start_after: startAfter
      }
    });
  };
  numTokens = async (): Promise<NumTokensResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      num_tokens: {}
    });
  };
  contractInfo = async (): Promise<ContractInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      contract_info: {}
    });
  };
  nftInfo = async ({
    tokenId
  }: {
    tokenId: string;
  }): Promise<NftInfoResponseForEmpty> => {
    return this.client.queryContractSmart(this.contractAddress, {
      nft_info: {
        token_id: tokenId
      }
    });
  };
  allNftInfo = async ({
    includeExpired,
    tokenId
  }: {
    includeExpired?: boolean;
    tokenId: string;
  }): Promise<AllNftInfoResponseForEmpty> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_nft_info: {
        include_expired: includeExpired,
        token_id: tokenId
      }
    });
  };
  tokens = async ({
    limit,
    owner,
    startAfter
  }: {
    limit?: number;
    owner: string;
    startAfter?: string;
  }): Promise<TokensResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      tokens: {
        limit,
        owner,
        start_after: startAfter
      }
    });
  };
  allTokens = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<TokensResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_tokens: {
        limit,
        start_after: startAfter
      }
    });
  };
  minter = async (): Promise<MinterResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      minter: {}
    });
  };
  extension = async ({
    msg
  }: {
    msg: Empty;
  }): Promise<Null> => {
    return this.client.queryContractSmart(this.contractAddress, {
      extension: {
        msg
      }
    });
  };
  queryConfig = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_config: {}
    });
  };
}
export interface DragonPartInterface {
  contractAddress: string;
  sender: string;
  burn: ({
    tokenId
  }: {
    tokenId: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateConfig: ({
    config
  }: {
    config: UpdateConfigMsg;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setGov: ({
    gov
  }: {
    gov: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  acceptGov: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class DragonPartClient implements DragonPartInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.burn = this.burn.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.receive = this.receive.bind(this);
    this.setGov = this.setGov.bind(this);
    this.acceptGov = this.acceptGov.bind(this);
  }

  burn = async ({
    tokenId
  }: {
    tokenId: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      burn: {
        token_id: tokenId
      }
    }, fee, memo, _funds);
  };
  updateConfig = async ({
    config
  }: {
    config: UpdateConfigMsg;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        config
      }
    }, fee, memo, _funds);
  };
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
  setGov = async ({
    gov
  }: {
    gov: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_gov: {
        gov
      }
    }, fee, memo, _funds);
  };
  acceptGov = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      accept_gov: {}
    }, fee, memo, _funds);
  };
}