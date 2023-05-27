import { getQueryClient, getSigningClient, getSigningCosmWasmClient } from '@sei-js/core';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { calculateFee, logs } from '@cosmjs/stargate';
import { Coin } from "@cosmjs/amino";
import { InstantiateResult } from '@cosmjs/cosmwasm-stargate';
import * as fs from "fs";
const Decimal = require("decimal.js");

export async function storeCode(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet, contract_file: string): Promise<number> {

  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const fee = calculateFee(3100000, "0.1usei");
  let codeId = 0;
  try {
    const data = fs.readFileSync(contract_file);
    const uint8Array = new Uint8Array(data);
    const storeCodeTxResult = await signCosmWasmClient.upload(firstAccount.address, uint8Array, fee)
    codeId = storeCodeTxResult.codeId;
  } catch (err) {
    console.error("store code error：", err);
  }
  console.log(`${contract_file} stored with code_id = ${codeId}`);
  return codeId
}

export async function instantiateContract(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet, codeId: number, message: object, coins: Coin[], label: string) {
  console.log(`Instantiating contract with code_id = ${codeId}...`)

  const fee = calculateFee(300000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const instantiateTxResult = await signCosmWasmClient.instantiate(firstAccount.address, codeId, message, label, fee, { memo: "", funds: coins });
  return instantiateTxResult.contractAddress;
}

export async function instantiateContract2(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet, codeId: number, message: object, coins: Coin[], label: string) {
  console.log(`Instantiating contract with code_id = ${codeId}...`)
  const fee = calculateFee(500000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const instantiateTxResult = await signCosmWasmClient.instantiate(firstAccount.address, codeId, message, label, fee, { memo: "", funds: coins });
  return getContractAddressess(instantiateTxResult);
}

function getContractAddressess(txResult: InstantiateResult, msgIndex = 0): [string, string] {

  let eventName: string;
  let attributeKey: string;
  eventName = 'instantiate';
  attributeKey = '_contract_address';
  let contractAddress1: string = txResult.logs[0].events[2].attributes[0].value;
  let contractAddress2: string = txResult.logs[0].events[2].attributes[2].value;
  return [contractAddress1, contractAddress2];
}

export async function executeContract(RPC_ENDPOINT: string,  wallet: DirectSecp256k1Wallet | DirectSecp256k1HdWallet, contractAddress: string, message: object, label: string, coins: Coin[]) {
  const fee = calculateFee(2000000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const executeTxResult = await signCosmWasmClient.execute(firstAccount.address, contractAddress, message, fee, label, coins);

  return executeTxResult;
}

export async function migrateContract(RPC_ENDPOINT: string,  wallet: DirectSecp256k1Wallet | DirectSecp256k1HdWallet, contractAddress: string, newCodeId: number, migrateMsg: object, memo: string) {
  const fee = calculateFee(300000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const migrateTxResult = await signCosmWasmClient.migrate(firstAccount.address, contractAddress, newCodeId, migrateMsg, fee, memo);
  return migrateTxResult;
}

export async function sendCoin(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet, recipientAddress: string, message: string, coin: Coin) {
  const sendCoin = {
    denom: coin.denom,
    amount: new Decimal(coin.amount).mul(new Decimal("10").pow(6)).toString()
  }
  const fee = calculateFee(300000, "0.1usei");
  const [firstAccount] = await wallet.getAccounts();
  const signClient = await getSigningClient(RPC_ENDPOINT, wallet);
  const sendTxResult = await signClient.sendTokens(firstAccount.address, recipientAddress, [sendCoin], fee, message);

  return sendTxResult;
}

export async function queryAddressBalance(LCD_ENDPOINT: string, address: string, denom: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  if ("" == denom) {
    let queryAllRet = await queryClient.cosmos.bank.v1beta1.allBalances({ address: address, }).then(res => {
      console.log(JSON.stringify(res));
    }).catch(e => {
      console.log(JSON.stringify(e));
    });
  } else {
    let queryRet = await queryClient.cosmos.bank.v1beta1.balance(
      {
        address: address,
        denom: denom,
      }).then(res => {
        console.log(JSON.stringify(res));
      }).catch(e => {
        console.log(JSON.stringify(e));
      });
  }
  return null;
}

export async function queryWasmContract(RPC_ENDPOINT: string, wallet: DirectSecp256k1HdWallet, contractAddress: string, message: object) {
  const [firstAccount] = await wallet.getAccounts();
  const signCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet);
  const queryClient = await signCosmWasmClient.queryContractSmart(
    contractAddress,
    message).then(res => {
      console.log(JSON.stringify(res));
    }).catch(e => {
      console.log(JSON.stringify(e));
    });
  return null;
}

export async function queryStaking(LCD_ENDPOINT: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  let qRet = await queryClient.cosmos.staking.v1beta1.pool().then(res => {
    console.log(JSON.stringify(res));
  }).catch(e => {
    console.log(JSON.stringify(e));
  });
  return null;
}

export async function queryStakingParameters(LCD_ENDPOINT: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  let qRet = await queryClient.cosmos.staking.v1beta1.params().then(res => {
    console.log(JSON.stringify(res));
  }).catch(e => {
    console.log(JSON.stringify(e));
  });
  return null;
}

export async function queryStakingDelegations(LCD_ENDPOINT: string, delegatorAddress: string, validatoAddress: string) {
  const queryClient = await getQueryClient(LCD_ENDPOINT);
  await queryClient.cosmos.staking.v1beta1.delegation(
    {
      delegatorAddr: delegatorAddress,
      validatorAddr: validatoAddress,
    }).then(res => {
      console.log(JSON.stringify(res));
    }).catch(e => {
      console.log(JSON.stringify(e));
    });
  return null;
}