import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
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
  debug: fakeAction = false,
  rc: rctokrn = false,
  rcAdd: rcadd = 0,
  whiteSpace: BLOCK = " ",
  rootPath: root = ".",
  outDist: out = "dist",
  outTransform = undefined,
  onStdOut = out => console.log(out || "no std output."),
  onStdErr = out => console.log(out || "no std outerr.")
}: {
  debug?: boolean;
  rc?: boolean;
  rcAdd?: number;
  whiteSpace?: string;
  outDist?: string;
  rootPath?: string;
  outTransform?: (json: IPackage) => IPackage;
  onStdOut?: (out: string) => void;
  onStdErr?: (out: string) => void;
} = {}) {
  const rootPath = path.resolve(process.cwd(), root);
  const outDist = path.resolve(process.cwd(), out);
  const pkg: IPackage = require(`${rootPath}/${DEFAULT_NAME}`);
  const { version } = pkg;
  const [main, oldrc] = (version || "").split("-");
  let [, rc = "0"] = (oldrc || "").split(".");
  const rcNum = Number(rc) + Number(rcadd);
  pkg.version = `${main}${!!rctokrn ? `-rc.${rcNum}` : ""}`;
  const final = save(pkg, `${rootPath}/${DEFAULT_NAME}`, BLOCK);
  const distFinal = save(pkg, `${outDist}/${DEFAULT_NAME}`, BLOCK, json =>
    !outTransform ? json : outTransform(json)
  );

  console.log(chalk.cyan(`${root}/${DEFAULT_NAME} --> \n`));
  console.log(chalk.greenBright(JSON.stringify(final, null, BLOCK)));
  console.log(chalk.blue(`\n${out}/${DEFAULT_NAME} --> \n`));
  console.log(chalk.greenBright(JSON.stringify(distFinal, null, BLOCK)));

  if (fakeAction) {
    console.log(chalk.green("===============DEBUG================"));
    console.log(
      `\ncommand -> [${chalk.yellow(` cd ${outDist} && npm publish `)}]\n`
    );
    onStdOut("DEBUG: test stdout");
    onStdErr("DEBUG: test stderr");
    console.log(chalk.green("=============== END ================"));
    return;
  }
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
  return result;
}
