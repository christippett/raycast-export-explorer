<script lang="ts">
    import { type ParsedNote, downloadNote } from "../lib/utils";
    import markdown from "../assets/markdown.svg?raw";
    let { note }: { note: ParsedNote } = $props();

    function formatDate(date: Date): string {
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    function deepLink(id: string) {
        const context = encodeURIComponent(JSON.stringify({ id: id }));
        return `raycast://extensions/raycast/raycast-notes/raycast-notes?context=${context}`;
    }

    function formatId(id: string) {
        return id.split("-")[0];
    }
</script>

<li class="flex items-center justify-between gap-x-6 py-5">
    <div class="min-w-0 flex-1">
        <div class="flex items-start gap-x-3">
            <p
                class="text-sm/6 break-all font-semibold text-gray-900 dark:text-white text-ellipsis overflow-hidden"
            >
                {note.title || "Untitled"}
            </p>
        </div>
        <div
            class="mt-1 justify-between sm:justify-start flex items-center gap-x-2 text-xs/5 text-code"
        >
            <p class="whitespace-nowrap">
                Modified <time datetime={note.modifiedAt.toISOString()}
                    >{formatDate(note.modifiedAt)}</time
                >
            </p>
            <a
                title={note.id}
                href={deepLink(note.id)}
                class=" hover:text-white hover:decoration-white inline-flex items-center"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-3 h-3 inline mx-0.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                    />
                </svg>

                {formatId(note.id)}</a
            >
        </div>
    </div>
    <div class="hidden sm:flex flex-none items-center gap-x-4">
        <button class="text-xs" onclick={() => downloadNote(note)}>
            <span class="text-white inline-flex w-4 h-4">{@html markdown}</span>
            Download
        </button>
    </div>
</li>
