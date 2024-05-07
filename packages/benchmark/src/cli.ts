import path from "path";
import { rmSync } from "fs";
import { BuildTool } from "./BuildTool";

interface Result {
  name: string;
  production: number;
  jsSize: number;
}

async function main() {
  let count = 3;
  let hotRun = process.argv.includes('--hot');
  let buildToolsData = [
    { name: 'mako', port: 3000, startedRegex: /Compiled in/ },
    { name: 'rsbuild', port: 3000, startedRegex: /Client compiled/ },
    { name: 'farm', port: 3000, startedRegex: /Client compiled/ },
    { name: 'webpack', port: 8000, startedRegex: /Compiled in/ },
  ];
  let buildTools = buildToolsData.map((data) => {
    let cwd = path.join(process.cwd(), 'projects', 'turbopack-test-app');
    return new BuildTool({
      ...data,
      cwd,
      clean() {
        if (data.name === 'farm') {
          rmSync(path.join(cwd, 'dist'), { recursive: true, force: true });
          rmSync(path.join(cwd, 'node_modules/.farm'), { recursive: true, force: true });
        }
      },
      script: `pnpm bundler ${data.name} dev`,
      buildScript: `pnpm bundler ${data.name} build`,
    });
  });
  console.log(`Running ${hotRun ? 'hot' : 'cold'} run ${count} times`);

  let results: Result[] = [];
  for (let buildTool of buildTools) {
    let result: Partial<Result> = {
      name: buildTool.name,
    };
    let sum = 0;
    for (let i = 0; i < count; i++) {
      console.log(`Running: ${buildTool.name} (${i + 1})`);
      await buildTool.clean();
      let { time, jsSize } = await buildTool.startProductionBuild();
      sum += time;
      result.jsSize = jsSize;
    }
    result.production = sum / count;
    results.push(result as Result);
  }

  console.log('-----');
  console.log('Results');
  let out = results.map(({ name, production, jsSize }) => ({
    name,
    // 'startup time': result.serverStart ? `${result.startup.toFixed(2)}ms (including SSUT: ${result.serverStart.toFixed(2)}ms)` : `${result.startup.toFixed(2)}ms`,
    // 'Root HMR time': `${result.rootHmr.toFixed(2)}ms`,
    // 'Leaf HMR time': `${result.leafHmr.toFixed(2)}ms`,
    'production time': `${production.toFixed(2)}ms`,
    'js size': `${(jsSize / 1024).toFixed(2)}kb`,
  }));
  console.table(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
