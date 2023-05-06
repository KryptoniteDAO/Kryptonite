import {parseCoins, coins} from "@cosmjs/stargate";
import {
  storeCode, instantiateContract, executeContract, queryStakingDelegations,
  queryWasmContract, queryAddressBalance, queryStaking, queryStakingParameters, sendCoin, queryAddressAllBalances
} from "./common";
import {loadingStakingData} from "./env_data";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- deploy staking contracts enter --- ---`);

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

  let deployAddressFlag: boolean = false;
  if (!hub.address) {
    if (hub.codeId <= 0) {
      hub.codeId = await storeCode(RPC_ENDPOINT, wallet, hub.filePath);
    }
    if (hub.codeId > 0) {
      hub.address = await instantiateContract(RPC_ENDPOINT, wallet, hub.codeId,
        {
          epoch_period: 30,
          er_threshold: "1.0",
          peg_recovery_fee: "0",
          reward_denom: stable_coin_denom,
          unbonding_period: 120,
          underlying_coin_denom: "usei",
          validator: validator   // local node validator address
        }, parseCoins(""), "lido sei hub");
      deployAddressFlag = true;
      hub.deploy = true;
    }
  }

  if (!reward.address) {
    if (reward.codeId <= 0) {
      reward.codeId = await storeCode(RPC_ENDPOINT, wallet, reward.filePath);
    }
    if (reward.codeId > 0) {
      reward.address = await instantiateContract(RPC_ENDPOINT, wallet, reward.codeId,
        {
          owner: account.address,
          hub_contract: hub.address,
          reward_denom: stable_coin_denom,
        }, parseCoins(""), "sei reward");
      deployAddressFlag = true;
      reward.deploy = true;
    }
  }

  if (!bSeiToken.address) {
    if (bSeiToken.codeId <= 0) {
      bSeiToken.codeId = await storeCode(RPC_ENDPOINT, wallet, bSeiToken.filePath);
    }
    if (bSeiToken.codeId > 0) {
      bSeiToken.address = await instantiateContract(RPC_ENDPOINT, wallet, bSeiToken.codeId,
        {
          decimals: 6,
          hub_contract: hub.address,
          initial_balances: [],
          name: "bsei",
          symbol: "BSEI",
          mint: {minter: hub.address, cap: null}
        }, parseCoins(""), "bond sei");
      deployAddressFlag = true;
      bSeiToken.deploy = true;
    }
  }

  if (!rewardsDispatcher.address) {
    if (rewardsDispatcher.codeId <= 0) {
      rewardsDispatcher.codeId = await storeCode(RPC_ENDPOINT, wallet, rewardsDispatcher.filePath);
    }
    if (rewardsDispatcher.codeId > 0) {
      rewardsDispatcher.address = await instantiateContract(RPC_ENDPOINT, wallet, rewardsDispatcher.codeId,
        {
          lido_fee_address: account.address,
          lido_fee_rate: "0.05",
          hub_contract: hub.address,
          bsei_reward_contract: reward.address,
          stsei_reward_denom: "usei",
          bsei_reward_denom: stable_coin_denom,
        }, parseCoins(""), "reward dispatcher");
      deployAddressFlag = true;
      rewardsDispatcher.deploy = true;
    }
  }

  if (!validatorsRegistry.address) {
    if (validatorsRegistry.codeId <= 0) {
      validatorsRegistry.codeId = await storeCode(RPC_ENDPOINT, wallet, validatorsRegistry.filePath);
    }
    if (validatorsRegistry.codeId > 0) {
      validatorsRegistry.address = await instantiateContract(RPC_ENDPOINT, wallet, validatorsRegistry.codeId,
        {
          hub_contract: hub.address,
          registry: [{
            active: true,
            address: validator,
            total_delegated: "0"
          }]
        }, parseCoins(""), "validator registry")
      deployAddressFlag = true;
      validatorsRegistry.deploy = true;
    }
  }

  if (!stSeiToken.address) {
    if (stSeiToken.codeId <= 0) {
      stSeiToken.codeId = await storeCode(RPC_ENDPOINT, wallet, stSeiToken.filePath);
    }
    if (stSeiToken.codeId > 0) {
      stSeiToken.address = await instantiateContract(RPC_ENDPOINT, wallet, stSeiToken.codeId,
        {
          decimals: 6,
          hub_contract: hub.address,
          initial_balances: [],
          name: "stsei",
          symbol: "STSEI",
          mint: {minter: hub.address, cap: null}
        }, parseCoins(""), "staking sei")
      deployAddressFlag = true;
      stSeiToken.deploy = true;
    }
  }

  console.log()
  console.log(`hubAddress: "${hub.address}"`)
  console.log(`rewardAddress: "${reward.address}"`)
  console.log(`rewardsDispatcherAddress: "${rewardsDispatcher.address}"`)
  console.log(`validatorsRegistryAddress: "${validatorsRegistry.address}"`)
  console.log(`bSeiTokenAddress: "${bSeiToken.address}"`)
  console.log(`stSeiTokenAddress: "${stSeiToken.address}"`)
  console.log()
  console.log(`--- --- deployed staking contracts info --- ---`);
  const tableData = [
    {name: `hub`, ...hub},
    {name: `reward`, ...reward},
    {name: `rewardsDispatcher`, ...rewardsDispatcher},
    {name: `validatorsRegistry`, ...validatorsRegistry},
    {name: `bSeiToken`, ...bSeiToken},
    {name: `stSeiToken`, ...stSeiToken},
  ]
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  if (deployAddressFlag && hub.address && bSeiToken.address && stSeiToken.address && rewardsDispatcher.address && validatorsRegistry.address && reward.address) {
    console.log("Updating hub's config...")
    await executeContract(RPC_ENDPOINT, wallet, hub.address, {
      update_config: {
        bsei_token_contract: bSeiToken.address,
        stsei_token_contract: stSeiToken.address,
        rewards_dispatcher_contract: rewardsDispatcher.address,
        validators_registry_contract: validatorsRegistry.address,
        rewards_contract: reward.address,
      }
    }, "", parseCoins(""))
    console.log("Updating hub's config end")
  }

  // console.log()
  // const hubUpdateParamsRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, {
  //   update_params: {
  //     epoch_period: 260000,
  //     unbonding_period: 259200,
  //     peg_recovery_fee: "0.005",
  //     er_threshold: "1.0",
  //   }
  // }, "", parseCoins(""))
  // console.log(`ret: ${JSON.stringify(hubUpdateParamsRes)}`)
  // console.log("Updating hub's params end")

  const hubParametersRes =  await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, {parameters: {}})
  console.log(`hubParametersRes: ${JSON.stringify(hubParametersRes)}`)

  //======================deployed contracts，change creator to update_global_index=======================================//
  // change creator，
  // await executeContract(RPC_ENDPOINT, wallet, hub.address,
  // {
  //   update_config: {
  //     owner : "sei1xm3mccak0yjfts96jszdldxka6xkw00ywv6au0"
  //   }
  // }, "", parseCoins("") )
  // console.log("transfer owener ok.")

  const address1NativeBalance2 = await queryAddressBalance(LCD_ENDPOINT, account.address, "usei");
  const address1StableCoinBalance2 = await queryAddressBalance(LCD_ENDPOINT, account.address, stable_coin_denom);
  const address2NativeBalance2 = await queryAddressBalance(LCD_ENDPOINT, account2.address, "usei");
  const address2StableCoinBalance2 = await queryAddressBalance(LCD_ENDPOINT, account2.address, stable_coin_denom);

  console.log()
  console.log(`--- --- after balances --- ---`)
  console.table([
    {address: account.address, nativeBalance: JSON.stringify(address1NativeBalance2.balance), stableCoinBalance: JSON.stringify(address1StableCoinBalance2.balance)},
    {address: account2.address, nativeBalance: JSON.stringify(address2NativeBalance2.balance), stableCoinBalance: JSON.stringify(address2StableCoinBalance2.balance)},
  ], [`address`, `nativeBalance`, `stableCoinBalance`]);

  console.log(`--- --- deploy staking contracts end --- ---`);
}

main().catch(console.log);

