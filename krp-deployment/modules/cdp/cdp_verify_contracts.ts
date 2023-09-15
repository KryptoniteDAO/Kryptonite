import type { ContractDeployed, WalletData } from "@/types";
import type { CdpCollateralPairsDeployed, CdpContractsDeployed, TokenContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { tokenReadArtifact, cdpReadArtifact, printDeployedCdpContracts } from "@/modules";
import { cdpContracts } from "@/contracts";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- verify deployed cdp contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkToken = kptReadArtifact(walletData.chainId) as KptContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  await printDeployedCdpContracts(networkCdp);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  const cdpCentralControl: ContractDeployed = networkCdp?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = networkCdp?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = networkCdp?.cdpLiquidationQueue;
  const cdpCollateralPairs: CdpCollateralPairsDeployed[] = networkCdp?.cdpCollateralPairs;

  if (cdpCentralControl?.address) {
    const centralControlClient = new cdpContracts.CentralControl.CentralControlClient(walletData.signingCosmWasmClient, walletData.address, cdpCentralControl.address);
    const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData.signingCosmWasmClient, cdpCentralControl.address);
    const configRes = await centralControlQueryClient.config();
    console.log(`\n  Query cdp.cdpCentralControl config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpStablePool?.address) {
    const centralControlClient = new cdpContracts.StablePool.StablePoolClient(walletData.signingCosmWasmClient, walletData.address, cdpStablePool.address);
    const stablePoolQueryClient = new cdpContracts.StablePool.StablePoolQueryClient(walletData.signingCosmWasmClient, cdpStablePool.address);
    const configRes = await stablePoolQueryClient.config();
    console.log(`\n  Query cdp.cdpStablePool config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpLiquidationQueue?.address) {
    const liquidationQueueClient = new cdpContracts.LiquidationQueue.LiquidationQueueClient(walletData.signingCosmWasmClient, walletData.address, cdpLiquidationQueue.address);
    const liquidationQueueQueryClient = new cdpContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData.signingCosmWasmClient, cdpLiquidationQueue.address);
    const configRes = await liquidationQueueQueryClient.config();
    console.log(`\n  Query cdp.cdpLiquidationQueue config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpCollateralPairs && cdpCollateralPairs.length >= 0) {
    for (let cdpCollateralPair of cdpCollateralPairs) {
      if (cdpCollateralPair?.custody?.address) {
        const custodyClient = new cdpContracts.Custody.CustodyClient(walletData.signingCosmWasmClient, walletData.address, cdpCollateralPair?.custody?.address);
        const custodyQueryClient = new cdpContracts.Custody.CustodyQueryClient(walletData.signingCosmWasmClient, cdpCollateralPair?.custody?.address);
        const configRes = await custodyQueryClient.config();
        console.log(`\n  Query cdp.custody config ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(configRes)}`);
        const stateResponse = await custodyQueryClient.state();
        console.log(`\n  Query cdp.custody queryStakingState ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(stateResponse)}`);
      }

      if (cdpCollateralPair?.rewardBook?.address) {
        const rewardBookClient = new cdpContracts.RewardBook.RewardBookClient(walletData.signingCosmWasmClient, walletData.address, cdpCollateralPair?.rewardBook?.address);
        const rewardBookQueryClient = new cdpContracts.RewardBook.RewardBookQueryClient(walletData.signingCosmWasmClient, cdpCollateralPair?.rewardBook?.address);
        const configRes = await rewardBookQueryClient.config();
        console.log(`\n  Query cdp.RewardBook config ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(configRes)}`);
        const stateResponse = await rewardBookQueryClient.state();
        console.log(`\n  Query cdp.RewardBook queryStakingState ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(stateResponse)}`);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed cdp contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
