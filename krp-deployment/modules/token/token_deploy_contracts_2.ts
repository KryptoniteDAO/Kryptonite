import type { WalletData } from "@/types";
import type { TokenContractsDeployed, TokenStakingPairsContractsDeployed, CdpContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import {
  deploySeilorStaking,
  doVeSeilorSetMinters,
  tokenConfigs,
  deployTokenSeilor,
  deployTokenFund,
  deployTokenVeSeilor,
  deployTokenBoost,
  doTokenSeilorUpdateConfig,
  doTokenVeSeilorUpdateConfig,
  tokenReadArtifact,
  deployTokenDistribute,
  deployTokenKeeper,
  writeDeployed,
  cdpReadArtifact,
  TOKEN_MODULE_NAME,
  printDeployedTokenContracts
} from "@/modules";

(async (): Promise<void> => {
  const MODULE_NAME: string = TOKEN_MODULE_NAME;
  console.log(`\n  --- --- deploy ${MODULE_NAME} contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  const { stable_coin_denom } = networkCdp;
  const networkToken = tokenReadArtifact(walletData.chainId) as TokenContractsDeployed;
  if (!stable_coin_denom) {
    throw new Error(`\n  --- --- deploy ${MODULE_NAME} contracts error, Please deploy cpd contracts first --- ---`);
  }
  if (!tokenConfigs?.kusd_reward_controller) {
    throw new Error(`\n  --- --- deploy ${MODULE_NAME} contracts error, Please set the kusd info in configuration file variable --- ---`);
  }

  console.log(`\n  --- --- ${MODULE_NAME} contracts storeCode & instantiateContract enter --- ---`);

  // await deployTokenSeilor(walletData, networkToken);
  // await deployTokenDistribute(walletData, networkToken);
  await deployTokenVeSeilor(walletData, networkToken);
  await deployTokenFund(walletData, networkToken, stable_coin_denom);
  await deployTokenBoost(walletData, networkToken);
  await deployTokenKeeper(walletData, networkToken, stable_coin_denom);

  const stakingRewardsPairsConfig = tokenConfigs.stakingPairs;
  if (!!stakingRewardsPairsConfig && stakingRewardsPairsConfig.length > 0) {
    for (const stakingRewardsPairConfig of stakingRewardsPairsConfig) {
      await deploySeilorStaking(walletData, networkToken, stakingRewardsPairConfig);
    }
  }
  await writeDeployed({});

  console.log(`\n  --- --- ${MODULE_NAME} contracts storeCode & instantiateContract end --- ---`);

  await printDeployedTokenContracts(networkToken);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- kpt contracts configure enter --- ---`);
  const print: boolean = true;

  await doTokenSeilorUpdateConfig(walletData, networkToken, print);
  await doTokenVeSeilorUpdateConfig(walletData, networkToken, print);
  // await doKptDistributeUpdateRuleConfig(walletData, networkToken, { ruleType: "loot_box", ruleOwner: networkToken?.blindBoxInviterReward?.address }, print);

  if (!!stakingRewardsPairsConfig && stakingRewardsPairsConfig.length > 0) {
    for (const stakingRewardsPairConfig of stakingRewardsPairsConfig) {
      const stakingRewardsPairsNetwork = networkToken?.stakingPairs?.find((v: TokenStakingPairsContractsDeployed) => stakingRewardsPairConfig.staking_token === v.staking_token);
      await doVeSeilorSetMinters(walletData, networkToken?.veSeilor, stakingRewardsPairsNetwork?.staking, true, print);
    }
  }

  console.log(`\n  --- --- ${MODULE_NAME} contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy ${MODULE_NAME} contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
