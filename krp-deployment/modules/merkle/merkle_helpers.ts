import { deployContract, readArtifact, writeArtifact } from "@/common.ts";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data.ts";
import { MERKLE_ARTIFACTS_PATH, MERKLE_MODULE_NAME } from "@/modules/merkle/merkle_constants.ts";
import { MerkleContractsConfig, MerkleContractsDeployed } from "@/modules/merkle/merkle_types.ts";
import {
  ContractsDeployed,
  ContractsDeployedModules,
  writeDeployedContracts
} from "@/modules";
import { BaseContractConfig, ContractDeployed, WalletData } from "@/types";
import { tokenContracts } from "@/contracts";

export const merkleConfigs: MerkleContractsConfig = readArtifact(`${MERKLE_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${MERKLE_MODULE_NAME}/`);


export function getMerkleDeployFileName(chainId: string): string {
  return `deployed_${MERKLE_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function merkleReadArtifact(chainId: string): MerkleContractsDeployed {
  return readArtifact(getMerkleDeployFileName(chainId), MERKLE_ARTIFACTS_PATH) as MerkleContractsDeployed;
}

export function merkleWriteArtifact(merkleNetwork: MerkleContractsDeployed, chainId: string): void {
  writeArtifact(merkleNetwork, getMerkleDeployFileName(chainId), MERKLE_ARTIFACTS_PATH);
}

export async function deployMerkleVeDrop(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { tokenNetwork } = network;
  const contractName: keyof Required<MerkleContractsDeployed> = "merkleVeDrop";
  const config: BaseContractConfig | undefined = merkleConfigs?.[contractName];
  const fund = config?.initMsg?.fund || tokenNetwork?.fund?.address;
  const ve_token = config?.initMsg?.ve_token || tokenNetwork?.veToken?.address;
  // check fund and ve_token
  if (!fund || !ve_token) {
    console.error(`deployMerkleVeDrop: fund or ve_token is not specified`);
    return;
  }

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {},
    {
      fund: fund,
      ve_token: ve_token
    });



  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.merkle}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });

}


export async function printDeployedMerkleContracts(merkleNetwork: MerkleContractsDeployed): Promise<any> {
  console.log(`\n  --- --- deployed contracts info: ${MERKLE_MODULE_NAME} --- ---`);
  const contractNames: string[] = Object.keys(merkleNetwork);
  if (!contractNames || contractNames.length <= 0) {
    return;
  }
  const config: MerkleContractsConfig = merkleConfigs;
  const tableData = [];
  for (const contractName of contractNames) {
    tableData.push({
      name: contractName,
      deploy: config?.[contractName]?.deploy ?? false,
      codeId: merkleNetwork?.[contractName]?.codeId || 0,
      address: merkleNetwork?.[contractName]?.address
    });
  }
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}



export async function doTokenFundSetVeFundMinter(walletData: WalletData, fund: ContractDeployed, merkleVeDrop: ContractDeployed, isVeMinter: boolean, print: boolean = true): Promise<any> {
  print && console.log(`\n  Do ${MERKLE_MODULE_NAME}.fund SetVeFundMinter enter. merkle ve drop: ${merkleVeDrop?.address} / ${isVeMinter}`);
  if (!fund?.address || !merkleVeDrop?.address) {
    console.error(`\n  ********* missing info!`);
    return;
  }
  const fundClient = new tokenContracts.Fund.FundClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, fund.address);
  const fundQueryClient = new tokenContracts.Fund.FundQueryClient(walletData?.activeWallet?.signingCosmWasmClient, fund.address);

  let beforeRes: Boolean = null;
  let initFlag: boolean = true;
  try {
    beforeRes = await fundQueryClient.isVeFundMinter({ minter: merkleVeDrop.address });
  } catch (error: any) {
    if (error?.toString().includes("minter not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${MERKLE_MODULE_NAME}.fund: need SetVeFundMinter.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && beforeRes === isVeMinter) {
    console.warn(`\n  ######### The ${MERKLE_MODULE_NAME}.fund minter is already done.`);
    return;
  }
  const doRes = await fundClient.setVeFundMinter({ minter: merkleVeDrop.address, isVeMinter });
  console.log(`  Do ${MERKLE_MODULE_NAME}.fund setMinters ok. \n  ${doRes?.transactionHash}`);

  const afterRes = await fundQueryClient.isVeFundMinter({ minter: merkleVeDrop.address });
  print && console.log(`  after ${MERKLE_MODULE_NAME}.fund isVeFundMinter: ${JSON.stringify(afterRes)}`);
}
