/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface BankPrecompileInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "balance"
      | "balance(address,string)"
      | "decimals"
      | "decimals(string)"
      | "name"
      | "name(string)"
      | "send"
      | "send(address,address,string,uint256)"
      | "supply"
      | "supply(string)"
      | "symbol"
      | "symbol(string)"
      | "sendNative"
      | "sendNative(string)"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "balance",
    values: [AddressLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "balance(address,string)",
    values: [AddressLike, string]
  ): string;
  encodeFunctionData(functionFragment: "decimals", values: [string]): string;
  encodeFunctionData(
    functionFragment: "decimals(string)",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "name", values: [string]): string;
  encodeFunctionData(
    functionFragment: "name(string)",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "send",
    values: [AddressLike, AddressLike, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "send(address,address,string,uint256)",
    values: [AddressLike, AddressLike, string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "supply", values: [string]): string;
  encodeFunctionData(
    functionFragment: "supply(string)",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values: [string]): string;
  encodeFunctionData(
    functionFragment: "symbol(string)",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "sendNative", values: [string]): string;
  encodeFunctionData(
    functionFragment: "sendNative(string)",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "balance", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "balance(address,string)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "decimals(string)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "name(string)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "send", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "send(address,address,string,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "supply", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supply(string)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "symbol(string)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sendNative", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "sendNative(string)",
    data: BytesLike
  ): Result;
}

export interface BankPrecompile extends BaseContract {
  connect(runner?: ContractRunner | null): BankPrecompile;
  waitForDeployment(): Promise<this>;

  interface: BankPrecompileInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  balance: TypedContractMethod<
    [acc: AddressLike, denom: string],
    [bigint],
    "view"
  >;

  "balance(address,string)": TypedContractMethod<
    [acc: AddressLike, denom: string],
    [bigint],
    "view"
  >;

  decimals: TypedContractMethod<[denom: string], [bigint], "view">;

  "decimals(string)": TypedContractMethod<[denom: string], [bigint], "view">;

  name: TypedContractMethod<[denom: string], [string], "view">;

  "name(string)": TypedContractMethod<[denom: string], [string], "view">;

  send: TypedContractMethod<
    [
      fromAddress: AddressLike,
      toAddress: AddressLike,
      denom: string,
      amount: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;

  "send(address,address,string,uint256)": TypedContractMethod<
    [
      fromAddress: AddressLike,
      toAddress: AddressLike,
      denom: string,
      amount: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;

  supply: TypedContractMethod<[denom: string], [bigint], "view">;

  "supply(string)": TypedContractMethod<[denom: string], [bigint], "view">;

  symbol: TypedContractMethod<[denom: string], [string], "view">;

  "symbol(string)": TypedContractMethod<[denom: string], [string], "view">;

  sendNative: TypedContractMethod<
    [toNativeAddress: string],
    [boolean],
    "payable"
  >;

  "sendNative(string)": TypedContractMethod<
    [toNativeAddress: string],
    [boolean],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "balance"
  ): TypedContractMethod<[acc: AddressLike, denom: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "balance(address,string)"
  ): TypedContractMethod<[acc: AddressLike, denom: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[denom: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "decimals(string)"
  ): TypedContractMethod<[denom: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[denom: string], [string], "view">;
  getFunction(
    nameOrSignature: "name(string)"
  ): TypedContractMethod<[denom: string], [string], "view">;
  getFunction(
    nameOrSignature: "send"
  ): TypedContractMethod<
    [
      fromAddress: AddressLike,
      toAddress: AddressLike,
      denom: string,
      amount: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "send(address,address,string,uint256)"
  ): TypedContractMethod<
    [
      fromAddress: AddressLike,
      toAddress: AddressLike,
      denom: string,
      amount: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supply"
  ): TypedContractMethod<[denom: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "supply(string)"
  ): TypedContractMethod<[denom: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "symbol"
  ): TypedContractMethod<[denom: string], [string], "view">;
  getFunction(
    nameOrSignature: "symbol(string)"
  ): TypedContractMethod<[denom: string], [string], "view">;
  getFunction(
    nameOrSignature: "sendNative"
  ): TypedContractMethod<[toNativeAddress: string], [boolean], "payable">;
  getFunction(
    nameOrSignature: "sendNative(string)"
  ): TypedContractMethod<[toNativeAddress: string], [boolean], "payable">;

  filters: {};
}