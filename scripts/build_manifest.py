import os

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

# Build manifest string
manifest_lines = []
for i, f in enumerate(md_files, 1):
    rel = os.path.relpath(f, base_dir).replace('\\', '/')
    manifest_lines.append(f"{i}. {rel} (at {f})")
manifest_str = "\n".join(manifest_lines)

print(f"Manifest created with {len(md_files)} files.")
