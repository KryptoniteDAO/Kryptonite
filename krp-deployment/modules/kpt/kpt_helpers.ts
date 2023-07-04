import type { ContractDeployed, InitialBalance, WalletData } from "@/types";
import type {
  BlindBoxContractConfig,
  BlindBoxRewardContractConfig,
  KptContractConfig,
  KptContractsConfig,
  KptContractsDeployed,
  KptFundContractConfig,
  StakingRewardsPairsConfig,
  StakingRewardsPairsContractsDeployed,
  VeKptBoostContractConfig,
  VeKptContractConfig,
  VeKptMinerContractConfig,
  BlindBoxRewardTokenConfig,
  KptDistributeContractConfig,
  BlindBoxInviterRewardContractConfig
} from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, readArtifact, writeArtifact } from "@/common";
import { kptContracts } from "@/contracts";
import { KptFundConfigResponse } from "@/contracts/kpt/KptFund.types";
import { KptConfigResponse } from "@/contracts/kpt/Kpt.types";
import { IsMinterResponse, VoteConfigResponse } from "@/contracts/kpt/VeKpt.types";
import { KptDistributeRuleConfig } from "@/modules";
import { QueryRuleInfoResponse } from "@/contracts/kpt/KptDistribute.types";
import { BlindBoxConfigResponse } from "@/contracts/kpt/BlindBox.types";

export const KPT_ARTIFACTS_PATH = "../krp-token-contracts/artifacts";
export const KPT_CONTRACTS_PATH = "../krp-token-contracts/contracts";
export const KPT_MODULE_NAME = "kpt";
export const kptConfigs: KptContractsConfig = readArtifact(`${KPT_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${KPT_MODULE_NAME}/`);

export function getKptDeployFileName(chainId: string): string {
  return `deployed_${KPT_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function kptReadArtifact(chainId: string): KptContractsDeployed {
  return readArtifact(getKptDeployFileName(chainId), KPT_ARTIFACTS_PATH) as KptContractsDeployed;
}

export function kptWriteArtifact(networkStaking: KptContractsDeployed, chainId: string): void {
  writeArtifact(networkStaking, getKptDeployFileName(chainId), KPT_ARTIFACTS_PATH);
}

export async function deployKpt(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const contractName: keyof Required<KptContractsDeployed> = "kpt";
  const config: KptContractConfig | undefined = kptConfigs?.[contractName];
  const initialBalances: InitialBalance[] | undefined = config?.initMsg?.cw20_init_msg?.initial_balances;
  initialBalances?.map(value => {
    if (!value.address) {
      value.address = walletData.address;
    }
  });
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {});
  const writeFunc = kptWriteArtifact;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployKptFund(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  if (!kpt?.address || !veKpt?.address) {
    return;
  }

  const contractName: keyof Required<KptContractsDeployed> = "kptFund";
  const config: KptFundContractConfig | undefined = kptConfigs?.[contractName];
  const defaultInitMsg = Object.assign(
    {
      kpt_addr: kpt.address,
      ve_kpt_addr: veKpt.address
    },
    config?.initMsg ?? {},
    {
      kusd_denom: config?.initMsg?.kusd_denom ?? kptConfigs.kusd_denom,
      kusd_reward_addr: config?.initMsg?.kusd_reward_addr ?? kptConfigs.kusd_reward_controller
    }
  );
  const writeFunc = kptWriteArtifact;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployStakingRewards(walletData: WalletData, networkKpt: KptContractsDeployed, stakingRewardsPairsConfig: StakingRewardsPairsConfig): Promise<void> {
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const kptFund: ContractDeployed | undefined = networkKpt?.kptFund;
  const veKptBoost: ContractDeployed | undefined = networkKpt?.veKptBoost;
  if (!stakingRewardsPairsConfig?.staking_token || !veKpt?.address || !kptFund?.address || !veKptBoost?.address) {
    return;
  }

  let stakingRewardsPairsNetwork: StakingRewardsPairsContractsDeployed | undefined = networkKpt?.stakingRewardsPairs?.find((v: StakingRewardsPairsContractsDeployed) => stakingRewardsPairsConfig?.staking_token === v.staking_token);
  if (!!stakingRewardsPairsNetwork?.stakingRewards?.address) {
    return;
  }
  if (!stakingRewardsPairsNetwork) {
    stakingRewardsPairsNetwork = {
      name: stakingRewardsPairsConfig?.name,
      staking_token: stakingRewardsPairsConfig?.staking_token,
      stakingRewards: {} as ContractDeployed
    };
    if (!networkKpt?.stakingRewardsPairs) {
      networkKpt.stakingRewardsPairs = [];
    }
    networkKpt.stakingRewardsPairs.push(stakingRewardsPairsNetwork);
  }

  const contractName: keyof Required<StakingRewardsPairsContractsDeployed> = "stakingRewards";
  const defaultInitMsg: object = Object.assign(
    {
      rewards_token: veKpt.address,
      ve_kpt_boost: veKptBoost.address,
      kpt_fund: kptFund.address,
      staking_token: stakingRewardsPairsConfig.staking_token
    },
    stakingRewardsPairsConfig?.stakingRewards?.initMsg ?? {},
    {
      reward_controller_addr: stakingRewardsPairsConfig?.stakingRewards?.initMsg?.reward_controller_addr || walletData.address
    }
  );
  const writeFunc = kptWriteArtifact;

  await deployContract(walletData, contractName, networkKpt, stakingRewardsPairsNetwork.stakingRewards, stakingRewardsPairsConfig.stakingRewards, { defaultInitMsg, writeFunc });
}

export async function deployVeKpt(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const contractName: keyof Required<KptContractsDeployed> = "veKpt";
  const config: VeKptContractConfig | undefined = kptConfigs?.[contractName];
  const initialBalances: InitialBalance[] | undefined = config?.initMsg?.cw20_init_msg?.initial_balances;
  initialBalances?.map(value => {
    if (!value.address) {
      value.address = walletData.address;
    }
  });
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {});
  const writeFunc = kptWriteArtifact;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployVeKptBoost(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const contractName: keyof Required<KptContractsDeployed> = "veKptBoost";
  const config: VeKptBoostContractConfig | undefined = kptConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {});
  const writeFunc = kptWriteArtifact;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployVeKptMiner(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const kptFund: ContractDeployed | undefined = networkKpt?.kptFund;
  const veKptBoost: ContractDeployed | undefined = networkKpt?.veKptBoost;
  if (!veKpt?.address || !kptFund?.address || !veKptBoost?.address) {
    return;
  }

  const contractName: keyof Required<KptContractsDeployed> = "veKptMiner";
  const config: VeKptMinerContractConfig | undefined = kptConfigs?.[contractName];
  const kptFundQueryClient = new kptContracts.KptFund.KptFundQueryClient(walletData.signingCosmWasmClient, kptFund.address);
  const kptFundConfigRes: KptFundConfigResponse = await kptFundQueryClient.kptFundConfig();
  const defaultInitMsg = Object.assign(
    {
      kusd_denom: kptFundConfigRes?.kusd_denom,
      kusd_controller_addr: kptFundConfigRes?.kusd_reward_addr,
      ve_kpt_boost_addr: veKptBoost.address,
      kpt_fund_addr: kptFund.address,
      ve_kpt_addr: veKpt.address,
      reward_controller_addr: walletData.address
    },
    config?.initMsg ?? {}
  );
  const writeFunc = kptWriteArtifact;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployBlindBox(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  // const blindBox: ContractDeployed | undefined = networkKpt?.blindBox;
  if (!kpt?.address || !veKpt?.address) {
    return;
  }
  const contractName: keyof Required<KptContractsDeployed> = "blindBox";
  const config: BlindBoxContractConfig | undefined = kptConfigs?.[contractName];
  const rewardTokenConfig: Record<string, BlindBoxRewardTokenConfig> | undefined = config?.initMsg?.referral_reward_config?.reward_token_config;
  for (let rewardTokenConfigKey in rewardTokenConfig) {
    let tokenConfig: BlindBoxRewardTokenConfig | undefined = rewardTokenConfig[rewardTokenConfigKey];
    if (tokenConfig?.reward_token) {
      tokenConfig.reward_token = tokenConfig.reward_token.replaceAll("%kpt_address%", kpt.address).replaceAll("%ve_kpt_address%", veKpt.address).replaceAll("%kusd_address%", kptConfigs.kusd_denom);
    }
  }
  // level_infos?.map(value => {
  //   if (value.) {
  //     value.reward_token = value.reward_token.replaceAll("%kpt_address%", kpt.address).replaceAll("%ve_kpt_address%", veKpt.address);
  //   }
  // });

  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, { price_token: config?.initMsg?.price_token ?? kptConfigs.kusd_denom });
  const writeFunc = kptWriteArtifact;
  const storeCoreGasLimit = 4_000_000;
  const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc, storeCoreGasLimit, instantiateGasLimit });
}

export async function deployKptDistribute(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  if (!kpt?.address) {
    return;
  }
  const contractName: keyof Required<KptContractsDeployed> = "kptDistribute";
  const config: KptDistributeContractConfig | undefined = kptConfigs?.[contractName];
  const ruleConfigs: Record<string, KptDistributeRuleConfig> | undefined = config?.initMsg?.rule_configs_map;
  for (let ruleConfigKey in ruleConfigs) {
    let ruleConfig: KptDistributeRuleConfig | undefined = ruleConfigs[ruleConfigKey];
    if (!ruleConfig?.rule_owner) {
      ruleConfig.rule_owner = walletData.address;
    }
  }

  const defaultInitMsg = Object.assign(
    {
      distribute_token: kpt?.address
    },
    config?.initMsg ?? {}
  );
  const writeFunc = kptWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc, instantiateGasLimit });
}

export async function deployBlindBoxReward(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const blindBox: ContractDeployed | undefined = networkKpt?.blindBox;
  const kptDistribute: ContractDeployed | undefined = networkKpt?.kptDistribute;
  if (!kpt?.address || !veKpt?.address || !blindBox?.address || !kptDistribute?.address) {
    return;
  }

  const contractName: keyof Required<KptContractsDeployed> = "blindBoxReward";
  const config: BlindBoxRewardContractConfig | undefined = kptConfigs?.[contractName];

  const defaultInitMsg = Object.assign(
    {
      nft_contract: blindBox.address,
      box_config: {
        box_reward_token: kpt?.address,
        box_reward_distribute_addr: kptDistribute?.address
      }
    },
    config?.initMsg ?? {}
  );
  defaultInitMsg.box_config.box_reward_token = kpt?.address;
  defaultInitMsg.box_config.box_reward_distribute_addr = kptDistribute?.address;

  const writeFunc = kptWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployBlindBoxInviterReward(walletData: WalletData, networkKpt: KptContractsDeployed): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const blindBox: ContractDeployed | undefined = networkKpt?.blindBox;
  const kptDistribute: ContractDeployed | undefined = networkKpt?.kptDistribute;
  if (!kpt?.address || !veKpt?.address || !blindBox?.address || !kptDistribute?.address) {
    return;
  }

  const contractName: keyof Required<KptContractsDeployed> = "blindBoxInviterReward";
  const config: BlindBoxInviterRewardContractConfig | undefined = kptConfigs?.[contractName];
  const defaultInitMsg = Object.assign(
    {
      nft_contract: blindBox.address
    },
    config?.initMsg ?? {},
    {
      reward_native_token: config?.initMsg?.reward_native_token ?? kptConfigs.kusd_denom
    }
  );

  const writeFunc = kptWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkKpt, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doKptUpdateConfig(walletData: WalletData, networkKpt: KptContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do kpt.kpt update_config enter.`);
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const kptFund: ContractDeployed | undefined = networkKpt?.kptFund;
  const kptDistribute: ContractDeployed | undefined = networkKpt?.kptDistribute;
  if (!kpt?.address || !kptFund?.address || !kptDistribute?.address) {
    console.error(`\n  ********* missing info!`);
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
      console.error(`\n  ********* kpt.kpt: need update_config. `);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && kptFund?.address === beforeConfigRes?.kpt_fund && kptDistribute?.address === beforeConfigRes?.kpt_distribute) {
    console.warn(`\n  ######### The kpt.kpt config is already done. `);
    return;
  }
  const doRes = await kptClient.updateConfig({ kptFund: kptFund.address, kptDistribute: kptDistribute?.address });
  console.log(`Do kpt.kpt update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await kptQueryClient.kptConfig();
  print && console.log(`config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function doVeKptUpdateConfig(walletData: WalletData, networkKpt: KptContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do kpt.veKpt update_config enter.`);
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const kptFund: ContractDeployed | undefined = networkKpt?.kptFund;
  if (!veKpt?.address || !kptFund?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const veKptClient = new kptContracts.VeKpt.VeKptClient(walletData.signingCosmWasmClient, walletData.address, veKpt.address);
  const veKptQueryClient = new kptContracts.VeKpt.VeKptQueryClient(walletData.signingCosmWasmClient, veKpt.address);

  let beforeConfigRes: VoteConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await veKptQueryClient.voteConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  ********* kpt.veKpt: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && kptFund?.address === beforeConfigRes?.kpt_fund) {
    console.warn(`\n  ######### The kpt.veKpt config is already done.`);
    return;
  }
  const doRes = await veKptClient.updateConfig({ kptFund: kptFund.address });
  console.log(`Do kpt.veKpt update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await veKptQueryClient.voteConfig();
  print && console.log(`kpt.veKpt config info: ${JSON.stringify(afterConfigRes)}`);
}

export async function doBlindBoxConfig(walletData: WalletData, networkKpt: KptContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do kpt.blindBox update_config enter.`);
  const blindBox: ContractDeployed | undefined = networkKpt?.blindBox;
  const blindBoxInviterReward: ContractDeployed | undefined = networkKpt?.blindBoxInviterReward;
  if (!blindBox?.address || !blindBoxInviterReward?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const blindBoxClient = new kptContracts.BlindBox.BlindBoxClient(walletData.signingCosmWasmClient, walletData.address, blindBox.address);
  const blindBoxQueryClient = new kptContracts.BlindBox.BlindBoxQueryClient(walletData.signingCosmWasmClient, blindBox.address);

  let beforeConfigRes: BlindBoxConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await blindBoxQueryClient.queryBlindBoxConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.error(`\n  ********* kpt.blindBox: need update_config. `);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && blindBoxInviterReward?.address === beforeConfigRes?.inviter_reward_box_contract) {
    console.warn(`\n  ######### The kpt.blindBox config is already done. `);
    return;
  }
  const doRes = await blindBoxClient.updateConfig({ inviterRewardBoxContract: blindBoxInviterReward.address });
  console.log(`Do kpt.blindBox update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await blindBoxQueryClient.queryBlindBoxConfig();
  print && console.log(`config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function doVeKptSetMinters(walletData: WalletData, veKpt: ContractDeployed, stakingRewards: ContractDeployed, isMinter: boolean, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do kpt.veKpt setMinters enter. stakingRewards: ${stakingRewards?.address}`);
  if (!veKpt?.address || !stakingRewards?.address) {
    console.error(`\n  ********* missing info!`);
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
      console.error(`\n  ********* kpt.veKpt: need setMinters.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes?.is_minter) {
    console.warn(`\n  ######### The kpt.veKpt minter is already done.`);
    return;
  }
  const doRes = await veKptClient.setMinters({ contracts: [stakingRewards.address], isMinter: [isMinter] });
  console.log(`Do kpt.veKpt setMinters ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await veKptQueryClient.isMinter({ address: stakingRewards.address });
  print && console.log(`kpt.veKpt isMinter: ${JSON.stringify(afterRes)}`);
}

export async function doKptDistributeUpdateRuleConfig(walletData: WalletData, networkKpt: KptContractsDeployed, {ruleType, ruleOwner}:{ruleType: string,ruleOwner: string }, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do kpt.kptDistribute UpdateRuleConfig enter. ruleType: ${ruleType}`);
  const kptDistribute: ContractDeployed | undefined = networkKpt?.kptDistribute;
  // const blindBoxInviterReward: ContractDeployed | undefined = networkKpt?.blindBoxInviterReward;
  if (!kptDistribute?.address || !ruleType || !ruleOwner) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const kptDistributeClient = new kptContracts.KptDistribute.KptDistributeClient(walletData.signingCosmWasmClient, walletData.address, kptDistribute.address);
  const kptDistributeQueryClient = new kptContracts.KptDistribute.KptDistributeQueryClient(walletData.signingCosmWasmClient, kptDistribute.address);

  let beforeRes: QueryRuleInfoResponse = null;
  let initFlag = true;
  try {
    beforeRes = await kptDistributeQueryClient.queryRuleInfo({ ruleType });
  } catch (error: any) {
    if (error?.toString().includes("minter not found")) {
      initFlag = false;
      console.error(`\n  ********* kpt.kptDistribute: need UpdateRuleConfig.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes?.rule_config.rule_owner === ruleOwner) {
    console.warn(`\n  ######### The kpt.kptDistribute rule_config is already done.`);
    return;
  }
  const doRes = await kptDistributeClient.updateRuleConfig({ updateRuleMsg: { rule_type: ruleType, rule_owner: ruleOwner } });
  console.log(`Do kpt.veKpt setMinters ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await kptDistributeQueryClient.queryRuleInfo({ ruleType });
  print && console.log(`kpt.kptDistribute: ${JSON.stringify(afterRes)}`);
}

export async function printDeployedKptContracts(networkKpt: KptContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed kpt contracts info --- ---`);
  const tableData = [
    { name: `kpt`, deploy: kptConfigs?.kpt?.deploy, codeId: networkKpt?.kpt?.codeId || 0, address: networkKpt?.kpt?.address },
    { name: `kptFund`, deploy: kptConfigs?.kptFund?.deploy, codeId: networkKpt?.kptFund?.codeId || 0, address: networkKpt?.kptFund?.address },
    { name: `veKpt`, deploy: kptConfigs?.veKpt?.deploy, codeId: networkKpt?.veKpt?.codeId || 0, address: networkKpt?.veKpt?.address },
    { name: `veKptBoost`, deploy: kptConfigs?.veKptBoost?.deploy, codeId: networkKpt?.veKptBoost?.codeId || 0, address: networkKpt?.veKptBoost?.address },
    { name: `veKptMiner`, deploy: kptConfigs?.veKptMiner?.deploy, codeId: networkKpt?.veKptMiner?.codeId || 0, address: networkKpt?.veKptMiner?.address },
    { name: `blindBox`, deploy: kptConfigs?.blindBox?.deploy, codeId: networkKpt?.blindBox?.codeId || 0, address: networkKpt?.blindBox?.address },
    { name: `kptDistribute`, deploy: kptConfigs?.kptDistribute?.deploy, codeId: networkKpt?.kptDistribute?.codeId || 0, address: networkKpt?.kptDistribute?.address },
    { name: `blindBoxReward`, deploy: kptConfigs?.blindBoxReward?.deploy, codeId: networkKpt?.blindBoxReward?.codeId || 0, address: networkKpt?.blindBoxReward?.address },
    { name: `blindBoxInviterReward`, deploy: kptConfigs?.blindBoxInviterReward?.deploy, codeId: networkKpt?.blindBoxInviterReward?.codeId || 0, address: networkKpt?.blindBoxInviterReward?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
  await printDeployedKptStakingContracts(networkKpt);
}

export async function printDeployedKptStakingContracts(networkKpt: KptContractsDeployed): Promise<void> {
  if (!networkKpt?.stakingRewardsPairs || networkKpt?.stakingRewardsPairs?.length <= 0) {
    return;
  }
  const tableData = [];
  for (const stakingRewardsPairs of networkKpt?.stakingRewardsPairs) {
    const stakingRewardsPairsConfig: StakingRewardsPairsConfig = kptConfigs?.stakingRewardsPairs?.find((v: StakingRewardsPairsConfig) => stakingRewardsPairs?.staking_token === v.staking_token);
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
