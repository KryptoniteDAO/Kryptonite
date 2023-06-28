import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { kptReadArtifact } from "@/modules/kpt";
import { cdpContracts } from "@/contracts";
import { cdpReadArtifact, printDeployedCdpContracts } from "@/modules/cdp/cdp_helpers";
import type { CdpCollateralPairsDeployed, CdpContractsDeployed, ContractDeployed, KptDeployContracts, StakingRewardsPairsDeployContracts, WalletData } from "@/types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- verify deployed cdp contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkKpt = kptReadArtifact(walletData.chainId) as KptDeployContracts;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;

  await printDeployedCdpContracts(networkCdp);

  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  const cdpCollateralPairs: CdpCollateralPairsDeployed[] = networkCdp?.cdpCollateralPairs;
  const doFunc: boolean = true;

  if (cdpCentralControl?.address) {
    const centralControlClient = new cdpContracts.CentralControl.CentralControlClient(walletData.signingCosmWasmClient, walletData.address, cdpCentralControl.address);
    const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData.signingCosmWasmClient, cdpCentralControl.address);
    const configRes = await centralControlQueryClient.config();
    console.log(`\n  Query cdpCentralControl.address config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpStablePool?.address) {
    const centralControlClient = new cdpContracts.StablePool.StablePoolClient(walletData.signingCosmWasmClient, walletData.address, cdpStablePool.address);
    const stablePoolQueryClient = new cdpContracts.StablePool.StablePoolQueryClient(walletData.signingCosmWasmClient, cdpStablePool.address);
    const configRes = await stablePoolQueryClient.config();
    console.log(`\n  Query cdpStablePool.address config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpLiquidationQueue?.address) {
    const liquidationQueueClient = new cdpContracts.LiquidationQueue.LiquidationQueueClient(walletData.signingCosmWasmClient, walletData.address, cdpLiquidationQueue.address);
    const liquidationQueueQueryClient = new cdpContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData.signingCosmWasmClient, cdpLiquidationQueue.address);
    const configRes = await liquidationQueueQueryClient.config();
    console.log(`\n  Query cdpLiquidationQueue.address config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpCollateralPairs && cdpCollateralPairs.length >= 0) {
    for (let cdpCollateralPair of cdpCollateralPairs) {
      if (cdpCollateralPair?.custody?.address) {
        const custodyClient = new cdpContracts.Custody.CustodyClient(walletData.signingCosmWasmClient, walletData.address, cdpCollateralPair?.custody?.address);
        const custodyQueryClient = new cdpContracts.Custody.CustodyQueryClient(walletData.signingCosmWasmClient, cdpCollateralPair?.custody?.address);
        const configRes = await custodyQueryClient.config();
        console.log(`\n  Query custody.address config ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(configRes)}`);
        const stateResponse = await custodyQueryClient.state();
        console.log(`\n  Query stakingRewards.address queryStakingState ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(stateResponse)}`);

      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed cdp contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}