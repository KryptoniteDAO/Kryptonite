import { doCodegenByModule } from "@/codegenHelpers";

(async (): Promise<void> => {
  let modulesName: string = "nft";
  let contractsPath: string = "\\github\\CosmWasm\\cw-nfts\\contracts\\cw721-base";
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${modulesName}`);

  await doCodegenByModule(modulesName, contractsPath);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${modulesName}`);
})().catch(console.error);
