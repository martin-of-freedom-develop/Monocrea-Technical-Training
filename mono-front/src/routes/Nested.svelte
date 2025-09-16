<script lang="ts">
    /**
     * 以下リンク先のチュートリアルでは、Type 'number' is not assignable to type 'string'というコンパイルエラーが発生してしまう。
     * URL：https://svelte.dev/tutorial/svelte/default-values
     * 
     * これは、TypeScriptの型推論とデフォルト値の不一致が原因である。'a mystery' と書いていることで answer は string と推論されるため、実際に 42 を渡すと型エラーになる
     * 
     * この状況は、チュートリアルが「仕様としては成り立つし動作もする」ことを示しているだけで、TSの型整合性については設計の余地を残しているだけだと思われる。
     * チュートリアルでは、以下の書き方をしている。
     * let { answer = 'a mystery' } = $props();
     */
    type Props = { answer?: string | number };
    let { answer = 'a mystery' }: Props = $props();
</script>
<p>This is another paragraph.</p>

<p>The answer is {answer}</p>
