/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  Erc20_bytes32,
  Erc20_bytes32Interface,
} from "../../erc/Erc20_bytes32";

const _abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

export class Erc20_bytes32__factory {
  static readonly abi = _abi;
  static createInterface(): Erc20_bytes32Interface {
    return new Interface(_abi) as Erc20_bytes32Interface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): Erc20_bytes32 {
    return new Contract(address, _abi, runner) as unknown as Erc20_bytes32;
  }
}
