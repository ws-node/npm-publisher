const { run } = require("./dist/index.js");

run({
  debug: true,
  rc: false,
  rcAdd: 0,
  whiteSpace: "  ",
  rootPath: ".",
  outDist: "dist",
  outTransform: undefined
});
