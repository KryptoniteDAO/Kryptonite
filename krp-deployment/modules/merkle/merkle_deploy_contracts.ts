import { printChangeBalancesByWalletData } from "@/common";
import { ChainId, loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { printDeployedOracleContracts, readDeployedContracts } from "@/modules";
import type { WalletData } from "@/types";
import { MERKLE_MODULE_NAME } from "@/modules/merkle/merkle_constants";
import {
  deployMerkleVeDrop,
  doTokenFundSetVeFundMinter,
  printDeployedMerkleContracts
} from "@/modules/merkle/merkle_helpers";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${MERKLE_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${MERKLE_MODULE_NAME} --- ---`);

  await deployMerkleVeDrop(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${MERKLE_MODULE_NAME} --- ---`);

  const { merkleNetwork } = network;
  await printDeployedMerkleContracts(merkleNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${MERKLE_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
