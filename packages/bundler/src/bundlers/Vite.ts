import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import vite from 'vite';

interface ViteOpts extends BaseBundlerOpts {
}

export class Vite extends BaseBundler {
  constructor(opts: ViteOpts) {
    super(opts);
  }

  async build(opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      root: this.opts.root,
    };
    await vite.build(buildOpts);
  }

  async dev(opts: BaseBundlerBuildOpts = {}) {
    throw new Error('Not implemented');
  }
}
