import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData, queryContractConfig } from "../common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH, CONVERT_MODULE_NAME, DEPLOY_VERSION } from "../env_data";
import type { DeployContract, WalletData } from "../types";
import { ConvertDeployContracts, ConvertPairs, MarketDeployContracts } from "../types";

export function getConvertDeployFileName(chainId: string): string {
  return `deployed_${CONVERT_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function convertReadArtifact(chainId: string): ConvertDeployContracts {
  return readArtifact(getConvertDeployFileName(chainId), CONVERT_ARTIFACTS_PATH) as ConvertDeployContracts;
}

export function convertWriteArtifact(networkMarket: ConvertDeployContracts, chainId: string): void {
  writeArtifact(networkMarket, getConvertDeployFileName(chainId), CONVERT_ARTIFACTS_PATH);
}
