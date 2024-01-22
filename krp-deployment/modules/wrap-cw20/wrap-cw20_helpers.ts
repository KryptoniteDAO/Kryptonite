import { deployContract, readArtifact, writeArtifact } from "@/common.ts";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data.ts";
import { WRAP_CW20_ARTIFACTS_PATH, WRAP_CW20_MODULE_NAME } from "@/modules/wrap-cw20/wrap-cw20_constants.ts";
import { WrapCw20ContractsConfig, WrapCw20ContractsDeployed } from "@/modules/wrap-cw20/wrap-cw20_types.ts";
import {
  ContractsDeployed,
  ContractsDeployedModules,
  writeDeployedContracts
} from "@/modules";
import { BaseContractConfig, WalletData } from "@/types";

export const wrapCw20Configs: WrapCw20ContractsConfig = readArtifact(`${WRAP_CW20_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${WRAP_CW20_MODULE_NAME}/`);


export function getWrapCw20DeployFileName(chainId: string): string {
  return `deployed_${WRAP_CW20_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function wrapCw20ReadArtifact(chainId: string): WrapCw20ContractsDeployed {
  return readArtifact(getWrapCw20DeployFileName(chainId), WRAP_CW20_ARTIFACTS_PATH) as WrapCw20ContractsDeployed;
}

export function wrapCw20Artifact(merkleNetwork: WrapCw20ContractsDeployed, chainId: string): void {
  writeArtifact(merkleNetwork, getWrapCw20DeployFileName(chainId), WRAP_CW20_ARTIFACTS_PATH);
}

export async function deployWrapCw20(walletData: WalletData, network: ContractsDeployed): Promise<void> {
  const { tokenNetwork } = network;
  const contractName: keyof Required<WrapCw20ContractsDeployed> = "wrapCw20";
  const config: BaseContractConfig | undefined = wrapCw20Configs?.[contractName];
  const cw20_token_address = config?.initMsg?.cw20_token_address || tokenNetwork?.platToken?.address;
  const owner = config?.initMsg?.owner || walletData?.activeWallet.address;
  // check fund and ve_token
  if (!cw20_token_address) {
    console.error(`deployWrapCw20VeDrop: fund or cw20_token_address is not specified`);
    return;
  }

  const defaultInitMsg: object | undefined = Object.assign({}, config?.initMsg ?? {},
    {
      owner: owner,
      cw20_token_address: cw20_token_address
    });



  const writeFunc = writeDeployedContracts;
  const contractPath: string = `${ContractsDeployedModules.wrapCw20}.${contractName}`;

  await deployContract(walletData, contractPath, network, undefined, config, { defaultInitMsg, writeFunc });

}


export async function printDeployedWrapCw20Contracts(wrapCw20Network: WrapCw20ContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed contracts info: ${WRAP_CW20_MODULE_NAME} --- ---`);
  const tableData = [
    {
      name: wrapCw20Configs.wrapCw20,
      deploy: wrapCw20Configs?.wrapCw20?.deploy ?? false,
      codeId: wrapCw20Network?.wrapCw20?.codeId || 0,
      address: wrapCw20Network?.wrapCw20?.address
    }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);
}


