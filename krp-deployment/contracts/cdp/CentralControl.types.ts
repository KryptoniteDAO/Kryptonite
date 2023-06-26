/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Decimal256 = string;
export interface InstantiateMsg {
  custody_contract: string;
  epoch_period: number;
  liquidation_contract: string;
  oracle_contract: string;
  owner_addr: string;
  pool_contract: string;
  redeem_fee: Decimal256;
  stable_denom: string;
}
export type ExecuteMsg = {
  update_config: {
    custody_contract?: string | null;
    epoch_period?: number | null;
    liquidation_contract?: string | null;
    oracle_contract?: string | null;
    owner_addr?: string | null;
    pool_contract?: string | null;
    redeem_fee?: Decimal256 | null;
  };
} | {
  mint_stable_coin: {
    collateral_amount?: Uint128 | null;
    collateral_contract?: string | null;
    is_redemption_provider?: boolean | null;
    minter: string;
    stable_amount: Uint128;
  };
} | {
  become_redemption_provider: {
    is_redemption_provider: boolean;
  };
} | {
  repay_stable_coin: {
    amount: Uint128;
    sender: string;
  };
} | {
  redeem_stable_coin: {
    amount: Uint128;
    minter: string;
    redeemer: string;
  };
} | {
  withdraw_collateral: {
    collateral_amount: Uint128;
    collateral_contract: string;
  };
} | {
  deposit_collateral: {
    collateral_amount: Uint128;
    collateral_contract: string;
    minter: string;
  };
} | {
  liquidate_collateral: {
    minter: string;
  };
} | {
  whitelist_collateral: {
    collateral_contract: string;
    custody_contract: string;
    max_ltv: Decimal256;
    name: string;
    symbol: string;
  };
};
export type Uint128 = string;
export type QueryMsg = {
  config: {};
} | {
  loan_info: {
    minter: string;
  };
} | {
  collateral_elem: {
    collateral: string;
  };
} | {
  whitelist: {
    collateral_contract?: string | null;
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  minter_collateral: {
    minter: string;
  };
};
export interface WhitelistElemResponse {
  collateral_contract: string;
  custody_contract: string;
  max_ltv: Decimal256;
  name: string;
  symbol: string;
}
export interface ConfigResponse {
  custody_contract: string;
  epoch_period: number;
  oracle_contract: string;
  owner_add: string;
  pool_contract: string;
}
export type Uint256 = string;
export interface LoanInfoResponse {
  loans: Uint256;
  max_mint_value: Uint256;
  minter: string;
}
export interface MinterCollateralResponse {
  collaterals: [string, Uint256][];
}
export interface WhitelistResponse {
  elems: WhitelistElemResponse[];
}
export type CentralControlExecuteMsg = ExecuteMsg;