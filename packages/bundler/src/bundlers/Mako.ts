import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import { build } from '@umijs/mako';

interface MakoOpts extends BaseBundlerOpts {
}

export class Mako extends BaseBundler {
  constructor(opts: MakoOpts) {
    super(opts);
  }

  async build(opts: BaseBundlerBuildOpts = {}) {
    await build({
      root: this.opts.root,
      // @ts-ignore
      config: {
        mode: 'production',
        minify: opts.minify !== false,
      },
      plugins: [],
      watch: false,
    });
  }

  async dev() {
    await build({
      root: this.opts.root,
      // @ts-ignore
      config: {},
      plugins: [],
      watch: true,
    });
  }
}
