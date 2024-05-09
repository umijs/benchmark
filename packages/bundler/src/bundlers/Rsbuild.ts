import { BaseBundler, BaseBundlerOpts } from "./BaseBundler";
import { createRsbuild } from '@rsbuild/core';

interface RsbuildOpts extends BaseBundlerOpts {
}

export class Rsbuild extends BaseBundler {
  constructor(opts: RsbuildOpts) {
    super(opts);
  }

  async build() {
    let rsbuild = await createRsbuild();
    await rsbuild.build();
  }

  async dev() {
    let rsbuild = await createRsbuild();
    await rsbuild.startDevServer();
  }
}
