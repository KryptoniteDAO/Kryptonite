import { doCodegenByModule } from "@/codegenHelpers";
import { MERKLE_CONTRACTS_PATH, MERKLE_MODULE_NAME } from "./merkle_constants.ts";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${MERKLE_MODULE_NAME}`);

  await doCodegenByModule(MERKLE_MODULE_NAME, MERKLE_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${MERKLE_MODULE_NAME}`);
})().catch(console.error);
