import { doCodegenByModule } from "@/codegenHelpers";
import { CDP_CONTRACTS_PATH, CDP_MODULE_NAME } from "./cdp_constants";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${CDP_MODULE_NAME}`);

  await doCodegenByModule(CDP_MODULE_NAME, CDP_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${CDP_MODULE_NAME}`);
})().catch(console.error);
