import { BaseContractConfig, ContractDeployed } from "@/types";

import type { InstantiateMsg as MerkleInstantiateMsg } from "@/contracts/merkle/MerkleVeDrop.types";
export interface MerkleVeDropContractConfig extends BaseContractConfig {
  initMsg?: MerkleInstantiateMsg;
}


export interface MerkleContractsConfig {
  merkleVeDrop: MerkleVeDropContractConfig;
}

export interface MerkleContractsDeployed {
  merkleVeDrop?: ContractDeployed;
}
