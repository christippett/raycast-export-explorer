<script lang="ts">
    import { fade, slide } from "svelte/transition";

    let {
        files = $bindable(),
        passphrase = $bindable(),
        loading,
        handleFileDecrypt,
    } = $props();
</script>

<div
    class="upload-form border-white/5 flex flex-col gap-6 w-full sm:w-3/5 md:w-2/5 rounded-lg mb-2 px-6 pb-8"
>
    <div class="flex items-center justify-center w-full">
        <label
            for="file-input"
            class="flex flex-col items-center justify-center w-full rounded-lg cursor-pointer"
        >
            <div
                class="flex flex-col items-center justify-center pt-8 text-muted"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-12 mb-4"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                </svg>

                <p class="mb-2 text-sm text-center">
                    <span class="font-medium text-white"
                        >Select .rayconfig file</span
                    >
                    <span class="block">or drag and drop</span>
                </p>
                {#if files && files.length > 0}
                    <p
                        transition:fade
                        class="text-xs text-code font-mono text-center"
                    >
                        {files[0].name}
                    </p>
                {/if}
            </div>
            <input
                id="file-input"
                type="file"
                class="sr-only"
                accept=".rayconfig"
                bind:files
                disabled={loading}
            />
        </label>
    </div>

    {#if files && files.length > 0}
        <div transition:slide class="password-input-wrapper">
            <input
                id="passphrase"
                class="transition-all rounded-md px-3 py-2 w-full text-white outline-0 border-1 border-white/5 focus:border-white/20 bg-white/5"
                type="password"
                bind:value={passphrase}
                placeholder="Password"
                disabled={loading}
                data-1p-ignore
                onkeypress={(e) => e.key === "Enter" && handleFileDecrypt()}
            />
        </div>

        <div class="flex gap-4 relative justify-center">
            <button
                onclick={handleFileDecrypt}
                disabled={loading || !files || !passphrase.trim()}
                class="bg-gray-100 disabled:bg-gray-100/50 disabled:text-white/50"
            >
                {loading ? "Loading..." : "Load Config"}
            </button>
            <span class="glow"></span>
        </div>
    {/if}
</div>

<style lang="postcss">
    @reference "tailwindcss";

    .upload-form {
        box-shadow: inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1);
        background-image: linear-gradient(
            45deg,
            rgb(12, 13, 15) 0px,
            rgb(7, 8, 10) 100%
        );
    }

    button {
        /*background: rgba(230, 230, 230, 1);*/
        @apply disabled:opacity-50  text-sm w-full h-10 z-10;
        box-shadow:
            inset 0 -1px 0.4px 0 rgba(0, 0, 0, 0.2),
            inset 0 1px 0.4px 0 rgba(255, 255, 255, 0.5),
            0 0 0 2px rgba(0, 0, 0, 0.1),
            0 0 10px 0 hsla(0, 0%, 100%, 0.1);
        &:not([disabled]):hover + .glow {
            opacity: 0.8;
        }
    }

    .glow {
        position: absolute;
        right: 20%;
        left: 20%;
        z-index: 0;
        height: 75%;
        background: conic-gradient(
            from 136.95deg at 50% 50%,
            #0294fe -55.68deg,
            #ff2136 113.23deg,
            #9b4dff 195deg,
            #0294fe 304.32deg,
            #ff2136 473.23deg
        );
        filter: blur(32px);
        border-radius: 6px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        transform: translateZ(0);
        will-change: opacity;
    }
</style>
