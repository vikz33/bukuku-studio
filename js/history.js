import { SAMPUL_IDS, ISI_IDS } from './config.js';
import { $, getAllValues } from './utils.js';
import { state } from './state.js';
import { generatePages } from './render.js';

export let historyState = { sampul: [], isi: [] };
export let historyIndex = { sampul: -1, isi: -1 };
let isRestoring = false;

export function updateUndoRedoUI() {
    if(state.currentTab !== 'ekspor') { 
        $('btnUndo').disabled = historyIndex[state.currentTab] <= 0; 
        $('btnRedo').disabled = historyIndex[state.currentTab] >= historyState[state.currentTab].length - 1; 
    }
}

export function pushHistory() {
    if(isRestoring || state.currentTab === 'ekspor') return; 
    let stateObj = { vals: {} };
    let ids = state.currentTab === 'sampul' ? SAMPUL_IDS : (state.currentTab === 'isi' ? ISI_IDS : []);
    
    if(state.currentTab === 'sampul') { 
        let bgEl = document.querySelector('input[name="bgMode"]:checked'); 
        if (bgEl) stateObj.vals.bgMode = bgEl.value; 
    }
    
    ids.forEach(id => { 
        let el = $(id); 
        if(el) stateObj.vals[id] = el.type === 'checkbox' ? el.checked : el.value; 
    });
    
    if(state.currentTab === 'sampul') { 
        stateObj.pos = JSON.parse(JSON.stringify(state.POSITIONS)); 
        stateObj.img = { f: state.frontImageBase64, b: state.backImageBase64 };
    } else { 
        stateObj.img = { w: state.watermarkImageBase64 }; 
    }

    const stateStr = JSON.stringify(stateObj); 
    localStorage.setItem('bukuku_autosave', stateStr);
    const arr = historyState[state.currentTab]; 
    const idx = historyIndex[state.currentTab];
    
    if (idx >= 0 && arr[idx] === stateStr) return; 
    
    historyState[state.currentTab] = arr.slice(0, idx + 1); 
    historyState[state.currentTab].push(stateStr);
    
    if (historyState[state.currentTab].length > 30) historyState[state.currentTab].shift(); 
    else historyIndex[state.currentTab]++;
    
    updateUndoRedoUI();
}

export function applyHistoryState(stateStr) {
    if(!stateStr) return; 
    isRestoring = true;
    try {
        const data = JSON.parse(stateStr);
        if(data.vals) {
            Object.keys(data.vals).forEach(id => {
                if(id === 'bgMode') { 
                    const rb = document.querySelector(`input[name="bgMode"][value="${data.vals.bgMode}"]`); 
                    if(rb) rb.checked = true;
                } else { 
                    let el = $(id); 
                    if(el) { if(el.type === 'checkbox') el.checked = data.vals[id]; else el.value = data.vals[id]; } 
                }
            });
        }
        if(data.pos) state.POSITIONS = data.pos;
        if(data.img) { 
            if(data.img.f !== undefined) state.frontImageBase64 = data.img.f; 
            if(data.img.b !== undefined) state.backImageBase64 = data.img.b; 
            if(data.img.w !== undefined) state.watermarkImageBase64 = data.img.w; 
        }
        
        if(typeof window.toggleBgMode === 'function') window.toggleBgMode(); 
        if(typeof window.toggleLabelBgMode === 'function') window.toggleLabelBgMode();
        
        if($('customTotalPages')) $('customTotalPages').style.display = $('totalPages').value === 'custom' ? 'block' : 'none';
        if($('watermarkType')) { 
            $('wmTextGroup').style.display = $('watermarkType').value === 'text' ? 'block' : 'none'; 
            $('wmImageGroup').style.display = $('watermarkType').value === 'image' ? 'block' : 'none'; 
        }
        if($('kdpControls')) $('kdpControls').style.display = $('layoutType') && $('layoutType').value === 'kdp' ? 'block' : 'none';
        
        generatePages(false);
    } catch(e) {}
    isRestoring = false;
    updateUndoRedoUI();
}

export function undo() {
    if (historyIndex[state.currentTab] > 0) { 
        historyIndex[state.currentTab]--; 
        applyHistoryState(historyState[state.currentTab][historyIndex[state.currentTab]]); 
    }
}

export function redo() {
    if (historyIndex[state.currentTab] < historyState[state.currentTab].length - 1) { 
        historyIndex[state.currentTab]++; 
        applyHistoryState(historyState[state.currentTab][historyIndex[state.currentTab]]); 
    }
}

export function resetDraftHistory() {
    historyState = { sampul: [], isi: [] }; 
    historyIndex = { sampul: -1, isi: -1 };
}