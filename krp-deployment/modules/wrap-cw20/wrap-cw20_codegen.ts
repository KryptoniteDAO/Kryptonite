import { doCodegenByModule } from "@/codegenHelpers";
import { WRAP_CW20_CONTRACTS_PATH, WRAP_CW20_MODULE_NAME } from "@/modules/wrap-cw20/wrap-cw20_constants.ts";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${WRAP_CW20_MODULE_NAME}`);

  await doCodegenByModule(WRAP_CW20_MODULE_NAME, WRAP_CW20_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${WRAP_CW20_MODULE_NAME}`);
})().catch(console.error);
