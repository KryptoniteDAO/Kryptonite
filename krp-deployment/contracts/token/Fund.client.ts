/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Uint64, Addr, InstantiateMsg, ExecuteMsg, Uint128, Binary, Cw20ReceiveMsg, UpdateConfigMsg, QueryMsg, EarnedResponse, FundConfigResponse, GetClaimAbleKusdResponse, GetClaimAbleSeilorResponse, GetReservedSeilorForVestingResponse, UserLastWithdrawTimeResponse, UserRewardPerTokenPaidResponse, UserRewardsResponse, UserTime2FullRedemptionResponse, Uint256, UserUnstakeRateResponse, Boolean } from "./Fund.types";
export interface FundReadOnlyInterface {
  contractAddress: string;
  fundConfig: () => Promise<FundConfigResponse>;
  getClaimAbleSeilor: ({
    user
  }: {
    user: Addr;
  }) => Promise<GetClaimAbleSeilorResponse>;
  getReservedSeilorForVesting: ({
    user
  }: {
    user: Addr;
  }) => Promise<GetReservedSeilorForVestingResponse>;
  earned: ({
    account
  }: {
    account: Addr;
  }) => Promise<EarnedResponse>;
  getClaimAbleKusd: ({
    account
  }: {
    account: Addr;
  }) => Promise<GetClaimAbleKusdResponse>;
  getUserRewardPerTokenPaid: ({
    account
  }: {
    account: Addr;
  }) => Promise<UserRewardPerTokenPaidResponse>;
  getUserRewards: ({
    account
  }: {
    account: Addr;
  }) => Promise<UserRewardsResponse>;
  getUserTime2fullRedemption: ({
    account
  }: {
    account: Addr;
  }) => Promise<UserTime2FullRedemptionResponse>;
  getUserUnstakeRate: ({
    account
  }: {
    account: Addr;
  }) => Promise<UserUnstakeRateResponse>;
  getUserLastWithdrawTime: ({
    account
  }: {
    account: Addr;
  }) => Promise<UserLastWithdrawTimeResponse>;
  isVeFundMinter: ({
    minter
  }: {
    minter: Addr;
  }) => Promise<Boolean>;
}
export class FundQueryClient implements FundReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.fundConfig = this.fundConfig.bind(this);
    this.getClaimAbleSeilor = this.getClaimAbleSeilor.bind(this);
    this.getReservedSeilorForVesting = this.getReservedSeilorForVesting.bind(this);
    this.earned = this.earned.bind(this);
    this.getClaimAbleKusd = this.getClaimAbleKusd.bind(this);
    this.getUserRewardPerTokenPaid = this.getUserRewardPerTokenPaid.bind(this);
    this.getUserRewards = this.getUserRewards.bind(this);
    this.getUserTime2fullRedemption = this.getUserTime2fullRedemption.bind(this);
    this.getUserUnstakeRate = this.getUserUnstakeRate.bind(this);
    this.getUserLastWithdrawTime = this.getUserLastWithdrawTime.bind(this);
    this.isVeFundMinter = this.isVeFundMinter.bind(this);
  }

  fundConfig = async (): Promise<FundConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      fund_config: {}
    });
  };
  getClaimAbleSeilor = async ({
    user
  }: {
    user: Addr;
  }): Promise<GetClaimAbleSeilorResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_claim_able_seilor: {
        user
      }
    });
  };
  getReservedSeilorForVesting = async ({
    user
  }: {
    user: Addr;
  }): Promise<GetReservedSeilorForVestingResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_reserved_seilor_for_vesting: {
        user
      }
    });
  };
  earned = async ({
    account
  }: {
    account: Addr;
  }): Promise<EarnedResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      earned: {
        account
      }
    });
  };
  getClaimAbleKusd = async ({
    account
  }: {
    account: Addr;
  }): Promise<GetClaimAbleKusdResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_claim_able_kusd: {
        account
      }
    });
  };
  getUserRewardPerTokenPaid = async ({
    account
  }: {
    account: Addr;
  }): Promise<UserRewardPerTokenPaidResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_user_reward_per_token_paid: {
        account
      }
    });
  };
  getUserRewards = async ({
    account
  }: {
    account: Addr;
  }): Promise<UserRewardsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_user_rewards: {
        account
      }
    });
  };
  getUserTime2fullRedemption = async ({
    account
  }: {
    account: Addr;
  }): Promise<UserTime2FullRedemptionResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_user_time2full_redemption: {
        account
      }
    });
  };
  getUserUnstakeRate = async ({
    account
  }: {
    account: Addr;
  }): Promise<UserUnstakeRateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_user_unstake_rate: {
        account
      }
    });
  };
  getUserLastWithdrawTime = async ({
    account
  }: {
    account: Addr;
  }): Promise<UserLastWithdrawTimeResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_user_last_withdraw_time: {
        account
      }
    });
  };
  isVeFundMinter = async ({
    minter
  }: {
    minter: Addr;
  }): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      is_ve_fund_minter: {
        minter
      }
    });
  };
}
export interface FundInterface {
  contractAddress: string;
  sender: string;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateFundConfig: ({
    updateConfigMsg
  }: {
    updateConfigMsg: UpdateConfigMsg;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  refreshReward: ({
    account
  }: {
    account: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  unstake: ({
    amount
  }: {
    amount: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdraw: ({
    user
  }: {
    user: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  reStake: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  getReward: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  notifyRewardAmount: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setGov: ({
    gov
  }: {
    gov: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  acceptGov: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setVeFundMinter: ({
    isVeMinter,
    minter
  }: {
    isVeMinter: boolean;
    minter: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  veFundMint: ({
    amount,
    user
  }: {
    amount: Uint128;
    user: Addr;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class FundClient implements FundInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.updateFundConfig = this.updateFundConfig.bind(this);
    this.refreshReward = this.refreshReward.bind(this);
    this.unstake = this.unstake.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.reStake = this.reStake.bind(this);
    this.getReward = this.getReward.bind(this);
    this.notifyRewardAmount = this.notifyRewardAmount.bind(this);
    this.setGov = this.setGov.bind(this);
    this.acceptGov = this.acceptGov.bind(this);
    this.setVeFundMinter = this.setVeFundMinter.bind(this);
    this.veFundMint = this.veFundMint.bind(this);
  }

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
  updateFundConfig = async ({
    updateConfigMsg
  }: {
    updateConfigMsg: UpdateConfigMsg;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_fund_config: {
        update_config_msg: updateConfigMsg
      }
    }, fee, memo, _funds);
  };
  refreshReward = async ({
    account
  }: {
    account: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      refresh_reward: {
        account
      }
    }, fee, memo, _funds);
  };
  unstake = async ({
    amount
  }: {
    amount: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      unstake: {
        amount
      }
    }, fee, memo, _funds);
  };
  withdraw = async ({
    user
  }: {
    user: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw: {
        user
      }
    }, fee, memo, _funds);
  };
  reStake = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      re_stake: {}
    }, fee, memo, _funds);
  };
  getReward = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      get_reward: {}
    }, fee, memo, _funds);
  };
  notifyRewardAmount = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      notify_reward_amount: {}
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
  setVeFundMinter = async ({
    isVeMinter,
    minter
  }: {
    isVeMinter: boolean;
    minter: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_ve_fund_minter: {
        is_ve_minter: isVeMinter,
        minter
      }
    }, fee, memo, _funds);
  };
  veFundMint = async ({
    amount,
    user
  }: {
    amount: Uint128;
    user: Addr;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      ve_fund_mint: {
        amount,
        user
      }
    }, fee, memo, _funds);
  };
}
