import { getQueryClient } from "@sei-js/core";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { SigningStargateClient } from "@cosmjs/stargate";
import { calculateFee, coin, coins, GasPrice } from "@cosmjs/stargate";
import { InstantiateResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import * as fs from "fs";
import * as path from "path";
import { Balance, WalletData, ClientData, DeployContract } from "./types";

const Decimal = require("decimal.js");

export function readArtifact(name: string = "artifact", from: string) {
  try {
    const data = fs.readFileSync(path.join(from, `${name}.json`), "utf8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

export function writeArtifact(data: object, name: string = "artifact", to: string) {
  fs.writeFileSync(path.join(to, `${name}.json`), JSON.stringify(data, null, 2));
}

export async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

export function toEncodedBinary(object: any) {
  return Buffer.from(JSON.stringify(object)).toString("base64");
}

export function strToEncodedBinary(data: string) {
  return Buffer.from(data).toString("base64");
}

export function toDecodedBinary(data: string) {
  return Buffer.from(data, "base64");
}

export function getClientDataByWalletData(walletData: WalletData): ClientData {
  return { signingCosmWasmClient: walletData.signingCosmWasmClient, signingStargateClient: walletData.signingStargateClient, senderAddress: walletData.address, gasPrice: walletData.gasPrice };
}
export function getClientData2ByWalletData(walletData: WalletData): ClientData {
  return { signingCosmWasmClient: walletData.signingCosmWasmClient2, signingStargateClient: walletData.signingStargateClient2, senderAddress: walletData.address2, gasPrice: walletData.gasPrice };
}

export async function storeCodeByWalletData(walletData: WalletData, contract_file: string, memo?: string): Promise<number> {
  return storeCode(getClientDataByWalletData(walletData), contract_file, walletData.gasPrice, memo);
}
export async function storeCode(clientData: ClientData, contract_file: string, gasPrice?: GasPrice, memo?: string): Promise<number> {
  const fee: StdFee = calculateFee(3_100_000, clientData?.gasPrice || "0.001usei");
  let codeId = 0;
  try {
    const data = fs.readFileSync(contract_file);
    const uint8Array = new Uint8Array(data);
    const storeCodeTxResult = await clientData?.signingCosmWasmClient?.upload(clientData?.senderAddress, uint8Array, fee, memo);
    codeId = storeCodeTxResult.codeId;
    console.log();
    console.log(`${contract_file} stored codeId = ${codeId} / ${storeCodeTxResult?.transactionHash}`);
  } catch (error: any) {
    console.log();
    console.error("store code error：", contract_file, error);
  }
  return codeId;
}

export async function instantiateContractByWalletData(walletData: WalletData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = []): Promise<string> {
  return instantiateContract(getClientDataByWalletData(walletData), admin, codeId, message, label, coins);
}
export async function instantiateContract(clientData: ClientData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = []): Promise<string> {
  console.log();
  console.log(`Instantiating contract enter. code_id = ${codeId}`);
  const fee: StdFee = calculateFee(300_000, clientData?.gasPrice || "0.001usei");

  const instantiateTxResult = await clientData?.signingCosmWasmClient?.instantiate(clientData?.senderAddress, codeId, message, label, fee, { memo: "", funds: coins, admin });
  console.log(`Instantiating stored codeId = ${codeId} / ${instantiateTxResult?.transactionHash}`);
  return instantiateTxResult.contractAddress;
}

export async function instantiateContract2ByWalletData(walletData: WalletData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = []): Promise<[string, string]> {
  return instantiateContract2(getClientDataByWalletData(walletData), admin, codeId, message, label, coins);
}
export async function instantiateContract2(clientData: ClientData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = []): Promise<[string, string]> {
  console.log();
  console.log(`Instantiating contract enter. code_id = ${codeId}`);
  const fee: StdFee = calculateFee(5_000_000, clientData?.gasPrice || "0.001usei");

  const instantiateTxResult = await clientData?.signingCosmWasmClient?.instantiate(clientData?.senderAddress, codeId, message, label, fee, { memo: "", funds: coins, admin });
  //   console.log(`instantiate ret:${JSON.stringify(instantiateTxResult)}`);
  console.log(`Instantiating stored codeId = ${codeId} / ${instantiateTxResult?.transactionHash}`);
  return getContractAddresses(instantiateTxResult);
}

function getContractAddresses(txResult: InstantiateResult, msgIndex = 0): [string, string] {
  let eventName: string;
  let attributeKey: string;

  eventName = "instantiate";
  attributeKey = "_contract_address";

  // let contractAddress1: string = txResult.logs[msgIndex].events[eventName][attributeKey][0];
  // let contractAddress2: string = txResult.logs[msgIndex].events[eventName][attributeKey][1];
  let contractAddress1: string = txResult.logs[0].events[2].attributes[0].value;
  let contractAddress2: string = txResult.logs[0].events[2].attributes[2].value;
  return [contractAddress1, contractAddress2];
}

export async function executeContractByWalletData(walletData: WalletData, contractAddress: string, message: object, label: string = "", coins: Coin[] = []) {
  return executeContract(getClientDataByWalletData(walletData), contractAddress, message, label, coins);
}

export async function executeContract(clientData: ClientData, contractAddress: string, message: object, label: string = "", coins: Coin[] = []) {
  const fee: StdFee = calculateFee(2_000_000, clientData?.gasPrice || "0.001usei");
  return await clientData?.signingCosmWasmClient?.execute(clientData?.senderAddress, contractAddress, message, fee, label, coins);
}

export async function migrateContractByWalletData(walletData: WalletData, contractAddress: string, newCodeId: number, message: object, memo?: string) {
  return migrateContract(getClientDataByWalletData(walletData), contractAddress, newCodeId, message, memo);
}
export async function migrateContract(clientData: ClientData, contractAddress: string, newCodeId: number, migrateMsg: object, memo?: string) {
  console.log();
  console.log(`migrate contract enter. address = ${contractAddress} / new_code_id = ${newCodeId}`);
  const fee: StdFee = calculateFee(2_000_000, clientData?.gasPrice || "0.001usei");
  return await clientData?.signingCosmWasmClient?.migrate(clientData?.senderAddress, contractAddress, newCodeId, migrateMsg, fee, memo);
}

export async function sendTokensByWalletData(walletData: WalletData, recipientAddress: string, coins: Coin[], memo?: string) {
  return sendTokens(getClientDataByWalletData(walletData), recipientAddress, coins, memo);
}
export async function sendTokens(clientData: ClientData, recipientAddress: string, coins: Coin[], memo?: string) {
  // const sendCoin = {
  //   denom: coin.denom,
  //   amount: new Decimal(coin.amount).mul(new Decimal("10").pow(6)).toString()
  // };
  const fee: StdFee = calculateFee(2_000_000, clientData?.gasPrice || "0.001usei");
  return await clientData?.signingStargateClient?.sendTokens(clientData?.senderAddress, recipientAddress, coins, fee, memo);
}

export async function queryAddressBalance(LCD_ENDPOINT: string, address: string, denom: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  return await queryClient.cosmos.bank.v1beta1.balance({ address, denom });
}

export async function queryAddressAllBalances(LCD_ENDPOINT: string, address: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  return await queryClient.cosmos.bank.v1beta1.allBalances({ address });
}

export async function queryWasmContractByWalletData(walletData: WalletData, contractAddress: string, message: object) {
  return queryWasmContract(walletData.signingCosmWasmClient, contractAddress, message);
}
export async function queryWasmContract(signingCosmWasmClient: SigningCosmWasmClient, contractAddress: string, message: object) {
  return await signingCosmWasmClient.queryContractSmart(contractAddress, message);
}

export async function queryStaking(LCD_ENDPOINT: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  return await queryClient.cosmos.staking.v1beta1.pool();
}

export async function queryStakingParameters(LCD_ENDPOINT: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  return await queryClient.cosmos.staking.v1beta1.params();
}

export async function queryStakingDelegations(LCD_ENDPOINT: string, delegatorAddr: string, validatorAddr: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  // console.log(`validator: ${validatorAddr}`);
  return await queryClient.cosmos.staking.v1beta1.delegation({ delegatorAddr, validatorAddr });
}

export async function loadAddressesBalances(LCD_ENDPOINT: string, addressList: string[], denomList: string[]): Promise<Balance[]> {
  let addressesBalances = [];
  for (let address of addressList) {
    for (let denom of denomList) {
      addressesBalances.push({ address: address, balance: (await queryAddressBalance(LCD_ENDPOINT, address, denom)).balance });
    }
  }

  console.log();
  console.log(`--- --- addresses balances --- ---`);
  console.table(addressesBalances, [`address`, `balance`]);
  return addressesBalances;
}

export async function sendCoinToOtherAddress(walletData: WalletData, receiver: string, denom: string, sendAmount: string | number, senderBalance?: string | number, receiverBalance?: string | number) {
  if (!receiver || !denom || !sendAmount) {
    return;
  }
  if (!senderBalance) {
    senderBalance = (await queryAddressBalance(walletData.LCD_ENDPOINT, walletData.address, denom))?.balance?.amount;
  }
  if (!receiverBalance) {
    receiverBalance = (await queryAddressBalance(walletData.LCD_ENDPOINT, receiver, denom))?.balance?.amount;
  }
  const sendAmountValue = new Decimal(sendAmount).mul(new Decimal("10").pow(6)).toFixed(0, 1);
  if (senderBalance && receiverBalance && new Decimal(senderBalance).comparedTo(new Decimal(sendAmountValue)) > 0 && new Decimal(receiverBalance).comparedTo(new Decimal(sendAmountValue)) < 0) {
    console.log();
    console.warn(`Do sendTokens enter. from ${walletData.address} to ${receiver} ${sendAmount} ${denom}`);
    const sendCoinRes = await sendTokensByWalletData(walletData, receiver, coins(sendAmountValue, denom));
    console.log(`Do sendTokens enter. from ${walletData.address} to ${receiver} ${sendAmount} ${denom}  ok. \n ${sendCoinRes?.transactionHash}`);
  }
}

export async function logChangeBalancesByWalletData(walletData: WalletData) {
  const beforeAddressesBalances = walletData.addressesBalances;
  const afterAddressesBalances = await loadAddressesBalances(walletData.LCD_ENDPOINT, walletData.addressList, walletData.denomList);
  console.log();
  console.log(`addresses balance changes (after - before): `);
  for (let address of walletData.addressList) {
    for (let denom of walletData.denomList) {
      let balanceBefore = beforeAddressesBalances.find(v => address === v?.address && denom === v?.balance?.denom)?.balance?.amount;
      let balanceAfter = afterAddressesBalances.find(v => address === v?.address && denom === v?.balance?.denom)?.balance?.amount;
      let amountValue = new Decimal(balanceAfter).sub(new Decimal(balanceBefore));
      // if (amountValue.comparedTo(new Decimal("0")) !== 0) {
      let amount = amountValue.div(new Decimal("10").pow(walletData.nativeCurrency.coinDecimals)).toString();
      console.log(`${address}: ${amount} [${amountValue}] ${denom}`);
      // }
    }
  }
}

export async function queryContractConfig(walletData: WalletData, deployContract: DeployContract, print: boolean = true): Promise<{ initFlag; config }> {
  if (!deployContract?.address) {
    return;
  }
  let config = null;
  let initFlag = true;
  try {
    print && console.log();
    print && console.log(`Query deployed.address config enter. address: ${deployContract.address}`);
    config = await queryWasmContractByWalletData(walletData, deployContract.address, { config: {} });
    print && console.log(`Query deployed.address config ok. address: ${deployContract.address} \n${JSON.stringify(config)}`);
  } catch (error: any) {
    if (error?.toString().includes("addr_humanize")) {
      initFlag = false;
      console.error(`deployed.config: need update config`);
    } else {
      throw new Error(error);
    }
  }
  return { initFlag, config };
}
