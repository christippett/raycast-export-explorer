<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    export let message: string;
    export let error: boolean = false;
    export let warning: boolean = false;
    export let info: boolean = false;
    export let success: boolean = false;

    let visible = true;

    function dismiss() {
        visible = false;
    }

    onMount(() => {
        const timeout = setTimeout(() => {
            visible = false;
        }, 5000);

        return () => clearTimeout(timeout);
    });
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
