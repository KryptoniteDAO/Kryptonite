import { readDeployedContracts, stakingConfigs } from "@/modules";
import { migrateContractByWalletData, printChangeBalancesByWalletData, storeCodeByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { WalletData } from "./types";

interface MigrateConfig {
  codeId: number | undefined;
  contractAddress: string;
  filePath: string;
  message: {
    [key: string]: any;
  };
  memo: string | undefined;
}

(async (): Promise<void> => {
  console.log(`\n  --- --- just do migrate enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const {
    swapExtensionNetwork: { swapSparrow } = {},
    oracleNetwork: { oraclePyth } = {},
    cdpNetwork: { stable_coin_denom, cdpCentralControl, cdpLiquidationQueue, cdpStablePool, cdpCollateralPairs } = {},
    stakingNetwork: { hub, reward, rewardsDispatcher, validatorsRegistry, bAssetsToken, stAssetsToken } = {},
    marketNetwork: { aToken, market, liquidationQueue, overseer, custodyBAssets, interestModel, distributionModel } = {},
    convertNetwork: { convertPairs } = {},
    tokenNetwork: { platToken, veToken, keeper, boost, dispatcher, fund, distribute, treasure, stakingPairs } = {}
  } = readDeployedContracts(walletData?.chainId);

  const configs: MigrateConfig[] = [
    // {
    //   codeId: 0,
    //   contractAddress: "",
    //   filePath: "../**.wasm",
    //   message: {},
    //   memo: undefined
    // }
    {
      codeId: 0,
      contractAddress: validatorsRegistry?.address,
      filePath: stakingConfigs?.validatorsRegistry?.filePath,
      message: {},
      memo: undefined
    }
  ];

  for (const config of configs) {
    if (!config?.codeId || config.codeId <= 0) {
      config.codeId = await storeCodeByWalletData(walletData, config.filePath);
    }
    const migrateRes = await migrateContractByWalletData(walletData, config.contractAddress, config.codeId, config.message, config?.memo);
    console.log(`Do migrate ok. \naddress: ${config.contractAddress} / newCodeId: ${config.codeId} \ntxHash: ${migrateRes?.transactionHash}`);
  }

  console.log(`\n  --- --- just do migrate end --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
