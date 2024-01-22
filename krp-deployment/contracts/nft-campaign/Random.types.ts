/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  owner?: Addr | null;
  pairs: Addr[];
}
export type ExecuteMsg = {
  set_pair: {
    add_or_remove: boolean;
    pair: Addr;
  };
};
export type QueryMsg = {
  query_config: {};
} | {
  get_random_number: {
    seed?: string | null;
  };
};
export type Uint64 = number;
export interface Config {
  pairs: Addr[];
}
export type RandomExecuteMsg = ExecuteMsg;