import path from "path";
import { rmSync } from "fs";
import playwright from "playwright";
import { BuildTool } from "./BuildTool";

interface Result {
  name: string;
  startup: number;
  hotStartup: number;
  production: number;
  jsSize: number;
}

async function main() {
  let browser = await playwright.chromium.launch();
  let count = 3;
  let hotRun = process.argv.includes('--hot');
  let buildToolsData = [
    {
      name: 'mako',
      port: 3000,
      startedRegex: /Built in/
    },
    {
      name: 'rsbuild',
      port: 3000,
      startedRegex: /Client compiled/,
    },
    // {
    //   name: 'farm',
    //   port: 3000,
    //   startedRegex: /Client compiled/,
    //   clean({ cwd }: { cwd: string }) {
    //     rmSync(path.join(cwd, 'dist'), { recursive: true, force: true });
    //     rmSync(path.join(cwd, 'node_modules/.farm'), { recursive: true, force: true });
    //   },
    // },
    // {
    //   name: 'webpack',
    //   port: 8000,
    //   startedRegex: /Compiled in/,
    //   clean({ cwd }: { cwd: string }) {
    //     rmSync(path.join(cwd, 'node_modules/.cache'), { recursive: true, force: true });
    //   },
    // },
  ];
  let buildTools = buildToolsData.map((data) => {
    let cwd = path.join(process.cwd(), 'projects', 'turbopack-test-app');
    return new BuildTool({
      ...data,
      cwd,
      script: `pnpm bundler ${data.name} dev`,
      buildScript: `pnpm bundler ${data.name} build`,
    });
  });
  console.log(`Running ${hotRun ? 'hot' : 'cold'} run ${count} times`);

  async function getStartupTime(opts: { isHot: boolean, count: number, buildTool: BuildTool }) {
    let { isHot, count, buildTool } = opts;
    let sum = 0;
    for (let i = 0; i < count; i++) {
      if (!isHot) {
        await buildTool.clean();
      }
      let page = await (await browser.newContext()).newPage();
      await new Promise((resolve) => setTimeout(resolve, 300));
      let loadPromise = page.waitForEvent('load');
      const pageLoadStart = Date.now();
      await buildTool.startServer();
      sum += new Date().getTime() - pageLoadStart;
      page.goto(`http://localhost:${buildTool.port}`);
      await loadPromise;
      await buildTool.stop();
    }
    return { startup: sum / count };
  }

  async function getProductionData(opts: { count: number, buildTool: BuildTool }) {
    let { count, buildTool } = opts;
    let sum = 0;
    let jsSize = 0;
    for (let i = 0; i < count; i++) {
      console.log(`Running: ${buildTool.name} (${i + 1})`);
      await buildTool.clean();
      let data = await buildTool.startProductionBuild();
      sum += data.time;
      jsSize = data.jsSize;
    }
    return { production: sum / count, jsSize };
  }

  let results: Result[] = [];
  for (let buildTool of buildTools) {
    let result: Partial<Result> = {
      name: buildTool.name,
    };

    // dev
    let devData = await getStartupTime({ isHot: false, count, buildTool });
    result.startup = devData.startup;
    result.hotStartup = (await getStartupTime({ isHot: true, count, buildTool })).startup;

    // production build
    let data = await getProductionData({ count, buildTool })
    result.production = data.production;
    result.jsSize = data.jsSize;

    results.push(result as Result);
  }

  // cleanup
  await browser.close();

  console.log('-----');
  console.log('Results');
  let out = results.map(({ name, production, startup, hotStartup, jsSize }) => ({
    name,
    // 'startup time': result.serverStart ? `${result.startup.toFixed(2)}ms (including SSUT: ${result.serverStart.toFixed(2)}ms)` : `${result.startup.toFixed(2)}ms`,
    'startup time': `${startup.toFixed(2)}ms`,
    'hot startup time': `${hotStartup.toFixed(2)}ms`,
    // 'Root HMR time': `${result.rootHmr.toFixed(2)}ms`,
    // 'Leaf HMR time': `${result.leafHmr.toFixed(2)}ms`,
    'production time': `${production.toFixed(2)}ms`,
    'js size': `${(jsSize / 1024).toFixed(2)}kB`,
  }));
  console.table(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
