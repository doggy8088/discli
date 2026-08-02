# 語音與互動功能設計

**日期：** 2026-04-11
**狀態：** 已核准
**做法：** 分層模組（引擎與 CLI/serve 分離）

## 摘要

在 discli 新增：

- 全雙工語音（TTS 說話 + STT 轉錄聽到的內容）
- 音訊播放
- 豐富的互動元件（模態視窗、多步驟工作流程、持久化儀表板）

上述功能同時支援 CLI 指令與 serve 模式 JSONL actions。

## 語音引擎

### 依賴

必要元件：

- `PyNaCl` — Discord.py 的語音加密支援
- `discord-ext-voice-recv` — 語音接收支援（Discord.py 本身未內建）
- `silero-vad` — 語音活動偵測
- `audioop-lts` — PCM 音訊處理（Python 3.13+ 相容）

TTS 提供者（可選 extras）：

- `elevenlabs` — 最佳品質、約 200ms TTFB、可串流（建議預設）
- `openai` — 穩定且品質均衡
- `piper-tts` — 本地端、離線、輕量

STT 提供者（可選 extras）：

- `deepgram-sdk` — 即時 WebSocket 串流，約 100–300ms（建議預設）
- `openai` — Whisper API，批次模式
- `faster-whisper` — 本地運作，搭配 VAD 可近乎即時

### 架構（`src/discli/voice_engine.py`）

- **`VoiceEngine`** — 連線池（每個公會一條連線），提供非同步方法：connect/disconnect/move/speak/play/listen
- **`TTSProvider` 協定** — `async synthesize(text, voice, speed) -> AsyncIterator[bytes]`（回傳串流 PCM chunks）
- **`STTProvider` 協定** — `async transcribe(audio_stream) -> AsyncIterator[TranscriptionResult]`（回傳 partial 與 final 結果）
- **`AudioPlayer`** — 每連線共用佇列式播放器。處理 TTS 輸出與檔案/URL 播放，支援插斷優先順序。
- **`AudioListener`** — 封裝 `discord-ext-voice-recv`，每位使用者有 PCM 緩衝區，搭配 silero-vad 做語音切片，將片段交給 STT 提供者
- **`VoiceSession`** — 全雙工連線：同一連線同時收聽與發聲

### 設定（`~/.discli/config.json`）

```json
{
  "voice": {
    "tts_provider": "elevenlabs",
    "tts_voice": "default",
    "stt_provider": "deepgram",
    "vad_threshold": 0.5,
    "silence_duration_ms": 800,
    "playback_volume": 1.0
  }
}
```

API key 透過環境變數提供：`ELEVENLABS_API_KEY`、`DEEPGRAM_API_KEY`、`OPENAI_API_KEY`。

### CLI 指令（`commands/voice.py`）

- `discli voice join <channel>`、`leave`、`move`、`status`
- `discli voice speak <text> [--voice] [--speed]`
- `discli voice play <source> [--volume]`（檔案路徑或 URL）
- `discli voice stop`、`pause`、`resume`
- `discli voice listen [--duration] [--continuous]`
- `discli voice converse [--channel]` — 全雙工模式

### Serve 動作

- `voice_connect`、`voice_disconnect`、`voice_move`
- `voice_speak`、`voice_play`、`voice_stop`、`voice_pause`、`voice_resume`
- `voice_listen_start`、`voice_listen_stop`
- `voice_set_config`

### Serve 事件

- `voice_transcription` — `{user_id, username, text, confidence, channel_id, is_partial}`
- `voice_playback_started` / `voice_playback_finished`
- `voice_connected` / `voice_disconnected`
- `voice_user_speaking` / `voice_user_silent`

## 互動引擎

### 架構（`src/discli/interact_engine.py`）

**模態視窗與表單：**

- `Modal` 類別：建立含短/長文字輸入、驗證規則的 Discord 模態視窗
- Serve action：`modal_send {trigger_interaction_id, title, fields}`
- Serve event：`modal_submit {custom_id, user_id, values}`

**多步驟工作流程：**

- `Workflow` 類別：管理步驟序列（message/select/modal/confirm），以 `(user_id, workflow_id)` 追蹤使用者狀態
- 支援依使用者輸入做條件分支
- 可設定每步 timeout
- Serve action：`workflow_start {user_id, channel_id, workflow_definition}`、`workflow_cancel`
- Serve events：`workflow_step_completed`、`workflow_finished`、`workflow_timeout`

**持久化儀表板：**

- `Dashboard` 類別：搭配 embed + components 的自動更新訊息
- 支援分頁、角色選單、即時計數
- 記憶體儲存狀態，並可選擇 JSON 檔持久化
- Serve action：`dashboard_create`、`dashboard_update`、`dashboard_delete`
- Serve event：`dashboard_interaction`

**互動路由：**

核心 dispatch 依 `custom_id` 前綴分流：

- `modal:` → 模態視窗 handler
- `wf:` → 工作流程 handler
- `dash:` → 儀表板 handler
- `voice:` → 語音引擎

### CLI 指令（`commands/interact.py`）

- `discli interact modal <title> --field "Name:short:required" ...`
- `discli interact workflow <definition.json>`
- `discli interact dashboard create|update|delete|list`

## 整合方式

**Serve 模式：**

- 兩個引擎採延遲初始化
- actions 以薄 handler 形式登錄到 `serve.py` 的 dispatch table
- 事件走既有 JSONL emit pipeline
- 全部在同一條 asyncio event loop 上運作

**CLI：**

- 指令維持既有流程（Click group → async action → `run_discord()`）
- 長生命週期指令（listen、converse）會持續執行到 `Ctrl+C` 或 `--duration`

**安全性（`security.py`）：**

- 新增權限 scope：`voice`、`interact`
- `readonly`：可查詢狀態但不可連線/發聲
- `chat`：可用 `interact`，不可用 `voice`
- `full`：全部權限
- `moderation`：包含 `voice`（監控）與 `interact`
- 所有動作都會寫入稽核日誌

**錯誤處理：**

- 語音連線失敗：在 JSONL/CLI 回傳清楚錯誤
- Provider 失敗：若有替代可回退，否則回傳錯誤事件
- 工作流程逾時：清理狀態並送出事件

## 依賴群組（`pyproject.toml`）

```toml
[project.optional-dependencies]
voice = ["PyNaCl", "discord-ext-voice-recv", "silero-vad", "audioop-lts", "elevenlabs", "deepgram-sdk"]
local-voice = ["PyNaCl", "discord-ext-voice-recv", "silero-vad", "audioop-lts", "piper-tts", "faster-whisper"]
openai-voice = ["PyNaCl", "discord-ext-voice-recv", "silero-vad", "audioop-lts", "openai"]
interact = []
dev = ["pytest", "pytest-asyncio"]
```
