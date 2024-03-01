import { deployContract, readArtifact, writeArtifact } from "@/common.ts";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data.ts";
import {
  ContractsDeployed,
  ContractsDeployedModules,
  writeDeployedContracts
} from "@/modules";
import { BaseContractConfig, WalletData } from "@/types";

import {
  NFT_CAMPAIGN_CONTRACTS_PATH,
  NFT_CAMPAIGN_MODULE_NAME, NftCampaignContracts
} from "@/modules/nft-campaign/nft-campaign_constants.ts";
import { NftCampaignContractsConfig, NftCampaignContractsDeployed } from "@/modules/nft-campaign/nft-campaign_types.ts";
import { nftCampaignContracts } from "@/contracts";
import { Config as DragonPartConfig } from "@/contracts/nft-campaign/DragonPart.types.ts";


export const nftCampaignConfigs: NftCampaignContractsConfig = readArtifact(`${NFT_CAMPAIGN_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${NFT_CAMPAIGN_MODULE_NAME}/`);


export function getNftCampaignDeployFileName(chainId: string): string {
  return `deployed_${NFT_CAMPAIGN_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function nftCampaignReadArtifact(chainId: string): NftCampaignContractsDeployed {
  return readArtifact(getNftCampaignDeployFileName(chainId), NFT_CAMPAIGN_CONTRACTS_PATH) as NftCampaignContractsDeployed;
}

export function nftCampaignWriteArtifact(nftCampaignNetwork: NftCampaignContractsDeployed, chainId: string): void {
  writeArtifact(nftCampaignNetwork, getNftCampaignDeployFileName(chainId), NFT_CAMPAIGN_CONTRACTS_PATH);
}

export async function deployDragonPart(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { nftCampaignNetwork, tokenNetwork } = network;
  if (!nftCampaignNetwork?.random?.address || !tokenNetwork?.platToken?.address) {
    throw new Error(`\n  --- --- deploy ${NFT_CAMPAIGN_MODULE_NAME} contracts error, Please set the random address or platToken in configuration file variable --- ---`);
  }
  const contractName: keyof Required<NftCampaignContractsConfig> = "dragonPart";
  const config: BaseContractConfig | undefined = nftCampaignConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    random_contract: nftCampaignNetwork?.random?.address,
    payment_token: tokenNetwork?.platToken?.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.nftCampaign}.${contractName}`;
  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}


export async function deployDragons(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { nftCampaignNetwork } = network;
  if (!nftCampaignNetwork?.dragonPart?.address) {
    throw new Error(`\n  --- --- deploy ${NFT_CAMPAIGN_MODULE_NAME} contracts error, Please set the dragonPart address in configuration file variable --- ---`);
  }
  const contractName: keyof Required<NftCampaignContractsConfig> = "dragons";
  const config: BaseContractConfig | undefined = nftCampaignConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {});
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.nftCampaign}.${contractName}`;
  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}


export async function deployRandom(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<NftCampaignContractsConfig> = "random";
  const config: BaseContractConfig | undefined = nftCampaignConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {});
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.nftCampaign}.${contractName}`;
  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}

export async function deployRewardsPool(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const contractName: keyof Required<NftCampaignContractsConfig> = "rewardsPool";
  const { stakingNetwork } = network;
  if (!stakingNetwork?.hub || !stakingNetwork?.stAssetsToken) {
    throw new Error(`\n  --- --- deploy ${NFT_CAMPAIGN_MODULE_NAME} contracts error, Please set the stakingNetwork info in configuration file variable --- ---`);
  }
  const config: BaseContractConfig | undefined = nftCampaignConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    convert_contract_hub: stakingNetwork?.hub.address,
    reward_token: stakingNetwork.stAssetsToken.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.nftCampaign}.${contractName}`;
  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}


export async function doDragonPartConfig(walletData: WalletData, nftCampaignNetWork: NftCampaignContractsDeployed, print = true): Promise<void> {
  print && console.log(`\n  --- --- config ${NFT_CAMPAIGN_MODULE_NAME} dragonPart updateConfig --- ---`);
  const { dragonPart, random, dragons } = nftCampaignNetWork;
  if (!dragonPart?.address || !random?.address || !dragons?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }

  const dragonPartClient = new nftCampaignContracts.DragonPart.DragonPartClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, dragonPart?.address);
  const dragonPartQueryClient = new nftCampaignContracts.DragonPart.DragonPartQueryClient(walletData?.activeWallet?.signingCosmWasmClient, dragonPart?.address);
  let beforeConfig: DragonPartConfig = null;
  let initFlag: boolean = true;
  try {
    beforeConfig = await dragonPartQueryClient.queryConfig();
  } catch (error) {
    console.log(`\n  config ${NFT_CAMPAIGN_MODULE_NAME} dragonPart updateConfig error: missing config`);
    throw new Error(error);
  }

  if (initFlag
    && beforeConfig.dragons_contract == dragons?.address
    && beforeConfig.random_contract == random?.address
  ) {
    console.warn(`\n  ######### The ${NFT_CAMPAIGN_MODULE_NAME}.dragonPart config is already done. `);
    return;
  }

  const doRes = await dragonPartClient.updateConfig({
    config: {
      dragons_contract: dragons?.address,
      random_contract: random?.address
    }
  });
  console.log(`\n  config ${NFT_CAMPAIGN_MODULE_NAME} dragonPart updateConfig: `, doRes.transactionHash);
  const afterConfig = await dragonPartQueryClient.queryConfig();
  console.log(`\n  config ${NFT_CAMPAIGN_MODULE_NAME} dragonPart updateConfig: `, JSON.stringify(afterConfig));

}

export async function printDeployedNftCampaignContracts(nftCampaignNetwork: NftCampaignContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed contracts info: ${NFT_CAMPAIGN_MODULE_NAME} --- ---`);
  const tableData = [
    {
      name: NftCampaignContracts.dragons,
      deploy: nftCampaignConfigs?.dragons.deploy,
      codeId: nftCampaignNetwork?.dragons?.codeId || 0,
      address: nftCampaignNetwork?.dragons?.address
    }

  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}


export async function deployMedal(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { nftCampaignNetwork } = network;
  if (!nftCampaignNetwork?.rewardsPool) {
    throw new Error(`\n  --- --- deploy ${NFT_CAMPAIGN_MODULE_NAME} contracts error, Please set the rewardsPool info in configuration file variable --- ---`);
  }
  const contractName: keyof Required<NftCampaignContractsConfig> = "medal";
  const config: BaseContractConfig | undefined = nftCampaignConfigs?.[contractName];
  const defaultInitMsg = Object.assign({}, config?.initMsg ?? {}, {
    "royalty_payment_address": nftCampaignNetwork?.rewardsPool.address
  });
  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.nftCampaign}.${contractName}`;
  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });
}


