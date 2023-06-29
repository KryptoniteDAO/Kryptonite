import { loadingWalletData } from "@/env_data";
import type { ContractDeployed, WalletData } from "@/types";
import type { KptContractsDeployed, StakingRewardsPairsContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { kptReadArtifact } from "./index";
import { printDeployedKptContracts, printDeployedKptStakingContracts } from "@/modules";
import { kptContracts } from "@/contracts";
import { KptFundConfigResponse } from "@/contracts/kpt/KptFund.types";
import { MinterResponse, VoteConfigResponse } from "@/contracts/kpt/VeKpt.types";
import { GetBoostConfigResponse } from "@/contracts/kpt/VeKptBoost.types";
import { StakingConfigResponse, StakingStateResponse } from "@/contracts/kpt/StakingRewards.types";
import { BlindBoxConfigLevelResponse, BlindBoxConfigResponse } from "@/contracts/kpt/BlindBox.types";
import { BlindBoxConfigResponse as BlindBoxRewardConfigResponse } from "@/contracts/kpt/BlindBoxReward.types";
import { BalanceResponse, KptConfigResponse, TokenInfoResponse } from "@/contracts/kpt/Kpt.types";
import { GetMinerConfigResponse, GetMinerStateResponse } from "@/contracts/kpt/VeKptMiner.types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- verify deployed kpt contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;

  await printDeployedKptContracts(networkKpt);

  const kpt: ContractDeployed = networkKpt?.kpt;
  const veKpt: ContractDeployed = networkKpt?.veKpt;
  const kptFund: ContractDeployed = networkKpt?.kptFund;
  const veKptBoost: ContractDeployed = networkKpt?.veKptBoost;
  const veKptMiner: ContractDeployed = networkKpt?.veKptMiner;
  const blindBox: ContractDeployed = networkKpt?.blindBox;
  const blindBoxReward: ContractDeployed = networkKpt?.blindBoxReward;
  const stakingRewardsPairs: StakingRewardsPairsContractsDeployed[] = networkKpt?.stakingRewardsPairs;

  if (kpt?.address) {
    const kptQueryClient = new kptContracts.Kpt.KptQueryClient(walletData.signingCosmWasmClient, kpt.address);
    const kpConfigRes: KptConfigResponse = await kptQueryClient.kptConfig();
    console.log(`\n  Query kpt.kpt config ok. \n   ${JSON.stringify(kpConfigRes)}`);
    const tokenInfoResponse: TokenInfoResponse = await kptQueryClient.tokenInfo();
    console.log(`\n  Query kpt.kpt tokenInfo ok. \n   ${JSON.stringify(tokenInfoResponse)}`);
    const balanceRes: BalanceResponse = await kptQueryClient.balance({ address: walletData.address });
    console.log(`\n  Query kpt.kpt balance ok. \n  ${walletData.address} ${JSON.stringify(balanceRes)}`);
  }

  if (veKpt?.address) {
    const veKptQueryClient = new kptContracts.VeKpt.VeKptQueryClient(walletData.signingCosmWasmClient, veKpt.address);
    const configRes: VoteConfigResponse = await veKptQueryClient.voteConfig();
    console.log(`\n  Query kpt.veKpt config ok. \n   ${JSON.stringify(configRes)}`);
    const tokenInfoResponse: TokenInfoResponse = await veKptQueryClient.tokenInfo();
    console.log(`\n  Query kpt.veKpt tokenInfo ok. \n   ${JSON.stringify(tokenInfoResponse)}`);
    const tokenMinerResponse: MinterResponse = await veKptQueryClient.minter();
    console.log(`\n  Query kpt.veKpt miner ok. \n   ${JSON.stringify(tokenMinerResponse)}`);
    const balanceRes: BalanceResponse = await veKptQueryClient.balance({ address: walletData.address });
    console.log(`\n  Query kpt.veKpt balance ok. \n  ${walletData.address} ${JSON.stringify(balanceRes)}`);
  }

  if (kptFund?.address) {
    const kptFundQueryClient = new kptContracts.KptFund.KptFundQueryClient(walletData.signingCosmWasmClient, kptFund.address);
    const configRes: KptFundConfigResponse = await kptFundQueryClient.kptFundConfig();
    console.log(`\n   Query kpt.kptFund config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (veKptBoost?.address) {
    const veKptBoostQueryClient = new kptContracts.VeKptBoost.VeKptBoostQueryClient(walletData.signingCosmWasmClient, veKptBoost.address);
    const configRes: GetBoostConfigResponse = await veKptBoostQueryClient.getBoostConfig();
    console.log(`\n  Query kpt.veKptBoost config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (veKptMiner?.address) {
    const veKptMinerQueryClient = new kptContracts.VeKptMiner.VeKptMinerQueryClient(walletData.signingCosmWasmClient, veKptMiner.address);
    const configRes: GetMinerConfigResponse = await veKptMinerQueryClient.getMinerConfig();
    console.log(`\n  Query kpt.veKptMiner config ok. \n   ${JSON.stringify(configRes)}`);
    const minerStateResponse: GetMinerStateResponse = await veKptMinerQueryClient.getMinerState();
    console.log(`\n  Query kpt.veKptMiner getMinerState ok. \n   ${JSON.stringify(minerStateResponse)}`);
  }

  if (blindBox?.address) {
    const blindBoxQueryClient = new kptContracts.BlindBox.BlindBoxQueryClient(walletData.signingCosmWasmClient, blindBox.address);
    const configRes: BlindBoxConfigResponse = await blindBoxQueryClient.queryBlindBoxConfig();
    console.log(`\n  Query kpt.blindBox config ok. \n   ${JSON.stringify(configRes)}`);
    const configLevelRes: BlindBoxConfigLevelResponse = await blindBoxQueryClient.queryBlindBoxConfigLevel({ index: 0 });
    console.log(`\n  Query kpt.blindBox queryBlindBoxConfigLevel ok. \n   ${JSON.stringify(configLevelRes)}`);
  }

  if (blindBoxReward?.address) {
    const blindBoxRewardQueryClient = new kptContracts.BlindBoxReward.BlindBoxRewardQueryClient(walletData.signingCosmWasmClient, blindBoxReward.address);
    const configRes: BlindBoxRewardConfigResponse = await blindBoxRewardQueryClient.queryBlindBoxConfig();
    console.log(`\n  Query blindBoxReward.address config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (stakingRewardsPairs && stakingRewardsPairs.length >= 0) {
    for (let stakingRewardsItem of stakingRewardsPairs) {
      if (stakingRewardsItem?.stakingRewards?.address) {
        const stakingRewardsQueryClient = new kptContracts.StakingRewards.StakingRewardsQueryClient(walletData.signingCosmWasmClient, stakingRewardsItem?.stakingRewards?.address);
        const configRes: StakingConfigResponse = await stakingRewardsQueryClient.queryStakingConfig();
        console.log(`\n  Query kpt.stakingRewards config ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(configRes)}`);
        const stateResponse: StakingStateResponse = await stakingRewardsQueryClient.queryStakingState();
        console.log(`\n  Query kpt.stakingRewards queryStakingState ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(stateResponse)}`);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed kpt contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
