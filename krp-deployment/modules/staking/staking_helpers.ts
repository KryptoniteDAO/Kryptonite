import { deployContract, readArtifact, writeArtifact } from "@/common";
import { stakingContracts } from "@/contracts";
import { ConfigResponse, Decimal } from "@/contracts/staking/RewardsDispatcher.types";
import { InstantiateMarketingInfo } from "@/contracts/staking/TokenStsei.types.ts";
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
  const { cdpNetwork: { stable_coin_denom } = {} } = network;
  // if (!stable_coin_denom) {
  //   console.error(`\n  ********* deploy error: missing info. deployStakingHub / ${stable_coin_denom}`);
  //   return;
  // }
  const contractName: keyof Required<StakingContractsDeployed> = "hub";
  const config: HubContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      reward_denom: stable_coin_denom ?? walletData?.activeWallet?.address,
      underlying_coin_denom: walletData?.nativeCurrency?.coinMinimalDenom
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
  const { stakingNetwork: { hub } = {}, cdpNetwork: { stable_coin_denom } = {}, swapExtensionNetwork: { swapSparrow } = {} } = network;
  // if (!hub?.address || !swapSparrow?.address || !stable_coin_denom) {
  //   console.error(`\n  ********* deploy error: missing info. deployStakingReward / ${hub?.address} / ${swapSparrow?.address} / ${stable_coin_denom}`);
  //   return;
  // }
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info. deployStakingReward / ${hub?.address}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "reward";
  const config: RewardContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address ?? walletData?.activeWallet?.address,
      reward_denom: stable_coin_denom ?? walletData?.activeWallet?.address,
      swap_contract: swapSparrow?.address ?? walletData?.activeWallet?.address,
      swap_denoms: [walletData?.nativeCurrency?.coinMinimalDenom]
    },
    config?.initMsg ?? {},
    {
      // owner: config?.initMsg?.owner || walletData?.activeWallet?.address
    }
  );

  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingBAssetsToken(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork: { hub } = {} } = network;
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

export async function deployStakingRewardsDispatcher(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork: { hub, reward } = {}, swapExtensionNetwork: { swapSparrow } = {}, oracleNetwork: { oraclePyth } = {}, cdpNetwork: { stable_coin_denom } = {}, tokenNetwork: { keeper } = {} } = network;
  // if (!hub?.address || !reward?.address || !swapSparrow?.address || !oraclePyth?.address || !stable_coin_denom) {
  //   console.error(`\n  ********* deploy error: missing info. deployStakingRewardsDispatcher / ${hub?.address} / ${reward?.address} / ${swapSparrow?.address} / ${oraclePyth?.address} / ${stable_coin_denom}`);
  //   return;
  // }
  if (!hub?.address || !reward?.address) {
    console.error(`\n  ********* deploy error: missing info. deployStakingRewardsDispatcher / ${hub?.address} / ${reward?.address}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "rewardsDispatcher";
  const config: RewardsDispatcherContractConfig | undefined = stakingConfigs?.[contractName];
  const defaultInitMsg: object | undefined = Object.assign(
    {
      hub_contract: hub?.address ?? walletData?.activeWallet?.address,
      bsei_reward_contract: reward?.address ?? walletData?.activeWallet?.address,
      stsei_reward_denom: walletData?.nativeCurrency?.coinMinimalDenom,
      bsei_reward_denom: stable_coin_denom ?? walletData?.activeWallet?.address,
      swap_contract: swapSparrow?.address ?? walletData?.activeWallet?.address,
      swap_denoms: [walletData?.nativeCurrency?.coinMinimalDenom],
      oracle_contract: oraclePyth?.address ?? walletData?.activeWallet?.address
    },
    config?.initMsg ?? {},
    {
      krp_keeper_address: config?.initMsg?.krp_keeper_address || keeper?.address || walletData?.activeWallet?.address
    }
  );
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingValidatorsRegistry(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork: { hub } = {} } = network;
  if (!hub?.address) {
    console.error(`\n  ********* deploy error: missing info. deployStakingValidatorsRegistry / ${hub?.address}`);
    return;
  }

  const contractName: keyof Required<StakingContractsDeployed> = "validatorsRegistry";
  const config: ValidatorsRegistryContractConfig | undefined = stakingConfigs?.[contractName];
  const registry = config?.initMsg?.registry?.map((q, i, v) => Object.assign({}, q, { address: stakingConfigs?.validators?.[i] ?? "" })).filter(value => !!value?.address);
  const defaultInitMsg: object = Object.assign({ hub_contract: hub?.address }, { registry });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.staking}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingStAssetsToken(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { stakingNetwork: { hub } = {} } = network;
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

export async function doStakingHubUpdateConfig(walletData: WalletData, stakingNetwork: StakingContractsDeployed, print: boolean = true): Promise<void> {
  print && console.log(`\n  query ${STAKING_MODULE_NAME}.hub update_config enter.`);
  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;
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
  // airdropRegistryContract,
  // bseiTokenContract,
  // rewardsContract,
  // rewardsDispatcherContract,
  // stseiTokenContract,
  // updateRewardIndexAddr,
  // validatorsRegistryContract
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

export async function doStakingHubUpdateParameters(walletData: WalletData, network: ContractsDeployed, print: boolean = true): Promise<void> {
  print && console.log(`\n  query ${STAKING_MODULE_NAME}.hub update_parameters enter.`);
  const { stakingNetwork: { hub } = {}, cdpNetwork: { stable_coin_denom } = {} } = network;
  if (!hub?.address) {
    console.error(`\n  ********* missing info! / ${hub?.address}`);
    return;
  }
  const rewardDenom = stable_coin_denom ?? walletData?.activeWallet?.address;

  const hubClient = new stakingContracts.Hub.HubClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, hub.address);
  const hubQueryClient = new stakingContracts.Hub.HubQueryClient(walletData?.activeWallet?.signingCosmWasmClient, hub.address);

  const beforeRes = await hubQueryClient.parameters();
  const initFlag: boolean = rewardDenom === beforeRes?.reward_denom;
  if (initFlag) {
    console.warn(`\n  ######### ${STAKING_MODULE_NAME}.hub parameters is already done.`);
    return;
  }
  const doRes = await hubClient.updateParams({
    rewardDenom
  });
  console.log(`\n  Do ${STAKING_MODULE_NAME}.hub update_parameters ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await hubQueryClient.parameters();
  print && console.log(`\n  ${STAKING_MODULE_NAME}.hub parameters info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doStakingRewardUpdateConfig(walletData: WalletData, network: ContractsDeployed, print: boolean = true): Promise<void> {
  print && console.log(`\n  query ${STAKING_MODULE_NAME}.reward config enter.`);
  const { stakingNetwork: { hub, reward } = {}, swapExtensionNetwork: { swapSparrow } = {}, cdpNetwork: { stable_coin_denom } = {} } = network;
  if (!hub?.address || !reward?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const rewardDenom: string = stable_coin_denom ?? walletData?.activeWallet?.address;
  const swapContract: string = swapSparrow?.address ?? walletData?.activeWallet?.address;

  const rewardClient = new stakingContracts.Reward.RewardClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, reward.address);
  const rewardQueryClient = new stakingContracts.Reward.RewardQueryClient(walletData?.activeWallet?.signingCosmWasmClient, reward.address);

  const beforeRes = await rewardQueryClient.config();
  const initFlag: boolean = hub?.address === beforeRes?.hub_contract && swapContract === beforeRes?.swap_contract && rewardDenom === beforeRes?.reward_denom;
  if (initFlag) {
    console.warn(`\n  ######### ${STAKING_MODULE_NAME}.reward config is already done.`);
    return;
  }
  // hubContract,
  // rewardDenom,
  // swapContract
  const doRes = await rewardClient.updateConfig({
    hubContract: hub?.address,
    swapContract,
    rewardDenom
  });
  console.log(`\n  Do ${STAKING_MODULE_NAME}.reward update_config ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await rewardQueryClient.config();
  print && console.log(`\n  ${STAKING_MODULE_NAME}.reward config info: \n  ${JSON.stringify(afterRes)}`);
}

export async function doStakingRewardsDispatcherUpdateConfig(walletData: WalletData, network: ContractsDeployed, print: boolean = true): Promise<void> {
  print && console.log(`\n  do ${STAKING_MODULE_NAME}.rewardsDispatcher update_config enter.`);
  const { stakingNetwork: { hub, reward, rewardsDispatcher } = {}, tokenNetwork: { keeper } = {}, swapExtensionNetwork: { swapSparrow } = {}, oracleNetwork: { oraclePyth } = {}, cdpNetwork: { stable_coin_denom } = {} } = network;
  if (!rewardsDispatcher?.address || !hub?.address || !reward?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const bseiRewardDenom: string = stable_coin_denom ?? walletData?.activeWallet?.address;
  const krpKeeperAddress: string = keeper?.address ?? walletData?.activeWallet.address;
  const swapContract: string = swapSparrow?.address ?? walletData?.activeWallet.address;
  const oracleContract: string = oraclePyth?.address ?? walletData?.activeWallet.address;

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
  const beforeRes: ConfigResponse = await rewardsDispatcherQueryClient.config();

  try {
    const initFlag: boolean = hub.address === beforeRes?.hub_contract && reward.address === beforeRes?.bsei_reward_contract && krpKeeperAddress === beforeRes?.krp_keeper_address && bseiRewardDenom === beforeRes?.bsei_reward_denom;
    if (initFlag) {
      console.warn(`\n  ######### ${STAKING_MODULE_NAME}.rewardsDispatcher config is already done.`);
    } else {
      const doRes = await rewardsDispatcherClient.updateConfig({
        hubContract: hub?.address,
        bseiRewardContract: reward?.address,
        krpKeeperAddress,
        // stseiRewardDenom: walletData?.nativeCurrency?.coinMinimalDenom,
        bseiRewardDenom
      });
      console.log(`\n  Do ${STAKING_MODULE_NAME}.rewardsDispatcher update_config ok. \n  ${doRes?.transactionHash}`);
    }
  } catch (error: any) {
    console.error(`\n  Do ${STAKING_MODULE_NAME}.rewardsDispatcher update_config error. \n  `, error);
  }

  try {
    const initFlag: boolean = oracleContract === beforeRes?.oracle_contract;
    if (initFlag) {
      console.warn(`\n  ######### ${STAKING_MODULE_NAME}.rewardsDispatcher oracle config is already done.`);
    } else {
      const doRes = await rewardsDispatcherClient.updateOracleContract({
        oracleContract
      });
      console.log(`\n  Do ${STAKING_MODULE_NAME}.rewardsDispatcher update_oracle ok. \n  ${doRes?.transactionHash}`);
    }
  } catch (error: any) {
    console.error(`\n  Do ${STAKING_MODULE_NAME}.rewardsDispatcher update_oracle error. \n  `, error);
  }

  try {
    const initFlag: boolean = swapContract === beforeRes?.swap_contract;
    if (initFlag) {
      console.warn(`\n  ######### ${STAKING_MODULE_NAME}.rewardsDispatcher swap config is already done.`);
    } else {
      const doRes = await rewardsDispatcherClient.updateSwapContract({
        swapContract
      });
      console.log(`\n  Do ${STAKING_MODULE_NAME}.rewardsDispatcher update_swap ok. \n  ${doRes?.transactionHash}`);
    }
  } catch (error: any) {
    console.error(`\n  Do ${STAKING_MODULE_NAME}.rewardsDispatcher update_swap error. \n  `, error);
  }

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
