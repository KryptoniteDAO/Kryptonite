import { printChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import { DeployContract, KptDeployContracts, StakingRewardsPairsDeployContracts, WalletData } from "./types";
import { kptReadArtifact, printDeployedKptContracts, printDeployedKptStakingContracts } from "./modules/kpt";
import { KptFundQueryClient } from "./contracts/KptFund.client";
import { KptFundConfigResponse } from "./contracts/KptFund.types";
import { KptQueryClient } from "./contracts/Kpt.client";
import { BalanceResponse, KptConfigResponse, TokenInfoResponse } from "./contracts/Kpt.types";
import { VeKptQueryClient } from "./contracts/VeKpt.client";
import { MinterResponse, VoteConfigResponse } from "./contracts/VeKpt.types";
import { VeKptMinerQueryClient } from "./contracts/VeKptMiner.client";
import { VeKptBoostQueryClient } from "./contracts/VeKptBoost.client";
import { GetBoostConfigResponse } from "./contracts/VeKptBoost.types";
import { GetMinerConfigResponse, GetMinerStateResponse } from "./contracts/VeKptMiner.types";
import { StakingRewardsQueryClient } from "./contracts/StakingRewards.client";
import { StakingConfigResponse, StakingStateResponse } from "./contracts/StakingRewards.types";
import { BlindBoxQueryClient } from "./contracts/BlindBox.client";
import { BlindBoxConfigLevelResponse, BlindBoxConfigResponse } from "./contracts/BlindBox.types";
import { BlindBoxRewardQueryClient } from "./contracts/BlindBoxReward.client";
import { BlindBoxConfigResponse as BlindBoxRewardConfigResponse } from "./contracts/BlindBoxReward.types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- verify deployed kpt contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkKpt = kptReadArtifact(walletData.chainId) as KptDeployContracts;

  await printDeployedKptContracts(networkKpt);
  await printDeployedKptStakingContracts(networkKpt);

  const kpt: DeployContract = networkKpt?.kpt;
  const veKpt: DeployContract = networkKpt?.veKpt;
  const kptFund: DeployContract = networkKpt?.kptFund;
  const veKptBoost: DeployContract = networkKpt?.veKptBoost;
  const veKptMiner: DeployContract = networkKpt?.veKptMiner;
  const blindBox: DeployContract = networkKpt?.blindBox;
  const blindBoxReward: DeployContract = networkKpt?.blindBoxReward;
  const stakingRewardsPairs: StakingRewardsPairsDeployContracts[] = networkKpt?.stakingRewardsPairs;

  if (kpt?.address) {
    const kptQueryClient = new KptQueryClient(walletData.signingCosmWasmClient, kpt.address);
    const kpConfigRes: KptConfigResponse = await kptQueryClient.kptConfig();
    console.log(`\nQuery kpt.address config ok. \n${JSON.stringify(kpConfigRes)}`);
    const tokenInfoResponse: TokenInfoResponse = await kptQueryClient.tokenInfo();
    console.log(`\nQuery kpt.address tokenInfo ok. \n${JSON.stringify(tokenInfoResponse)}`);
    const balanceRes: BalanceResponse = await kptQueryClient.balance({ address: walletData.address });
    console.log(`\nQuery kpt.address balance ok. \n ${walletData.address} ${JSON.stringify(balanceRes)}`);
  }

  if (veKpt?.address) {
    const veKptQueryClient = new VeKptQueryClient(walletData.signingCosmWasmClient, veKpt.address);
    const configRes: VoteConfigResponse = await veKptQueryClient.voteConfig();
    console.log(`\nQuery veKpt.address config ok. \n${JSON.stringify(configRes)}`);
    const tokenInfoResponse: TokenInfoResponse = await veKptQueryClient.tokenInfo();
    console.log(`\nQuery veKpt.address tokenInfo ok. \n${JSON.stringify(tokenInfoResponse)}`);
    const tokenMinerResponse: MinterResponse = await veKptQueryClient.minter();
    console.log(`\nQuery veKpt.address miner ok. \n${JSON.stringify(tokenMinerResponse)}`);
    const balanceRes: BalanceResponse = await veKptQueryClient.balance({ address: walletData.address });
    console.log(`\nQuery veKpt.address balance ok. \n ${walletData.address} ${JSON.stringify(balanceRes)}`);
  }

  if (kptFund?.address) {
    const kptFundQueryClient = new KptFundQueryClient(walletData.signingCosmWasmClient, kptFund.address);
    const configRes: KptFundConfigResponse = await kptFundQueryClient.kptFundConfig();
    console.log(`\nQuery kptFund.address config ok. \n${JSON.stringify(configRes)}`);
  }

  if (veKptBoost?.address) {
    const veKptBoostQueryClient = new VeKptBoostQueryClient(walletData.signingCosmWasmClient, veKptBoost.address);
    const configRes: GetBoostConfigResponse = await veKptBoostQueryClient.getBoostConfig();
    console.log(`\nQuery veKptBoost.address config ok. \n${JSON.stringify(configRes)}`);
  }

  if (veKptMiner?.address) {
    const veKptMinerQueryClient = new VeKptMinerQueryClient(walletData.signingCosmWasmClient, veKptMiner.address);
    const configRes: GetMinerConfigResponse = await veKptMinerQueryClient.getMinerConfig();
    console.log(`\nQuery veKptMiner.address config ok. \n${JSON.stringify(configRes)}`);
    const minerStateResponse: GetMinerStateResponse = await veKptMinerQueryClient.getMinerState();
    console.log(`\nQuery veKptMiner.address getMinerState ok. \n${JSON.stringify(minerStateResponse)}`);
  }

  if (blindBox?.address) {
    const blindBoxQueryClient = new BlindBoxQueryClient(walletData.signingCosmWasmClient, blindBox.address);
    const configRes: BlindBoxConfigResponse = await blindBoxQueryClient.queryBlindBoxConfig();
    console.log(`\nQuery blindBox.address config ok. \n${JSON.stringify(configRes)}`);
    const configLevelRes: BlindBoxConfigLevelResponse = await blindBoxQueryClient.queryBlindBoxConfigLevel({ index: 0 });
    console.log(`\nQuery blindBox.address queryBlindBoxConfigLevel ok. \n${JSON.stringify(configLevelRes)}`);
  }

  if (blindBoxReward?.address) {
    const blindBoxRewardQueryClient = new BlindBoxRewardQueryClient(walletData.signingCosmWasmClient, blindBoxReward.address);
    const configRes: BlindBoxRewardConfigResponse = await blindBoxRewardQueryClient.queryBlindBoxConfig();
    console.log(`\nQuery blindBoxReward.address config ok. \n${JSON.stringify(configRes)}`);
  }

  if (stakingRewardsPairs && stakingRewardsPairs.length >= 0) {
    for (let stakingRewardsItem of stakingRewardsPairs) {
      if (stakingRewardsItem?.stakingRewards?.address) {
        const stakingRewardsQueryClient = new StakingRewardsQueryClient(walletData.signingCosmWasmClient, stakingRewardsItem?.stakingRewards?.address);
        const configRes: StakingConfigResponse = await stakingRewardsQueryClient.queryStakingConfig();
        console.log(`\nQuery stakingRewards.address config ok. staking_token: ${stakingRewardsItem?.staking_token} \n${JSON.stringify(configRes)}`);
        const stateResponse: StakingStateResponse = await stakingRewardsQueryClient.queryStakingState();
        console.log(`\nQuery stakingRewards.address queryStakingState ok. staking_token: ${stakingRewardsItem?.staking_token} \n${JSON.stringify(stateResponse)}`);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed kpt contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
