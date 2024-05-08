import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import { createRsbuild } from '@rsbuild/core';

interface RsbuildOpts extends BaseBundlerOpts {
}

export class Rsbuild extends BaseBundler {
  constructor(opts: RsbuildOpts) {
    super(opts);
  }

  async build(opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      root: this.opts.root,
    };
    let rsbuild = await createRsbuild();
    await rsbuild.build();
  }

  async dev(opts: BaseBundlerBuildOpts = {}) {
    let rsbuild = await createRsbuild();
    await rsbuild.startDevServer();
  }
}
