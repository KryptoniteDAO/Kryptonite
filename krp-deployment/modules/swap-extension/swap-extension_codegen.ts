import { doCodegenByModule } from "@/codegenHelpers";
import { SWAP_EXTENSION_CONTRACTS_PATH, SWAP_EXTENSION_MODULE_NAME } from "./swap-extension_constants";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${SWAP_EXTENSION_MODULE_NAME}`);

  await doCodegenByModule(SWAP_EXTENSION_MODULE_NAME, SWAP_EXTENSION_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${SWAP_EXTENSION_MODULE_NAME}`);
})().catch(console.error);
