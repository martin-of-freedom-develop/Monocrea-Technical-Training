<!-- src/routes/UserDetails/[userID]/+page.svelte -->
<style>
  h1 {
    text-align: center;
  }
  .wrapper {
    max-width: 640px;
    margin: 1rem auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  th, td {
    text-align: left;
    border-bottom: 1px solid #ddd;
    padding: .5rem;
    vertical-align: middle;
  }
  th {
    width: 12rem;
    background: #fafafa;
    font-weight: 700;
  }
  input {
    width: 100%;
    padding: .6rem .8rem;
    border: 1px solid #ddd;
    border-radius: .5rem;
    font-size: 1rem;
  }
  input:focus {
    outline: none;
    border-color: #f0b400;
    box-shadow: 0 0 0 3px rgba(240,180,0,.15);
  }
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
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
    transition: filter .15s ease-in-out, background .15s ease-in-out, border-color .15s ease-in-out;
  }
  .btn:hover {
    filter: brightness(0.98);
  }
  .btn.secondary {
    background: #eee;
    color: #222;
    border: 1px solid #ddd;
    font-weight: 700;
  }
  .btn.secondary:hover {
    background: #e8e8e8;
  }
  .btn.danger {
    background: #e23;
    color: #fff;
  }
  .btn.danger:hover {
    filter: brightness(0.97);
  }
  .note {
    color:#666;
    font-size:.9rem;
    margin-top:.25rem;
  }
</style>

<script lang="ts">
  import type {PageData} from './$types';
  import {UIMaterial} from '../UserDetailsMaterial';
  import MessagePopup from '../MessagePopup.svelte';

  const {data: raw, form} = $props();
  const data = raw as PageData;

  // 成功（updated / deleted） or 失敗（form.error）をポップアップで表示
  let popupMessage = $state<string>(data.successMessage || (form?.error ?? ''));

  // 編集フィールド
  const edit = $state({
    userID: data.row?.userID ?? '',
    userName: data.row?.userName ?? '',
    userPW: data.row?.userPW ?? ''
  });

  // 削除確認（ブラウザconfirmを利用）
  function confirmDelete() {
    return confirm('本当に削除しますか？\nこの操作は取り消せません。');
  }
</script>

<h1>{UIMaterial.material01}</h1>

<div class="wrapper">
  {#if data.row}
    <form method="POST" action="?/update" autocomplete="off">
      <table>
        <tbody>
          <tr>
            <th>{UIMaterial.material02}</th>
            <td>
              <input name="userID" bind:value={edit.userID} required minlength="2" maxlength="30" placeholder="ユーザID" />
              <div class="note">※ 一意のIDを指定してください。変更するとURLも変わります。</div>
            </td>
          </tr>
          <tr>
            <th>{UIMaterial.material03}</th>
            <td>
              <input name="userName" bind:value={edit.userName} required minlength="2" maxlength="30" placeholder="ユーザ名" />
            </td>
          </tr>
          <tr>
            <th>{UIMaterial.material04}</th>
            <td>
              <input name="userPW" bind:value={edit.userPW} type="text" required minlength="4" maxlength="50" placeholder="パスワード" />
            </td>
          </tr>
          <tr>
            <th>{UIMaterial.material05}</th>
            <td>{data.row.accountCreate ?? '-'}</td>
          </tr>
        </tbody>
      </table>

      <div class="actions">
        <button type="submit" class="btn">保存する</button>

        <!-- 削除は別アクション "?/delete" に POST。confirm でガード -->
        <button
          type="submit"
          class="btn danger"
          formaction="?/delete"
          formmethod="POST"
          onclick={confirmDelete}
        >
          削除する
        </button>

        <a class="btn secondary" href="/UserSearch">ユーザ検索画面に戻る</a>
      </div>
    </form>
  {:else}
    <p style="color:#a00; text-align:center; margin-top:1rem;">ユーザ詳細データを取得できませんでした。</p>
    <div class="actions">
      <a class="btn secondary" href="/UserSearch">ユーザ検索画面に戻る</a>
    </div>
  {/if}

  <MessagePopup message={popupMessage} onClose={() => (popupMessage = '')} />
</div>
