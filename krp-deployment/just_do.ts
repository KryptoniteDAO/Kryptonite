import {readDeployedContracts} from "@/modules";
import {
  getClientDataByWalletData,
  instantiateContractByWalletData,
  printChangeBalancesByWalletData,
  storeCodeByWalletData
} from "./common";
import {loadingWalletData} from "./env_data";
import type {WalletData} from "./types";
import {ClientData} from "./types";
import {cw20BaseContracts, tokenContracts} from "@/contracts";
import {Base64} from "js-base64";
import Cw20Base = cw20BaseContracts.Cw20Base;
import {Cw20Coin, InstantiateMarketingInfo, MinterResponse} from "@/contracts/cw20Base/Cw20Base.types.ts";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- just do enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const {
    swapExtensionNetwork: {swapSparrow} = {},
    oracleNetwork: {oraclePyth} = {},
    cdpNetwork: {stable_coin_denom, cdpCentralControl, cdpLiquidationQueue, cdpStablePool, cdpCollateralPairs} = {},
    stakingNetwork: {hub, reward, rewardsDispatcher, validatorsRegistry, bAssetsToken, stAssetsToken} = {},
    marketNetwork: {aToken, market, liquidationQueue, overseer, custodyBAssets, interestModel, distributionModel} = {},
    convertNetwork: {convertPairs} = {},
    tokenNetwork: {platToken, veToken, keeper, boost, dispatcher, fund, distribute, treasure, stakingPairs} = {}
  } = readDeployedContracts(walletData?.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////



  // const clientData: ClientData = getClientDataByWalletData(walletData);
  // await clientData.signingCosmWasmClient.migrate(walletData?.activeWallet?.address, distribute.address, 6608, {}, "auto");
  const blockHeight = await walletData.stargateClient.getHeight();
  console.log(`\n  --- --- blockHeight: ${blockHeight} --- ---`);


  await testStaking(walletData);
  // await testDeployCW20(walletData);

  await printChangeBalancesByWalletData(walletData);
}

async function testStaking(walletData: WalletData) {
  const evmSeiSeilorLp = "sei1u9ftyhe5sszx9ghr7ae75ak05j86mme0xlzr0n4g0aa45hry5s0qlvr5nw";
  const evmSeiSeilorStaking = "sei1ch65nr2j99mdkj6xy7q5py6u56gn3v58pmtl4cg6cclzmmp7kxhskfa5kq";


  // const evmSeiSeilorLp = "sei1r47t0rpwnm8uukmwr9c2rfxzxz73ntvenkp570s5y0p8gyamtxrqp2jj0c";
  // const evmSeiSeilorStaking = "sei1y0g0fxm85vpcct26v2hdv75jrh869n7lr0knzw05fegq269ql7cqh7l43s";
  const evmSeiSeilorQueryClient = new tokenContracts.Seilor.SeilorQueryClient(walletData.activeWallet.signingCosmWasmClient, evmSeiSeilorLp);
  const evmSeiSeilorClient = new tokenContracts.Seilor.SeilorClient(walletData.activeWallet.signingCosmWasmClient, walletData.activeWallet.address, evmSeiSeilorLp);
  const balance = await evmSeiSeilorQueryClient.balance({
    address: walletData?.activeWallet?.address
  })
  console.log(`\n  --- --- balance: ${balance.balance} --- ---`);



  // const evmSeiSeilorStakingClient = new tokenContracts.Staking.StakingClient(walletData.activeWallet.signingCosmWasmClient, walletData.activeWallet.address, evmSeiSeilorStaking);
  const msg = Base64.toBase64(JSON.stringify({"stake": {}}));
  console.log(`\n  --- --- msg: ${msg} --- ---`);

  // const tx = await evmSeiSeilorClient.transfer({
  //   amount: "10",
  //   recipient: walletData.activeWallet.address
  // })

  const tx = await evmSeiSeilorClient.send({
    amount: "10",
    contract: evmSeiSeilorStaking,
    msg: msg
  });

  console.log(`\n  --- --- tx: ${tx.transactionHash} --- ---`);
}

async function testDeployCW20(walletData: WalletData){
  // const filePath = "E:\\workspace\\github\\dto.simba\\KryptoniteDAO\\Kryptonite\\cw-plus\\artifacts\\cw20_base.wasm";
  // const codeId = await storeCodeByWalletData(walletData, filePath, "", { gasLimit: 2525925 });
  // console.log(`\n  --- --- codeId --- ---`, codeId);// test codeId 6608 product codeId  8716
  const walletAddress = walletData.activeWallet.address;

  const initMsg = {decimals: 18, initial_balances: [
      {address: walletAddress, amount: "1000000000000000000000000000"}
    ], mint: null, name: "Test cw20", symbol: "TEST"};
  await instantiateContractByWalletData(walletData, walletAddress, 8716, initMsg, "Test cw20", undefined, "Test",
    { gasLimit: undefined });

  // const cw20BaseClient = new Cw20Base.Cw20BaseClient(walletData.activeWallet.signingCosmWasmClient, walletAddress, distribute.address);
}
