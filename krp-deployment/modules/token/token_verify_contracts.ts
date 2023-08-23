import type { WalletData } from "@/types";
import type { TokenContractsDeployed } from "@/modules";
import { loadingWalletData } from "@/env_data";
import { printChangeBalancesByWalletData } from "@/common";
import { tokenReadArtifact } from "./index";
import { printDeployedTokenContracts, TOKEN_MODULE_NAME } from "@/modules";
import { tokenContracts } from "@/contracts";
import { FundConfigResponse, GetClaimAbleKusdResponse, GetClaimAbleSeilorResponse, GetReservedSeilorForVestingResponse } from "@/contracts/token/Fund.types";
import { MinterResponse, VoteConfigResponse } from "@/contracts/token/VeSeilor.types";
import { GetBoostConfigResponse } from "@/contracts/token/Boost.types";
import { BalanceOfResponse, StakingConfigResponse, StakingStateResponse } from "@/contracts/token/Staking.types";
import { BalanceResponse, SeilorConfigResponse, TokenInfoResponse } from "@/contracts/token/Seilor.types";
import { QueryConfigResponse } from "@/contracts/token/Distribute.types";
import { ConfigInfosResponse } from "@/contracts/token/Treasure.types";
import { GlobalInfosResponse } from "@/contracts/token/Dispatcher.types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- verify deployed ${TOKEN_MODULE_NAME} contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkToken = tokenReadArtifact(walletData.chainId) as TokenContractsDeployed;
  await printDeployedTokenContracts(networkToken);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  const { seilor, veSeilor, treasure, distribute, dispatcher, fund, boost, stakingPairs } = networkToken;

  if (seilor?.address) {
    const seilorQueryClient = new tokenContracts.Seilor.SeilorQueryClient(walletData.signingCosmWasmClient, seilor.address);
    const seilorConfigResponse: SeilorConfigResponse = await seilorQueryClient.seilorConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.seilor config ok. \n   ${JSON.stringify(seilorConfigResponse)}`);
    const tokenInfoResponse: TokenInfoResponse = await seilorQueryClient.tokenInfo();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.seilor tokenInfo ok. \n   ${JSON.stringify(tokenInfoResponse)}`);
    const balanceRes: BalanceResponse = await seilorQueryClient.balance({ address: walletData.address });
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.seilor balance ok. \n  ${walletData.address} ${JSON.stringify(balanceRes)}`);
  }

  if (veSeilor?.address) {
    const veSeilorQueryClient = new tokenContracts.VeSeilor.VeSeilorQueryClient(walletData.signingCosmWasmClient, veSeilor.address);
    const configRes: VoteConfigResponse = await veSeilorQueryClient.voteConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veSeilor config ok. \n   ${JSON.stringify(configRes)}`);
    const tokenInfoResponse: TokenInfoResponse = await veSeilorQueryClient.tokenInfo();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veSeilor tokenInfo ok. \n   ${JSON.stringify(tokenInfoResponse)}`);
    const tokenMinerResponse: MinterResponse = await veSeilorQueryClient.minter();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veSeilor miner ok. \n   ${JSON.stringify(tokenMinerResponse)}`);
    const balanceRes: BalanceResponse = await veSeilorQueryClient.balance({ address: walletData.address });
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.veSeilor balance ok. \n  ${walletData.address} ${JSON.stringify(balanceRes)}`);
  }

  if (fund?.address) {
    const fundQueryClient = new tokenContracts.Fund.FundQueryClient(walletData.signingCosmWasmClient, fund.address);
    const configRes: FundConfigResponse = await fundQueryClient.fundConfig();
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund config ok. \n   ${JSON.stringify(configRes)}`);
    const claimAbleSeilorResponse: GetClaimAbleSeilorResponse = await fundQueryClient.getClaimAbleSeilor({ user: walletData.address });
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund getClaimAbleSeilor ok. \n   ${JSON.stringify(claimAbleSeilorResponse)}`);
    const reservedSeilorForVestingResponse: GetReservedSeilorForVestingResponse = await fundQueryClient.getReservedSeilorForVesting({ user: walletData.address });
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund getReservedSeilorForVesting ok. \n   ${JSON.stringify(reservedSeilorForVestingResponse)}`);
    const claimAbleKusdResponse: GetClaimAbleKusdResponse = await fundQueryClient.getClaimAbleKusd({ account: walletData.address });
    console.log(`\n   Query ${TOKEN_MODULE_NAME}.fund getClaimAbleKusd ok. \n   ${JSON.stringify(claimAbleKusdResponse)}`);
  }

  if (boost?.address) {
    const boostQueryClient = new tokenContracts.Boost.BoostQueryClient(walletData.signingCosmWasmClient, boost.address);
    const configRes: GetBoostConfigResponse = await boostQueryClient.getBoostConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.boost config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (treasure?.address) {
    const treasureQueryClient = new tokenContracts.Treasure.TreasureQueryClient(walletData.signingCosmWasmClient, treasure.address);
    const configRes: ConfigInfosResponse = await treasureQueryClient.queryConfigInfos();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.treasure config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (distribute?.address) {
    const distributeQueryClient = new tokenContracts.Distribute.DistributeQueryClient(walletData.signingCosmWasmClient, distribute.address);
    const configRes: QueryConfigResponse = await distributeQueryClient.queryConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.distribute config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (dispatcher?.address) {
    const dispatcherQueryClient = new tokenContracts.Dispatcher.DispatcherQueryClient(walletData.signingCosmWasmClient, dispatcher.address);
    const configRes: GlobalInfosResponse = await dispatcherQueryClient.queryGlobalConfig();
    console.log(`\n  Query ${TOKEN_MODULE_NAME}.dispatcher config ok. \n   ${JSON.stringify(configRes)}`);
  }

  if (stakingPairs && stakingPairs.length >= 0) {
    for (let stakingRewardsItem of stakingPairs) {
      if (stakingRewardsItem?.staking?.address) {
        console.log(`\n  staking: ${stakingRewardsItem?.staking?.address}`);
        const stakingQueryClient = new tokenContracts.Staking.StakingQueryClient(walletData.signingCosmWasmClient, stakingRewardsItem?.staking?.address);
        const configRes: StakingConfigResponse = await stakingQueryClient.queryStakingConfig();
        console.log(`\n  Query ${TOKEN_MODULE_NAME}.staking config ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(configRes)}`);
        const stateResponse: StakingStateResponse = await stakingQueryClient.queryStakingState();
        console.log(`\n  Query ${TOKEN_MODULE_NAME}.staking queryStakingState ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(stateResponse)}`);
        const balanceOfResponse: BalanceOfResponse = await stakingQueryClient.balanceOf({ account: walletData.address });
        console.log(`\n  Query ${TOKEN_MODULE_NAME}.staking balanceOf ok. staking_token: ${stakingRewardsItem?.staking_token} \n   ${JSON.stringify(balanceOfResponse)}`);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed ${TOKEN_MODULE_NAME} contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
