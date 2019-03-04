import * as cmd from "commander";
import * as path from "path";
import { IConfig, run } from "../actions";

const NAME = "publish";
const DF_NAME = "pkg.config.js";
const DF_CWD = process.cwd();

cmd.name(NAME);
cmd.description("fuck npm publish.");
cmd.option("-C, --config [configFile]", "the style mode you like.");
cmd.option("-R, --rc", "use [rc] mode to publish.");
cmd.option("-A, --add", "add to the version.");
cmd.option("-D, --debug", "use debug mode.");
cmd.option("-R, --root", "root path of project.");
cmd.option("-O, --out", "out folder of dist.");
cmd.option("--yarn", "use yarn instead of sb npm.");

cmd
  .action(
    (name: string, { yarn, debug, rc, add, root, out, config: CNAME }: any) => {
      if (name !== NAME) return;
      let defaultConfig: IConfig = {};
      try {
        defaultConfig = require(path.resolve(DF_CWD, CNAME || DF_NAME));
      } catch (error) {
        /** ignore */
        console.debug(
          `[bmpub publish] -> config file [${path.resolve(
            DF_CWD,
            CNAME || DF_NAME
          )}] not found.`
        );
      }
      const config: IConfig = {
        ...defaultConfig,
        useYarn: yarn || defaultConfig.useYarn,
        debug: debug || defaultConfig.debug,
        rc: rc || defaultConfig.rc,
        add: add || defaultConfig.add,
        rootPath: path.resolve(DF_CWD, root || defaultConfig.rootPath || "."),
        outDist: path.resolve(DF_CWD, out || defaultConfig.outDist || "dist")
      };
      run(config);
    }
  )
  .on("--help", () => {
    console.log("sorry, there's no shit here.");
  });

cmd.version("1.0.0-rc.1").parse(process.argv);

if (cmd.args.length === 0) {
  cmd.outputHelp();
}
