import {parseCoins, coins} from "@cosmjs/stargate";
import {
  storeCode, instantiateContract, executeContract, queryStakingDelegations,
  queryWasmContract, queryAddressBalance, queryStaking, queryStakingParameters, sendCoin, queryAddressAllBalances
} from "./common";
import {loadingStakingData} from "./env_data";

require("dotenv").config();

type ContractInfo = {
  codeId: number;
  address: string;
  filePath: string
  deploy: boolean
}

async function main(): Promise<void> {
  console.log(`--- --- verify deployed staking contracts enter --- ---`);

  const {
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    mnemonic,
    privateKey,
    account,
    mnemonic2,
    privateKey2,
    account2,
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

  await executeContract(RPC_ENDPOINT, wallet, hub.address, {bond_for_st_sei: {}}, "", parseCoins("1000000usei"))
  console.log("test hub.address bond for stSei ok...")

  await executeContract(RPC_ENDPOINT, wallet, hub.address, {bond_for_st_sei: {}}, "", parseCoins("1000000usei"))
  console.log("test hub.address bond for stSei ok...")

  await executeContract(RPC_ENDPOINT, wallet, hub.address, {bond: {}}, "", parseCoins("10000000usei"))
  console.log("test hub.address bond for bSei ok...")

  console.log("query bond sei balance:")
  await queryWasmContract(RPC_ENDPOINT, wallet, bSeiToken.address, {balance: {address: account.address}})


  await executeContract(RPC_ENDPOINT, wallet, bSeiToken.address, {
    send: {
      contract: hub.address, amount: "500000",
      msg: Buffer.from(JSON.stringify({"unbond": {}})).toString('base64')
    }
  }, "", parseCoins(""))
  console.log("send bSeiToken.address unbond for bSei ok...")

  console.log("query hub contract balance:")
  await queryAddressBalance(LCD_ENDPOINT, hub.address, stable_coin_denom);

  console.log("query withdraw able unbonded:")
  await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {withdrawable_unbonded: {address: account.address}})

  console.log("query staking pool:")
  await queryStaking(LCD_ENDPOINT);


  console.log("query current batch:")
  await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {current_batch: {}})


  console.log("query unbond request:")
  await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {unbond_requests: {address: account.address}})


  console.log("query staking parameter:")
  await queryStakingParameters(LCD_ENDPOINT);

  // console.log("query delegations list:")
  // await queryStakingDelegations(LCD_ENDPOINT, account.address, "seivaloper1wukzl3ppckudkkny744k4kmrw0p0l6h98sm43s");

  console.log("withdraw able unbonded:")
  let withdrawRet = await executeContract(RPC_ENDPOINT, wallet, hub.address, {withdraw_unbonded: {}}, "", parseCoins(""))
  console.log("withdraw able unbonded ok")

  console.log("query hub config:")
  await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {config: {}})

  await queryAddressAllBalances(LCD_ENDPOINT, account.address)

  await executeContract(RPC_ENDPOINT, wallet, hub.address, {update_global_index: {}}, "",
    coins(100000000, stable_coin_denom))
  console.log("update_reward_basset ok")

  console.log("query accured reward:")
  await queryWasmContract(RPC_ENDPOINT, wallet, reward.address,
    {
      accrued_rewards:
        {
          address: account.address
        }
    })

  console.log("query rewards balance:")
  await queryAddressBalance(LCD_ENDPOINT, reward.address, stable_coin_denom)

  // console.log("query test2 balance:")
  // await queryAddressAllBalances(LCD_ENDPOINT, account2.address)

  console.log("claim reward:")
  let claimRewardRet = await executeContract(RPC_ENDPOINT, wallet, reward.address,
    {
      claim_rewards: {
        recipient: account.address,
      }
    }, "", parseCoins(""))
  console.log("claim reward ok!")

  console.log(`query ${account.address}`)
  await queryAddressAllBalances(LCD_ENDPOINT, account.address)

  console.log("query address test2 balance after claim reward:")
  await queryAddressAllBalances(LCD_ENDPOINT, account2.address)


  // let recAddress = "sei1tqm527sqmuw2tmmnlydge024ufwnvlv9e7draq";
  // // 2.2 send stable coin to test2 address
  // let sendCoinRet = await sendCoin(RPC_ENDPOINT, wallet, recAddress, "", coin(10000000, stable_coin_denom))
  // console.log(`send stable token to ${recAddress} succeed`);
  // console.log(`query ${recAddress} usdc balance:`);
  // let queryUsdcRet = await queryAddressBalance(LCD_ENDPOINT, recAddress, "")


  //***Test sending denom usdt token and sei coin**/
  // let receipientAddress = "sei1mlwyp04y5g95klqzq92tun0xsz7t5sef4h88a3";
  // // console.log("send denom usdt token to address:")
  // // await sendCoin(RPC_ENDPOINT, wallet, receipientAddress, "", coin(100000000, stable_coin_denom))
  // // console.log("send sei to address:")
  // // await sendCoin(RPC_ENDPOINT, wallet, receipientAddress, "", coin(100000000, "usei"))
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

