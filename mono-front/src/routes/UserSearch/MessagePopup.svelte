<!--
* =======================================================================
* プログラム名：エラー発生時ポップアップ
* プログラムファイル名：MessagePopup.svelte
* 画面名：エラーメッセージ用ポップアップ
* 画面機能：
* 　　　　　$1：ポップアップ出力機能
* 注意事項：なし
* 作成日：2025年10月12日
* 作成者：深谷 理幸
* =======================================================================
-->
<style>
  /**
  * =====画面全体を覆う半透明オーバーレイ=====
  * - 画面中央にモーダルボックスを配置
  * - z-index で他要素より前面に
  */
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  /** =====モーダル本体（エラーポップアップの枠）===== */
  .popup-box {
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 10px rgba(0,0,0,.3);
    text-align: center;
    max-width: 320px;
  }

  /** =====エラーメッセージ文言（赤字強調）===== */
  .popup-box p {
    margin-bottom: 1rem;
    font-weight: 600;
    color: #c00;
  }

  /** =====OKボタン（閉じる）===== */
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

<script lang="ts">
  // 表示するメッセージ（空文字のときは非表示）
  export let message = '';

  // 親から渡されるクローズハンドラ（状態をクリアする関数）
  export let onClose: () => void;
</script>

{#if message}
  <!--
    ===============================
    背景クリックで閉じる。
    ※a11yのclick-only警告を意図的に黙らせる（Esc対応などは要件に応じて拡張）
    ===============================
  -->
  <!--svelte-ignore a11y_click_events_have_key_events-->
  <!--svelte-ignore a11y_no_static_element_interactions-->
  <div class = "popup-overlay" onclick={
    onClose
  }>

    <!--モーダル内クリックでは閉じないようにイベント伝播を停止-->
    <div class = "popup-box" onclick={
      (e) => e.stopPropagation()
    }>

      <!--エラーメッセージ本体-->
      <p>{
        message
      }</p>

      <!--明示的な閉じる操作（OKボタン）-->
      <button onclick={
        onClose
      }>OK</button>

    </div>
  </div>
{/if}
