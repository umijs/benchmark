import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import { build, Server, logger, Compiler } from '@farmfe/core';

interface FarmOpts extends BaseBundlerOpts {
}

export class Farm extends BaseBundler {
  constructor(opts: FarmOpts) {
    super(opts);
  }

  async build(opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      root: this.opts.root,
      plugins: [
        require.resolve('@farmfe/plugin-react'),
      ],
    };
    await build(buildOpts);
  }

  async dev(opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      root: this.opts.root,
      output: {
        publicPath: '/',
      },
    };
    let compiler = new Compiler({
      config: buildOpts,
      jsPlugins: [
        require.resolve('@farmfe/plugin-react'),
      ],
      rustPlugins: [],
    });
    let server = new Server({
      compiler,
      logger,
    });
    await server.createServer({
      // @ts-ignore
      hmr: {
        port: 3000,
        host: '0.0.0.0',
      },
      port: 3000,
      host: '0.0.0.0',
    });
    server.listen();
  }
}
