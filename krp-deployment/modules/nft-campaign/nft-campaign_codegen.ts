import { doCodegenByModule } from "@/codegenHelpers";
import {
  NFT_CAMPAIGN_CONTRACTS_PATH,
  NFT_CAMPAIGN_MODULE_NAME
} from "@/modules/nft-campaign/nft-campaign_constants.ts";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${NFT_CAMPAIGN_MODULE_NAME}`);

  await doCodegenByModule(NFT_CAMPAIGN_MODULE_NAME, NFT_CAMPAIGN_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${NFT_CAMPAIGN_MODULE_NAME}`);
})().catch(console.error);
