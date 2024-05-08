import { BaseBundler, BaseBundlerBuildOpts, BaseBundlerOpts } from "./BaseBundler";
import { build, Server, logger, Compiler } from '@farmfe/core';
// import react from '@farmfe/plugin-react';

interface FarmOpts extends BaseBundlerOpts {
}

export class Farm extends BaseBundler {
  constructor(opts: FarmOpts) {
    super(opts);
  }

  async build(_opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      root: this.opts.root,
      plugins: [
        // react,
      ],
    };
    await build(buildOpts);
  }

  async dev(_opts: BaseBundlerBuildOpts = {}) {
    const buildOpts = {
      root: this.opts.root,
      output: {
        publicPath: '/',
      },
    };
    let compiler = new Compiler({
      config: buildOpts,
      jsPlugins: [
        // react,
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
