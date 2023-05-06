import {parseCoins, coins} from "@cosmjs/stargate";
import {
  storeCode, instantiateContract, executeContract, queryStakingDelegations,
  queryWasmContract, queryAddressBalance, queryStaking, queryStakingParameters, sendCoin, queryAddressAllBalances
} from "./common";
import {loadingStakingData} from "./env_data";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- verify deployed staking contracts enter --- ---`);

  const {
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    mnemonic,
    privateKey,
    account,
    address1NativeBalance,
    address1StableCoinBalance,
    mnemonic2,
    privateKey2,
    account2,
    address2NativeBalance,
    address2StableCoinBalance,
    validator,
    stable_coin_denom,
    prefix,
    wallet,
    wallet2,
    hub,
    reward,
    bSeiToken,
    rewardsDispatcher,
    validatorsRegistry,
    stSeiToken,
  } = await loadingStakingData();

  if (!hub.address || !bSeiToken.address || !stSeiToken.address || !rewardsDispatcher.address || !validatorsRegistry.address || !reward.address) {
    console.log(`--- --- verify deployed error, missing some deployed address info --- ---`)
    process.exit(0);
    return;
  }

  // //just a few simple tests to make sure the contracts are not failing
  // //for more accurate tests we must use integration-tests repo

  console.log()
  console.log("query hub.address config enter")
  const hubConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {config: {}})
  console.log("query hub.address config ok. \n", JSON.stringify(hubConfigRes))
  console.log("check hub.address config result: ", (hubConfigRes.reward_dispatcher_contract === rewardsDispatcher.address
    && hubConfigRes.validators_registry_contract === validatorsRegistry.address
    && hubConfigRes.bsei_token_contract === bSeiToken.address
    && hubConfigRes.stsei_token_contract === stSeiToken.address
  ))

  // 1 + 1 + 1 + 0.5 + txFee
  if (Number(address1NativeBalance.balance.amount) < 4000000) {
    console.error("wallet native balance insufficient 4_000_000. balance: " + address1NativeBalance.balance.amount)
    process.exit(0)
    return
  }
  console.log()
  console.log("hub.address bond_for_st_sei 1 enter")
  const hubBondStSeiRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, {bond_for_st_sei: {}}, "", parseCoins("1000000usei"))
  console.log("hub.address bond_for_st_sei 1 ok. \n", hubBondStSeiRes?.transactionHash)

  console.log()
  console.log("hub.address bond_for_st_sei 2 enter")
  const hubBondStSeiRes2 = await executeContract(RPC_ENDPOINT, wallet, hub.address, {bond_for_st_sei: {}}, "", parseCoins("1000000usei"))
  console.log("hub.address bond_for_st_sei 2 ok. \n", hubBondStSeiRes2?.transactionHash)

  console.log()
  console.log("hub.address bond enter")
  const hubBondRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, {bond: {}}, "", parseCoins("1000000usei"))
  console.log("hub.address bond ok. \n", hubBondRes?.transactionHash)

  console.log()
  console.log("query wallet bSeiToken.address balance enter")
  const bSeiTokenBalanceRes = await queryWasmContract(RPC_ENDPOINT, wallet, bSeiToken.address, {balance: {address: account.address}})
  console.log("query wallet bSeiToken.address balance ok. \n", account.address, JSON.stringify(bSeiTokenBalanceRes))

  console.log()
  console.log("bSeiToken.address send unbond enter")
  const bSeiTokenSendUnbondRes = await executeContract(RPC_ENDPOINT, wallet, bSeiToken.address, {
    send: {
      contract: hub.address, amount: "500000",
      msg: Buffer.from(JSON.stringify({"unbond": {}})).toString('base64')
    }
  }, "", parseCoins(""))
  console.log("bSeiToken.address send unbond for bSei ok. \n", bSeiTokenSendUnbondRes?.transactionHash)

  console.log()
  console.log("query hub.address stable coin balance enter")
  const stableCoinBalanceRes = await queryAddressBalance(LCD_ENDPOINT, hub.address, stable_coin_denom);
  console.log("query hub.address stable coin balance ok. \n", hub.address, JSON.stringify(stableCoinBalanceRes))

  console.log()
  console.log("query hub.address withdrawable unbonded enter")
  const hubWithdrawableRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {withdrawable_unbonded: {address: account.address}})
  console.log("query hub.address withdraw able unbonded ok. \n", account.address, JSON.stringify(hubWithdrawableRes))

  console.log()
  console.log("query staking pool enter")
  const stakingPoolRes = await queryStaking(LCD_ENDPOINT);
  console.log("query staking pool ok. \n", JSON.stringify(stakingPoolRes))

  console.log()
  console.log("query hub.address current_batch enter")
  const hubCurrentBatchRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {current_batch: {}})
  console.log("query hub.address current_batch ok. \n", JSON.stringify(hubCurrentBatchRes))

  console.log()
  console.log("query hub.address unbond_requests enter")
  const hubUnbondRequestRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {unbond_requests: {address: account.address}})
  console.log("query hub.address unbond_requests ok. \n", JSON.stringify(hubUnbondRequestRes))

  console.log()
  console.log("query staking parameter enter")
  const stakingParametersRes = await queryStakingParameters(LCD_ENDPOINT);
  console.log("query staking parameter ok. \n", JSON.stringify(stakingParametersRes))

  console.log()
  console.log("query hub.address staking delegations enter")
  const stakingDelegationsRes = await queryStakingDelegations(LCD_ENDPOINT, hub.address, validator);
  console.log("query hub.address staking delegations ok. \n", JSON.stringify(stakingDelegationsRes))

  console.log()
  console.log("hub.address withdraw unbonded enter")
  const hubWithdrawUnbondedRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, {withdraw_unbonded: {}}, "", parseCoins(""))
  console.log("hub.address withdraw unbonded ok. \n", hubWithdrawUnbondedRes?.transactionHash)

  console.log()
  console.log("query address all balances enter")
  const addressAllBalancesRes = await queryAddressAllBalances(LCD_ENDPOINT, account.address)
  console.log("query address all balances ok. \n", account.address, JSON.stringify(addressAllBalancesRes))

  console.log()
  console.log("hub.address update_global_index enter")
  const hubUpdateGlobalIndexRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, {update_global_index: {}}, "",
    coins(100000000, stable_coin_denom))
  console.log("hub.address update_global_index ok. \n", hubUpdateGlobalIndexRes?.transactionHash)

  console.log()
  console.log("reward.address accrued_rewards enter")
  const rewardAccruedRewardsRes = await queryWasmContract(RPC_ENDPOINT, wallet, reward.address,
    {
      accrued_rewards:
        {
          address: account.address
        }
    })
  console.log("reward.address accrued_rewards ok. \n", JSON.stringify(rewardAccruedRewardsRes))

  console.log()
  console.log("query rewards.address stable coin balance enter")
  const rewardStableCoinBalanceRes = await queryAddressBalance(LCD_ENDPOINT, hub.address, stable_coin_denom);
  console.log("query rewards.address stable coin balance ok. \n", reward.address, JSON.stringify(rewardStableCoinBalanceRes))

  console.log()
  console.log("reward.address claim_rewards enter")
  const rewardClaimRewardsRes = await executeContract(RPC_ENDPOINT, wallet, reward.address,
    {
      claim_rewards: {
        recipient: account.address,
      }
    }, "", parseCoins(""))
  console.log("reward.address claim_rewards ok. \n", rewardClaimRewardsRes?.transactionHash)

  // let recAddress = "sei1tqm527sqmuw2tmmnlydge024ufwnvlv9e7draq";
  // // 2.2 send stable coin to test2 address
  // let sendCoinRet = await sendCoin(RPC_ENDPOINT, wallet, recAddress, "", coin(1000, stable_coin_denom))
  // console.log(`send stable token to ${recAddress} succeed`);
  // console.log(`query ${recAddress} usdc balance:`);
  // let queryUsdcRet = await queryAddressBalance(LCD_ENDPOINT, recAddress, "")


  //***Test sending denom usdt token and sei coin**/
  // let receipientAddress = "sei1mlwyp04y5g95klqzq92tun0xsz7t5sef4h88a3";
  // // console.log("send denom usdt token to address:")
  // // await sendCoin(RPC_ENDPOINT, wallet, receipientAddress, "", coin(1000, stable_coin_denom))
  // // console.log("send sei to address:")
  // // await sendCoin(RPC_ENDPOINT, wallet, receipientAddress, "", coin(10, "usei"))
  // console.log(`query ${receipientAddress} balance:`)
  // await queryAddressBalance(LCD_ENDPOINT, receipientAddress, "")

  const address1NativeBalance2 = await queryAddressBalance(LCD_ENDPOINT, account.address, "usei");
  const address1StableCoinBalance2 = await queryAddressBalance(LCD_ENDPOINT, account.address, stable_coin_denom);
  const address2NativeBalance2 = await queryAddressBalance(LCD_ENDPOINT, account2.address, "usei");
  const address2StableCoinBalance2 = await queryAddressBalance(LCD_ENDPOINT, account2.address, stable_coin_denom);

  console.log()
  console.log(`--- --- after verify balances --- ---`)
  console.table([
    {address: account.address, nativeBalance: JSON.stringify(address1NativeBalance2.balance), stableCoinBalance: JSON.stringify(address1StableCoinBalance2.balance)},
    {address: account2.address, nativeBalance: JSON.stringify(address2NativeBalance2.balance), stableCoinBalance: JSON.stringify(address2StableCoinBalance2.balance)},
  ], [`address`, `nativeBalance`, `stableCoinBalance`]);

  console.log(`--- --- verify deployed staking contracts end --- ---`);
}

main().catch(console.log);

