<script lang="ts">
    const emojis={
        apple: '🍎',
        banana: '🍌',
        carrot: '🥕',
        doughnut: '🍩',
        egg: '🥚'
    };

    // emojisのキーユニオン型を作る
    type emojiName = keyof typeof emojis;

    // 親から来る props を型付きで受け取る（デフォルトも型に沿わせる）
    let { name = 'apple' as emojiName }: { name?: emojiName } = $props();

    // `name` is updated whenever the prop value changes...
    // let {name}=$props();

    // ...but `emoji` is fixed upon initialisation
    const emoji = (emojis as Record<string, string>)[name] ?? '❓';
</script>

<p>{emoji}={name}</p>
