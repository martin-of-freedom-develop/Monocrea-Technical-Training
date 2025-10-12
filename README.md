# Monocrea Technical Training

Monocrea の技術研修で扱うユーザ管理アプリケーション一式。Svelte 製フロントエンドと、`json-server` または Quarkus + PostgreSQL のバックエンドを切り替えて演習できます。

[![Git](https://img.shields.io/badge/Git-Install-informational?logo=git)](https://git-scm.com/)
[![Java](https://img.shields.io/badge/Java-Install-red?logo=openjdk)](https://adoptium.net/)
[![pnpm](https://img.shields.io/badge/pnpm-Install-yellow?logo=pnpm)](https://pnpm.io/)
[![Docker](https://img.shields.io/badge/Docker-Install-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-Install-007ACC?logo=visualstudiocode)](https://code.visualstudio.com/)
[![Homebrew](https://img.shields.io/badge/Homebrew-Install-orange?logo=homebrew)](https://brew.sh/)

---

## 目次

- [Monocrea Technical Training](#monocrea-technical-training)
  - [目次](#目次)
  - [概要](#概要)
  - [リポジトリ構成](#リポジトリ構成)
  - [セットアップ概要](#セットアップ概要)
  - [前提ツールのインストール](#前提ツールのインストール)
    - [1. Homebrew (macOS)](#1-homebrew-macos)
    - [2. CLI / アプリ一括インストール](#2-cli--アプリ一括インストール)
  - [Node.js (nodebrew) セットアップ](#nodejs-nodebrew-セットアップ)
  - [フロントエンド mono-front](#フロントエンド-mono-front)
  - [バックエンドの選択肢](#バックエンドの選択肢)
    - [json-server を使う](#json-server-を使う)
    - [Quarkus + PostgreSQL を使う](#quarkus--postgresql-を使う)
  - [API 動作確認サンプル](#api-動作確認サンプル)
  - [トラブルシューティング](#トラブルシューティング)
  - [補足情報](#補足情報)

## 概要

- SvelteKit ベースのフロントエンドと 2 系統のバックエンド (json-server / Quarkus) を切り替え可能。
- CRUD 操作を題材に、SPA と REST API 双方の開発・検証手順を学習。
- macOS / Windows いずれも動作想定、macOS は Homebrew によるセットアップ例を掲載。
- Docker を使わない軽量構成 (json-server) と、実運用を意識した構成 (Quarkus + PostgreSQL) の両方を体験。

## リポジトリ構成

| ディレクトリ | 説明 |
| --- | --- |
| `mono-front` | SvelteKit 製フロントエンド。`pnpm dev` で起動します。 |
| `mono-back` | Quarkus ベースの REST API。PostgreSQL と連携して動作します。 |
| `mono-infra/docker` | PostgreSQL 用 Docker ユーティリティ。 |
| `mono-infra/json-server` | `json-server` 用サンプルデータ (`db.json`)。 |
| `package.json` (リポジトリ直下) | ツールの依存関係 (json-server など) を管理。 |

## セットアップ概要

1. 必要な CLI / IDE / ランタイムをインストール。
2. nodebrew で Node.js の LTS バージョンを用意。
3. フロントエンド (`mono-front`) の依存関係を取得し、`pnpm dev` で起動。
4. 利用したいバックエンド (json-server または Quarkus + PostgreSQL) を立ち上げ。
5. ブラウザ / API クライアントで動作確認。

## 前提ツールのインストール

> macOS の例を記載しています。Windows / Linux の場合は各公式ドキュメントを参照してください。

### 1. Homebrew (macOS)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. CLI / アプリ一括インストール

```bash
brew install git corretto@21 maven pnpm nodebrew
brew install --cask docker visual-studio-code
```

- Docker Desktop は初回に起動し、ライセンス同意とエンジン起動を済ませておきます。
- Java (Corretto 21) と Maven は Quarkus 用、pnpm / nodebrew はフロントエンド & json-server 用です。

## Node.js (nodebrew) セットアップ

```bash
nodebrew setup
echo 'export PATH=$HOME/.nodebrew/current/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

> Bash を使用する場合は `~/.bash_profile` に書き込んでください。

1. LTS バージョンを [Node.js Release Schedule](https://github.com/nodejs/Release?tab=readme-ov-file#release-schedule) で確認。
2. `<LTS_VERSION>` を置き換えてインストールします。

```bash
nodebrew install-binary <LTS_VERSION>
nodebrew use <LTS_VERSION>
node -v
```

`v24.x.x` のような表示が出れば準備完了です。

## フロントエンド mono-front

```bash
cd mono-front
pnpm install
pnpm dev --open
```

- 既定では `http://localhost:5173` でアプリが開きます。
- `.env` が必要な場合は `mono-front/.env.example` を参考に作成してください (存在する場合)。

## バックエンドの選択肢

### json-server を使う

軽量なモック API。学習の初期ステップで推奨です。

```bash
# リポジトリ直下で依存関係を取得 (初回のみ)
pnpm install

# サンプル DB を監視しながら起動
pnpm exec json-server mono-infra/json-server/db.json --watch --port 3001
```

- API エンドポイント: `http://localhost:3001/users`
- `db.json` は論理削除フラグなど研修用フィールドを含みます。

### Quarkus + PostgreSQL を使う

実運用に近い構成。Docker で DB を立ち上げ、Quarkus を Dev モードで起動します。

```bash
# PostgreSQL コンテナ起動 (初回)
docker run -d --name mono-db \
  -p 5432:5432 \
  -e POSTGRES_USER=a01 \
  -e POSTGRES_PASSWORD=1qaz2WSX \
  -e POSTGRES_DB=mono_db \
  postgres:17

# Quarkus プロジェクトを Dev モードで起動
cd mono-back
./mvnw quarkus:dev
```

- クエリ確認用 URL: `http://localhost:8080/mono`
- `mono-back/src/main/resources/application.properties` で接続設定を変更できます。
- 別ターミナルで `docker ps` に `mono-db` が表示されていることを確認してください。

## API 動作確認サンプル

> POST を最初に実行すると、他メソッドで使用するデータが作成されます。

```bash
# 新規ユーザ登録
curl -X POST http://localhost:8080/users \
  -H 'Content-Type: application/json' \
  -d '{"userName":"Taro","userID":"taro003","password":"secret"}'

# ユーザ一覧取得
curl http://localhost:8080/users

# ユーザ単一取得 (ユーザ ID 指定)
curl http://localhost:8080/users/by-userid/taro001

# ユーザ情報更新
curl -X PUT http://localhost:8080/users/1 \
  -H 'Content-Type: application/json' \
  -d '{"userPW":"newSecret","userName":"Taro Y."}'

# ユーザ削除
curl -X DELETE http://localhost:8080/users/1
```

`json-server` 利用時は `--port` オプションに合わせて URL のポート番号を変更してください (例: `3001`)。

## トラブルシューティング

- `npm ERR! Cannot read properties of null (reading 'edgesOut')`
  - npm v10 系の既知不具合です。`npm install -g npm@latest` で更新するか、`pnpm install` / `pnpm exec json-server ...` を利用してください。
  - それでも解消しない場合は `rm -rf node_modules package-lock.json` 後に `pnpm install` を実行します。
- Docker コンテナが起動しない
  - `docker ps -a` で状態を確認し、既存の `mono-db` がある場合は `docker start mono-db` で再起動、不要なものは `docker rm mono-db` で削除してから再実行してください。
- フロントエンドから API に接続できない
  - `mono-front/src/lib/constants/*` などの API エンドポイント設定がバックエンドのポートと一致しているか確認してください。

## 補足情報

- リポジトリ作成日: 2025 年 9 月 7 日

> [!NOTE]
> リポジトリには Svelte チュートリアルの演習コードも含まれています。チュートリアルを単体で動かしたい場合は `mono-front/src/routes/+page.server.ts` を一時的に削除して実行してください (演習終了後は戻すことを推奨)。
