import { DEPLOY_VERSION, STAKING_ARTIFACTS_PATH, STAKING_MODULE_NAME } from "../env_data";
import { StakingDeployContracts } from "../types";
import { readArtifact, writeArtifact } from "../common";

export function getStakingDeployFileName(chainId: string): string {
  return `deployed_${STAKING_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function stakingReadArtifact(chainId: string): StakingDeployContracts {
  return readArtifact(getStakingDeployFileName(chainId), STAKING_ARTIFACTS_PATH) as StakingDeployContracts;
}

export function stakingWriteArtifact(networkStaking: StakingDeployContracts, chainId: string): void {
  writeArtifact(networkStaking, getStakingDeployFileName(chainId), STAKING_ARTIFACTS_PATH);
}
