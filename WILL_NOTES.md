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
discli --version
discli --help
uv tool list
```

`command -v discli` 應顯示：

```text
/Users/will/.local/bin/discli
```

## 環境變數

目前 `discli`（v0.13.0）的執行程式碼會讀取 8 個環境變數：

| 環境變數 | 用途 | 必要性或預設值 |
|---|---|---|
| `DISCORD_BOT_TOKEN` | Discord Bot Token | 可改用 `--token` 或 `discli config set token` |
| `DISCORD_TOKEN` | Token 的備援來源 | 選用；優先順序最低，只有前三種來源都沒有 Token 時才使用 |
| `DISCLI_PROFILE` | 覆寫本次執行的權限設定檔 | 選用；可用值為 `full`、`chat`、`readonly`、`moderation` |
| `DEEPGRAM_API_KEY` | Deepgram STT 與 TTS 的 API Key | 使用 Deepgram 時必要 |
| `OPENAI_API_KEY` | OpenAI Whisper STT 與 TTS 的 API Key | 使用 OpenAI 語音功能時必要 |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS 的 API Key | 使用 ElevenLabs 時必要 |
| `DISCLI_DEEPGRAM_MODEL` | Deepgram STT 模型 | 選用；預設為 `nova-3` |
| `DISCLI_DEEPGRAM_LANGUAGE` | Deepgram STT 辨識語言 | 選用；預設為 `multi` |

另外，`DISCLI_TTS` 與 `DISCLI_STT` 只有 `discli setup` 精靈會讀取，用來預選
語音供應商，一般指令不會用到。

只使用 Discord 文字、REST API 或基本 Gateway 功能時，不需要設定語音
供應商的環境變數。Token 也可以改存於 discli 設定檔。

### Token 解析順序

由高到低：

1. `--token` 旗標
2. `DISCORD_BOT_TOKEN` 環境變數
3. `~/.discli/config.json`（`discli config set token ...`）
4. `DISCORD_TOKEN` 環境變數（備援）

在 macOS 與 Linux 上，`discli config set` 會把設定檔權限設為 `0600`、
`~/.discli/` 設為 `0700`。若想把環境變數中的 Token 存進設定檔：

```sh
discli config set token "$DISCORD_TOKEN"
```

第一次使用也可以執行 `discli setup`，由互動式精靈完成 Token、邀請連結、
權限設定檔與語音供應商提示（需要終端機，不適合在管線中執行）。

Shell 設定範例：

```sh
export DISCORD_BOT_TOKEN="your-discord-bot-token"
# 或使用備援變數（優先順序低於設定檔）：
# export DISCORD_TOKEN="your-discord-bot-token"
export DISCLI_PROFILE="readonly"

# 以下只在使用對應語音供應商時設定。
export DEEPGRAM_API_KEY="your-deepgram-api-key"
export OPENAI_API_KEY="your-openai-api-key"
export ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# 以下為選用的 Deepgram STT 覆寫值。
export DISCLI_DEEPGRAM_MODEL="nova-3"
export DISCLI_DEEPGRAM_LANGUAGE="multi"
```

不得將實際 Token 或 API Key 寫入 Git 追蹤的檔案。

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

## 文件翻譯與部署

`docs/` 已翻譯為台灣正體中文，並由 `.github/workflows/docs.yml` 在 `main`
有 `docs/**` 變更時部署到 GitHub Pages。

本機預覽：

```sh
npx --yes @litodocs/cli@1.4.2 dev -i ./docs
```

同步上游後，要重新翻譯的是上游改過的頁面。用上次同步的 commit 比對：

```sh
git diff <上次同步的 commit> upstream/main --stat -- docs
```

上游新增的 `docs/public/.well-known/paw-verify` 是維護者的驗證檔，部署後會出現在
你的網域下。
