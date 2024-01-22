import type { CdpContractsDeployed, ConvertContractsDeployed, MarketContractsDeployed, OracleContractsDeployed, StakingContractsDeployed, SwapExtensionContractsDeployed, TokenContractsDeployed } from "@/modules";
import { ContractsDeployedModules } from "./enum";
import { MerkleContractsDeployed } from "@/modules/merkle/merkle_types.ts";
import { WrapCw20ContractsDeployed } from "@/modules/wrap-cw20/wrap-cw20_types.ts";
import { NftCampaignContractsDeployed } from "@/modules/nft-campaign/nft-campaign_types.ts";

export interface ContractsDeployed {
  [ContractsDeployedModules.swapExtension]: SwapExtensionContractsDeployed;
  [ContractsDeployedModules.oracle]: OracleContractsDeployed;
  [ContractsDeployedModules.cdp]: CdpContractsDeployed;
  [ContractsDeployedModules.staking]: StakingContractsDeployed;
  [ContractsDeployedModules.market]: MarketContractsDeployed;
  [ContractsDeployedModules.convert]: ConvertContractsDeployed;
  [ContractsDeployedModules.token]: TokenContractsDeployed;
  [ContractsDeployedModules.merkle]: MerkleContractsDeployed;
  [ContractsDeployedModules.wrapCw20]: WrapCw20ContractsDeployed;
  [ContractsDeployedModules.nftCampaign]: NftCampaignContractsDeployed;
}
