import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import { build, dev } from '@umijs/bundler-webpack';

interface WebpackOpts extends BaseBundlerOpts {
}

export class Webpack extends BaseBundler {
  constructor(opts: WebpackOpts) {
    super(opts);
  }

  async build(opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      cwd: this.opts.root,
      entry: this.opts.entry,
      config: {
        jsMinifier: opts.minify !== false ? 'esbuild' : 'none' as any,
      },
    };
    await build(buildOpts);
  }

  async dev(opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      cwd: this.opts.root,
      entry: this.opts.entry,
      config: {
        mfsu: false,
      },
    };
    await dev(buildOpts);
  }
}
