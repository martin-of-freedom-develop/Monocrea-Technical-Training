# Monocrea-Technical-Training

研修用アプリケーションソースコードの管理リポジトリです

[![Node.js CI](https://github.com/typicode/json-server/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/json-server/actions/workflows/node.js.yml)

## リポジトリ作成日

2025年9月7日

## ユーザ管理アプリケーションの開発環境構築手順

当READMEは、「Monocrea Technical Training」で作成をしたユーザ管理アプリケーションの開発環境構築手順と実行方法についてまとめたドキュメントとなります。  
各種設計書を閲覧する場合は、当リポジトリの「設計書」フォルダより閲覧してください。

> [!NOTE]
> このリポジトリには、SVELTEチュートリアル実施分のソースコードが含まれています。
> もし、SVELTEチュートリアル実施分の動作確認を実施したい場合は、「routes/+page.server.ts」を削除した上で実行をしてください。

また、ユーザ管理アプリケーションのバックエンドには、2種類の実行方法があります。

- json-serverによるCRUD操作
- Docker + PostgreSQL、Quarkusを用いたRest Web ApplicationによるCRUD操作

どちらでも同じ実行結果となりますので、ご自身の環境に合わせて開発環境の構築を進めてください。

## mono-front開発環境の構築

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
            "accountID": "mono-data001",
            "userID": "TestUser001",
            "userPW": "TestUser111",
            "accountCreate": "2025年9月8日",
            "deleteFlg": 0
        },
        {
            "id": 2,
            "accountID": "mono-data002",
            "userID": "TestUser002",
            "userPW": "TestUser112",
            "accountCreate": "2025年9月9日",
            "deleteFlg": 0
        },
        {
            "id": 3,
            "accountID": "mono-data003",
            "userID": "TestUser003",
            "userPW": "TestUser113",
            "accountCreate": "2025年9月9日",
            "deleteFlg": 0
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
  "id": "1",
  "accountID": "mono-data001",
  "userID": "TestUser001",
  "userPW": "TestUser111",
  "accountCreate": "2025年9月8日",
  "deleteFlg": 0
}
```
