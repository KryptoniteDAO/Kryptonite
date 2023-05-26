import { readArtifact, writeArtifact, storeCodeByWalletData, instantiateContractByWalletData, executeContractByWalletData, queryWasmContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { ConvertDeployContracts, DeployContract, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts, WalletData } from "./types";

async function main(): Promise<void> {
  console.log(`--- --- deploy staking contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH) as StakingDeployContracts;
  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
  const networkSwap = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH) as SwapDeployContracts;
  const networkConvert = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH) as ConvertDeployContracts;
  // console.log(networkStaking);
  // console.log(networkMarket);
  // console.log(networkSwap);
  // console.log(networkConvert);

  console.log(`--- --- staking contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployOraclePyth(walletData, networkMarket);

  await deployHub(walletData, networkStaking, networkSwap?.swapExtention);
  await deployReward(walletData, networkStaking, networkSwap?.swapExtention);
  await deployBSeiToken(walletData, networkStaking);
  await deployRewardsDispatcher(walletData, networkStaking, networkSwap?.swapExtention, networkMarket?.oraclePyth);
  await deployValidatorsRegistry(walletData, networkStaking);
  await deployStSeiToken(walletData, networkStaking);

  console.log();
  console.log(`--- --- staking contracts storeCode & instantiateContract end --- ---`);

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);

  await printDeployedContracts(networkStaking);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- staking contracts configure enter --- ---`);

  await doHubConfig(walletData, hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken);
  await queryHubConfig(walletData, hub);
  await queryHubParameters(walletData, hub);

  console.log();
  console.log(`--- --- staking contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy staking contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

async function deployHub(walletData: WalletData, networkStaking: StakingDeployContracts, swapExtention: DeployContract): Promise<void> {
  if (!networkStaking?.hub?.address || !swapExtention?.address) {
    if (!networkStaking?.hub) {
      networkStaking.hub = {};
    }

    if (!networkStaking?.hub?.codeId || networkStaking?.hub?.codeId <= 0) {
      const filePath = chainConfigs?.hub?.filePath || "../krp-staking-contracts/artifacts/basset_sei_hub.wasm";
      networkStaking.hub.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(networkStaking, walletData.chainId, STAKING_ARTIFACTS_PATH);
    }
    if (networkStaking?.hub?.codeId > 0) {
      const admin = chainConfigs?.hub?.admin || walletData.address;
      const label = chainConfigs?.hub?.label;
      const initMsg = Object.assign(
        {
          reward_denom: walletData.stable_coin_denom,
          underlying_coin_denom: walletData.nativeCurrency.coinMinimalDenom,
          validator: walletData.validator,
          swap_contract: swapExtention?.address
        },
        chainConfigs?.hub?.initMsg
      );
      console.log(initMsg);
      networkStaking.hub.address = await instantiateContractByWalletData(walletData, admin, networkStaking.hub.codeId, initMsg, label);
      writeArtifact(networkStaking, walletData.chainId, STAKING_ARTIFACTS_PATH);
      chainConfigs.hub.deploy = true;
    }
    console.log(`hub: `, JSON.stringify(networkStaking?.hub));
  }
}

async function deployReward(walletData: WalletData, network: any, swapExtention: DeployContract): Promise<void> {
  const hubAddress = network?.hub?.address;
  if (!hubAddress || !swapExtention?.address) {
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
          reward_denom: walletData.stable_coin_denom,
          swap_contract: swapExtention?.address,
          swap_denoms: [walletData.nativeCurrency.coinMinimalDenom]
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

async function deployRewardsDispatcher(walletData: WalletData, network: any, swapExtention: DeployContract, oraclePyth: DeployContract): Promise<void> {
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
          bsei_reward_denom: walletData.stable_coin_denom,
          swap_contract: swapExtention?.address,
          swap_denoms: [walletData.nativeCurrency.coinMinimalDenom],
          oracle_contract: oraclePyth?.address
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

async function printDeployedContracts(networkStaking: StakingDeployContracts): Promise<void> {
  console.log();
  console.log(`--- --- deployed staking contracts info --- ---`);
  const tableData = [
    { name: `hub`, deploy: chainConfigs?.hub?.deploy, codeId: networkStaking?.hub?.codeId, address: networkStaking?.hub?.address },
    { name: `reward`, deploy: chainConfigs?.reward?.deploy, codeId: networkStaking?.reward?.codeId, address: networkStaking?.reward?.address },
    { name: `bSeiToken`, deploy: chainConfigs?.bSeiToken?.deploy, codeId: networkStaking?.bSeiToken?.codeId, address: networkStaking?.bSeiToken?.address },
    { name: `rewardsDispatcher`, deploy: chainConfigs?.rewardsDispatcher?.deploy, codeId: networkStaking?.rewardsDispatcher?.codeId, address: networkStaking?.rewardsDispatcher?.address },
    { name: `validatorsRegistry`, deploy: chainConfigs?.validatorsRegistry?.deploy, codeId: networkStaking?.validatorsRegistry?.codeId, address: networkStaking?.validatorsRegistry?.address },
    { name: `stSeiToken`, deploy: chainConfigs?.stSeiToken?.deploy, codeId: networkStaking?.stSeiToken?.codeId, address: networkStaking?.stSeiToken?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

async function addValidator(walletData: WalletData, validatorRegister: DeployContract): Promise<any> {
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

async function removeValidator(walletData: WalletData, validatorRegister: DeployContract, validator: string): Promise<any> {
  console.log();
  console.warn("Do remove validator register enter");
  const registerValidatorRes = await executeContractByWalletData(walletData, validatorRegister.address, {
    remove_validator: {
      address: validator
    }
  });
  console.log("Do remove validator register ok. \n", registerValidatorRes?.transactionHash);
}
async function deployOraclePyth(walletData: WalletData, network: any): Promise<void> {
  // if ("atlantic-2" !== walletData.chainId) {
  //   return;
  // }

  if (!network?.oraclePyth?.address) {
    if (!network?.oraclePyth) {
      network.oraclePyth = {};
    }

    if (!network?.oraclePyth?.codeId || network?.oraclePyth?.codeId <= 0) {
      const filePath = chainConfigs?.oraclePyth?.filePath || "../krp-market-contracts/artifacts/moneymarket_oracle_pyth.wasm";
      network.oraclePyth.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
    }
    if (network?.oraclePyth?.codeId > 0) {
      const admin = chainConfigs?.oraclePyth?.admin || walletData.address;
      const label = chainConfigs?.oraclePyth?.label;
      const initMsg = Object.assign({}, chainConfigs?.oraclePyth?.initMsg, {
        owner: chainConfigs?.oraclePyth?.initMsg?.owner || walletData.address
      });
      network.oraclePyth.address = await instantiateContractByWalletData(walletData, admin, network.oraclePyth.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, MARKET_ARTIFACTS_PATH);
      chainConfigs.oraclePyth.deploy = true;
    }
    console.log(`oraclePyth: `, JSON.stringify(network?.oraclePyth));
  }
}

main().catch(console.log);
