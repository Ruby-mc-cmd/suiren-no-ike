# 作業メモ（Claude 向け）

## 更新の流れ（毎回かならず）

1. `src/main.js` と `src/head.html` を編集する（`dist/` は手で触らない）
2. `python3 build.py` で `dist/pond.html` と `dist/index.html` を作る
3. 確認する。ヘッドレスでの撮影は `test.py`、挙動の回帰テストは `python3 tests/run.py`
4. アーティファクトを更新する：`dist/pond.html` を https://claude.ai/artifact/QLfVnz2GJokL2vQHqTXmDg に再公開する（バージョン番号は1つ上げる）
5. **GitHub も毎回更新する**：`git commit`、`git pull --rebase origin main`（ユーザーが GitHub 上で直接編集することがある）、`git push origin main` の順に行う。コミットメッセージは日本語で、`v番号: 変更内容` の形にする（例 `v39: カエルの泳ぐ音を水音に`）
6. ユーザーへの報告は日本語で短く。ヘッドレス（SwiftShader）でしか確認していないことは正直に書く

## 気をつけること

- 配置は乱数のシード（`rnd()` / `rr()`）で決まる。初期化中に乱数を引く回数を変えると、ほかの植物や鯉の位置まで動いてしまう。何かを消すときは、引いていた分の乱数を空読みして回数を保つ
- アメンボの `STR_MAX` は4まで。水面のくぼみと底の影のシェーダーが4匹分しか用意していない
- 音は短いノイズを急に立ち上げると破裂音に聞こえる。ユーザーは破裂音や空振りのような音を嫌うので、水の音には泡（`sBubble`）や下がっていく音（`sSlosh`）を使う
- `__pond.tick(n)` は描画しない。撮影の直前には `step` を挟む
