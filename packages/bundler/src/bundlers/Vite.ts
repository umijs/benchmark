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
      minify: opts.minify !== false,
    };
    await vite.build(buildOpts);
  }

  async dev() {
    const viteStartTime = performance.now();
    const buildOpts = {
      root: this.opts.root,
      server: { port: 3000 }
    };
    const server = await vite.createServer(buildOpts);
    await server.listen();
    const info = server.config.logger.info;
    const startupDurationString = `ready in ${Math.ceil(performance.now() - viteStartTime)} ms`;
    info(
      startupDurationString,
    );
    server.printUrls();
  }
}
