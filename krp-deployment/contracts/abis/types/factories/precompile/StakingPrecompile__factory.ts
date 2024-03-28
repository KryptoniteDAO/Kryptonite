/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  StakingPrecompile,
  StakingPrecompileInterface,
} from "../../precompile/StakingPrecompile";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "valAddress",
        type: "string",
      },
    ],
    name: "delegate",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "srcAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "dstAddress",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "redelegate",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "valAddress",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "undelegate",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class StakingPrecompile__factory {
  static readonly abi = _abi;
  static createInterface(): StakingPrecompileInterface {
    return new Interface(_abi) as StakingPrecompileInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): StakingPrecompile {
    return new Contract(address, _abi, runner) as unknown as StakingPrecompile;
  }
}
