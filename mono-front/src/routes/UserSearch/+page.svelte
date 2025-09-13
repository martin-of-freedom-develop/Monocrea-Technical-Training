<!--
* 画面名：ユーザ検索画面
* プログラムファイル名：+page.svelte
* 処理入力：$1. ユーザID（テキスト）
* 　　　　　$2. ユーザ名（テキスト）
* 処理内部入力: $1. バックエンド切り替えフラグ
* 処理出力：$1. 単一ユーザ検索結果（完全一致検索）
* 　　　　　$2. 全ユーザ検索結果
* 外接サーバ：$1. json-server
* 　　　　　　$2. Docker + PostgreSQL
* 　　　　　　※バックエンド切り替えフラグにより、外接サーバの向き先を変更することができます。
* 処理概要：
* 　json-server若しくはPostgreSQLに格納されているユーザデータの検索を行います。
-->
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
    } | null}>();

    let allMode = $state(form?.allMode ?? false);
    let userID = $state(form?.userID ?? '');
    let userName = $state(form?.userName ?? '');

    let errorMessage = $state(form?.error ?? '');
    let page = $state(1);
    let sortOrder = $state<'asc' | 'desc'>('desc');
    const pageSize = 20;

    // 表示用の実データ
    let sorted = $state<Row[]>([]);
    let results = $state<Row[]>([]);
    let totalCount = $state(0);
    let totalPages = $state(1);

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
        errorMessage = form?.error ?? '';
    });

    function toggleSort() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }

    function goPage(p: number) {
        if (p < 1 || p > totalPages) return;
        page = p;
    }
</script>

<h1>{UIMaterial.material01}</h1>

<form class="form-grid" method="POST" autocomplete="off">
    <label for="userID">{UIMaterial.material02}</label>
    <input
        id="userID"
        name="userID"
        bind:value={userID}
        placeholder="検索したいユーザIDを入力してください。"
        inputmode="text"
        disabled={allMode}
    />

    <label for="userName">{UIMaterial.material03}</label>
    <input
        id="userName"
        name="userName"
        bind:value={userName}
        placeholder="検索したいユーザ名を入力してください。"
        inputmode="text"
        disabled={allMode}
    />

    <div class="toggle-row">
        <label for="allMode" style="text-align:left;">{UIMaterial.material06}</label>
        <input id="allMode" type="checkbox" name="allMode" bind:checked={allMode} />
        <span style="font-size:.9rem; color:#666;">
            {allMode ? '全ユーザを取得します' : '完全一致で検索します'}
        </span>
    </div>

    <div class="actions">
        <button type="reset" class="secondary" onclick={() => {userID=''; userName=''; allMode=false;}}>{UIMaterial.material04}</button>
        <!--
         検索ボタンを押下後、同じディレクトリの+page.server.ts内のactions.defaultが自動で呼ばれる。
        -->
        <button type="submit">{UIMaterial.material05}</button>
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
                            <button
                                type="button"
                                style="all: unset; cursor: pointer; font-weight: 700; pointer-events: auto;"
                                onclick={toggleSort}
                                aria-label="作成日の昇順/降順を切り替え"
                            >
                                {UIMaterial.material07} {sortOrder === 'asc' ? '▲' : '▼'}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each results as r (r.id)}
                        <tr>
                            <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">{r.userID}</td>
                            <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">{r.userName ?? '-'}</td>
                            <td style="border-bottom: 1px solid #f0f0f0; padding: .5rem;">{r.accountCreate ?? '-'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <div style="display: flex; gap: .5rem; justify-content: center; margin-top: 1rem;">
                <button class="secondary" onclick={() => goPage(page - 1)} disabled={page <= 1}>前へ</button>
                <span style="display: inline-flex; align-items: center; padding: 0 .5rem;">
                    {page}/{totalPages}（全 {totalCount} 件）
                </span>
                <button onclick={() => goPage(page + 1)} disabled={page >= totalPages}>次へ</button>
            </div>
        {/if}
  </section>
{/if}

<ErrorPopup message={errorMessage} onClose={() => (errorMessage = '')} />
