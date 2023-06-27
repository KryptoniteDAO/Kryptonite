import { chainConfigs, DEPLOY_VERSION, KPT_MODULE_NAME, KPT_ARTIFACTS_PATH } from "../env_data";
import { ChainId, ContractDeployed, InitialBalance, KptDeployContracts, RewardTokenConfigMsg, StakingRewardsPairs, StakingRewardsPairsDeployContracts, WalletData } from "../types";
import { instantiateContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "../common";
import { kptContracts } from "../contracts";
import { KptFundConfigResponse } from "../contracts/kpt/KptFund.types";
import { KptConfigResponse } from "../contracts/kpt/Kpt.types";
import { IsMinterResponse } from "../contracts/kpt/VeKpt.types";

export type KptStakingRewardsConfig = {
  name?: string;
  staking_token: string;
  duration: string;
};

export const KptStakingRewardsConfigList: Record<string, KptStakingRewardsConfig[]> = {
  [ChainId.SEI_CHAIN]: [
    {
      name: "TEST1",
      staking_token: "sei1973hq2vajasc2uvxhdn3kfq27w3cvksyysspnrwq3swyu7t37caq2eana6",
      duration: "2592000"
    },
    {
      name: "TEST2",
      staking_token: "sei1e9ac92wc2ahh36ew8mdfvrlgntk8nqtcycc3d7qr4xrn3xuk8h8skngqtt",
      duration: "2592000"
    }
  ],
  [ChainId.ATLANTIC_2]: [
    {
      name: "TEST1",
      staking_token: "sei1973hq2vajasc2uvxhdn3kfq27w3cvksyysspnrwq3swyu7t37caq2eana6",
      duration: "2592000"
    },
    {
      name: "TEST2",
      staking_token: "sei1e9ac92wc2ahh36ew8mdfvrlgntk8nqtcycc3d7qr4xrn3xuk8h8skngqtt",
      duration: "2592000"
    }
  ]
};

export function getKptDeployFileName(chainId: string): string {
  return `deployed_${KPT_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function kptReadArtifact(chainId: string): KptDeployContracts {
  return readArtifact(getKptDeployFileName(chainId), KPT_ARTIFACTS_PATH) as KptDeployContracts;
}

export function kptWriteArtifact(networkStaking: KptDeployContracts, chainId: string): void {
  writeArtifact(networkStaking, getKptDeployFileName(chainId), KPT_ARTIFACTS_PATH);
}

export async function deployKpt(walletData: WalletData, networkKpt: KptDeployContracts): Promise<void> {
  if (!networkKpt?.kpt?.address) {
    if (!networkKpt?.kpt) {
      networkKpt.kpt = {};
    }

    if (!networkKpt?.kpt?.codeId || networkKpt?.kpt?.codeId <= 0) {
      const filePath = chainConfigs?.kpt?.filePath || "../krp-token-contracts/artifacts/kpt.wasm";
      networkKpt.kpt.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (networkKpt?.kpt?.codeId > 0) {
      const admin = chainConfigs?.kpt?.admin || walletData.address;
      const label = chainConfigs?.kpt?.label ?? "kpt";
      // set initial balances to address
      const initialBalances: InitialBalance[] | undefined = chainConfigs?.kpt?.initMsg?.cw20_init_msg?.initial_balances;
      initialBalances?.map(value => {
        if (!value.address) {
          value.address = walletData.address;
        }
      });

      const initMsg = Object.assign({}, chainConfigs?.kpt?.initMsg);
      networkKpt.kpt.address = await instantiateContractByWalletData(walletData, admin, networkKpt.kpt.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      chainConfigs.kpt.deploy = true;
    }
    console.log(`kpt: `, JSON.stringify(networkKpt?.kpt));
  }
}

export async function deployKptFund(walletData: WalletData, networkKpt: KptDeployContracts): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  if (!kpt?.address || !veKpt?.address) {
    return;
  }
  if (!networkKpt?.kptFund?.address) {
    if (!networkKpt?.kptFund) {
      networkKpt.kptFund = {};
    }

    if (!networkKpt?.kptFund?.codeId || networkKpt?.kptFund?.codeId <= 0) {
      const filePath = chainConfigs?.kptFund?.filePath || "../krp-token-contracts/artifacts/kpt_fund.wasm";
      networkKpt.kptFund.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (networkKpt?.kptFund?.codeId > 0) {
      const admin = chainConfigs?.kptFund?.admin || walletData.address;
      const label = chainConfigs?.kptFund?.label ?? "kptFund";
      const initMsg = Object.assign(
        {
          kpt_addr: kpt.address,
          ve_kpt_addr: veKpt.address
        },
        chainConfigs?.kptFund?.initMsg
      );
      networkKpt.kptFund.address = await instantiateContractByWalletData(walletData, admin, networkKpt.kptFund.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      chainConfigs.kptFund.deploy = true;
    }
    console.log(`kptFund: `, JSON.stringify(networkKpt?.kptFund));
  }
}

export async function deployStakingRewards(walletData: WalletData, networkKpt: KptDeployContracts, stakingRewardsConfig: KptStakingRewardsConfig): Promise<void> {
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const kptFund: ContractDeployed | undefined = networkKpt?.kptFund;
  const veKptBoost: ContractDeployed | undefined = networkKpt?.veKptBoost;
  if (!stakingRewardsConfig?.staking_token || !veKpt?.address || !kptFund?.address || !veKptBoost?.address) {
    return;
  }

  let stakingRewardsPairsConfig: StakingRewardsPairs = chainConfigs?.stakingRewardsPairs?.find((v: StakingRewardsPairs) => stakingRewardsConfig?.staking_token === v.staking_token);
  if (!stakingRewardsPairsConfig) {
    stakingRewardsPairsConfig = {
      name: stakingRewardsConfig?.name,
      staking_token: stakingRewardsConfig?.staking_token,
      stakingRewards: {}
    };
    if (!chainConfigs?.stakingRewardsPairs) {
      chainConfigs.stakingRewardsPairs = [];
    }
    chainConfigs.stakingRewardsPairs.push(stakingRewardsPairsConfig);
  }
  let stakingRewardsPairsNetwork: StakingRewardsPairsDeployContracts = networkKpt?.stakingRewardsPairs?.find((v: any) => stakingRewardsConfig?.staking_token === v.staking_token);
  if (!stakingRewardsPairsNetwork) {
    stakingRewardsPairsNetwork = {
      name: stakingRewardsConfig?.name,
      staking_token: stakingRewardsConfig?.staking_token
    };
    if (!networkKpt?.stakingRewardsPairs) {
      networkKpt.stakingRewardsPairs = [];
    }
    networkKpt.stakingRewardsPairs.push(stakingRewardsPairsNetwork);
  }

  if (!stakingRewardsPairsNetwork?.stakingRewards?.address) {
    if (!stakingRewardsPairsNetwork?.stakingRewards) {
      stakingRewardsPairsNetwork.stakingRewards = {};
    }

    if (!stakingRewardsPairsNetwork?.stakingRewards?.codeId || stakingRewardsPairsNetwork?.stakingRewards?.codeId <= 0) {
      const filePath = stakingRewardsPairsConfig?.stakingRewards?.filePath || "../krp-token-contracts/artifacts/staking_rewards.wasm";
      stakingRewardsPairsNetwork.stakingRewards.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (stakingRewardsPairsNetwork?.stakingRewards?.codeId > 0) {
      const admin = stakingRewardsPairsConfig?.stakingRewards?.admin || walletData.address;
      const label = stakingRewardsPairsConfig?.stakingRewards?.label ?? "stakingRewards";
      const initMsg = Object.assign({
        rewards_token: veKpt.address,
        ve_kpt_boost: veKptBoost.address,
        kpt_fund: kptFund.address,
        reward_controller_addr: walletData.address,
        staking_token: stakingRewardsConfig.staking_token,
        duration: stakingRewardsConfig?.duration
      });
      stakingRewardsPairsNetwork.stakingRewards.address = await instantiateContractByWalletData(walletData, admin, stakingRewardsPairsNetwork.stakingRewards.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      stakingRewardsPairsConfig.stakingRewards.deploy = true;
    }
    console.log(`stakingRewards: `, JSON.stringify(stakingRewardsPairsNetwork?.stakingRewards));
  }
}

export async function deployVeKpt(walletData: WalletData, networkKpt: KptDeployContracts): Promise<void> {
  if (!networkKpt?.veKpt?.address) {
    if (!networkKpt?.veKpt) {
      networkKpt.veKpt = {};
    }

    if (!networkKpt?.veKpt?.codeId || networkKpt?.veKpt?.codeId <= 0) {
      const filePath = chainConfigs?.veKpt?.filePath || "../krp-token-contracts/artifacts/ve_kpt.wasm";
      networkKpt.veKpt.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (networkKpt?.veKpt?.codeId > 0) {
      const admin = chainConfigs?.veKpt?.admin || walletData.address;
      const label = chainConfigs?.veKpt?.label ?? "veKpt";
      // set initial balances to address
      const initialBalances: InitialBalance[] | undefined = chainConfigs?.veKpt?.initMsg?.cw20_init_msg?.initial_balances;
      initialBalances?.map(value => {
        if (!value.address) {
          value.address = walletData.address;
        }
      });
      const initMsg = Object.assign({}, chainConfigs?.veKpt?.initMsg);
      networkKpt.veKpt.address = await instantiateContractByWalletData(walletData, admin, networkKpt.veKpt.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      chainConfigs.veKpt.deploy = true;
    }
    console.log(`veKpt: `, JSON.stringify(networkKpt?.veKpt));
  }
}

export async function deployVeKptBoost(walletData: WalletData, networkKpt: KptDeployContracts): Promise<void> {
  if (!networkKpt?.veKptBoost?.address) {
    if (!networkKpt?.veKptBoost) {
      networkKpt.veKptBoost = {};
    }

    if (!networkKpt?.veKptBoost?.codeId || networkKpt?.veKptBoost?.codeId <= 0) {
      const filePath = chainConfigs?.veKptBoost?.filePath || "../krp-token-contracts/artifacts/ve_kpt_boost.wasm";
      networkKpt.veKptBoost.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (networkKpt?.veKptBoost?.codeId > 0) {
      const admin = chainConfigs?.veKptBoost?.admin || walletData.address;
      const label = chainConfigs?.veKptBoost?.label ?? "veKptBoost";
      const initMsg = Object.assign({}, chainConfigs?.veKptBoost?.initMsg);
      networkKpt.veKptBoost.address = await instantiateContractByWalletData(walletData, admin, networkKpt.veKptBoost.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      chainConfigs.veKptBoost.deploy = true;
    }
    console.log(`veKptBoost: `, JSON.stringify(networkKpt?.veKptBoost));
  }
}

export async function deployVeKptMiner(walletData: WalletData, networkKpt: KptDeployContracts): Promise<void> {
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const kptFund: ContractDeployed | undefined = networkKpt?.kptFund;
  const veKptBoost: ContractDeployed | undefined = networkKpt?.veKptBoost;
  if (!veKpt?.address || !kptFund?.address || !veKptBoost?.address) {
    return;
  }

  if (!networkKpt?.veKptMiner?.address) {
    if (!networkKpt?.veKptMiner) {
      networkKpt.veKptMiner = {};
    }

    if (!networkKpt?.veKptMiner?.codeId || networkKpt?.veKptMiner?.codeId <= 0) {
      const filePath = chainConfigs?.veKptMiner?.filePath || "../krp-token-contracts/artifacts/ve_kpt_miner.wasm";
      networkKpt.veKptMiner.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (networkKpt?.veKptMiner?.codeId > 0) {
      const admin = chainConfigs?.veKptMiner?.admin || walletData.address;
      const label = chainConfigs?.veKptMiner?.label ?? "veKptMiner";

      const kptFundQueryClient = new kptContracts.KptFund.KptFundQueryClient(walletData.signingCosmWasmClient, kptFund.address);
      const kptFundConfigRes: KptFundConfigResponse = await kptFundQueryClient.kptFundConfig();
      const initMsg = Object.assign(
        {
          kusd_denom: kptFundConfigRes?.kusd_denom,
          kusd_controller_addr: kptFundConfigRes?.kusd_reward_addr,
          ve_kpt_boost_addr: veKptBoost.address,
          kpt_fund_addr: kptFund.address,
          ve_kpt_addr: veKpt.address,
          reward_controller_addr: walletData.address
        },
        chainConfigs?.veKptMiner?.initMsg
      );
      networkKpt.veKptMiner.address = await instantiateContractByWalletData(walletData, admin, networkKpt.veKptMiner.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      chainConfigs.veKptMiner.deploy = true;
    }
    console.log(`veKptMiner: `, JSON.stringify(networkKpt?.veKptMiner));
  }
}

export async function deployBlindBox(walletData: WalletData, networkKpt: KptDeployContracts): Promise<void> {
  if (!networkKpt?.blindBox?.address) {
    if (!networkKpt?.blindBox) {
      networkKpt.blindBox = {};
    }

    if (!networkKpt?.blindBox?.codeId || networkKpt?.blindBox?.codeId <= 0) {
      const filePath = chainConfigs?.blindBox?.filePath || "../krp-token-contracts/artifacts/blind_box.wasm";
      networkKpt.blindBox.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (networkKpt?.blindBox?.codeId > 0) {
      const admin = chainConfigs?.blindBox?.admin || walletData.address;
      const label = chainConfigs?.blindBox?.label ?? "blindBox";
      const initMsg = Object.assign({}, chainConfigs?.blindBox?.initMsg);
      networkKpt.blindBox.address = await instantiateContractByWalletData(walletData, admin, networkKpt.blindBox.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      chainConfigs.blindBox.deploy = true;
    }
    console.log(`blindBox: `, JSON.stringify(networkKpt?.blindBox));
  }
}

export async function deployBlindBoxReward(walletData: WalletData, networkKpt: KptDeployContracts): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const blindBox: ContractDeployed | undefined = networkKpt?.blindBox;
  if (!kpt?.address || !veKpt?.address || !blindBox?.address) {
    return;
  }

  if (!networkKpt?.blindBoxReward?.address) {
    if (!networkKpt?.blindBoxReward) {
      networkKpt.blindBoxReward = {};
    }

    if (!networkKpt?.blindBoxReward?.codeId || networkKpt?.blindBoxReward?.codeId <= 0) {
      const filePath = chainConfigs?.blindBoxReward?.filePath || "../krp-token-contracts/artifacts/blind_box_reward.wasm";
      networkKpt.blindBoxReward.codeId = await storeCodeByWalletData(walletData, filePath);
      kptWriteArtifact(networkKpt, walletData.chainId);
    }
    if (networkKpt?.blindBoxReward?.codeId > 0) {
      const admin = chainConfigs?.blindBoxReward?.admin || walletData.address;
      const label = chainConfigs?.blindBoxReward?.label ?? "blindBoxReward";
      const reward_token_map_msgs: RewardTokenConfigMsg[] | undefined = chainConfigs?.blindBoxReward?.initMsg?.reward_token_map_msgs;
      reward_token_map_msgs?.map(value => {
        if (value.reward_token) {
          value.reward_token = value.reward_token.replaceAll("%kpt_address%", kpt.address).replaceAll("%ve_kpt_address%", veKpt.address);
        }
      });

      const initMsg = Object.assign(
        {
          nft_contract: blindBox.address
        },
        chainConfigs?.blindBoxReward?.initMsg
      );
      networkKpt.blindBoxReward.address = await instantiateContractByWalletData(walletData, admin, networkKpt.blindBoxReward.codeId, initMsg, label);
      kptWriteArtifact(networkKpt, walletData.chainId);
      chainConfigs.blindBoxReward.deploy = true;
    }
    console.log(`blindBoxReward: `, JSON.stringify(networkKpt?.blindBoxReward));
  }
}

export async function doKptUpdateConfig(walletData: WalletData, kpt: ContractDeployed, kptFund: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log();
  print && console.log(`Do kpt.address update_config enter.`);
  if (!kpt?.address || !kptFund?.address) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  const kptClient = new kptContracts.Kpt.KptClient(walletData.signingCosmWasmClient, walletData.address, kpt.address);
  const kptQueryClient = new kptContracts.Kpt.KptQueryClient(walletData.signingCosmWasmClient, kpt.address);

  let beforeConfigRes: KptConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await kptQueryClient.kptConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`kpt.address: need update_config. kptFund: ${kptFund?.address}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && kptFund?.address === beforeConfigRes?.kpt_fund) {
    console.warn(`********* The kpt.kptFund is already done. kptFund: ${kptFund?.address}`);
    return;
  }
  const doRes = await kptClient.updateConfig({ kptFund: kptFund.address });
  console.log(`Do kpt.address update_config ok. \n${doRes?.transactionHash}`);

  const afterConfigRes = await kptQueryClient.kptConfig();
  print && console.log(`config info: \n${JSON.stringify(afterConfigRes)}`);
}

export async function doVeKptUpdateConfig(walletData: WalletData, veKpt: ContractDeployed, kptFund: ContractDeployed, print: boolean = true): Promise<any> {
  print && console.log();
  print && console.log(`Do veKpt.address update_config enter.`);
  if (!veKpt?.address || !kptFund?.address) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  const veKptClient = new kptContracts.VeKpt.VeKptClient(walletData.signingCosmWasmClient, walletData.address, veKpt.address);
  const veKptQueryClient = new kptContracts.VeKpt.VeKptQueryClient(walletData.signingCosmWasmClient, veKpt.address);

  let beforeConfigRes: KptConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await veKptQueryClient.voteConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`veKpt.address: need update_config. kptFund: ${kptFund?.address}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && kptFund?.address === beforeConfigRes?.kpt_fund) {
    console.warn(`********* The veKpt.kptFund is already done. kptFund: ${kptFund?.address}`);
    return;
  }
  const doRes = await veKptClient.updateConfig({ kptFund: kptFund.address });
  console.log(`Do veKpt.address update_config ok. \n${doRes?.transactionHash}`);

  const afterConfigRes = await veKptQueryClient.voteConfig();
  print && console.log(`config info: \n${JSON.stringify(afterConfigRes)}`);
}

export async function doVeKptSetMinters(walletData: WalletData, veKpt: ContractDeployed, stakingRewards: ContractDeployed, isMinter: boolean, print: boolean = true): Promise<any> {
  print && console.log();
  print && console.log(`Do veKpt.address setMinters enter.`);
  if (!veKpt?.address || !stakingRewards?.address) {
    console.log();
    console.error("********* missing info!");
    return;
  }
  const veKptClient = new kptContracts.VeKpt.VeKptClient(walletData.signingCosmWasmClient, walletData.address, veKpt.address);
  const veKptQueryClient = new kptContracts.VeKpt.VeKptQueryClient(walletData.signingCosmWasmClient, veKpt.address);

  let beforeRes: IsMinterResponse = null;
  let initFlag = true;
  try {
    beforeRes = await veKptQueryClient.isMinter({ address: stakingRewards.address });
  } catch (error: any) {
    if (error?.toString().includes("minter not found")) {
      initFlag = false;
      console.error(`veKpt.address: need setMinters. stakingRewards: ${stakingRewards?.address}`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes?.is_minter) {
    console.warn(`********* The veKpt.address minter is already done. stakingRewards: ${stakingRewards?.address}`);
    return;
  }
  const doRes = await veKptClient.setMinters({ contracts: [stakingRewards.address], isMinter: [isMinter] });
  console.log(`Do veKpt.address setMinters ok. \n${doRes?.transactionHash}`);

  const afterRes = await veKptQueryClient.isMinter({ address: stakingRewards.address });
  print && console.log(`veKpt.address isMinter: ${stakingRewards?.address} / ${JSON.stringify(afterRes)}`);
}

export async function printDeployedKptContracts(networkKpt: KptDeployContracts): Promise<void> {
  console.log();
  console.log(`--- --- deployed kpt contracts info --- ---`);
  const tableData = [
    { name: `kpt`, deploy: chainConfigs?.kpt?.deploy, codeId: networkKpt?.kpt?.codeId || 0, address: networkKpt?.kpt?.address },
    { name: `kptFund`, deploy: chainConfigs?.kptFund?.deploy, codeId: networkKpt?.kptFund?.codeId || 0, address: networkKpt?.kptFund?.address },
    // { name: `stakingRewards`, deploy: chainConfigs?.stakingRewards?.deploy, codeId: networkKpt?.stakingRewards?.codeId || 0, address: networkKpt?.stakingRewards?.address },
    { name: `veKpt`, deploy: chainConfigs?.veKpt?.deploy, codeId: networkKpt?.veKpt?.codeId || 0, address: networkKpt?.veKpt?.address },
    { name: `veKptBoost`, deploy: chainConfigs?.veKptBoost?.deploy, codeId: networkKpt?.veKptBoost?.codeId || 0, address: networkKpt?.veKptBoost?.address },
    { name: `veKptMiner`, deploy: chainConfigs?.veKptMiner?.deploy, codeId: networkKpt?.veKptMiner?.codeId || 0, address: networkKpt?.veKptMiner?.address },
    { name: `blindBox`, deploy: chainConfigs?.blindBox?.deploy, codeId: networkKpt?.blindBox?.codeId || 0, address: networkKpt?.blindBox?.address },
    { name: `blindBoxReward`, deploy: chainConfigs?.blindBoxReward?.deploy, codeId: networkKpt?.blindBoxReward?.codeId || 0, address: networkKpt?.blindBoxReward?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}

export async function printDeployedKptStakingContracts(networkKpt: KptDeployContracts): Promise<void> {
  console.log();
  console.log(`--- --- deployed kpt:staking contracts info --- ---`);
  if (!networkKpt?.stakingRewardsPairs || networkKpt?.stakingRewardsPairs?.length <= 0) {
    return;
  }
  const tableData = [];
  for (const stakingRewardsPairs of networkKpt?.stakingRewardsPairs) {
    const stakingRewardsPairsConfig: StakingRewardsPairs = chainConfigs?.stakingRewardsPairs?.find((v: StakingRewardsPairs) => stakingRewardsPairs?.staking_token === v.staking_token);
    tableData.push({
      name: stakingRewardsPairs?.name,
      stakingToken: stakingRewardsPairs?.staking_token,
      deploy: stakingRewardsPairsConfig?.stakingRewards?.deploy ?? false,
      codeId: stakingRewardsPairs?.stakingRewards?.codeId || 0,
      address: stakingRewardsPairs?.stakingRewards?.address
    });
  }

  console.table(tableData, [`name`, `stakingToken`, `codeId`, `address`, `deploy`]);
}
