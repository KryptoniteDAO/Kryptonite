/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  distribute_token: Addr;
  gov?: Addr | null;
  rule_configs_map: {
    [k: string]: RuleConfigMsg;
  };
  total_amount: number;
}
export interface RuleConfigMsg {
  lock_end_time: number;
  lock_start_time: number;
  rule_name: string;
  rule_owner: Addr;
  rule_total_amount: number;
  start_linear_release_time: number;
  start_release_amount: number;
  unlock_linear_release_amount: number;
  unlock_linear_release_time: number;
}
export type ExecuteMsg = {
  claim: {
    rule_type: string;
  };
} | {
  update_config: {
    distribute_token?: Addr | null;
    gov?: Addr | null;
  };
} | {
  update_rule_config: {
    update_rule_msg: UpdateRuleConfigMsg;
  };
} | {
  add_rule_config: {
    rule_msg: RuleConfigMsg;
    rule_type: string;
  };
};
export interface UpdateRuleConfigMsg {
  rule_name?: string | null;
  rule_owner?: Addr | null;
  rule_type: string;
}
export type QueryMsg = {
  query_claimable_info: {
    rule_type: string;
  };
} | {
  query_rule_info: {
    rule_type: string;
  };
} | {
  query_config: {};
};
export interface QueryClaimableInfoResponse {
  can_claim_amount: number;
  linear_release_amount: number;
  release_amount: number;
}
export interface QueryConfigResponse {
  distribute_token: Addr;
  gov: Addr;
  rules_total_amount: number;
  total_amount: number;
}
export interface QueryRuleInfoResponse {
  rule_config: RuleConfig;
  rule_config_state: RuleConfigState;
}
export interface RuleConfig {
  end_linear_release_time: number;
  linear_release_per_second: number;
  lock_end_time: number;
  lock_start_time: number;
  rule_name: string;
  rule_owner: Addr;
  rule_total_amount: number;
  start_linear_release_time: number;
  start_release_amount: number;
  unlock_linear_release_amount: number;
  unlock_linear_release_time: number;
  [k: string]: unknown;
}
export interface RuleConfigState {
  claimed_amount: number;
  is_start_release: boolean;
  last_claim_linear_release_time: number;
  released_amount: number;
  [k: string]: unknown;
}
export type KptDistributeExecuteMsg = ExecuteMsg;