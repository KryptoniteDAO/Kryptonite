/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Decimal256, InstantiateMsg, ExecuteMsg, Uint128, QueryMsg, CollateralAvailableRespone, WhitelistElemResponse, ConfigResponse, Uint256, LoanInfoResponse, MinterCollateralResponse, RedemptionProviderListRespone, MinterLoanResponse, WhitelistResponse } from "./CentralControl.types";
export interface CentralControlReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  loanInfo: ({
    minter
  }: {
    minter: string;
  }) => Promise<LoanInfoResponse>;
  collateralElem: ({
    collateral
  }: {
    collateral: string;
  }) => Promise<WhitelistElemResponse>;
  whitelist: ({
    collateralContract,
    limit,
    startAfter
  }: {
    collateralContract?: string;
    limit?: number;
    startAfter?: string;
  }) => Promise<WhitelistResponse>;
  minterCollateral: ({
    minter
  }: {
    minter: string;
  }) => Promise<MinterCollateralResponse>;
  redemptionProviderList: ({
    limit,
    minter,
    startAfter
  }: {
    limit?: number;
    minter?: string;
    startAfter?: string;
  }) => Promise<RedemptionProviderListRespone>;
  collateralAvailable: ({
    collateralContract,
    minter
  }: {
    collateralContract: string;
    minter: string;
  }) => Promise<CollateralAvailableRespone>;
}
export class CentralControlQueryClient implements CentralControlReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.loanInfo = this.loanInfo.bind(this);
    this.collateralElem = this.collateralElem.bind(this);
    this.whitelist = this.whitelist.bind(this);
    this.minterCollateral = this.minterCollateral.bind(this);
    this.redemptionProviderList = this.redemptionProviderList.bind(this);
    this.collateralAvailable = this.collateralAvailable.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  loanInfo = async ({
    minter
  }: {
    minter: string;
  }): Promise<LoanInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      loan_info: {
        minter
      }
    });
  };
  collateralElem = async ({
    collateral
  }: {
    collateral: string;
  }): Promise<WhitelistElemResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      collateral_elem: {
        collateral
      }
    });
  };
  whitelist = async ({
    collateralContract,
    limit,
    startAfter
  }: {
    collateralContract?: string;
    limit?: number;
    startAfter?: string;
  }): Promise<WhitelistResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      whitelist: {
        collateral_contract: collateralContract,
        limit,
        start_after: startAfter
      }
    });
  };
  minterCollateral = async ({
    minter
  }: {
    minter: string;
  }): Promise<MinterCollateralResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      minter_collateral: {
        minter
      }
    });
  };
  redemptionProviderList = async ({
    limit,
    minter,
    startAfter
  }: {
    limit?: number;
    minter?: string;
    startAfter?: string;
  }): Promise<RedemptionProviderListRespone> => {
    return this.client.queryContractSmart(this.contractAddress, {
      redemption_provider_list: {
        limit,
        minter,
        start_after: startAfter
      }
    });
  };
  collateralAvailable = async ({
    collateralContract,
    minter
  }: {
    collateralContract: string;
    minter: string;
  }): Promise<CollateralAvailableRespone> => {
    return this.client.queryContractSmart(this.contractAddress, {
      collateral_available: {
        collateral_contract: collateralContract,
        minter
      }
    });
  };
}
export interface CentralControlInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    epochPeriod,
    liquidationContract,
    oracleContract,
    ownerAddr,
    poolContract,
    redeemFee,
    stableDenom
  }: {
    epochPeriod?: number;
    liquidationContract?: string;
    oracleContract?: string;
    ownerAddr?: string;
    poolContract?: string;
    redeemFee?: Decimal256;
    stableDenom?: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  mintStableCoin: ({
    collateralAmount,
    collateralContract,
    isRedemptionProvider,
    minter,
    stableAmount
  }: {
    collateralAmount?: Uint128;
    collateralContract?: string;
    isRedemptionProvider?: boolean;
    minter: string;
    stableAmount: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  becomeRedemptionProvider: ({
    isRedemptionProvider
  }: {
    isRedemptionProvider: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  repayStableCoin: ({
    amount,
    sender
  }: {
    amount: Uint128;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  redeemStableCoin: ({
    amount,
    minter,
    redeemer
  }: {
    amount: Uint128;
    minter: string;
    redeemer: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdrawCollateral: ({
    collateralAmount,
    collateralContract
  }: {
    collateralAmount: Uint128;
    collateralContract: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  depositCollateral: ({
    collateralAmount,
    collateralContract,
    minter
  }: {
    collateralAmount: Uint128;
    collateralContract: string;
    minter: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  liquidateCollateral: ({
    minter
  }: {
    minter: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  whitelistCollateral: ({
    collateralContract,
    custodyContract,
    maxLtv,
    name,
    rewardBookContract,
    symbol
  }: {
    collateralContract: string;
    custodyContract: string;
    maxLtv: Decimal256;
    name: string;
    rewardBookContract: string;
    symbol: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class CentralControlClient implements CentralControlInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.mintStableCoin = this.mintStableCoin.bind(this);
    this.becomeRedemptionProvider = this.becomeRedemptionProvider.bind(this);
    this.repayStableCoin = this.repayStableCoin.bind(this);
    this.redeemStableCoin = this.redeemStableCoin.bind(this);
    this.withdrawCollateral = this.withdrawCollateral.bind(this);
    this.depositCollateral = this.depositCollateral.bind(this);
    this.liquidateCollateral = this.liquidateCollateral.bind(this);
    this.whitelistCollateral = this.whitelistCollateral.bind(this);
  }

  updateConfig = async ({
    epochPeriod,
    liquidationContract,
    oracleContract,
    ownerAddr,
    poolContract,
    redeemFee,
    stableDenom
  }: {
    epochPeriod?: number;
    liquidationContract?: string;
    oracleContract?: string;
    ownerAddr?: string;
    poolContract?: string;
    redeemFee?: Decimal256;
    stableDenom?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        epoch_period: epochPeriod,
        liquidation_contract: liquidationContract,
        oracle_contract: oracleContract,
        owner_addr: ownerAddr,
        pool_contract: poolContract,
        redeem_fee: redeemFee,
        stable_denom: stableDenom
      }
    }, fee, memo, _funds);
  };
  mintStableCoin = async ({
    collateralAmount,
    collateralContract,
    isRedemptionProvider,
    minter,
    stableAmount
  }: {
    collateralAmount?: Uint128;
    collateralContract?: string;
    isRedemptionProvider?: boolean;
    minter: string;
    stableAmount: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      mint_stable_coin: {
        collateral_amount: collateralAmount,
        collateral_contract: collateralContract,
        is_redemption_provider: isRedemptionProvider,
        minter,
        stable_amount: stableAmount
      }
    }, fee, memo, _funds);
  };
  becomeRedemptionProvider = async ({
    isRedemptionProvider
  }: {
    isRedemptionProvider: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      become_redemption_provider: {
        is_redemption_provider: isRedemptionProvider
      }
    }, fee, memo, _funds);
  };
  repayStableCoin = async ({
    amount,
    sender
  }: {
    amount: Uint128;
    sender: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      repay_stable_coin: {
        amount,
        sender
      }
    }, fee, memo, _funds);
  };
  redeemStableCoin = async ({
    amount,
    minter,
    redeemer
  }: {
    amount: Uint128;
    minter: string;
    redeemer: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      redeem_stable_coin: {
        amount,
        minter,
        redeemer
      }
    }, fee, memo, _funds);
  };
  withdrawCollateral = async ({
    collateralAmount,
    collateralContract
  }: {
    collateralAmount: Uint128;
    collateralContract: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw_collateral: {
        collateral_amount: collateralAmount,
        collateral_contract: collateralContract
      }
    }, fee, memo, _funds);
  };
  depositCollateral = async ({
    collateralAmount,
    collateralContract,
    minter
  }: {
    collateralAmount: Uint128;
    collateralContract: string;
    minter: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      deposit_collateral: {
        collateral_amount: collateralAmount,
        collateral_contract: collateralContract,
        minter
      }
    }, fee, memo, _funds);
  };
  liquidateCollateral = async ({
    minter
  }: {
    minter: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      liquidate_collateral: {
        minter
      }
    }, fee, memo, _funds);
  };
  whitelistCollateral = async ({
    collateralContract,
    custodyContract,
    maxLtv,
    name,
    rewardBookContract,
    symbol
  }: {
    collateralContract: string;
    custodyContract: string;
    maxLtv: Decimal256;
    name: string;
    rewardBookContract: string;
    symbol: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      whitelist_collateral: {
        collateral_contract: collateralContract,
        custody_contract: custodyContract,
        max_ltv: maxLtv,
        name,
        reward_book_contract: rewardBookContract,
        symbol
      }
    }, fee, memo, _funds);
  };
}