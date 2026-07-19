# Will 的 discli 筆記

## 安裝本機版本

使用 `uv tool install` 將目前工作樹安裝成固定快照：

```sh
uv tool install --force /Users/will/projects/discli
```

安裝位置：

- 執行檔：`~/.local/bin/discli`
- uv 隔離環境：`~/.local/share/uv/tools/discord-cli-agent`
- Python 套件名稱：`discord-cli-agent`
- CLI 命令名稱：`discli`

這是不使用 `--editable` 的固定快照。修改專案原始碼後，已安裝的
`discli` 不會自動更新；需再次執行相同的安裝命令。

## 驗證安裝

```sh
command -v discli
discli --help
uv tool list
```

`command -v discli` 應顯示：

```text
/Users/will/.local/bin/discli
```

## 更新本機版本

切換至要安裝的分支或提交後，重新執行：

```sh
uv tool install --force /Users/will/projects/discli
```

`--force` 會使用目前工作樹重新建立 `discord-cli-agent` 工具環境，並更新
`~/.local/bin/discli`。

## 移除

套件名稱與 CLI 命令名稱不同，因此移除時使用套件名稱：

```sh
uv tool uninstall discord-cli-agent
```

移除後可確認命令已不存在：

```sh
command -v discli
test ! -e ~/.local/bin/discli
```
