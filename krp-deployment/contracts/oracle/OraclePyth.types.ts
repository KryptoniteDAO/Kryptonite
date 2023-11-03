/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  owner: Addr;
  pyth_contract: string;
}
export type ExecuteMsg = {
  config_feed_info: {
    asset: string;
    check_feed_age: boolean;
    price_feed_age: number;
    price_feed_decimal: number;
    price_feed_id: string;
    price_feed_symbol: string;
  };
} | {
  set_config_feed_valid: {
    asset: string;
    valid: boolean;
  };
} | {
  change_pyth_contract: {
    pyth_contract: string;
  };
} | {
  set_owner: {
    owner: Addr;
  };
} | {
  accept_ownership: {};
};
export type QueryMsg = {
  query_price: {
    asset: string;
  };
} | {
  query_prices: {
    assets: string[];
  };
} | {
  query_config: {};
} | {
  query_pyth_feeder_config: {
    asset: string;
  };
} | {
  query_exchange_rate_by_asset_label: {
    base_label: string;
    quote_label: string;
  };
};
export interface ConfigResponse {
  new_owner?: string | null;
  owner: string;
  pyth_contract: string;
}
export type Decimal256 = string;
export interface PriceResponse {
  asset: string;
  emv_price: Decimal256;
  emv_price_raw: number;
  last_updated_base: number;
  last_updated_quote: number;
  price: Decimal256;
  price_raw: number;
}
export type ArrayOfPriceResponse = PriceResponse[];
export type Identifier = string;
export interface PythFeederConfigResponse {
  check_feed_age: boolean;
  is_valid: boolean;
  price_feed_age: number;
  price_feed_decimal: number;
  price_feed_id: Identifier;
  price_feed_symbol: string;
}
export type OraclePythExecuteMsg = ExecuteMsg;