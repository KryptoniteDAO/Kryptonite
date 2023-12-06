import { printChangeBalancesByWalletData } from "@/common";
import { cdpContracts } from "@/contracts";
import { loadingWalletData } from "@/env_data";
import type { CdpCollateralPairsDeployed } from "@/modules";
import { printDeployedCdpContracts, readDeployedContracts } from "@/modules";
import { CDP_MODULE_NAME } from "@/modules/cdp/cdp_constants";
import type { ContractDeployed, WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- verify deployed contracts enter: ${CDP_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const { cdpNetwork } = readDeployedContracts(walletData.chainId);

  await printDeployedCdpContracts(cdpNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  const cdpCentralControl: ContractDeployed = cdpNetwork?.cdpCentralControl;
  const cdpStablePool: ContractDeployed = cdpNetwork?.cdpStablePool;
  const cdpLiquidationQueue: ContractDeployed = cdpNetwork?.cdpLiquidationQueue;
  const cdpCollateralPairs: CdpCollateralPairsDeployed[] = cdpNetwork?.cdpCollateralPairs;

  if (cdpCentralControl?.address) {
    const centralControlClient = new cdpContracts.CentralControl.CentralControlClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpCentralControl.address);
    const centralControlQueryClient = new cdpContracts.CentralControl.CentralControlQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpCentralControl.address);
    const configRes = await centralControlQueryClient.config();
    console.log(`\n  Query ${CDP_MODULE_NAME}.cdpCentralControl config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpStablePool?.address) {
    const centralControlClient = new cdpContracts.StablePool.StablePoolClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpStablePool.address);
    const stablePoolQueryClient = new cdpContracts.StablePool.StablePoolQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpStablePool.address);
    const configRes = await stablePoolQueryClient.config();
    console.log(`\n  Query ${CDP_MODULE_NAME}.cdpStablePool config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpLiquidationQueue?.address) {
    const liquidationQueueClient = new cdpContracts.LiquidationQueue.LiquidationQueueClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpLiquidationQueue.address);
    const liquidationQueueQueryClient = new cdpContracts.LiquidationQueue.LiquidationQueueQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpLiquidationQueue.address);
    const configRes = await liquidationQueueQueryClient.config();
    console.log(`\n  Query ${CDP_MODULE_NAME}.cdpLiquidationQueue config ok. \n  ${JSON.stringify(configRes)}`);
  }

  if (cdpCollateralPairs && cdpCollateralPairs.length >= 0) {
    for (let cdpCollateralPair of cdpCollateralPairs) {
      if (cdpCollateralPair?.custody?.address) {
        const custodyClient = new cdpContracts.Custody.CustodyClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpCollateralPair?.custody?.address);
        const custodyQueryClient = new cdpContracts.Custody.CustodyQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpCollateralPair?.custody?.address);
        const configRes = await custodyQueryClient.config();
        console.log(`\n  Query ${CDP_MODULE_NAME}.custody config ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(configRes)}`);
        const stateResponse = await custodyQueryClient.state();
        console.log(`\n  Query ${CDP_MODULE_NAME}.custody queryStakingState ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(stateResponse)}`);
      }

      if (cdpCollateralPair?.rewardBook?.address) {
        const rewardBookClient = new cdpContracts.RewardBook.RewardBookClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, cdpCollateralPair?.rewardBook?.address);
        const rewardBookQueryClient = new cdpContracts.RewardBook.RewardBookQueryClient(walletData?.activeWallet?.signingCosmWasmClient, cdpCollateralPair?.rewardBook?.address);
        const configRes = await rewardBookQueryClient.config();
        console.log(`\n  Query ${CDP_MODULE_NAME}.RewardBook config ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(configRes)}`);
        const stateResponse = await rewardBookQueryClient.state();
        console.log(`\n  Query ${CDP_MODULE_NAME}.RewardBook queryStakingState ok. collateral: ${cdpCollateralPair?.name} / ${cdpCollateralPair?.collateral} \n  ${JSON.stringify(stateResponse)}`);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed contracts end: ${CDP_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
