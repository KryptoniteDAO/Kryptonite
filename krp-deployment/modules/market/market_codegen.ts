import { doCodegenByModule } from "@/codegenHelpers";
import { MARKET_CONTRACTS_PATH, MARKET_MODULE_NAME } from "./market_constants";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${MARKET_MODULE_NAME}`);

  await doCodegenByModule(MARKET_MODULE_NAME, MARKET_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${MARKET_MODULE_NAME}`);
})().catch(console.error);
