import {
  NFT_CAMPAIGN_CONTRACTS_PATH,
  NFT_CAMPAIGN_MODULE_NAME
} from "@/modules/nft-campaign/nft-campaign_constants.ts";
import { WalletData } from "@/types";
import { loadingWalletData } from "@/env_data.ts";
import { readDeployedContracts } from "@/modules";
import { doDragonPartConfig, printDeployedNftCampaignContracts } from "@/modules/nft-campaign/nft-campaign_helpers.ts";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${NFT_CAMPAIGN_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { nftCampaignNetwork } = readDeployedContracts(walletData.chainId);
  await printDeployedNftCampaignContracts(nftCampaignNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = true;
  await doDragonPartConfig(walletData, nftCampaignNetwork, print);


})().catch(console.error);
