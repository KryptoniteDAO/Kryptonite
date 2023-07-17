import type {
  CosmWasmClient,
  ExecuteInstruction,
  InstantiateResult,
  JsonObject,
  MsgExecuteContractEncodeObject,
  InstantiateOptions,
  MsgClearAdminEncodeObject,
  MsgInstantiateContractEncodeObject,
  MsgMigrateContractEncodeObject,
  MsgUpdateAdminEncodeObject,
  MsgStoreCodeEncodeObject
} from "@cosmjs/cosmwasm-stargate";
import type { GasPrice, MsgDelegateEncodeObject, MsgSendEncodeObject, MsgTransferEncodeObject, MsgUndelegateEncodeObject, MsgWithdrawDelegatorRewardEncodeObject } from "@cosmjs/stargate";
import type { Balance, BaseContractConfig, ClientData, ContractDeployed, WalletData } from "./types";
import type { Coin, StdFee } from "@cosmjs/amino";
import { getQueryClient } from "@sei-js/core";
import { calculateFee, coins } from "@cosmjs/stargate";
import * as fs from "fs";
import * as path from "path";
import { fromBech32, toUtf8 } from "@cosmjs/encoding";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { MsgSetWithdrawAddress, MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgCreateVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { MsgClearAdmin, MsgExecuteContract, MsgInstantiateContract, MsgMigrateContract, MsgStoreCode, MsgUpdateAdmin } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import pako from "pako";
import { Uint53 } from "@cosmjs/math";
import Long from "long";
import { Height } from "cosmjs-types/ibc/core/client/v1/client";
const Decimal = require("decimal.js");

export const FEE_AMOUNT_WARNING: number = 500000;
export const GAS_MULTIPLIER: number = 1.3;

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

export const toEncodedBinary = (data: string | object): string => {
  if (typeof data === "string") {
    return Buffer.from(data).toString("base64");
  }
  return Buffer.from(JSON.stringify(data)).toString("base64");
};

export function toDecodedBinary(data: string) {
  return Buffer.from(data, "base64");
}

export function getClientDataByWalletData(walletData: WalletData): ClientData {
  return { signingCosmWasmClient: walletData.signingCosmWasmClient, signingStargateClient: walletData.signingStargateClient, senderAddress: walletData.address, gasPrice: walletData.gasPrice };
}
export function getClientData2ByWalletData(walletData: WalletData): ClientData {
  return { signingCosmWasmClient: walletData.signingCosmWasmClient2, signingStargateClient: walletData.signingStargateClient2, senderAddress: walletData.address2, gasPrice: walletData.gasPrice };
}

export async function storeCodeByWalletData<P extends { gasLimit?: number }>(walletData: WalletData, contract_file: string, memo?: string, otherParams?: P): Promise<number> {
  return storeCode(getClientDataByWalletData(walletData), contract_file, walletData.gasPrice, memo, otherParams);
}
export async function storeCode<P extends { gasLimit?: number }>(clientData: ClientData, contract_file: string, gasPrice?: GasPrice, memo?: string, otherParams?: P): Promise<number> {
  console.log(`\n  storeCode enter. contract_file = ${contract_file}`);
  let codeId = 0;
  try {
    const data = fs.readFileSync(contract_file);
    const uint8Array = new Uint8Array(data);
    let fee: StdFee;
    if (otherParams?.gasLimit && otherParams?.gasLimit > 0) {
      fee = calculateFee(otherParams?.gasLimit, clientData?.gasPrice);
    } else {
      const gasEstimation = await clientData.signingCosmWasmClient.simulate(clientData.senderAddress, uploadMsgEncodeObject(clientData.senderAddress, uint8Array), memo);
      fee = calculateFee(Math.round(gasEstimation * GAS_MULTIPLIER), clientData?.gasPrice);
    }
    console.log(`  storeCode fee`, fee);
    if (BnComparedTo(fee.amount[0].amount, FEE_AMOUNT_WARNING) >= 0) {
      console.error(`\n  ********* store code error：too large fee.`, contract_file);
      return;
    }
    // const fee: StdFee = calculateFee(otherParams?.gasLimit ?? 3_100_000, clientData?.gasPrice || "0.001usei");
    const storeCodeTxResult = await clientData?.signingCosmWasmClient?.upload(clientData?.senderAddress, uint8Array, fee, memo);
    codeId = storeCodeTxResult.codeId;
    console.log(`  stored codeId = ${codeId} / ${storeCodeTxResult?.transactionHash}`);
  } catch (error: any) {
    console.error(`\n  ********* store code error：`, contract_file, error);
  }
  return codeId;
}

export async function instantiateContractByWalletData<P extends { gasLimit?: number }>(walletData: WalletData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = [], otherParams?: P): Promise<string> {
  return instantiateContract(getClientDataByWalletData(walletData), admin, codeId, message, label, coins, otherParams);
}
export async function instantiateContract<P extends { gasLimit?: number }>(clientData: ClientData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = [], otherParams?: P): Promise<string> {
  console.log(`\n  Instantiating contract enter. code_id = ${codeId}`);
  // const fee: StdFee = calculateFee(otherParams?.gasLimit ?? 300_000, clientData?.gasPrice || "0.001usei");
  let fee: StdFee;
  if (otherParams?.gasLimit && otherParams?.gasLimit > 0) {
    fee = calculateFee(otherParams?.gasLimit, clientData?.gasPrice);
  } else {
    const gasEstimation = await clientData.signingCosmWasmClient.simulate(clientData.senderAddress, instantiateMsgEncodeObject(clientData.senderAddress, codeId, message, label, { memo: "", funds: coins, admin }), label);
    fee = calculateFee(Math.round(gasEstimation * GAS_MULTIPLIER), clientData?.gasPrice);
  }
  console.log(`  instantiateContract fee`, fee);
  if (BnComparedTo(fee.amount[0].amount, FEE_AMOUNT_WARNING) >= 0) {
    console.error(`\n  ********* instantiateContract error：too large fee. codeId: `, codeId);
    return;
  }
  const instantiateTxResult = await clientData?.signingCosmWasmClient?.instantiate(clientData?.senderAddress, codeId, message, label, fee, { memo: "", funds: coins, admin });
  console.log(`  Instantiating stored codeId = ${codeId} / ${instantiateTxResult?.transactionHash}`);
  return instantiateTxResult.contractAddress;
}

export async function instantiateContract2ByWalletData(walletData: WalletData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = []): Promise<[string, string]> {
  return instantiateContract2(getClientDataByWalletData(walletData), admin, codeId, message, label, coins);
}
export async function instantiateContract2(clientData: ClientData, admin: string, codeId: number, message: object, label: string = "", coins: Coin[] = []): Promise<[string, string]> {
  console.log(`\n  Instantiating contract enter. code_id = ${codeId}`);
  const fee: StdFee = calculateFee(5_000_000, clientData?.gasPrice || "0.001usei");

  const instantiateTxResult = await clientData?.signingCosmWasmClient?.instantiate(clientData?.senderAddress, codeId, message, label, fee, { memo: "", funds: coins, admin });
  //   console.log(`instantiate ret:${JSON.stringify(instantiateTxResult)}`);
  console.log(`  Instantiating stored codeId = ${codeId} / ${instantiateTxResult?.transactionHash}`);
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

export async function executeContractByWalletData<P extends { gasLimit?: number }>(walletData: WalletData, contractAddress: string, message: object, label: string = "", coins: Coin[] = [], otherParams?: P) {
  return executeContract(getClientDataByWalletData(walletData), contractAddress, message, label, coins, otherParams);
}

export async function executeContract<P extends { gasLimit?: number }>(clientData: ClientData, contractAddress: string, message: object, label: string = "", coins: Coin[] = [], otherParams?: P) {
  // const fee: StdFee = calculateFee(3_000_000, clientData?.gasPrice || "0.001usei");
  let fee: StdFee;
  if (otherParams?.gasLimit && otherParams?.gasLimit > 0) {
    fee = calculateFee(otherParams?.gasLimit, clientData?.gasPrice);
  } else {
    const gasEstimation = await clientData.signingCosmWasmClient.simulate(clientData.senderAddress, executeMsgEncodeObject(clientData.senderAddress, contractAddress, message, coins), label);
    fee = calculateFee(Math.round(gasEstimation * GAS_MULTIPLIER), clientData?.gasPrice);
  }
  console.log(`  executeContract fee`, fee);
  if (BnComparedTo(fee.amount[0].amount, FEE_AMOUNT_WARNING) >= 0) {
    console.error(`\n  ********* executeContract error：too large fee. `, contractAddress, message);
    return;
  }
  return await clientData?.signingCosmWasmClient?.execute(clientData?.senderAddress, contractAddress, message, fee, label, coins);
}

export async function migrateContractByWalletData<P extends { gasLimit?: number }>(walletData: WalletData, contractAddress: string, newCodeId: number, message: object, memo: string = "", otherParams?: P) {
  return migrateContract(getClientDataByWalletData(walletData), contractAddress, newCodeId, message, memo, otherParams);
}
export async function migrateContract<P extends { gasLimit?: number }>(clientData: ClientData, contractAddress: string, newCodeId: number, migrateMsg: object, memo: string = "", otherParams?: P) {
  console.log(`\n  migrate contract enter. address = ${contractAddress} / new_code_id = ${newCodeId}`);
  // const fee: StdFee = calculateFee(2_000_000, clientData?.gasPrice || "0.001usei");
  let fee: StdFee;
  if (otherParams?.gasLimit && otherParams?.gasLimit > 0) {
    fee = calculateFee(otherParams?.gasLimit, clientData?.gasPrice);
  } else {
    const gasEstimation = await clientData.signingCosmWasmClient.simulate(clientData.senderAddress, migrateMsgEncodeObject(clientData.senderAddress, contractAddress, newCodeId, migrateMsg), memo);
    fee = calculateFee(Math.round(gasEstimation * GAS_MULTIPLIER), clientData?.gasPrice);
  }
  console.log(`  migrateContract fee`, fee);
  if (BnComparedTo(fee.amount[0].amount, FEE_AMOUNT_WARNING) >= 0) {
    console.error(`\n  ********* migrateContract error：too large fee. `, newCodeId, contractAddress, migrateMsg);
    return;
  }
  return await clientData?.signingCosmWasmClient?.migrate(clientData?.senderAddress, contractAddress, newCodeId, migrateMsg, fee, memo);
}

export async function sendTokensByWalletData<P extends { gasLimit?: number }>(walletData: WalletData, recipientAddress: string, coins: Coin[], memo: string = "", otherParams?: P) {
  return sendTokens(getClientDataByWalletData(walletData), recipientAddress, coins, memo, otherParams);
}
export async function sendTokens<P extends { gasLimit?: number }>(clientData: ClientData, recipientAddress: string, coins: Coin[], memo: string = "", otherParams?: P) {
  // const sendCoin = {
  //   denom: coin.denom,
  //   amount: new Decimal(coin.amount).mul(new Decimal("10").pow(6)).toString()
  // };
  // const fee: StdFee = calculateFee(2_000_000, clientData?.gasPrice || "0.001usei");
  let fee: StdFee;
  if (otherParams?.gasLimit && otherParams?.gasLimit > 0) {
    fee = calculateFee(otherParams?.gasLimit, clientData?.gasPrice);
  } else {
    const gasEstimation = await clientData.signingCosmWasmClient.simulate(clientData.senderAddress, sendTokensMsgEncodeObject(clientData.senderAddress, recipientAddress, coins), memo);
    fee = calculateFee(Math.round(gasEstimation * GAS_MULTIPLIER), clientData?.gasPrice);
  }
  console.log(`  migrateContract fee`, fee);
  if (BnComparedTo(fee.amount[0].amount, FEE_AMOUNT_WARNING) >= 0) {
    console.error(`\n  ********* sendTokens error：too large fee. `, recipientAddress, coins);
    return;
  }
  return await clientData?.signingStargateClient?.sendTokens(clientData?.senderAddress, recipientAddress, coins, fee, memo);
}

// export async function queryAddressBalance(LCD_ENDPOINT: string, address: string, denom: string) {
//   const queryClient = await getQueryClient(LCD_ENDPOINT);
//   return await queryClient.cosmos.bank.v1beta1.balance({ address, denom });
// }
// export async function queryAddressAllBalances(LCD_ENDPOINT: string, address: string) {
//   const queryClient = await getQueryClient(LCD_ENDPOINT);
//   return await queryClient.cosmos.bank.v1beta1.allBalances({ address });
// }

export async function queryAddressBalance(walletData: WalletData, address: string, denom: string) {
  return walletData.signingCosmWasmClient?.getBalance(address, denom);
}

export async function queryAddressAllBalances(walletData: WalletData, address: string) {
  return walletData.signingStargateClient?.getAllBalances(address);
}

export async function queryWasmContractByWalletData(walletData: WalletData, contractAddress: string, message: object) {
  return queryWasmContract(walletData.signingCosmWasmClient, contractAddress, message);
}
export async function queryWasmContract(cosmWasmClient: CosmWasmClient, contractAddress: string, message: object) {
  return await cosmWasmClient.queryContractSmart(contractAddress, message);
}

export async function queryAddressTokenBalance(cosmWasmClient: CosmWasmClient, userAddress: string, contractAddress: string) {
  const queryMsg = {
    balance: {
      address: userAddress
    }
  };
  return await queryWasmContract(cosmWasmClient, contractAddress, queryMsg);
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

export async function loadAddressesBalances(walletData: WalletData, addressList: string[], denomList: string[]): Promise<Balance[]> {
  let addressesBalances = [];
  for (let address of addressList) {
    for (let denom of denomList) {
      addressesBalances.push({ address: address, balance: await queryAddressBalance(walletData, address, denom) });
    }
  }

  console.log(`\n  --- --- addresses balances --- ---`);
  console.table(addressesBalances, [`address`, `balance`]);
  return addressesBalances;
}

export async function sendCoinToOtherAddress(walletData: WalletData, receiver: string, denom: string, sendAmount: string | number, senderBalance?: string | number, receiverBalance?: string | number) {
  if (!receiver || !denom || !sendAmount) {
    return;
  }
  if (!senderBalance) {
    senderBalance = (await queryAddressBalance(walletData, walletData.address, denom))?.amount;
  }
  if (!receiverBalance) {
    receiverBalance = (await queryAddressBalance(walletData, receiver, denom))?.amount;
  }
  const sendAmountValue = new Decimal(sendAmount).mul(new Decimal("10").pow(6)).toFixed(0, 1);
  if (senderBalance && receiverBalance && new Decimal(senderBalance).comparedTo(new Decimal(sendAmountValue)) > 0 && new Decimal(receiverBalance).comparedTo(new Decimal(sendAmountValue)) < 0) {
    console.warn(`\n  Do sendTokens enter. from ${walletData.address} to ${receiver} ${sendAmount} ${denom}`);
    const sendCoinRes = await sendTokensByWalletData(walletData, receiver, coins(sendAmountValue, denom));
    console.log(`Do sendTokens enter. from ${walletData.address} to ${receiver} ${sendAmount} ${denom}  ok. \n ${sendCoinRes?.transactionHash}`);
  }
}

export async function printChangeBalancesByWalletData(walletData: WalletData) {
  const beforeAddressesBalances = walletData.addressesBalances;
  const afterAddressesBalances = await loadAddressesBalances(walletData, walletData.addressList, walletData.denomList);
  console.log(`\n  addresses balance changes (after - before): `);
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
  console.log();
}

export async function queryContractConfig(walletData: WalletData, deployContract: ContractDeployed, print: boolean = true): Promise<{ initFlag; config }> {
  if (!deployContract?.address) {
    return;
  }
  let config = null;
  let initFlag = true;
  try {
    print && console.log(`\n  Query deployed.address config enter. address: ${deployContract.address}`);
    config = await queryWasmContractByWalletData(walletData, deployContract.address, { config: {} });
    print && console.log(`  Query deployed.address config ok. address: ${deployContract.address} \n  ${JSON.stringify(config)}`);
  } catch (error: any) {
    if (error?.toString().includes("addr_humanize")) {
      initFlag = false;
      console.error(`  deployed.config: need update config`);
    } else {
      throw new Error(error);
    }
  }
  return { initFlag, config };
}

export async function deployContract<
  C extends BaseContractConfig = BaseContractConfig,
  M extends object = object,
  D extends { defaultFilePath?: string; defaultLabel?: string; defaultInitMsg?: M; defaultFunds?: Coin[]; writeAble?: boolean; writeFunc?: Function; memo?: string; storeCoreGasLimit?: number; instantiateGasLimit?: number } = any
>(walletData: WalletData, contractName: string, network: unknown, contractNetwork: ContractDeployed | undefined, contractConfig: C, { defaultFilePath, defaultLabel, defaultInitMsg, defaultFunds, writeAble = true, writeFunc, memo, storeCoreGasLimit, instantiateGasLimit }: D): Promise<void> {
  if (!network || !contractConfig || !contractName) {
    console.error(`\n  Missing info: ${contractName}`);
    return;
  }

  if (!contractNetwork) {
    contractNetwork = network[contractName] as unknown as ContractDeployed;
  }
  if (!!contractNetwork?.address) {
    return;
  }
  if (!contractNetwork) {
    contractNetwork = {} as ContractDeployed;
    network[contractName] = contractNetwork;
  }
  if (!contractNetwork?.codeId || contractNetwork?.codeId <= 0) {
    const filePath = contractConfig?.filePath || defaultFilePath;
    if (!filePath) {
      console.error(`\n  Missing file: ${contractName}`);
      return;
    }

    contractNetwork.codeId = await storeCodeByWalletData(walletData, filePath, memo, { gasLimit: storeCoreGasLimit });
    writeAble && typeof writeFunc === "function" && writeFunc(network, walletData.chainId);
  }
  if (contractNetwork?.codeId > 0) {
    const admin = contractConfig?.admin || walletData.address;
    const label = contractConfig?.label || defaultLabel || contractName || "deploy contract";
    const initMsg = defaultInitMsg || Object.assign({}, contractConfig?.initMsg);
    contractNetwork.address = await instantiateContractByWalletData(walletData, admin, contractNetwork.codeId, initMsg, label, defaultFunds, { gasLimit: instantiateGasLimit });
    writeAble && typeof writeFunc === "function" && writeFunc(network, walletData.chainId);
    contractConfig.deploy = true;
  }
  console.log(`\n  [contractName]: `, contractName, JSON.stringify(contractNetwork));
}

export async function queryContractQueryConfig(walletData: WalletData, deployContract: ContractDeployed, print: boolean = true): Promise<{ initFlag; config }> {
  if (!deployContract?.address) {
    return;
  }
  let config = null;
  let initFlag = true;
  try {
    print && console.log(`\n  Query deployed.address config enter. address: ${deployContract.address}`);
    config = await queryWasmContractByWalletData(walletData, deployContract.address, { query_config: {} });
    print && console.log(`Query deployed.address config ok. address: ${deployContract.address} \n  ${JSON.stringify(config)}`);
  } catch (error: any) {
    if (error?.toString().includes("addr_humanize")) {
      initFlag = false;
      console.error(`\n  deployed.config: need update config`);
    } else {
      throw new Error(error);
    }
  }
  return { initFlag, config };
}

/**
 * Returns an error message for invalid addresses.
 * Returns null of there is no error.
 *
 * If `chainAddressPrefix` is null, the prefix check will be skipped.
 */
export const checkAddress = (input: string, chainAddressPrefix: string | null) => {
  if (!input) return "Empty";

  let data;
  let prefix;
  try {
    ({ data, prefix } = fromBech32(input));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return error.toString();
  }

  if (chainAddressPrefix) {
    if (!prefix.startsWith(chainAddressPrefix)) {
      return `Expected address prefix '${chainAddressPrefix}' but got '${prefix}'`;
    }
  } else {
    // any prefix is allowed
  }

  if (data.length !== 20 && data.length !== 32) {
    return "Invalid address length in bech32 data. Expected 20 or 32 bytes.";
  }

  return null;
};

export const BnAdd = (a: any, b: any): string => {
  if (!a && !b) return "0";
  return new Decimal(a || 0).add(b || 0).toString();
};

export const BnSub = (a: any, b: any): string => {
  if (!a && !b) return "0";
  return new Decimal(a || 0).sub(b || 0).toString();
};

export const BnMul = (a: any, factor: any): string => {
  if (!a || (!factor && typeof factor !== "number")) {
    return "0";
  }
  return new Decimal(a || 0).mul(factor || 0).toString();
};

export const BnDiv = (a: any, b: any): string => {
  if (!b || b === "0") return "";
  return new Decimal(a || 0).div(b).toString();
};

export const BnPow = (a: any, b: string | number): string => {
  return new Decimal(a).toPower(b).toString();
};

export const BnComparedTo = (a: any, b: any): number => {
  return new Decimal(a).comparedTo(new Decimal(b));
};

export const MsgTypeUrls = {
  Send: "/cosmos.bank.v1beta1.MsgSend",
  SetWithdrawAddress: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
  WithdrawDelegatorReward: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  BeginRedelegate: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  Delegate: "/cosmos.staking.v1beta1.MsgDelegate",
  Undelegate: "/cosmos.staking.v1beta1.MsgUndelegate",
  CreateVestingAccount: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
  Transfer: "/ibc.applications.transfer.v1.MsgTransfer",
  Upload: "/cosmwasm.wasm.v1.MsgStoreCode",
  Instantiate: "/cosmwasm.wasm.v1.MsgInstantiateContract",
  Instantiate2: "/cosmwasm.wasm.v1.MsgInstantiateContract2",
  UpdateAdmin: "/cosmwasm.wasm.v1.MsgUpdateAdmin",
  ClearAdmin: "/cosmwasm.wasm.v1.MsgClearAdmin",
  Migrate: "/cosmwasm.wasm.v1.MsgMigrateContract",
  Execute: "/cosmwasm.wasm.v1.MsgExecuteContract"
} as const;

export type MsgTypeUrl = (typeof MsgTypeUrls)[keyof typeof MsgTypeUrls];

export const MsgCodecs = {
  [MsgTypeUrls.Send]: MsgSend,
  [MsgTypeUrls.SetWithdrawAddress]: MsgSetWithdrawAddress,
  [MsgTypeUrls.WithdrawDelegatorReward]: MsgWithdrawDelegatorReward,
  [MsgTypeUrls.BeginRedelegate]: MsgBeginRedelegate,
  [MsgTypeUrls.Delegate]: MsgDelegate,
  [MsgTypeUrls.Undelegate]: MsgUndelegate,
  [MsgTypeUrls.CreateVestingAccount]: MsgCreateVestingAccount,
  [MsgTypeUrls.Transfer]: MsgTransfer,
  [MsgTypeUrls.Upload]: MsgStoreCode,
  [MsgTypeUrls.Instantiate]: MsgInstantiateContract,
  // [MsgTypeUrls.Instantiate2]: MsgInstantiateContract2,
  [MsgTypeUrls.UpdateAdmin]: MsgUpdateAdmin,
  [MsgTypeUrls.ClearAdmin]: MsgClearAdmin,
  [MsgTypeUrls.Migrate]: MsgMigrateContract,
  [MsgTypeUrls.Execute]: MsgExecuteContract
};

const gasOfMsg = (msgType: MsgTypeUrl): number => {
  switch (msgType) {
    case MsgTypeUrls.Send:
      return 100_000;
    case MsgTypeUrls.SetWithdrawAddress:
      return 100_000;
    case MsgTypeUrls.WithdrawDelegatorReward:
      return 100_000;
    case MsgTypeUrls.BeginRedelegate:
      return 150_000;
    case MsgTypeUrls.Delegate:
      return 150_000;
    case MsgTypeUrls.Undelegate:
      return 150_000;
    case MsgTypeUrls.CreateVestingAccount:
      return 100_000;
    case MsgTypeUrls.Transfer:
      return 180_000;
    case MsgTypeUrls.Execute:
      return 100_000;
    default:
      throw new Error("Unknown msg type");
  }
};

export const gasOfTx = (msgTypes: readonly MsgTypeUrl[]): number => {
  const txFlatGas = 100_000;
  return msgTypes.reduce((acc, msgType) => acc + gasOfMsg(msgType), txFlatGas);
};

export const sendTokensMsgEncodeObject = (senderAddress: string, recipientAddress: string, amount: readonly Coin[]): MsgSendEncodeObject[] => {
  const typeUrl = MsgTypeUrls.Send;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        fromAddress: senderAddress,
        toAddress: recipientAddress,
        amount: [...amount]
      })
    }
  ];
};

export const executeMsgEncodeObject = (senderAddress: string, contractAddress: string, msg: JsonObject, funds?: readonly Coin[]): MsgExecuteContractEncodeObject[] => {
  const instruction: ExecuteInstruction = { contractAddress, msg, funds };
  return executeMultipleMsgEncodeObject(senderAddress, [instruction]);
};

export const executeMultipleMsgEncodeObject = (senderAddress: string, instructions: readonly ExecuteInstruction[]): MsgExecuteContractEncodeObject[] => {
  const typeUrl = MsgTypeUrls.Execute;
  return instructions.map(i => ({
    typeUrl,
    value: MsgCodecs[typeUrl].fromPartial({
      sender: senderAddress,
      contract: i.contractAddress,
      msg: toUtf8(JSON.stringify(i.msg)),
      funds: [...(i.funds || [])]
    })
  }));
};

export const uploadMsgEncodeObject = (senderAddress: string, wasmCode: Uint8Array): MsgStoreCodeEncodeObject[] => {
  const compressed = pako.gzip(wasmCode, { level: 9 });
  const typeUrl = MsgTypeUrls.Upload;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        sender: senderAddress,
        wasmByteCode: compressed
      })
    }
  ];
};

export const instantiateMsgEncodeObject = (senderAddress: string, codeId: number, msg: JsonObject, label: string, options: InstantiateOptions = {}): MsgInstantiateContractEncodeObject[] => {
  const typeUrl = MsgTypeUrls.Instantiate;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        sender: senderAddress,
        codeId: Long.fromString(new Uint53(codeId).toString()),
        label: label,
        msg: toUtf8(JSON.stringify(msg)),
        funds: [...(options.funds || [])],
        admin: options.admin
      })
    }
  ];
};

export const migrateMsgEncodeObject = (senderAddress: string, contractAddress: string, codeId: number, migrateMsg: JsonObject): MsgMigrateContractEncodeObject[] => {
  const typeUrl = MsgTypeUrls.Migrate;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        sender: senderAddress,
        contract: contractAddress,
        codeId: Long.fromString(new Uint53(codeId).toString()),
        msg: toUtf8(JSON.stringify(migrateMsg))
      })
    }
  ];
};

export const updateAdminMsgEncodeObject = (senderAddress: string, contractAddress: string, newAdmin: string): MsgUpdateAdminEncodeObject[] => {
  const typeUrl = MsgTypeUrls.UpdateAdmin;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        sender: senderAddress,
        contract: contractAddress,
        newAdmin: newAdmin
      })
    }
  ];
};

export const clearAdminMsgEncodeObject = (senderAddress: string, contractAddress: string): MsgClearAdminEncodeObject[] => {
  const typeUrl = MsgTypeUrls.ClearAdmin;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        sender: senderAddress,
        contract: contractAddress
      })
    }
  ];
};

export const delegateMsgEncodeObject = (delegatorAddress: string, validatorAddress: string, amount: Coin): MsgDelegateEncodeObject[] => {
  const typeUrl = MsgTypeUrls.Delegate;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress,
        amount
      })
    }
  ];
};

export const undelegateMsgEncodeObject = (delegatorAddress: string, validatorAddress: string, amount: Coin): MsgUndelegateEncodeObject[] => {
  const typeUrl = MsgTypeUrls.Undelegate;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress,
        amount
      })
    }
  ];
};

export const withdrawDelegatorRewardMsgEncodeObject = (delegatorAddress: string, validatorAddress: string): MsgWithdrawDelegatorRewardEncodeObject[] => {
  const typeUrl = MsgTypeUrls.WithdrawDelegatorReward;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        delegatorAddress,
        validatorAddress
      })
    }
  ];
};

export const sendIbcTokensMsgEncodeObject = (
  senderAddress: string,
  recipientAddress: string,
  transferAmount: Coin,
  sourcePort: string,
  sourceChannel: string,
  timeoutHeight: Height | undefined,
  /** timeout in seconds */
  timeoutTimestamp: number | undefined
): MsgTransferEncodeObject[] => {
  const timeoutTimestampNanoseconds = timeoutTimestamp ? Long.fromNumber(timeoutTimestamp).multiply(1_000_000_000) : undefined;

  const typeUrl = MsgTypeUrls.Transfer;
  return [
    {
      typeUrl,
      value: MsgCodecs[typeUrl].fromPartial({
        sourcePort: sourcePort,
        sourceChannel: sourceChannel,
        sender: senderAddress,
        receiver: recipientAddress,
        token: transferAmount,
        timeoutHeight: timeoutHeight,
        timeoutTimestamp: timeoutTimestampNanoseconds
      })
    }
  ];
};
