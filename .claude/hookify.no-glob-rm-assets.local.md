---
name: no-glob-rm-assets
enabled: true
event: bash
pattern: \brm\b[^;&|\n]*\sassets/\S*[*?\[]|\brm\s+(-\S+\s+)*-[a-zA-Z]*[rR][^;&|\n]*\sassets\b|\bfind\s+[^;&|\n]*assets\b[^;&|\n]*-delete|\bgit\s+clean\b(?![^;&|\n]*\s(-[a-zA-Z]*n|--dry-run))
action: block
---

🛑 **Blocked: wildcard, recursive or untracked-file delete touching assets/**

The user drops untracked art into `assets/`, and in another project a glob
delete has already destroyed one. Untracked files aren't in git, so they can't
be recovered.

- Delete asset files **by exact name only** (`rm assets/images/foo.png`).
- List what you mean to remove first and check each file is yours.
- `git clean` deletes untracked files too — use `git clean -n` to preview, or
  remove named files instead.
