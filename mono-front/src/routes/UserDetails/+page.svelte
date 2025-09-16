<!--
* 画面名：ユーザ詳細画面
* プログラムファイル名：+page.svelte
* 処理入力：
* 処理内部入力：
* 処理出力：
* 外接サーバ：$1. json-server
* 　　　　　　$2. Docker + PostgreSQL
* 　　　　　　※バックエンド切り替えフラグにより、外接サーバの向き先を変更することができます。
* 処理概要：
* 　json-server若しくはPostgreSQLに格納されているユーザデータの登録・更新・削除を行います。
-->
<style>
    h1 {
        text-align: center;
    }
</style>

<script lang="ts">
    import {UIMaterial} from './UserDetailsMaterial'
</script>

<h1>{UIMaterial.material01}</h1>
