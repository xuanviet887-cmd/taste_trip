import os
import re
import unicodedata

def normalize_name(name):
    # Remove diacritics
    nfkd_form = unicodedata.normalize('NFKD', name)
    only_ascii = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    # Lowercase, replace spaces with hyphens, remove special chars except dot and extension
    name_lower = only_ascii.lower()
    name_clean = re.sub(r'[^a-z0-9\.]', '-', name_lower)
    name_clean = re.sub(r'-+', '-', name_clean).strip('-')
    return name_clean

provinces_dir = "public/picture/provinces"
if not os.path.exists(provinces_dir):
    # If it was still 'các tỉnh'
    old_dir = "public/picture/các tỉnh"
    if os.path.exists(old_dir):
        os.rename(old_dir, provinces_dir)

filename_map = {}
if os.path.exists(provinces_dir):
    for filename in os.listdir(provinces_dir):
        old_path = os.path.join(provinces_dir, filename)
        if os.path.isfile(old_path):
            new_filename = normalize_name(filename)
            new_path = os.path.join(provinces_dir, new_filename)
            os.rename(old_path, new_path)
            filename_map[filename] = new_filename
            print(f"Renamed: {filename} -> {new_filename}")

# Also rename background
bg_old = "public/picture/download (1).png"
bg_new = "public/picture/background.png"
if os.path.exists(bg_old):
    os.rename(bg_old, bg_new)
    print("Renamed background to background.png")

# Now update App.tsx references from /picture/các tỉnh/... to /picture/provinces/... and normalized filenames
app_tsx_path = "src/App.tsx"
with open(app_tsx_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace folder path first
content = content.replace("/picture/các tỉnh/", "/picture/provinces/")

for old_fn, new_fn in filename_map.items():
    content = content.replace(old_fn, new_fn)

with open(app_tsx_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Update index.css background
css_path = "src/index.css"
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

css_content = css_content.replace("url('/picture/download (1).png')", "url('/picture/background.png')")
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Normalization and code update complete!")
