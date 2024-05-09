import { BaseBundler, BaseBundlerOpts } from "./BaseBundler";
import vite from 'vite';

interface ViteOpts extends BaseBundlerOpts {
}

export class Vite extends BaseBundler {
  constructor(opts: ViteOpts) {
    super(opts);
  }

  async build() {
    const buildOpts = {
      root: this.opts.root,
    };
    await vite.build(buildOpts);
  }

  async dev() {
    throw new Error('Not implemented');
  }
}
