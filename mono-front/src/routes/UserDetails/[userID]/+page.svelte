<!--
* =======================================================================
* プログラム名：ユーザ詳細画面用コード
* プログラムファイル名：+page.svelte
* 画面名：ユーザ詳細画面
* 画面機能：
* 　　　　　$1：ユーザ単一取得機能
* 　　　　　$2：ユーザデータ更新機能
* 　　　　　$3：ユーザデータ削除機能
* 注意事項：連携バックエンドはjson-serverとREST APIの2つあり、+page.Server.ts側で
* 　　　　　バックエンドの切り替えを行ってください。
* 作成日：2025年10月12日
* 作成者：深谷 理幸
* =======================================================================
-->
<style>
  /** =====画面見出し===== */
  h1 {
    text-align: center;
  }

  /** =====レイアウトラッパ（横幅を抑えて中央寄せ）===== */
  .wrapper {
    max-width: 640px;
    margin: 1rem auto;
  }

  /** =====詳細テーブル（ベーシックな表レイアウト）===== */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  /** =====セルの基本装飾（区切り線・パディング）===== */
  th, td {
    text-align: left;
    border-bottom: 1px solid #ddd;
    padding: .5rem;
    vertical-align: middle;
  }

  /** =====見出しセル（幅・背景・強調）===== */
  th {
    width: 12rem;
    background: #fafafa;
    font-weight: 700;
  }

  /** =====入力欄の基本スタイル===== */
  input {
    width: 100%;
    padding: .6rem .8rem;
    border: 1px solid #ddd;
    border-radius: .5rem;
    font-size: 1rem;
  }

  /** ===== 入力欄：フォーカス時（アクセシビリティ向上） ===== */
  input:focus {
    outline: none;
    border-color: #f0b400;
    box-shadow: 0 0 0 3px rgba(240,180,0,.15);
  }

  /** =====アクションボタン群（中央寄せ・折返し）===== */
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  /** =====ボタン共通（プライマリ）===== */
  .btn {
    padding: .55rem 1rem;
    border: none;
    border-radius: .5rem;
    background: #f0b400;
    color: #222;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    line-height: 1;
    transition: filter .15s ease-in-out,
    background .15s ease-in-out,
    border-color .15s ease-in-out;
  }

  .btn:hover {
    filter: brightness(0.98);
  }

  /** =====セカンダリボタン（グレー）===== */
  .btn.secondary {
    background: #eee;
    color: #222;
    border: 1px solid #ddd;
    font-weight: 700;
  }

  .btn.secondary:hover {
    background: #e8e8e8;
  }

  /** =====デンジャーボタン（削除など）===== */
  .btn.danger {
    background: #e23;
    color: #fff;
  }

  .btn.danger:hover {
    filter: brightness(0.97);
  }

  /** =====備考テキスト（補足説明）===== */
  .note {
    color:#666;
    font-size:.9rem;
    margin-top:.25rem;
  }

  /** =====成功トースト===== */
  .toast {
    position: fixed;
    right: 16px;
    bottom: 16px;
    display: flex;
    gap: .5rem;
    align-items: center;
    padding: .6rem .8rem;
    border-radius: .5rem;
    box-shadow: 0 6px 16px rgba(0,0,0,.18);
    z-index: 1000;
  }

  .toast.success {
    background: #e8f7ef;
    border: 1px solid #b6e3c5;
    color: #145c2e;
    font-weight: 600;
  }

  .toast button {
    all: unset;
    cursor: pointer;
    font-weight: 700;
    padding: .2rem .4rem;
  }
</style>

<script lang="ts">
  /**
   * ===============================
   * インポート
   * ===============================
  */
  import type {
    PageData
  } from './$types';

  import {
    UIMaterial
  } from '../UserDetailsMaterial';

  import MessagePopup from '../MessagePopup.svelte';

  /**
   * ===============================
   * サーバからのデータ受け取り
   * - data:load()の戻り（row/successMessageなど）
   * - form:action実行時の戻り（errorなど）
   * ===============================
   */
  const {
    data: raw, form
  } = $props();

  const data = raw as PageData;

  /**
   * ===============================
   * ポップアップ表示状態（成功/失敗を分離）
   * - successPopup:クエリ（?updated=1/?deleted=1）経由の成功文言
   * - errorPopup:アクション失敗時のエラーメッセージ
   * ===============================
   */
  let successPopup = $state<string>(data.successMessage ?? '');
  let errorPopup   = $state<string>(form?.error ?? '');

  /**
   * ===============================
   * 編集モデル（双方向バインド）
   * ===============================
   */
  const edit = $state({
    userID: data.row?.userID ?? '',
    userName: data.row?.userName ?? '',
    userPW: data.row?.userPW ?? ''
  });

  /**
   * ===============================
   * 削除確認ダイアログ
   * - 戻り値falseのときsubmitを止める（onclickハンドラ側でpreventDefault）
   * ===============================
   */
  function confirmDelete() {
    return confirm('本当に削除しますか？\nこの操作は取り消せません。');
  }
</script>

<!--画面タイトル-->
<h1>{
  UIMaterial.material01
}</h1>

<div class="wrapper">
  {#if data.row}
    <!--
      詳細フォーム
      - action="?/update"でnamed action "update"を呼び出し
      - entityIdはREST API/json-server双方で更新・削除に利用
    -->
    <form method="POST" action="?/update" autocomplete="off">
      <!--エンティティID（hidden）-->
      <input type="hidden" name="entityId" value={
        data.row?.id ?? 0
      } />

      <!--入力テーブル-->
      <table>
        <tbody>
          <tr>
            <th>{
              UIMaterial.material02
            }</th>

            <!--ユーザID（変更可能。変更時は更新後のURLも変わる）-->
            <td>
              <input name="userID" bind:value={
                edit.userID
              } required minlength="2" maxlength="30" placeholder="ユーザID" />

              <div class="note">{
                UIMaterial.material06
              }</div>

            </td>
          </tr>
          <tr>
            <th>{
              UIMaterial.material03
            }</th>

            <td><input name="userName" bind:value={
              edit.userName
            } required minlength="2" maxlength="30" placeholder="ユーザ名" /></td>

          </tr>
          <tr>
            <th>{
              UIMaterial.material04
            }</th>

            <td><input name="userPW" bind:value={
              edit.userPW
            } type="text" required minlength="4" maxlength="50" placeholder="パスワード" /></td>

          </tr>
          <tr>
            <th>{
              UIMaterial.material05
            }</th>

            <td>{
              data.row.accountCreate ?? '-'
            }</td>
          </tr>
        </tbody>
      </table>

      <!--アクション行：保存／削除／戻る-->
      <div class="actions">
        <!--保存（updateアクションへPOST） -->
        <button type="submit" class="btn">{
          UIMaterial.material07
        }</button>

        <!--svelte-ignore event_directive_deprecated-->
        <!--
          削除（delete アクションへ POST）
          ※Svelteでは新シンタックスonclickを使用。
            confirmがfalseの場合にsubmitを止めるためpreventDefaultを明示。
        -->
        <button
          type="submit"
          class="btn danger"
          formaction="?/delete"
          formmethod="POST"
          on:click={
            () => confirmDelete()
          }
        >

          {
            UIMaterial.material08
          }
        </button>

        <!--検索画面へ戻る-->
        <a class="btn secondary" href="/UserSearch">{
          UIMaterial.material09
        }</a>

      </div>
    </form>
  {:else}
    <!--取得失敗時のフォールバック表示-->
    <p style="color:#a00; text-align:center; margin-top:1rem;">{
      UIMaterial.material10
    }</p>

    <div class="actions">
      <a class="btn secondary" href="/UserSearch">{
        UIMaterial.material11
      }</a>
    </div>
  {/if}

  <!--
  ===============================
    メッセージ表示（成功／失敗を分離）
    - errorPopup：エラー時のみ表示。サーバアクションのfail()等で渡された文言を表示
    - ErrorPopupのonCloseではerrorPopupのみをクリア（成功メッセージには影響しない）
    - successPopup：成功時のみ表示。load側で?updated/?deletedなどを解釈して設定
    - 成功トーストの×ボタン（onclick）でsuccessPopupをクリア
    - イベントはSvelte構文に合わせてonclickを使用
    ===============================
  -->
  <MessagePopup
    message={
      errorPopup
    }

    onClose={
      () => (errorPopup = '')
    }
  />

  {#if successPopup}
    <div class="toast success" role="status" aria-live="polite">
      <span>{
        successPopup
      }</span>
      
      <!-- svelte-ignore event_directive_deprecated -->
      <button aria-label="閉じる" on:click={
        () => (successPopup = '')
      }>×</button>
    </div>
  {/if}
</div>
