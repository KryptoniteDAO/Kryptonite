import { doCodegenByModule } from "@/codegenHelpers";

(async (): Promise<void> => {
  let modulesName: string = "nft";
  let contractsPath: string = "\\github\\CosmWasm\\we-bump\\Lighthouse-core";
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${modulesName}`);

  await doCodegenByModule(modulesName, contractsPath);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${modulesName}`);
})().catch(console.error);
