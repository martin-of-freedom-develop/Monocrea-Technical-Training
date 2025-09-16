<script lang="ts">
    import {counter} from './shared.svelte.js';
</script>

<button onclick={() => counter.count += 1}>
    clicks: {counter.count}
</button>
