import { doCodegenByModule } from "@/codegenHelpers";
import { STAKING_CONTRACTS_PATH, STAKING_MODULE_NAME } from "./staking_constants";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${STAKING_MODULE_NAME}`);

  const handleContractName = (name: string): string => {
    return name.replaceAll("basset_sei_", "");
  };
  await doCodegenByModule(STAKING_MODULE_NAME, STAKING_CONTRACTS_PATH, undefined, handleContractName);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${STAKING_MODULE_NAME}`);
})().catch(console.error);
