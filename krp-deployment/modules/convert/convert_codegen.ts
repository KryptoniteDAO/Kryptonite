import { doCodegenByModule } from "@/codegenHelpers";
import { CONVERT_CONTRACTS_PATH, CONVERT_MODULE_NAME } from "./convert_constants";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${CONVERT_MODULE_NAME}`);

  const handleContractName = (name: string): string => {
    return name.replaceAll("krp_", "");
  };
  await doCodegenByModule(CONVERT_MODULE_NAME, CONVERT_CONTRACTS_PATH, undefined,handleContractName);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${CONVERT_MODULE_NAME}`);
})().catch(console.error);
