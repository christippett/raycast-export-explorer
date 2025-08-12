<script lang="ts">
  import { RaycastConfig } from './lib/decrypt';
  import { parseAllNotes, downloadNote, downloadAllNotes, type ParsedNote } from './lib/utils';

  let files: FileList | null = null;
  let passphrase = '';
  let loading = false;
  let error = '';
  let success = '';
  let config: RaycastConfig | null = null;
  let notes: ParsedNote[] = [];
  let showNotes = false;

  async function handleDecrypt() {
    if (!files || files.length === 0) {
      error = 'Please select a .rayconfig file';
      return;
    }

    if (!passphrase.trim()) {
      error = 'Please enter your passphrase';
      return;
    }

    loading = true;
    error = '';
    success = '';

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
        success = 'Successfully decrypted! No notes found in this config.';
        showNotes = false;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to decrypt file';
      config = null;
      notes = [];
      showNotes = false;
    } finally {
      loading = false;
    }
  }

  function handleReset() {
    files = null;
    passphrase = '';
    error = '';
    success = '';
    config = null;
    notes = [];
    showNotes = false;
  }

  function handleDownloadAll() {
    if (notes.length > 0) {
      downloadAllNotes(notes);
    }
  }

  function handleDownloadNote(note: ParsedNote) {
    downloadNote(note);
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  function truncateContent(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
</script>

<main>
  <div class="container">
    <header>
      <h1>🎯 Raycast Config Decoder</h1>
      <p>Decrypt and extract notes from your exported Raycast configuration file</p>
    </header>

    <div class="upload-section">
      <div class="file-input-wrapper">
        <label for="file-input" class="file-label">
          <span class="file-icon">📁</span>
          Choose .rayconfig file
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
        <label for="passphrase">Passphrase:</label>
        <input
          id="passphrase"
          type="password"
          bind:value={passphrase}
          placeholder="Enter your decryption passphrase"
          disabled={loading}
          on:keypress={(e) => e.key === 'Enter' && handleDecrypt()}
        />
      </div>

      <div class="button-group">
        <button
          on:click={handleDecrypt}
          disabled={loading || !files || !passphrase.trim()}
          class="decrypt-btn"
        >
          {loading ? 'Decrypting...' : 'Decrypt'}
        </button>

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
          <button on:click={handleDownloadAll} class="download-all-btn">
            Download All Notes
          </button>
        </div>

        <div class="notes-grid">
          {#each notes as note}
            <div class="note-card">
              <div class="note-header">
                <h3 class="note-title">{note.title || 'Untitled'}</h3>
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
                <span class="note-date">Modified: {formatDate(note.modifiedAt)}</span>
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
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
    color: white;
  }

  header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  header p {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .upload-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
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

  #file-input {
    display: none;
  }

  .file-name {
    margin-left: 1rem;
    color: #28a745;
    font-weight: 500;
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

  #passphrase {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  #passphrase:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .decrypt-btn, .reset-btn, .download-all-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .decrypt-btn {
    background: #667eea;
    color: white;
  }

  .decrypt-btn:hover:not(:disabled) {
    background: #5a67d8;
  }

  .decrypt-btn:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }

  .reset-btn {
    background: #6c757d;
    color: white;
  }

  .reset-btn:hover {
    background: #5a6268;
  }

  .download-all-btn {
    background: #28a745;
    color: white;
  }

  .download-all-btn:hover {
    background: #218838;
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
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
