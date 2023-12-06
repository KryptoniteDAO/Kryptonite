import { printChangeBalancesByWalletData } from "@/common";
import { tokenContracts } from "@/contracts";
import { GetBoostConfigResponse } from "@/contracts/token/Boost.types";
import { GlobalInfosResponse } from "@/contracts/token/Dispatcher.types";
import { QueryConfigResponse } from "@/contracts/token/Distribute.types";
import { FundConfigResponse, GetClaimAbleSeilorResponse, GetClaimAbleKusdResponse, GetReservedSeilorForVestingResponse } from "@/contracts/token/Fund.types";
import {BalanceResponse, SeilorConfigResponse, TokenInfoResponse} from "@/contracts/token/Seilor.types";
import { BalanceOfResponse, StakingConfigResponse, StakingStateResponse } from "@/contracts/token/Staking.types";
import { ConfigInfosResponse } from "@/contracts/token/Treasure.types";
import { MinterResponse, VoteConfigResponse } from "@/contracts/token/VeSeilor.types";
import { loadingWalletData } from "@/env_data";
import { printDeployedTokenContracts, readDeployedContracts } from "@/modules";
import type { WalletData } from "@/types";
import { TOKEN_MODULE_NAME } from "./token_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- verify deployed contracts enter: ${TOKEN_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { tokenNetwork } = readDeployedContracts(walletData.chainId);

  await printDeployedTokenContracts(tokenNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  const { platToken, veToken, treasure, distribute, dispatcher, fund, boost, stakingPairs } = tokenNetwork;

  if (platToken?.address) {
    const platTokenQueryClient = new tokenContracts.Seilor.SeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, platToken.address);
    const platTokenConfigResponse: SeilorConfigResponse = await platTokenQueryClient.seilorConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.platToken config ok. \n   ${JSON.stringify(platTokenConfigResponse)}`);
    const tokenInfoResponse: TokenInfoResponse = await platTokenQueryClient.tokenInfo();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.platToken tokenInfo ok. \n   ${JSON.stringify(tokenInfoResponse)}`);
    const balanceRes: BalanceResponse = await platTokenQueryClient.balance({ address: walletData?.activeWallet?.address });
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.platToken balance ok. \n  ${walletData?.activeWallet?.address} ${JSON.stringify(balanceRes)}`);
  }

  if (veToken?.address) {
    const veTokenQueryClient = new tokenContracts.VeSeilor.VeSeilorQueryClient(walletData?.activeWallet?.signingCosmWasmClient, veToken.address);
    const configRes: VoteConfigResponse = await veTokenQueryClient.voteConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veToken config ok. \n   ${JSON.stringify(configRes)}`);
    const tokenInfoResponse: TokenInfoResponse = await veTokenQueryClient.tokenInfo();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veToken tokenInfo ok. \n   ${JSON.stringify(tokenInfoResponse)}`);
    const tokenMinerResponse: MinterResponse = await veTokenQueryClient.minter();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veToken miner ok. \n   ${JSON.stringify(tokenMinerResponse)}`);
    const balanceRes: BalanceResponse = await veTokenQueryClient.balance({ address: walletData?.activeWallet?.address });
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veToken balance ok. \n  ${walletData?.activeWallet?.address} ${JSON.stringify(balanceRes)}`);
  }

  if (fund?.address) {
    const fundQueryClient = new tokenContracts.Fund.FundQueryClient(walletData?.activeWallet?.signingCosmWasmClient, fund.address);
    const configRes: FundConfigResponse = await fundQueryClient.fundConfig();
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund config ok. \n   ${JSON.stringify(configRes)}`);
    const claimAbleTokenResponse: GetClaimAbleSeilorResponse = await fundQueryClient.getClaimAbleSeilor({ user: walletData?.activeWallet?.address });
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund getClaimAbleToken ok. \n   ${JSON.stringify(claimAbleTokenResponse)}`);
    const reservedTokenForVestingResponse: GetReservedSeilorForVestingResponse = await fundQueryClient.getReservedSeilorForVesting({ user: walletData?.activeWallet?.address });
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund getReservedTokenForVesting ok. \n   ${JSON.stringify(reservedTokenForVestingResponse)}`);
    const claimAbleKusdResponse: GetClaimAbleKusdResponse = await fundQueryClient.getClaimAbleKusd({ account: walletData?.activeWallet?.address });
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund getClaimAbleUsd ok. \n   ${JSON.stringify(claimAbleKusdResponse)}`);
  }

  if (boost?.address) {
    const boostQueryClient = new tokenContracts.Boost.BoostQueryClient(walletData?.activeWallet?.signingCosmWasmClient, boost.address);
    const configRes: GetBoostConfigResponse = await boostQueryClient.getBoostConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.boost config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (treasure?.address) {
    const treasureQueryClient = new tokenContracts.Treasure.TreasureQueryClient(walletData?.activeWallet?.signingCosmWasmClient, treasure.address);
    const configRes: ConfigInfosResponse = await treasureQueryClient.queryConfigInfos();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.treasure config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (distribute?.address) {
    const distributeQueryClient = new tokenContracts.Distribute.DistributeQueryClient(walletData?.activeWallet?.signingCosmWasmClient, distribute.address);
    const configRes: QueryConfigResponse = await distributeQueryClient.queryConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.distribute config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (dispatcher?.address) {
    const dispatcherQueryClient = new tokenContracts.Dispatcher.DispatcherQueryClient(walletData?.activeWallet?.signingCosmWasmClient, dispatcher.address);
    const configRes: GlobalInfosResponse = await dispatcherQueryClient.queryGlobalConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.dispatcher config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (stakingPairs && stakingPairs.length >= 0) {
    for (let stakingRewardsItem of stakingPairs) {
      if (stakingRewardsItem?.staking?.address) {
        console.log(`\n  staking: ${stakingRewardsItem?.staking?.address}`);
        const stakingQueryClient = new tokenContracts.Staking.StakingQueryClient(walletData?.activeWallet?.signingCosmWasmClient, stakingRewardsItem?.staking?.address);
        const configRes: StakingConfigResponse = await stakingQueryClient.queryStakingConfig();
        console.log(`\n  Query ${TOKEN_MODULE_NAME}.staking config ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(configRes)}`);
        const stateResponse: StakingStateResponse = await stakingQueryClient.queryStakingState();
        console.log(`\n  Query ${TOKEN_MODULE_NAME}.staking queryStakingState ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(stateResponse)}`);
        const balanceOfResponse: BalanceOfResponse = await stakingQueryClient.balanceOf({ account: walletData?.activeWallet?.address });
        console.log(`\n  Query ${TOKEN_MODULE_NAME}.staking balanceOf ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(balanceOfResponse)}`);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed contracts end: ${TOKEN_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
