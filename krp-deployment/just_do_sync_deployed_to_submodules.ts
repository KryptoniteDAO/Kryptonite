import { writeDeployedContractsToSubModules } from "./modules";

(async (): Promise<void> => {
  console.log(`\n  --- --- just do enter --- ---`);

  try {
    await writeDeployedContractsToSubModules({});
  } catch (error: any) {
    console.error(`writeDeployedContractsToSubModules error: `, error);
  }

  console.log(`\n  --- --- just do end --- ---`);
})().catch(console.error);
