# GitHub Actions Workflow

## Chord File Formatting

### `chords-formatter.yml` - Auto-format Chord Charts

This workflow automates the process of converting plain text (`.txt`) chord charts into styled HTML files.

- **Trigger:** Runs on every `push` to the `main` branch **only if** `.txt` files within the `Songs/` directory have been changed. This includes **adding new `.txt` files** and **editing existing ones**.
- **Action:** Executes the `Songs/chords_formatter.js` script.

#### How `chords_formatter.js` Works

This Node.js script is responsible for the conversion. Its job is to:

1.  **Scan the `Songs/` directory** for `.txt` files.
2.  **Filter files:** It only processes files that have `chord` or `chords` in their filename (case-insensitive).
3.  **Apply Formatting:**
    -   It identifies lines containing musical chords (e.g., `A`, `G#m`, `C/G`) and wraps them in `<span style="color: red">`.
    -   It identifies section headers (e.g., `Verse`, `Chorus`, `Bridge`) and wraps them in `<span style="color: blue">`.
4.  **Generate an HTML File:** It embeds the formatted content into a simple HTML structure and saves it with an `.html` extension, overwriting any existing file.

#### The Formatting Process

Here’s a typical sequence:

1.  A user adds or edits a `.txt` chord chart in the `Songs/` directory (ensuring the filename contains "chord").
2.  They commit and push this change to the `main` branch.
3.  GitHub Actions detects the push and triggers the `Format Chord Files` workflow.
4.  The workflow runs the `chords_formatter.js` script.
5.  The script scans the directory, finds the new or updated `.txt` chord file, and generates a corresponding `.html` file with proper styling.
6.  Finally, the workflow automatically commits the newly generated/updated `.html` file back into the repository.

This creates a seamless process where chord charts only need to be managed as plain text files, and the styled, web-viewable HTML versions are automatically kept in sync.
