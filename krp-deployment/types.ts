import type { DirectSecp256k1Wallet, DirectSecp256k1HdWallet, AccountData } from "@cosmjs/proto-signing";
import type { GasPrice } from "@cosmjs/stargate";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { SigningStargateClient } from "@cosmjs/stargate";
import type { Coin } from "@cosmjs/amino";

export enum ChainId {
  LOCAL_SEI = "localsei",
  SEI_CHAIN = "sei-chain",
  ATLANTIC_2 = "atlantic-2",
  "localsei" = "localsei",
  "sei-chain" = "sei-chain",
  "atlantic-2" = "atlantic-2"
}

export type Balance = {
  address: string;
  balance: any;
};

export interface BaseCurrencyInfo {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export interface WalletData {
  nativeCurrency: BaseCurrencyInfo;
  LCD_ENDPOINT: string;
  RPC_ENDPOINT: string;
  chainId: string;
  gasPrice: GasPrice;

  wallet: DirectSecp256k1Wallet | DirectSecp256k1HdWallet;
  account: AccountData;
  address: string;
  signingCosmWasmClient: SigningCosmWasmClient | any;
  signingStargateClient: SigningStargateClient | any;

  wallet2: DirectSecp256k1Wallet | DirectSecp256k1HdWallet;
  account2: AccountData;
  address2: string;
  signingCosmWasmClient2: SigningCosmWasmClient | any;
  signingStargateClient2: SigningStargateClient | any;

  validator: string;
  stable_coin_denom: string;

  addressList: string[];
  denomList: string[];
  addressesBalances: Balance[];
}

export interface ClientData {
  signingCosmWasmClient?: SigningCosmWasmClient | any;
  signingStargateClient?: SigningStargateClient | any;
  senderAddress?: string;
  gasPrice?: GasPrice;
}

export type InitialBalance = {
  address?: string;
  amount?: string;
};

export interface DeployContract {
  codeId?: number;
  address?: string;
}

export interface BaseContract {
  admin?: string;
  initMsg?: {
    [key: string]: any;
  };
  initCoins?: Coin[];
  updateMsg?: {
    [key: string]: any;
  };
  label?: string;
  codeId?: number;
  address?: string;
  filePath?: string;
  deploy?: boolean;
}

export interface HubContract extends BaseContract {
  initMsg?: {
    epoch_period: number;
    er_threshold: string;
    peg_recovery_fee: string;
    unbonding_period: number;
  };
}

export interface RewardContract extends BaseContract {
  initMsg?: {
    owner: string;
  };
}

export interface BSeiTokenContract extends BaseContract {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
  };
}

export interface RewardsDispatcherContract extends BaseContract {
  initMsg?: {
    lido_fee_address: string;
    lido_fee_rate: string;
  };
}

export interface Registry {
  active: boolean;
  total_delegated: string;
}

export interface ValidatorsRegistryContract extends BaseContract {
  initMsg?: {
    registry: Registry[];
  };
}

export interface StSeiTokenContract extends BaseContract {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
  };
}

export interface MarketContract extends BaseContract {
  initMsg?: {
    owner_addr: string;
    anc_emission_rate: string;
    max_borrow_factor: string;
    reserve_factor: string;
  };
}

export interface InterestModelContract extends BaseContract {
  initMsg?: {
    owner: string;
    base_rate: string;
    interest_multiplier: string;
  };
}

export interface DistributionModelContract extends BaseContract {
  initMsg?: {
    owner: string;
    decrement_multiplier: string;
    emission_cap: string;
    emission_floor: string;
    increment_multiplier: string;
  };
}

export interface OracleContract extends BaseContract {
  initMsg?: {
    owner: string;
  };
}

export interface OverseerContract extends BaseContract {
  initMsg?: {
    owner_addr: string;
    collector_contract: string;
    anc_purchase_factor: string;
    buffer_distribution_factor: string;
    epoch_period: number;
    price_timeframe: number;
    target_deposit_rate: string;
    threshold_deposit_rate: string;
    dyn_rate_epoch: number;
    dyn_rate_maxchange: string;
    dyn_rate_yr_increase_expectation: string;
    dyn_rate_min: string;
    dyn_rate_max: string;
  };
  updateMsg: {
    name: string;
    symbol: string;
    max_ltv: string;
  };
}

export interface LiquidationQueueContract extends BaseContract {
  initMsg?: {
    owner: string;
    safe_ratio: string;
    bid_fee: string;
    liquidator_fee: string;
    liquidation_threshold: string;
    price_timeframe: number;
    waiting_period: number;
  };
  updateMsg: {
    bid_threshold: string;
    max_slot: string;
    premium_rate_per_slot: string;
  };
}

export interface CustodyBSeiContract extends BaseContract {
  initMsg?: {
    owner: string;
    basset_info: TokenInfo;
  };
}

export interface OraclePythContract extends BaseContract {
  initMsg?: {
    owner: string;
    pyth_contract: string;
  };
}

export interface ConvertConverterContract extends BaseContract {
  initMsg?: {
    owner: string;
  };
}
export interface ConvertBtokenContract extends BaseContract {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
    // mint: string;
  };
}
export interface ConvertCustodyContract extends BaseContract {
  initMsg?: {
    owner: string;
    basset_info: TokenInfo;
  };
}

export interface ConvertPairs {
  name?: string;
  native_denom: string;
  converter: ConvertConverterContract;
  btoken: ConvertBtokenContract;
  custody: ConvertCustodyContract;
  overseerWhitelistConfig?: {
    name?: string;
    symbol?: string;
    max_ltv?: string;
  };
  liquidationQueueWhitelistCollateralConfig?: {
    bid_threshold?: string;
    max_slot?: number;
    premium_rate_per_slot?: string;
  };
}

export interface SwapExtentionContract extends BaseContract {
  initMsg?: {
    owner: string;
  };
}

export interface KptContract extends BaseContract {
  initMsg?: {
    cw20_init_msg: {
      name: string;
      symbol: string;
      decimals: number;
      initial_balances: InitialBalance[];
    };
    max_supply: string;
    gov?: string;
  };
}

export interface KptFundContract extends BaseContract {
  initMsg?: {
    gov?: string;
    kusd_denom?: string;
    kusd_reward_addr?: string;
    exit_cycle?: string;
    claim_able_time?: string;
  };
}

export interface VeKptContract extends BaseContract {
  initMsg?: {
    cw20_init_msg: {
      name: string;
      symbol: string;
      decimals: number;
      initial_balances: InitialBalance[];
    };
    max_supply: string;
    max_minted: string;
    gov?: string;
  };
}

export interface VeKptBoostLockSetting {
  duration: string;
  mining_boost: string;
}
export interface VeKptBoostContract extends BaseContract {
  initMsg?: {
    gov?: string;
    ve_kpt_lock_settings: VeKptBoostLockSetting[];
  };
}

export interface VeKptMinerContract extends BaseContract {
  initMsg?: {
    gov?: string;
    // kusd_denom: string;
    // kusd_reward_addr: string;
    duration: string;
    lockdown_period: string;
    extra_rate?: string;
  };
}

export interface StakingRewardsContract extends BaseContract {
  initMsg?: {};
}

export interface StakingRewardsPairs {
  name?: string;
  staking_token?: string;
  stakingRewards?: StakingRewardsContract;
}

export interface Config {
  validator: string;
  stable_coin_denom: string;

  hub: HubContract;
  reward: RewardContract;
  bSeiToken: BSeiTokenContract;
  rewardsDispatcher: RewardsDispatcherContract;
  validatorsRegistry: ValidatorsRegistryContract;
  stSeiToken: StSeiTokenContract;

  aToken: BaseContract;
  market: MarketContract;
  interestModel: InterestModelContract;
  distributionModel: DistributionModelContract;
  oracle: OracleContract;
  overseer: OverseerContract;
  liquidationQueue: LiquidationQueueContract;
  custodyBSei: CustodyBSeiContract;
  oraclePyth: OraclePythContract;

  convertPairs: ConvertPairs[];

  swapExtention: SwapExtentionContract;

  kpt?: KptContract;
  kptFund?: KptFundContract;
  veKpt?: VeKptContract;
  veKptBoost?: VeKptBoostContract;
  veKptMiner?: VeKptMinerContract;
  stakingRewardsPairs?: StakingRewardsPairs[];
}

export interface SwapDeployContracts {
  swapExtention?: DeployContract;
}

export interface StakingDeployContracts {
  hub?: DeployContract;
  reward?: DeployContract;
  bSeiToken?: DeployContract;
  rewardsDispatcher?: DeployContract;
  validatorsRegistry?: DeployContract;
  stSeiToken?: DeployContract;
}

export interface MarketDeployContracts {
  aToken?: DeployContract;
  market?: DeployContract;
  market_stable_denom?: string;
  interestModel?: DeployContract;
  distributionModel?: DeployContract;
  oracle?: DeployContract;
  overseer?: DeployContract;
  liquidationQueue?: DeployContract;
  custodyBSei?: DeployContract;
  oraclePyth?: DeployContract;
}

export interface ConvertPairsDeployContracts {
  native_denom?: string;
  converter?: DeployContract;
  btoken?: DeployContract;
  custody?: DeployContract;
}

export interface ConvertDeployContracts {
  convertPairs?: ConvertPairsDeployContracts[];
}

export interface StakingRewardsPairsDeployContracts {
  name?: string;
  staking_token?: string;
  stakingRewards?: DeployContract;
}

export interface KptDeployContracts {
  kpt?: DeployContract;
  kptFund?: DeployContract;
  veKpt?: DeployContract;
  veKptBoost?: DeployContract;
  veKptMiner?: DeployContract;
  stakingRewardsPairs?: StakingRewardsPairsDeployContracts[];
}
