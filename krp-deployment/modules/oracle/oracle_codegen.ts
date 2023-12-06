import { doCodegenByModule } from "@/codegenHelpers";
import { ORACLE_CONTRACTS_PATH, ORACLE_MODULE_NAME } from "./oracle_constants";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${ORACLE_MODULE_NAME}`);

  await doCodegenByModule(ORACLE_MODULE_NAME, ORACLE_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${ORACLE_MODULE_NAME}`);
})().catch(console.error);
