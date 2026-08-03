import { runWinbackAnalysis } from "./rfm-core";

runWinbackAnalysis()
  .then((result) => console.log(result))
  .catch((e) => console.error(e))
  .finally(() => process.exit());
