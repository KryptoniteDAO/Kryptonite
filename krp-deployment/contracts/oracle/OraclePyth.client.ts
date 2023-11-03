/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Addr, InstantiateMsg, ExecuteMsg, QueryMsg, ConfigResponse, Decimal256, PriceResponse, ArrayOfPriceResponse, Identifier, PythFeederConfigResponse } from "./OraclePyth.types";
export interface OraclePythReadOnlyInterface {
  contractAddress: string;
  queryPrice: ({
    asset
  }: {
    asset: string;
  }) => Promise<PriceResponse>;
  queryPrices: ({
    assets
  }: {
    assets: string[];
  }) => Promise<ArrayOfPriceResponse>;
  queryConfig: () => Promise<ConfigResponse>;
  queryPythFeederConfig: ({
    asset
  }: {
    asset: string;
  }) => Promise<PythFeederConfigResponse>;
  queryExchangeRateByAssetLabel: ({
    baseLabel,
    quoteLabel
  }: {
    baseLabel: string;
    quoteLabel: string;
  }) => Promise<Decimal256>;
}
export class OraclePythQueryClient implements OraclePythReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.queryPrice = this.queryPrice.bind(this);
    this.queryPrices = this.queryPrices.bind(this);
    this.queryConfig = this.queryConfig.bind(this);
    this.queryPythFeederConfig = this.queryPythFeederConfig.bind(this);
    this.queryExchangeRateByAssetLabel = this.queryExchangeRateByAssetLabel.bind(this);
  }

  queryPrice = async ({
    asset
  }: {
    asset: string;
  }): Promise<PriceResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_price: {
        asset
      }
    });
  };
  queryPrices = async ({
    assets
  }: {
    assets: string[];
  }): Promise<ArrayOfPriceResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_prices: {
        assets
      }
    });
  };
  queryConfig = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_config: {}
    });
  };
  queryPythFeederConfig = async ({
    asset
  }: {
    asset: string;
  }): Promise<PythFeederConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_pyth_feeder_config: {
        asset
      }
    });
  };
  queryExchangeRateByAssetLabel = async ({
    baseLabel,
    quoteLabel
  }: {
    baseLabel: string;
    quoteLabel: string;
  }): Promise<Decimal256> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_exchange_rate_by_asset_label: {
        base_label: baseLabel,
        quote_label: quoteLabel
      }
    });
  };
}
export interface OraclePythInterface {
  contractAddress: string;
  sender: string;
  configFeedInfo: ({
    asset,
    checkFeedAge,
    priceFeedAge,
    priceFeedDecimal,
    priceFeedId,
    priceFeedSymbol
  }: {
    asset: string;
    checkFeedAge: boolean;
    priceFeedAge: number;
    priceFeedDecimal: number;
    priceFeedId: string;
    priceFeedSymbol: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setConfigFeedValid: ({
    asset,
    valid
  }: {
    asset: string;
    valid: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  changePythContract: ({
    pythContract
  }: {
    pythContract: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setOwner: ({
    owner
  }: {
    owner: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  acceptOwnership: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class OraclePythClient implements OraclePythInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.configFeedInfo = this.configFeedInfo.bind(this);
    this.setConfigFeedValid = this.setConfigFeedValid.bind(this);
    this.changePythContract = this.changePythContract.bind(this);
    this.setOwner = this.setOwner.bind(this);
    this.acceptOwnership = this.acceptOwnership.bind(this);
  }

  configFeedInfo = async ({
    asset,
    checkFeedAge,
    priceFeedAge,
    priceFeedDecimal,
    priceFeedId,
    priceFeedSymbol
  }: {
    asset: string;
    checkFeedAge: boolean;
    priceFeedAge: number;
    priceFeedDecimal: number;
    priceFeedId: string;
    priceFeedSymbol: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      config_feed_info: {
        asset,
        check_feed_age: checkFeedAge,
        price_feed_age: priceFeedAge,
        price_feed_decimal: priceFeedDecimal,
        price_feed_id: priceFeedId,
        price_feed_symbol: priceFeedSymbol
      }
    }, fee, memo, _funds);
  };
  setConfigFeedValid = async ({
    asset,
    valid
  }: {
    asset: string;
    valid: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_config_feed_valid: {
        asset,
        valid
      }
    }, fee, memo, _funds);
  };
  changePythContract = async ({
    pythContract
  }: {
    pythContract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      change_pyth_contract: {
        pyth_contract: pythContract
      }
    }, fee, memo, _funds);
  };
  setOwner = async ({
    owner
  }: {
    owner: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_owner: {
        owner
      }
    }, fee, memo, _funds);
  };
  acceptOwnership = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      accept_ownership: {}
    }, fee, memo, _funds);
  };
}