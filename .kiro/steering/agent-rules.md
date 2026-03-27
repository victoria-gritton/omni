---
inclusion: always
---

# Omni Project Rules

## Writing Files
- ALWAYS use IDE tools (fsWrite, strReplace) to write files so the IDE tracks changes and HMR works.
- NEVER write files using bash heredoc (`cat > path << 'EOF'`), echo, or shell redirects. The IDE cannot detect those changes — "Execution Changes" shows 0 files and the dev server HMR does not pick them up. The user will see NO changes.
- If a "Failed to save" or "content is newer" conflict dialog appears, just rewrite the file with fsWrite. That resolves it. Do NOT ask the user to click anything.
- Do NOT do piecemeal strReplace edits that risk breaking JSX/TSX structure. If more than 3 replacements are needed, rewrite the whole file via fsWrite.

## Agent Behavior
- NEVER ask the user to open F12, check console, hard reload, click dialogs, or do any developer actions. Figure it out yourself.
- Do NOT spiral. If something isn't working after 2 attempts, stop and try a completely different approach.
- NEVER repeat an approach that already failed. If you tried something and it didn't work, try a completely different approach.
- Do NOT guess. Check git history, read files, verify state before acting.
- Do NOT make excuses or blame HMR/caching/the user. Find the actual problem and fix it.
- ALWAYS read ALL files involved in a change FIRST. Understand the full data/event flow before touching anything.
- NEVER claim files are corrupted without evidence. Check the actual file content first.

## Before Writing Code
- Trace the component tree, prop flow, and event routing BEFORE writing a single line.
- If you don't understand which component owns the behavior, you will break things.

## Committing Work
- ALWAYS commit to the omni git repo after completing any task. Run `git -C omni add -A && git -C omni commit -m "<description>"` after every meaningful change.
- NEVER let work exist only in the working tree. Uncommitted work is lost when conversations end.
- When a conversation is getting long, proactively commit all current work before it gets summarized.
- NEVER use `git checkout` or `git restore` to overwrite working files unless the user explicitly asks to revert.

## Pushing Work
- ALWAYS ask the user before pushing. Never push automatically.
- ALWAYS use `--force` when pushing. Local is ALWAYS the source of truth. NEVER use `git pull`, `git pull --rebase`, `git rebase`, or `git merge` to integrate remote changes.
- NEVER use `git checkout` to switch branches during a push. It reverts the working tree.
- Before pushing, always run `npm run build` in omni to update the dist file.
- When pushing, follow this order:
  1. Push omni repo to `victoria` branch: `git -C omni push --force origin main:victoria`
  2. Only push to `main` when the user explicitly says so: `git -C omni push --force origin main`
  3. Push dist to vibecoding repo: `git -C /Users/grittv/vibecoding add omni/dist && git -C /Users/grittv/vibecoding commit -m "<description>" && git -C /Users/grittv/vibecoding push origin main`

## Recovering Context From Previous Conversations
- To find what was actually done before, use git history:
  1. `git -C omni log --oneline -20` to find relevant commits
  2. `git -C omni show <commit>:<path>` to see the exact file at that commit
  3. `git -C omni diff <commit1> <commit2> -- <path>` to see what changed
- NEVER trust a conversation summary's description of values or parameters. Always verify from git.
- The committed code IS the source of truth.

## General
- Do NOT make changes unless explicitly told to.
- Verify file state before making edits.
- When the user says "do nothing else", do EXACTLY AND ONLY what was asked.
- The git root is `/Users/grittv/vibecoding`, NOT the `omni` directory.
