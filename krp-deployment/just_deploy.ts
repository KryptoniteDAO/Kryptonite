import type {WalletData} from "@/types";
import { Coin } from "@cosmjs/amino";
import { deployContract, printChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";

interface DeployConfig {
  codeId: number | undefined;
  contractName: string;
  filePath: string;
  message: {
    [key: string]: any;
  };
  funds?: Coin[] | undefined;
  label?: string | undefined;
  memo?: string | undefined;
}

(async (): Promise<void> => {
  console.log(`\n  --- --- just do deploy enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just do what you want
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const configs: DeployConfig[] = [
    // {
    //   codeId: 0,
    //   contractName: "",
    //   filePath: "../**.wasm",
    //   message: {},
    //   memo: undefined
    // }
    {
      codeId: 0,
      contractName: "Cw20 Test Token",
      filePath: "../cw-plus/artifacts/cw20_base.wasm",
      message: {
        name: "CTT",
        symbol: "CTT",
        decimals: 18,
        initial_balances: [],
        marketing: {
          description: "CTT",
          logo: {
            url: "https://www.kryptonite.finance/"
          },
          marketing: null,
          project: "CTT"
        }
      },
      label: "cw20 test",
      memo: undefined
    }
  ];

  for (const config of configs) {
    const codeId: number = config.codeId ?? 0;
    const contractName: string = config.contractName;
    const defaultInitMsg = config.message;
    const writeAble = false;
    const defaultFilePath = config.filePath;
    const defaultFunds = config.funds;
    const defaultLabel = config.label;
    const memo = config.memo;

    await deployContract(walletData, contractName, {}, { codeId }, {}, { defaultFilePath, defaultInitMsg, writeAble, defaultLabel, defaultFunds, memo });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- just do deploy end --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
