import { build, start } from "@farmfe/core";
import path from "path";
const buildOpts = {
  // root: path.resolve('data'),
  compilation: {
    persistentCache: false,
    presetEnv: false,
    progress: false,
  },
  plugins: ["@farmfe/plugin-react"],
};

await start(buildOpts);
