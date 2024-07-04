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
        sourcemap: false,
      },
      plugins: [
        '@farmfe/plugin-react'
      ],
    };
    await build(buildOpts);
  }

  async dev(_opts: BaseBundlerBuildOpts = {}) {

    const buildOpts = {
      root: this.opts.root,
      compilation: {
        persistentCache: false,
      },
      plugins: ['@farmfe/plugin-react']
    };

    await start(buildOpts);
  }
}
