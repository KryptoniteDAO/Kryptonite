import type { CdpContractsDeployed, ConvertContractsDeployed, MarketContractsDeployed, OracleContractsDeployed, StakingContractsDeployed, SwapExtensionContractsDeployed, TokenContractsDeployed } from "@/modules";
import { ContractsDeployedModules } from "./enum";

export interface ContractsDeployed {
  [ContractsDeployedModules.swapExtension]: SwapExtensionContractsDeployed;
  [ContractsDeployedModules.oracle]: OracleContractsDeployed;
  [ContractsDeployedModules.cdp]: CdpContractsDeployed;
  [ContractsDeployedModules.staking]: StakingContractsDeployed;
  [ContractsDeployedModules.market]: MarketContractsDeployed;
  [ContractsDeployedModules.convert]: ConvertContractsDeployed;
  [ContractsDeployedModules.token]: TokenContractsDeployed;
}
