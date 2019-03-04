build:
	rm -rf dist
	tsc
	mkdir dist/bin
	cp bin/bmpub dist/bin/
	cp README.md dist/

publish: build
	node dist/cmd/index.js publish -C pkg.js
