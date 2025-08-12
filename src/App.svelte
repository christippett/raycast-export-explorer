<script lang="ts">
    import { RaycastConfig } from "./lib/decrypt";
    import {
        parseAllNotes,
        downloadNote,
        downloadNotesZip,
        type ParsedNote,
    } from "./lib/utils";

    let files: FileList | null = null;
    let passphrase = "";
    let loading = false;
    let error = "";
    let success = "";
    let config: RaycastConfig | null = null;
    let notes: ParsedNote[] = [];
    let showNotes = false;
    let downloadingZip = false;

    async function handleDecrypt() {
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

    function handleReset() {
        files = null;
        passphrase = "";
        error = "";
        success = "";
        config = null;
        notes = [];
        showNotes = false;
    }

    async function handleDownloadAll() {
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

    function handleDownloadNote(note: ParsedNote) {
        downloadNote(note);
    }

    function formatDate(date: Date): string {
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    function truncateContent(content: string, maxLength: number = 200): string {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    }
</script>

<main>
    <div class="container">
        <header>
            <img height="48" width="48" src="/raycast.svg" />
            <h1>Raycast Notes Exporter</h1>
            <p>
                Decrypt and extract notes from your exported Raycast
                configuration file
            </p>
        </header>

        <div class="upload-section">
            <div class="file-input-wrapper">
                <label for="file-input" class="file-label">
                    <span class="file-icon">📁</span>
                    Load .rayconfig
                </label>
                <input
                    id="file-input"
                    type="file"
                    accept=".rayconfig"
                    bind:files
                    disabled={loading}
                />
                {#if files && files.length > 0}
                    <span class="file-name">{files[0].name}</span>
                {/if}
            </div>

            <div class="password-input-wrapper">
                <input
                    id="passphrase"
                    type="password"
                    bind:value={passphrase}
                    placeholder="Password"
                    disabled={loading}
                    on:keypress={(e) => e.key === "Enter" && handleDecrypt()}
                />
            </div>

            <div class="button-group">
                <button
                    on:click={handleDecrypt}
                    disabled={loading || !files || !passphrase.trim()}
                    class="decrypt-btn"
                >
                    {loading ? "Decrypting..." : "Decrypt"}
                </button>
                <span class="glow"></span>

                {#if config}
                    <button on:click={handleReset} class="reset-btn">
                        Reset
                    </button>
                {/if}
            </div>
        </div>

        {#if error}
            <div class="alert error">
                <span class="alert-icon">❌</span>
                {error}
            </div>
        {/if}

        {#if success}
            <div class="alert success">
                <span class="alert-icon">✅</span>
                {success}
            </div>
        {/if}

        {#if showNotes && notes.length > 0}
            <div class="notes-section">
                <div class="notes-header">
                    <h2>📝 Notes ({notes.length})</h2>
                    <button
                        on:click={handleDownloadAll}
                        class="download-all-btn"
                        disabled={downloadingZip}
                    >
                        {downloadingZip
                            ? "📦 Creating ZIP..."
                            : "📦 Download ZIP"}
                    </button>
                </div>

                <div class="notes-grid">
                    {#each notes as note}
                        <div class="note-card">
                            <div class="note-header">
                                <h3 class="note-title">
                                    {note.title || "Untitled"}
                                </h3>
                                <button
                                    on:click={() => handleDownloadNote(note)}
                                    class="download-btn"
                                    title="Download this note"
                                >
                                    💾
                                </button>
                            </div>
                            <div class="note-meta">
                                <span class="note-id">ID: {note.id}</span>
                                <span class="note-date"
                                    >Modified: {formatDate(
                                        note.modifiedAt,
                                    )}</span
                                >
                            </div>
                            <div class="note-preview">
                                <pre>{truncateContent(note.content)}</pre>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</main>

<style>
    :root {
        --text-white: white;
        --text-muted: rgb(106, 107, 108);
    }
    :global(body) {
        margin: 0;
        font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
        background: rgb(7, 8, 10);
        min-height: 100vh;
    }

    .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    header {
        text-align: center;
        margin-bottom: 3rem;
        color: white;
        h1 {
            font-size: 3rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        p {
            font-size: 1.2rem;
            color: var(--text-muted);
            font-weight: 500;
        }
    }

    input[type="password"] {
        position: relative;
        width: 100%;
        height: 42px;
        padding: 12px 8px;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        color: white;
        letter-spacing: 0.2px;
        background: hsla(0, 0%, 100%, 0.05);
        border: 1px solid hsla(0, 0%, 100%, 0.05);
        border-radius: 8px;
        outline: none;
        transition:
            color 0.3s ease,
            border 0.3s ease;
        &:focus {
            border-color: hsla(0, 0%, 100%, 0.4);
        }
    }

    .upload-section {
        width: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1);
        background-image: linear-gradient(
            45deg,
            rgb(12, 13, 15) 0px,
            rgb(7, 8, 10) 100%
        );
        /*background: radial-gradient(
            90.35% 49.25% at 50% 59.06%,
            rgba(2, 61, 114, 0.7),
            rgba(5, 11, 28, 0.42)
        );
        box-shadow:
            0px 1px 0px 0px rgba(255, 255, 255, 0.1) inset,
            0px 30px 50px 0px rgba(0, 0, 0, 0.4),
            0px 4px 24px 0px rgba(3, 30, 129, 0.09),
            0 0 0 1px rgba(255, 255, 255, 0.06) inset;*/
    }

    .file-input-wrapper {
        margin-bottom: 1.5rem;
    }

    .file-label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }

    .file-label:hover {
        background: #e9ecef;
        border-color: #adb5bd;
    }

    input[type="file"] {
        display: none;
    }

    .file-name {
        display: block;
        margin-top: 0.5rem;
        color: rgb(156, 156, 157);
        font-size: 0.8rem;
        font-family: "Red Hat Mono", monospace;
    }

    .password-input-wrapper {
        margin-bottom: 1.5rem;
    }

    .password-input-wrapper label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #495057;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        position: relative;
        padding: 12px 8px;
    }

    button,
    .file-label {
        z-index: 1;
        flex: 1;
        cursor: pointer;
        border-radius: 8px;
        border: none;
        padding: 8px 12px;
        font-weight: 500;
        font-size: 14px;
        color: rgb(47, 48, 49);
        background: rgb(230, 230, 230);
        box-shadow:
            inset 0 -1px 0.4px 0 rgba(0, 0, 0, 0.2),
            inset 0 1px 0.4px 0 #fff,
            0 0 0 2px rgba(0, 0, 0, 0.1),
            0 0 14px 0 hsla(0, 0%, 100%, 0.19);
    }
    button:hover + .glow {
        opacity: 0.8;
    }
    .glow {
        position: absolute;
        right: 0;
        left: 0;
        z-index: 0;
        width: 100%;
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

    button.reset-btn {
        background: linear-gradient(
            180deg,
            hsla(0, 0%, 100%, 0.03),
            hsla(0, 0%, 100%, 0.1)
        );
        color: white;
        box-shadow:
            inset 0 1px 0 0 hsla(0, 0%, 100%, 0.05),
            0 0 0 1px hsla(0, 0%, 100%, 0.25),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.2);
    }

    .download-all-btn {
        background: #28a745;
        color: white;
    }

    .download-all-btn:hover:not(:disabled) {
        background: #218838;
    }

    .download-all-btn:disabled {
        background: #e9ecef;
        color: #6c757d;
        cursor: not-allowed;
    }

    .alert {
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .alert.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .alert.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .notes-section {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .notes-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .notes-header h2 {
        margin: 0;
        color: #495057;
    }

    .notes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
    }

    .note-card {
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 1.5rem;
        transition: box-shadow 0.2s;
    }

    .note-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .note-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .note-title {
        margin: 0;
        color: #495057;
        font-size: 1.1rem;
        line-height: 1.3;
        flex: 1;
    }

    .download-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .download-btn:hover {
        background: #f8f9fa;
    }

    .note-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.85rem;
        color: #6c757d;
        margin-bottom: 1rem;
    }

    .note-preview {
        max-height: 150px;
        overflow: hidden;
    }

    .note-preview pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 0.9rem;
        line-height: 1.4;
        color: #495057;
        background: #f8f9fa;
        padding: 0.75rem;
        border-radius: 4px;
    }

    @media (max-width: 768px) {
        .container {
            padding: 1rem;
        }

        header h1 {
            font-size: 2rem;
        }

        .notes-grid {
            grid-template-columns: 1fr;
        }

        .notes-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
        }

        .button-group {
            flex-direction: column;
        }
    }
</style>
