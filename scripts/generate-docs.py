import os, sys

base_dir = r"C:\Users\aminj\Downloads\skills\.agents\skills"
output_local = r"c:\Users\aminj\Downloads\SAAS 7\docs\LOCAL_DESIGN_SYSTEM.md"
output_conflicts = r"c:\Users\aminj\Downloads\SAAS 7\docs\DESIGN_CONFLICTS.md"

md_files = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith(".md"):
            md_files.append(os.path.join(root, f))
md_files.sort()

print(f"Loaded {len(md_files)} markdown files.")
