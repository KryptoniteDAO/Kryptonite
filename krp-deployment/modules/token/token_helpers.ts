import type { ContractDeployed, InitialBalance, WalletData } from "@/types";
import type {
  TokenContractConfig,
  TokenContractsConfig,
  TokenContractsDeployed,
  TokenFundContractConfig,
  TokenStakingPairsConfig,
  TokenStakingPairsContractsDeployed,
  TokenBoostContractConfig,
  TokenVeSeilorContractConfig,
  TokenTreasureContractConfig,
  TokenDistributeContractConfig,
  TokenKeeperContractConfig,
  TokenDistributeRuleConfig,
  TokenDispatcherContractConfig
} from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, readArtifact, writeArtifact } from "@/common";
import { tokenContracts } from "@/contracts";
import { FundConfigResponse } from "@/contracts/token/Fund.types";
import { SeilorConfigResponse } from "@/contracts/token/Seilor.types";
import { IsMinterResponse, VoteConfigResponse } from "@/contracts/token/VeSeilor.types";
import { QueryRuleInfoResponse } from "@/contracts/token/Distribute.types";

export const TOKEN_ARTIFACTS_PATH: string = "../krp-token-contracts/artifacts";
export const TOKEN_CONTRACTS_PATH: string = "../krp-token-contracts/contracts";
export const TOKEN_MODULE_NAME: string = "token";
export const tokenConfigs: TokenContractsConfig = readArtifact(`${TOKEN_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${TOKEN_MODULE_NAME}/`);

export function getTokenDeployFileName(chainId: string): string {
  return `deployed_${TOKEN_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function tokenReadArtifact(chainId: string): TokenContractsDeployed {
  return readArtifact(getTokenDeployFileName(chainId), TOKEN_ARTIFACTS_PATH) as TokenContractsDeployed;
}

export function tokenWriteArtifact(networkStaking: TokenContractsDeployed, chainId: string): void {
  writeArtifact(networkStaking, getTokenDeployFileName(chainId), TOKEN_ARTIFACTS_PATH);
}

export async function deployTokenSeilor(walletData: WalletData, networkToken: TokenContractsDeployed): Promise<void> {
  const contractName: keyof Required<TokenContractsDeployed> = "seilor";
  const config: TokenContractConfig | undefined = tokenConfigs?.[contractName];
  const initialBalances: InitialBalance[] | undefined = config?.initMsg?.cw20_init_msg?.initial_balances;
  initialBalances?.map(value => {
    if (!value.address) {
      value.address = walletData?.activeWallet?.address;
    }
  });
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {});
  const writeFunc = tokenWriteArtifact;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenFund(walletData: WalletData, networkToken: TokenContractsDeployed, stable_coin_denom: string | undefined): Promise<void> {
  const { seilor, veSeilor } = networkToken;
  if (!seilor?.address || !veSeilor?.address) {
    return;
  }

  const contractName: keyof Required<TokenContractsDeployed> = "fund";
  const config: TokenFundContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    seilor_addr: config?.initMsg?.seilor_addr || seilor.address,
    ve_seilor_addr: config?.initMsg?.ve_seilor_addr || veSeilor.address,
    kusd_denom: config?.initMsg?.kusd_denom || stable_coin_denom,
    kusd_reward_addr: config?.initMsg?.kusd_reward_addr || tokenConfigs.kusd_reward_controller || walletData?.activeWallet?.address
  });
  const writeFunc = tokenWriteArtifact;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deploySeilorStaking(walletData: WalletData, networkToken: TokenContractsDeployed, stakingRewardsPairsConfig: TokenStakingPairsConfig): Promise<void> {
  const { veSeilor, fund, boost } = networkToken;
  if (!stakingRewardsPairsConfig?.staking_token || !veSeilor?.address || !fund?.address || !boost?.address) {
    return;
  }

  let stakingPairsNetwork: TokenStakingPairsContractsDeployed | undefined = networkToken?.stakingPairs?.find((v: TokenStakingPairsContractsDeployed) => stakingRewardsPairsConfig?.staking_token === v.staking_token);
  if (!!stakingPairsNetwork?.staking?.address) {
    return;
  }
  if (!stakingPairsNetwork) {
    stakingPairsNetwork = {
      name: stakingRewardsPairsConfig?.name,
      staking_token: stakingRewardsPairsConfig?.staking_token,
      pool_address: stakingRewardsPairsConfig?.pool_address,
      staking: {} as ContractDeployed
    };
    if (!networkToken?.stakingPairs) {
      networkToken.stakingPairs = [];
    }
    networkToken.stakingPairs.push(stakingPairsNetwork);
  }

  const contractName: keyof Required<TokenStakingPairsContractsDeployed> = "staking";
  const defaultInitMsg: object = Object.assign({}, stakingRewardsPairsConfig?.staking?.initMsg ?? {}, {
    rewards_token: stakingRewardsPairsConfig?.staking?.initMsg?.rewards_token || veSeilor.address,
    boost: stakingRewardsPairsConfig?.staking?.initMsg?.boost || boost.address,
    fund: stakingRewardsPairsConfig?.staking?.initMsg?.fund || fund.address,
    staking_token: stakingRewardsPairsConfig.staking_token,
    reward_controller_addr: stakingRewardsPairsConfig?.staking?.initMsg?.reward_controller_addr || tokenConfigs?.kusd_reward_controller || walletData?.activeWallet?.address
  });
  const writeFunc = tokenWriteArtifact;

  await deployContract(walletData, contractName, networkToken, stakingPairsNetwork.staking, stakingRewardsPairsConfig.staking, { defaultInitMsg, writeFunc });
}

export async function deployTokenVeSeilor(walletData: WalletData, networkToken: TokenContractsDeployed): Promise<void> {
  const contractName: keyof Required<TokenContractsDeployed> = "veSeilor";
  const config: TokenVeSeilorContractConfig | undefined = tokenConfigs?.[contractName];
  const initialBalances: InitialBalance[] | undefined = config?.initMsg?.cw20_init_msg?.initial_balances;
  initialBalances?.map(value => {
    if (!value.address) {
      value.address = walletData?.activeWallet?.address;
    }
  });
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {});
  const writeFunc = tokenWriteArtifact;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenBoost(walletData: WalletData, networkToken: TokenContractsDeployed): Promise<void> {
  const contractName: keyof Required<TokenContractsDeployed> = "boost";
  const config: TokenBoostContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {});
  const writeFunc = tokenWriteArtifact;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenTreasure(walletData: WalletData, networkToken: TokenContractsDeployed): Promise<void> {
  const { seilor } = networkToken;
  if (!seilor?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const contractName: keyof Required<TokenContractsDeployed> = "treasure";
  const config: TokenTreasureContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    lock_token: config?.initMsg?.lock_token || seilor.address,
    punish_receiver: config?.initMsg?.punish_receiver || tokenConfigs?.kusd_reward_controller || walletData?.activeWallet?.address
  });
  const writeFunc = tokenWriteArtifact;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenDistribute(walletData: WalletData, networkToken: TokenContractsDeployed): Promise<void> {
  const { seilor } = networkToken;
  if (!seilor?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const contractName: keyof Required<TokenContractsDeployed> = "distribute";
  const config: TokenDistributeContractConfig | undefined = tokenConfigs?.[contractName];
  const ruleConfigs: Record<string, TokenDistributeRuleConfig> | undefined = config?.initMsg?.rule_configs_map as unknown as Record<string, TokenDistributeRuleConfig>;
  for (let ruleConfigKey in ruleConfigs) {
    let ruleConfig: TokenDistributeRuleConfig | undefined = ruleConfigs[ruleConfigKey];
    if (!ruleConfig?.rule_owner) {
      ruleConfig.rule_owner = walletData?.activeWallet?.address;
    }
  }

  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    distribute_token: config?.initMsg?.distribute_token || seilor?.address
  });
  const writeFunc = tokenWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenDispatcher(walletData: WalletData, networkToken: TokenContractsDeployed): Promise<void> {
  const { seilor } = networkToken;
  if (!seilor?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const contractName: keyof Required<TokenContractsDeployed> = "dispatcher";
  const config: TokenDispatcherContractConfig | undefined = tokenConfigs?.[contractName];

  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    claim_token: config?.initMsg?.claim_token || seilor?.address
    // regret_token_receiver: config?.initMsg?.regret_token_receiver || tokenConfigs?.kusd_reward_controller || walletData?.activeWallet?.address
  });
  const writeFunc = tokenWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenKeeper(walletData: WalletData, networkToken: TokenContractsDeployed, stable_coin_denom: string): Promise<void> {
  const { fund } = networkToken;
  if (!fund?.address) {
    return;
  }

  const contractName: keyof Required<TokenContractsDeployed> = "keeper";
  const config: TokenKeeperContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData?.activeWallet?.address,
    rewards_contract: config?.initMsg?.rewards_contract || fund?.address,
    rewards_denom: config?.initMsg?.rewards_denom || stable_coin_denom
  });
  const writeFunc = tokenWriteArtifact;

  await deployContract(walletData, contractName, networkToken, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doTokenSeilorUpdateConfig0(walletData: WalletData, networkToken: TokenContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.seilor update_config_0 enter.`);
  const { seilor, distribute } = networkToken;
  if (!seilor?.address || !distribute?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const seilorClient = new tokenContracts.Seilor.SeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, seilor.address);
  const seilorQueryClient = new tokenContracts.Seilor.SeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, seilor.address);

  let beforeConfigRes: SeilorConfigResponse = null;
  let initFlag: boolean = true;
  try {
    beforeConfigRes = await seilorQueryClient.seilorConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.seilor: need update_config. `);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && distribute?.address === beforeConfigRes?.distribute) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.seilor config is already done. `);
    return;
  }
  const doRes = await seilorClient.updateConfig({ distribute: distribute?.address });
  console.log(`  Do ${TOKEN_MODULE_NAME}.seilor update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await seilorQueryClient.seilorConfig();
  print && console.log(`  after config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function doTokenSeilorUpdateConfig(walletData: WalletData, networkToken: TokenContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.seilor update_config enter.`);
  const { seilor, fund, distribute } = networkToken;
  if (!seilor?.address || !fund?.address || !distribute?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const seilorClient = new tokenContracts.Seilor.SeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, seilor.address);
  const seilorQueryClient = new tokenContracts.Seilor.SeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, seilor.address);

  let beforeConfigRes: SeilorConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await seilorQueryClient.seilorConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.seilor: need update_config. `);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && fund?.address === beforeConfigRes?.fund && distribute?.address === beforeConfigRes?.distribute) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.seilor config is already done. `);
    return;
  }
  const doRes = await seilorClient.updateConfig({ fund: fund.address, distribute: distribute?.address });
  console.log(`  Do ${TOKEN_MODULE_NAME}.seilor update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await seilorQueryClient.seilorConfig();
  print && console.log(`  after config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function doTokenVeSeilorUpdateConfig(walletData: WalletData, networkToken: TokenContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.veSeilor update_config enter.`);
  const { veSeilor, fund } = networkToken;
  if (!veSeilor?.address || !fund?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const veSeilorClient = new tokenContracts.VeSeilor.VeSeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, veSeilor.address);
  const veSeilorQueryClient = new tokenContracts.VeSeilor.VeSeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, veSeilor.address);

  let beforeConfigRes: VoteConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await veSeilorQueryClient.voteConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.veSeilor: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && fund?.address === beforeConfigRes?.fund) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.veSeilor config is already done.`);
    return;
  }
  const doRes = await veSeilorClient.updateConfig({ fund: fund.address });
  console.log(`  Do ${TOKEN_MODULE_NAME}.veSeilor update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await veSeilorQueryClient.voteConfig();
  print && console.log(`  after ${TOKEN_MODULE_NAME}.veSeilor config info: ${JSON.stringify(afterConfigRes)}`);
}

export async function doVeSeilorSetMinters(walletData: WalletData, veSeilor: ContractDeployed, staking: ContractDeployed, isMinter: boolean, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.veSeilor setMinters enter. staking: ${staking?.address}`);
  if (!veSeilor?.address || !staking?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const veSeilorClient = new tokenContracts.VeSeilor.VeSeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, veSeilor.address);
  const veSeilorQueryClient = new tokenContracts.VeSeilor.VeSeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, veSeilor.address);

  let beforeRes: IsMinterResponse = null;
  let initFlag = true;
  try {
    beforeRes = await veSeilorQueryClient.isMinter({ address: staking.address });
  } catch (error: any) {
    if (error?.toString().includes("minter not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.veSeilor: need setMinters.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes?.is_minter) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.veSeilor minter is already done.`);
    return;
  }
  const doRes = await veSeilorClient.setMinters({ contracts: [staking.address], isMinter: [isMinter] });
  console.log(`  Do ${TOKEN_MODULE_NAME}.veSeilor setMinters ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await veSeilorQueryClient.isMinter({ address: staking.address });
  print && console.log(`  after ${TOKEN_MODULE_NAME}.veSeilor isMinter: ${JSON.stringify(afterRes)}`);
}

export async function doSeilorDistributeUpdateRuleConfig(
  walletData: WalletData,
  networkToken: TokenContractsDeployed,
  {
    ruleType,
    ruleOwner
  }: {
    ruleType: string;
    ruleOwner: string;
  },
  print: boolean = true
): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.distribute UpdateRuleConfig enter. ruleType: ${ruleType} / ruleOwner: ${ruleOwner}`);
  const { distribute } = networkToken;
  if (!distribute?.address || !ruleType || !ruleOwner) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const distributeClient = new tokenContracts.Distribute.DistributeClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, distribute.address);
  const distributeQueryClient = new tokenContracts.Distribute.DistributeQueryClient(walletData?.activeWallet?.signingCosmWasmClient, distribute.address);

  let beforeRes: QueryRuleInfoResponse = null;
  let initFlag = true;
  try {
    beforeRes = await distributeQueryClient.queryRuleInfo({ ruleType });
  } catch (error: any) {
    if (error?.toString().includes("minter not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.distribute: need UpdateRuleConfig.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes?.rule_config.rule_owner === ruleOwner) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.distribute rule_config is already done.`);
    return;
  }
  const doRes = await distributeClient.updateRuleConfig({ updateRuleMsg: { rule_type: ruleType, rule_owner: ruleOwner } });
  console.log(`  Do ${TOKEN_MODULE_NAME}.veSeilor UpdateRuleConfig ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await distributeQueryClient.queryRuleInfo({ ruleType });
  print && console.log(`  after ${TOKEN_MODULE_NAME}.distribute: \n  ${JSON.stringify(afterRes)}`);
}

export async function printDeployedTokenContracts(networkToken: TokenContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed ${TOKEN_MODULE_NAME} contracts info --- ---`);
  const tableData = [
    { name: `seilor`, deploy: tokenConfigs?.seilor?.deploy, codeId: networkToken?.seilor?.codeId || 0, address: networkToken?.seilor?.address },
    { name: `treasure`, deploy: tokenConfigs?.treasure?.deploy, codeId: networkToken?.treasure?.codeId || 0, address: networkToken?.treasure?.address },
    { name: `distribute`, deploy: tokenConfigs?.distribute?.deploy, codeId: networkToken?.distribute?.codeId || 0, address: networkToken?.distribute?.address },
    { name: `dispatcher`, deploy: tokenConfigs?.dispatcher?.deploy, codeId: networkToken?.dispatcher?.codeId || 0, address: networkToken?.dispatcher?.address },
    { name: `veSeilor`, deploy: tokenConfigs?.veSeilor?.deploy, codeId: networkToken?.veSeilor?.codeId || 0, address: networkToken?.veSeilor?.address },
    { name: `fund`, deploy: tokenConfigs?.fund?.deploy, codeId: networkToken?.fund?.codeId || 0, address: networkToken?.fund?.address },
    { name: `boost`, deploy: tokenConfigs?.boost?.deploy, codeId: networkToken?.boost?.codeId || 0, address: networkToken?.boost?.address },
    { name: `keeper`, deploy: tokenConfigs?.keeper?.deploy, codeId: networkToken?.keeper?.codeId || 0, address: networkToken?.keeper?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
  await printDeployedTokenStakingContracts(networkToken);
}

export async function printDeployedTokenStakingContracts(networkToken: TokenContractsDeployed): Promise<void> {
  if (!networkToken?.stakingPairs || networkToken?.stakingPairs?.length <= 0) {
    return;
  }
  const tableData = [];
  for (const stakingPair of networkToken?.stakingPairs) {
    const stakingRewardsPairsConfig: TokenStakingPairsConfig = tokenConfigs?.stakingPairs?.find((v: TokenStakingPairsConfig) => stakingPair?.staking_token === v.staking_token);
    tableData.push({
      name: stakingPair?.name,
      stakingToken: stakingPair?.staking_token,
      deploy: stakingRewardsPairsConfig?.staking?.deploy ?? false,
      codeId: stakingPair?.staking?.codeId || 0,
      address: stakingPair?.staking?.address
    });
  }

  console.table(tableData, [`name`, `stakingToken`, `codeId`, `address`, `deploy`]);
}
