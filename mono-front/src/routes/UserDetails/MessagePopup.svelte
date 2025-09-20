<script lang="ts">
    export let message = '';
    export let onClose: () => void;
</script>

{#if message}
    <div class = "popup-overlay" onclick={onClose}>
        <div class = "popup-box" onclick={(e) => e.stopPropagation()}>
            <p>{message}</p>
            <button onclick={onClose}>OK</button>
        </div>
    </div>
{/if}

<style>
    .popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .popup-box {
        background: white;
        padding: 1.5rem 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 10px rgba(0,0,0,.3);
        text-align: center;
        max-width: 320px;
    }
    .popup-box p {
        margin-bottom: 1rem;
        font-weight: 600;
        color: #c00;
    }
    .popup-box button {
        padding: .5rem 1.2rem;
        border: none;
        border-radius: .3rem;
        background: #f0b400;
        color: #222;
        font-weight: 600;
        cursor: pointer;
    }
</style>
