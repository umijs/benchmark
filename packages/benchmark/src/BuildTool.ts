import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import kill from "tree-kill";

interface BuildToolOptions {
  name: string,
  cwd: string,
  port: number,
  startedRegex: RegExp,
  script: string,
  buildScript: string,
  clean?: Function,
}

export class BuildTool {
  name: string;
  #opts: BuildToolOptions;
  #child: any;
  constructor(opts: BuildToolOptions) {
    this.name = opts.name;
    this.#opts = opts;
  }

  async startServer() {
    let startTime = new Date().getTime();
    let child = spawn(`npm`, ["run", this.#opts.script], { stdio: 'pipe', shell: true, env: { ...process.env, NO_COLOR: '1' } });
    this.#child = child;
    process.on('exit', async () => {
      await this.#stop();
    });
    return new Promise((resolve, reject) => {
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
        const match = this.#opts.startedRegex.exec(data);
        if (match) {
          resolve(new Date().getTime() - startTime);
        }
      });
      child.on('error', (error) => {
        console.log(`${this.#opts.name} error: ${error.message}`);
        reject(error);
      });
      child.on('exit', (code) => {
        if (code !== null && code !== 0 && code !== 1) {
          console.log(`${this.#opts.name} exit: ${code}`);
          reject(code);
        }
      });
    });
  }

  async #stop() {
    if (this.#child) {
      this.#child.stdin.pause();
      this.#child.stdout.destroy();
      this.#child.stderr.destroy();
      return new Promise((resolve) => {
        kill(this.#child.pid, resolve);
      });
    }
  }

  #jsSize(dirPath: string) {
    let files = fs.readdirSync(dirPath);
    let size = 0;
    for (let file of files) {
      let stat = fs.statSync(path.join(dirPath, file));
      if (stat.isDirectory()) {
        size += this.#jsSize(path.join(dirPath, file));
      } else if (file.endsWith('.js')) {
        size += stat.size;
      }
    }
    return size;
  }

  async startProductionBuild(): Promise<{ time: number, jsSize: number }> {
    let startTime = new Date().getTime();
    let script = this.#opts.buildScript.split(' ');
    let child = spawn(script[0], script.slice(1), {
      cwd: this.#opts.cwd,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, NO_COLOR: '1' },
    });
    this.#child = child;
    return new Promise((resolve, reject) => {
      child.on('error', (error) => {
        console.log(`${this.#opts.name} error: ${error.message}`);
        reject(error);
      });
      child.on('exit', (code) => {
        if (code !== null && code !== 0 && code !== 1) {
          console.log(`${this.#opts.name} exit: ${code}`);
          reject(code);
        }
        let time = new Date().getTime() - startTime;
        let distPath = path.join(this.#opts.cwd, 'dist');
        let jsSize = this.#jsSize(distPath);
        resolve({ time, jsSize });
      });
    });
  }

  async clean() {
    await this.#opts.clean?.();
  }
}
