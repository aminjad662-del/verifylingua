# -*- coding: utf-8 -*-
import os, sys

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

lines_per_file = {}
for p in md_files:
    rel = os.path.relpath(p, base_dir).replace('\\', '/')
    with open(p, 'r', encoding='utf-8', errors='replace') as fh:
        text = fh.read()
    lines_per_file[rel] = len(text.splitlines())

print(f"Total files: {len(md_files)}, Total lines analyzed: {sum(lines_per_file.values())}")
