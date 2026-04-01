.PHONY: test build lint coverage

test:
	npx vitest run

build:
	npx tsc

lint:
	npx tsc --noEmit

coverage:
	npx vitest run --coverage
