import { readArtifact, writeArtifact, storeCodeByWalletData, instantiateContractByWalletData, executeContractByWalletData, queryWasmContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";

async function main(): Promise<void> {
  console.log(`--- --- deploy staking contracts enter --- ---`);

  const walletData = await loadingWalletData();
  const network = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH);

  console.log(`--- --- staking contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployHub(walletData, network);
  await deployReward(walletData, network);
  await deployBSeiToken(walletData, network);
  await deployRewardsDispatcher(walletData, network);
  await deployValidatorsRegistry(walletData, network);
  await deployStSeiToken(walletData, network);

  console.log();
  console.log(`--- --- staking contracts storeCode & instantiateContract end --- ---`);

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(network);

  console.log();
  console.log(`--- --- deployed staking contracts info --- ---`);
  const tableData = [
    { name: `hub`, deploy: chainConfigs?.hub?.deploy, ...hub },
    { name: `reward`, deploy: chainConfigs?.reward?.deploy, ...reward },
    { name: `bSeiToken`, deploy: chainConfigs?.bSeiToken?.deploy, ...bSeiToken },
    { name: `rewardsDispatcher`, deploy: chainConfigs?.rewardsDispatcher?.deploy, ...rewardsDispatcher },
    { name: `validatorsRegistry`, deploy: chainConfigs?.validatorsRegistry?.deploy, ...validatorsRegistry },
    { name: `stSeiToken`, deploy: chainConfigs?.stSeiToken?.deploy, ...stSeiToken }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- staking contracts configure enter --- ---`);

  await doHubConfig(walletData, hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken);
  await queryHubConfig(walletData, hub);
  await queryHubParameters(walletData, hub);

  // console.log()
  // console.log("Do hub's update_params enter");
  // const hubUpdateParamsRes = await executeContractByWalletData(walletData, hub.address, {
  //   update_params: {
  //     epoch_period: 260000,
  //     unbonding_period: 259200,
  //     peg_recovery_fee: "0.005",
  //     er_threshold: "1.0",
  //   }
  // })
  //  console.log("Do hub's update_params ok. \n", hubUpdateParamsRes?.transactionHash);
  //======================deployed contracts，change creator to update_global_index=======================================//
  // change creator，
  // await executeContractByWalletData(walletData, hub.address,
  // {
  //   update_config: {
  //     owner : ""
  //   }
  // })
  // console.log("transfer owener ok.")

  console.log();
  console.log(`--- --- staking contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy staking contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

async function deployHub(walletData: WalletData, network: any): Promise<void> {
  if (!network?.hub?.address) {
    if (!network?.hub) {
      network.hub = {};
    }

    if (!network?.hub?.codeId || network?.hub?.codeId <= 0) {
      const filePath = chainConfigs?.hub?.filePath || "../krp-staking-contracts/artifacts/basset_sei_hub.wasm";
      network.hub.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
    }
    if (network?.hub?.codeId > 0) {
      const admin = chainConfigs?.hub?.admin || walletData.address;
      const label = chainConfigs?.hub?.label;
      const initMsg = Object.assign(
        {
          reward_denom: walletData.stable_coin_denom,
          underlying_coin_denom: walletData.nativeCurrency.coinMinimalDenom,
          validator: walletData.validator
        },
        chainConfigs?.hub?.initMsg
      );
      network.hub.address = await instantiateContractByWalletData(walletData, admin, network.hub.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
      chainConfigs.hub.deploy = true;
    }
    console.log(`hub: `, JSON.stringify(network?.hub));
  }
}

async function deployReward(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress) {
    return;
  }

  if (!network?.reward?.address) {
    if (!network?.reward) {
      network.reward = {};
    }

    if (!network?.reward?.codeId || network?.reward?.codeId <= 0) {
      const filePath = chainConfigs?.reward?.filePath || "../krp-staking-contracts/artifacts/basset_sei_reward.wasm";
      network.reward.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
    }
    if (network?.reward?.codeId > 0) {
      const admin = chainConfigs?.reward?.admin || walletData.address;
      const label = chainConfigs?.reward?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          reward_denom: walletData.stable_coin_denom
        },
        chainConfigs?.reward?.initMsg,
        {
          owner: chainConfigs?.reward?.initMsg?.owner || walletData.address
        }
      );
      network.reward.address = await instantiateContractByWalletData(walletData, admin, network.reward.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
      chainConfigs.reward.deploy = true;
    }
    console.log(`reward: `, JSON.stringify(network?.reward));
  }
}

async function deployBSeiToken(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress) {
    return;
  }

  if (!network?.bSeiToken?.address) {
    if (!network?.bSeiToken) {
      network.bSeiToken = {};
    }

    if (!network?.bSeiToken?.codeId || network?.bSeiToken?.codeId <= 0) {
      const filePath = chainConfigs?.bSeiToken?.filePath || "../krp-staking-contracts/artifacts/basset_sei_token_bsei.wasm";
      network.bSeiToken.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
    }
    if (network?.bSeiToken?.codeId > 0) {
      const admin = chainConfigs?.bSeiToken?.admin || walletData.address;
      const label = chainConfigs?.bSeiToken?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          mint: { minter: hubAddress, cap: null }
        },
        chainConfigs?.bSeiToken?.initMsg
      );
      network.bSeiToken.address = await instantiateContractByWalletData(walletData, admin, network.bSeiToken.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
      chainConfigs.bSeiToken.deploy = true;
    }
    console.log(`bSeiToken: `, JSON.stringify(network?.bSeiToken));
  }
}

async function deployRewardsDispatcher(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  const rewardAddress = network?.reward?.address;
  if (!hubAddress || !rewardAddress) {
    return;
  }

  if (!network?.rewardsDispatcher?.address) {
    if (!network?.rewardsDispatcher) {
      network.rewardsDispatcher = {};
    }

    if (!network?.rewardsDispatcher?.codeId || network?.rewardsDispatcher?.codeId <= 0) {
      const filePath = chainConfigs?.rewardsDispatcher?.filePath || "../krp-staking-contracts/artifacts/basset_sei_rewards_dispatcher.wasm";
      network.rewardsDispatcher.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
    }
    if (network?.rewardsDispatcher?.codeId > 0) {
      const admin = chainConfigs?.rewardsDispatcher?.admin || walletData.address;
      const label = chainConfigs?.rewardsDispatcher?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          bsei_reward_contract: rewardAddress,
          stsei_reward_denom: walletData.nativeCurrency.coinMinimalDenom,
          bsei_reward_denom: walletData.stable_coin_denom
        },
        chainConfigs?.rewardsDispatcher?.initMsg,
        {
          lido_fee_address: chainConfigs?.rewardsDispatcher?.initMsg?.lido_fee_address || walletData.address
        }
      );

      network.rewardsDispatcher.address = await instantiateContractByWalletData(walletData, admin, network.rewardsDispatcher.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
      chainConfigs.rewardsDispatcher.deploy = true;
    }
    console.log(`rewardsDispatcher: `, JSON.stringify(network?.rewardsDispatcher));
  }
}

async function deployValidatorsRegistry(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress) {
    return;
  }

  if (!network?.validatorsRegistry?.address) {
    if (!network?.validatorsRegistry) {
      network.validatorsRegistry = {};
    }

    if (!network?.validatorsRegistry?.codeId || network?.validatorsRegistry?.codeId <= 0) {
      const filePath = chainConfigs?.validatorsRegistry?.filePath || "../krp-staking-contracts/artifacts/basset_sei_validators_registry.wasm";
      network.validatorsRegistry.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
    }
    if (network?.validatorsRegistry?.codeId > 0) {
      const admin = chainConfigs?.validatorsRegistry?.admin || walletData.address;
      const label = chainConfigs?.validatorsRegistry?.label;
      const registry = chainConfigs?.validatorsRegistry?.initMsg?.registry?.map(q => Object.assign({}, q, { address: walletData.validator }));
      const initMsg = Object.assign({ hub_contract: hubAddress }, { registry });
      network.validatorsRegistry.address = await instantiateContractByWalletData(walletData, admin, network.validatorsRegistry.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
      chainConfigs.validatorsRegistry.deploy = true;
    }
    console.log(`validatorsRegistry: `, JSON.stringify(network?.validatorsRegistry));
  }
}

async function deployStSeiToken(walletData: WalletData, network: any): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress) {
    return;
  }

  if (!network?.stSeiToken?.address) {
    if (!network?.stSeiToken) {
      network.stSeiToken = {};
    }

    if (!network?.stSeiToken?.codeId || network?.stSeiToken?.codeId <= 0) {
      const filePath = chainConfigs?.stSeiToken?.filePath || "../krp-staking-contracts/artifacts/basset_sei_token_stsei.wasm";
      network.stSeiToken.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
    }
    if (network?.stSeiToken?.codeId > 0) {
      const admin = chainConfigs?.stSeiToken?.admin || walletData.address;
      const label = chainConfigs?.stSeiToken?.label;
      const initMsg = Object.assign(
        {
          hub_contract: hubAddress,
          mint: { minter: hubAddress, cap: null }
        },
        chainConfigs?.stSeiToken?.initMsg
      );
      network.stSeiToken.address = await instantiateContractByWalletData(walletData, admin, network.stSeiToken.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, STAKING_ARTIFACTS_PATH);
      chainConfigs.stSeiToken.deploy = true;
    }
    console.log(`stSeiToken: `, JSON.stringify(network?.stSeiToken));
  }
}

async function doHubConfig(walletData: WalletData, hub: DeployContract, reward: DeployContract, bSeiToken: DeployContract, rewardsDispatcher: DeployContract, validatorsRegistry: DeployContract, stSeiToken: DeployContract): Promise<void> {
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
async function queryHubConfig(walletData: WalletData, hub: DeployContract): Promise<any> {
  if (!hub?.address) {
    return;
  }

  console.log();
  console.log("Query hub.address config enter");
  const hubConfigRes = await queryWasmContractByWalletData(walletData, hub.address, { config: {} });
  console.log(`hub.config: \n${JSON.stringify(hubConfigRes)}`);
  return hubConfigRes;
}

/**
 * {"epoch_period":30,"underlying_coin_denom":"usei","unbonding_period":120,"peg_recovery_fee":"0","er_threshold":"1","reward_denom":"","paused":false}
 */
async function queryHubParameters(walletData: WalletData, hub: DeployContract): Promise<any> {
  if (!hub?.address) {
    return;
  }
  console.log();
  console.log("Query hub.address parameters enter");
  const hubParametersRes = await queryWasmContractByWalletData(walletData, hub.address, { parameters: {} });
  console.log(`hub.parameters: \n${JSON.stringify(hubParametersRes)}`);
  return hubParametersRes;
}

main().catch(console.log);
