import assert from "assert";
import yParser from "yargs-parser";

const argv = yParser(process.argv.slice(2));
const VALID_BUILDERS = ["mako", "esbuild", "vite", "webpack", "rsbuild", "farm"];
const VALID_COMMANDS = ["build", "dev"];

(async () => {
  let [bundler, command] = argv._ as string[];
  console.log(bundler, command);

  if (argv.h || argv.help) {
    showHelp();
    return;
  } else if (argv.v || argv.version) {
    console.log(require("../package.json").version);
    return;
  } else if (!bundler || !command) {
    showHelp();
    return;
  }
  console.log("走进来没");

  assert(VALID_BUILDERS.includes(bundler as string), `Invalid bundler: ${bundler}`);
  assert(VALID_COMMANDS.includes(command as string), `Invalid command: ${command}`);
  console.log("这块进不来啊");

  let type = bundler[0].toUpperCase() + bundler.slice(1);
  console.log(type);

  console.log(`Building with ${bundler}...`);
  try {
    await import(`./bundlers/${type}.js`)
  } catch (error) {
    console.error(`Failed to import module: ${error}`);
  }

  let Bundler = (await import(`./bundlers/${type}.js`))[type];
  console.log(Bundler);

  new Bundler({
    root: process.cwd(),
    entry: {},
  })[command](argv);
})().catch((e) => {
  console.log("报错了啊", e);

  console.error(e);
  // process.exit(1);
});

function showHelp() {
  console.log(`
  Usage: bundler <bundler> <command> [options]

  Options:
    -h, --help      Show this message
    -v, --version   Show version number

  Commands:
    build           Build the project
    dev             Start the development server

  Bundlers:
    mako            Mako
    vite            Vite
    webpack         Webpack
    rsbuild         RsBuild
    farm            Farm

  Examples:
    bundler mako build
    bundler vite dev
  `);
}
