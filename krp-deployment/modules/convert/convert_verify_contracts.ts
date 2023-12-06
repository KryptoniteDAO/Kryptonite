import { executeContractByWalletData, printChangeBalancesByWalletData, queryAddressBalance, queryAddressTokenBalance } from "@/common";
import { loadingWalletData } from "@/env_data";
import { printDeployedConvertContracts, readDeployedContracts } from "@/modules";
import type { ContractDeployed, WalletData } from "@/types";
import { coins } from "@cosmjs/stargate";
import Decimal from "decimal.js";
import { CONVERT_MODULE_NAME } from "./convert_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- verify deployed contracts enter: ${CONVERT_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { convertNetwork } = readDeployedContracts(walletData.chainId);
  if (!convertNetwork) {
    throw new Error(`\n  --- --- verify ${CONVERT_MODULE_NAME} contracts error, missing some deployed ${CONVERT_MODULE_NAME} address info --- ---`);
  }
  await printDeployedConvertContracts(convertNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const doFunc: boolean = false;
  const print: boolean = true;

  if (convertNetwork?.convertPairs && convertNetwork.convertPairs.length > 0) {
    for (let convertPairsNetwork of convertNetwork.convertPairs) {
      const nativeDenom = convertPairsNetwork?.native_denom;

      const converterNetwork = convertPairsNetwork?.converter;
      const bAssetsTokenNetwork = convertPairsNetwork?.bAssetsToken;
      const custodyNetwork = convertPairsNetwork?.custody;

      await doConvertNativeToBasset(walletData, nativeDenom, converterNetwork, bAssetsTokenNetwork, "1000000");
      await doConvertBassetToNative(walletData, nativeDenom, bAssetsTokenNetwork, converterNetwork, "1000000");
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed contracts end: ${CONVERT_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);

/// convert native coin to cw20 token
async function doConvertNativeToBasset(walletData: WalletData, nativeDenom: string, converter: ContractDeployed, bAssetsToken: ContractDeployed, amount: number | string): Promise<void> {
  if (!converter?.address || !bAssetsToken?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do convert native coin to cw20 token enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  if (new Decimal(beforeNativeBalanceRes?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeNativeBalanceRes?.amount ?? 0}`);
    return;
  }
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssetsToken.address);
  console.log(`before native balance: ${beforeNativeBalanceRes.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${bAssetsToken.address}`);

  const convertRes = await executeContractByWalletData(walletData, converter.address, { convert_native_to_basset: {} }, "convert native to cw20", coins(amount, nativeDenom));
  console.log(`Do convert native coin to cw20 token ok. \n  ${convertRes?.transactionHash}`);

  const afterBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  console.log(`after native balance: ${afterBalanceRes?.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssetsToken.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${bAssetsToken.address}`);
}

/// convert cw20 token to native coin
async function doConvertBassetToNative(walletData: WalletData, nativeDenom: string, bAssetsToken: ContractDeployed, converter: ContractDeployed, amount: string): Promise<void> {
  if (!bAssetsToken?.address || !converter?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do convert cw20 token to native coin enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssetsToken.address);
  if (new Decimal(beforeTokenBalanceRes?.balance ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeTokenBalanceRes?.balance ?? 0}`);
    return;
  }
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  console.log(`before native balance: ${beforeNativeBalanceRes?.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${bAssetsToken.address}`);

  const convertRes = await executeContractByWalletData(
    walletData,
    bAssetsToken.address,
    {
      send: {
        contract: converter.address,
        amount: amount + "",
        msg: Buffer.from(JSON.stringify({ convert_basset_to_native: {} })).toString("base64")
      }
    },
    "convert cw20 to native"
  );
  console.log(`Do convert cw20 token to native coin ok. \n  ${convertRes?.transactionHash}`);

  const afterBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  console.log(`after native balance: ${afterBalanceRes?.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssetsToken.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${bAssetsToken.address}`);
}
