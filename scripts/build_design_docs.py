import os, sys, re

base_dir = r"C:\Users\aminj\Downloads\skills\.agents\skills"
output_local = r"c:\Users\aminj\Downloads\SAAS 7\docs\LOCAL_DESIGN_SYSTEM.md"
output_conflicts = r"c:\Users\aminj\Downloads\SAAS 7\docs\DESIGN_CONFLICTS.md"
output_build_state = r"c:\Users\aminj\Downloads\SAAS 7\docs\BUILD_STATE.md"

md_files = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith(".md"):
            md_files.append(os.path.join(root, f))
md_files.sort()

categories = {}
for p in md_files:
    rel = os.path.relpath(p, base_dir).replace('\\', '/')
    cat = rel.split('/')[0]
    with open(p, 'r', encoding='utf-8', errors='replace') as fh:
        content = fh.read()
    categories.setdefault(cat, []).append((rel, p, content))

print(f"Loaded {len(md_files)} files across {len(categories)} categories.")
