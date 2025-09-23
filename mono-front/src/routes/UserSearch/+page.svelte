<!-- src/routes/UserSearch/+page.svelte -->
<style>
  h1 {
    text-align: center;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.75rem 1rem;
    align-items: center;
    max-width: 640px;
    margin: 0 auto;
  }
  label {
    text-align: right;
    font-weight: 600;
  }
  input {
    padding: .6rem .8rem;
    border: 1px solid #ddd;
    border-radius: .5rem;
    font-size: 1rem;
  }
  input:focus {
    outline: none;
    border-color: #f0b400;
    box-shadow: 0 0 0 3px rgba(240, 180, 0,.15);
  }
  .actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  button {
    padding: .55rem 1rem;
    border: none;
    border-radius: .5rem;
    background: #f0b400;
    color: #222;
    font-weight: 700;
    cursor: pointer;
  }
  button.secondary {
    background: #eee;
  }
  input:disabled {
    background: #f7f7f7;
    color: #888;
    cursor: not-allowed;
  }
  .toggle-row {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: .5rem;
    justify-content: center;
    margin-bottom: .25rem;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal {
    background: #fff;
    padding: 1rem 1.25rem;
    border-radius: .5rem;
    width: min(560px, 92vw);
    box-shadow: 0 10px 24px rgba(0,0,0,.2);
  }
  .modal h2 {
    margin: 0 0 .75rem;
    text-align: center;
  }
  .modal-grid {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: .75rem 1rem;
    align-items: center;
  }
  .modal-actions {
    display: flex;
    gap: .75rem;
    justify-content: center;
    margin-top: 1rem;
  }
  .btn-cancel {
    background: #eee;
    color: #222;
    border: 1px solid #ddd;
    padding: .55rem 1rem;
    border-radius: .5rem;
    font-weight:700;
    cursor:pointer;
  }
</style>

<script lang="ts">
    import {UIMaterial} from './UserSearchMaterial';
    import ErrorPopup from './ValidationErrorPopup.svelte';

    type Row = {
        id: number;
        userID: string;
        userName: string;
        userPW: string;
        accountCreate: string;
        deleteFlg: number;
    };

    const {form} = $props<{form: {
        allMode?: boolean;
        userID?: string;
        userName?: string;
        allResults?: Row[];
        error?: string | null;
        createdMessage?: string;
    } | null}>();

    let allMode = $state(form?.allMode ?? false);
    let userID = $state(form?.userID ?? '');
    let userName = $state(form?.userName ?? '');

    let errorMessage = $state(form?.error ?? '');
    let successMessage = $state(form?.createdMessage ?? '');

    let page = $state(1);
    let sortOrder = $state<'asc' | 'desc'>('desc');
    const pageSize = 20;

    let sorted = $state<Row[]>([]);
    let results = $state<Row[]>([]);
    let totalCount = $state(0);
    let totalPages = $state(1);

    let showCreate = $state(false);
    function todayISO() {
        return new Date().toISOString().slice(0,10);
    }
    let createModel = $state({
        userID: '',
        userName: '',
        userPW: '',
        accountCreate: todayISO()
    });

    $effect(() => {
        form; sortOrder; page;

        const source: Row[] = form?.allResults ?? [];
        const arr = [...source].sort((a, b) => {
            const cmp = (a.accountCreate ?? '').localeCompare(b.accountCreate ?? '');
            return sortOrder === 'asc' ? cmp : -cmp;
        });

        const count = arr.length;
        const pages = Math.max(1, Math.ceil(count / pageSize));
        const start = (page - 1) * pageSize;

        sorted = arr;
        totalCount = count;
        totalPages = pages;
        results = arr.slice(start, start + pageSize);
    });

    // ✅ サーバ由来メッセージ反映用（サーバ値が変わった時だけ反映）
    let lastFormToken = $state(''); // 直近のサーバメッセージの「指紋」
    $effect(() => {
        form;

        const fErr = form?.error ?? '';
        const fOk  = form?.createdMessage ?? '';
        const token = `${fErr}||${fOk}`;

        // サーバからのメッセージが変わっていなければ何もしない
        if (token === lastFormToken) return;
        lastFormToken = token;

        // 新しいサーバ値を反映
        errorMessage = fErr;
        successMessage = fOk;

        // モーダルの開閉は「今回のサーバ結果」で決める
        if (fErr)  showCreate = true;
        if (fOk)   showCreate = false;
    });

    function toggleSort() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    function goPage(p: number) {
        if (p < 1 || p > totalPages) return;
        page = p;
    }
    function openCreate() {
        errorMessage = '';
        successMessage = '';
        createModel = {
            userID:'',
            userName:'',
            userPW:'',
            accountCreate: todayISO()
        };
        showCreate = true;
    }
    function closeCreate() {
        showCreate = false;
    }
</script>

<h1>{UIMaterial.material01}</h1>

<!-- ★ 検索は named action に変更 -->
<form class="form-grid" method="POST" action="?/search" autocomplete="off">
    <label for="userID">{UIMaterial.material02}</label>
    <input id="userID" name="userID" bind:value={userID} placeholder="検索したいユーザIDを入力してください。" inputmode="text" disabled={allMode} />

    <label for="userName">{UIMaterial.material03}</label>
    <input id="userName" name="userName" bind:value={userName} placeholder="検索したいユーザ名を入力してください。" inputmode="text" disabled={allMode} />

    <div class="toggle-row">
        <label for="allMode" style="text-align:left;">{UIMaterial.material06}</label>
        <input id="allMode" type="checkbox" name="allMode" bind:checked={allMode} />
        <span style="font-size:.9rem; color:#666;">{allMode ? '全ユーザを取得します' : '完全一致で検索します'}</span>
    </div>

    <div class="actions">
        <button type="reset" class="secondary" onclick={() => {userID=''; userName=''; allMode=false;}}>{UIMaterial.material04}</button>
        <button type="submit">{UIMaterial.material05}</button>
        <button type="button" onclick={openCreate}>新規登録</button>
    </div>
</form>

{#if form}
    <section style="max-width: 960px; margin: 1rem auto 0;">
        {#if (form.allResults ?? []).length === 0}
            <p>{UIMaterial.material08}</p>
        {:else}
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left; border-bottom: 1px solid #ddd; padding: .5rem;">{UIMaterial.material02}</th>
                        <th style="text-align: left; border-bottom: 1px solid #ddd; padding: .5rem;">{UIMaterial.material03}</th>
                        <th style="text-align: left; border-bottom: 1px solid #ddd; padding: .5rem;">
                            <button type="button" style="all: unset; cursor: pointer; font-weight: 700; pointer-events: auto;" onclick={toggleSort} aria-label="作成日の昇順/降順を切り替え">
                                {UIMaterial.material07} {sortOrder === 'asc' ? '▲' : '▼'}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each results as r (r.id)}
                        <tr>
                            <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">
                                <a href={`/UserDetails/${encodeURIComponent(r.userID)}`} aria-label={`ユーザ ${r.userID} の詳細へ`} style="text-decoration: underline; font-weight: 600; cursor: pointer;">
                                    {r.userID}
                                </a>
                            </td>
                            <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">{r.userName ?? '-'}</td>
                            <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">{r.accountCreate ?? '-'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <div style="display: flex; gap: .5rem; justify-content: center; margin-top: 1rem;">
                <button class="secondary" onclick={() => goPage(page - 1)} disabled={page <= 1}>前へ</button>
                <span style="display: inline-flex; align-items: center; padding: 0 .5rem;">{page}/{totalPages}（全 {totalCount} 件）</span>
                <button onclick={() => goPage(page + 1)} disabled={page >= totalPages}>次へ</button>
            </div>
        {/if}
    </section>
{/if}

{#if showCreate}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="overlay" onclick={closeCreate}>
        <div class="modal" onclick={(e) => e.stopPropagation()}>
            <h2>新規ユーザ登録</h2>
            <form method="POST" action="?/create" autocomplete="off">
                <div class="modal-grid">
                    <label for="nu-id">ユーザID</label>
                    <input id="nu-id" name="userID" bind:value={createModel.userID} required minlength="6" maxlength="20" placeholder="例）User123" />

                    <label for="nu-name">ユーザ名</label>
                    <input id="nu-name" name="userName" bind:value={createModel.userName} required minlength="2" maxlength="30" placeholder="例）山田太郎" />

                    <label for="nu-pw">パスワード</label>
                    <input id="nu-pw" name="userPW" bind:value={createModel.userPW} required minlength="4" maxlength="50" placeholder="********" />

                    <label for="nu-date">作成日</label>
                    <input id="nu-date" type="date" name="accountCreate" bind:value={createModel.accountCreate} required />
                </div>

                <div class="modal-actions">
                    <button type="submit">登録する</button>
                    <button type="button" class="btn-cancel" onclick={closeCreate}>キャンセル</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<ErrorPopup message={successMessage || errorMessage} onClose={() => { successMessage=''; errorMessage=''; }} />
