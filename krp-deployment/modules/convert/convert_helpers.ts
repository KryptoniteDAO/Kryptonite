import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, queryWasmContractByWalletData, executeContractByWalletData, printChangeBalancesByWalletData, queryContractConfig } from "../../common";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type { ContractDeployed, WalletData } from "@/types";
import type { ConvertContractsConfig, ConvertContractsDeployed, ConvertPairsConfig } from "@/modules";

export const CONVERT_ARTIFACTS_PATH = "../krp-basset-convert/artifacts";
export const CONVERT_CONTRACTS_PATH = "../krp-basset-convert/contracts";
export const CONVERT_MODULE_NAME = "convert";
export const convertConfigs: ConvertContractsConfig = readArtifact(`${CONVERT_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${CONVERT_MODULE_NAME}/`);

export function getConvertDeployFileName(chainId: string): string {
  return `deployed_${CONVERT_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function convertReadArtifact(chainId: string): ConvertContractsDeployed {
  return readArtifact(getConvertDeployFileName(chainId), CONVERT_ARTIFACTS_PATH) as ConvertContractsDeployed;
}

export function convertWriteArtifact(networkMarket: ConvertContractsDeployed, chainId: string): void {
  writeArtifact(networkMarket, getConvertDeployFileName(chainId), CONVERT_ARTIFACTS_PATH);
}

export async function deployConverter(walletData: WalletData, networkConvert: ConvertContractsDeployed, nativeDenom: string): Promise<void> {
  const convertPairsConfig: ConvertPairsConfig = convertConfigs?.convertPairs?.find((v: ConvertPairsConfig) => nativeDenom === v.native_denom);
  if (!convertPairsConfig) {
    console.error(`unknown configuration of `, nativeDenom);
    return;
  }
  let convertPairsNetwork = networkConvert?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  if (!networkConvert?.convertPairs) {
    networkConvert.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { native_denom: nativeDenom };
    networkConvert.convertPairs.push(convertPairsNetwork);
  }
  if (!convertPairsNetwork?.converter?.address) {
    if (!convertPairsNetwork?.converter) {
      convertPairsNetwork.converter = {};
    }

    if (!convertPairsNetwork?.converter?.codeId || convertPairsNetwork?.converter?.codeId <= 0) {
      const filePath = convertPairsConfig?.converter?.filePath || "../krp-basset-convert/artifacts/krp_basset_converter.wasm";
      convertPairsNetwork.converter.codeId = await storeCodeByWalletData(walletData, filePath);
      convertWriteArtifact(networkConvert, walletData.chainId);
    }
    if (convertPairsNetwork?.converter?.codeId > 0) {
      const admin = convertPairsConfig?.converter?.admin || walletData.address;
      const label = convertPairsConfig?.converter?.label;
      const initMsg = Object.assign({}, convertPairsConfig?.converter?.initMsg, {
        owner: convertPairsConfig?.converter?.initMsg?.owner || walletData.address
      });
      convertPairsNetwork.converter.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.converter.codeId, initMsg, label);
      convertWriteArtifact(networkConvert, walletData.chainId);
      convertPairsConfig.converter.deploy = true;
    }
    console.log(convertPairsNetwork?.converter?.codeId, ` converter: `, JSON.stringify(convertPairsNetwork?.converter));
  }
}

export async function deployBtoken(walletData: WalletData, networkConvert: ConvertContractsDeployed, nativeDenom: string): Promise<void> {
  const convertPairsConfig: ConvertPairsConfig = convertConfigs?.convertPairs?.find((v: ConvertPairsConfig) => nativeDenom === v.native_denom);
  if (!convertPairsConfig) {
    console.error(`unknown configuration of `, nativeDenom);
    return;
  }
  let convertPairsNetwork = networkConvert?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  if (!networkConvert?.convertPairs) {
    networkConvert.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { native_denom: nativeDenom };
    networkConvert.convertPairs.push(convertPairsNetwork);
  }
  const converter = convertPairsNetwork?.converter;
  if (!converter?.address) {
    console.error(`please deploy converter first of `, nativeDenom);
    return;
  }
  if (!convertPairsNetwork?.btoken?.address) {
    if (!convertPairsNetwork?.btoken) {
      convertPairsNetwork.btoken = {};
    }

    if (!convertPairsNetwork?.btoken?.codeId || convertPairsNetwork?.btoken?.codeId <= 0) {
      const filePath = convertPairsConfig?.btoken?.filePath || "../krp-basset-convert/artifacts/krp_basset_token.wasm";
      convertPairsNetwork.btoken.codeId = await storeCodeByWalletData(walletData, filePath);
      convertWriteArtifact(networkConvert, walletData.chainId);
    }
    if (convertPairsNetwork?.btoken?.codeId > 0) {
      const admin = convertPairsConfig?.btoken?.admin || walletData.address;
      const label = convertPairsConfig?.btoken?.label;
      const initMsg = Object.assign(
        {
          mint: converter.address
        },
        convertPairsConfig?.btoken?.initMsg
      );
      convertPairsNetwork.btoken.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.btoken.codeId, initMsg, label);
      convertWriteArtifact(networkConvert, walletData.chainId);
      convertPairsConfig.btoken.deploy = true;
    }
    console.log(`  `, convertPairsNetwork?.btoken?.codeId, ` btoken: `, JSON.stringify(convertPairsNetwork?.btoken));
  }
}

export async function deployCustody(
  walletData: WalletData,
  networkConvert: ConvertContractsDeployed,
  nativeDenom: string,
  reward: ContractDeployed,
  market: ContractDeployed,
  overseer: ContractDeployed,
  liquidationQueue: ContractDeployed,
  swapSparrow: ContractDeployed,
  stable_coin_denom: string
): Promise<void> {
  const convertPairsConfig: ConvertPairsConfig = convertConfigs?.convertPairs?.find((v: ConvertPairsConfig) => nativeDenom === v.native_denom);
  if (!convertPairsConfig) {
    console.error(`\n  ********* unknown configuration of `, nativeDenom);
    return;
  }
  if (!reward?.address || !market?.address || !overseer?.address || !liquidationQueue?.address || !swapSparrow?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info`);
    return;
  }
  let convertPairsNetwork = networkConvert?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  if (!networkConvert?.convertPairs) {
    networkConvert.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { native_denom: nativeDenom };
    networkConvert.convertPairs.push(convertPairsNetwork);
  }
  const btoken = convertPairsNetwork?.btoken;
  if (!btoken?.address) {
    console.error(`\n  ********* please deploy btoken first of `, nativeDenom);
    return;
  }
  if (!convertPairsNetwork?.custody?.address) {
    if (!convertPairsNetwork?.custody) {
      convertPairsNetwork.custody = {};
    }

    if (!convertPairsNetwork?.custody?.codeId || convertPairsNetwork?.custody?.codeId <= 0) {
      const filePath = convertPairsConfig?.custody?.filePath || "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm";
      convertPairsNetwork.custody.codeId = await storeCodeByWalletData(walletData, filePath);
      convertWriteArtifact(networkConvert, walletData.chainId);
    }
    if (convertPairsNetwork?.custody?.codeId > 0) {
      const admin = convertPairsConfig?.custody?.admin || walletData.address;
      const label = convertPairsConfig?.custody?.label;
      const initMsg = Object.assign(
        {
          collateral_token: btoken.address,
          liquidation_contract: liquidationQueue.address,
          market_contract: market.address,
          overseer_contract: overseer.address,
          reward_contract: reward.address,
          stable_denom: stable_coin_denom,
          swap_contract: swapSparrow?.address,
          swap_denoms: [walletData.nativeCurrency.coinMinimalDenom]
        },
        convertPairsConfig?.custody?.initMsg,
        {
          owner: convertPairsConfig?.custody?.initMsg?.owner || walletData.address
        }
      );
      convertPairsNetwork.custody.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.custody.codeId, initMsg, label);
      convertWriteArtifact(networkConvert, walletData.chainId);
      convertPairsConfig.custody.deploy = true;
    }
    console.log(convertPairsNetwork?.custody?.codeId, ` custody: `, JSON.stringify(convertPairsNetwork?.custody));
  }
}

export async function doConverterRegisterTokens(walletData: WalletData, nativeDenom: string, converter: ContractDeployed, btoken: ContractDeployed): Promise<void> {
  console.warn(`\n  Do converter's register_contracts enter`);
  if (!converter?.address || !btoken?.address) {
    console.error(`\n  ********* missing info`);
    return;
  }
  //  {owner: '', native_denom: '', basset_token_address: ''}
  const { config } = await queryContractConfig(walletData, converter, false);
  const doneFlag: boolean = nativeDenom === config?.native_denom && btoken.address === config?.basset_token_address;
  if (!doneFlag) {
    const marketRegisterContractsRes = await executeContractByWalletData(walletData, converter.address, {
      register_tokens: {
        native_denom: nativeDenom,
        basset_token_address: btoken.address
      }
    });
    console.log("Do converter's register_tokens ok. \n", marketRegisterContractsRes?.transactionHash);
    await queryContractConfig(walletData, converter, true);
  }
}

export async function printDeployedConvertContracts(networkConvert: ConvertContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed convert contracts info --- ---`);

  const tableData = [];
  if (networkConvert?.convertPairs && networkConvert?.convertPairs.length > 0) {
    for (let convertPairsNetwork of networkConvert?.convertPairs) {
      const nativeDenom = convertPairsNetwork?.native_denom;
      const convertPairsConfig: ConvertPairsConfig = convertConfigs?.convertPairs?.find((v: ConvertPairsConfig) => nativeDenom === v.native_denom);

      const converterData = {
        nativeDenom: nativeDenom,
        name: `converter`,
        deploy: convertPairsConfig?.converter?.deploy,
        codeId: convertPairsNetwork?.converter?.codeId,
        address: convertPairsNetwork?.converter?.address
      };
      const btokenData = {
        nativeDenom: nativeDenom,
        name: `btoken`,
        deploy: convertPairsConfig?.btoken?.deploy,
        codeId: convertPairsNetwork?.btoken?.codeId,
        address: convertPairsNetwork?.btoken?.address
      };
      const custodyData = {
        nativeDenom: nativeDenom,
        name: `custody`,
        deploy: convertPairsConfig?.custody?.deploy,
        codeId: convertPairsNetwork?.custody?.codeId,
        address: convertPairsNetwork?.custody?.address
      };
      tableData.push(converterData, btokenData, custodyData);
    }
  }
  console.table(tableData, [`nativeDenom`, `name`, `codeId`, `address`, `deploy`]);
}
