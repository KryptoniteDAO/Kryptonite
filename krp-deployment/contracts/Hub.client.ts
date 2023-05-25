/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/amino";
import { Uint128, Decimal, AllHistoryResponse, UnbondHistoryResponse, CanonicalAddr, Binary, Config, CurrentBatchResponse, ExecuteMsg, Cw20ReceiveMsg, Coin, InstantiateMsg, MigrateMsg, Parameters, QueryMsg, StateResponse, State, UnbondRequestsResponse, WithdrawableUnbondedResponse } from "./Hub.types";
export interface HubReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  state: () => Promise<StateResponse>;
  currentBatch: () => Promise<CurrentBatchResponse>;
  withdrawableUnbonded: ({
    address
  }: {
    address: string;
  }) => Promise<WithdrawableUnbondedResponse>;
  parameters: () => Promise<ParametersResponse>;
  unbondRequests: ({
    address
  }: {
    address: string;
  }) => Promise<UnbondRequestsResponse>;
  allHistory: ({
    limit,
    startFrom
  }: {
    limit?: number;
    startFrom?: number;
  }) => Promise<AllHistoryResponse>;
}
export class HubQueryClient implements HubReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.state = this.state.bind(this);
    this.currentBatch = this.currentBatch.bind(this);
    this.withdrawableUnbonded = this.withdrawableUnbonded.bind(this);
    this.parameters = this.parameters.bind(this);
    this.unbondRequests = this.unbondRequests.bind(this);
    this.allHistory = this.allHistory.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  state = async (): Promise<StateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      state: {}
    });
  };
  currentBatch = async (): Promise<CurrentBatchResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      current_batch: {}
    });
  };
  withdrawableUnbonded = async ({
    address
  }: {
    address: string;
  }): Promise<WithdrawableUnbondedResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      withdrawable_unbonded: {
        address
      }
    });
  };
  parameters = async (): Promise<ParametersResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      parameters: {}
    });
  };
  unbondRequests = async ({
    address
  }: {
    address: string;
  }): Promise<UnbondRequestsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      unbond_requests: {
        address
      }
    });
  };
  allHistory = async ({
    limit,
    startFrom
  }: {
    limit?: number;
    startFrom?: number;
  }): Promise<AllHistoryResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_history: {
        limit,
        start_from: startFrom
      }
    });
  };
}
export interface HubInterface extends HubReadOnlyInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    airdropRegistryContract,
    bseiTokenContract,
    owner,
    rewardsContract,
    rewardsDispatcherContract,
    stseiTokenContract,
    validatorsRegistryContract
  }: {
    airdropRegistryContract?: string;
    bseiTokenContract?: string;
    owner?: string;
    rewardsContract?: string;
    rewardsDispatcherContract?: string;
    stseiTokenContract?: string;
    validatorsRegistryContract?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateParams: ({
    epochPeriod,
    erThreshold,
    paused,
    pegRecoveryFee,
    unbondingPeriod
  }: {
    epochPeriod?: number;
    erThreshold?: Decimal;
    paused?: boolean;
    pegRecoveryFee?: Decimal;
    unbondingPeriod?: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  bond: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  bondForStSei: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  bondRewards: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateGlobalIndex: ({
    airdropHooks
  }: {
    airdropHooks?: Binary[];
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdrawUnbonded: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  checkSlashing: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  claimAirdrop: ({
    airdropContract,
    airdropSwapContract,
    airdropTokenContract,
    claimMsg,
    swapMsg
  }: {
    airdropContract: string;
    airdropSwapContract: string;
    airdropTokenContract: string;
    claimMsg: Binary;
    swapMsg: Binary;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  swapHook: ({
    airdropSwapContract,
    airdropTokenContract,
    swapMsg
  }: {
    airdropSwapContract: string;
    airdropTokenContract: string;
    swapMsg: Binary;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  redelegateProxy: ({
    redelegations,
    srcValidator
  }: {
    redelegations: string[][];
    srcValidator: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  migrateUnbondWaitList: ({
    limit
  }: {
    limit?: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class HubClient extends HubQueryClient implements HubInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.updateParams = this.updateParams.bind(this);
    this.bond = this.bond.bind(this);
    this.bondForStSei = this.bondForStSei.bind(this);
    this.bondRewards = this.bondRewards.bind(this);
    this.updateGlobalIndex = this.updateGlobalIndex.bind(this);
    this.withdrawUnbonded = this.withdrawUnbonded.bind(this);
    this.checkSlashing = this.checkSlashing.bind(this);
    this.receive = this.receive.bind(this);
    this.claimAirdrop = this.claimAirdrop.bind(this);
    this.swapHook = this.swapHook.bind(this);
    this.redelegateProxy = this.redelegateProxy.bind(this);
    this.migrateUnbondWaitList = this.migrateUnbondWaitList.bind(this);
  }

  updateConfig = async ({
    airdropRegistryContract,
    bseiTokenContract,
    owner,
    rewardsContract,
    rewardsDispatcherContract,
    stseiTokenContract,
    validatorsRegistryContract
  }: {
    airdropRegistryContract?: string;
    bseiTokenContract?: string;
    owner?: string;
    rewardsContract?: string;
    rewardsDispatcherContract?: string;
    stseiTokenContract?: string;
    validatorsRegistryContract?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        airdrop_registry_contract: airdropRegistryContract,
        bsei_token_contract: bseiTokenContract,
        owner,
        rewards_contract: rewardsContract,
        rewards_dispatcher_contract: rewardsDispatcherContract,
        stsei_token_contract: stseiTokenContract,
        validators_registry_contract: validatorsRegistryContract
      }
    }, fee, memo, _funds);
  };
  updateParams = async ({
    epochPeriod,
    erThreshold,
    paused,
    pegRecoveryFee,
    unbondingPeriod
  }: {
    epochPeriod?: number;
    erThreshold?: Decimal;
    paused?: boolean;
    pegRecoveryFee?: Decimal;
    unbondingPeriod?: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_params: {
        epoch_period: epochPeriod,
        er_threshold: erThreshold,
        paused,
        peg_recovery_fee: pegRecoveryFee,
        unbonding_period: unbondingPeriod
      }
    }, fee, memo, _funds);
  };
  bond = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      bond: {}
    }, fee, memo, _funds);
  };
  bondForStSei = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      bond_for_st_sei: {}
    }, fee, memo, _funds);
  };
  bondRewards = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      bond_rewards: {}
    }, fee, memo, _funds);
  };
  updateGlobalIndex = async ({
    airdropHooks
  }: {
    airdropHooks?: Binary[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_global_index: {
        airdrop_hooks: airdropHooks
      }
    }, fee, memo, _funds);
  };
  withdrawUnbonded = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw_unbonded: {}
    }, fee, memo, _funds);
  };
  checkSlashing = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      check_slashing: {}
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
  claimAirdrop = async ({
    airdropContract,
    airdropSwapContract,
    airdropTokenContract,
    claimMsg,
    swapMsg
  }: {
    airdropContract: string;
    airdropSwapContract: string;
    airdropTokenContract: string;
    claimMsg: Binary;
    swapMsg: Binary;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      claim_airdrop: {
        airdrop_contract: airdropContract,
        airdrop_swap_contract: airdropSwapContract,
        airdrop_token_contract: airdropTokenContract,
        claim_msg: claimMsg,
        swap_msg: swapMsg
      }
    }, fee, memo, _funds);
  };
  swapHook = async ({
    airdropSwapContract,
    airdropTokenContract,
    swapMsg
  }: {
    airdropSwapContract: string;
    airdropTokenContract: string;
    swapMsg: Binary;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      swap_hook: {
        airdrop_swap_contract: airdropSwapContract,
        airdrop_token_contract: airdropTokenContract,
        swap_msg: swapMsg
      }
    }, fee, memo, _funds);
  };
  redelegateProxy = async ({
    redelegations,
    srcValidator
  }: {
    redelegations: string[][];
    srcValidator: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      redelegate_proxy: {
        redelegations,
        src_validator: srcValidator
      }
    }, fee, memo, _funds);
  };
  migrateUnbondWaitList = async ({
    limit
  }: {
    limit?: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      migrate_unbond_wait_list: {
        limit
      }
    }, fee, memo, _funds);
  };
}