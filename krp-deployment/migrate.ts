import type { WalletData } from "./types";
import { loadingWalletData } from "./env_data";
import { printChangeBalancesByWalletData, migrateContractByWalletData, storeCodeByWalletData } from "./common";

interface MigrateConfig {
  codeId: number | undefined;
  contractAddress: string;
  filePath: string;
  message: {
    [key: string]: any;
  };
  memo: string | undefined;
}

async function main() {
  console.log(`\n  --- --- migrate contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const configs: MigrateConfig[] = [
    // {
    //   codeId: 2189,
    //   contractAddress: "sei1chjhkfkkzhmdu3q3vrurmdm6qalyduvnn0tqkmduy3vqpw7chfcsw4ennj",
    //   filePath: "../krp-token-contracts/artifacts/kpt.wasm",
    //   message: {},
    //   memo: undefined
    // }
    {
      codeId: 0,
      contractAddress: "sei1vjv4wg7lllt32rng08r4r9lhmtu6gyrhvpn4ce556an4htl3klnq5c6gkj",
      filePath: "..\\..\\sei-bridge\\artifacts\\cross_distribution.wasm",
      message: {},
      memo: undefined
    }
    // {
    //   codeId: 0,
    //   contractAddress: "sei1krnfww9ekuuutq7c6xksdcmhwzvw6cqa7x3a667p4660zlsd04kqwz5vev",
    //   filePath: "../krp-staking-contracts/artifacts/basset_sei_token_bsei.wasm",
    //   message: {},
    //   memo: undefined
    // }
  ];

  for (const config of configs) {
    if (!config?.codeId || config.codeId <= 0) {
      config.codeId = await storeCodeByWalletData(walletData, config.filePath);
    }
    const migrateRes = await migrateContractByWalletData(walletData, config.contractAddress, config.codeId, config.message, config?.memo);
    console.log(`Do migrate ok. \naddress: ${config.contractAddress} / newCodeId: ${config.codeId} \ntransactionHash: ${migrateRes?.transactionHash}`);
  }

  console.log(`\n  --- --- migrate contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}

main().catch(console.log);
