import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import type { WalletData } from "@/types";
import { NFT_CAMPAIGN_MODULE_NAME } from "@/modules/nft-campaign/nft-campaign_constants.ts";
import { readDeployedContracts } from "@/modules";
import {
  deployDragonPart,
  deployDragons, deployMedal,
  deployRandom,
  deployRewardsPool, printDeployedNftCampaignContracts
} from "@/modules/nft-campaign/nft-campaign_helpers.ts";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${NFT_CAMPAIGN_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${NFT_CAMPAIGN_MODULE_NAME}  --- ---`);

  // await deployRandom(walletData, network);
  //
  // await deployDragonPart(walletData, network);
  //
  // await deployDragons(walletData, network);
  //
  // await deployRewardsPool(walletData, network);

  await deployMedal(walletData, network);


  console.log(`\n  --- --- store code & instantiate contracts end: ${NFT_CAMPAIGN_MODULE_NAME}  --- ---`);

  // const { nftCampaignNetwork } = network;
  // await printDeployedNftCampaignContracts(nftCampaignNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${NFT_CAMPAIGN_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
