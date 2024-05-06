import assert from "assert";
import yParser from "yargs-parser";

const argv = yParser(process.argv.slice(2));
const VALID_BUILDERS = ["mako", "esbuild", "vite", "webpack", "rsbuild", "farm"];
const VALID_COMMANDS = ["build", "dev"];

(async () => {
  let [bundler, command] = argv._ as string[];
  assert(VALID_BUILDERS.includes(bundler as string), `Invalid bundler: ${bundler}`);
  assert(VALID_COMMANDS.includes(command as string), `Invalid command: ${command}`);
  let type = bundler[0].toUpperCase() + bundler.slice(1);
  console.log(`Building with ${bundler}...`);
  let Bundler = (await import(`./bundlers/${type}.js`))[type];
  new Bundler({
    root: process.cwd(),
    entry: {},
  })[command](argv);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
