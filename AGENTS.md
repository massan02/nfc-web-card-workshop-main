## 概要

村﨑 聖仁（まっさん）の Windows XP 風 Web名刺サイト。NFCカードから開く想定。要件は `starter/REQUIREMENTS.md`。

静的な HTML / CSS / JS のみ（ビルド・依存なし）。確認は `open starter/index.html`。

## 構成

- 編集するのは `starter/`（`index.html` `style.css` `script.js` `assets/`）だけ
- `docs/` は公開用。`main` / `reference` への push で `.github/workflows/cd.yml` が `starter/` をコピーする。直接編集しない

## 画面の仕組み

- **起動演出**: 起動画面 → `.is-welcome`（ようこそ）→ `.is-done` でフェードアウト → ウィンドウを開く。タイミングは `script.js` の `playBoot()`。クリックかキー入力でスキップ。`prefers-reduced-motion` のときは即デスクトップ。スタートメニューの「再起動」で再生
- **ウィンドウ**: プロフィールウィンドウ1枚。状態はクラスで管理する（`hidden`=閉じた / `.is-minimized` / `.is-maximized` / `.is-inactive`）。タスクバーのボタンと連動する
- **レスポンシブ**: 800px 未満ではウィンドウを最大化して固定表示し、ドラッグと最大化ボタンは無効。800px 以上ではドラッグ可能なウィンドウになる（位置は JS で `left` / `top` に設定）
- **重なり順**: ウィンドウ 10 → タスクバー 100 → スタートメニュー 110 → 起動画面 1000
- 色は `:root` の CSS 変数。フォントは外部フォントを使わず、Tahoma 系のスタックで指定している。本物の Windows ロゴは使わない
