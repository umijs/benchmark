import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import { build, start } from '@farmfe/core';
interface FarmOpts extends BaseBundlerOpts {
}

export class Farm extends BaseBundler {
  constructor(opts: FarmOpts) {
    super(opts);
  }

  async build(_opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      root: this.opts.root,
      compilation: {
        persistentCache: false,
        presetEnv: false,
        progress: false,
        sourcemap: false,
      },
      plugins: [
        '@farmfe/plugin-react'
      ],
    };
    await build(buildOpts);
  }

  async dev(_opts: BaseBundlerBuildOpts = {}) {
    console.log(this.opts.root);
    console.log("走哪里去了啊");

    const buildOpts = {
      root: this.opts.root,
      clearScreen: false,
      compilation: {
        persistentCache: false,
        presetEnv: false,
        progress: false,
      },
      plugins: ['@farmfe/plugin-react']
    };
    // const config = resolveConfig(buildOpts)
    // console.log(config);

    await start(buildOpts);
  }
}
