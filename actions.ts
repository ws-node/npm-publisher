import * as fs from "fs";
const { exec } = require("child_process");

interface IPackage {
  name: string;
  version: string;
  description?: string;
  scripts?: { [key: string]: string };
  main?: string;
  types?: string;
  repository?: {
    type: string;
    url: string;
    [key: string]: string;
  };
  author?: string;
  license?: string;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

const DEFAULT_NAME = "package.json";

export function run({
  rc: rctokrn = false,
  rcAdd: rcadd = 0,
  whiteSpace: BLOCK = " ",
  rootPath = ".",
  outDist = "dist",
  outTransform = undefined,
  onStdOut = out => console.log(out || "no std output."),
  onStdErr = out => console.log(out || "no std outerr.")
}: {
  rc?: boolean;
  rcAdd?: number;
  whiteSpace?: string;
  outDist?: string;
  rootPath?: string;
  outTransform?: (json: IPackage) => IPackage;
  onStdOut?: (out: string) => void;
  onStdErr?: (out: string) => void;
} = {}) {
  const pkg: IPackage = require(`${rootPath}/${DEFAULT_NAME}`);
  const { version } = pkg;
  const [main, oldrc] = (version || "").split("-");
  let [, rc = "0"] = (oldrc || "").split(".");
  const rcNum = Number(rc) + Number(rcadd);
  pkg.version = `${main}${!!rctokrn ? `-rc.${rcNum}` : ""}`;
  save(pkg, `${rootPath}/${DEFAULT_NAME}`, BLOCK);
  save(pkg, `${outDist}/${DEFAULT_NAME}`, BLOCK, json =>
    !outTransform ? json : outTransform(json)
  );

  exec(
    `cd ${outDist} && npm publish`,
    (error: any, stdout: string, stderr: string) => {
      if (error) {
        save(pkg, `${rootPath}/${DEFAULT_NAME}`, BLOCK, json => ({
          ...json,
          version: `${main}${!!rctokrn ? `-${oldrc}` : ""}`
        }));
        throw error;
      } else {
        onStdOut(stdout);
        onStdErr(stderr);
      }
    }
  );
}

function save(
  json: any,
  path: string,
  block: string,
  transform?: (json: any) => any
) {
  let result = { ...json };
  if (transform) {
    result = transform(result);
  }
  fs.writeFileSync(path, JSON.stringify(result, null, block));
}
