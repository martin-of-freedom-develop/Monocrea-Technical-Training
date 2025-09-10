<!--
* ================================================
* プログラム名：ユーザ検索画面
* URL：http://localhost:5173/UserSearch
* ================================================
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
        gap: .5rem;
        justify-content: flex-end;
        margin-top: .5rem;
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
</style>

<script lang="ts">
    import {UIMaterial} from './UserSearchMaterial';
    import {ValidationMessage} from './ValidationErrorMessage';

    // ユーザID
    let userID = $state('')

    // ユーザ名
    let userName = $state('')

    const placeholder = {
        id: '検索したいユーザIDを入力してください。',
        name: '検索したいユーザ名を入力してください。'
    };

    function onSubmit(e: Event) {
        e.preventDefault();
        // ここでjson-serverに対する検索処理を呼び出す
    }

    function onReset() {
        userID = '';
        userName = '';
    }
</script>

<h1>{UIMaterial.material01}</h1>

<form class="form-grid" on:submit={onSubmit} on:reset={onReset} autocomplete="off">
    <label for="userID">{UIMaterial.material02}</label>
    <input
        id="userID"
        name="useerID"
        bind:value={userID}
        placeholder={placeholder.id}
        inputmode="text"
    />
    <label for="userName">{UIMaterial.material03}</label>
    <input
        id="userName"
        name="userName"
        bind:value={userName}
        placeholder={placeholder.name}
        inputmode="text"
    />
    <div class="actions">
        <button type="reset" class="secondary">{UIMaterial.material04}</button>
        <button type="submit">{UIMaterial.material05}</button>
    </div>
</form>
