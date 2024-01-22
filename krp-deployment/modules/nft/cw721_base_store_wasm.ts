import { WalletData } from "@/types";
import { loadingWalletData } from "@/env_data.ts";
import { ContractsDeployed, readDeployedContracts } from "@/modules";
import { printChangeBalancesByWalletData, storeCodeByWalletData } from "@/common.ts";

(async (): Promise<void> => {
  const walletData: WalletData = await loadingWalletData();

  console.log(`\n  --- --- store code : cw721 base --- ---`);
  let filePath = "./contracts/nft/cw721_base.wasm";
  let codeId = await storeCodeByWalletData(walletData, filePath, "", {});
  // atlantic-2 code 4755
  console.info(`\n  --- --- store code : cw721 base, codeId: ${codeId} --- ---`);


  await printChangeBalancesByWalletData(walletData);

})().catch(console.error);
