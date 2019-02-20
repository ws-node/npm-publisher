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
  add: rcadd = 0,
  whiteSpace: BLOCK = " ",
  rootPath: root = ".",
  outDist: out = "dist",
  register = undefined,
  outTransform = undefined,
  onStdOut = out => console.log(out || "no std output."),
  onStdErr = out => console.log(out || "no std outerr.")
}: {
  debug?: boolean;
  rc?: boolean;
  add?: number;
  whiteSpace?: string;
  outDist?: string;
  rootPath?: string;
  register?: string;
  outTransform?: (json: IPackage) => IPackage;
  onStdOut?: (out: string) => void;
  onStdErr?: (out: string) => void;
} = {}) {
  const rootPath = path.resolve(process.cwd(), root);
  const outDist = path.resolve(process.cwd(), out);
  const pkg: IPackage = require(`${rootPath}/${DEFAULT_NAME}`);
  const { version } = pkg;
  const oldVersion = String(version);
  const [main, oldrc] = (version || "").split("-");
  let [, rc = "0"] = (oldrc || "").split(".");
  const rcNum = Number(rc) + Number(rcadd);
  if (!!rctokrn) {
    pkg.version = `${main}-rc.${rcNum}`;
  } else {
    const [oneLev = "0", secLev = "0", ThrLev = "0"] = (main || "").split(".");
    pkg.version = `${oneLev}.${secLev}.${(Number(ThrLev) || 0) +
      Number(rcadd)}`;
  }
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
      `\ncommand -> [ ${chalk.yellow(
        createPublishCommand(outDist, register)
      )} ]\n`
    );
    onStdOut("DEBUG: test stdout");
    onStdErr("DEBUG: test stderr");
    console.log(chalk.green("=============== END ================"));
    revoke(pkg, `${rootPath}/${DEFAULT_NAME}`, BLOCK, oldVersion);
    return;
  }
  console.log(
    `run --> ${chalk.yellow(createPublishCommand(outDist, register))}\n`
  );
  exec(
    `cd ${outDist} && npm publish`,
    (error: any, stdout: string, stderr: string) => {
      if (error) {
        revoke(pkg, `${rootPath}/${DEFAULT_NAME}`, BLOCK, oldVersion);
        throw error;
      } else {
        onStdOut(stdout);
        onStdErr(stderr);
      }
    }
  );
}

function createPublishCommand(
  outDist: string,
  register: string | undefined
): string {
  return `cd ${outDist} && npm${!register ? " " : ` ${register} `}publish`;
}

function revoke(pkg: IPackage, path: string, block: string, version: string) {
  save(pkg, path, block, json => ({
    ...json,
    version
  }));
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
