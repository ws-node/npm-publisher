build:
	rm -rf dist
	tsc
	node ./pkg.js
