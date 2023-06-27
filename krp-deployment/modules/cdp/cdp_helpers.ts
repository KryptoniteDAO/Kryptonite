import { DEPLOY_VERSION, CDP_ARTIFACTS_PATH, CDP_MODULE_NAME, cdpConfig } from "../../env_data";

import { deployContract, readArtifact, writeArtifact } from "../../common";
import type { WalletData, ContractDeployed, CdpCentralControlContractConfig, CdpContractsConfig, CdpContractsDeployed, CdpStablePoolContractConfig, CdpCustodyContractConfig, CdpLiquidationQueueContractConfig } from "../../types";

export function getCdpDeployFileName(chainId: string): string {
  return `deployed_${CDP_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function cdpReadArtifact(chainId: string): CdpContractsDeployed {
  return readArtifact(getCdpDeployFileName(chainId), CDP_ARTIFACTS_PATH) as CdpContractsDeployed;
}

export function cdpWriteArtifact(networkStaking: CdpContractsDeployed, chainId: string): void {
  writeArtifact(networkStaking, getCdpDeployFileName(chainId), CDP_ARTIFACTS_PATH);
}

export async function deployCdpCentralControl(walletData: WalletData, networkCdp: CdpContractsDeployed): Promise<void> {
  const contractName: keyof Required<CdpContractsDeployed> = "cdpCentralControl";
  const config: CdpCentralControlContractConfig | undefined = cdpConfig?.[contractName];
  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_central_control.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      oracle_contract: walletData.address,
      pool_contract: walletData.address,
      custody_contract: walletData.address,
      liquidation_contract: walletData.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, writeFunc });
}

export async function deployCdpStablePool(walletData: WalletData, networkCdp: CdpContractsDeployed): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  if (!cdpCentralControl?.address) {
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpStablePool";
  const config: CdpStablePoolContractConfig | undefined = cdpConfig?.[contractName];
  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_stable_pool.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      control_contract: cdpCentralControl?.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const defaultFunds = config?.initCoins?.map(q => Object.assign({}, q, { denom: q?.denom || walletData.nativeCurrency.coinMinimalDenom }));
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, defaultFunds, writeFunc });
}

export async function deployCdpCustody(walletData: WalletData, networkCdp: CdpContractsDeployed): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  if (!cdpCentralControl?.address || !cdpStablePool?.address) {
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpCustody";
  const config: CdpCustodyContractConfig | undefined = cdpConfig?.[contractName];
  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_custody.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      control_contract: cdpCentralControl?.address,
      pool_contract: cdpStablePool?.address,
      collateral_contract: walletData.address,
      liquidation_contract: walletData.address
    },
    config?.initMsg ?? {},
    {
      owner_addr: config?.initMsg?.owner_addr || walletData.address
    }
  );
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, writeFunc });
}

export async function deployCdpLiquidationQueue(walletData: WalletData, networkCdp: CdpContractsDeployed, oraclePyth?: ContractDeployed): Promise<void> {
  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  if (!cdpCentralControl?.address) {
    return;
  }

  const contractName: keyof Required<CdpContractsDeployed> = "cdpLiquidationQueue";
  // const network:CdpDeployContracts = networkCdp as unknown asCdpDeployContracts;
  const config: CdpLiquidationQueueContractConfig | undefined = cdpConfig?.[contractName];
  const defaultFilePath: string | undefined = "../krp-cdp-contracts/artifacts/cdp_liquidation_queue.wasm";
  const defaultInitMsg: object | undefined = Object.assign(
    {
      control_contract: cdpCentralControl?.address,
      oracle_contract: oraclePyth?.address || walletData.address,
      stable_denom: walletData.stable_coin_denom
    },
    config?.initMsg ?? {},
    {
      owner: config?.initMsg?.owner || walletData.address
    }
  );
  const writeFunc = cdpWriteArtifact;

  await deployContract(walletData, contractName, networkCdp, config, { defaultFilePath, defaultInitMsg, writeFunc });
}

export async function printDeployedCdpContracts(networkCdp: CdpContractsDeployed): Promise<void> {
  console.log();
  console.log(`--- --- deployed cdp contracts info --- ---`);
  const contractNames = Object.keys(networkCdp);
  if (!contractNames || contractNames.length <= 0) {
    return;
  }
  const config: CdpContractsConfig = cdpConfig;
  const tableData = [];
  for (const contractName of contractNames) {
    tableData.push({
      name: contractName,
      deploy: config?.[contractName]?.deploy ?? false,
      codeId: networkCdp?.[contractName]?.codeId || 0,
      address: networkCdp?.[contractName]?.address
    });
  }
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
