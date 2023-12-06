import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { TokenStakingPairsContractsDeployed } from "@/modules";
import { doOraclePythConfigFeedInfo, doTokenFundSetVeFundMinter, doTokenFundUpdateConfig, doTokenKeeperUpdateConfig, doTokenPlatTokenUpdateConfig, doTokenVeTokenUpdateConfig, oracleConfigs, printDeployedTokenContracts, readDeployedContracts, tokenConfigs } from "@/modules";
import type { WalletData } from "@/types";
import { TOKEN_MODULE_NAME } from "./token_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${TOKEN_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { tokenNetwork, cdpNetwork, oracleNetwork } = readDeployedContracts(walletData.chainId);

  await printDeployedTokenContracts(tokenNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = true;

  const stable_coin_denom: string = cdpNetwork?.stable_coin_denom ?? walletData?.nativeCurrency?.coinMinimalDenom;
  // const usdRewardController: string = tokenConfigs?.usd_reward_controller || walletData?.activeWallet?.address;
  const { stakingPairs } = tokenConfigs;
  const { baseFeedInfoConfig } = oracleConfigs;
  await doTokenPlatTokenUpdateConfig(walletData, tokenNetwork, print);
  await doTokenVeTokenUpdateConfig(walletData, tokenNetwork, print);
  await doTokenFundUpdateConfig(walletData, tokenNetwork, stable_coin_denom, print);
  await doTokenKeeperUpdateConfig(walletData, tokenNetwork, stable_coin_denom, print);
  // await doDistributeUpdateRuleConfig(walletData, tokenNetwork, { ruleType: "loot_box", ruleOwner: tokenNetwork?.address }, print);

  if (!!stakingPairs && stakingPairs.length > 0) {
    for (const stakingRewardsPairConfig of stakingPairs) {
      const stakingRewardsPairsNetwork = tokenNetwork?.stakingPairs?.find((v: TokenStakingPairsContractsDeployed) => stakingRewardsPairConfig.staking_token === v.staking_token);
      // await doVeTokenSetMinters(walletData, tokenNetwork?.veToken, stakingRewardsPairsNetwork?.staking, false, print);
      await doTokenFundSetVeFundMinter(walletData, tokenNetwork?.fund, stakingRewardsPairsNetwork?.staking, true, print);

      /// add assetInfos feed price
      if (!!oracleNetwork?.oraclePyth) {
        const { oracleFeedInfoConfigs } = stakingRewardsPairConfig;
        if (!!oracleFeedInfoConfigs && oracleFeedInfoConfigs.length > 0) {
          for (const feedInfoConfig of oracleFeedInfoConfigs) {
            if (!feedInfoConfig?.asset || !feedInfoConfig?.priceFeedId) {
              console.log(`\n  skip oracle.oraclePyth assets feedInfo: ${feedInfoConfig?.asset} / ${feedInfoConfig?.priceFeedId}`);
              continue;
            }
            const feedInfo = Object.assign({}, baseFeedInfoConfig, feedInfoConfig);
            await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);
          }
        }
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${TOKEN_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
