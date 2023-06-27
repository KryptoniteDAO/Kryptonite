import type { Addr, BaseContractConfig, ContractDeployed, InitialBalance, TokenInfo } from "./base";

export interface HubContract extends BaseContractConfig {
  initMsg?: {
    epoch_period: number;
    er_threshold: string;
    peg_recovery_fee: string;
    unbonding_period: number;
  };
}

export interface RewardContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
  };
}

export interface BSeiTokenContract extends BaseContractConfig {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
  };
}

export interface RewardsDispatcherContract extends BaseContractConfig {
  initMsg?: {
    lido_fee_address: string;
    lido_fee_rate: string;
  };
}

export interface Registry {
  active: boolean;
  total_delegated: string;
}

export interface ValidatorsRegistryContract extends BaseContractConfig {
  initMsg?: {
    registry: Registry[];
  };
}

export interface StSeiTokenContract extends BaseContractConfig {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
  };
}

export interface MarketContract extends BaseContractConfig {
  initMsg?: {
    owner_addr: string;
    anc_emission_rate: string;
    max_borrow_factor: string;
    reserve_factor: string;
  };
}

export interface InterestModelContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
    base_rate: string;
    interest_multiplier: string;
  };
}

export interface DistributionModelContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
    decrement_multiplier: string;
    emission_cap: string;
    emission_floor: string;
    increment_multiplier: string;
  };
}

export interface OracleContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
  };
}

export interface OverseerContract extends BaseContractConfig {
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

export interface LiquidationQueueContract extends BaseContractConfig {
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

export interface CustodyBSeiContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
    basset_info: TokenInfo;
  };
}

export interface OraclePythContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
    pyth_contract: string;
  };
}

export interface ConvertConverterContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
  };
}
export interface ConvertBtokenContract extends BaseContractConfig {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
    // mint: string;
  };
}
export interface ConvertCustodyContract extends BaseContractConfig {
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

export interface SwapExtentionContract extends BaseContractConfig {
  initMsg?: {
    owner: string;
  };
}

export interface KptContract extends BaseContractConfig {
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

export interface KptFundContract extends BaseContractConfig {
  initMsg?: {
    gov?: string;
    kusd_denom?: string;
    kusd_reward_addr?: string;
    exit_cycle?: string;
    claim_able_time?: string;
  };
}

export interface VeKptContract extends BaseContractConfig {
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
export interface VeKptBoostContract extends BaseContractConfig {
  initMsg?: {
    gov?: string;
    ve_kpt_lock_settings: VeKptBoostLockSetting[];
  };
}

export interface VeKptMinerContract extends BaseContractConfig {
  initMsg?: {
    gov?: string;
    // kusd_denom: string;
    // kusd_reward_addr: string;
    duration: string;
    lockdown_period: string;
    extra_rate?: string;
  };
}

export interface StakingRewardsContract extends BaseContractConfig {
  initMsg?: {};
}

export interface StakingRewardsPairs {
  name?: string;
  staking_token?: string;
  stakingRewards?: StakingRewardsContract;
}

export interface BlindBoxLevelMsg {
  mint_total_count: number;
  price: number;
}
export interface BlindBoxContract extends BaseContractConfig {
  initMsg?: {
    gov?: Addr | null;
    level_infos?: BlindBoxLevelMsg[] | null;
    name: string;
    nft_base_url: string;
    nft_uri_suffix: string;
    price_token: string;
    start_mint_time?: number | null;
    symbol: string;
    token_id_prefix: string;
  };
}

export interface RewardLevelConfigMsg {
  reward_amount?: number | null;
}

export interface RewardTokenConfigMsg {
  claimable_time?: number | null;
  reward_levels?: RewardLevelConfigMsg[] | null;
  reward_token: string;
  total_reward_amount?: number | null;
}

export interface BlindBoxRewardContract extends BaseContractConfig {
  initMsg?: {
    gov?: Addr | null;
    // nft_contract: Addr;
    reward_token_map_msgs: RewardTokenConfigMsg[];
  };
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

  aToken: BaseContractConfig;
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
  blindBox?: BlindBoxContract;
  blindBoxReward?: BlindBoxRewardContract;
}

export interface SwapDeployContracts {
  swapExtention?: ContractDeployed;
}

export interface StakingDeployContracts {
  hub?: ContractDeployed;
  reward?: ContractDeployed;
  bSeiToken?: ContractDeployed;
  rewardsDispatcher?: ContractDeployed;
  validatorsRegistry?: ContractDeployed;
  stSeiToken?: ContractDeployed;
}

export interface MarketDeployContracts {
  aToken?: ContractDeployed;
  market?: ContractDeployed;
  market_stable_denom?: string;
  interestModel?: ContractDeployed;
  distributionModel?: ContractDeployed;
  oracle?: ContractDeployed;
  overseer?: ContractDeployed;
  liquidationQueue?: ContractDeployed;
  custodyBSei?: ContractDeployed;
  oraclePyth?: ContractDeployed;
}

export interface ConvertPairsDeployContracts {
  native_denom?: string;
  converter?: ContractDeployed;
  btoken?: ContractDeployed;
  custody?: ContractDeployed;
}

export interface ConvertDeployContracts {
  convertPairs?: ConvertPairsDeployContracts[];
}

export interface StakingRewardsPairsDeployContracts {
  name?: string;
  staking_token?: string;
  stakingRewards?: ContractDeployed;
}

export interface KptDeployContracts {
  kpt?: ContractDeployed;
  kptFund?: ContractDeployed;
  veKpt?: ContractDeployed;
  veKptBoost?: ContractDeployed;
  veKptMiner?: ContractDeployed;
  stakingRewardsPairs?: StakingRewardsPairsDeployContracts[];
  blindBox?: ContractDeployed;
  blindBoxReward?: ContractDeployed;
}
