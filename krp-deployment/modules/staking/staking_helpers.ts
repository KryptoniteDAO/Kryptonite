import type { ContractDeployed, WalletData } from "@/types";
import type { BSeiTokenContractConfig, HubContractConfig, RewardContractConfig, RewardsDispatcherContractConfig, StakingContractsConfig, StakingContractsDeployed, StSeiTokenContractConfig, ValidatorsRegistryContractConfig } from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, readArtifact, writeArtifact } from "@/common";
import { stakingContracts } from "@/contracts";
import { Config } from "@/contracts/staking/RewardsDispatcher.types";

export const STAKING_ARTIFACTS_PATH = "../krp-staking-contracts/artifacts";
export const STAKING_CONTRACTS_PATH = "../krp-staking-contracts/contracts";
export const STAKING_MODULE_NAME = "staking";
export const stakingConfigs: StakingContractsConfig = readArtifact(`${STAKING_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${STAKING_MODULE_NAME}/`);

export function getStakingDeployFileName(chainId: string): string {
  return `deployed_${STAKING_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function stakingReadArtifact(chainId: string): StakingContractsDeployed {
  return readArtifact(getStakingDeployFileName(chainId), STAKING_ARTIFACTS_PATH) as StakingContractsDeployed;
}

export function stakingWriteArtifact(networkStaking: StakingContractsDeployed, chainId: string): void {
  writeArtifact(networkStaking, getStakingDeployFileName(chainId), STAKING_ARTIFACTS_PATH);
}

/**
 * hub,
 * reward,
 * bSeiToken,
 * rewardsDispatcher,
 * validatorsRegistry,
 * stSeiToken,
 */
export async function loadingStakingData(networkStaking: StakingContractsDeployed | undefined) {
  const hub: ContractDeployed = {
    codeId: networkStaking?.hub?.codeId || 0,
    address: networkStaking?.hub?.address
  };
  const reward: ContractDeployed = {
    codeId: networkStaking?.reward?.codeId || 0,
    address: networkStaking?.reward?.address
  };
  const bSeiToken: ContractDeployed = {
    codeId: networkStaking?.bSeiToken?.codeId || 0,
    address: networkStaking?.bSeiToken?.address
  };
  const rewardsDispatcher: ContractDeployed = {
    codeId: networkStaking?.rewardsDispatcher?.codeId || 0,
    address: networkStaking?.rewardsDispatcher?.address
  };
  const validatorsRegistry: ContractDeployed = {
    codeId: networkStaking?.validatorsRegistry?.codeId || 0,
    address: networkStaking?.validatorsRegistry?.address
  };
  const stSeiToken: ContractDeployed = {
    codeId: networkStaking?.stSeiToken?.codeId || 0,
    address: networkStaking?.stSeiToken?.address
  };

  return {
    hub,
    reward,
    bSeiToken,
    rewardsDispatcher,
    validatorsRegistry,
    stSeiToken
  };
}

export async function deployHub(walletData: WalletData, networkStaking: StakingContractsDeployed, swapSparrow: ContractDeployed, stable_coin_denom: string): Promise<void> {
  if (!swapSparrow?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }
  const contractName: keyof Required<StakingContractsDeployed> = "hub";
  const config: HubContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      reward_denom: stable_coin_denom,
      underlying_coin_denom: walletData.nativeCurrency.coinMinimalDenom,
      validator: walletData.validator,
      swap_contract: swapSparrow?.address
    },
    config?.initMsg ?? {}
  );
  const writeFunc = stakingWriteArtifact;

  await deployContract(walletData, contractName, networkStaking, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployReward(walletData: WalletData, networkStaking: StakingContractsDeployed, swapSparrow: ContractDeployed, stable_coin_denom: string): Promise<void> {
  const hub: ContractDeployed | undefined = networkStaking?.hub;
  if (!hub?.address || !swapSparrow?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "reward";
  const config: RewardContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address,
      reward_denom: stable_coin_denom,
      swap_contract: swapSparrow?.address,
      swap_denoms: [walletData.nativeCurrency.coinMinimalDenom]
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData.address
    }
  );

  const writeFunc = stakingWriteArtifact;

  await deployContract(walletData, contractName, networkStaking, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployBSeiToken(walletData: WalletData, networkStaking: StakingContractsDeployed): Promise<void> {
  const hub: ContractDeployed | undefined = networkStaking?.hub;
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "bSeiToken";
  const config: BSeiTokenContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address,
      mint: { minter: hub?.address, cap: null }
    },
    config?.initMsg ?? {}
  );
  const writeFunc = stakingWriteArtifact;

  await deployContract(walletData, contractName, networkStaking, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployRewardsDispatcher(walletData: WalletData, networkStaking: StakingContractsDeployed, swapSparrow: ContractDeployed, oraclePyth: ContractDeployed, keeperAddress: string | undefined, stable_coin_denom: string): Promise<void> {
  const hub: ContractDeployed | undefined = networkStaking?.hub;
  const reward: ContractDeployed | undefined = networkStaking?.reward;
  if (!hub?.address || !reward?.address || !swapSparrow?.address || !oraclePyth?.address || !keeperAddress || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "rewardsDispatcher";
  const config: RewardsDispatcherContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address,
      bsei_reward_contract: reward?.address,
      stsei_reward_denom: walletData.nativeCurrency.coinMinimalDenom,
      bsei_reward_denom: stable_coin_denom,
      swap_contract: swapSparrow?.address,
      swap_denoms: [walletData.nativeCurrency.coinMinimalDenom],
      oracle_contract: oraclePyth?.address
    },
    config?.initMsg ?? {},
    {
      krp_keeper_address: config?.initMsg?.krp_keeper_address || keeperAddress || walletData.address
    }
  );
  const writeFunc = stakingWriteArtifact;

  await deployContract(walletData, contractName, networkStaking, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployValidatorsRegistry(walletData: WalletData, networkStaking: StakingContractsDeployed): Promise<void> {
  const hub: ContractDeployed | undefined = networkStaking?.hub;
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "validatorsRegistry";
  const config: ValidatorsRegistryContractConfig | undefined = stakingConfigs?.[contractName];
  const registry = config?.initMsg?.registry?.map(q => Object.assign({}, q, { address: walletData.validator }));
  const defaultInitMsg: object = Object.assign({ hub_contract: hub?.address }, { registry });
  const writeFunc = stakingWriteArtifact;

  await deployContract(walletData, contractName, networkStaking, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStSeiToken(walletData: WalletData, networkStaking: StakingContractsDeployed): Promise<void> {
  const hub: ContractDeployed | undefined = networkStaking?.hub;
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "stSeiToken";
  const config: StSeiTokenContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object = Object.assign(
    {
      hub_contract: hub?.address,
      mint: { minter: hub?.address, cap: null }
    },
    config?.initMsg ?? {}
  );
  const writeFunc = stakingWriteArtifact;

  await deployContract(walletData, contractName, networkStaking, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doHubConfig(walletData: WalletData, networkStaking: StakingContractsDeployed, print: boolean = true): Promise<void> {
  print && console.log(`\n  query staking.hub config enter.`);
  const hub: ContractDeployed | undefined = networkStaking?.hub;
  const reward: ContractDeployed | undefined = networkStaking?.reward;
  const bSeiToken: ContractDeployed | undefined = networkStaking?.bSeiToken;
  const rewardsDispatcher: ContractDeployed | undefined = networkStaking?.rewardsDispatcher;
  const validatorsRegistry: ContractDeployed | undefined = networkStaking?.validatorsRegistry;
  const stSeiToken: ContractDeployed | undefined = networkStaking?.stSeiToken;
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const hubClient = new stakingContracts.Hub.HubClient(walletData.signingCosmWasmClient, walletData.address, hub.address);
  const hubQueryClient = new stakingContracts.Hub.HubQueryClient(walletData.signingCosmWasmClient, hub.address);

  const beforeRes = await hubQueryClient.config();
  // {"owner":"","reward_dispatcher_contract":"","validators_registry_contract":"","bsei_token_contract":"","stsei_token_contract":"","airdrop_registry_contract":null,"token_contract":""}
  const initFlag: boolean = rewardsDispatcher.address === beforeRes?.reward_dispatcher_contract && validatorsRegistry.address === beforeRes?.validators_registry_contract && bSeiToken.address === beforeRes?.bsei_token_contract && stSeiToken.address === beforeRes?.stsei_token_contract;
  if (initFlag) {
    console.warn(`\n  ######### staking.hub config is already done.`);
    return;
  }

  const doRes = await hubClient.updateConfig({
    bseiTokenContract: bSeiToken.address,
    stseiTokenContract: stSeiToken.address,
    rewardsDispatcherContract: rewardsDispatcher.address,
    validatorsRegistryContract: validatorsRegistry.address,
    rewardsContract: reward.address
  });
  console.log(`\n  Do staking.hub update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await hubQueryClient.config();
  print && console.log(`\n  staking.hub config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doRewardsDispatcherConfig(walletData: WalletData, networkStaking: StakingContractsDeployed, print: boolean = true): Promise<void> {
  print && console.log(`\n  query staking.rewardsDispatcher config enter.`);
  const hub: ContractDeployed | undefined = networkStaking?.hub;
  const reward: ContractDeployed | undefined = networkStaking?.reward;
  const bSeiToken: ContractDeployed | undefined = networkStaking?.bSeiToken;
  const rewardsDispatcher: ContractDeployed | undefined = networkStaking?.rewardsDispatcher;
  const validatorsRegistry: ContractDeployed | undefined = networkStaking?.validatorsRegistry;
  const stSeiToken: ContractDeployed | undefined = networkStaking?.stSeiToken;
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const rewardsDispatcherClient = new stakingContracts.RewardsDispatcher.RewardsDispatcherClient(walletData.signingCosmWasmClient, walletData.address, rewardsDispatcher.address);
  const rewardsDispatcherQueryClient = new stakingContracts.RewardsDispatcher.RewardsDispatcherQueryClient(walletData.signingCosmWasmClient, rewardsDispatcher.address);

  const beforeRes: Config = await rewardsDispatcherQueryClient.config();
  // {"owner":"","reward_dispatcher_contract":"","validators_registry_contract":"","bsei_token_contract":"","stsei_token_contract":"","airdrop_registry_contract":null,"token_contract":""}
  // const initFlag: boolean = rewardsDispatcher.address === beforeRes?.reward_dispatcher_contract && validatorsRegistry.address === beforeRes?.validators_registry_contract && bSeiToken.address === beforeRes?.bsei_token_contract && stSeiToken.address === beforeRes?.stsei_token_contract;
  // if (initFlag) {
  //   console.warn(`\n  ######### staking.rewardsDispatcher config is already done.`);
  //   return;
  // }
  //
  // const doRes = await rewardsDispatcherClient.updateConfig({
  //   bseiRewardContract
  //   bseiRewardDenom
  //   hubContract,
  //   bseiTokenContract: bSeiToken.address,
  //   stseiTokenContract: stSeiToken.address,
  //   rewardsDispatcherContract: rewardsDispatcher.address,
  //   validatorsRegistryContract: validatorsRegistry.address,
  //   rewardsContract: reward.address
  // });
  // console.log(`\n  Do staking.rewardsDispatcher update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await rewardsDispatcherQueryClient.config();
  print && console.log(`\n  after staking.rewardsDispatcher config info: \n  ${JSON.stringify(afterRes)}`);
}

/**
 * {"epoch_period":30,"underlying_coin_denom":"usei","unbonding_period":120,"peg_recovery_fee":"0","er_threshold":"1","reward_denom":"","paused":false}
 */
export async function queryHubParameters(walletData: WalletData, hub: ContractDeployed, print: boolean = true): Promise<any> {
  if (!hub?.address) {
    return;
  }
  print && console.log(`\n  Query staking.hub parameters enter.`);
  const hubQueryClient = new stakingContracts.Hub.HubQueryClient(walletData.signingCosmWasmClient, hub.address);
  const hubParametersRes = await hubQueryClient.parameters();
  print && console.log(`\n  staking.hub parameters: \n  ${JSON.stringify(hubParametersRes)}`);
  return hubParametersRes;
}

export async function printDeployedStakingContracts(networkStaking: StakingContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed staking contracts info --- ---`);
  const tableData = [
    { name: `hub`, deploy: stakingConfigs?.hub?.deploy, codeId: networkStaking?.hub?.codeId, address: networkStaking?.hub?.address },
    { name: `reward`, deploy: stakingConfigs?.reward?.deploy, codeId: networkStaking?.reward?.codeId, address: networkStaking?.reward?.address },
    { name: `bSeiToken`, deploy: stakingConfigs?.bSeiToken?.deploy, codeId: networkStaking?.bSeiToken?.codeId, address: networkStaking?.bSeiToken?.address },
    { name: `rewardsDispatcher`, deploy: stakingConfigs?.rewardsDispatcher?.deploy, codeId: networkStaking?.rewardsDispatcher?.codeId, address: networkStaking?.rewardsDispatcher?.address },
    { name: `validatorsRegistry`, deploy: stakingConfigs?.validatorsRegistry?.deploy, codeId: networkStaking?.validatorsRegistry?.codeId, address: networkStaking?.validatorsRegistry?.address },
    { name: `stSeiToken`, deploy: stakingConfigs?.stSeiToken?.deploy, codeId: networkStaking?.stSeiToken?.codeId, address: networkStaking?.stSeiToken?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

export async function addValidator(walletData: WalletData, validatorRegister: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.warn(`\n  Do staking.validatorRegister addValidator enter`);
  if (!validatorRegister?.address) {
    return;
  }
  const validatorsRegistryClient = new stakingContracts.ValidatorsRegistry.ValidatorsRegistryClient(walletData.signingCosmWasmClient, walletData.address, validatorRegister.address);
  const doRes = await validatorsRegistryClient.addValidator({ validator: { address: walletData.validator } });

  print && console.warn(`\n  Do staking.validatorRegister addValidator  ok. \n  ${doRes?.transactionHash}`);
}

export async function removeValidator(walletData: WalletData, validatorRegister: ContractDeployed, validator: string, print: boolean = true): Promise<any> {
  print && console.warn(`\n  Do staking.validatorRegister removeValidator enter`);
  if (!validatorRegister?.address) {
    return;
  }
  const validatorsRegistryClient = new stakingContracts.ValidatorsRegistry.ValidatorsRegistryClient(walletData.signingCosmWasmClient, walletData.address, validatorRegister.address);
  const doRes = await validatorsRegistryClient.removeValidator({ address: walletData.validator });

  print && console.warn(`\n  Do staking.validatorRegister removeValidator  ok. \n  ${doRes?.transactionHash}`);
}
