export const CDP_ARTIFACTS_PATH: string = "../krp-cdp-contracts/artifacts";
export const CDP_CONTRACTS_PATH: string = "../krp-cdp-contracts/contracts";
export const CDP_MODULE_NAME: string = "cdp";

export enum CdpContracts {
  cdpCentralControl = "cdpCentralControl",
  cdpStablePool = "cdpStablePool",
  cdpLiquidationQueue = "cdpLiquidationQueue",
  cdpCollateralPairs = "cdpCollateralPairs",
  rewardBook = "rewardBook",
  custody = "custody"
}
