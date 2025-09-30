# Monocrea-Technical-Training

研修用アプリケーションソースコードの管理リポジトリです

[![Node.js CI](https://github.com/typicode/json-server/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/json-server/actions/workflows/node.js.yml)
[![Homebrew](https://img.shields.io/badge/Homebrew-Install-orange?logo=homebrew)](https://brew.sh/)
[![Git](https://img.shields.io/badge/Git-Install-informational?logo=git)](https://git-scm.com/)
[![Java](https://img.shields.io/badge/Java-Install-red?logo=openjdk)](https://adoptium.net/)
[![pnpm](https://img.shields.io/badge/pnpm-Install-yellow?logo=pnpm)](https://pnpm.io/)
[![Docker](https://img.shields.io/badge/Docker-Install-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-Install-007ACC?logo=visualstudiocode)](https://code.visualstudio.com/)

## リポジトリ作成日

2025年9月7日

## ユーザ管理アプリケーションの開発環境構築手順

当READMEは、「Monocrea Technical Training」で作成をしたユーザ管理アプリケーションの開発環境構築手順と実行方法についてまとめたドキュメントとなります。  

> [!NOTE]
> このリポジトリには、SVELTEチュートリアル実施分のソースコードが含まれています。
> もし、SVELTEチュートリアル実施分の動作確認を実施したい場合は、「routes/+page.server.ts」を削除した上で実行をしてください。

また、ユーザ管理アプリケーションのバックエンドには、2種類の実行方法があります。

- json-serverによるCRUD操作
- Docker + PostgreSQL、Quarkusを用いたRest Web ApplicationによるCRUD操作

どちらでも同じ実行結果となりますので、ご自身の環境に合わせて開発環境の構築を進めてください。

## 必要なソフトウェア

- Homebrew (macOS Only)
- Git
- Java
- Maven
- Node.js
- pnpm
- Docker
- VSCode

次の手順より、必要なソフトウェアのインストールを初めていきます。

## mono-front開発環境の構築

## ターミナルでのインストール作業

手順１：ターミナルを起動し、以下コマンドを順次実行してください。

```text
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

brew install git

brew install corretto@21

brew install maven

brew install docker --cask

brew install visual-studio-code --cask

brew install pnpm

brew install nodebrew
```

手順２：nodebrewのセットアップ

```text
nodebrew setup

echo 'export PATH=$PATH:$HOME/.nodebrew/current/bin' >> ~/.bash_profile
```

手順３：インストールするnodeのバージョンを確認しセットします

事前にLTSバージョンを確認します。
[nodeLTS](https://github.com/nodejs/Release?tab=readme-ov-file#release-schedule "nodeLTSバージョン確認")

nodeのインストール + 使用設定をします。  
target versionはLTSバージョンに置き換えてください。

```text
nodebrew install-binary <target version>

nodebrew use <target version>
```

手順４：nodeコマンドでバージョンを確認します。

```text
node -v
```

以下実行結果が出力されれば、セットアップは完了となります。

```text
v24.7.0
```

## json-serverのインストールと構築

[json-server](https://github.com/typicode/json-server/tree/main "json-serverリポジトリ")

上記json-serverリポジトリリンクより、json-serverをインストールしていきます。

> [!IMPORTANT]
> 以下json-serverのインストールはnpm側の不具合（Arboristの依存グラフでedgesOutを読むところでnullに遭遇）が発生しています。
> 2025年春頃より「Cannot read properties of null (reading 'edgesOut')」が発生するようになり、npm CLI 側の issue でも報告があります。
> 対処方法としては、「エラー対処」セクションを確認し対応をしてください。

手順１：json-serverをインストールします。

```text
npm install json-server
```

### エラー対処

```text
# プロジェクト直下で
rm -rf node_modules package-lock.json
npm cache clean --force
npm cache verify

# もう一度
npm install
# 目的のパッケージ
npm install json-server
```

手順２：json-serverのインストールが完了後、ターミナルを開き「mono-infra/json-server」まで移動します。

```text
cd mono-infra/json-server
```

json-server配下には、db.jsonのみ配置されていますがこれはユーザ管理対象のデータとなります。

```json
{
    "usersDataManagement": [
        {
            "id": 1,
            "userName": "佐藤 太郎",
            "userID": "TestUser001",
            "userPW": "TestUser111",
            "accountCreate": "2025-09-08"
        },
        {
            "id": 2,
            "userName": "鈴木 花子",
            "userID": "TestUser002",
            "userPW": "TestUser112",
            "accountCreate": "2025-09-09"
        },
        {
            "id": 3,
            "userName": "高橋 健一",
            "userID": "TestUser003",
            "userPW": "TestUser113",
            "accountCreate": "2025-09-09"
        }
    ]
}
```

手順３：json-serverまで移動後、以下コマンドでインストールしたjson-serverを起動します。

```text
npx json-server db.json
```

手順４：起動後、正常に起動しているかどうかを確認するために以下コマンドを実行してください。

```text
curl http://localhost:3000/usersDataManagement/1
```

以下レスポンスが返却されれば、json-serverは正常に起動していますので、「json-serverのインストールと構築」手順は終了となります。

```json
{
    "id": 1,
    "userName": "佐藤 太郎",
    "userID": "TestUser001",
    "userPW": "TestUser111",
    "accountCreate": "2025-09-08"
}
```

## QuarkusプロジェクトのセットアップとDocker for PostgreSQLコンテナの作成

当アプリケーションでは、バックエンドをjson-serverによるユーザデータ管理とQuarkus + Docker for PostgreSQLによるユーザデータ管理でスイッチ可能です。

> [!NOTE]
> json-serverによるユーザデータ管理環境のセットアップは「json-serverのインストールと構築」を参照しセットアップしてください。

Quarkusプロジェクトを起動する前に、PostgreSQLコンテナを作成します。

Dockerfileは以下パスに配置していますので、ターミナルでDockerfile配置フォルダまで移動し、docker runコマンドを実行してください。

Dockerfileへのパス：mono-infra/docker

```text
docker run -d --name mono-db -p 5432:5432 -e POSTGRES_USER=a01 -e POSTGRES_PASSWORD=1qaz2WSX -e POSTGRES_DB=mono_db postgres:17
```

以上でPostgreSQLコンテナの作成と起動が完了しますので、続いてバックエンドであるQuarkusプロジェクトの実行に進んでください。

バックエンドプロジェクトフォルダは「mono-back」になりますので、

```text
cd mono-back
```

でプロジェクトルートへ移動してください。

プロジェクトルートへ移動後、以下コマンドでQuarkusプロジェクトを起動し、Postmanを利用して動作確認を実施してください。

```text
./mvnw quarkus:dev
```

URL：http://localhost:8080/mono

続いて、REST APIの動作確認を行います。

> [!IMPORTANT]
> REST APIのGTEやPUT、DELETEメソッドの動作確認を行うには、POSTメソッド（新規ユーザ登録API）を一番最初に呼び出す必要があります。

- 新規ユーザ登録

```text
curl -X POST http://localhost:8080/users \
  -H 'Content-Type: application/json' \
  -d '{"userName":"Taro","userID":"taro003","password":"secret"}'
```

- ユーザデータ一覧取得

```text
curl -X GET http://localhost:8080/users
```

> 出力例

```text
[{"userName":"Taro","userID":"taro001","accountCreate":"2025-09-28","password":"secret"}]
```

- ユーザデータ単一取得（ユーザID指定）

```text
curl -X GET http://localhost:8080/users/by-userid/taro001
```

> 出力例

```text
[{"userName":"Taro","userID":"taro001","accountCreate":"2025-09-28","password":"secret"}]
```
