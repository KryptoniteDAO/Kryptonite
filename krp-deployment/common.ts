import {getQueryClient, getSigningClient, getSigningCosmWasmClient} from '@sei-js/core';
import {DirectSecp256k1HdWallet, DirectSecp256k1Wallet} from '@cosmjs/proto-signing';
import {calculateFee} from '@cosmjs/stargate';
import {InstantiateResult} from '@cosmjs/cosmwasm-stargate';
import {Coin, StdFee} from "@cosmjs/amino";
import * as fs from "fs";

const Decimal = require("decimal.js");

export async function storeCode(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet, contract_file: string, memo?: string): Promise<number> {
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const fee: StdFee = calculateFee(3_100_000, "0.1usei");
  let codeId = 0;
  try {
    const data = fs.readFileSync(contract_file);
    const uint8Array = new Uint8Array(data);
    const storeCodeTxResult = await signCosmWasmClient.upload(firstAccount.address, uint8Array, fee, memo)
    codeId = storeCodeTxResult.codeId;
    // console.log(`${contract_file} stored with ${message} = ${codeId}`);
  } catch (error: any) {
    console.error("store code error：", error);
  }
  return codeId
}

export async function instantiateContract(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet, codeId: number, message: object, coins: Coin[], label: string): Promise<string> {
  console.log(`Instantiating contract with code_id = ${codeId}...`)
  const fee = calculateFee(300_000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const instantiateTxResult = await signCosmWasmClient.instantiate(firstAccount.address, codeId, message, label, fee, {memo: "", funds: coins});
  return instantiateTxResult.contractAddress;
}

export async function instantiateContract2(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet, codeId: number, message: object, coins: Coin[], label: string) {
  console.log(`Instantiating contract with code_id = ${codeId}...`)
  const fee = calculateFee(300000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const instantiateTxResult = await signCosmWasmClient.instantiate(firstAccount.address, codeId, message, label, fee, {memo: "", funds: coins});
  //   console.log(`instantiate ret:${JSON.stringify(instantiateTxResult)}`);
  return getContractAddresses(instantiateTxResult);
}

function getContractAddresses(txResult: InstantiateResult, msgIndex = 0): [string, string] {
  let eventName: string;
  let attributeKey: string;

  eventName = 'instantiate';
  attributeKey = '_contract_address';

  let contractAddress1: string = txResult.logs[msgIndex].events[eventName][attributeKey][0];
  let contractAddress2: string = txResult.logs[msgIndex].events[eventName][attributeKey][1];
  return [contractAddress1, contractAddress2];
}

export async function executeContract(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet, contractAddress: string, message: object, label: string, coins: Coin[]) {
  const fee = calculateFee(1500_000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  return await signCosmWasmClient.execute(firstAccount.address, contractAddress, message, fee, label, coins);
}

export async function migrateContract(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet, contractAddress: string, newCodeId: number, migrateMsg: object, memo: string) {
  const fee = calculateFee(300000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  return await signCosmWasmClient.migrate(firstAccount.address, contractAddress, newCodeId, migrateMsg, fee, memo);
}

export async function sendCoin(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet, recipientAddress: string, message: string, coin: Coin) {
  const sendCoin = {
    denom: coin.denom,
    amount: new Decimal(coin.amount).mul(new Decimal("10").pow(6)).toString()
  }

  const fee = calculateFee(300000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signClient = await getSigningClient(RPC_ENDPOINT, wallet);
  return await signClient.sendTokens(firstAccount.address, recipientAddress, [sendCoin], fee, message);
}

export async function queryAddressBalance(LCD_ENDPOINT: string, address: string, denom: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  return await queryClient.cosmos.bank.v1beta1.balance({address, denom});
}

export async function queryAddressAllBalances(LCD_ENDPOINT: string, address: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  return await queryClient.cosmos.bank.v1beta1.allBalances({address});
}

export async function queryWasmContract(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet, contractAddress: string, message: object) {
  // const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  return await signCosmWasmClient.queryContractSmart(contractAddress, message);
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
  return await queryClient.cosmos.staking.v1beta1.delegation({delegatorAddr, validatorAddr});
}

export function stringToUint8Array(str) {
  const arr = [];
  let i = 0, j = str.length;
  for (; i < j; ++i) {
    arr.push(str.charCodeAt(i));
  }

  return new Uint8Array(arr)
}

export function isHexString(value: any, length?: number): boolean {
  if (typeof(value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false
  }
  if (length && value.length !== 2 + 2 * length) { return false; }
  return true;
}