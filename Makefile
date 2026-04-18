.PHONY: dev test build lint coverage

dev:
	cd web && npm run dev

test:
	npx vitest run

build:
	npx tsc

lint:
	npx tsc --noEmit

coverage:
	npx vitest run --coverage
