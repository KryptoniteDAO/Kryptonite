import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { executeContractByWalletData, instantiateContractByWalletData, queryWasmContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "@/common";
import type { ContractDeployed, WalletData } from "@/types";
import type { StakingContractsConfig, StakingContractsDeployed } from "@/modules";

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

export async function deployHub(walletData: WalletData, networkStaking: StakingContractsDeployed, swapExtention: ContractDeployed): Promise<void> {
  if (!networkStaking?.hub?.address || !swapExtention?.address) {
    if (!networkStaking?.hub) {
      networkStaking.hub = {};
    }

    if (!networkStaking?.hub?.codeId || networkStaking?.hub?.codeId <= 0) {
      const filePath = stakingConfigs?.hub?.filePath || "../krp-staking-contracts/artifacts/basset_sei_hub.wasm";
      networkStaking.hub.codeId = await storeCodeByWalletData(walletData, filePath);
      stakingWriteArtifact(networkStaking, walletData.chainId);
    }
    if (networkStaking?.hub?.codeId > 0) {
      const admin = stakingConfigs?.hub?.admin || walletData.address;
      const label = stakingConfigs?.hub?.label;
      const initMsg = Object.assign(
        {
          reward_denom: walletData.stable_coin_denom,
          underlying_coin_denom: walletData.nativeCurrency.coinMinimalDenom,
          validator: walletData.validator,
          swap_contract: swapExtention?.address
        },
        stakingConfigs?.hub?.initMsg
      );
      console.log(initMsg);
      networkStaking.hub.address = await instantiateContractByWalletData(walletData, admin, networkStaking.hub.codeId, initMsg, label);
      stakingWriteArtifact(networkStaking, walletData.chainId);
      stakingConfigs.hub.deploy = true;
    }
    console.log(`hub: `, JSON.stringify(networkStaking?.hub));
  }
}

export async function deployReward(walletData: WalletData, network: any, swapExtention: ContractDeployed): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress || !swapExtention?.address) {
    return;
  }

  if (!network?.reward?.address) {
    if (!network?.reward) {
      network.reward = {};
    }

    if (!network?.reward?.codeId || network?.reward?.codeId <= 0) {
      const filePath = stakingConfigs?.reward?.filePath || "../krp-staking-contracts/artifacts/basset_sei_reward.wasm";
      network.reward.codeId = await storeCodeByWalletData(walletData, filePath);
      stakingWriteArtifact(network, walletData.chainId);
    }
    if (network?.reward?.codeId > 0) {
      const admin = stakingConfigs?.reward?.admin || walletData.address;
      const label = stakingConfigs?.reward?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          reward_denom: walletData.stable_coin_denom,
          swap_contract: swapExtention?.address,
          swap_denoms: [walletData.nativeCurrency.coinMinimalDenom]
        },
        stakingConfigs?.reward?.initMsg,
        {
          owner: stakingConfigs?.reward?.initMsg?.owner || walletData.address
        }
      );
      network.reward.address = await instantiateContractByWalletData(walletData, admin, network.reward.codeId, initMsg, label);
      stakingWriteArtifact(network, walletData.chainId);
      stakingConfigs.reward.deploy = true;
    }
    console.log(`reward: `, JSON.stringify(network?.reward));
  }
}

export async function deployBSeiToken(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress) {
    return;
  }

  if (!network?.bSeiToken?.address) {
    if (!network?.bSeiToken) {
      network.bSeiToken = {};
    }

    if (!network?.bSeiToken?.codeId || network?.bSeiToken?.codeId <= 0) {
      const filePath = stakingConfigs?.bSeiToken?.filePath || "../krp-staking-contracts/artifacts/basset_sei_token_bsei.wasm";
      network.bSeiToken.codeId = await storeCodeByWalletData(walletData, filePath);
      stakingWriteArtifact(network, walletData.chainId);
    }
    if (network?.bSeiToken?.codeId > 0) {
      const admin = stakingConfigs?.bSeiToken?.admin || walletData.address;
      const label = stakingConfigs?.bSeiToken?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          mint: { minter: hubAddress, cap: null }
        },
        stakingConfigs?.bSeiToken?.initMsg
      );
      network.bSeiToken.address = await instantiateContractByWalletData(walletData, admin, network.bSeiToken.codeId, initMsg, label);
      stakingWriteArtifact(network, walletData.chainId);
      stakingConfigs.bSeiToken.deploy = true;
    }
    console.log(`bSeiToken: `, JSON.stringify(network?.bSeiToken));
  }
}

export async function deployRewardsDispatcher(walletData: WalletData, network: any, swapExtention: ContractDeployed, oraclePyth: ContractDeployed): Promise<void> {
  const hubAddress = network?.hub?.address;
  const rewardAddress = network?.reward?.address;
  if (!hubAddress || !rewardAddress || !swapExtention?.address || !oraclePyth?.address) {
    return;
  }
  if (!network?.rewardsDispatcher?.address) {
    if (!network?.rewardsDispatcher) {
      network.rewardsDispatcher = {};
    }

    if (!network?.rewardsDispatcher?.codeId || network?.rewardsDispatcher?.codeId <= 0) {
      const filePath = stakingConfigs?.rewardsDispatcher?.filePath || "../krp-staking-contracts/artifacts/basset_sei_rewards_dispatcher.wasm";
      network.rewardsDispatcher.codeId = await storeCodeByWalletData(walletData, filePath);
      stakingWriteArtifact(network, walletData.chainId);
    }
    if (network?.rewardsDispatcher?.codeId > 0) {
      const admin = stakingConfigs?.rewardsDispatcher?.admin || walletData.address;
      const label = stakingConfigs?.rewardsDispatcher?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          bsei_reward_contract: rewardAddress,
          stsei_reward_denom: walletData.nativeCurrency.coinMinimalDenom,
          bsei_reward_denom: walletData.stable_coin_denom,
          swap_contract: swapExtention?.address,
          swap_denoms: [walletData.nativeCurrency.coinMinimalDenom],
          oracle_contract: oraclePyth?.address
        },
        stakingConfigs?.rewardsDispatcher?.initMsg,
        {
          lido_fee_address: stakingConfigs?.rewardsDispatcher?.initMsg?.lido_fee_address || walletData.address
        }
      );

      network.rewardsDispatcher.address = await instantiateContractByWalletData(walletData, admin, network.rewardsDispatcher.codeId, initMsg, label);
      stakingWriteArtifact(network, walletData.chainId);
      stakingConfigs.rewardsDispatcher.deploy = true;
    }
    console.log(`rewardsDispatcher: `, JSON.stringify(network?.rewardsDispatcher));
  }
}

export async function deployValidatorsRegistry(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress) {
    return;
  }

  if (!network?.validatorsRegistry?.address) {
    if (!network?.validatorsRegistry) {
      network.validatorsRegistry = {};
    }

    if (!network?.validatorsRegistry?.codeId || network?.validatorsRegistry?.codeId <= 0) {
      const filePath = stakingConfigs?.validatorsRegistry?.filePath || "../krp-staking-contracts/artifacts/basset_sei_validators_registry.wasm";
      network.validatorsRegistry.codeId = await storeCodeByWalletData(walletData, filePath);
      stakingWriteArtifact(network, walletData.chainId);
    }
    if (network?.validatorsRegistry?.codeId > 0) {
      const admin = stakingConfigs?.validatorsRegistry?.admin || walletData.address;
      const label = stakingConfigs?.validatorsRegistry?.label;
      const registry = stakingConfigs?.validatorsRegistry?.initMsg?.registry?.map(q => Object.assign({}, q, { address: walletData.validator }));
      const initMsg = Object.assign({ hub_contract: hubAddress }, { registry });
      network.validatorsRegistry.address = await instantiateContractByWalletData(walletData, admin, network.validatorsRegistry.codeId, initMsg, label);
      stakingWriteArtifact(network, walletData.chainId);
      stakingConfigs.validatorsRegistry.deploy = true;
    }
    console.log(`validatorsRegistry: `, JSON.stringify(network?.validatorsRegistry));
  }
}

export async function deployStSeiToken(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress) {
    return;
  }

  if (!network?.stSeiToken?.address) {
    if (!network?.stSeiToken) {
      network.stSeiToken = {};
    }

    if (!network?.stSeiToken?.codeId || network?.stSeiToken?.codeId <= 0) {
      const filePath = stakingConfigs?.stSeiToken?.filePath || "../krp-staking-contracts/artifacts/basset_sei_token_stsei.wasm";
      network.stSeiToken.codeId = await storeCodeByWalletData(walletData, filePath);
      stakingWriteArtifact(network, walletData.chainId);
    }
    if (network?.stSeiToken?.codeId > 0) {
      const admin = stakingConfigs?.stSeiToken?.admin || walletData.address;
      const label = stakingConfigs?.stSeiToken?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          mint: { minter: hubAddress, cap: null }
        },
        stakingConfigs?.stSeiToken?.initMsg
      );
      network.stSeiToken.address = await instantiateContractByWalletData(walletData, admin, network.stSeiToken.codeId, initMsg, label);
      stakingWriteArtifact(network, walletData.chainId);
      stakingConfigs.stSeiToken.deploy = true;
    }
    console.log(`stSeiToken: `, JSON.stringify(network?.stSeiToken));
  }
}

export async function doHubConfig(walletData: WalletData, hub: ContractDeployed, reward: ContractDeployed, bSeiToken: ContractDeployed, rewardsDispatcher: ContractDeployed, validatorsRegistry: ContractDeployed, stSeiToken: ContractDeployed): Promise<void> {
  if (hub?.address && reward?.address && bSeiToken?.address && rewardsDispatcher?.address && validatorsRegistry?.address && stSeiToken?.address) {
    // console.log("query hub.address config enter");
    const hubConfigRes = await queryWasmContractByWalletData(walletData, hub.address, { config: {} });
    // console.log(`hubConfig: ${JSON.stringify(hubConfigRes)}`);
    // {"owner":"","reward_dispatcher_contract":"","validators_registry_contract":"","bsei_token_contract":"","stsei_token_contract":"","airdrop_registry_contract":null,"token_contract":""}
    const hubConfigFlag: boolean =
      rewardsDispatcher.address === hubConfigRes?.reward_dispatcher_contract && validatorsRegistry.address === hubConfigRes?.validators_registry_contract && bSeiToken.address === hubConfigRes?.bsei_token_contract && stSeiToken.address === hubConfigRes?.stsei_token_contract;
    // console.log(`hubConfigFlag`, hubConfigFlag);
    if (!hubConfigFlag) {
      console.log();
      console.warn("Do hub's config enter");
      const hubUpdateConfigRes = await executeContractByWalletData(walletData, hub.address, {
        update_config: {
          bsei_token_contract: bSeiToken.address,
          stsei_token_contract: stSeiToken.address,
          rewards_dispatcher_contract: rewardsDispatcher.address,
          validators_registry_contract: validatorsRegistry.address,
          rewards_contract: reward.address
        }
      });
      console.log("Do hub's config ok. \n", hubUpdateConfigRes?.transactionHash);
    }
  }
}

/**
 * {"owner":"","reward_dispatcher_contract":"","validators_registry_contract":"","bsei_token_contract":"","stsei_token_contract":"","airdrop_registry_contract":null,"token_contract":""}
 */
export async function queryHubConfig(walletData: WalletData, hub: ContractDeployed): Promise<any> {
  if (!hub?.address) {
    return;
  }

  console.log();
  console.log("Query hub.address config enter");
  const hubConfigRes = await queryWasmContractByWalletData(walletData, hub.address, { config: {} });
  console.log(`hub.config: \n  ${JSON.stringify(hubConfigRes)}`);
  return hubConfigRes;
}

/**
 * {"epoch_period":30,"underlying_coin_denom":"usei","unbonding_period":120,"peg_recovery_fee":"0","er_threshold":"1","reward_denom":"","paused":false}
 */
export async function queryHubParameters(walletData: WalletData, hub: ContractDeployed): Promise<any> {
  if (!hub?.address) {
    return;
  }
  console.log();
  console.log("Query hub.address parameters enter");
  const hubParametersRes = await queryWasmContractByWalletData(walletData, hub.address, { parameters: {} });
  console.log(`hub.parameters: \n  ${JSON.stringify(hubParametersRes)}`);
  return hubParametersRes;
}

export async function printDeployedStakingContracts(networkStaking: StakingContractsDeployed): Promise<void> {
  console.log();
  console.log(`--- --- deployed staking contracts info --- ---`);
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

export async function addValidator(walletData: WalletData, validatorRegister: ContractDeployed): Promise<any> {
  console.log();
  console.warn("Do register validator enter");
  const registerValidatorRes = await executeContractByWalletData(walletData, validatorRegister.address, {
    add_validator: {
      validator: {
        address: walletData.validator
      }
    }
  });
  console.log("Do register validator  ok. \n", registerValidatorRes?.transactionHash);
}

export async function removeValidator(walletData: WalletData, validatorRegister: ContractDeployed, validator: string): Promise<any> {
  console.log();
  console.warn("Do remove validator register enter");
  const registerValidatorRes = await executeContractByWalletData(walletData, validatorRegister.address, {
    remove_validator: {
      address: validator
    }
  });
  console.log("Do remove validator register ok. \n", registerValidatorRes?.transactionHash);
}
