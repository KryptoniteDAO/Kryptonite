import { coins } from "@cosmjs/stargate";
import { readArtifact, executeContractByWalletData, logChangeBalancesByWalletData, queryAddressBalance, queryAddressTokenBalance } from "./common";
import { loadingWalletData, chainConfigs, CONVERT_ARTIFACTS_PATH } from "./env_data";
import { ConvertPairs, DeployContract, WalletData } from "./types";
import Decimal from "decimal.js";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- verify deployed convert contracts enter --- ---`);

  const walletData = await loadingWalletData();

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  // //just a few simple tests to make sure the contracts are not failing
  // //for more accurate tests we must use integration-tests repo

  const nativeDenomList = [
    {
      name: "strideSei",
      address: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/stsei",
      convertNativeToBasset: "1000000",
      convertBassetToNative: "1000000"
    },
    {
      name: "slsdi",
      address: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/slsdi",
      convertNativeToBasset: "1000000",
      convertBassetToNative: "1000000"
    }
  ];

  const network = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH);

  for (let nativeDenomItem of nativeDenomList) {
    const nativeDenom = nativeDenomItem?.address;
    const convertPairsConfig: ConvertPairs = chainConfigs?.convertPairs?.find((v: ConvertPairs) => nativeDenom === v.native_denom);
    const convertPairsNetwork = network?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
    if (!convertPairsConfig || !convertPairsNetwork) {
      continue;
    }
    // const converterConfig = convertPairsConfig?.converter;
    // const btokenConfig = convertPairsConfig?.btoken;
    // const custodyConfig = convertPairsConfig?.custody;

    const converterNetwork = convertPairsNetwork?.converter;
    const btokenNetwork = convertPairsNetwork?.btoken;
    const custodyNetwork = convertPairsNetwork?.custody;

    await doConvertNativeToBasset(walletData, nativeDenom, converterNetwork, btokenNetwork, nativeDenomItem?.convertNativeToBasset);
    await doConvertBassetToNative(walletData, nativeDenom, btokenNetwork, converterNetwork, nativeDenomItem?.convertBassetToNative);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed convert contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

/// convert native coin to cw20 token
async function doConvertNativeToBasset(walletData: WalletData, nativeDenom: string, converter: DeployContract, btoken: DeployContract, amount: number | string): Promise<void> {
  if (!converter?.address || !btoken?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.log();
    console.error(`The amount is missing.`);
    return;
  }
  console.log();
  console.log(`Do convert native coin to cw20 token enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeNativeBalanceRes = await queryAddressBalance(walletData.LCD_ENDPOINT, walletData.address, nativeDenom);
  if (new Decimal(beforeNativeBalanceRes?.balance?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.log();
    console.error(`********* The nativeDenom balance is insufficient. ${amount} but ${beforeNativeBalanceRes?.balance?.amount ?? 0}`);
    return;
  }
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  console.log(`before native balance: ${beforeNativeBalanceRes.balance.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${btoken.address}`);

  const convertRes = await executeContractByWalletData(walletData, converter.address, { convert_native_to_basset: {} }, "convert native to cw20", coins(amount, nativeDenom));
  console.log(`Do convert native coin to cw20 token ok. \n${convertRes?.transactionHash}`);

  const afterBalanceRes = await queryAddressBalance(walletData.LCD_ENDPOINT, walletData.address, nativeDenom);
  console.log(`after native balance: ${afterBalanceRes.balance.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${btoken.address}`);
}

/// convert cw20 token to native coin
async function doConvertBassetToNative(walletData: WalletData, nativeDenom: string, btoken: DeployContract, converter: DeployContract, amount: string): Promise<void> {
  if (!btoken?.address || !converter?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.log();
    console.error(`The amount is missing.`);
    return;
  }
  console.log();
  console.log(`Do convert cw20 token to native coin enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  if (new Decimal(beforeTokenBalanceRes?.balance ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.log();
    console.error(`********* The nativeDenom balance is insufficient. ${amount} but ${beforeTokenBalanceRes?.balance ?? 0}`);
    return;
  }
  const beforeNativeBalanceRes = await queryAddressBalance(walletData.LCD_ENDPOINT, walletData.address, nativeDenom);
  console.log(`before native balance: ${beforeNativeBalanceRes.balance.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${btoken.address}`);

  const convertRes = await executeContractByWalletData(
    walletData,
    btoken.address,
    {
      send: {
        contract: converter.address,
        amount: amount+"",
        msg: Buffer.from(JSON.stringify({ convert_basset_to_native: {} })).toString("base64")
      }
    },
    "convert cw20 to native"
  );
  console.log(`Do convert cw20 token to native coin ok. \n${convertRes?.transactionHash}`);

  const afterBalanceRes = await queryAddressBalance(walletData.LCD_ENDPOINT, walletData.address, nativeDenom);
  console.log(`after native balance: ${afterBalanceRes.balance.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${btoken.address}`);
}