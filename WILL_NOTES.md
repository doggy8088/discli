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

## 環境變數

目前 `discli` 的執行程式碼使用 7 個不重複的環境變數：

| 環境變數 | 用途 | 必要性或預設值 |
|---|---|---|
| `DISCORD_BOT_TOKEN` | Discord Bot Token | 可改用 `--token` 或 `discli config set token` |
| `DISCLI_PROFILE` | 覆寫本次執行的權限設定檔 | 選用；可用值為 `full`、`chat`、`readonly`、`moderation` |
| `DEEPGRAM_API_KEY` | Deepgram STT 與 TTS 的 API Key | 使用 Deepgram 時必要 |
| `OPENAI_API_KEY` | OpenAI Whisper STT 與 TTS 的 API Key | 使用 OpenAI 語音功能時必要 |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS 的 API Key | 使用 ElevenLabs 時必要 |
| `DISCLI_DEEPGRAM_MODEL` | Deepgram STT 模型 | 選用；預設為 `nova-3` |
| `DISCLI_DEEPGRAM_LANGUAGE` | Deepgram STT 辨識語言 | 選用；預設為 `multi` |

只使用 Discord 文字、REST API 或基本 Gateway 功能時，不需要設定語音
供應商的環境變數。`DISCORD_BOT_TOKEN` 也可以改存於 discli 設定檔。

Shell 設定範例：

```sh
export DISCORD_BOT_TOKEN="your-discord-bot-token"
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
