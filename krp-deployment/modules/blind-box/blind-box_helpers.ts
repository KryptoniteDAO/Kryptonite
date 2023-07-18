import type { ContractDeployed, WalletData } from "@/types";
import type { BlindBoxContractConfig, BlindBoxRewardContractConfig, BlindBoxContractsConfig, BlindBoxContractsDeployed, BlindBoxRewardTokenConfig, BlindBoxInviterRewardContractConfig, KptContractsDeployed } from "@/modules";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import { deployContract, readArtifact, writeArtifact } from "@/common";
import { kptConfigs } from "@/modules";
import { BlindBoxConfigResponse } from "@/contracts/blind-box/BlindBox.types";
import { blindBoxContracts } from "@/contracts";

export const BLIND_BOX_ARTIFACTS_PATH = "../blind-box-contracts/artifacts";
export const BLIND_BOX_CONTRACTS_PATH = "../blind-box-contracts/contracts";
export const BLIND_BOX_MODULE_NAME = "blind-box";
export const blindBoxConfigs: BlindBoxContractsConfig = readArtifact(`${BLIND_BOX_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${BLIND_BOX_MODULE_NAME}/`);

export function getBlindBoxDeployFileName(chainId: string): string {
  return `deployed_${BLIND_BOX_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function blindBoxReadArtifact(chainId: string): BlindBoxContractsDeployed {
  return readArtifact(getBlindBoxDeployFileName(chainId), BLIND_BOX_ARTIFACTS_PATH) as BlindBoxContractsDeployed;
}

export function blindBoxWriteArtifact(networkBlindBox: BlindBoxContractsDeployed, chainId: string): void {
  writeArtifact(networkBlindBox, getBlindBoxDeployFileName(chainId), BLIND_BOX_ARTIFACTS_PATH);
}

export async function deployBlindBox(walletData: WalletData, networkBlindBox: BlindBoxContractsDeployed, networkKpt: KptContractsDeployed, stable_coin_denom: string | undefined): Promise<void> {
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  if (!kpt?.address || !veKpt?.address) {
    return;
  }
  const contractName: keyof Required<BlindBoxContractsDeployed> = "blindBox";
  const config: BlindBoxContractConfig | undefined = blindBoxConfigs?.[contractName];
  // const rewardTokenConfig: Record<string, BlindBoxRewardTokenConfig> | undefined = config?.initMsg?.referral_reward_config?.reward_token_config;
  // for (const rewardTokenConfigKey in rewardTokenConfig) {
  //   let tokenConfig: BlindBoxRewardTokenConfig | undefined = rewardTokenConfig[rewardTokenConfigKey];
  //   if (tokenConfig?.reward_token) {
  //     tokenConfig.reward_token = tokenConfig.reward_token.replaceAll("%kpt_address%", kpt.address).replaceAll("%ve_kpt_address%", veKpt.address).replaceAll("%kusd_address%", stable_coin_denom);
  //   }
  // }

  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, { price_token: config?.initMsg?.price_token ?? stable_coin_denom });
  const writeFunc = blindBoxWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkBlindBox, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployBlindBoxReward(walletData: WalletData, networkBlindBox: BlindBoxContractsDeployed, networkKpt: KptContractsDeployed): Promise<void> {
  const blindBox: ContractDeployed | undefined = networkBlindBox?.blindBox;
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const kptDistribute: ContractDeployed | undefined = networkKpt?.kptDistribute;
  if (!kpt?.address || !veKpt?.address || !blindBox?.address || !kptDistribute?.address) {
    return;
  }

  const contractName: keyof Required<BlindBoxContractsDeployed> = "blindBoxReward";
  const config: BlindBoxRewardContractConfig | undefined = blindBoxConfigs?.[contractName];

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

  const writeFunc = blindBoxWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkBlindBox, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployBlindBoxInviterReward(walletData: WalletData, networkBlindBox: BlindBoxContractsDeployed, networkKpt: KptContractsDeployed, stable_coin_denom: string | undefined): Promise<void> {
  const blindBox: ContractDeployed | undefined = networkBlindBox?.blindBox;
  const kpt: ContractDeployed | undefined = networkKpt?.kpt;
  const veKpt: ContractDeployed | undefined = networkKpt?.veKpt;
  const kptDistribute: ContractDeployed | undefined = networkKpt?.kptDistribute;
  if (!kpt?.address || !veKpt?.address || !blindBox?.address || !kptDistribute?.address) {
    return;
  }

  const contractName: keyof Required<BlindBoxContractsDeployed> = "blindBoxInviterReward";
  const config: BlindBoxInviterRewardContractConfig | undefined = blindBoxConfigs?.[contractName];
  const defaultInitMsg = Object.assign(
    {
      nft_contract: blindBox.address
    },
    config?.initMsg ?? {},
    {
      reward_native_token: config?.initMsg?.reward_native_token ?? stable_coin_denom
    }
  );

  const writeFunc = blindBoxWriteArtifact;
  // const storeCoreGasLimit = 4_000_000;
  // const instantiateGasLimit = 500_000;

  await deployContract(walletData, contractName, networkBlindBox, undefined, config, { defaultInitMsg, writeFunc });
}

export async function doBlindBoxConfig(walletData: WalletData, networkBlindBox: BlindBoxContractsDeployed, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do blindBox.blindBox update_config enter.`);
  const blindBox: ContractDeployed | undefined = networkBlindBox?.blindBox;
  const blindBoxInviterReward: ContractDeployed | undefined = networkBlindBox?.blindBoxInviterReward;
  if (!blindBox?.address || !blindBoxInviterReward?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const blindBoxClient = new blindBoxContracts.BlindBox.BlindBoxClient(walletData.signingCosmWasmClient, walletData.address, blindBox.address);
  const blindBoxQueryClient = new blindBoxContracts.BlindBox.BlindBoxQueryClient(walletData.signingCosmWasmClient, blindBox.address);

  let beforeConfigRes: BlindBoxConfigResponse = null;
  let initFlag = true;
  try {
    beforeConfigRes = await blindBoxQueryClient.queryBlindBoxConfig();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### blindBox.blindBox: need update_config. `);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && blindBoxInviterReward?.address === beforeConfigRes?.inviter_reward_box_contract) {
    console.warn(`\n  ######### The blindBox.blindBox config is already done. `);
    return;
  }
  const doRes = await blindBoxClient.updateConfig({ inviterRewardBoxContract: blindBoxInviterReward.address });
  console.log(`  Do blindBox.blindBox update_config ok. \n  ${doRes?.transactionHash}`);

  const afterConfigRes = await blindBoxQueryClient.queryBlindBoxConfig();
  print && console.log(`  after config info: \n  ${JSON.stringify(afterConfigRes)}`);
}

export async function printDeployedBlindBoxContracts(networkBlindBox: BlindBoxContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed blind-box contracts info --- ---`);
  const tableData = [
    { name: `blindBox`, deploy: blindBoxConfigs?.blindBox?.deploy, codeId: networkBlindBox?.blindBox?.codeId || 0, address: networkBlindBox?.blindBox?.address },
    { name: `blindBoxReward`, deploy: blindBoxConfigs?.blindBoxReward?.deploy, codeId: networkBlindBox?.blindBoxReward?.codeId || 0, address: networkBlindBox?.blindBoxReward?.address },
    { name: `blindBoxInviterReward`, deploy: blindBoxConfigs?.blindBoxInviterReward?.deploy, codeId: networkBlindBox?.blindBoxInviterReward?.codeId || 0, address: networkBlindBox?.blindBoxInviterReward?.address }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
