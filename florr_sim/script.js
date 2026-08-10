const RARITIES = {
    'common': { id: 0, color: '#7eef6d', next: 'unusual', chance: 0.64 },
    'unusual': { id: 1, color: '#ffe65d', next: 'rare', chance: 0.32 },
    'rare': { id: 2, color: '#4d52e3', next: 'epic', chance: 0.16 },
    'epic': { id: 3, color: '#861fde', next: 'legendary', chance: 0.08 },
    'legendary': { id: 4, color: '#de1f1f', next: 'mythic', chance: 0.04 },
    'mythic': { id: 5, color: '#1fdbde', next: 'ultra', chance: 0.02 },
    'ultra': { id: 6, color: '#ff2b75', next: 'super', chance: 0.01 },
    'super': { id: 7, color: '#2bffa3', next: 'eternal', chance: 0.001 },
    'eternal': { id: 8, color: '#ffffff', next: null, chance: 0 },
    'unique': { id: 9, color: '#aaaaaa', next: null, chance: 0 }
};

const KNOWN_PETALS = {
    "basic": 1,
    "light": 2,
    "rock": 3,
    "square": 4,
    "rose": 5,
    "stinger": 6,
    "iris": 7,
    "wing": 8,
    "missile": 9,
    "grapes": 10,
    "cactus": 11,
    "faster": 12,
    "bubble": 13,
    "pollen": 14,
    "dandelion": 15,
    "beetle_egg": 16,
    "antennae": 17,
    "heavy": 18,
    "yin_yang": 19,
    "web": 20,
    "honey": 21,
    "leaf": 22,
    "salt": 23,
    "rice": 24,
    "corn": 25,
    "sand": 26,
    "pincer": 27,
    "yucca": 28,
    "magnet": 29,
    "yggdrasil": 30,
    "starfish": 31,
    "pearl": 32,
    "lightning": 33,
    "jelly": 34,
    "claw": 35,
    "shell": 36,
    "cutter": 37,
    "dahlia": 38,
    "uranium": 39,
    "sponge": 40,
    "soil": 41,
    "fang": 42,
    "third_eye": 43,
    "peas": 44,
    "stick": 45,
    "clover": 46,
    "powder": 47,
    "air": 48,
    "basil": 49,
    "orange": 50,
    "ant_egg": 51,
    "poo": 52,
    "relic": 53,
    "lotus": 54,
    "bulb": 55,
    "cotton": 56,
    "carrot": 57,
    "bone": 58,
    "plank": 59,
    "tomato": 60,
    "mark": 61,
    "rubber": 62,
    "blood_stinger": 63,
    "bur": 64,
    "root": 65,
    "ankh": 66,
    "dice": 67,
    "talisman": 68,
    "battery": 69,
    "amulet": 70,
    "compass": 71,
    "disc": 72,
    "shovel": 73,
    "coin": 74,
    "chip": 75,
    "card": 76,
    "moon": 77,
    "privet": 78,
    "glass": 79,
    "corruption": 80,
    "orb": 81,
    "blueberries": 82,
    "magic_cotton": 83,
    "magic_stinger": 84,
    "magic_leaf": 85,
    "magic_cactus": 86,
    "magic_eye": 87,
    "magic_missile": 88,
    "magic_stick": 89,
    "coral": 90,
    "magic_bubble": 91,
    "nazar": 92,
    "mimic": 93,
    "mjolnir": 94,
    "mecha_missile": 95,
    "wax": 96,
    "golden_leaf": 97,
    "cog": 98,
    "monstera": 99,
    "mecha_antennae": 100,
    "laser": 101,
    "domino": 102,
    "bandage": 103,
    "pharaoh_crown": 104,
    "totem": 105,
    "triangle": 106,
    "electric_web": 107,
    "sacrifice": 108,
    "sawblade": 109,
    "clay": 110,
    "dust": 111,
    "broccoli": 112,
    "lentil": 113,
    "dead_leaf": 114,
    "splitter": 115,
    "goggles": 116,
    "bean": 117,
    "champion_crown": 118,
};

function getPetalId(name) {
    const lower = name.toLowerCase().trim();
    if (lower === "ygg") return KNOWN_PETALS["yggdrasil"];
    if (KNOWN_PETALS[lower]) return KNOWN_PETALS[lower];
    return null;
}

let inventory = []; // { rarity, id, name, count }
let craftingSlots = [null, null, null, null, null]; // { itemRef, count }
let currentMode = 'craft';
let forgeCosts = {};

function initForgeCosts() {
    const saved = localStorage.getItem('florr_forge_costs');
    if (saved) {
        try { forgeCosts = JSON.parse(saved); } catch(e) { forgeCosts = {}; }
    }
    for (const petal in KNOWN_PETALS) {
        if (!forgeCosts[petal]) forgeCosts[petal] = 5;
    }
}
initForgeCosts();

const modeToggleBtn = document.getElementById('mode-toggle');
const topBarTitle = document.getElementById('top-bar-title');

function updateModeUI() {
    if (currentMode === 'craft') {
        document.body.classList.remove('forge-mode');
        topBarTitle.innerText = 'Craft';
        modeToggleBtn.querySelector('.bg-img').src = 'https://florr.io/mobs/0_9.svg'; // Titan bg
        modeToggleBtn.querySelector('.petal-img').src = 'titan.png'; // Titan face
        btnCraft.innerText = 'Craft';
    } else {
        document.body.classList.add('forge-mode');
        topBarTitle.innerText = 'Forge';
        modeToggleBtn.querySelector('.bg-img').src = 'https://florr.io/mobs/0_0.svg'; // Trader bg
        modeToggleBtn.querySelector('.petal-img').src = 'trader.png'; // Trader face
        btnCraft.innerText = 'Forge';
    }
    // Return all items from slots back to inventory
    for (let i = 0; i < 5; i++) {
        if (craftingSlots[i]) {
            let slot = craftingSlots[i];
            let existing = inventory.find(x => x.rarity === slot.itemRef.rarity && x.id === slot.itemRef.id);
            if (existing) existing.count += slot.count;
            else inventory.push({ rarity: slot.itemRef.rarity, id: slot.itemRef.id, name: slot.itemRef.name, count: slot.count });
            craftingSlots[i] = null;
        }
    }
    renderCrafting();
    renderInventory();
}

modeToggleBtn.onclick = () => {
    currentMode = currentMode === 'craft' ? 'forge' : 'craft';
    updateModeUI();
};

function loadInventory() {
    const saved = localStorage.getItem('florr_inventory');
    if (saved) {
        try {
            inventory = JSON.parse(saved);
        } catch (e) {
            inventory = [];
        }
    }
}
loadInventory();

function saveInventory() {
    // Save inventory + whatever is in crafting slots so they aren't lost on reload
    let tempInventory = JSON.parse(JSON.stringify(inventory));
    craftingSlots.forEach(slot => {
        if (slot) {
            let item = tempInventory.find(i => i.id === slot.itemRef.id && i.rarity === slot.itemRef.rarity);
            if (item) {
                item.count += slot.count;
            } else {
                tempInventory.push({ ...slot.itemRef, count: slot.count });
            }
        }
    });
    localStorage.setItem('florr_inventory', JSON.stringify(tempInventory));
}

const uiLog = document.getElementById('console-log');
const uiInput = document.getElementById('console-input');
const uiInventory = document.getElementById('inventory-grid');
const uiSlots = document.querySelectorAll('.pentagon-slot');
const btnCraft = document.getElementById('craft-btn');
const uiChance = document.getElementById('craft-chance');
const uiCenter = document.getElementById('craft-center');
const pentagonContainer = document.getElementById('pentagon-container');

let persistentLogs = [];

function log(msg, color="#fff", persist=false) {
    const el = document.createElement('div');
    el.innerText = msg;
    el.style.color = color;
    uiLog.appendChild(el);
    uiLog.scrollTop = uiLog.scrollHeight;
    
    if (persist) {
        persistentLogs.push(el);
    } else {
        // Remove after 10 seconds
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 1000); // Wait for fade out
        }, 10000);
    }
}

function clearPersistentLogs() {
    persistentLogs.forEach(el => el.remove());
    persistentLogs = [];
}

function clearCraftingSlots() {
    for (let i = 0; i < 5; i++) {
        if (craftingSlots[i]) {
            const item = craftingSlots[i].itemRef;
            addInventory(item.rarity, item.id, item.name, craftingSlots[i].count);
            craftingSlots[i] = null;
        }
    }
    renderCrafting();
    renderInventory();
}

uiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = uiInput.value.trim();
        uiInput.value = '';
        if (val) processCommand(val);
    }
});

function parseRarities(rStr) {
    const order = ['common', 'unusual', 'rare', 'epic', 'legendary', 'mythic', 'ultra', 'super', 'eternal', 'unique'];
    
    let match = rStr.match(/^([^\[]+)\[([^\]]+)\]$/);
    let baseStr = rStr;
    let excludes = [];
    if (match) {
        baseStr = match[1];
        excludes = match[2].split(',');
    }
    
    let result = new Set();
    if (baseStr === 'all') {
        order.forEach(r => result.add(r));
    } else {
        let tokens = baseStr.split(',');
        for (let t of tokens) {
            if (t.includes('-')) {
                let [start, end] = t.split('-');
                let sIdx = order.indexOf(start);
                let eIdx = order.indexOf(end);
                if (sIdx !== -1 && eIdx !== -1) {
                    let min = Math.min(sIdx, eIdx);
                    let max = Math.max(sIdx, eIdx);
                    for (let i = min; i <= max; i++) result.add(order[i]);
                } else return null;
            } else {
                if (order.includes(t)) result.add(t);
                else return null;
            }
        }
    }
    
    for (let ex of excludes) {
        result.delete(ex);
    }
    
    let finalOrder = order.filter(r => result.has(r));
    return finalOrder.length > 0 ? finalOrder : null;
}

function processCommand(rawCmd) {
    clearPersistentLogs();
    
    // Custom processing to handle spaces safely inside brackets and remove spaces around commas
    let cmd = rawCmd.toLowerCase().replace(/\s*,\s*/g, ',');
    const parts = cmd.trim().split(/\s+/);
    
    if (parts[0] === 'clear') {
        if (parts.length < 2) {
            log("Format: clear <all|rarity|petal>", "#f44");
            return;
        }
        let target = parts.slice(1).join(' ');
        target = target === 'ygg' ? 'yggdrasil' : target;
        
        let clearedCount = 0;
        let clearAll = false;
        
        if (target === 'all') {
            inventory.length = 0;
            for (let i = 0; i < 5; i++) craftingSlots[i] = null;
            clearAll = true;
        } else {
            const targetRarities = parseRarities(target);
            if (targetRarities) {
                // It's a rarity filter (e.g. 'mythic', 'common,rare', 'unusual-epic')
                for (let i = inventory.length - 1; i >= 0; i--) {
                    if (targetRarities.includes(inventory[i].rarity)) {
                        inventory.splice(i, 1);
                        clearedCount++;
                    }
                }
                for (let i = 0; i < 5; i++) {
                    if (craftingSlots[i] && targetRarities.includes(craftingSlots[i].rarity)) craftingSlots[i] = null;
                }
            } else {
                // Must be a petal name
                const targetNames = target.split(',').map(s => s.trim().toLowerCase());
                let foundIds = [];
                for (let tName of targetNames) {
                    const normalized = tName.replace(/\s+/g, '_');
                    const pid = getPetalId(normalized);
                    if (pid) foundIds.push(pid);
                }
                
                if (foundIds.length === 0) {
                    log(`Unknown rarity or petal: ${target}`, "#f44");
                    return;
                }
                
                for (let i = inventory.length - 1; i >= 0; i--) {
                    if (foundIds.includes(inventory[i].id)) {
                        inventory.splice(i, 1);
                        clearedCount++;
                    }
                }
                for (let i = 0; i < 5; i++) {
                    if (craftingSlots[i] && foundIds.includes(craftingSlots[i].id)) craftingSlots[i] = null;
                }
            }
        }
        
        renderCrafting();
        renderInventory();
        log(clearAll ? "Inventory cleared." : `Cleared ${clearedCount} item stacks.`, "#7eef6d");
        return;
    }

    if (parts[0] === 'help') {
        log("=== Commands Help ===", "#7eef6d", true);
        log("Modifiers: ',' (and), '-' (through), '[...]' (exclude)", "#aaa", true);
        log("Targets: 'all', 'owned', or specific names", "#aaa", true);
        log(" ", "#fff", true);
        log("1. Spawn: <rarity> <target> [amount|range]", "#fff", true);
        log("   > unusual-mythic all 10-20", "#ccc", true);
        log("   > all[rare] stinger,glass 50", "#ccc", true);
        log("   > super all[iris, faster] 5", "#ccc", true);
        log("2. Craft: craft <rarity> <target>", "#fff", true);
        log("   > craft common,rare all", "#ccc", true);
        log("   > craft epic-ultra owned[stinger]", "#ccc", true);
        log("3. Forge: forge <target>", "#fff", true);
        log("   > forge all", "#ccc", true);
        log("   > forge all[clover]", "#ccc", true);
        log("4. Clear: clear <rarity|target>", "#fff", true);
        log("   > clear mythic-super", "#ccc", true);
        return;
    }

    if (parts[0] === 'craft' || parts[0] === 'forge') {
        let action = parts[0];
        let rarityFilterStr, nameFilter;
        
        if (action === 'forge') {
            if (parts.length < 2) {
                log(`Format: forge <name|all>`, "#f44");
                return;
            }
            rarityFilterStr = 'super';
            nameFilter = parts.slice(1).join(' ');
        } else {
            if (parts.length < 3) {
                log(`Format: craft <rarities> <name|all>`, "#f44");
                return;
            }
            rarityFilterStr = parts[1];
            nameFilter = parts.slice(2).join(' ');
        }
        
        const targetRarities = parseRarities(rarityFilterStr);
        if (!targetRarities) return log(`Unknown rarity format: ${rarityFilterStr}`, "#f44");
        
        let matchNameExclude = nameFilter.match(/^([^\[]+)\[([^\]]+)\]$/);
        let baseNameStr = nameFilter;
        let nameExcludes = [];
        if (matchNameExclude) {
            baseNameStr = matchNameExclude[1];
            nameExcludes = matchNameExclude[2].split(',').map(s => s.replace(/\s+/g, '_'));
        }
        
        const targetNames = baseNameStr.split(',').map(s => s.trim().toLowerCase());
        
        let totalSuccesses = 0;
        let totalFails = 0;
        
        for (let r of targetRarities) {
            if (action === 'forge' && r !== 'super') continue;
            
            let itemsToProcess = [];
            for (let i = 0; i < inventory.length; i++) {
                let item = inventory[i];
                if (item.rarity !== r || item.count <= 0) continue;
                
                let matchName = false;
                if (targetNames.includes('all') || targetNames.includes('owned')) matchName = true;
                else if (targetNames.includes(item.name)) matchName = true;
                else if (targetNames.includes('ygg') && item.name === 'yggdrasil') matchName = true;
                
                for (let tName of targetNames) {
                    if (tName.replace(/\s+/g, '_') === item.name) {
                        matchName = true;
                        break;
                    }
                }
                
                if (matchName) {
                    if (nameExcludes.includes(item.name) || (nameExcludes.includes('ygg') && item.name === 'yggdrasil')) {
                        continue;
                    }
                    itemsToProcess.push(item);
                }
            }
            
            for (const item of itemsToProcess) {
                if (action === 'craft') {
                    if (item.count < 5) continue;
                    const rData = RARITIES[item.rarity];
                    if (!rData || !rData.next) continue;
                    
                    let chance = (item.name.toLowerCase() === 'square') ? 1.0 : rData.chance;
                    let result = simulateCraftingBulk(item.count, chance);
                    
                    totalSuccesses += result.successes;
                    totalFails += result.failures;
                    
                    item.count = result.remaining;
                    if (result.successes > 0) {
                        addInventory(rData.next, item.id, item.name, result.successes);
                    }
                } else if (action === 'forge') {
                    if (item.rarity !== 'super') continue;
                    let req = forgeCosts[item.name] || 5;
                    let forgesDone = 0;
                    
                    while (item.count >= req) {
                        item.count -= req;
                        forgesDone++;
                        req++;
                    }
                    
                    forgeCosts[item.name] = req;
                    if (forgesDone > 0) {
                        totalSuccesses += forgesDone;
                        addInventory('unique', item.id, item.name, forgesDone);
                    }
                }
            }
        }
        
        localStorage.setItem('florr_forge_costs', JSON.stringify(forgeCosts));
        
        if (totalSuccesses === 0 && totalFails === 0) {
            log(`Nothing to ${action}.`, "#aaa");
        } else if (action === 'craft') {
            log(`Batch craft complete: ${totalSuccesses} success, ${totalFails} fails.`, "#7eef6d");
        } else {
            log(`Batch forge complete: Created ${totalSuccesses} unique(s).`, "#7eef6d");
        }
        
        renderInventory();
        renderCrafting();
        return;
    }
    
    if (parts.length < 2) return log("Format: <rarity> <name> [amount]", "#f44");

    const rarities = parseRarities(parts[0]);
    if (!rarities) return log(`Unknown rarity format: ${parts[0]}`, "#f44");

    let amountStr = '1';
    let nameParts = [];
    for (let i = 1; i < parts.length; i++) {
        if (i === parts.length - 1 && (!isNaN(parts[i]) || parts[i].match(/^\d+-\d+$/))) {
            amountStr = parts[i];
        } else {
            nameParts.push(parts[i]);
        }
    }
    
    const getAmount = () => {
        if (!isNaN(amountStr)) return Number(amountStr);
        let [min, max] = amountStr.split('-');
        min = Number(min);
        max = Number(max);
        if (min > max) { let t = min; min = max; max = t; }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    const nameStr = nameParts.join(' ');
    if (!nameStr) return log("Please provide a petal name, 'all', or 'owned'.", "#f44");

    let matchNameExclude = nameStr.match(/^([^\[]+)\[([^\]]+)\]$/);
    let baseNameStr = nameStr;
    let nameExcludes = [];
    if (matchNameExclude) {
        baseNameStr = matchNameExclude[1];
        nameExcludes = matchNameExclude[2].split(',').map(s => s.replace(/\s+/g, '_'));
    }

    const targetNames = baseNameStr.split(',').map(s => s.trim().toLowerCase());

    if (targetNames.includes('owned')) {
        let count = 0;
        inventory.forEach(item => {
            if (item.count > 0 && rarities.includes(item.rarity)) {
                if (nameExcludes.includes(item.name) || (nameExcludes.includes('ygg') && item.name === 'yggdrasil')) return;
                
                addInventory(item.rarity, item.id, item.name, getAmount());
                count++;
            }
        });
        if (count === 0) return log("No owned petals match criteria.", "#aaa");
        log(`Spawned ${amountStr} for ${count} owned petals.`, "#7eef6d");
    } else if (targetNames.includes('all')) {
        const seenIds = new Set();
        for (const [name, id] of Object.entries(KNOWN_PETALS)) {
            if (!seenIds.has(id)) {
                if (nameExcludes.includes(name) || (nameExcludes.includes('ygg') && name === 'yggdrasil')) {
                    // skipped
                } else {
                    rarities.forEach(r => addInventory(r, id, name, getAmount()));
                    seenIds.add(id);
                }
            }
        }
        log(`Spawned ${amountStr} of all petals for ${rarities.length} rarities.`, "#7eef6d");
    } else {
        let spawnedCount = 0;
        targetNames.forEach(tName => {
            const normalizedName = tName === "ygg" ? "yggdrasil" : tName;
            const petalId = getPetalId(normalizedName);
            if (petalId) {
                const storedName = normalizedName.replace(/\s+/g, '_');
                if (nameExcludes.includes(storedName) || (nameExcludes.includes('ygg') && storedName === 'yggdrasil')) return;
                
                rarities.forEach(r => addInventory(r, petalId, storedName, getAmount()));
                spawnedCount++;
            } else {
                log(`Unknown petal: ${tName}`, "#f44");
            }
        });
        if (spawnedCount > 0) {
            log(`Spawned ${amountStr} for ${spawnedCount} petal types in ${rarities.length} rarities.`, "#7eef6d");
        }
    }

    renderInventory();
    renderCrafting();
}

function addInventory(rarity, id, name, amount, skipRender = false) {
    let existing = inventory.find(i => i.rarity === rarity && i.id === id);
    if (existing) existing.count += amount;
    else inventory.push({ rarity, id, name, count: amount });
    if (!skipRender) renderInventory();
}

function renderInventory() {
    if (uiInventory.children.length === 0) {
        // Initialize DOM structure once
        const sortedKeys = Object.keys(KNOWN_PETALS).sort((a, b) => a.localeCompare(b));
        const allIds = Array.from(new Set(sortedKeys.map(k => KNOWN_PETALS[k])));
        allIds.forEach(id => {
            const raritiesArr = Object.keys(RARITIES).map(k => ({ name: k, ...RARITIES[k] })).sort((a, b) => a.id - b.id);
            raritiesArr.forEach(rData => {
                const el = document.createElement('div');
                el.className = 'slot';
                el.dataset.id = id;
                el.dataset.rarity = rData.name;
                uiInventory.appendChild(el);
            });
        });
    }

    let totalCounts = {};
    for (const item of inventory) {
        totalCounts[`${item.rarity}_${item.id}`] = item.count;
    }
    for (const slot of craftingSlots) {
        if (slot) {
            totalCounts[`${slot.itemRef.rarity}_${slot.itemRef.id}`] = (totalCounts[`${slot.itemRef.rarity}_${slot.itemRef.id}`] || 0) + slot.count;
        }
    }

    // Update existing DOM elements
    Array.from(uiInventory.children).forEach(el => {
        const id = parseInt(el.dataset.id);
        const rarityName = el.dataset.rarity;
        const item = inventory.find(i => i.id === id && i.rarity === rarityName);
        const rData = RARITIES[rarityName];
        const petalName = Object.keys(KNOWN_PETALS).find(k => KNOWN_PETALS[k] === id);
        
        let totalOwned = totalCounts[`${rarityName}_${id}`] || 0;
        
        // Hide non-super rarities in forge mode
        if (currentMode === 'forge' && rarityName !== 'super') {
            el.style.display = 'none';
        } else {
            el.style.display = '';
        }
        
        if (item && item.count > 0) {
            if (!el.classList.contains('filled')) {
                el.className = 'slot filled';
                el.innerHTML = '';
                
                const bgImg = document.createElement('img');
                bgImg.className = 'bg-img';
                bgImg.src = `https://florr.io/petals/0_${rData.id}.svg`;
                
                const img = document.createElement('img');
                img.className = 'petal-img';
                img.src = `https://florr.io/petals/${id}_${rData.id}.svg`;
                img.onerror = function() { 
                    this.onerror = function() {
                        this.onerror = null;
                        this.src = `https://florr.io/petals/1.svg`;
                    };
                    this.src = `https://florr.io/petals/${id}.svg`; 
                };
                
                const countDiv = document.createElement('div');
                countDiv.className = 'count';
                
                el.appendChild(bgImg);
                el.appendChild(img);
                el.appendChild(countDiv);
                
                el.onclick = (e) => {
                    const currentItem = inventory.find(i => i.id === id && i.rarity === rarityName);
                    if (!currentItem || currentItem.count <= 0) return;
                    let baseItem = craftingSlots.find(x => x !== null);
                    if (baseItem && (baseItem.itemRef.name !== currentItem.name || baseItem.itemRef.rarity !== currentItem.rarity)) {
                        clearCraftingSlots();
                    }
                    if (e.shiftKey) moveAllToCrafting(currentItem);
                    else if (e.ctrlKey || e.metaKey) moveMultipleToCrafting(currentItem, 5);
                    else moveOneToCrafting(currentItem);
                };
            }
            
            const countDiv = el.querySelector('.count');
            if (currentMode === 'forge') {
                let req = forgeCosts[petalName];
                countDiv.innerText = `${formatNumber(item.count)}/${formatNumber(req)}`;
                if (totalOwned < req) el.classList.add('disabled');
                else el.classList.remove('disabled');
            } else {
                countDiv.innerText = `x${formatNumber(item.count)}`;
                if (totalOwned < 5) el.classList.add('disabled');
                else el.classList.remove('disabled');
            }
            
        } else {
            if (el.classList.contains('filled')) {
                el.className = 'slot';
                el.innerHTML = '';
                el.onclick = null;
            }
        }
    });
    
    saveInventory();
}

function validateCraftingType(item) {
    const existing = craftingSlots.find(s => s !== null);
    if (existing && (existing.itemRef.id !== item.id || existing.itemRef.rarity !== item.rarity)) {
        return false;
    }
    return true;
}

function moveOneToCrafting(item) {
    if (item.count <= 0) return;
    if (!validateCraftingType(item)) return log("Crafting slots must contain the same petal!", "#f44");

    let targetIndex = 0;
    let minCount = Infinity;
    for (let i = 0; i < 5; i++) {
        if (!craftingSlots[i]) {
            targetIndex = i;
            break;
        } else if (craftingSlots[i].count < minCount) {
            minCount = craftingSlots[i].count;
            targetIndex = i;
        }
    }

    item.count--;
    if (!craftingSlots[targetIndex]) craftingSlots[targetIndex] = { itemRef: item, count: 1 };
    else craftingSlots[targetIndex].count++;
    
    renderInventory();
    renderCrafting();
}

function moveMultipleToCrafting(item, amount) {
    if (item.count <= 0) return;
    if (!validateCraftingType(item)) return log("Crafting slots must contain the same petal!", "#f44");

    let toMove = Math.min(item.count, amount);
    for (let i = 0; i < toMove; i++) {
        let targetIndex = 0;
        let minCount = Infinity;
        for (let j = 0; j < 5; j++) {
            if (!craftingSlots[j]) {
                targetIndex = j;
                break;
            } else if (craftingSlots[j].count < minCount) {
                minCount = craftingSlots[j].count;
                targetIndex = j;
            }
        }
        item.count--;
        if (!craftingSlots[targetIndex]) craftingSlots[targetIndex] = { itemRef: item, count: 1 };
        else craftingSlots[targetIndex].count++;
    }
    
    renderInventory();
    renderCrafting();
}

function moveAllToCrafting(item) {
    if (item.count <= 0) return;
    if (!validateCraftingType(item)) return log("Crafting slots must contain the same petal!", "#f44");

    const totalToMove = item.count;
    item.count = 0;
    
    let base = Math.floor(totalToMove / 5);
    let remainder = totalToMove % 5;
    
    for (let i = 0; i < 5; i++) {
        let add = base + (i < remainder ? 1 : 0);
        if (add > 0) {
            if (!craftingSlots[i]) craftingSlots[i] = { itemRef: item, count: add };
            else craftingSlots[i].count += add;
        }
    }
    
    renderInventory();
    renderCrafting();
}

function removeFromCrafting(index, shiftKey) {
    const slot = craftingSlots[index];
    if (!slot) return;

    if (shiftKey) {
        slot.itemRef.count += slot.count;
        craftingSlots[index] = null;
    } else {
        slot.itemRef.count++;
        slot.count--;
        if (slot.count <= 0) craftingSlots[index] = null;
    }
    renderInventory();
    renderCrafting();
}

function renderCrafting() {
    uiCenter.innerHTML = '';
    uiCenter.className = 'craft-center-effect';
    uiCenter.style.backgroundColor = 'transparent';
    let filledCount = 0;
    let minSets = Infinity;
    let baseItem = null;

    craftingSlots.forEach((slot, index) => {
        const slotEl = uiSlots[index];
        slotEl.innerHTML = '';
        
        if (slot) {
            filledCount++;
            baseItem = slot.itemRef;
            if (slot.count < minSets) minSets = slot.count;
            
            const rData = RARITIES[slot.itemRef.rarity];
            slotEl.className = 'slot pentagon-slot filled';
            
            const bgImg = document.createElement('img');
            bgImg.className = 'bg-img';
            bgImg.src = `https://florr.io/petals/0_${rData.id}.svg`;
            
            const img = document.createElement('img');
            img.className = 'petal-img';
            img.src = `https://florr.io/petals/${slot.itemRef.id}_${rData.id}.svg`;
            img.onerror = function() { 
                this.onerror = function() {
                    this.onerror = null;
                    this.src = `https://florr.io/petals/1.svg`;
                };
                this.src = `https://florr.io/petals/${slot.itemRef.id}.svg`; 
            };
            
            const count = document.createElement('div');
            count.className = 'count';
            count.innerText = `x${slot.count}`;
            
            slotEl.appendChild(bgImg);
            slotEl.appendChild(img);
            slotEl.appendChild(count);
        } else {
            slotEl.className = 'slot pentagon-slot';
            
            minSets = 0;
        }
        
        slotEl.onclick = (e) => removeFromCrafting(index, e.shiftKey);
    });

    if (currentMode === 'forge') {
        if (baseItem) {
            let req = forgeCosts[baseItem.name];
            let totalInSlots = 0;
            craftingSlots.forEach(s => { if (s && s.itemRef.name === baseItem.name) totalInSlots += s.count; });
            
            btnCraft.style.setProperty('--color-craft-btn', RARITIES['unique'].color);
            btnCraft.style.setProperty('--color-craft-btn-border', darkenHex(RARITIES['unique'].color, 25));
            
            if (totalInSlots >= req) {
                btnCraft.disabled = false;
                uiChance.innerText = `100% success chance`;
            } else {
                btnCraft.disabled = true;
                uiChance.innerText = `Need ${formatNumber(req)} Super petals`;
            }
        } else {
            btnCraft.disabled = true;
            uiChance.innerText = `0% success chance`;
            btnCraft.style.setProperty('--color-craft-btn', '#5ce0d3');
            btnCraft.style.setProperty('--color-craft-btn-border', '#44a89e');
        }
        saveInventory();
        return;
    }

    if (filledCount === 5 && minSets > 0) {
        const rData = RARITIES[baseItem.rarity];
        const nextRarity = rData.next ? RARITIES[rData.next] : rData;
        btnCraft.style.setProperty('--color-craft-btn', nextRarity.color);
        btnCraft.style.setProperty('--color-craft-btn-border', darkenHex(nextRarity.color, 25));
        if (!rData.next) {
            btnCraft.disabled = true;
            uiChance.innerText = `Max tier reached`;
        } else {
            btnCraft.disabled = false;
            let chance = (baseItem.name.toLowerCase() === 'square') ? 1.0 : rData.chance;
            let percent = chance * 100;
            let displayPercent = percent < 1 && percent > 0 ? percent.toFixed(1) : Math.round(percent);
            uiChance.innerText = `${displayPercent}% success chance`;
        }
    } else {
        if (baseItem) {
            const rData = RARITIES[baseItem.rarity];
            const nextRarity = rData.next ? RARITIES[rData.next] : rData;
            btnCraft.style.setProperty('--color-craft-btn', nextRarity.color);
            btnCraft.style.setProperty('--color-craft-btn-border', darkenHex(nextRarity.color, 25));
        } else {
            btnCraft.style.setProperty('--color-craft-btn', '#5ce0d3');
            btnCraft.style.setProperty('--color-craft-btn-border', '#44a89e');
        }
        btnCraft.disabled = true;
        uiChance.innerText = `0% success chance`;
    }
    
    saveInventory();
}

function simulateCraftingBulk(total, chance) {
    if (total < 1000) {
        let successes = 0;
        let failures = 0;
        let remaining = total;
        while (remaining >= 5) {
            if (Math.random() <= chance) {
                remaining -= 5;
                successes++;
            } else {
                let destroyed = Math.floor(Math.random() * 4) + 1;
                remaining -= destroyed;
                failures++;
            }
        }
        return { successes, failures, remaining };
    } else {
        let p = chance;
        let E_cost = 5 * p + 2.5 * (1 - p);
        let expectedAttempts = total / E_cost;
        let E_X2 = 25 * p + 7.5 * (1 - p);
        let Var_X = E_X2 - (E_cost * E_cost);
        
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        let z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        
        let attemptsVar = (total * Var_X) / Math.pow(E_cost, 3);
        let attempts = Math.floor(expectedAttempts + z1 * Math.sqrt(attemptsVar));
        
        let z2 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
        let successes = Math.floor(attempts * p + z2 * Math.sqrt(attempts * p * (1 - p)));
        let failures = Math.max(0, attempts - successes);
        
        return { successes, failures, remaining: Math.floor(Math.random() * 5) };
    }
}

btnCraft.onclick = () => {
    if (btnCraft.disabled) return;
    
    const baseItem = craftingSlots.find(x => x !== null)?.itemRef;
    if (!baseItem) return;
    const rData = RARITIES[baseItem.rarity];
    
    if (currentMode === 'forge') {
        let req = forgeCosts[baseItem.name];
        let totalInSlots = 0;
        craftingSlots.forEach(s => { if (s && s.itemRef.name === baseItem.name) totalInSlots += s.count; });
        
        if (totalInSlots < req) return;
        
        btnCraft.disabled = true;
        
        let forgesDone = 0;
        let totalConsumed = 0;
        let originalReq = req;
        while(totalInSlots >= req) {
            totalInSlots -= req;
            totalConsumed += req;
            forgesDone++;
            req++;
        }
        
        forgeCosts[baseItem.name] = req;
        localStorage.setItem('florr_forge_costs', JSON.stringify(forgeCosts));
        
        let remainingToDeduct = totalConsumed;
        for (let i = 0; i < 5; i++) {
            if (craftingSlots[i] && craftingSlots[i].itemRef.name === baseItem.name) {
                if (craftingSlots[i].count <= remainingToDeduct) {
                    remainingToDeduct -= craftingSlots[i].count;
                    craftingSlots[i] = null;
                } else {
                    craftingSlots[i].count -= remainingToDeduct;
                    remainingToDeduct = 0;
                }
            }
        }
        
        uiSlots.forEach(slot => slot.classList.add('anim-spin-in'));
        
        setTimeout(() => {
            showResult(forgesDone, forgesDone, baseItem, rData, 'unique');
            addInventory('unique', baseItem.id, baseItem.name, forgesDone);
            renderCrafting();
            renderInventory();
        }, 500);
        return;
    }
    
    let totalPetalsInSlots = 0;
    craftingSlots.forEach(s => { if (s) totalPetalsInSlots += s.count; });
    
    if (totalPetalsInSlots < 5) return; // Need at least 5 to start
    
    btnCraft.disabled = true;
    let chance = (baseItem.name.toLowerCase() === 'square') ? 1.0 : rData.chance;

    uiSlots.forEach(slot => slot.classList.add('anim-spin-in'));

    setTimeout(() => {
        let result = simulateCraftingBulk(totalPetalsInSlots, chance);
        let successes = result.successes;
        let failures = result.failures;
        let originalTotal = totalPetalsInSlots;
        totalPetalsInSlots = result.remaining;
        
        let attempts = successes + failures;

        // Visual result in center
        showResult(successes, attempts, baseItem, rData);
        
        // Add success petals
        if (successes > 0 && rData.next) {
            addInventory(rData.next, baseItem.id, baseItem.name, successes);
        }

        // Return the remaining unused pool to the crafting slots
        let remaining = totalPetalsInSlots;
        for (let i = 0; i < 5; i++) {
            if (craftingSlots[i]) {
                let toKeep = Math.floor(remaining / (5 - i));
                craftingSlots[i].count = toKeep;
                remaining -= toKeep;
                if (craftingSlots[i].count <= 0) craftingSlots[i] = null;
            }
        }

        renderCrafting();
        renderInventory();

    }, 500); // Wait for spin animation
};

function showResult(successes, attempts, baseItem, rData, resultRarity = null) {
    uiCenter.innerHTML = '';
    
    if (successes > 0) {
        const nextRarity = resultRarity ? RARITIES[resultRarity] : RARITIES[rData.next];
        uiCenter.className = 'craft-center-effect slot filled anim-pop-out';
        
        const bgImg = document.createElement('img');
        bgImg.className = 'bg-img';
        bgImg.src = `https://florr.io/petals/0_${nextRarity.id}.svg`;
        
        const img = document.createElement('img');
        img.className = 'petal-img';
        img.src = `https://florr.io/petals/${baseItem.id}_${nextRarity.id}.svg`;
        img.onerror = function() { 
            this.onerror = function() {
                this.onerror = null;
                this.src = `https://florr.io/petals/1.svg`;
            };
            this.src = `https://florr.io/petals/${baseItem.id}.svg`; 
        };
        
        const count = document.createElement('div');
        count.className = 'count';
        count.innerText = `x${formatNumber(successes)}`;
        
        uiCenter.appendChild(bgImg);
        uiCenter.appendChild(img);
        uiCenter.appendChild(count);
        log(`Crafted ${formatNumber(attempts)} times: ${formatNumber(successes)} SUCCESS, ${formatNumber(attempts - successes)} FAILED.`, nextRarity.color);
    } else {
        uiCenter.className = 'craft-center-effect anim-shake';
        const img = document.createElement('img');
        // Just show a gray square or X to indicate fail
        img.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><line x1="20" y1="20" x2="80" y2="80" stroke="red" stroke-width="10"/><line x1="80" y1="20" x2="20" y2="80" stroke="red" stroke-width="10"/></svg>`;
        img.style.width = '50px';
        uiCenter.appendChild(img);
        log(`Crafted ${attempts} times: All FAILED.`, '#f44');
    }

    setTimeout(() => {
        uiSlots.forEach(slot => slot.classList.remove('anim-spin-in'));
        uiCenter.className = 'craft-center-effect';
        uiCenter.innerHTML = '';
        renderInventory();
        renderCrafting();
    }, 1500);
}
renderInventory();

function darkenHex(hex, percent) {
    let r = parseInt(hex.substring(1,3), 16);
    let g = parseInt(hex.substring(3,5), 16);
    let b = parseInt(hex.substring(5,7), 16);

    r = Math.max(0, Math.floor(r * (100 - percent) / 100));
    g = Math.max(0, Math.floor(g * (100 - percent) / 100));
    b = Math.max(0, Math.floor(b * (100 - percent) / 100));

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'k';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';
    if (num < 1000000000000000000) return (num / 1000000000000000).toFixed(1) + 'Qa';
    return num.toExponential(2);
}
