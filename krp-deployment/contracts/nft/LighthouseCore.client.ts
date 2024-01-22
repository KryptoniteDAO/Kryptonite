/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Uint128, InstantiateMsg, ExecuteMsg, Addr, MintGroup, Creator, QueryMsg, MintInfo, Collection, CollectionsResponseForCollection, Config } from "./LighthouseCore.types";
export interface LighthouseCoreReadOnlyInterface {
  contractAddress: string;
  getConfig: () => Promise<Config>;
  getCollection: ({
    collection
  }: {
    collection: string;
  }) => Promise<Collection>;
  balanceOf: ({
    address,
    collection
  }: {
    address: Addr;
    collection: string;
  }) => Promise<MintInfo>;
  getCollections: ({
    limit,
    resultType,
    startAfter
  }: {
    limit?: number;
    resultType?: string;
    startAfter?: string;
  }) => Promise<CollectionsResponseForCollection>;
  getMinterOf: ({
    collection,
    tokenId
  }: {
    collection: string;
    tokenId: string;
  }) => Promise<Addr>;
}
export class LighthouseCoreQueryClient implements LighthouseCoreReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.getConfig = this.getConfig.bind(this);
    this.getCollection = this.getCollection.bind(this);
    this.balanceOf = this.balanceOf.bind(this);
    this.getCollections = this.getCollections.bind(this);
    this.getMinterOf = this.getMinterOf.bind(this);
  }

  getConfig = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_config: {}
    });
  };
  getCollection = async ({
    collection
  }: {
    collection: string;
  }): Promise<Collection> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_collection: {
        collection
      }
    });
  };
  balanceOf = async ({
    address,
    collection
  }: {
    address: Addr;
    collection: string;
  }): Promise<MintInfo> => {
    return this.client.queryContractSmart(this.contractAddress, {
      balance_of: {
        address,
        collection
      }
    });
  };
  getCollections = async ({
    limit,
    resultType,
    startAfter
  }: {
    limit?: number;
    resultType?: string;
    startAfter?: string;
  }): Promise<CollectionsResponseForCollection> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_collections: {
        limit,
        result_type: resultType,
        start_after: startAfter
      }
    });
  };
  getMinterOf = async ({
    collection,
    tokenId
  }: {
    collection: string;
    tokenId: string;
  }): Promise<Addr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_minter_of: {
        collection,
        token_id: tokenId
      }
    });
  };
}
export interface LighthouseCoreInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    fee,
    registerationOpen
  }: {
    fee?: Uint128;
    registerationOpen?: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  registerCollection: ({
    cw721Code,
    frozen,
    hiddenMetadata,
    iteratedUri,
    mintGroups,
    name,
    placeholderTokenUri,
    royaltyPercent,
    royaltyWallet,
    startOrder,
    supply,
    symbol,
    tokenUri
  }: {
    cw721Code: number;
    frozen: boolean;
    hiddenMetadata: boolean;
    iteratedUri: boolean;
    mintGroups: MintGroup[];
    name: string;
    placeholderTokenUri?: string;
    royaltyPercent: number;
    royaltyWallet: string;
    startOrder?: number;
    supply: number;
    symbol: string;
    tokenUri: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateCollection: ({
    collection,
    iteratedUri,
    mintGroups,
    name,
    royaltyPercent,
    royaltyWallet,
    startOrder,
    supply,
    symbol,
    tokenUri
  }: {
    collection: string;
    iteratedUri: boolean;
    mintGroups: MintGroup[];
    name: string;
    royaltyPercent: number;
    royaltyWallet: string;
    startOrder?: number;
    supply: number;
    symbol: string;
    tokenUri: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  mintNative: ({
    collection,
    group,
    hashedAddress,
    merkleProof,
    recipient
  }: {
    collection: string;
    group: string;
    hashedAddress?: number[];
    merkleProof?: number[][][];
    recipient?: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  unfreezeCollection: ({
    collection
  }: {
    collection: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  revealCollectionMetadata: ({
    collection
  }: {
    collection: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateRevealCollectionMetadata: ({
    collection,
    placeholderTokenUri
  }: {
    collection: string;
    placeholderTokenUri: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class LighthouseCoreClient implements LighthouseCoreInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.registerCollection = this.registerCollection.bind(this);
    this.updateCollection = this.updateCollection.bind(this);
    this.mintNative = this.mintNative.bind(this);
    this.unfreezeCollection = this.unfreezeCollection.bind(this);
    this.revealCollectionMetadata = this.revealCollectionMetadata.bind(this);
    this.updateRevealCollectionMetadata = this.updateRevealCollectionMetadata.bind(this);
  }

  updateConfig = async ({
    fee,
    registerationOpen
  }: {
    fee?: Uint128;
    registerationOpen?: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        fee,
        registeration_open: registerationOpen
      }
    }, fee, memo, _funds);
  };
  registerCollection = async ({
    cw721Code,
    frozen,
    hiddenMetadata,
    iteratedUri,
    mintGroups,
    name,
    placeholderTokenUri,
    royaltyPercent,
    royaltyWallet,
    startOrder,
    supply,
    symbol,
    tokenUri
  }: {
    cw721Code: number;
    frozen: boolean;
    hiddenMetadata: boolean;
    iteratedUri: boolean;
    mintGroups: MintGroup[];
    name: string;
    placeholderTokenUri?: string;
    royaltyPercent: number;
    royaltyWallet: string;
    startOrder?: number;
    supply: number;
    symbol: string;
    tokenUri: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      register_collection: {
        cw721_code: cw721Code,
        frozen,
        hidden_metadata: hiddenMetadata,
        iterated_uri: iteratedUri,
        mint_groups: mintGroups,
        name,
        placeholder_token_uri: placeholderTokenUri,
        royalty_percent: royaltyPercent,
        royalty_wallet: royaltyWallet,
        start_order: startOrder,
        supply,
        symbol,
        token_uri: tokenUri
      }
    }, fee, memo, _funds);
  };
  updateCollection = async ({
    collection,
    iteratedUri,
    mintGroups,
    name,
    royaltyPercent,
    royaltyWallet,
    startOrder,
    supply,
    symbol,
    tokenUri
  }: {
    collection: string;
    iteratedUri: boolean;
    mintGroups: MintGroup[];
    name: string;
    royaltyPercent: number;
    royaltyWallet: string;
    startOrder?: number;
    supply: number;
    symbol: string;
    tokenUri: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_collection: {
        collection,
        iterated_uri: iteratedUri,
        mint_groups: mintGroups,
        name,
        royalty_percent: royaltyPercent,
        royalty_wallet: royaltyWallet,
        start_order: startOrder,
        supply,
        symbol,
        token_uri: tokenUri
      }
    }, fee, memo, _funds);
  };
  mintNative = async ({
    collection,
    group,
    hashedAddress,
    merkleProof,
    recipient
  }: {
    collection: string;
    group: string;
    hashedAddress?: number[];
    merkleProof?: number[][][];
    recipient?: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      mint_native: {
        collection,
        group,
        hashed_address: hashedAddress,
        merkle_proof: merkleProof,
        recipient
      }
    }, fee, memo, _funds);
  };
  unfreezeCollection = async ({
    collection
  }: {
    collection: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      unfreeze_collection: {
        collection
      }
    }, fee, memo, _funds);
  };
  revealCollectionMetadata = async ({
    collection
  }: {
    collection: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      reveal_collection_metadata: {
        collection
      }
    }, fee, memo, _funds);
  };
  updateRevealCollectionMetadata = async ({
    collection,
    placeholderTokenUri
  }: {
    collection: string;
    placeholderTokenUri: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_reveal_collection_metadata: {
        collection,
        placeholder_token_uri: placeholderTokenUri
      }
    }, fee, memo, _funds);
  };
}