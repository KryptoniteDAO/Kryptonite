import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy swap extends contracts enter --- ---`);

  const walletData = await loadingWalletData();

  console.log("Address:%s", walletData.address);

  const network = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH);

  console.log();
  console.log(`--- --- market extends contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deploySwapExtention(walletData, network);

  console.log();
  console.log(`--- --- swap extends contracts storeCode & instantiateContract end --- ---`);

  await printDeployedContracts(network);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- swap extends contracts configure enter --- ---`);

  console.log();
  console.log(`--- --- swap extends contracts configure end --- ---`);

  // ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy swap extends contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

async function deploySwapExtention(walletData: WalletData, network: any): Promise<void> {
  if (!network?.swapExtention?.address) {
    if (!network?.swapExtention) {
      network.swapExtention = {};
    }

    if (!network?.swapExtention?.codeId || network?.swapExtention?.codeId <= 0) {
      const filePath = chainConfigs?.swapExtention?.filePath || "../swap-extention/artifacts/swap_extention.wasm";
      network.swapExtention.codeId = await storeCodeByWalletData(walletData, filePath);
      writeArtifact(network, walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH);
    }
    if (network?.swapExtention?.codeId > 0) {
      const admin = chainConfigs?.swapExtention?.admin || walletData.address;
      const label = chainConfigs?.swapExtention?.label ?? "swapExtention";
      const initMsg = Object.assign({}, chainConfigs?.swapExtention?.initMsg, {
        owner: chainConfigs?.reward?.initMsg?.owner || walletData.address
      });
      network.swapExtention.address = await instantiateContractByWalletData(walletData, admin, network.swapExtention.codeId, initMsg, label);
      writeArtifact(network, walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH);
      chainConfigs.swapExtention.deploy = true;
    }
    console.log(`swapExtention: `, JSON.stringify(network?.swapExtention));
  }
}

async function printDeployedContracts(network: any): Promise<void> {
  console.log();
  console.log(`--- --- deployed swap extends contracts info --- ---`);
  const tableData = [{ name: `swapExtention`, deploy: chainConfigs?.swapExtention?.deploy, codeId: network?.swapExtention?.codeId || 0, address: network?.swapExtention?.address }];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}
