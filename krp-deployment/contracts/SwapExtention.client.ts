/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/amino";
import { Addr, InstantiateMsg, ExecuteMsg, AssetInfo, Decimal, Uint128, Coin, QueryMsg, Asset, ConfigResponse, CumulativePricesResponse, Boolean, PairConfigResponse, ReverseSimulationResponse, SimulationResponse, SwapInfoResponse } from "./SwapExtention.types";
export interface SwapExtentionReadOnlyInterface {
  contractAddress: string;
  queryConfig: () => Promise<ConfigResponse>;
  queryIsSwapWhitelist: ({
    caller
  }: {
    caller: Addr;
  }) => Promise<Boolean>;
  queryPairConfig: ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }) => Promise<PairConfigResponse>;
  querySwapInfo: ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }) => Promise<SwapInfoResponse>;
  querySimulation: ({
    assetInfos,
    offerAsset
  }: {
    assetInfos: AssetInfo[];
    offerAsset: Asset;
  }) => Promise<SimulationResponse>;
  queryReverseSimulation: ({
    askAsset,
    assetInfos
  }: {
    askAsset: Asset;
    assetInfos: AssetInfo[];
  }) => Promise<ReverseSimulationResponse>;
  queryCumulativePrices: ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }) => Promise<CumulativePricesResponse>;
}
export class SwapExtentionQueryClient implements SwapExtentionReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.queryConfig = this.queryConfig.bind(this);
    this.queryIsSwapWhitelist = this.queryIsSwapWhitelist.bind(this);
    this.queryPairConfig = this.queryPairConfig.bind(this);
    this.querySwapInfo = this.querySwapInfo.bind(this);
    this.querySimulation = this.querySimulation.bind(this);
    this.queryReverseSimulation = this.queryReverseSimulation.bind(this);
    this.queryCumulativePrices = this.queryCumulativePrices.bind(this);
  }

  queryConfig = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_config: {}
    });
  };
  queryIsSwapWhitelist = async ({
    caller
  }: {
    caller: Addr;
  }): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_is_swap_whitelist: {
        caller
      }
    });
  };
  queryPairConfig = async ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }): Promise<PairConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_pair_config: {
        asset_infos: assetInfos
      }
    });
  };
  querySwapInfo = async ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }): Promise<SwapInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_swap_info: {
        asset_infos: assetInfos
      }
    });
  };
  querySimulation = async ({
    assetInfos,
    offerAsset
  }: {
    assetInfos: AssetInfo[];
    offerAsset: Asset;
  }): Promise<SimulationResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_simulation: {
        asset_infos: assetInfos,
        offer_asset: offerAsset
      }
    });
  };
  queryReverseSimulation = async ({
    askAsset,
    assetInfos
  }: {
    askAsset: Asset;
    assetInfos: AssetInfo[];
  }): Promise<ReverseSimulationResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_reverse_simulation: {
        ask_asset: askAsset,
        asset_infos: assetInfos
      }
    });
  };
  queryCumulativePrices = async ({
    assetInfos
  }: {
    assetInfos: AssetInfo[];
  }): Promise<CumulativePricesResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_cumulative_prices: {
        asset_infos: assetInfos
      }
    });
  };
}
export interface SwapExtentionInterface {
  contractAddress: string;
  sender: string;
  updatePairConfig: ({
    assetInfos,
    maxSpread,
    pairAddress,
    to
  }: {
    assetInfos: AssetInfo[];
    maxSpread?: Decimal;
    pairAddress: Addr;
    to?: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  changeOwner: ({
    newOwner
  }: {
    newOwner: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updatePairStatus: ({
    assetInfos,
    isDisabled
  }: {
    assetInfos: AssetInfo[];
    isDisabled: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updatePairMaxSpread: ({
    assetInfos,
    maxSpread
  }: {
    assetInfos: AssetInfo[];
    maxSpread: Decimal;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setWhitelist: ({
    caller,
    isWhitelist
  }: {
    caller: Addr;
    isWhitelist: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  swapDenom: ({
    fromCoin,
    targetDenom
  }: {
    fromCoin: Coin;
    targetDenom: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class SwapExtentionClient implements SwapExtentionInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updatePairConfig = this.updatePairConfig.bind(this);
    this.changeOwner = this.changeOwner.bind(this);
    this.updatePairStatus = this.updatePairStatus.bind(this);
    this.updatePairMaxSpread = this.updatePairMaxSpread.bind(this);
    this.setWhitelist = this.setWhitelist.bind(this);
    this.swapDenom = this.swapDenom.bind(this);
  }

  updatePairConfig = async ({
    assetInfos,
    maxSpread,
    pairAddress,
    to
  }: {
    assetInfos: AssetInfo[];
    maxSpread?: Decimal;
    pairAddress: Addr;
    to?: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_pair_config: {
        asset_infos: assetInfos,
        max_spread: maxSpread,
        pair_address: pairAddress,
        to
      }
    }, fee, memo, _funds);
  };
  changeOwner = async ({
    newOwner
  }: {
    newOwner: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      change_owner: {
        new_owner: newOwner
      }
    }, fee, memo, _funds);
  };
  updatePairStatus = async ({
    assetInfos,
    isDisabled
  }: {
    assetInfos: AssetInfo[];
    isDisabled: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_pair_status: {
        asset_infos: assetInfos,
        is_disabled: isDisabled
      }
    }, fee, memo, _funds);
  };
  updatePairMaxSpread = async ({
    assetInfos,
    maxSpread
  }: {
    assetInfos: AssetInfo[];
    maxSpread: Decimal;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_pair_max_spread: {
        asset_infos: assetInfos,
        max_spread: maxSpread
      }
    }, fee, memo, _funds);
  };
  setWhitelist = async ({
    caller,
    isWhitelist
  }: {
    caller: Addr;
    isWhitelist: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_whitelist: {
        caller,
        is_whitelist: isWhitelist
      }
    }, fee, memo, _funds);
  };
  swapDenom = async ({
    fromCoin,
    targetDenom
  }: {
    fromCoin: Coin;
    targetDenom: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      swap_denom: {
        from_coin: fromCoin,
        target_denom: targetDenom
      }
    }, fee, memo, _funds);
  };
}