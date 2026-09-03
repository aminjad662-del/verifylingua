import os

base_dir = r"C:\Users\aminj\Downloads\skills\.agents\skills"

md_files = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith(".md"):
            md_files.append(os.path.join(root, f))

md_files.sort()
print(f"Total markdown files found: {len(md_files)}")

skills = {}
file_contents = {}

for path in md_files:
    rel = os.path.relpath(path, base_dir)
    top_dir = rel.split(os.sep)[0]
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()
            file_contents[rel] = content
            skills.setdefault(top_dir, []).append((rel, content))
    except Exception as e:
        print(f"Error reading {rel}: {e}")

print(f"Successfully read {len(file_contents)} files across {len(skills)} skill categories.")
for k, v in sorted(skills.items()):
    total_lines = sum(len(c.splitlines()) for _, c in v)
    print(f"  - {k} ({len(v)} files, {total_lines} lines)")
