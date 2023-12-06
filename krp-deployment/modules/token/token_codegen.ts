import { doCodegenByModule } from "@/codegenHelpers";
import { TOKEN_CONTRACTS_PATH, TOKEN_MODULE_NAME } from "./token_constants";

(async (): Promise<void> => {
  console.log(`\n  ✨✨✨ do code generate enter.✨ ${TOKEN_MODULE_NAME}`);

  await doCodegenByModule(TOKEN_MODULE_NAME, TOKEN_CONTRACTS_PATH);

  console.log(`\n  ✨✨✨ do code generate done!✨ ${TOKEN_MODULE_NAME}`);
})().catch(console.error);
