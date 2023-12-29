import { deployContract, readArtifact, writeArtifact } from "@/common";
import { tokenContracts } from "@/contracts";
import { QueryRuleInfoResponse } from "@/contracts/token/Distribute.types";
import { FundConfigResponse } from "@/contracts/token/Fund.types";
import { ConfigResponse as KeeperConfigResponse } from "@/contracts/token/Keeper.types";
import { SeilorConfigResponse as PlatTokenConfigResponse } from "@/contracts/token/Seilor.types";
import { VoteConfigResponse } from "@/contracts/token/VeSeilor.types";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type {
  ContractsDeployed,
  TokenBoostContractConfig,
  TokenContractsConfig,
  TokenContractsDeployed,
  TokenDispatcherContractConfig,
  TokenDistributeContractConfig,
  TokenDistributeRuleConfig,
  TokenFundContractConfig,
  TokenKeeperContractConfig,
  TokenPlatTokenContractConfig,
  TokenStakingPairsConfig,
  TokenStakingPairsContractsDeployed,
  TokenTreasureContractConfig,
  TokenVeTokenContractConfig
} from "@/modules";
import { ContractsDeployedModules, writeDeployedContracts } from "@/modules";
import type { ContractDeployed, InitialBalance, WalletData } from "@/types";
import { TOKEN_ARTIFACTS_PATH, TOKEN_MODULE_NAME } from "./token_constants";

export const tokenConfigs: TokenContractsConfig = readArtifact(`${TOKEN_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${TOKEN_MODULE_NAME}/`);

export function getTokenDeployFileName(chainId: string): string {
  return `deployed_${TOKEN_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function tokenReadArtifact(chainId: string): TokenContractsDeployed {
  return readArtifact(getTokenDeployFileName(chainId), TOKEN_ARTIFACTS_PATH) as TokenContractsDeployed;
}

export function tokenWriteArtifact(stakingNetwork: TokenContractsDeployed, chainId: string): void {
  writeArtifact(stakingNetwork, getTokenDeployFileName(chainId), TOKEN_ARTIFACTS_PATH);
}

export async function deployTokenPlatToken(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<TokenContractsDeployed> = "platToken";
  const config: TokenPlatTokenContractConfig | undefined = tokenConfigs?.[contractName];
  const initialBalances: InitialBalance[] | undefined = config?.initMsg?.cw20_init_msg?.initial_balances;
  initialBalances?.map(value => {
    if (!value.address) {
      value.address = walletData?.activeWallet?.address;
    }
  });
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    gov: config?.initMsg?.gov || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenFund(walletData: WalletData, network: ContractsDeployed, stable_coin_denom: string | undefined): Promise<void> {
  const { tokenNetwork } = network;
  const { platToken, veToken } = tokenNetwork;
  if (!platToken?.address || !veToken?.address) {
    console.error(`\n  ********* deploy error: missing info. deployTokenFund / ${platToken?.address} / ${veToken?.address}`);
    return;
  }

  const contractName: keyof Required<TokenContractsDeployed> = "fund";
  const config: TokenFundContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    gov: config?.initMsg?.gov || walletData?.activeWallet?.address,
    seilor_addr: config?.initMsg?.seilor_addr || platToken.address,
    ve_seilor_addr: config?.initMsg?.ve_seilor_addr || veToken.address,
    kusd_denom: config?.initMsg?.kusd_denom || stable_coin_denom || walletData?.activeWallet?.address,
    kusd_reward_addr: config?.initMsg?.kusd_reward_addr || tokenConfigs.usd_reward_controller || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenStaking(walletData: WalletData, network: ContractsDeployed, stakingRewardsPairsConfig: TokenStakingPairsConfig): Promise<void> {
  const { tokenNetwork } = network;
  const { veToken, fund, boost, platToken } = tokenNetwork;
  if (!stakingRewardsPairsConfig?.staking_token || !veToken?.address || !fund?.address || !boost?.address) {
    console.error(`\n  ********* deploy error: missing info. deployTokenStaking / ${stakingRewardsPairsConfig?.staking_token} / ${veToken?.address} / ${fund?.address} / ${boost?.address}`);
    return;
  }

  let stakingPairsNetwork: TokenStakingPairsContractsDeployed | undefined = tokenNetwork?.stakingPairs?.find((v: TokenStakingPairsContractsDeployed) => stakingRewardsPairsConfig?.staking_token === v.staking_token);
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
    if (!tokenNetwork?.stakingPairs) {
      tokenNetwork.stakingPairs = [];
    }
    tokenNetwork.stakingPairs.push(stakingPairsNetwork);
  }

  const contractName: keyof Required<TokenStakingPairsContractsDeployed> = "staking";
  const defaultInitMsg: object = Object.assign({}, stakingRewardsPairsConfig?.staking?.initMsg ?? {}, {
    gov: stakingRewardsPairsConfig?.staking?.initMsg?.gov || walletData?.activeWallet?.address,
    rewards_token: stakingRewardsPairsConfig?.staking?.initMsg?.rewards_token || veToken.address,
    boost: stakingRewardsPairsConfig?.staking?.initMsg?.boost || boost.address,
    fund: stakingRewardsPairsConfig?.staking?.initMsg?.fund || fund.address,
    staking_token: stakingRewardsPairsConfig?.staking_token || platToken.address,
    reward_controller_addr: stakingRewardsPairsConfig?.staking?.initMsg?.reward_controller_addr || tokenConfigs?.usd_reward_controller || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  let stakingPairsNetworkIndex: number = tokenNetwork?.stakingPairs?.findIndex((v: TokenStakingPairsContractsDeployed) => stakingRewardsPairsConfig?.staking_token === v.staking_token);
  const contractPath: string = `${ContractsDeployedModules.token}[${stakingPairsNetworkIndex}].${contractName}`;

  await deployContract(walletData, contractPath, network, stakingPairsNetwork.staking, stakingRewardsPairsConfig.staking, {
    defaultInitMsg,
    writeFunc
  });
}

export async function deployTokenVeToken(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<TokenContractsDeployed> = "veToken";
  const config: TokenVeTokenContractConfig | undefined = tokenConfigs?.[contractName];
  const initialBalances: InitialBalance[] | undefined = config?.initMsg?.cw20_init_msg?.initial_balances;
  initialBalances?.map(value => {
    if (!value.address) {
      value.address = walletData?.activeWallet?.address;
    }
  });
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    gov: config?.initMsg?.gov || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenBoost(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<TokenContractsDeployed> = "boost";
  const config: TokenBoostContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    gov: config?.initMsg?.gov || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenTreasure(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { tokenNetwork } = network;
  const { platToken } = tokenNetwork;
  if (!platToken?.address) {
    console.error(`\n  ********* deploy error: missing info. deployTokenTreasure / ${platToken?.address}`);
    return;
  }

  const contractName: keyof Required<TokenContractsDeployed> = "treasure";
  const config: TokenTreasureContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    gov: config?.initMsg?.gov || walletData?.activeWallet?.address,
    lock_token: config?.initMsg?.lock_token || platToken.address,
    punish_receiver: config?.initMsg?.punish_receiver || tokenConfigs?.usd_reward_controller || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenDistribute(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { tokenNetwork } = network;
  const { platToken, veToken } = tokenNetwork;
  if (!platToken?.address || !veToken?.address) {
    console.error(`\n  ********* deploy error: missing info. deployTokenDistribute / ${platToken?.address} / ${veToken?.address}`);
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
    gov: config?.initMsg?.gov || walletData?.activeWallet?.address,
    distribute_token: config?.initMsg?.distribute_token || platToken?.address,
    distribute_ve_token: config?.initMsg?.distribute_ve_token || veToken?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenDispatcher(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { tokenNetwork } = network;
  const { platToken } = tokenNetwork;
  if (!platToken?.address) {
    console.error(`\n  ********* deploy error: missing info. deployTokenDispatcher / ${platToken?.address}`);
    return;
  }
  const contractName: keyof Required<TokenContractsDeployed> = "dispatcher";
  const config: TokenDispatcherContractConfig | undefined = tokenConfigs?.[contractName];

  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    gov: config?.initMsg?.gov || walletData?.activeWallet?.address,
    claim_token: config?.initMsg?.claim_token || platToken?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployTokenKeeper(walletData: WalletData, network: ContractsDeployed, stable_coin_denom: string): Promise<void> {
  const { tokenNetwork } = network;
  const { fund } = tokenNetwork;
  if (!fund?.address) {
    console.error(`\n  ********* deploy error: missing info. deployTokenKeeper / ${fund?.address}`);
    return;
  }

  const contractName: keyof Required<TokenContractsDeployed> = "keeper";
  const config: TokenKeeperContractConfig | undefined = tokenConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    owner: config?.initMsg?.owner || walletData?.activeWallet?.address,
    rewards_contract: config?.initMsg?.rewards_contract || fund?.address || walletData?.activeWallet?.address,
    rewards_denom: config?.initMsg?.rewards_denom || stable_coin_denom || walletData?.activeWallet?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.token}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doTokenPlatTokenUpdateConfig0(walletData: WalletData, tokenNetwork: TokenContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.platToken update_config_0 enter.`);
  const { platToken, distribute } = tokenNetwork;
  if (!platToken?.address || !distribute?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const platTokenClient = new tokenContracts.Seilor.SeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, platToken.address);
  const platTokenQueryClient = new tokenContracts.Seilor.SeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, platToken.address);

  let beforeConfigRes: PlatTokenConfigResponse = null;
  let initFlag: boolean = true;
  try {
    beforeConfigRes = await platTokenQueryClient.seilorConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.platToken: need update_config. `);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && distribute?.address === beforeConfigRes?.distribute) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.platToken config is already done. `);
    return;
  }
  const doRes = await platTokenClient.updateConfig({ distribute: distribute?.address });
  console.log(`  Do ${TOKEN_MODULE_NAME}.platToken update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await platTokenQueryClient.seilorConfig();
  print && console.log(`  after config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function doTokenPlatTokenUpdateConfig(walletData: WalletData, tokenNetwork: TokenContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.platToken update_config enter.`);
  const { platToken, fund, distribute } = tokenNetwork;
  if (!platToken?.address || !fund?.address || !distribute?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const platTokenClient = new tokenContracts.Seilor.SeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, platToken.address);
  const platTokenQueryClient = new tokenContracts.Seilor.SeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, platToken.address);

  let beforeConfigRes: PlatTokenConfigResponse = null;
  let initFlag: boolean = true;
  try {
    beforeConfigRes = await platTokenQueryClient.seilorConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.platToken: need update_config. `);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && fund?.address === beforeConfigRes?.fund && distribute?.address === beforeConfigRes?.distribute) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.platToken config is already done. `);
    return;
  }
  const doRes = await platTokenClient.updateConfig({ fund: fund.address, distribute: distribute?.address });
  console.log(`  Do ${TOKEN_MODULE_NAME}.platToken update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await platTokenQueryClient.seilorConfig();
  print && console.log(`  after config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function doTokenVeTokenUpdateConfig(walletData: WalletData, tokenNetwork: TokenContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.veToken update_config enter.`);
  const { veToken, fund } = tokenNetwork;
  if (!veToken?.address || !fund?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const veTokenClient = new tokenContracts.VeSeilor.VeSeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, veToken.address);
  const veTokenQueryClient = new tokenContracts.VeSeilor.VeSeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, veToken.address);

  let beforeConfigRes: VoteConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await veTokenQueryClient.voteConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.veToken: need update_config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && fund?.address === beforeConfigRes?.fund) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.veToken config is already done.`);
    return;
  }
  const doRes = await veTokenClient.updateConfig({ fund: fund.address });
  console.log(`  Do ${TOKEN_MODULE_NAME}.veToken update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await veTokenQueryClient.voteConfig();
  print && console.log(`  after ${TOKEN_MODULE_NAME}.veToken config info: ${JSON.stringify(afterConfigRes)}`);
}

export async function doTokenFundUpdateConfig(walletData: WalletData, tokenNetwork: TokenContractsDeployed, stable_coin_denom: string, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.fund update_config enter.`);
  const { platToken, veToken, fund } = tokenNetwork;
  if (!fund?.address || !veToken?.address || !platToken?.address || !stable_coin_denom) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const fundClient = new tokenContracts.Fund.FundClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, fund.address);
  const fundQueryClient = new tokenContracts.Fund.FundQueryClient(walletData?.activeWallet?.signingCosmWasmClient, fund.address);

  let beforeConfigRes: FundConfigResponse = null;
  let initFlag: boolean = true;
  try {
    beforeConfigRes = await fundQueryClient.fundConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.veToken: need update_config.`);
    } else {
      throw new Error(error);
    }
  }
  // token_addr: Addr;
  // usd_denom: string;
  // usd_reward_addr: Addr;
  // ve_token_addr: Addr;
  if (initFlag && platToken?.address === beforeConfigRes?.seilor_addr && veToken?.address === beforeConfigRes?.ve_seilor_addr && stable_coin_denom === beforeConfigRes?.kusd_denom) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.fund config is already done.`);
    return;
  }
  const doRes = await fundClient.updateFundConfig({
    updateConfigMsg: {
      seilor_addr: platToken.address,
      ve_seilor_addr: veToken.address,
      kusd_denom: stable_coin_denom
    }
  });
  console.log(`  Do ${TOKEN_MODULE_NAME}.fund update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await fundQueryClient.fundConfig();
  print && console.log(`  after ${TOKEN_MODULE_NAME}.fund config info: ${JSON.stringify(afterConfigRes)}`);
}

export async function doTokenKeeperUpdateConfig(walletData: WalletData, tokenNetwork: TokenContractsDeployed, stable_coin_denom: string, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.keeper update_config enter.`);
  const { keeper, fund } = tokenNetwork;
  if (!keeper?.address || !stable_coin_denom) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const rewardsContract: string = fund?.address || walletData?.activeWallet?.address;
  const rewardsDenom: string = stable_coin_denom || walletData?.activeWallet?.address;
  const keeperClient = new tokenContracts.Keeper.KeeperClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, keeper.address);
  const keeperQueryClient = new tokenContracts.Keeper.KeeperQueryClient(walletData?.activeWallet?.signingCosmWasmClient, keeper.address);

  let beforeConfigRes: KeeperConfigResponse = null;
  let initFlag: boolean = true;
  try {
    beforeConfigRes = await keeperQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.keeper: need update_config.`);
    } else {
      throw new Error(error);
    }
  }
  // rewards_contract: string;
  // rewards_denom: string;
  if (initFlag && rewardsDenom === beforeConfigRes?.rewards_denom && rewardsContract === beforeConfigRes?.rewards_contract) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.keeper config is already done.`);
    return;
  }
  const doRes = await keeperClient.updateConfig({
    rewardsContract,
    rewardsDenom
  });
  console.log(`  Do ${TOKEN_MODULE_NAME}.keeper update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await keeperQueryClient.config();
  print && console.log(`  after ${TOKEN_MODULE_NAME}.keeper config info: ${JSON.stringify(afterConfigRes)}`);
}

// export async function doVeTokenSetMinters(walletData: WalletData, veToken: ContractDeployed, staking: ContractDeployed, isMinter: boolean, print: boolean = true): Promise<any> {
//   print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.veToken setMinters enter. staking: ${staking?.address} / ${isMinter}`);
//   if (!veToken?.address || !staking?.address) {
//     console.error(`\n  ********* missing info!`);
//     return;
//   }
//   const veTokenClient = new tokenContracts.VeSeilor.VeSeilorClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, veToken.address);
//   const veTokenQueryClient = new tokenContracts.VeSeilor.VeSeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, veToken.address);
//
//   let beforeRes: IsMinterResponse = null;
//   let initFlag = true;
//   try {
//     beforeRes = await veTokenQueryClient.isMinter({ address: staking.address });
//   } catch (error: any) {
//     if (error?.toString().includes("minter not found")) {
//       initFlag = false;
//       console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.veToken: need setMinters.`);
//     } else {
//       throw new Error(error);
//     }
//   }
//
//   if (initFlag && beforeRes?.is_minter === isMinter) {
//     console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.veToken minter is already done.`);
//     return;
//   }
//   const doRes = await veTokenClient.setMinters({ contracts: [staking.address], isMinter: [isMinter] });
//   console.log(`  Do ${TOKEN_MODULE_NAME}.veToken setMinters ok. \n  ${doRes?.transactionHash}`);
//
//   const afterRes = await veTokenQueryClient.isMinter({ address: staking.address });
//   print && console.log(`  after ${TOKEN_MODULE_NAME}.veToken isMinter: ${JSON.stringify(afterRes)}`);
// }

export async function doTokenFundSetVeFundMinter(walletData: WalletData, fund: ContractDeployed, staking: ContractDeployed, isVeMinter: boolean, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${TOKEN_MODULE_NAME}.fund SetVeFundMinter enter. staking: ${staking?.address} / ${isVeMinter}`);
  if (!fund?.address || !staking?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const fundClient = new tokenContracts.Fund.FundClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, fund.address);
  const fundQueryClient = new tokenContracts.Fund.FundQueryClient(walletData?.activeWallet?.signingCosmWasmClient, fund.address);

  let beforeRes: Boolean = null;
  let initFlag: boolean = true;
  try {
    beforeRes = await fundQueryClient.isVeFundMinter({ minter: staking.address });
  } catch (error: any) {
    if (error?.toString().includes("minter not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${TOKEN_MODULE_NAME}.fund: need SetVeFundMinter.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes === isVeMinter) {
    console.warn(`\n  ######### The ${TOKEN_MODULE_NAME}.fund minter is already done.`);
    return;
  }
  const doRes = await fundClient.setVeFundMinter({ minter: staking.address, isVeMinter });
  console.log(`  Do ${TOKEN_MODULE_NAME}.fund setMinters ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await fundQueryClient.isVeFundMinter({ minter: staking.address });
  print && console.log(`  after ${TOKEN_MODULE_NAME}.fund isVeFundMinter: ${JSON.stringify(afterRes)}`);
}

export async function doTokenPlatTokenDistributeUpdateRuleConfig(
  walletData: WalletData,
  tokenNetwork: TokenContractsDeployed,
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
  const { distribute } = tokenNetwork;
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
  const doRes = await distributeClient.updateRuleConfig({
    updateRuleMsg: {
      rule_type: ruleType,
      rule_owner: ruleOwner
    }
  });
  console.log(`  Do ${TOKEN_MODULE_NAME}.veToken UpdateRuleConfig ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await distributeQueryClient.queryRuleInfo({ ruleType });
  print && console.log(`  after ${TOKEN_MODULE_NAME}.distribute: \n  ${JSON.stringify(afterRes)}`);
}

export async function printDeployedTokenContracts(tokenNetwork: TokenContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed contracts info: ${TOKEN_MODULE_NAME} --- ---`);
  const tableData = [
    {
      name: `platToken`,
      deploy: tokenConfigs?.platToken?.deploy,
      codeId: tokenNetwork?.platToken?.codeId || 0,
      address: tokenNetwork?.platToken?.address
    },
    {
      name: `treasure`,
      deploy: tokenConfigs?.treasure?.deploy,
      codeId: tokenNetwork?.treasure?.codeId || 0,
      address: tokenNetwork?.treasure?.address
    },
    {
      name: `distribute`,
      deploy: tokenConfigs?.distribute?.deploy,
      codeId: tokenNetwork?.distribute?.codeId || 0,
      address: tokenNetwork?.distribute?.address
    },
    {
      name: `dispatcher`,
      deploy: tokenConfigs?.dispatcher?.deploy,
      codeId: tokenNetwork?.dispatcher?.codeId || 0,
      address: tokenNetwork?.dispatcher?.address
    },
    {
      name: `veToken`,
      deploy: tokenConfigs?.veToken?.deploy,
      codeId: tokenNetwork?.veToken?.codeId || 0,
      address: tokenNetwork?.veToken?.address
    },
    {
      name: `fund`,
      deploy: tokenConfigs?.fund?.deploy,
      codeId: tokenNetwork?.fund?.codeId || 0,
      address: tokenNetwork?.fund?.address
    },
    {
      name: `boost`,
      deploy: tokenConfigs?.boost?.deploy,
      codeId: tokenNetwork?.boost?.codeId || 0,
      address: tokenNetwork?.boost?.address
    },
    {
      name: `keeper`,
      deploy: tokenConfigs?.keeper?.deploy,
      codeId: tokenNetwork?.keeper?.codeId || 0,
      address: tokenNetwork?.keeper?.address
    }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
  await printDeployedTokenStakingContracts(tokenNetwork);
}

export async function printDeployedTokenStakingContracts(tokenNetwork: TokenContractsDeployed): Promise<void> {
  if (!tokenNetwork?.stakingPairs || tokenNetwork?.stakingPairs?.length <= 0) {
    return;
  }
  const tableData = [];
  for (const stakingPair of tokenNetwork?.stakingPairs) {
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
