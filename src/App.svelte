<script lang="ts">
    import { RaycastConfig } from "./lib/decrypt";
    import {
        parseAllNotes,
        downloadNotesZip,
        type ParsedNote,
    } from "./lib/utils";
    import zip from "./assets/zip.svg?raw";
    import InputForm from "./components/InputForm.svelte";
    import Divider from "./components/Divider.svelte";
    import Alert from "./components/Alert.svelte";
    import Note from "./components/Note.svelte";

    let files: FileList | null = null;
    let passphrase = "";
    let loading = false;
    let error = "";
    let success = "";
    let config: RaycastConfig | null = null;
    let notes: ParsedNote[] = [];
    let showNotes = false;
    let downloadingZip = false;

    async function handleFileDecrypt() {
        if (!files || files.length === 0) {
            error = "Please select a .rayconfig file";
            return;
        }

        if (!passphrase.trim()) {
            error = "Please enter your passphrase";
            return;
        }

        loading = true;
        error = "";
        success = "";

        try {
            const file = files[0];
            config = new RaycastConfig();

            await config.importFile(passphrase, file);

            // Try to parse notes
            const notesData = config.notes();
            if (notesData && notesData.length > 0) {
                notes = parseAllNotes(notesData);
                success = `Successfully decrypted! Found ${notes.length} notes.`;
                showNotes = true;
            } else {
                success =
                    "Successfully decrypted! No notes found in this config.";
                showNotes = false;
            }
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to decrypt file";
            config = null;
            notes = [];
            showNotes = false;
        } finally {
            loading = false;
        }
    }

    async function handleNotesDownload() {
        if (notes.length === 0) return;

        downloadingZip = true;
        error = "";

        try {
            await downloadNotesZip(notes);
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Failed to create ZIP file";
        } finally {
            downloadingZip = false;
        }
    }
</script>

<main>
    <div class="flex gap-8 items-center flex-col max-w-3xl my-0 mx-auto">
        <header class="flex flex-col items-center">
            <img height="192" width="192" src="raycast.webp" alt="Icon" />
            <h1 class="text-3xl font-bold my-4">Raycast Export Explorer</h1>
            <p class="text-muted text-center">
                Decrypt your exported Raycast configuration.
            </p>
            <p class="text-muted text-center">
                Files are processed 100% locally, nothing leaves your browser.
            </p>
        </header>

        {#if !showNotes}
            <InputForm
                bind:files
                bind:passphrase
                {loading}
                {handleFileDecrypt}
            />
        {/if}

        {#if error}
            <Alert error message={error} />
        {/if}

        {#if success}
            <Alert success message={success} />
        {/if}

        {#if showNotes && notes.length > 0}
            <Divider text="Raycast Notes" />
            <section class="flex flex-col">
                <button
                    onclick={handleNotesDownload}
                    class="download mb-4 sm:self-end"
                    disabled={downloadingZip}
                >
                    <span class="h-4 w-4">{@html zip}</span>
                    {downloadingZip ? "Creating Archive..." : "Download All"}
                </button>

                <ul
                    role="list"
                    class="divide-y divide-gray-100 dark:divide-white/5"
                >
                    {#each notes as note}
                        <Note {note} />
                    {/each}
                </ul>
            </section>
        {/if}
    </div>
</main>

<style>
    @reference "tailwindcss";
    button.download {
        @apply text-sm bg-red-700/50 text-red-50 outline-1 outline-red-500/50;
    }
</style>
