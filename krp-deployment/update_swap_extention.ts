import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";
import { ChainId } from "./types";
import { OraclePythClient } from "./contracts/OraclePyth.client";
import { SwapExtentionClient } from "./contracts/SwapExtention.client";
import { Addr, AssetInfo, Decimal } from "./contracts/SwapExtention.types";

main().catch(console.error);

interface WhitelistConfig {
  caller: string;
  isWhitelist: boolean;
}

interface PairConfig {
  asset_infos: AssetInfo[];
  pair_address: string;
}

async function main(): Promise<void> {
  console.log(`--- --- update swap extends contracts enter --- ---`);

  const walletData = await loadingWalletData();

  console.log("Address:%s", walletData.address);

  const network = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH);

  const swapExtention = network?.swapExtention
  // const { oraclePyth } = await loadingMarketData(network);

  // console.log();
  // console.log(`--- --- deployed swap extends contracts info --- ---`);
  // const tableData = [{ name: `oraclePyth`, deploy: chainConfigs?.oraclePyth?.deploy, ...oraclePyth }];
  // console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////



  const oraclePythWhitelistConfigList: Record<string, WhitelistConfig[]> = {
    [ChainId.ATLANTIC_2]: [{ caller: "sei13xy3940qrar0k82k7fzhjpqaxj0h0tep7cpuxz", isWhitelist: true }]
  };

  for (let whitelistConfig of oraclePythWhitelistConfigList[walletData.chainId]) {
    await doSetWhitelist(walletData, swapExtention, whitelistConfig);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////


  console.log();
  console.log(`--- --- do contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

async function doSetWhitelist(walletData: WalletData, swapExtention: DeployContract, whitelistConfig:any): Promise<any> {
  if (!swapExtention?.address || !whitelistConfig?.caller) {
    console.error("Not deploy oraclePyth contract");
    return;
  }
  console.log();
  console.log("Do oraclePyth.address set_whitelist enter");

  const swapExtentionClient: SwapExtentionClient = new  SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);

  // const beforeIsSwapWhitelistRes = await swapExtentionClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  // // console.log(`Query oraclePyth.address query_is_swap_whitelist enter`);
  // if (beforeIsSwapWhitelistRes !== whitelistConfig?.isWhitelist) {
  //   console.log(`The address is already in the whitelist`);
  //   return;
  // }

  const doRes =swapExtentionClient.setWhitelist(whitelistConfig)
  console.log(`Do oraclePyth.address set_whitelist ok. \n${JSON.stringify(doRes)}`);

  const afterIsSwapWhitelistRes = await swapExtentionClient.queryIsSwapWhitelist({ caller: whitelistConfig?.caller });
  console.log(`is_swap_whitelist: ${afterIsSwapWhitelistRes}`);
}

async function doUpdatePairConfig(walletData: WalletData, swapExtention: DeployContract, assetInfos: AssetInfo[], caller: string, is_whitelist: boolean): Promise<any> {
  if (!swapExtention?.address || !caller) {
    console.error("Not deploy oraclePyth contract");
    return;
  }
  console.log();
  console.log("Do oraclePyth.address update_pair_config enter");
  const swapExtentionClient: SwapExtentionClient = new  SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const beforeConfigRes = await swapExtentionClient.queryPairConfig({ assetInfos });
  // is_disabled: boolean;
  // max_spread?: Decimal | null;
  // pair_address: Addr;
  // to?: Addr | null;
  if (beforeConfigRes) {
    console.log(`The assetInfos is already done`);
    return;
  }

  // {
  //   "update_pair_config":{
  //   "asset_infos":[
  //     {"native_token":{"denom":"usei"}},
  //     {"native_token":{"denom":"factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/usdt"}}
  //   ],
  //   "pair_address":"sei1pqcgdn5vmf3g9ncs98vtxkydc6su0f9rk3uk73s5ku2xhthr6avswrwnrx"
  // }
  // }

  // const doRes = await swapExtentionClient.updatePairConfig( );
  // console.log(`Do oraclePyth.address set_whitelist ok. \n${JSON.stringify(doRes)}`);

}
