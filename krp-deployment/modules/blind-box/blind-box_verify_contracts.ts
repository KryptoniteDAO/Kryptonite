import type { ContractDeployed, WalletData } from "@/types";
import type { BlindBoxContractsDeployed } from "@/modules";
import { loadingWalletData } from "@/env_data";
import { printChangeBalancesByWalletData } from "@/common";
import { blindBoxReadArtifact, printDeployedBlindBoxContracts } from "@/modules";
import { blindBoxContracts } from "@/contracts";
import { BlindBoxConfigLevelResponse, BlindBoxConfigResponse, ReferralRewardConfigResponse } from "@/contracts/blind-box/BlindBox.types";
import { AllConfigAndStateResponse } from "@/contracts/blind-box/BlindBoxReward.types";
import { ConfigAndStateResponse } from "@/contracts/blind-box/BlindBoxInviterReward.types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- verify deployed blindBox contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkBlindBox = blindBoxReadArtifact(walletData.chainId) as BlindBoxContractsDeployed;

  await printDeployedBlindBoxContracts(networkBlindBox);

  const blindBox: ContractDeployed = networkBlindBox?.blindBox;
  const blindBoxReward: ContractDeployed = networkBlindBox?.blindBoxReward;
  const blindBoxInviterReward: ContractDeployed = networkBlindBox?.blindBoxInviterReward;
  const doFunc: boolean = true;

  if (blindBox?.address) {
    const blindBoxQueryClient = new blindBoxContracts.BlindBox.BlindBoxQueryClient(walletData.signingCosmWasmClient, blindBox.address);
    const configRes: BlindBoxConfigResponse = await blindBoxQueryClient.queryBlindBoxConfig();
    console.log(`\n  Query blindBox.blindBox config ok. \n   ${JSON.stringify(configRes)}`);
    const referralRewardConfigResponse: ReferralRewardConfigResponse = await blindBoxQueryClient.queryAllReferralRewardConfig();
    console.log(`\n  Query blindBox.blindBox AllReferralRewardConfig ok. \n   ${JSON.stringify(referralRewardConfigResponse)}`);
    const configLevelRes: BlindBoxConfigLevelResponse = await blindBoxQueryClient.queryBlindBoxConfigLevel({ index: 0 });
    console.log(`\n  Query blindBox.blindBox queryBlindBoxConfigLevel ok. \n   ${JSON.stringify(configLevelRes)}`);
  }

  if (blindBoxReward?.address) {
    const blindBoxRewardQueryClient = new blindBoxContracts.BlindBoxReward.BlindBoxRewardQueryClient(walletData.signingCosmWasmClient, blindBoxReward.address);
    const configRes: AllConfigAndStateResponse = await blindBoxRewardQueryClient.queryAllConfigAndState();
    console.log(`\n  Query blindBox.blindBoxReward config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (blindBoxInviterReward?.address) {
    const blindBoxInviterRewardQueryClient = new blindBoxContracts.BlindBoxInviterReward.BlindBoxInviterRewardQueryClient(walletData.signingCosmWasmClient, blindBoxInviterReward.address);
    const configRes: ConfigAndStateResponse = await blindBoxInviterRewardQueryClient.queryAllConfigAndState();
    console.log(`\n  Query blindBox.blindBoxInviterReward queryAllConfigAndState ok. \n   ${JSON.stringify(configRes)}`);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed blindBox contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
