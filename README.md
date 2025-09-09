# Monocrea-Technical-Training

研修用アプリケーションソースコードの管理リポジトリです

## リポジトリ作成日

2025年9月7日

## json-serverのインストールと構築

[json-server](https://github.com/typicode/json-server/tree/main "json-serverリポジトリ")

上記json-serverリポジトリリンクより、json-serverをインストールしていきます。

> [!IMPORTANT]
> 以下json-serverのインストールはnpm側の不具合（Arboristの依存グラフでedgesOutを読むところでnullに遭遇）が発生しています。
> 2025年春頃より「Cannot read properties of null (reading 'edgesOut')」が発生するようになり、npm CLI 側の issue でも報告があります。
> 対処方法としては、「エラー対処」セクションを確認し対応をしてください。

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
