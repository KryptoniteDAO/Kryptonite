import { storeCode, instantiateContract, executeContract, queryWasmContract, loadAddressesBalances } from "./common";
import { loadingBaseData, loadingStakingData } from "./env_data";
import Decimal from "decimal.js";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- deploy staking contracts enter --- ---`);

  const { LCD_ENDPOINT, RPC_ENDPOINT, mnemonic, privateKey, wallet, account, mnemonic2, privateKey2, wallet2, account2, validator, stable_coin_denom, prefix, addressesBalances } = await loadingBaseData();

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData();

  console.log();
  console.log(`--- --- staking contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  if (!hub.address) {
    if (hub.codeId <= 0) {
      hub.codeId = await storeCode(RPC_ENDPOINT, wallet, hub.filePath);
    }
    if (hub.codeId > 0) {
      hub.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        hub.codeId,
        {
          epoch_period: 30,
          er_threshold: "1.0",
          peg_recovery_fee: "0",
          reward_denom: stable_coin_denom,
          unbonding_period: 120,
          underlying_coin_denom: "usei",
          validator: validator // local node validator address
        },
        "lido sei hub"
      );
      hub.deploy = true;
    }
    console.log(`hub: `, JSON.stringify(hub));
  }

  if (!reward.address && hub.address) {
    if (reward.codeId <= 0) {
      reward.codeId = await storeCode(RPC_ENDPOINT, wallet, reward.filePath);
    }
    if (reward.codeId > 0) {
      reward.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        reward.codeId,
        {
          owner: account.address,
          hub_contract: hub.address,
          reward_denom: stable_coin_denom
        },
        "sei reward"
      );
      reward.deploy = true;
    }
    console.log(`reward: `, JSON.stringify(reward));
  }

  if (!bSeiToken.address && hub.address) {
    if (bSeiToken.codeId <= 0) {
      bSeiToken.codeId = await storeCode(RPC_ENDPOINT, wallet, bSeiToken.filePath);
    }
    if (bSeiToken.codeId > 0) {
      bSeiToken.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        bSeiToken.codeId,
        {
          decimals: 6,
          hub_contract: hub.address,
          initial_balances: [],
          name: "bsei",
          symbol: "BSEI",
          mint: { minter: hub.address, cap: null }
        },
        "bond sei"
      );
      bSeiToken.deploy = true;
    }
    console.log(`bSeiToken: `, JSON.stringify(bSeiToken));
  }

  if (!rewardsDispatcher.address && hub.address && reward.address) {
    if (rewardsDispatcher.codeId <= 0) {
      rewardsDispatcher.codeId = await storeCode(RPC_ENDPOINT, wallet, rewardsDispatcher.filePath);
    }
    if (rewardsDispatcher.codeId > 0) {
      rewardsDispatcher.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        rewardsDispatcher.codeId,
        {
          lido_fee_address: account.address,
          lido_fee_rate: "0.05",
          hub_contract: hub.address,
          bsei_reward_contract: reward.address,
          stsei_reward_denom: "usei",
          bsei_reward_denom: stable_coin_denom
        },
        "reward dispatcher"
      );
      rewardsDispatcher.deploy = true;
    }
    console.log(`rewardsDispatcher: `, JSON.stringify(rewardsDispatcher));
  }

  if (!validatorsRegistry.address && hub.address) {
    if (validatorsRegistry.codeId <= 0) {
      validatorsRegistry.codeId = await storeCode(RPC_ENDPOINT, wallet, validatorsRegistry.filePath);
    }
    if (validatorsRegistry.codeId > 0) {
      validatorsRegistry.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        validatorsRegistry.codeId,
        {
          hub_contract: hub.address,
          registry: [
            {
              active: true,
              address: validator,
              total_delegated: "0"
            }
          ]
        },
        "validator registry"
      );
      validatorsRegistry.deploy = true;
    }
    console.log(`validatorsRegistry: `, JSON.stringify(validatorsRegistry));
  }

  if (!stSeiToken.address && hub.address) {
    if (stSeiToken.codeId <= 0) {
      stSeiToken.codeId = await storeCode(RPC_ENDPOINT, wallet, stSeiToken.filePath);
    }
    if (stSeiToken.codeId > 0) {
      stSeiToken.address = await instantiateContract(
        RPC_ENDPOINT,
        wallet,
        stSeiToken.codeId,
        {
          decimals: 6,
          hub_contract: hub.address,
          initial_balances: [],
          name: "stsei",
          symbol: "STSEI",
          mint: { minter: hub.address, cap: null }
        },
        "staking sei"
      );
      stSeiToken.deploy = true;
    }
    console.log(`stSeiToken: `, JSON.stringify(stSeiToken));
  }

  console.log();
  console.log(`--- --- staking contracts storeCode & instantiateContract end --- ---`);

  console.log();
  console.log(`# staking contracts uploaded codeId [optional]`);
  console.log(`hubCodeId: "${hub.codeId}"`);
  console.log(`rewardCodeId: "${reward.codeId}"`);
  console.log(`rewardsDispatcherCodeId: "${rewardsDispatcher.codeId}"`);
  console.log(`validatorsRegistryCodeId: "${validatorsRegistry.codeId}"`);
  console.log(`bSeiTokenCodeId: "${bSeiToken.codeId}"`);
  console.log(`stSeiTokenCodeId: "${stSeiToken.codeId}"`);

  console.log();
  console.log(`# staking contracts deployed address [optional]`);
  console.log(`hubAddress: "${hub.address}"`);
  console.log(`rewardAddress: "${reward.address}"`);
  console.log(`rewardsDispatcherAddress: "${rewardsDispatcher.address}"`);
  console.log(`validatorsRegistryAddress: "${validatorsRegistry.address}"`);
  console.log(`bSeiTokenAddress: "${bSeiToken.address}"`);
  console.log(`stSeiTokenAddress: "${stSeiToken.address}"`);

  console.log();
  console.log(`--- --- deployed staking contracts info --- ---`);
  const tableData = [
    { name: `hub`, ...hub },
    { name: `reward`, ...reward },
    { name: `rewardsDispatcher`, ...rewardsDispatcher },
    { name: `validatorsRegistry`, ...validatorsRegistry },
    { name: `bSeiToken`, ...bSeiToken },
    { name: `stSeiToken`, ...stSeiToken }
  ];
  console.table(tableData, [`name`, `codeId`, `address`, `deploy`]);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- staking contracts configure enter --- ---`);

  if (hub.address && bSeiToken.address && stSeiToken.address && rewardsDispatcher.address && validatorsRegistry.address && reward.address) {
    // console.log("query hub.address config enter");
    const hubConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, { config: {} });
    // console.log(`hubConfig: ${JSON.stringify(hubConfigRes)}`);
    // {"owner":"","reward_dispatcher_contract":"","validators_registry_contract":"","bsei_token_contract":"","stsei_token_contract":"","airdrop_registry_contract":null,"token_contract":""}
    const hubConfigFlag: boolean =
      rewardsDispatcher.address === hubConfigRes?.reward_dispatcher_contract && validatorsRegistry.address === hubConfigRes?.validators_registry_contract && bSeiToken.address === hubConfigRes?.bsei_token_contract && stSeiToken.address === hubConfigRes?.stsei_token_contract;
    // console.log(`hubConfigFlag`, hubConfigFlag);
    if (!hubConfigFlag) {
      console.log();
      console.log("Do hub's config enter");
      const hubUpdateConfigRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, {
        update_config: {
          bsei_token_contract: bSeiToken.address,
          stsei_token_contract: stSeiToken.address,
          rewards_dispatcher_contract: rewardsDispatcher.address,
          validators_registry_contract: validatorsRegistry.address,
          rewards_contract: reward.address
        }
      });
      console.log("Do hub's config ok. \n", hubUpdateConfigRes?.transactionHash);
    }
  }

  // console.log()
  // console.log("Do hub's update_params enter");
  // const hubUpdateParamsRes = await executeContract(RPC_ENDPOINT, wallet, hub.address, {
  //   update_params: {
  //     epoch_period: 260000,
  //     unbonding_period: 259200,
  //     peg_recovery_fee: "0.005",
  //     er_threshold: "1.0",
  //   }
  // })
  //  console.log("Do hub's update_params ok. \n", hubUpdateParamsRes?.transactionHash);

  console.log();
  console.log("Query hub.address config enter");
  const hubConfigRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, { config: {} });
  console.log(`hub.config: \n${JSON.stringify(hubConfigRes)}`);

  console.log();
  console.log("Query hub.address parameters enter");
  const hubParametersRes = await queryWasmContract(RPC_ENDPOINT, wallet, hub.address, { parameters: {} });
  console.log(`hub.parameters: \n${JSON.stringify(hubParametersRes)}`);
  // {"epoch_period":30,"underlying_coin_denom":"usei","unbonding_period":120,"peg_recovery_fee":"0","er_threshold":"1","reward_denom":"","paused":false}

  //======================deployed contracts，change creator to update_global_index=======================================//
  // change creator，
  // await executeContract(RPC_ENDPOINT, wallet, hub.address,
  // {
  //   update_config: {
  //     owner : ""
  //   }
  // }, "", parseCoins("") )
  // console.log("transfer owener ok.")

  console.log();
  console.log(`--- --- staking contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy staking contracts end --- ---`);

  const afterAddressesBalances = await loadAddressesBalances(LCD_ENDPOINT, [account.address, account2.address], ["usei", stable_coin_denom]);
  let address1UseiBalanceBefore = addressesBalances.find(v => account.address === v?.address && "usei" === v?.balance?.denom)?.balance?.amount;
  let address1UseiBalanceAfter = afterAddressesBalances.find(v => account.address === v?.address && "usei" === v?.balance?.denom)?.balance?.amount;
  let amount = new Decimal(address1UseiBalanceBefore).sub(new Decimal(address1UseiBalanceAfter)).div(new Decimal("10").pow(6)).toString();
  console.log(`deployed staking contracts payment: ${amount} sei`);
  console.log();
}

main().catch(console.log);
