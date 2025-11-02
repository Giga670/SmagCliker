/* ---------- Estado ---------- */
let score = 0;
const basePPC = 1;
const scoreEl = document.getElementById('score');
const ppcEl = document.getElementById('ppc');
const messageEl = document.getElementById('message');
const upgradesPanel = document.getElementById('upgradesPanel');

/* ---------- Upgrades manuais (originais) ---------- */
const upgrades = [
  { id: 'up_1',  name: 'Cursor I',    baseCost: 10 * Math.pow(8,0),   level: 0, ppcIncrease: 1 * Math.pow(5,0),  costMultiplier: 1.12 },
  { id: 'up_2',  name: 'Cursor II',   baseCost: 10 * Math.pow(8,1),   level: 0, ppcIncrease: 1 * Math.pow(5,1),  costMultiplier: 1.13 },
  { id: 'up_3',  name: 'Cursor III',  baseCost: 10 * Math.pow(8,2),   level: 0, ppcIncrease: 1 * Math.pow(5,2),  costMultiplier: 1.14 },
  { id: 'up_4',  name: 'Cursor IV',   baseCost: 10 * Math.pow(8,3),   level: 0, ppcIncrease: 1 * Math.pow(5,3),  costMultiplier: 1.15 },
  { id: 'up_5',  name: 'Cursor V',    baseCost: 10 * Math.pow(8,4),   level: 0, ppcIncrease: 1 * Math.pow(5,4),  costMultiplier: 1.16 },
  { id: 'up_6',  name: 'Cursor VI',   baseCost: 10 * Math.pow(8,5),   level: 0, ppcIncrease: 1 * Math.pow(5,5),  costMultiplier: 1.17 },
  { id: 'up_7',  name: 'Cursor VII',  baseCost: 10 * Math.pow(8,6),   level: 0, ppcIncrease: 1 * Math.pow(5,6),  costMultiplier: 1.18 },
  { id: 'up_8',  name: 'Cursor VIII', baseCost: 10 * Math.pow(8,7),   level: 0, ppcIncrease: 1 * Math.pow(5,7),  costMultiplier: 1.19 },
  { id: 'up_9',  name: 'Cursor IX',   baseCost: 10 * Math.pow(8,8),   level: 0, ppcIncrease: 1 * Math.pow(5,8),  costMultiplier: 1.20 },
  { id: 'up_10', name: 'Cursor X',    baseCost: 10 * Math.pow(8,9),   level: 0, ppcIncrease: 1 * Math.pow(5,9),  costMultiplier: 1.22 }
];

/* ---------- Auto-Upgrades (geram pontos por segundo) ---------- */
const autoUpgrades = [
  { id: 'auto_1',  name: 'Gerador I',    baseCost: 1000 * Math.pow(8,0),   level: 0, gps: 1 * Math.pow(10,0),  costMultiplier: 1.12 },
  { id: 'auto_2',  name: 'Gerador II',   baseCost: 1000 * Math.pow(8,1),   level: 0, gps: 1 * Math.pow(10,1),  costMultiplier: 1.13 },
  { id: 'auto_3',  name: 'Gerador III',  baseCost: 1000 * Math.pow(8,2),   level: 0, gps: 1 * Math.pow(10,2),  costMultiplier: 1.14 },
  { id: 'auto_4',  name: 'Gerador IV',   baseCost: 1000 * Math.pow(8,3),   level: 0, gps: 1 * Math.pow(10,3),  costMultiplier: 1.15 },
  { id: 'auto_5',  name: 'Gerador V',    baseCost: 1000 * Math.pow(8,4),   level: 0, gps: 1 * Math.pow(10,4),  costMultiplier: 1.16 },
  { id: 'auto_6',  name: 'Gerador VI',   baseCost: 1000 * Math.pow(8,5),   level: 0, gps: 1 * Math.pow(10,5),  costMultiplier: 1.17 },
  { id: 'auto_7',  name: 'Gerador VII',  baseCost: 1000 * Math.pow(8,6),   level: 0, gps: 1 * Math.pow(10,6),  costMultiplier: 1.18 },
  { id: 'auto_8',  name: 'Gerador VIII', baseCost: 1000 * Math.pow(8,7),   level: 0, gps: 1 * Math.pow(10,7),  costMultiplier: 1.19 },
  { id: 'auto_9',  name: 'Gerador IX',   baseCost: 1000 * Math.pow(8,8),   level: 0, gps: 1 * Math.pow(10,8),  costMultiplier: 1.20 },
  { id: 'auto_10', name: 'Gerador X',    baseCost: 1000 * Math.pow(8,9),   level: 0, gps: 1 * Math.pow(10,9),  costMultiplier: 1.22 }
];

/* ---------- Utilitários ---------- */
function fmt(n){
  const num = Number(n) || 0;
  // mostra decimais quando < 1, caso contrário arredonda e formata pt-BR
  if (!isFinite(num)) return '∞';
  if (Math.abs(num) < 1) return num.toFixed(2).replace('.', ',');
  return Math.round(num).toLocaleString('pt-BR');
}

function getUpgradeCost(upg, levelOffset = 0){
  const lvl = (upg.level || 0) + levelOffset;
  // proteger contra overflow e garantir número inteiro
  const raw = upg.baseCost * Math.pow(upg.costMultiplier, Math.max(0, lvl));
  return Math.max(0, Math.floor(Math.min(raw, Number.MAX_SAFE_INTEGER)));
}

function getTotalCostForQty(upg, qty){
  qty = Math.max(1, Math.floor(qty));
  let total = 0;
  for (let i = 0; i < qty; i++) total += getUpgradeCost(upg, i);
  return total;
}

function calculatePPC(){
  return basePPC + upgrades.reduce((s,u)=> s + ((u.level||0) * (u.ppcIncrease||0)), 0);
}

function calculateAutoGPS(){
  return autoUpgrades.reduce((s,u)=> s + ((u.gps||0) * (u.level||0)), 0);
}

/* ---------- Persistência (inclui autoUpgrades) ---------- */
const SAVE_KEY = 'clicker_save_auto_v1';

function saveProgress(){
  const payload = {
    score,
    upgrades: upgrades.map(u=>({ id:u.id, level: Math.max(0, Math.floor(u.level || 0)) })),
    autoUpgrades: autoUpgrades.map(u=>({ id:u.id, level: Math.max(0, Math.floor(u.level || 0)) }))
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(payload)); } catch(e){}
}

function loadProgress(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return;
    const data = JSON.parse(raw);
    if(typeof data.score === 'number' && isFinite(data.score)) score = data.score;
    if(Array.isArray(data.upgrades)){
      data.upgrades.forEach(su=>{
        const u = upgrades.find(x=>x.id===su.id);
        if(u && Number.isFinite(su.level)) u.level = Math.max(0, Math.floor(su.level));
      });
    }
    if(Array.isArray(data.autoUpgrades)){
      data.autoUpgrades.forEach(su=>{
        const u = autoUpgrades.find(x=>x.id===su.id);
        if(u && Number.isFinite(su.level)) u.level = Math.max(0, Math.floor(su.level));
      });
    }
  }catch(e){}
}

/* ---------- UI: painel separado para auto-upgrades ---------- */
let autoPanel = null;
function ensureAutoPanel(){
  if(autoPanel) return;
  autoPanel = document.createElement('div');
  autoPanel.className = 'upgrades-panel auto-upgrades-panel';
  autoPanel.style.right = 'auto';
  autoPanel.style.left = '16px';
  autoPanel.style.top = '50%';
  autoPanel.style.transform = 'translateY(-50%)';
  autoPanel.style.width = '260px';
  autoPanel.style.maxHeight = '80vh';
  autoPanel.style.overflowY = 'auto';
  autoPanel.style.pointerEvents = 'auto';
  autoPanel.setAttribute('aria-label', 'Painel de Upgrades Automáticos');
  document.body.appendChild(autoPanel);
}

/* ---------- Renderizações (apenas atualiza o necessário) ---------- */
function createUpgradeElement(u, isAuto = false){
  const cost1 = getUpgradeCost(u,0);
  const cost10 = getTotalCostForQty(u,10);
  const div = document.createElement('div');
  div.className = 'upgrade';
  div.dataset.upgradeId = u.id;
  div.innerHTML = `
    <div class="top">
      <div>
        <strong>${u.name}</strong>
        <div class="meta">Nível: <span class="lvl">${u.level}</span> • +${fmt(isAuto ? u.gps : u.ppcIncrease)} ${isAuto ? 'pts/s' : 'PPC'} por compra</div>
      </div>
      <div style="text-align:right"><div style="font-weight:600" class="cost1">${fmt(cost1)} pts</div></div>
    </div>
    <div class="actions">
      <div class="left">
        <button class="buy ${isAuto ? 'auto' : ''}" data-id="${u.id}" data-qty="1" aria-label="Comprar 1 ${u.name}" type="button">Comprar x1</button>
        <button class="buy secondary ${isAuto ? 'auto' : ''}" data-id="${u.id}" data-qty="10" aria-label="Comprar 10 ${u.name}" type="button">Comprar x10</button>
        <div class="price-ten">${fmt(cost10)} pts</div>
      </div>
    </div>
  `;
  return div;
}

function renderOriginalUpgrades(){
  if(!upgradesPanel) return;
  upgradesPanel.innerHTML = '';
  upgrades.forEach(u=>{
    upgradesPanel.appendChild(createUpgradeElement(u, false));
  });
  updateScoreAndPPC();
  updateAutoSmall();
}

function renderAutoUpgrades(){
  ensureAutoPanel();
  autoPanel.innerHTML = '';
  autoUpgrades.forEach(u=>{
    autoPanel.appendChild(createUpgradeElement(u, true));
  });
  updateScoreAndPPC();
  updateAutoSmall();
}

function refreshSingleUpgradeInDOM(id, list){
  const panel = list === autoUpgrades ? autoPanel : upgradesPanel;
  if(!panel) return;
  const u = (list === autoUpgrades ? autoUpgrades : upgrades).find(x=>x.id===id);
  if(!u) return;
  const node = panel.querySelector(`[data-upgrade-id="${id}"]`);
  if(!node) return;
  const cost1 = node.querySelector('.cost1');
  const lvl = node.querySelector('.lvl');
  if(cost1) cost1.innerText = `${fmt(getUpgradeCost(u,0))} pts`;
  if(lvl) lvl.innerText = `${u.level}`;
  // update price-ten
  const priceTen = node.querySelector('.price-ten');
  if(priceTen) priceTen.innerText = fmt(getTotalCostForQty(u,10)) + ' pts';
}

/* ---------- Indicador compacto de Auto (ao lado do PPC) ---------- */
function updateAutoSmall(){
  const el = document.getElementById('autoSmallVal');
  if(el) el.innerText = fmt(calculateAutoGPS());
}

/* --- Mensagens temporárias --- */
const DEFAULT_MESSAGE = 'Clique em qualquer lugar da tela para ganhar pontos (exceto nos botões).';
let messageTimer = null;

function showMessageOnce(text, duration = 3000){
  if(!messageEl) return;
  if(messageTimer) { clearTimeout(messageTimer); messageTimer = null; }
  messageEl.innerText = text;
  messageTimer = setTimeout(()=> {
    messageEl.innerText = DEFAULT_MESSAGE;
    messageTimer = null;
  }, duration);
}

/* ---------- Pontuação ---------- */
function updateScoreAndPPC(){
  if(scoreEl) scoreEl.innerText = fmt(score);
  if(ppcEl) ppcEl.innerText = fmt(calculatePPC());
}
function tryUnlockThemes(){
  const scoreNow = Number(score) || 0;
  Object.values(THEMES).forEach(t=>{
    if(!t.locked) return;
    if(scoreNow >= (t.unlockScore || Infinity)){
      // desbloqueia
      t.locked = false;
      // atualizar botão DOM se presente
      const btn = themeToggleRow && themeToggleRow.querySelector(`button[data-theme="${t.id}"]`);
      if(btn){
        btn.dataset.locked = '0';
        btn.classList.remove('locked');
        btn.removeAttribute('aria-disabled');
        btn.title = `Desbloqueado`;
      }
      showMessageOnce(`Tema "${t.label}" desbloqueado! Agora disponível em Configurações.`, 4000);
    }
  });
}

function addPoints(amount = null){
  const toAdd = (amount !== null) ? Number(amount) : calculatePPC();
  if(!Number.isFinite(toAdd) || toAdd === 0) return;
  score += toAdd;
  if(!isFinite(score) || score > Number.MAX_SAFE_INTEGER) score = Number.MAX_SAFE_INTEGER;
  updateScoreAndPPC();
  tryUnlockThemes();
  saveProgress();
}

/* ---------- Compra (suporta listas originais e auto) ---------- */
function buyFrom(list, id, qty){
  const upg = list.find(x=>x.id===id);
  if(!upg) return false;
  qty = Math.max(1, Math.floor(qty));
  const totalCost = getTotalCostForQty(upg, qty);
  if(score >= totalCost){
    score -= totalCost;
    upg.level = (upg.level || 0) + qty;
    showMessageOnce(`Comprado ${qty}x ${upg.name} por ${fmt(totalCost)} pontos.`);
    saveProgress();
    // atualizar apenas o painel afetado + indicadores
    if(list === upgrades) refreshSingleUpgradeInDOM(id, upgrades);
    else refreshSingleUpgradeInDOM(id, autoUpgrades);
    updateScoreAndPPC();
    updateAutoSmall();
    return true;
  } else {
    showMessageOnce('Pontos insuficientes para essa compra.');
    return false;
  }
}

/* ---------- Delegação de eventos ---------- */
document.body.addEventListener('click', e=>{
  if(e.target.closest('button')) return;
  if(settingsOpen) return;
  addPoints();
});

if (upgradesPanel) {
  upgradesPanel.addEventListener('click', e=>{
    const btn = e.target.closest('button.buy');
    if(!btn) return;
    const id = btn.dataset.id;
    const qty = parseInt(btn.dataset.qty,10) || 1;
    buyFrom(upgrades, id, qty);
  });
}

function ensureAutoDelegation(){
  ensureAutoPanel();
  // remover listener prévio possível e reatribuir: usar uma função nomeada não é estritamente necessário aqui,
  // mas garantimos que não vamos anexar múltiplos listeners porque criamos painel apenas uma vez.
  autoPanel.addEventListener('click', e=>{
    const btn = e.target.closest('button.auto');
    if(!btn) return;
    const id = btn.dataset.id;
    const qty = parseInt(btn.dataset.qty,10) || 1;
    buyFrom(autoUpgrades, id, qty);
  });
}

/* ---------- Configurações (tema, brilho, modal) ---------- */
const settingsBtn = document.getElementById('settingsBtn');
const settingsBackdrop = document.getElementById('settingsBackdrop');
const closeSettings = document.getElementById('closeSettings');
const brightnessRange = document.getElementById('brightnessRange');
const resetSettings = document.getElementById('resetSettings');

const THEMES = {
  light:{id:'light',label:'Claro'},
  dark:{id:'dark',label:'Escuro'},
  matrix:{id:'matrix',label:'Matrix'},
  ruby:{id:'ruby',label:'Ruby', locked:true, unlockScore: 1_000_000_000_000 }
};
const themeToggleRow = document.querySelector('.theme-toggle');
function renderThemeButtons(){
  if(!themeToggleRow) return;
  themeToggleRow.innerHTML = '';
  Object.values(THEMES).forEach(t=>{
    const btn = document.createElement('button');
    btn.className = 'small-btn';
    btn.textContent = t.label;
    btn.dataset.theme = t.id;
    btn.setAttribute('type','button');
    // locked initial state
    const locked = !!t.locked;
    if(locked){
      btn.classList.add('locked');
      btn.dataset.locked = '1';
      btn.setAttribute('aria-disabled','true');
      btn.title = `Desbloqueia ao atingir ${fmt(t.unlockScore)} pontos`;
    }
    btn.addEventListener('click', ()=>{
      const isLocked = btn.dataset.locked === '1';
      if(isLocked){
        showMessageOnce(`Tema "${t.label}" bloqueado — alcance ${fmt(t.unlockScore)} pontos para liberar.`);
        return;
      }
      applyTheme(t.id);
      showMessageOnce(`Tema "${t.label}" aplicado.`);
    });
    themeToggleRow.appendChild(btn);
  });
}
renderThemeButtons();


function applyBrightness(value){
  const v = String(value || 1);
  document.documentElement.style.setProperty('--brightness', v);
  if(brightnessRange) brightnessRange.value = v;
  try{ localStorage.setItem('clicker_brightness', v); }catch(e){}
}
function applyTheme(themeId){
  // limpa classes theme-*
  document.body.className = document.body.className.split(/\s+/).filter(c=>!c.startsWith('theme-')).join(' ');
  if(themeId && themeId!=='light') document.body.classList.add('theme-'+themeId);
  try{ localStorage.setItem('clicker_theme', themeId||'light'); }catch(e){}
}

/* Modal control */
let settingsOpen = false;
function openSettings(){
  if(settingsBackdrop){ settingsBackdrop.style.display='flex'; settingsBackdrop.setAttribute('aria-hidden','false'); }
  settingsOpen=true;
  if(messageTimer){ clearTimeout(messageTimer); messageTimer = null; }
  if(messageEl) messageEl.innerText = 'Configurações abertas — pontuação pausada.';
}
function closeSettingsModal(){
  if(settingsBackdrop){ settingsBackdrop.style.display='none'; settingsBackdrop.setAttribute('aria-hidden','true'); }
  settingsOpen=false;
  if(messageTimer){ clearTimeout(messageTimer); messageTimer = null; }
  if(messageEl) messageEl.innerText = DEFAULT_MESSAGE;
}
if(settingsBtn) settingsBtn.addEventListener('click', e=>{ e.stopPropagation(); openSettings(); });
if(closeSettings) closeSettings.addEventListener('click', closeSettingsModal);
if(settingsBackdrop) settingsBackdrop.addEventListener('click', e=>{ if(e.target===settingsBackdrop) closeSettingsModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeSettingsModal(); });
if(brightnessRange) brightnessRange.addEventListener('input', e=> applyBrightness(e.target.value));
if(resetSettings) resetSettings.addEventListener('click', ()=>{
  try{ localStorage.removeItem('clicker_theme'); localStorage.removeItem('clicker_brightness'); }catch(e){}
  applyTheme('light'); applyBrightness(1);
});

/* ---------- Loop de geração automática (APENAS dos autoUpgrades) ---------- */
let lastTick = performance.now();
function autoTick(now){
  const delta = (now - lastTick) / 1000;
  lastTick = now;
  if(!settingsOpen){
    const gps = calculateAutoGPS();
    if(gps > 0){
      // adiciona pontos proporcionais ao delta (pontos por segundo * delta em s)
      addPoints(gps * delta);
    }
  }
  updateAutoSmall();
  requestAnimationFrame(autoTick);
}

/* ---------- Inicialização ---------- */
(function init(){
  const savedTheme = localStorage.getItem('clicker_theme') || 'light';
  const savedBrightness = localStorage.getItem('clicker_brightness') || '1';
  applyTheme(savedTheme);
  applyBrightness(savedBrightness);

  if(messageEl) messageEl.innerText = DEFAULT_MESSAGE;

  loadProgress();
  renderOriginalUpgrades();
  renderAutoUpgrades();
  ensureAutoDelegation();
  renderThemeButtons(); // (idempotente)
  tryUnlockThemes();  

  // proteção: reiniciar lastTick para evitar pulos grandes no primeiro frame
  lastTick = performance.now();
  requestAnimationFrame(autoTick);
})();
