import path from "path";
import fs from "fs";
import playwright from "playwright";
import { BuildTool } from "./BuildTool";
import yParser from "yargs-parser";

interface Result {
  name: string;
  startup: number;
  rootHmr: number;
  leafHmr: number;
  hotStartup: number;
  production: number;
  jsSize: number;
}

async function main() {
  let argv = yParser(process.argv.slice(2));
  let browser = await playwright.chromium.launch();
  let count = 3;
  let buildToolsData = [
    {
      name: 'mako',
      port: 3000,
      startedRegex: /Built in/
    },
    {
      name: 'rsbuild',
      port: 3000,
      startedRegex: /Client compiled in/,
    },
    {
      name: 'farm',
      port: 3000,
      startedRegex: /Ready in/,
      clean({ cwd }: { cwd: string }) {
        fs.rmSync(path.join(cwd, 'dist'), { recursive: true, force: true });
        fs.rmSync(path.join(cwd, 'node_modules/.farm'), { recursive: true, force: true });
      },
    },
    {
      name: 'webpack',
      port: 8000,
      startedRegex: /Compiled in/,
      clean({ cwd }: { cwd: string }) {
        fs.rmSync(path.join(cwd, 'node_modules/.cache'), { recursive: true, force: true });
      },
    },
  ].filter((item) => {
    if (argv.tools) {
      return argv.tools.split(',').includes(item.name);
    }
    return true;
  });
  let buildTools = buildToolsData.map((data) => {
    let cwd = (() => {
      let project = argv.project || 'projects/turbopack-test-app';
      return path.resolve(process.cwd(), project);
    })();
    return new BuildTool({
      ...data,
      cwd,
      script: `pnpm bundler ${data.name} dev`,
      buildScript: `pnpm bundler ${data.name} build`,
    });
  });

  async function getStartupTime(opts: { isHot: boolean, count: number, buildTool: BuildTool }) {
    let { isHot, count, buildTool } = opts;
    let sum = 0;
    let rootHmrSum = 0;
    let leafHmrSum = 0;
    for (let i = 0; i < count; i++) {
      if (!isHot) {
        await buildTool.clean();
      }
      let page = await (await browser.newContext()).newPage();
      await new Promise((resolve) => setTimeout(resolve, 300));
      let loadPromise = page.waitForEvent('load');
      const pageLoadStart = Date.now();
      await buildTool.startServer();
      page.goto(`http://localhost:${buildTool.port}`);
      // TODO: fix farm dev server
      let isFarm = opts.buildTool.name === 'farm';
      if (!isFarm) {
        await loadPromise;
      }
      sum += new Date().getTime() - pageLoadStart;

      if (opts.buildTool.rootFile && !isFarm) {
        // wait for browser runtime ready
        await new Promise((resolve) => setTimeout(resolve, 300));
        let origin = fs.readFileSync(opts.buildTool.rootFile, 'utf-8');
        let rootConsolePromise = page.waitForEvent('console', { predicate: e => e.text().includes('root hmr') });
        fs.appendFileSync(opts.buildTool.rootFile, `\nconsole.log('root hmr');`);
        let hmrRootStart = Date.now();
        await rootConsolePromise;
        rootHmrSum += Date.now() - hmrRootStart;
        fs.writeFileSync(opts.buildTool.rootFile, origin);
      }

      if (opts.buildTool.leafFile && !isFarm) {
        // wait for browser runtime ready
        await new Promise((resolve) => setTimeout(resolve, 300));
        let origin = fs.readFileSync(opts.buildTool.leafFile, 'utf-8');
        let leafConsolePromise = page.waitForEvent('console', { predicate: e => e.text().includes('leaf hmr') });
        fs.appendFileSync(opts.buildTool.leafFile, `\nconsole.log('leaf hmr');`);
        let hmrRootStart = Date.now();
        await leafConsolePromise;
        leafHmrSum += Date.now() - hmrRootStart;
        fs.writeFileSync(opts.buildTool.leafFile, origin);
      }

      await buildTool.stop();
    }
    return { startup: sum / count, rootHmr: rootHmrSum / count, leafHmr: leafHmrSum / count };
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
    console.log(`Getting code startup time ${count} times`);
    let devData = await getStartupTime({ isHot: false, count, buildTool });
    result.startup = devData.startup;
    result.rootHmr = devData.rootHmr;
    result.leafHmr = devData.leafHmr;
    if (argv.hot) {
      console.log(`Getting hot startup time ${count} times`);
      result.hotStartup = (await getStartupTime({ isHot: true, count, buildTool })).startup;
    }

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
  let out = results.sort((a,b)=>a.startup - b.startup).map(({ name, production, startup, hotStartup, rootHmr, leafHmr, jsSize }) => ({
    name,
    'startup time': `${startup.toFixed(2)}ms`,
    ...(
      hotStartup ? {
        'hot startup time': `${hotStartup.toFixed(2)}ms`,
      } : {}
    ),
    // TODO: fix farm dev server
    'Root HMR time': name === 'farm' ? '' : `${rootHmr.toFixed(2)}ms`,
    'Leaf HMR time': name === 'farm' ? '' : `${leafHmr.toFixed(2)}ms`,
    'production time': `${production.toFixed(2)}ms`,
    'js size': `${(jsSize / 1024).toFixed(2)}kB`,
  }));
  console.table(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
