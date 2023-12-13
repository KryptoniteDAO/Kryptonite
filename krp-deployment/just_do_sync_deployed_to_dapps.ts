import { writeDeployedContractsToDApps } from "./modules";

(async (): Promise<void> => {
  console.log(`\n  --- --- just do enter --- ---`);

  try {
    await writeDeployedContractsToDApps({});
  } catch (error: any) {
    console.error(`writeDeployedContractsToSubModules error: `, error);
  }

  console.log(`\n  --- --- just do end --- ---`);
})().catch(console.error);
