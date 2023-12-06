import { deployContract, readArtifact, writeArtifact } from "@/common";
import { stakingContracts } from "@/contracts";
import type { ConfigResponse } from "@/contracts/staking/RewardsDispatcher.types";
import type { InstantiateMarketingInfo } from "@/contracts/staking/TokenStsei.types.ts";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type { BAssetsTokenContractConfig, ContractsDeployed, HubContractConfig, RewardContractConfig, RewardsDispatcherContractConfig, StakingContractsConfig, StakingContractsDeployed, StAssetsTokenContractConfig, ValidatorsRegistryContractConfig } from "@/modules";
import { ContractsDeployedModules, writeDeployedContracts } from "@/modules";
import type { ContractDeployed, WalletData } from "@/types";
import { STAKING_ARTIFACTS_PATH, STAKING_MODULE_NAME } from "./staking_constants";

export const stakingConfigs: StakingContractsConfig = readArtifact(`${STAKING_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${STAKING_MODULE_NAME}/`);

export function getStakingDeployFileName(chainId: string): string {
  return `deployed_${STAKING_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function stakingReadArtifact(chainId: string): StakingContractsDeployed {
  return readArtifact(getStakingDeployFileName(chainId), STAKING_ARTIFACTS_PATH) as StakingContractsDeployed;
}

export function stakingWriteArtifact(stakingNetwork: StakingContractsDeployed, chainId: string): void {
  writeArtifact(stakingNetwork, getStakingDeployFileName(chainId), STAKING_ARTIFACTS_PATH);
}

export async function deployStakingHub(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { cdpNetwork, swapExtensionNetwork } = network;
  const { swapSparrow } = swapExtensionNetwork;
  const { stable_coin_denom } = cdpNetwork;
  if (!swapSparrow?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployStakingHub / ${swapSparrow?.address} / ${stable_coin_denom}`);
    return;
  }
  const contractName: keyof Required<StakingContractsDeployed> = "hub";
  const config: HubContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      reward_denom: stable_coin_denom,
      underlying_coin_denom: walletData?.nativeCurrency?.coinMinimalDenom,
      swap_contract: swapSparrow?.address
    },
    config?.initMsg ?? {},
    {
      update_reward_index_addr: config?.initMsg?.update_reward_index_addr ?? walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingReward(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork, cdpNetwork, swapExtensionNetwork } = network;
  const { hub } = stakingNetwork;
  const { swapSparrow } = swapExtensionNetwork;
  const { stable_coin_denom } = cdpNetwork;
  if (!hub?.address || !swapSparrow?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployStakingReward / ${hub?.address} / ${swapSparrow?.address} / ${stable_coin_denom}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "reward";
  const config: RewardContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address,
      reward_denom: stable_coin_denom,
      swap_contract: swapSparrow?.address,
      swap_denoms: [walletData?.nativeCurrency?.coinMinimalDenom]
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData?.activeWallet?.address
    }
  );

  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingBAssetsToken(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork } = network;
  const { hub } = stakingNetwork;
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info. deployStakingBAssetsToken / ${hub?.address}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "bAssetsToken";
  const config: BAssetsTokenContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address,
      mint: { minter: hub?.address, cap: null }
    },
    config?.initMsg ?? {}
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingRewardsDispatcher(walletData: WalletData, network: ContractsDeployed, keeperAddress: string | undefined): Promise<void> {
  const { stakingNetwork, swapExtensionNetwork, oracleNetwork, cdpNetwork } = network;
  const { hub, reward } = stakingNetwork;
  const { swapSparrow } = swapExtensionNetwork;
  const { oraclePyth } = oracleNetwork;
  const { stable_coin_denom } = cdpNetwork;
  if (!hub?.address || !reward?.address || !swapSparrow?.address || !oraclePyth?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployStakingRewardsDispatcher / ${hub?.address} / ${reward?.address} / ${swapSparrow?.address} / ${oraclePyth?.address} / ${stable_coin_denom}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "rewardsDispatcher";
  const config: RewardsDispatcherContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address,
      bsei_reward_contract: reward?.address,
      stsei_reward_denom: walletData?.nativeCurrency?.coinMinimalDenom,
      bsei_reward_denom: stable_coin_denom,
      swap_contract: swapSparrow?.address,
      swap_denoms: [walletData?.nativeCurrency?.coinMinimalDenom],
      oracle_contract: oraclePyth?.address
    },
    config?.initMsg ?? {},
    {
      krp_keeper_address: config?.initMsg?.krp_keeper_address || keeperAddress || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingValidatorsRegistry(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork } = network;
  const { hub } = stakingNetwork;
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info. deployStakingValidatorsRegistry / ${hub?.address}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "validatorsRegistry";
  const config: ValidatorsRegistryContractConfig | undefined = stakingConfigs?.[contractName];
  const registry = config?.initMsg?.registry?.map((q, i, v) => Object.assign({}, q, { address: stakingConfigs?.validators?.[i] })).filter(value => !!value?.address);
  const defaultInitMsg: object = Object.assign({ hub_contract: hub?.address }, { registry });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingStAssetsToken(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork } = network;
  const { hub } = stakingNetwork;
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info. deployStakingStAssetsToken / ${hub?.address}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "stAssetsToken";
  const config: StAssetsTokenContractConfig | undefined = stakingConfigs?.[contractName];
  const marketing: InstantiateMarketingInfo = Object.assign(
    {
      description: config?.initMsg?.name,
      logo: {
        url: "https://www.google.com"
      },
      marketing: walletData?.activeWallet?.address,
      project: config?.initMsg?.name
    },
    config?.initMsg?.marketing ?? {}
  );
  const defaultInitMsg: object = Object.assign(
    {
      hub_contract: hub?.address,
      mint: { minter: hub?.address, cap: null }
    },
    config?.initMsg ?? {},
    { marketing }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doHubConfig(walletData: WalletData, stakingNetwork: StakingContractsDeployed, print: boolean = true): Promise<void> {
  print && console.log(`\n  query ${STAKING_MODULE_NAME}.hub config enter.`);
  const hub: ContractDeployed | undefined = stakingNetwork?.hub;
  const reward: ContractDeployed | undefined = stakingNetwork?.reward;
  const bAssetsToken: ContractDeployed | undefined = stakingNetwork?.bAssetsToken;
  const rewardsDispatcher: ContractDeployed | undefined = stakingNetwork?.rewardsDispatcher;
  const validatorsRegistry: ContractDeployed | undefined = stakingNetwork?.validatorsRegistry;
  const stAssetsToken: ContractDeployed | undefined = stakingNetwork?.stAssetsToken;
  if (!hub?.address || !reward?.address || !bAssetsToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stAssetsToken?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const hubClient = new stakingContracts.Hub.HubClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, hub.address);
  const hubQueryClient = new stakingContracts.Hub.HubQueryClient(walletData?.activeWallet?.signingCosmWasmClient, hub.address);

  const beforeRes = await hubQueryClient.config();
  const initFlag: boolean = rewardsDispatcher.address === beforeRes?.reward_dispatcher_contract && validatorsRegistry.address === beforeRes?.validators_registry_contract && bAssetsToken.address === beforeRes?.bsei_token_contract && stAssetsToken.address === beforeRes?.stsei_token_contract;
  if (initFlag) {
    console.warn(`\n  ######### ${STAKING_MODULE_NAME}.hub config is already done.`);
    return;
  }

  const doRes = await hubClient.updateConfig({
    bseiTokenContract: bAssetsToken.address,
    stseiTokenContract: stAssetsToken.address,
    rewardsDispatcherContract: rewardsDispatcher.address,
    validatorsRegistryContract: validatorsRegistry.address,
    rewardsContract: reward.address
  });
  console.log(`\n  Do ${STAKING_MODULE_NAME}.hub update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await hubQueryClient.config();
  print && console.log(`\n  ${STAKING_MODULE_NAME}.hub config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doStakingRewardsDispatcherUpdateConfig(walletData: WalletData, stakingNetwork: StakingContractsDeployed, keeperAddress: string, stable_coin_denom: string, print: boolean = true): Promise<void> {
  print && console.log(`\n  do ${STAKING_MODULE_NAME}.rewardsDispatcher update_config enter.`);
  const { hub, reward, rewardsDispatcher } = stakingNetwork;
  if (!rewardsDispatcher?.address || !hub?.address || !reward?.address || !stable_coin_denom) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const rewardsDispatcherClient = new stakingContracts.RewardsDispatcher.RewardsDispatcherClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, rewardsDispatcher.address);
  const rewardsDispatcherQueryClient = new stakingContracts.RewardsDispatcher.RewardsDispatcherQueryClient(walletData?.activeWallet?.signingCosmWasmClient, rewardsDispatcher.address);

  // bsei_reward_contract: string;
  // bsei_reward_denom: string;
  // hub_contract: string;
  // krp_keeper_address: string;
  // oracle_contract: string;
  // stsei_reward_denom: string;
  // swap_contract: string;
  // swap_denoms: string[];
  const keeper = keeperAddress ?? walletData?.activeWallet.address;
  const beforeRes: ConfigResponse = await rewardsDispatcherQueryClient.config();
  const initFlag: boolean = hub.address === beforeRes?.hub_contract && reward.address === beforeRes?.bsei_reward_contract && keeper === beforeRes?.krp_keeper_address && stable_coin_denom === beforeRes?.bsei_reward_denom;
  if (initFlag) {
    console.warn(`\n  ######### ${STAKING_MODULE_NAME}.rewardsDispatcher config is already done.`);
    return;
  }

  const doRes = await rewardsDispatcherClient.updateConfig({
    hubContract: hub?.address,
    bseiRewardContract: reward?.address,
    krpKeeperAddress: keeper,
    // stseiRewardDenom: walletData?.nativeCurrency?.coinMinimalDenom,
    bseiRewardDenom: stable_coin_denom
  });
  console.log(`\n  Do ${STAKING_MODULE_NAME}.rewardsDispatcher update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await rewardsDispatcherQueryClient.config();
  print && console.log(`\n  after ${STAKING_MODULE_NAME}.rewardsDispatcher config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function queryHubParameters(walletData: WalletData, hub: ContractDeployed, print: boolean = true): Promise<any> {
  if (!hub?.address) {
    return;
  }
  print && console.log(`\n  Query ${STAKING_MODULE_NAME}.hub parameters enter.`);
  const hubQueryClient = new stakingContracts.Hub.HubQueryClient(walletData?.activeWallet?.signingCosmWasmClient, hub.address);
  const hubParametersRes = await hubQueryClient.parameters();
  print && console.log(`\n  ${STAKING_MODULE_NAME}.hub parameters: \n  ${JSON.stringify(hubParametersRes)}`);
  return hubParametersRes;
}

export async function printDeployedStakingContracts(stakingNetwork: StakingContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed contracts info: ${STAKING_MODULE_NAME} --- ---`);
  const tableData = [
    { name: `hub`, deploy: stakingConfigs?.hub?.deploy, codeId: stakingNetwork?.hub?.codeId, address: stakingNetwork?.hub?.address },
    { name: `reward`, deploy: stakingConfigs?.reward?.deploy, codeId: stakingNetwork?.reward?.codeId, address: stakingNetwork?.reward?.address },
    { name: `bAssetsToken`, deploy: stakingConfigs?.bAssetsToken?.deploy, codeId: stakingNetwork?.bAssetsToken?.codeId, address: stakingNetwork?.bAssetsToken?.address },
    { name: `rewardsDispatcher`, deploy: stakingConfigs?.rewardsDispatcher?.deploy, codeId: stakingNetwork?.rewardsDispatcher?.codeId, address: stakingNetwork?.rewardsDispatcher?.address },
    { name: `validatorsRegistry`, deploy: stakingConfigs?.validatorsRegistry?.deploy, codeId: stakingNetwork?.validatorsRegistry?.codeId, address: stakingNetwork?.validatorsRegistry?.address },
    { name: `stAssetsToken`, deploy: stakingConfigs?.stAssetsToken?.deploy, codeId: stakingNetwork?.stAssetsToken?.codeId, address: stakingNetwork?.stAssetsToken?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

export async function addValidator(walletData: WalletData, validatorRegister: ContractDeployed, validator: string, print: boolean = true): Promise<any> {
  print && console.warn(`\n  Do ${STAKING_MODULE_NAME}.validatorRegister addValidator enter`);
  if (!validatorRegister?.address) {
    return;
  }
  const validatorsRegistryClient = new stakingContracts.ValidatorsRegistry.ValidatorsRegistryClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, validatorRegister.address);
  const doRes = await validatorsRegistryClient.addValidator({ validator: { address: validator } });

  print && console.warn(`\n  Do ${STAKING_MODULE_NAME}.validatorRegister addValidator  ok. \n  ${doRes?.transactionHash}`);
}

export async function removeValidator(walletData: WalletData, validatorRegister: ContractDeployed, validator: string, print: boolean = true): Promise<any> {
  print && console.warn(`\n  Do ${STAKING_MODULE_NAME}.validatorRegister removeValidator enter`);
  if (!validatorRegister?.address) {
    return;
  }
  const validatorsRegistryClient = new stakingContracts.ValidatorsRegistry.ValidatorsRegistryClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, validatorRegister.address);
  const doRes = await validatorsRegistryClient.removeValidator({ address: validator });

  print && console.warn(`\n  Do ${STAKING_MODULE_NAME}.validatorRegister removeValidator  ok. \n  ${doRes?.transactionHash}`);
}
