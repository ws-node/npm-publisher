# npm-publisher

> @bigmogician/publisher

## install

```bash
# yarn
yarn add @bigmogician/publisher -D
```

```bash
# npm
npm install --dev @bigmogician/publisher
```

## usage

```bash
npx bmpub publish
# use yarn to publish.
npx bmpub publish --yarn
# publish and add version automatically.
npx bmpub publish --add 1
# use rc mode to publish, add version automatically.
npx bmpub publish --rc --add 1
# show the result but not to publish your package.
npx bmpub publish --debug
# redefine root path of project and out folder.
npx bmpub publish --root ./submodule --out ./dist-folder
# use your own config file to override the default config.
npx bmpub publish --config ./abc/fk.config.js
```

```typescript
// the interface struct of configs
export interface IConfig {
  // debug mode, default [false]
  debug?: boolean;
  // rc mode, default [false]
  rc?: boolean;
  // add mode, default [0]
  add?: number;
  // whitespace mode, works for package.json formatter, default [" "]
  whiteSpace?: string;
  // out mode, default ["dist"]
  outDist?: string;
  // root mode, default ["."]
  rootPath?: string;
  // yarn mode, default [false]
  useYarn?: boolean;
  // register path mode, default [undefined]
  register?: string;
  // package transfomer, default [undefined]
  outTransform?: (json: IPackage) => IPackage;
  // std out, default [out => console.log(out || "no std output.")]
  onStdOut?: (out: string) => void;
  // std err, default [out => console.log(out || "no std outerr.")]
  onStdErr?: (out: string) => void;
}
```
