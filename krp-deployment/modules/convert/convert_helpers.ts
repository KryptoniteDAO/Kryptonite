import { instantiateContractByWalletData, readArtifact, storeCodeByWalletData, writeArtifact } from "@/common";
import { convertContracts } from "@/contracts";
import { ConfigResponse } from "@/contracts/convert/BassetConverter.types";
import { BAssetInfo } from "@/contracts/market/CustodyBase.types";
import { DEPLOY_CHAIN_ID, DEPLOY_VERSION } from "@/env_data";
import type { ContractsDeployed, ConvertContractsConfig, ConvertContractsDeployed, ConvertPairsConfig } from "@/modules";
import { ContractsDeployedModules, writeDeployedContracts } from "@/modules";
import type { ContractDeployed, WalletData } from "@/types";
import { CONVERT_ARTIFACTS_PATH, CONVERT_MODULE_NAME } from "./convert_constants";

export const convertConfigs: ConvertContractsConfig = readArtifact(`${CONVERT_MODULE_NAME}_config_${DEPLOY_CHAIN_ID}`, `./modules/${CONVERT_MODULE_NAME}/`);

export function getConvertDeployFileName(chainId: string): string {
  return `deployed_${CONVERT_MODULE_NAME}_${DEPLOY_VERSION}_${chainId}`;
}

export function convertReadArtifact(chainId: string): ConvertContractsDeployed {
  return readArtifact(getConvertDeployFileName(chainId), CONVERT_ARTIFACTS_PATH) as ConvertContractsDeployed;
}

export function convertWriteArtifact(marketNetwork: ConvertContractsDeployed, chainId: string): void {
  writeArtifact(marketNetwork, getConvertDeployFileName(chainId), CONVERT_ARTIFACTS_PATH);
}

export async function deployConvertPairConverter(walletData: WalletData, network: ContractsDeployed, convertPairsConfig: ConvertPairsConfig): Promise<void> {
  const nativeDenom: string = convertPairsConfig?.assets?.nativeDenom;
  if (!nativeDenom) {
    console.error(`\n  ********* deploy error: missing info. deployConvertPairConverter / unknown configuration of native denom ${nativeDenom}`);
    return;
  }
  let convertNetwork = network?.[ContractsDeployedModules.convert];
  if (!convertNetwork) {
    convertNetwork = {};
    network.convertNetwork = convertNetwork;
  }
  let convertPairsNetwork = convertNetwork?.convertPairs?.find?.((v: any) => nativeDenom === v.native_denom);
  if (!convertNetwork?.convertPairs) {
    convertNetwork.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { name: convertPairsConfig?.name, native_denom: nativeDenom };
    convertNetwork.convertPairs.push(convertPairsNetwork);
  }
  if (!convertPairsNetwork?.converter?.address) {
    if (!convertPairsNetwork?.converter) {
      convertPairsNetwork.converter = {};
    }

    if (!convertPairsNetwork?.converter?.codeId || convertPairsNetwork?.converter?.codeId <= 0) {
      const filePath = convertPairsConfig?.converter?.filePath || "../krp-basset-convert/artifacts/krp_basset_converter.wasm";
      convertPairsNetwork.converter.codeId = await storeCodeByWalletData(walletData, filePath);
      writeDeployedContracts(network, walletData.chainId);
    }
    if (convertPairsNetwork?.converter?.codeId > 0) {
      const admin = convertPairsConfig?.converter?.admin || walletData?.activeWallet?.address;
      const label = convertPairsConfig?.converter?.label;
      const initMsg = Object.assign({}, convertPairsConfig?.converter?.initMsg, {
        owner: convertPairsConfig?.converter?.initMsg?.owner || walletData?.activeWallet?.address
      });
      convertPairsNetwork.converter.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.converter.codeId, initMsg, label);
      writeDeployedContracts(network, walletData.chainId);
      convertPairsConfig.converter.deploy = true;
    }
    console.log(convertPairsNetwork?.converter?.codeId, ` converter: `, JSON.stringify(convertPairsNetwork?.converter));
  }
}

export async function deployConvertPairBAssetsToken(walletData: WalletData, network: ContractsDeployed, convertPairsConfig: ConvertPairsConfig): Promise<void> {
  const { stakingNetwork } = network
  const nativeDenom: string = convertPairsConfig?.assets?.nativeDenom;
  if (!nativeDenom) {
    console.error(`\n  ********* deploy error: missing info. deployConvertPairBAssetsToken / unknown configuration of native denom ${nativeDenom}`);
    return;
  }
  let convertNetwork = network?.[ContractsDeployedModules.convert];
  if (!convertNetwork) {
    convertNetwork = {};
    network.convertNetwork = convertNetwork;
  }
  let convertPairsNetwork = convertNetwork?.convertPairs?.find?.((v: any) => nativeDenom === v.native_denom);
  if (!convertNetwork?.convertPairs) {
    convertNetwork.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { name: convertPairsConfig?.name, native_denom: nativeDenom };
    convertNetwork.convertPairs.push(convertPairsNetwork);
  }
  const converter = convertPairsNetwork?.converter;
  if (!converter?.address) {
    console.error(`\n  ********* deploy error: please deploy converter first of `, nativeDenom);
    return;
  }
  if (!convertPairsNetwork?.bAssetsToken?.address) {
    if (!convertPairsNetwork?.bAssetsToken) {
      convertPairsNetwork.bAssetsToken = {};
    }

    if (!convertPairsNetwork?.bAssetsToken?.codeId || convertPairsNetwork?.bAssetsToken?.codeId <= 0) {
      const filePath = convertPairsConfig?.bAssetsToken?.filePath || "../krp-basset-convert/artifacts/krp_basset_token.wasm";
      convertPairsNetwork.bAssetsToken.codeId = await storeCodeByWalletData(walletData, filePath);
      writeDeployedContracts(network, walletData.chainId);
    }
    if (convertPairsNetwork?.bAssetsToken?.codeId > 0) {
      const admin = convertPairsConfig?.bAssetsToken?.admin || walletData?.activeWallet?.address;
      const label = convertPairsConfig?.bAssetsToken?.label;
      const initMsg = Object.assign(
        {
          reward_contract: stakingNetwork?.reward?.address ?? walletData?.activeWallet?.address,
          mint: converter.address
        },
        convertPairsConfig?.bAssetsToken?.initMsg
      );
      convertPairsNetwork.bAssetsToken.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.bAssetsToken.codeId, initMsg, label);
      writeDeployedContracts(network, walletData.chainId);
      convertPairsConfig.bAssetsToken.deploy = true;
    }
    console.log(`\n  ${convertPairsNetwork?.bAssetsToken?.codeId}, bAssetsToken: `, JSON.stringify(convertPairsNetwork?.bAssetsToken));
  }
}

export async function deployConvertPairCustodyBAssets(
  walletData: WalletData,
  network: ContractsDeployed,
  convertPairsConfig: ConvertPairsConfig,
  reward: ContractDeployed,
  market: ContractDeployed,
  overseer: ContractDeployed,
  liquidationQueue: ContractDeployed,
  swapSparrow: ContractDeployed,
  stable_coin_denom: string
): Promise<void> {
  const nativeDenom: string = convertPairsConfig?.assets?.nativeDenom;
  if (!nativeDenom) {
    console.error(`\n  ********* deploy error: missing info. deployConvertPairCustodyBAssets / unknown configuration of native denom ${nativeDenom}`);
    return;
  }
  if (!reward?.address || !market?.address || !overseer?.address || !liquidationQueue?.address || !swapSparrow?.address || !stable_coin_denom) {
    console.error(`\n  ********* deploy error: missing info. deployConvertPairCustodyBAssets / ${nativeDenom} / ${reward?.address} / ${market?.address} / ${overseer?.address} / ${liquidationQueue?.address} / ${swapSparrow?.address} / ${stable_coin_denom}`);
    return;
  }
  let convertNetwork = network?.[ContractsDeployedModules.convert];
  if (!convertNetwork) {
    convertNetwork = {};
    network.convertNetwork = convertNetwork;
  }

  let convertPairsNetwork = convertNetwork?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
  if (!convertNetwork?.convertPairs) {
    convertNetwork.convertPairs = [];
  }
  if (!convertPairsNetwork) {
    convertPairsNetwork = { name: convertPairsConfig?.name, native_denom: nativeDenom };
    convertNetwork.convertPairs.push(convertPairsNetwork);
  }
  const bAssetsToken = convertPairsNetwork?.bAssetsToken;
  if (!bAssetsToken?.address) {
    console.error(`\n  ********* please deploy bAssetsToken first of `, nativeDenom);
    return;
  }
  if (!convertPairsNetwork?.custody?.address) {
    if (!convertPairsNetwork?.custody) {
      convertPairsNetwork.custody = {};
    }

    if (!convertPairsNetwork?.custody?.codeId || convertPairsNetwork?.custody?.codeId <= 0) {
      const filePath = convertPairsConfig?.custody?.filePath || "../krp-market-contracts/artifacts/moneymarket_custody_base.wasm";
      convertPairsNetwork.custody.codeId = await storeCodeByWalletData(walletData, filePath);
      writeDeployedContracts(network, walletData.chainId);
    }
    if (convertPairsNetwork?.custody?.codeId > 0) {
      const admin = convertPairsConfig?.custody?.admin || walletData?.activeWallet?.address;
      const label = convertPairsConfig?.custody?.label;
      const basset_info: BAssetInfo = {
        name: convertPairsConfig?.bAssetsToken?.initMsg?.name || convertPairsConfig?.custody?.initMsg?.basset_info?.name,
        symbol: convertPairsConfig?.bAssetsToken?.initMsg?.symbol || convertPairsConfig?.custody?.initMsg?.basset_info?.symbol,
        decimals: convertPairsConfig?.bAssetsToken?.initMsg?.decimals || convertPairsConfig?.custody?.initMsg?.basset_info?.decimals
      };
      const initMsg = Object.assign(
        {
          collateral_token: bAssetsToken.address,
          liquidation_contract: liquidationQueue?.address ?? walletData?.activeWallet?.address,
          market_contract: market?.address ?? walletData?.activeWallet?.address,
          overseer_contract: overseer?.address ?? walletData?.activeWallet?.address,
          reward_contract: reward?.address ?? walletData?.activeWallet?.address,
          stable_denom: stable_coin_denom ?? walletData?.activeWallet?.address,
          swap_contract: swapSparrow?.address ?? walletData?.activeWallet?.address,
          swap_denoms: [walletData?.nativeCurrency?.coinMinimalDenom]
        },
        convertPairsConfig?.custody?.initMsg,
        {
          basset_info: basset_info || convertPairsConfig?.custody?.initMsg?.basset_info,
          owner: convertPairsConfig?.custody?.initMsg?.owner || walletData?.activeWallet?.address
        }
      );

      convertPairsNetwork.custody.address = await instantiateContractByWalletData(walletData, admin, convertPairsNetwork.custody.codeId, initMsg, label);
      writeDeployedContracts(network, walletData.chainId);
      convertPairsConfig.custody.deploy = true;
    }
    console.log(convertPairsNetwork?.custody?.codeId, ` custody: `, JSON.stringify(convertPairsNetwork?.custody));
  }
}

export async function doConverterRegisterTokens(walletData: WalletData, nativeDenom: string, converter: ContractDeployed, bAssetsToken: ContractDeployed, nativeDenomDecimals: number, print: boolean = true): Promise<void> {
  console.warn(`\n  Do ${CONVERT_MODULE_NAME}.converter registerTokens enter. converter: ${converter?.address}`);
  if (!converter?.address || !bAssetsToken?.address || !nativeDenomDecimals) {
    console.error(`\n  ********* missing info`);
    return;
  }

  const converterClient = new convertContracts.BassetConverter.BassetConverterClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, converter.address);
  const converterQueryClient = new convertContracts.BassetConverter.BassetConverterQueryClient(walletData?.activeWallet?.signingCosmWasmClient, converter.address);

  let configRes: ConfigResponse = null;
  let initFlag: boolean = true;
  try {
    configRes = await converterQueryClient.config();
  } catch (error: any) {
    if (error?.toString().includes("config not found")) {
      initFlag = false;
      console.warn(`\n  ######### ${CONVERT_MODULE_NAME}.converter: need config.`);
    } else {
      throw new Error(error);
    }
  }

  if (initFlag && nativeDenom === configRes?.native_denom && bAssetsToken.address === configRes?.basset_token_address) {
    console.warn(`\n  ######### ${CONVERT_MODULE_NAME}.converter registerTokens is already done. \n  ${JSON.stringify(configRes)}`);
    return;
  }

  const doRes = await converterClient.registerTokens({
    nativeDenom,
    bassetTokenAddress: bAssetsToken?.address,
    denomDecimals: nativeDenomDecimals
  });

  print && console.log(`\n  Do ${CONVERT_MODULE_NAME}.converter registerTokens ok. \n  ${doRes?.transactionHash}`);
  let afterRes = await converterQueryClient.config();
  print && console.log(`\n  after ${CONVERT_MODULE_NAME}.converter config info. \n  ${JSON.stringify(afterRes)}`);
}

export async function printDeployedConvertContracts(convertNetwork: ConvertContractsDeployed): Promise<void> {
  console.log(`\n  --- --- deployed contracts info: ${CONVERT_MODULE_NAME} --- ---`);

  const tableData = [];
  if (convertNetwork?.convertPairs && convertNetwork?.convertPairs.length > 0) {
    for (let convertPairsNetwork of convertNetwork?.convertPairs) {
      const nativeDenom = convertPairsNetwork?.native_denom;
      const convertPairsConfig: ConvertPairsConfig = convertConfigs?.convertPairs?.find((v: ConvertPairsConfig) => nativeDenom === v?.assets?.nativeDenom);

      const converterData = {
        nativeDenom: nativeDenom,
        name: `converter`,
        deploy: convertPairsConfig?.converter?.deploy,
        codeId: convertPairsNetwork?.converter?.codeId,
        address: convertPairsNetwork?.converter?.address
      };
      const bAssetsTokenData = {
        nativeDenom: nativeDenom,
        name: `bAssetsToken`,
        deploy: convertPairsConfig?.bAssetsToken?.deploy,
        codeId: convertPairsNetwork?.bAssetsToken?.codeId,
        address: convertPairsNetwork?.bAssetsToken?.address
      };
      const custodyData = {
        nativeDenom: nativeDenom,
        name: `custody`,
        deploy: convertPairsConfig?.custody?.deploy,
        codeId: convertPairsNetwork?.custody?.codeId,
        address: convertPairsNetwork?.custody?.address
      };
      tableData.push(converterData, bAssetsTokenData, custodyData);
    }
  }
  console.table(tableData, [`nativeDenom`, `name`, `codeId`, `address`, `deploy`]);
}
