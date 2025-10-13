<!--
* =======================================================================
* プログラム名：ユーザ検索画面用コード
* プログラムファイル名：+page.svelte
* 画面名：ユーザ検索画面
* 画面機能：
* 　　　　　$1：登録ユーザリスト取得機能
* 　　　　　$2：新規ユーザ登録機能
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

  /** =====検索フォーム：2列グリッドレイアウト===== */
  .form-grid {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.75rem 1rem;
    align-items: center;
    max-width: 640px;
    margin: 0 auto;
  }

  /** =====ラベル：右寄せ＋強調===== */
  label {
    text-align: right;
    font-weight: 600;
  }

  /** =====入力欄：基本スタイル===== */
  input {
    padding: .6rem .8rem;
    border: 1px solid #ddd;
    border-radius: .5rem;
    font-size: 1rem;
  }

  /** =====入力欄：フォーカス時（アクセシビリティ向上）===== */
  input:focus {
    outline: none;
    border-color: #f0b400;
    box-shadow: 0 0 0 3px rgba(240,180,0,.15);
  }

  /** =====アクションボタン行：中央寄せ・折返し対応===== */
  .actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  /** =====ボタン：主ボタンの基本スタイル===== */
  button {
    padding: .55rem 1rem;
    border: none;
    border-radius: .5rem;
    background: #f0b400;
    color: #222;
    font-weight: 700;
    cursor: pointer;
  }

  /** =====ボタン：セカンダリ（グレー）===== */
  button.secondary {
    background: #eee;
  }

  /** =====入力欄：無効状態の視覚表現===== */
  input:disabled {
    background: #f7f7f7;
    color: #888;
    cursor: not-allowed;
  }

  /** =====「全ユーザ取得」トグル行：中央レイアウト===== */
  .toggle-row {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: .5rem;
    justify-content: center;
    margin-bottom: .25rem;
  }

  /** =====モーダル：全画面オーバーレイ===== */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  /** =====モーダル：本体カード===== */
  .modal {
    background: #fff;
    padding: 1rem 1.25rem;
    border-radius: .5rem;
    width: min(560px, 92vw);
    box-shadow: 0 10px 24px rgba(0,0,0,.2);
  }

  /** =====モーダル：タイトル===== */
  .modal h2 {
    margin: 0 0 .75rem;
    text-align: center;
  }

  /** =====モーダル：フォームグリッド（2列）===== */
  .modal-grid {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: .75rem 1rem;
    align-items: center;
  }

  /** =====モーダル：下部ボタン並び===== */
  .modal-actions {
    display: flex;
    gap: .75rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  /** =====モーダル：キャンセルボタン（セカンダリ見た目）===== */
  .btn-cancel {
    background: #eee;
    color: #222;
    border: 1px solid #ddd;
    padding: .55rem 1rem;
    border-radius: .5rem;
    font-weight:700;
    cursor:pointer;
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
   * 依存モジュールの読み込み
   * ===============================
  */
  // 画面テキスト
  import {
    UIMaterial
  } from './UserSearchMaterial';

  // メッセージ表示用コンポーネント
  import ErrorPopup from './MessagePopup.svelte';
  
  /**
   * ===============================
   * 型定義（バックエンド正規化後の行データ）
   * ===============================
   */
  type Row = {
    id: number;
    userID: string;
    userName: string;
    userPW: string;
    accountCreate: string;
    deleteFlg: number;
  };
  
  /**
   * ===============================
   * サーバから受け取るformデータ（load/actions の戻り値）
   * ===============================
   */
  const {
    form
  } = $props<{
    form: {
      allMode?: boolean;
      userID?: string;
      userName?: string;
      allResults?: Row[];
      error?: string | null;
      createdMessage?: string;
    } | null
  }>();

  /**
   * ===============================
   * ページネーション用表示最大件数
   * ===============================
   */
  const pageSize = 20;
  
  /**
   * ===============================
   * 画面状態（$state は Reactivity API：変更で自動再描画）
   * ===============================
   */
  // true=全件取得 / false=完全一致検索
  let allMode = $state(form?.allMode ?? false);
  // 検索条件：ユーザID
  let userID = $state(form?.userID ?? '');
  // 検索条件：ユーザ名
  let userName = $state(form?.userName ?? '');
  // ポップアップ用：エラーメッセージ
  let errorPopup = $state(form?.error ?? '');
  // ポップアップ用：成功メッセージ
  let successPopup = $state(form?.createdMessage ?? '');
  // 現在のページ番号（1 始まり）
  let page = $state(1);
  // 作成日ソート順
  let sortOrder = $state<'asc' | 'desc'>('desc');
  // ソート済み全データ
  let sorted = $state<Row[]>([]);
  // ページング後の表示データ
  let results = $state<Row[]>([]);
  // 総件数
  let totalCount = $state(0);
  // 総ページ数
  let totalPages = $state(1);
  // 新規登録モーダル開閉
  let showCreate = $state(false);
  // 新規登録フォームの編集モデル
  let createModel = $state({
    userID: '',
    userName: '',
    userPW: '',
    accountCreate: todayISO()
  });

  /**
   * ===============================
   * ヘルパ：YYYY-MM-DDの今日を返す
   * ===============================
   */
  function todayISO() {
    return new Date().toISOString().slice(0,10);
  }
  
  /**
   * ===============================
   * エフェクト：form / sortOrder / page が変わるたびに
   * - 並び替え → ページング → 表示配列を更新
   * ===============================
  */
  $effect(() => {
    form; sortOrder; page;
    const source: Row[] = form?.allResults ?? [];
    const arr = [...source].sort((a, b) => {
      const cmp = (a.accountCreate ?? '').localeCompare(b.accountCreate ?? '');
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    const count = arr.length;
    const pages = Math.max(1, Math.ceil(count / pageSize));

    if (page > pages) {
      page = pages;
    }

    if (page < 1) {
      page = 1;
    }

    const start = (page - 1) * pageSize;
    sorted = arr;
    totalCount = count;
    totalPages = pages;
    results = arr.slice(start, start + pageSize);
  });
  
  /**
   * ===============================
   * エフェクト：サーバ由来メッセージ（success/error）の変更検知
   * - 値が変わったときのみポップアップ表示状態を更新
   * ===============================
   */
  let lastFormToken = $state('');
  $effect(() => {
    form;
    const fErr = form?.error ?? '';
    const fOk = form?.createdMessage ?? '';
    const token = `${fErr}||${fOk}`;

    // 変更がなければ何もしない（連打での再表示防止）
    if (token === lastFormToken) {
      return;
    }

    // 表示メッセージを更新
    lastFormToken = token;
    errorPopup = fErr;
    successPopup = fOk;

    // モーダルの開閉制御（エラー時は開く／成功時は閉じる）
    if (fErr) {
      showCreate = true;
    }

    if (fOk) {
      showCreate = false;
    }
  });

  /**
   * ===============================
   * 作成日ソートの昇降反転
   * ===============================
   */
  function toggleSort() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  }

  /**
   * ===============================
   * ページ移動（範囲外は無視）
   * ※ ここではページ番号の代入は行わず、範囲外チェックのみ
   * ===============================
   */
  function goPage(p: number) {
    if (p < 1 || p > totalPages) {
      return;
    }

    page = p;
  }
  
  /**
   * ===============================
   * 新規登録モーダル：Open（モデル初期化＋メッセージ消去）
   * ===============================
   */
  function openCreate() {
    errorPopup = '';
    successPopup = '';
    createModel = {
      userID:'',
      userName:'',
      userPW:'',
      accountCreate: todayISO()
    };
    showCreate = true;
  }
  
  /**
   * ===============================
   * 新規登録モーダル：Close
   * ===============================
   */
  function closeCreate() {
    showCreate = false;
  }
</script>

<!--画面タイトル-->
<h1>{
  UIMaterial.material01
}</h1>

<!--
===============================
検索フォーム
- method=POST, action="?/search" → +page.server.tsのnamed action "search"が呼ばれる
- name 属性はサーバ側で受け取る FormData キーと一致させる
===============================
-->
<form class="form-grid" method="POST" action="?/search" autocomplete="off">
  <!--ユーザID（全件モード時は入力不可）-->
  <label for="userID">{
    UIMaterial.material02
  }</label>

  <input id="userID" name="userID" bind:value={
    userID
  } placeholder={
    UIMaterial.material17
  } inputmode="text" disabled={
    allMode
  } />

  <!--ユーザ名（全件モード時は入力不可） -->
  <label for="userName">{
    UIMaterial.material03
  }</label>

  <input id="userName" name="userName" bind:value={
    userName
  } placeholder={
    UIMaterial.material18
  } inputmode="text" disabled={
    allMode
  } />

  <!--全件取得モード：on のとき検索条件は無視（+page.server.ts 側で分岐）-->
  <div class="toggle-row">
    <label for="allMode" style="text-align:left;">{
      UIMaterial.material06
    }</label>

    <input id="allMode" type="checkbox" name="allMode" bind:checked={
      allMode
    } />

    <span style="font-size:.9rem; color:#666;">{
      allMode ? '全ユーザを取得します' : '完全一致で検索します'
    }</span>

  </div>
  <!--アクション群-->
  <div class="actions">
    <!--入力リセット（バインド変数も初期化）-->
    <button type="reset" class="secondary" onclick={
      () => {
        userID='';
        userName='';
        allMode=false;
      }
    }>{
      UIMaterial.material04
    }</button>

    <!--検索実行（?/searchへPOST）-->
    <button type="submit">{
      UIMaterial.material05
    }</button>

    <!--新規登録モーダルを開く（クライアント内状態のみ変更）-->
    <button type="button" onclick={
      openCreate
    }>{
      UIMaterial.material09
    }</button>

  </div>
</form>

<!--
  ===============================
  検索結果表示
  - formはload/actionsの戻り値が入る
  - 件数0のときはメッセージを表示
  ===============================
-->
{#if form}
  <section style="max-width: 960px; margin: 1rem auto 0;">
    {#if (form.allResults ?? []).length === 0}
      <p>{
        UIMaterial.material08
      }</p>

    {:else}
    <!--一覧テーブル-->
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <!--列1：ユーザID（詳細画面へのリンク）-->
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: .5rem;">{
              UIMaterial.material02
            }</th>

            <!--列2：ユーザ名-->
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: .5rem;">{
              UIMaterial.material03
            }</th>

            <!--列3：作成日（昇順/降順のトグルボタン）-->
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: .5rem;">
              <button type="button" style="all: unset; cursor: pointer; font-weight: 700; pointer-events: auto;" onclick={
                toggleSort
              } aria-label={
                UIMaterial.material19
              }>
                {
                  UIMaterial.material07
                } {
                  sortOrder === 'asc' ? '▲' : '▼'
                }
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <!--keyはuserID：REST API/json-serverどちらでも可-->
          {#each results as r (r.userID)}
            <tr>
              <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">
                <!--ユーザ詳細画面へ遷移（パスパラメータにuserIDを渡す）-->
                <a href={
                  `/UserDetails/${
                    encodeURIComponent(r.userID)
                  }`
                } aria-label={
                  `ユーザ ${
                    r.userID
                  } の詳細へ`
                } style="text-decoration: underline; font-weight: 600; cursor: pointer;">

                  {
                    r.userID
                  }
                </a>
              </td>
              <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">{
                r.userName ?? '-'
              }</td>

              <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">{
                r.accountCreate ?? '-'
              }</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <!--ページネーション-->
      <div style="display: flex; gap: .5rem; justify-content: center; margin-top: 1rem;">
        <button type="button" class="secondary" onclick={
          () => goPage(page - 1)
        } disabled={
          page <= 1
        }>{
          UIMaterial.material10
        }</button>

        <span style="display: inline-flex; align-items: center; padding: 0 .5rem;">{
          page
        }/{
          totalPages
        }（全 {
          totalCount
        } 件）</span>

        <button type="button" onclick={
          () => goPage(page + 1)
        } disabled={
          page >= totalPages
        }>{
          UIMaterial.material11
        }</button>
      </div>
    {/if}
  </section>
{/if}

<!--
  ===============================
  新規ユーザ登録モーダル
  - 表示はshowCreate状態で制御
  - action="?/create"でnamed action "create"が呼ばれる
  ===============================
-->
{#if showCreate}
  <!--背景クリックで閉じる（子要素でイベント伝播を止める）-->
  <!--svelte-ignore a11y_click_events_have_key_events-->
  <!--svelte-ignore a11y_no_static_element_interactions-->
  <div class="overlay" onclick={
    closeCreate
  }>

    <div class="modal" onclick={
      (e) => e.stopPropagation()
    }>

      <h2>{
        UIMaterial.material12
      }</h2>

      <form method="POST" action="?/create" autocomplete="off">
        <div class="modal-grid">
          <!--ユーザID（クライアント側バリデーションも付与。サーバ側でも検証＆重複チェック）-->
          <label for="nu-id">{
            UIMaterial.material02
          }</label>

          <input id="nu-id" name="userID" bind:value={
            createModel.userID
          } required minlength="6" maxlength="20" placeholder={
            UIMaterial.material20
          } />

          <!--ユーザ名-->
          <label for="nu-name">{
            UIMaterial.material03
          }</label>

          <input id="nu-name" name="userName" bind:value={
            createModel.userName
          } required minlength="2" maxlength="30" placeholder={
            UIMaterial.material21
          } />

          <!--パスワード（REST API側へはpasswordとして送る：サーバの差分は+page.server.ts側で吸収）-->
          <label for="nu-pw">{
            UIMaterial.material13
          }</label>

          <input id="nu-pw" name="userPW" bind:value={
            createModel.userPW
          } required minlength="4" maxlength="50" placeholder={
            UIMaterial.material22
          } />

          <!--作成日-->
          <label for="nu-date">{
            UIMaterial.material14
          }</label>

          <input id="nu-date" type="date" name="accountCreate" bind:value={
            createModel.accountCreate
          } required />

        </div>
        <!--送信／キャンセル-->
        <div class="modal-actions">
          <button type="submit">{
            UIMaterial.material15
          }</button>

          <button type="button" class="btn-cancel" onclick={
            closeCreate
          }>{
            UIMaterial.material16
          }</button>
        </div>
      </form>
    </div>
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
<ErrorPopup
  message={
    errorPopup
  }
  onClose={
    () => {
      errorPopup='';
    }
  }
/>

{#if successPopup}
  <div class="toast success" role="status" aria-live="polite">
    <span>{
      successPopup
    }</span>
    <button type="button" aria-label="閉じる" onclick={
      () => (successPopup = '')
    }>×</button>
  </div>
{/if}
