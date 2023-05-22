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
      convertNativeToBasset: 1_000_000,
      convertBassetToNative: 1_000_000
    },
    {
      name: "slsdi",
      address: "factory/sei1h3ukufh4lhacftdf6kyxzum4p86rcnel35v4jk/slsdi",
      convertNativeToBasset: 1_000_000,
      convertBassetToNative: 1_000_000
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

    await doConvertNativeToBasset(walletData, nativeDenom, converterNetwork, nativeDenomItem?.convertNativeToBasset);
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
async function doConvertNativeToBasset(walletData: WalletData, nativeDenom: string, converter: DeployContract, amount: number | string): Promise<void> {
  if (!converter?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.log();
    console.error(`The amount is missing.`);
    return;
  }
  const balanceRes = await queryAddressBalance(walletData.LCD_ENDPOINT, walletData.address, nativeDenom);
  if (new Decimal(balanceRes?.balance?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.log();
    console.error(`The nativeDenom balance is insufficient. ${amount} but ${balanceRes?.balance?.amount ?? 0}`);
    return;
  }

  console.log();
  console.log(`Do convert native coin to cw20 token enter. nativeDenom: ${nativeDenom}`);
  const convertRes = await executeContractByWalletData(walletData, converter.address, { convert_native_to_basset: {} }, "convert native to cw20", coins(amount, nativeDenom));
  console.log(`Do convert native coin to cw20 token ok. nativeDenom: ${nativeDenom} / convert amount: ${amount} \n${convertRes?.transactionHash}`);
}

/// convert cw20 token to native coin
async function doConvertBassetToNative(walletData: WalletData, nativeDenom: string, btoken: DeployContract, converter: DeployContract, amount: number | string): Promise<void> {
  if (!btoken?.address || !converter?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.log();
    console.error(`The amount is missing.`);
    return;
  }
  const balanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  if (new Decimal(balanceRes?.balance ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.log();
    console.error(`The nativeDenom balance is insufficient. ${amount} but ${balanceRes?.balance ?? 0}`);
    return;
  }

  console.log(balanceRes, btoken.address, converter.address);
  console.log();
  console.log(`Do convert cw20 token to native coin enter. nativeDenom: ${nativeDenom}`);
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
  console.log(`Do convert cw20 token to native coin enter. nativeDenom: ${nativeDenom} / convert amount: ${amount} \n${convertRes?.transactionHash}`);
}
