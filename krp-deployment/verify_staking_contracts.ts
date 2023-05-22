import { parseCoins, coins } from "@cosmjs/stargate";
import { storeCode, instantiateContract, executeContract, queryStakingDelegations, queryWasmContract, queryAddressBalance, queryStaking, queryStakingParameters, sendCoin, queryAddressAllBalances, loadAddressesBalances } from "./common";
import { loadingBaseData, loadingStakingData } from "./env_data";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- verify deployed staking contracts enter --- ---`);

  const { LCD_ENDPOINT, RPC_ENDPOINT, mnemonic, privateKey, wallet, account, mnemonic2, privateKey2, wallet2, account2, validator, stable_coin_denom, prefix, addressesBalances } = await loadingBaseData();

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData();

  if (!hub.address || !bSeiToken.address || !stSeiToken.address || !rewardsDispatcher.address || !validatorsRegistry.address || !reward.address) {
    console.log(`--- --- verify deployed error, missing some deployed address info --- ---`);
    process.exit(0);
    return;
  }

  // //just a few simple tests to make sure the contracts are not failing
  // //for more accurate tests we must use integration-tests repo

  console.log();
  console.log("Query hub.address config enter");
  const hubConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, { config: {} });
  console.log("Query hub.address config ok. \n", JSON.stringify(hubConfigRes));
  console.log(
    "check hub.address config result: ",
    hubConfigRes.reward_dispatcher_contract === rewardsDispatcher.address && hubConfigRes.validators_registry_contract === validatorsRegistry.address && hubConfigRes.bsei_token_contract === bSeiToken.address && hubConfigRes.stsei_token_contract === stSeiToken.address
  );

  // 1 + 1 + 1 + 0.5 + txFee
  let address1UseiBalance = addressesBalances.find(v => account.address === v?.address && "usei" === v?.balance?.denom)?.balance?.amount;
  if (Number(address1UseiBalance) < 10000000) {
    console.error("wallet native balance insufficient 4_000_000. balance: " + address1UseiBalance);
    process.exit(0);
    return;
  }
  console.log();
  console.log("Do hub.address bond_for_st_sei 1 enter");
  const hubBondStSeiRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, { bond_for_st_sei: {} }, "", parseCoins("2000000usei"));
  console.log("Do hub.address bond_for_st_sei 1 ok. \n", hubBondStSeiRes?.transactionHash);

  console.log();
  console.log("Do hub.address bond enter");
  const hubBondRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, { bond: {} }, "", parseCoins("5000000usei"));
  console.log("Do hub.address bond ok. \n", hubBondRes?.transactionHash);

  console.log();
  console.log("Query wallet bSeiToken.address balance enter");
  const bSeiTokenBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSeiToken.address, { balance: { address: account.address } });
  console.log("Query wallet bSeiToken.address balance ok. \n", account.address, JSON.stringify(bSeiTokenBalanceRes));

  console.log();
  console.log("Do bSeiToken.address send unbond enter");
  const bSeiTokenSendUnbondRes = await executeContract(RPC_ENDPOINT, wallet, bSeiToken.address, {
    send: {
      contract: hub.address,
      amount: "500000",
      msg: Buffer.from(JSON.stringify({ unbond: {} })).toString("base64")
    }
  });
  console.log("Do bSeiToken.address send unbond for bSei ok. \n", bSeiTokenSendUnbondRes?.transactionHash);

  console.log();
  console.log("Query hub.address stable coin balance enter");
  const stableCoinBalanceRes = await queryAddressBalance(LCD_ENDPOINT, hub.address, stable_coin_denom);
  console.log("Query hub.address stable coin balance ok. \n", hub.address, JSON.stringify(stableCoinBalanceRes));

  console.log();
  console.log("Query hub.address withdrawable unbonded enter");
  const hubWithdrawableRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, { withdrawable_unbonded: { address: account.address } });
  console.log("Query hub.address withdraw able unbonded ok. \n", account.address, JSON.stringify(hubWithdrawableRes));

  console.log();
  console.log("Query staking pool enter");
  const stakingPoolRes = await queryStaking(LCD_ENDPOINT);
  console.log("Query staking pool ok. \n", JSON.stringify(stakingPoolRes));

  console.log();
  console.log("Query hub.address current_batch enter");
  const hubCurrentBatchRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, { current_batch: {} });
  console.log("Query hub.address current_batch ok. \n", JSON.stringify(hubCurrentBatchRes));

  console.log();
  console.log("Query hub.address unbond_requests enter");
  const hubUnbondRequestRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, { unbond_requests: { address: account.address } });
  console.log("Query hub.address unbond_requests ok. \n", JSON.stringify(hubUnbondRequestRes));

  console.log();
  console.log("Query staking parameter enter");
  const stakingParametersRes = await queryStakingParameters(LCD_ENDPOINT);
  console.log("Query staking parameter ok. \n", JSON.stringify(stakingParametersRes));

  console.log();
  console.log("Query hub.address staking delegations enter");
  let alias_vildator = validator + "/";
  const stakingDelegationsRes = await queryStakingDelegations(LCD_ENDPOINT, hub.address, alias_vildator);
  console.log("Query hub.address staking delegations ok. \n", JSON.stringify(stakingDelegationsRes));

  console.log();
  console.log("Do hub.address withdraw unbonded enter");
  const hubWithdrawUnbondedRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, { withdraw_unbonded: {} });
  console.log("Do hub.address withdraw unbonded ok. \n", hubWithdrawUnbondedRes?.transactionHash);

  console.log();
  console.log("Query address all balances enter");
  const addressAllBalancesRes = await queryAddressAllBalances(LCD_ENDPOINT, account.address);
  console.log("Query address all balances ok. \n", account.address, JSON.stringify(addressAllBalancesRes));

  console.log();
  console.log("Do hub.address update_global_index enter");
  const hubUpdateGlobalIndexRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, { update_global_index: {} }, "", coins(100000000, stable_coin_denom));
  console.log("Do hub.address update_global_index ok. \n", hubUpdateGlobalIndexRes?.transactionHash);

  console.log();
  console.log("Query reward.address accrued_rewards enter");
  const rewardAccruedRewardsRes = await queryWasmContract(RPC_ENDPOINT, wallet, reward.address, {
    accrued_rewards: {
      address: account.address
    }
  });
  console.log("Query reward.address accrued_rewards ok. \n", JSON.stringify(rewardAccruedRewardsRes));

  console.log();
  console.log("Query rewards.address stable coin balance enter");
  const rewardStableCoinBalanceRes = await queryAddressBalance(LCD_ENDPOINT, hub.address, stable_coin_denom);
  console.log("Query rewards.address stable coin balance ok. \n", reward.address, JSON.stringify(rewardStableCoinBalanceRes));

  console.log();
  console.log("Do reward.address claim_rewards enter");
  const rewardClaimRewardsRes = await executeContract(RPC_ENDPOINT, wallet, reward.address, {
    claim_rewards: {
      recipient: account.address
    }
  });
  console.log("Do reward.address claim_rewards ok. \n", rewardClaimRewardsRes?.transactionHash);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed staking contracts end --- ---`);

  await loadAddressesBalances(LCD_ENDPOINT, [account.address, account2.address], ["usei", stable_coin_denom]);
}

main().catch(console.log);
