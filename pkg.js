const { run } = require("./dist/index.js");

run({
  debug: false,
  rc: false,
  add: 1,
  whiteSpace: "  ",
  rootPath: ".",
  outDist: "dist",
  useYarn: true,
  outTransform: undefined
});
