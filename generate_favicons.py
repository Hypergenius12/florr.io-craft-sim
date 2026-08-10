import os
import random
import urllib.request
import re

# Rarity IDs
rarities = ["1", "2", "3", "4", "5", "6", "7", "8"]

# Fetch random petal IDs from KNOWN_PETALS in script.js
with open("script.js", "r") as f:
    script_content = f.read()

# Extract known petals dictionary
match = re.search(r'const KNOWN_PETALS = \{([^}]+)\};', script_content)
petal_ids = []
if match:
    lines = match.group(1).split(",")
    for line in lines:
        if ":" in line:
            petal_ids.append(line.split(":")[1].strip())
else:
    print("Could not find KNOWN_PETALS")
    exit(1)

os.makedirs("favicons", exist_ok=True)

for i in range(1, 21):
    r_id = random.choice(rarities)
    p_id = random.choice(petal_ids)
    
    # Download background
    try:
        bg_req = urllib.request.Request(f"https://florr.io/petals/0_{r_id}.svg", headers={'User-Agent': 'Mozilla/5.0'})
        bg_svg = urllib.request.urlopen(bg_req).read().decode('utf-8')
        
        # Download petal
        p_req = urllib.request.Request(f"https://florr.io/petals/{p_id}.svg", headers={'User-Agent': 'Mozilla/5.0'})
        p_svg = urllib.request.urlopen(p_req).read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {r_id} or {p_id}: {e}")
        continue
        
    # Strip <svg ...> wrapper from inner SVGs
    bg_inner = re.sub(r'</?svg[^>]*>', '', bg_svg)
    p_inner = re.sub(r'</?svg[^>]*>', '', p_svg)
    
    # Composite
    composite = f'''<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g>{bg_inner}</g>
    <g>{p_inner}</g>
</svg>'''

    with open(f"favicons/favicon_{i}.svg", "w") as f:
        f.write(composite)

print("Generated 20 favicons")
