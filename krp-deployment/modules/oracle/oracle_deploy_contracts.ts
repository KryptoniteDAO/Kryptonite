import { printChangeBalancesByWalletData } from "@/common";
import {ChainId, loadingWalletData} from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { deployMockOracle, deployOraclePyth, printDeployedOracleContracts, readDeployedContracts } from "@/modules";
import { ORACLE_MODULE_NAME } from "@/modules/oracle/oracle_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${ORACLE_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${ORACLE_MODULE_NAME} --- ---`);

  if (ChainId.PACIFIC_1 !== walletData.chainId && ChainId.ATLANTIC_2 !== walletData.chainId) {
    await deployMockOracle(walletData, network);
  }
  await deployOraclePyth(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${ORACLE_MODULE_NAME} --- ---`);

  const { oracleNetwork } = network;
  await printDeployedOracleContracts(oracleNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${ORACLE_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
