# Benchmark

## Getting Started

```bash
$ pnpm i
$ pnpm run setup
$ pnpm benchmark
```

By default, the benchmark will run all the tools (mako, rsbuild, farm and webpack) and the projects (project/turbopack-test-app). You can specify the tools and the projects by using the following command.

```bash
$ pnpm benchmark --tools mako,rsbuild --project projects/lots-of-less
```

If you want to run build or dev for a specific project.

```bash
$ pnpm --filter @example/dead-simple bundler mako build
$ pnpm --filter @example/dead-simple bundler mako build --no-minify
$ pnpm --filter @example/dead-simple bundler mako dev
```

## LICENSE

MIT
