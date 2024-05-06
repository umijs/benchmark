import fs from 'fs';
import path from 'path';

export interface BaseBundlerOpts {
  root: string;
  entry: Record<string, string>;
}

export interface BaseBundlerBuildOpts {
  minify?: boolean;
}

export class BaseBundler {
  opts: BaseBundlerOpts;
  constructor(opts: BaseBundlerOpts) {
    if (!Object.keys(opts.entry).length) {
      opts.entry = this.#findDefaultEntry(opts.root);
    }
    this.opts = opts;
  }

  async build() {
    throw new Error('Not implemented');
  }

  async dev() {
    throw new Error('Not implemented');
  }

  #findDefaultEntry(root: string) {
    let entry: Record<string, string> = {};
    let defaultEntries = ['src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js'];
    for (let entryPath of defaultEntries) {
      let absEntryPath = path.join(root, entryPath);
      if (fs.existsSync(absEntryPath)) {
        entry['index'] = absEntryPath;
        break;
      }
    }
    return entry;
  }
}
