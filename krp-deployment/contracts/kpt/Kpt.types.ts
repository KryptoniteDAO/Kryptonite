/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint128 = string;
export type Logo = {
  url: string;
} | {
  embedded: EmbeddedLogo;
};
export type EmbeddedLogo = {
  svg: Binary;
} | {
  png: Binary;
};
export type Binary = string;
export type Addr = string;
export interface InstantiateMsg {
  cw20_init_msg: InstantiateMsg1;
  gov?: Addr | null;
  kpt_distribute?: Addr | null;
  max_supply: number;
}
export interface InstantiateMsg1 {
  decimals: number;
  initial_balances: Cw20Coin[];
  marketing?: InstantiateMarketingInfo | null;
  mint?: MinterResponse | null;
  name: string;
  symbol: string;
}
export interface Cw20Coin {
  address: string;
  amount: Uint128;
}
export interface InstantiateMarketingInfo {
  description?: string | null;
  logo?: Logo | null;
  marketing?: string | null;
  project?: string | null;
}
export interface MinterResponse {
  cap?: Uint128 | null;
  minter: string;
}
export type ExecuteMsg = {
  update_config: {
    gov?: Addr | null;
    kpt_distribute?: Addr | null;
    kpt_fund?: Addr | null;
    max_supply?: Uint128 | null;
  };
} | {
  mint: {
    amount: Uint128;
    recipient: string;
  };
} | {
  burn: {
    amount: Uint128;
    user: string;
  };
} | {
  transfer: {
    amount: Uint128;
    recipient: string;
  };
} | {
  send: {
    amount: Uint128;
    contract: string;
    send_msg: Binary;
  };
} | {
  increase_allowance: {
    amount: Uint128;
    expires?: Expiration | null;
    spender: string;
  };
} | {
  decrease_allowance: {
    amount: Uint128;
    expires?: Expiration | null;
    spender: string;
  };
} | {
  transfer_from: {
    amount: Uint128;
    owner: string;
    recipient: string;
  };
} | {
  send_from: {
    amount: Uint128;
    contract: string;
    owner: string;
    send_msg: Binary;
  };
} | {
  update_minter: {
    new_minter?: string | null;
  };
} | {
  update_marketing: {
    description?: string | null;
    marketing?: string | null;
    project?: string | null;
  };
} | {
  upload_logo: Logo;
};
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export type Timestamp = Uint64;
export type Uint64 = string;
export type QueryMsg = {
  kpt_config: {};
} | {
  balance: {
    address: string;
  };
} | {
  token_info: {};
} | {
  minter: {};
} | {
  allowance: {
    owner: string;
    spender: string;
  };
} | {
  all_allowances: {
    limit?: number | null;
    owner: string;
    start_after?: string | null;
  };
} | {
  all_spender_allowances: {
    limit?: number | null;
    spender: string;
    start_after?: string | null;
  };
} | {
  all_accounts: {
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  marketing_info: {};
} | {
  download_logo: {};
};
export interface AllAccountsResponse {
  accounts: string[];
  [k: string]: unknown;
}
export interface AllAllowancesResponse {
  allowances: AllowanceInfo[];
  [k: string]: unknown;
}
export interface AllowanceInfo {
  allowance: Uint128;
  expires: Expiration;
  spender: string;
}
export interface AllSpenderAllowancesResponse {
  allowances: SpenderAllowanceInfo[];
  [k: string]: unknown;
}
export interface SpenderAllowanceInfo {
  allowance: Uint128;
  expires: Expiration;
  owner: string;
}
export interface AllowanceResponse {
  allowance: Uint128;
  expires: Expiration;
  [k: string]: unknown;
}
export interface BalanceResponse {
  balance: Uint128;
}
export interface DownloadLogoResponse {
  data: Binary;
  mime_type: string;
}
export interface KptConfigResponse {
  gov: Addr;
  kpt_distribute: Addr;
  kpt_fund: Addr;
  max_supply: number;
}
export type LogoInfo = {
  url: string;
} | "embedded";
export interface MarketingInfoResponse {
  description?: string | null;
  logo?: LogoInfo | null;
  marketing?: Addr | null;
  project?: string | null;
  [k: string]: unknown;
}
export interface TokenInfoResponse {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: Uint128;
}
export type KptExecuteMsg = ExecuteMsg;