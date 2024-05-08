import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import { build } from '@okamjs/okam';

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
      hooks: {},
      watch: false,
    });
  }

  async dev() {
    await build({
      root: this.opts.root,
      // @ts-ignore
      config: {},
      hooks: {},
      watch: true,
    });
  }
}
