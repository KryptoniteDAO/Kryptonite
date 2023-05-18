import { queryWasmContractByWalletData, readArtifact } from "./common";
import { loadingWalletData, loadingStakingData, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, loadingMarketData } from "./env_data";

require("dotenv").config();

async function main(): Promise<void> {
  console.log(`--- --- test sparrowswaporacle enter --- ---`);

  const walletData = await loadingWalletData();
  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH);
  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`--- --- missing some deployed staking address info --- ---`);
    process.exit(0);
    return;
  }

  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH);
  const { aToken, market, interestModel, distributionModel, oracle, overseer, liquidationQueue, custodyBSei } = await loadingMarketData(networkMarket);
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !oracle?.address || !overseer?.address || !liquidationQueue?.address || !custodyBSei?.address) {
    console.log(`--- --- missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  //let ret = queryWasmContract(RPC_ENDPOINT, wallet, sparrowSwapOracleAddress, {""})
  const pair1 = "sei1n6xhr5nevxu9537cwehwkp94ewdr9ysrcyl5lra73ng0tsc8eelsc45m4q";
  const pair2 = "sei1r0yqwcat93fddgk064s4jj3wschmka5tuv7ku9nqf2an2f5fv0ksvyggsq";
  const pair3 = "sei1dgs47p8fe384pepp4q09fqwxu0xpr99j69d7avhqkfs5vsyzvl2sajz57m";
  const pair4 = "sei1eg8c6g9sat4rpn92hkhfj83llgtlx5xjxnh9f9g9m9jlq4m63zks8sxrwe";
  const pair5 = "sei1gyqttyq4w7w923h4vmsh8shfrftf2em6x2ag2jhxeddz5n8dlk0srs98vr";
  const pair6 = "sei1fzjzhsjwmt678u7s70gr9jgpxhfmkhufcr67xzseadfsee23g44ssdpwjv";
  const pair7 = "sei1wdcpv4s7trs8l0qqf82zqxep8ywd27f3jcxe7fquahf7ewtgmglsm8y953";
  const pair8 = "sei1aktr0dzxqgms9emvj4cdvnlz20u4hedkdhgvk8jaxu3qlfd9vwcqstmypc";
  const pair9 = "sei1pqcgdn5vmf3g9ncs98vtxkydc6su0f9rk3uk73s5ku2xhthr6avswrwnrx";
  const pair10 = "sei1tx2l768290t6zun0njukgf3kwtjrh2vtqgjxq6le7e0wgphxtajs80d7xs";
  const pair11 = "sei1d00cmsk7uym7mtrsrcnhhdza8mpu346klhrpufkzzxkvy9wlegeqe9rlhp";
  const pair12 = "sei1yqpvlrp4j7nkvel6zg0x5xv2wgdur5rdm3x3ylqxz9kl27j0jl9s5wvakd";

  let ret1 = await queryWasmContractByWalletData(walletData, pair1, { pair: {} });
  console.log(`pair swap info: \n${JSON.stringify(ret1)}`);
}

main().catch(console.log);
