<script lang="ts">
    import { fade } from "svelte/transition";
    export let message: string;
    export let error: boolean = false;
    export let warning: boolean = false;
    export let info: boolean = false;
    export let success: boolean = false;

    let visible = true;

    function dismiss() {
        visible = false;
    }
</script>

{#if visible}
    <div
        transition:fade
        class={[
            success && "alert-success",
            warning && "alert-warning",
            error && "alert-error",
            info && "alert-info",
            "alert",
        ]}
    >
        <div class="flex">
            <div class="shrink-0">
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    data-slot="icon"
                    aria-hidden="true"
                    class="size-5"
                >
                    <path
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                        clip-rule="evenodd"
                        fill-rule="evenodd"
                    />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">
                    {message}
                </p>
            </div>
            <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button
                        type="button"
                        on:click={dismiss}
                        class="ml-2 cursor-pointer inline-flex rounded-md bg-green-50 p-1.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-green-50 focus-visible:outline-hidden dark:bg-transparent dark:focus-visible:ring-offset-1"
                    >
                        <span class="sr-only">Dismiss</span>
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            data-slot="icon"
                            aria-hidden="true"
                            class="size-5"
                        >
                            <path
                                d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style lang="postcss">
    @reference "tailwindcss";

    .alert {
        @apply backdrop-blur-lg rounded-md fixed bottom-5;
    }

    .alert-success {
        @apply bg-green-50 p-4 dark:bg-green-500/10 dark:outline dark:outline-green-500/20;
        p {
            @apply text-green-800 dark:text-green-300;
        }
        svg {
            @apply text-green-400;
        }
        button {
            @apply text-green-500 hover:bg-green-100 focus-visible:ring-green-600 dark:text-green-400 dark:hover:bg-green-500/10 dark:focus-visible:ring-green-500 dark:focus-visible:ring-offset-green-900;
        }
    }

    .alert-error {
        @apply bg-red-50 p-4 dark:bg-red-500/10 dark:outline dark:outline-red-500/20;
        p {
            @apply text-red-800 dark:text-red-300;
        }
        svg {
            @apply text-red-400;
        }
        button {
            @apply text-red-500 hover:bg-red-100 focus-visible:ring-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:ring-red-500 dark:focus-visible:ring-offset-red-900;
        }
    }

    .alert-info {
        @apply bg-blue-50 p-4 dark:bg-blue-500/10 dark:outline dark:outline-blue-500/20;
        p {
            @apply text-blue-800 dark:text-blue-300;
        }
        svg {
            @apply text-blue-400;
        }
        button {
            @apply text-blue-500 hover:bg-blue-100 focus-visible:ring-blue-600 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:focus-visible:ring-blue-500 dark:focus-visible:ring-offset-blue-900;
        }
    }

    .alert-warning {
        @apply bg-yellow-50 p-4 dark:bg-yellow-500/10 dark:outline dark:outline-yellow-500/20;
        p {
            @apply text-yellow-800 dark:text-yellow-300;
        }
        svg {
            @apply text-yellow-400;
        }
        button {
            @apply text-yellow-500 hover:bg-yellow-100 focus-visible:ring-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-500/10 dark:focus-visible:ring-yellow-500 dark:focus-visible:ring-offset-yellow-900;
        }
    }
</style>
