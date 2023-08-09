import Decimal from "decimal.js";
import { coins } from "@cosmjs/stargate";
import type { ContractDeployed, WalletData } from "@/types";
import type { ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
import { queryStakingDelegations, queryAddressBalance, queryStaking, queryStakingParameters, queryWasmContractByWalletData, executeContractByWalletData, printChangeBalancesByWalletData, queryAddressTokenBalance } from "../../common";
import { loadingWalletData } from "@/env_data";
import { swapExtentionReadArtifact, stakingReadArtifact, marketReadArtifact, convertReadArtifact, loadingStakingData, cdpReadArtifact, CdpContractsDeployed, printDeployedStakingContracts } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- verify deployed staking contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  const { stable_coin_denom } = networkCdp;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`\n  --- --- verify deployed error, missing some deployed address info --- ---`);
    process.exit(0);
    return;
  }
  await printDeployedStakingContracts(networkStaking);
  console.log(`  stable_coin_denom: ${stable_coin_denom}`)

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  await queryHubConfig(walletData, hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken);

  // 1 + 1 + 1 + 0.5 + txFee
  let address1UseiBalance = walletData.addressesBalances.find(v => walletData.address === v?.address && walletData.nativeCurrency.coinMinimalDenom === v?.balance?.denom)?.balance?.amount;

  if (Number(address1UseiBalance) < 4000000) {
    console.error("********* ********* wallet native balance insufficient 4_000_000. balance: " + address1UseiBalance);
    process.exit(0);
    return;
  }

  // await doHubBondForStsei(walletData, walletData.nativeCurrency.coinMinimalDenom, hub, stSeiToken, "100000");
  await doHubBondForBsei(walletData, walletData.nativeCurrency.coinMinimalDenom, hub, bSeiToken, "1000000");
  await doHubUnbondBseiToNative(walletData, walletData.nativeCurrency.coinMinimalDenom, bSeiToken, hub, "100000");
  await doHubWithdrawUnbondedToNative(walletData, walletData.nativeCurrency.coinMinimalDenom, hub);

  await doHubUpdateRewards(walletData, walletData.nativeCurrency.coinMinimalDenom, hub, stable_coin_denom, "100000000");
  await doClaimRewards(walletData, walletData.nativeCurrency.coinMinimalDenom, reward, stable_coin_denom);

  await printMoreInfo(walletData, walletData.nativeCurrency.coinMinimalDenom, hub);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed staking contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}

async function queryHubConfig(walletData: WalletData, hub: ContractDeployed, reward: ContractDeployed, bSeiToken: ContractDeployed, rewardsDispatcher: ContractDeployed, validatorsRegistry: ContractDeployed, stSeiToken: ContractDeployed): Promise<any> {
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error("Query hub.address config error: missing address");
    return;
  }

  console.log(`\n  Query hub.address config enter`);
  const hubConfigRes = await queryWasmContractByWalletData(walletData, hub.address, { config: {} });
  console.log(`Query hub.address config ok.: \n  ${JSON.stringify(hubConfigRes)}`);
  console.log(
    "check hub.address config result: ",
    rewardsDispatcher.address === hubConfigRes?.reward_dispatcher_contract && validatorsRegistry.address === hubConfigRes?.validators_registry_contract && bSeiToken.address === hubConfigRes?.bsei_token_contract && stSeiToken.address === hubConfigRes?.stsei_token_contract
  );

  return hubConfigRes;
}

async function doHubBondForStsei(walletData: WalletData, nativeDenom: string, hub: ContractDeployed, stsei: ContractDeployed, amount: number | string): Promise<void> {
  if (!hub?.address || !stsei?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.warn(`\n  Do hub.address bond_for_st_sei enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData.address, nativeDenom);
  if (new Decimal(beforeNativeBalanceRes?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeNativeBalanceRes?.amount ?? 0}`);
    return;
  }
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, stsei.address);

  console.log(`before native balance: ${beforeNativeBalanceRes.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${stsei.address}`);
  const doRes = await executeContractByWalletData(walletData, hub.address, { bond_for_st_sei: {} }, "bond native to stsei", coins(amount, nativeDenom));
  console.log(`Do hub.address bond_for_st_sei ok. nativeDenom: ${nativeDenom} / amount: ${amount} \n  ${doRes?.transactionHash}`);
  const afterNativeBalanceRes = await queryAddressBalance(walletData, walletData.address, nativeDenom);
  console.log(`after native balance: ${afterNativeBalanceRes.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, stsei.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${stsei.address}`);
}

async function doHubBondForBsei(walletData: WalletData, nativeDenom: string, hub: ContractDeployed, bsei: ContractDeployed, amount: number | string): Promise<void> {
  if (!hub?.address || !bsei?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do hub.address bond native coin to bsei enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData.address, nativeDenom);
  if (new Decimal(beforeNativeBalanceRes?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeNativeBalanceRes?.amount ?? 0}`);
    return;
  }

  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, bsei.address);
  console.log(`before native balance: ${beforeNativeBalanceRes?.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${bsei.address}`);
  const doRes = await executeContractByWalletData(walletData, hub.address, { bond: {} }, "bond native to bsei", coins(amount, nativeDenom));
  console.log(`Do hub.address bond native coin to bsei ok. \n  ${doRes?.transactionHash}`);
  const afterNativeBalanceRes = await queryAddressBalance(walletData, walletData.address, nativeDenom);
  console.log(`after native balance: ${afterNativeBalanceRes?.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, bsei.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${bsei.address}`);
}

async function doHubUnbondBseiToNative(walletData: WalletData, nativeDenom: string, btoken: ContractDeployed, hub: ContractDeployed, amount: string): Promise<void> {
  if (!btoken?.address || !hub?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do hub.address unbond bsei to native coin enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  if (new Decimal(beforeTokenBalanceRes?.balance ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeTokenBalanceRes?.balance ?? 0}`);
    return;
  }
  const beforeUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData.address } });
  console.log(`before unbond_requests ok. \n  ${JSON.stringify(beforeUnbondRequestRes)}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${btoken.address}`);
  const doRes = await executeContractByWalletData(
    walletData,
    btoken.address,
    {
      send: {
        contract: hub.address,
        amount: amount,
        msg: Buffer.from(JSON.stringify({ unbond: {} })).toString("base64")
      }
    },
    "unbond bsei to native"
  );
  console.log(`Do hub.address unbond bsei to native coin ok. \n  ${doRes?.transactionHash}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData.signingCosmWasmClient, walletData.address, btoken.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${btoken.address}`);
  const afterUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData.address } });
  console.log(`after unbond_requests ok. \n  ${JSON.stringify(afterUnbondRequestRes)}`);
}

async function doHubWithdrawUnbondedToNative(walletData: WalletData, nativeDenom: string, hub: ContractDeployed): Promise<void> {
  if (!hub?.address) {
    return;
  }
  console.log(`\n  Do hub.address withdraw unbonded enter`);

  const beforeWithdrawAbleRes = await queryWasmContractByWalletData(walletData, hub.address, { withdrawable_unbonded: { address: walletData.address } });
  console.log(`Query hub.address withdrawable_unbonded ok. address: ${walletData.address} \n  ${JSON.stringify(beforeWithdrawAbleRes)}`);
  if (!beforeWithdrawAbleRes?.["withdrawable"] || new Decimal(beforeWithdrawAbleRes?.["withdrawable"]).comparedTo(0) <= 0) {
    console.error(`\n  ********* unable to withdraw`, beforeWithdrawAbleRes?.["withdrawable"]);
    return;
  }
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData.address, nativeDenom);
  console.log(`before native balance: ${beforeNativeBalanceRes?.amount} ${nativeDenom}`);

  // const doRes = await executeContractByWalletData(walletData, hub.address, { withdraw_unbonded: {} });
  // console.log(`Do hub.address withdraw_unbonded ok. \n  ${doRes?.transactionHash}`);
  const afterNativeBalanceRes = await queryAddressBalance(walletData, walletData.address, nativeDenom);
  console.log(`after native balance: ${afterNativeBalanceRes.amount} ${nativeDenom}`);
  const afterWithdrawAbleRes = await queryWasmContractByWalletData(walletData, hub.address, { withdrawable_unbonded: { address: walletData.address } });
  console.log(`Query hub.address withdrawable_unbonded ok. \n  ${JSON.stringify(afterWithdrawAbleRes)}`);
}

async function doHubUpdateRewards(walletData: WalletData, nativeDenom: string, hub: ContractDeployed, rewardDemon: string, amount: string): Promise<void> {
  if (!hub?.address || !rewardDemon) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do hub.address update_global_index enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);

  const beforeRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData.address, rewardDemon);
  if (new Decimal(beforeRewardsDemonBalanceRes?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The rewardDemon balance is insufficient. ${amount} but ${beforeRewardsDemonBalanceRes?.amount ?? 0}`);
    return;
  }

  console.log(`before rewardDemon balance: ${beforeRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
  const doRes = await executeContractByWalletData(
    walletData,
    hub.address,
    {
      update_global_index: {}
    },
    "send rewards",
    coins(amount, rewardDemon)
  );
  console.log(`Do hub.address update_global_index ok. \n  ${doRes?.transactionHash}`);

  const afterRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData.address, rewardDemon);
  console.log(`after rewardDemon balance: ${afterRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
}

async function doClaimRewards(walletData: WalletData, nativeDenom: string, reward: ContractDeployed, rewardDemon: string): Promise<void> {
  if (!reward?.address || !rewardDemon) {
    return;
  }

  console.log(`\n  Do reward.address claim rewards enter. rewardDemon: ${rewardDemon}`);

  const beforeAccruedRewardsRes = await queryWasmContractByWalletData(walletData, reward.address, { accrued_rewards: { address: walletData.address } });
  console.log(`Query reward.address accrued_rewards ok. address: ${walletData.address} \n  ${JSON.stringify(beforeAccruedRewardsRes)}`);
  if (!beforeAccruedRewardsRes?.["rewards"] || new Decimal(beforeAccruedRewardsRes?.["rewards"]).comparedTo(0) <= 0) {
    console.error(`\n  ********* unable to claim`, beforeAccruedRewardsRes?.["rewards"]);
    return;
  }

  const beforeRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData.address, rewardDemon);
  console.log(`before rewardDemon balance: ${beforeRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
  const doRes = await executeContractByWalletData(
    walletData,
    reward.address,
    {
      claim_rewards: {
        recipient: walletData.address
      }
    },
    "claim rewards"
  );
  console.log(`Do reward.address claim_rewards ok. \n  ${doRes?.transactionHash}`);

  const afterRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData.address, rewardDemon);
  console.log(`after rewardDemon balance: ${afterRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
  const afterAccruedRewardsRes = await queryWasmContractByWalletData(walletData, reward.address, { accrued_rewards: { address: walletData.address } });
  console.log(`Query reward.address accrued_rewards ok. address: ${walletData.address} \n  ${JSON.stringify(afterAccruedRewardsRes)}`);
}

async function printMoreInfo(walletData: WalletData, nativeDenom: string, hub: ContractDeployed) {
  console.log(`\n  Query staking pool enter`);
  const stakingPoolRes = await queryStaking(walletData.LCD_ENDPOINT);
  console.log(`Query staking pool ok. \n  ${JSON.stringify(stakingPoolRes)}`);

  console.log(`\n  Query hub.address unbond_requests enter`);
  const hubUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData.address } });
  console.log(`Query hub.address unbond_requests ok. \n  ${JSON.stringify(hubUnbondRequestRes)}`);

  console.log(`\n  Query staking parameter enter`);
  const stakingParametersRes = await queryStakingParameters(walletData.LCD_ENDPOINT);
  console.log(`Query staking parameter ok. \n  ${JSON.stringify(stakingParametersRes)}`);

  console.log(`\n  Query hub.address staking delegations enter`);
  const stakingDelegationsRes = await queryStakingDelegations(walletData.LCD_ENDPOINT, hub.address, walletData.validator + "/");
  console.log(`Query hub.address staking delegations ok. \n  ${JSON.stringify(stakingDelegationsRes)}`);
}
