import { parseCoins, coins } from "@cosmjs/stargate";
import { queryStakingDelegations, queryAddressBalance, queryStaking, queryStakingParameters, queryAddressAllBalances, readArtifact, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingStakingData, STAKING_ARTIFACTS_PATH } from "./env_data";
import { DeployContract, WalletData } from "./types";

require("dotenv").config();

async function main(): Promise<void> {
console.log(`--- --- verify deployed staking contracts enter --- ---`);

const walletData = await loadingWalletData();
const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH);
const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
console.error(`--- --- verify deployed error, missing some deployed address info --- ---`);
process.exit(0);
return;
}

// //just a few simple tests to make sure the contracts are not failing
// //for more accurate tests we must use integration-tests repo

await queryHubConfig(walletData, hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken);

// 1 + 1 + 1 + 0.5 + txFee
  let address1UseiBalance = walletData.addressesBalances.find(v => walletData.address === v?.address && "usei" === v?.balance?.denom)?.balance?.amount;
  if (Number(address1UseiBalance) < 10000000) {
       console.error("wallet native balance insufficient 4_000_000. balance: " + address1UseiBalance);
       process.exit(0);
       return;
  }
  console.log();
  console.log("Do hub.address bond_for_st_sei  enter");
  const hubBondStSeiRes = await executeContractByWalletData(walletData, hub.address, { bond_for_st_sei: {} }, "", parseCoins("2000000usei"));
  console.log("Do hub.address bond_for_st_sei  ok. \n", hubBondStSeiRes?.transactionHash);


  console.log();
  console.log("Do hub.address bond enter");
  const hubBondRes = await executeContractByWalletData(walletData, hub.address, { bond: {} }, "", parseCoins("5000000usei"));
  console.log("Do hub.address bond ok. \n", hubBondRes?.transactionHash);

  console.log();
  console.log("Query wallet bSeiToken.address balance enter");
  const bSeiTokenBalanceRes = await queryWasmContractByWalletData(walletData, bSeiToken.address, { balance: { address: walletData.address } });
  console.log("Query wallet bSeiToken.address balance ok. \n", walletData.address, JSON.stringify(bSeiTokenBalanceRes));

  console.log();
  console.log("Do bSeiToken.address send unbond enter");
  const bSeiTokenSendUnbondRes = await executeContractByWalletData(walletData, bSeiToken.address, {
    send: {
      contract: hub.address,
      amount: "500000",
      msg: Buffer.from(JSON.stringify({ unbond: {} })).toString("base64")
    }
  });
  console.log("Do bSeiToken.address send unbond for bSei ok. \n", bSeiTokenSendUnbondRes?.transactionHash);

  console.log();
  console.log("Query hub.address stable coin balance enter");
  const stableCoinBalanceRes = await queryAddressBalance(walletData.LCD_ENDPOINT, hub.address, walletData.stable_coin_denom);
  console.log("Query hub.address stable coin balance ok. \n", hub.address, JSON.stringify(stableCoinBalanceRes));

  console.log();
  console.log("Query hub.address withdrawable unbonded enter");
  const hubWithdrawableRes = await queryWasmContractByWalletData(walletData, hub.address, { withdrawable_unbonded: { address: walletData.address } });
  console.log("Query hub.address withdraw able unbonded ok. \n", walletData.address, JSON.stringify(hubWithdrawableRes));

  console.log();
  console.log("Query staking pool enter");
  const stakingPoolRes = await queryStaking(walletData.LCD_ENDPOINT);
  console.log("Query staking pool ok. \n", JSON.stringify(stakingPoolRes));

  console.log();
  console.log("Query hub.address current_batch enter");
  const hubCurrentBatchRes = await queryWasmContractByWalletData(walletData, hub.address, { current_batch: {} });
  console.log("Query hub.address current_batch ok. \n", JSON.stringify(hubCurrentBatchRes));

  console.log();
  console.log("Query hub.address unbond_requests enter");
  const hubUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData.address } });
  console.log("Query hub.address unbond_requests ok. \n", JSON.stringify(hubUnbondRequestRes));

  console.log();
  console.log("Query staking parameter enter");
  const stakingParametersRes = await queryStakingParameters(walletData.LCD_ENDPOINT);
  console.log("Query staking parameter ok. \n", JSON.stringify(stakingParametersRes));

  console.log();
  console.log("Query hub.address staking delegations enter");
  const stakingDelegationsRes = await queryStakingDelegations(walletData.LCD_ENDPOINT, hub.address, walletData.validator + "/");
  console.log("Query hub.address staking delegations ok. \n", JSON.stringify(stakingDelegationsRes));

  console.log();
  console.log("Do hub.address withdraw unbonded enter");
  const hubWithdrawUnbondedRes = await executeContractByWalletData(walletData, hub.address, { withdraw_unbonded: {} });
  console.log("Do hub.address withdraw unbonded ok. \n", hubWithdrawUnbondedRes?.transactionHash);

  console.log();
  console.log("Query address all balances enter");
  const addressAllBalancesRes = await queryAddressAllBalances(walletData.LCD_ENDPOINT, walletData.address);
  console.log("Query address all balances ok. \n", walletData.address, JSON.stringify(addressAllBalancesRes));

  console.log();
  console.log("Do hub.address update_global_index enter");
  const hubUpdateGlobalIndexRes = await executeContractByWalletData(walletData, hub.address, { update_global_index: {} }, "", coins(100000000, walletData.stable_coin_denom));
  console.log("Do hub.address update_global_index ok. \n", hubUpdateGlobalIndexRes?.transactionHash);

  console.log();
  console.log("Query reward.address accrued_rewards enter");
  const rewardAccruedRewardsRes = await queryWasmContractByWalletData(walletData, reward.address, {
    accrued_rewards: {
      address: walletData.address
    }
  });
  console.log("Query reward.address accrued_rewards ok. \n", JSON.stringify(rewardAccruedRewardsRes));

  console.log();
  console.log("Query rewards.address stable coin balance enter");
  const rewardStableCoinBalanceRes = await queryAddressBalance(walletData.LCD_ENDPOINT, hub.address, walletData.stable_coin_denom);
  console.log("Query rewards.address stable coin balance ok. \n", reward.address, JSON.stringify(rewardStableCoinBalanceRes));

  console.log();
  console.log("Do reward.address claim_rewards enter");
  const rewardClaimRewardsRes = await executeContractByWalletData(walletData, reward.address, {
    claim_rewards: {
      recipient: walletData.address
    }
  });
  console.log("Do reward.address claim_rewards ok. \n", rewardClaimRewardsRes?.transactionHash);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed staking contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}

async function queryHubConfig(walletData: WalletData, hub: DeployContract, reward: DeployContract, bSeiToken: DeployContract, rewardsDispatcher: DeployContract, validatorsRegistry: DeployContract, stSeiToken: DeployContract): Promise<any> {
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error("Query hub.address config error: missing address");
    return;
  }

  console.log();
  console.log("Query hub.address config enter");
  const hubConfigRes = await queryWasmContractByWalletData(walletData, hub.address, { config: {} });
  console.log(`Query hub.address config ok.: \n${JSON.stringify(hubConfigRes)}`);
  console.log(
    "check hub.address config result: ",
    rewardsDispatcher.address === hubConfigRes?.reward_dispatcher_contract && validatorsRegistry.address === hubConfigRes?.validators_registry_contract && bSeiToken.address === hubConfigRes?.bsei_token_contract && stSeiToken.address === hubConfigRes?.stsei_token_contract
  );

  return hubConfigRes;
}

main().catch(console.error);
