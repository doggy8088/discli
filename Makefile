.DEFAULT_GOAL := help

UV ?= uv
NPX ?= npx
LITO ?= @litodocs/cli@1.4.2

TESTS ?= tests/
PYTEST_ARGS ?=
ARGS ?= --help
DOCS_DIR ?= ./docs
DOCS_DIST ?= ./docs/dist

.PHONY: help install tool-install sync sync-voice test run build check docs-dev docs-build

help: ## 顯示可用的 Make 目標
	@awk 'BEGIN { FS = ":.*## " } /^[a-zA-Z0-9_-]+:.*## / { printf "  %-12s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

install: sync ## 安裝開發相依套件

tool-install: ## 強制將目前專案安裝為系統 uv tool
	$(UV) tool install --force .

sync: ## 同步開發相依套件
	$(UV) sync --dev

sync-voice: ## 同步開發與常用語音相依套件
	$(UV) sync --dev --extra voice --extra elevenlabs --extra deepgram

test: ## 執行測試；可用 TESTS 與 PYTEST_ARGS 調整範圍
	$(UV) run pytest $(TESTS) -v $(PYTEST_ARGS)

run: ## 執行 discli；以 ARGS 傳入 CLI 參數
	$(UV) run discli $(ARGS)

build: ## 建置 Python sdist 與 wheel
	$(UV) build

check: test build ## 執行測試並建置 Python 套件

docs-dev: ## 啟動 Lito 文件開發伺服器
	$(NPX) --yes $(LITO) dev -i $(DOCS_DIR)

docs-build: ## 將 Lito 文件建置至 DOCS_DIST
	$(NPX) --yes $(LITO) build -i $(DOCS_DIR) -o $(DOCS_DIST)
