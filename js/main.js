import { ALL_EMOJIS, SAMPUL_IDS, ISI_IDS, THEME_CONFIG, KDP_CONFIG } from './config.js';
import { $, getAllValues, setExportStatus } from './utils.js';
import { state } from './state.js';
import { generatePages, applyPositions, applyZoom } from './render.js';
import { pushHistory, undo, redo, resetDraftHistory } from './history.js';
import { makeDraggable } from './dragdrop.js';
import { exportPDF } from './export.js';

window.toggleBgMode = function() {
  const bgEl = document.querySelector('input[name="bgMode"]:checked');
  if (!bgEl) return;
  const mode = bgEl.value;
  if ($('customBgControls')) $('customBgControls').style.display = mode === 'custom' ? 'grid' : 'none';
  if ($('themeWrapper')) $('themeWrapper').style.display = mode === 'theme' ? 'flex' : 'none';
  if ($('solidBgControls')) $('solidBgControls').style.display = mode === 'solid' ? 'grid' : 'none';
  generatePages(true);
};

window.toggleLabelBgMode = function() { 
  if ($('labelBgColor') && $('labelBgMode')) $('labelBgColor').style.display = $('labelBgMode').value === 'solid' ? 'block' : 'none'; 
  generatePages(true); 
};

window.openEmojiPicker = function(inputId, btnEl) {
  state.activeEmojiInput = inputId; 
  const picker = $('emojiPicker'); 
  if (!picker) return;
  const rect = btnEl.getBoundingClientRect();
  picker.style.top = (rect.bottom + window.scrollY + 8) + 'px'; 
  picker.style.left = (rect.right - 220) + 'px'; 
  picker.classList.remove('hidden');
};

function initApp() {
  if ($('btnUndo')) $('btnUndo').addEventListener('click', undo);
  if ($('btnRedo')) $('btnRedo').addEventListener('click', redo);
  if ($('startEditorBtn')) $('startEditorBtn').addEventListener('click', () => { $('homePage').classList.add('hidden'); $('editorPage').classList.add('active'); generatePages(false); });
  if ($('goHomeBtn')) $('goHomeBtn').addEventListener('click', () => { $('homePage').classList.remove('hidden'); $('editorPage').classList.remove('active'); });
  if ($('btnZoomIn')) $('btnZoomIn').addEventListener('click', () => { if(state.currentZoom < 1.5) { state.currentZoom = Math.round((state.currentZoom + 0.1) * 10) / 10; applyZoom(); } });
  if ($('btnZoomOut')) $('btnZoomOut').addEventListener('click', () => { if(state.currentZoom > 0.5) { state.currentZoom = Math.round((state.currentZoom - 0.1) * 10) / 10; applyZoom(); } });
  
  window.addEventListener('beforeunload', (e) => {
      if (state.isAppReady) {
          e.preventDefault();
          e.returnValue = ''; 
      }
  });

  const previewShell = document.querySelector('.preview-shell');
  if (previewShell) {
      let initialDistance = null;
      let initialZoom = 1;

      previewShell.addEventListener('touchstart', (e) => {
          if (e.touches.length === 2) {
              initialDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
              initialZoom = state.currentZoom;
          }
      }, { passive: true });

      previewShell.addEventListener('touchmove', (e) => {
          if (e.touches.length === 2 && initialDistance) {
              e.preventDefault(); 
              const currentDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
              const zoomDelta = currentDistance / initialDistance;
              let newZoom = initialZoom * zoomDelta;
              
              newZoom = Math.max(0.3, Math.min(newZoom, 2.0)); 
              state.currentZoom = Math.round(newZoom * 10) / 10;
              applyZoom();
          }
      }, { passive: false });

      previewShell.addEventListener('touchend', (e) => {
          if (e.touches.length < 2) initialDistance = null;
      });
  }

  const toggleDark = () => document.body.classList.toggle('dark-mode');
  if ($('darkModeBtn')) $('darkModeBtn').addEventListener('click', toggleDark);
  if ($('heroDarkModeBtn')) $('heroDarkModeBtn').addEventListener('click', toggleDark);
  if ($('helpBtn')) $('helpBtn').addEventListener('click', () => $('helpModal').classList.add('show'));
  if ($('closeHelpBtn')) $('closeHelpBtn').addEventListener('click', () => $('helpModal').classList.remove('show'));

  if ($('printBtn')) $('printBtn').addEventListener('click', () => {
      const v = getAllValues(SAMPUL_IDS, ISI_IDS);
      const isKDP = v.kdpMode;
      const target = $('exportTarget') ? $('exportTarget').value : 'semua';
      let printW = 297; let printH = 210; 
      if(isKDP) {
          const preset = KDP_CONFIG.presets[v.kdpPreset];
          printW = preset.w; printH = preset.h;
          if (v.useBleed) { printW += KDP_CONFIG.bleed; printH += (KDP_CONFIG.bleed * 2); }
      }
      let stylePrint = document.getElementById('print-page-style');
      if(!stylePrint) { stylePrint = document.createElement('style'); stylePrint.id = 'print-page-style'; document.head.appendChild(stylePrint); }
      stylePrint.innerHTML = `@media print { @page { size: ${printW}mm ${printH}mm; margin: 0mm; } }`;
      
      document.body.className = ''; 
      if($('darkModeBtn') && $('darkModeBtn').querySelector('.sun-icon')) document.body.classList.add('dark-mode');
      document.body.classList.add('print-' + target); 
      setTimeout(() => { window.print(); }, 200);
  });

  window.addEventListener('afterprint', () => document.body.classList.remove('print-sampul', 'print-isi', 'print-semua'));
  if ($('exportPdfBtn')) $('exportPdfBtn').addEventListener('click', exportPDF);

  document.querySelectorAll('.ui-group-title').forEach(title => title.addEventListener('click', () => title.parentElement.classList.toggle('collapsed')));
  
  if ($('emojiPicker')) {
      ALL_EMOJIS.forEach(em => { const span = document.createElement('span'); span.className = 'emoji-item'; span.textContent = em; span.onclick = () => { if (state.activeEmojiInput && $(state.activeEmojiInput)) { $(state.activeEmojiInput).value += em; generatePages(true); } }; $('emojiPicker').appendChild(span); });
  }
  document.addEventListener('click', (e) => { if ($('emojiPicker') && !e.target.closest('.emoji-picker-modal') && !e.target.closest('.btn-inside')) $('emojiPicker').classList.add('hidden'); });

  ['watermarkImageInput', 'frontImageInput', 'backImageInput'].forEach(id => {
      let el = $(id); 
      if(el) el.addEventListener('change', (e) => { 
          const file = e.target.files[0]; 
          if(file) { 
              const reader = new FileReader(); 
              reader.onload = (ev) => { 
                  const img = new Image();
                  img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const MAX_SIZE = 800; 
                      let w = img.width; let h = img.height;
                      
                      if (w > h) { if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; } }
                      else { if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; } }
                      
                      canvas.width = w; canvas.height = h;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0, w, h);
                      
                      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

                      if(id==='watermarkImageInput') state.watermarkImageBase64 = compressedBase64; 
                      else if(id==='frontImageInput') state.frontImageBase64 = compressedBase64; 
                      else state.backImageBase64 = compressedBase64; 
                      
                      generatePages(true); 
                  };
                  img.src = ev.target.result;
              }; 
              reader.readAsDataURL(file); 
          } 
      });
  });

  if($('layoutType')) $('layoutType').addEventListener('change', (e) => {
      const isKDP = e.target.value === 'kdp';
      if($('kdpControls')) $('kdpControls').style.display = $('layoutType') && $('layoutType').value === 'kdp' ? 'block' : 'none';
      if(isKDP && $('exportTarget')) $('exportTarget').value = 'semua';
      generatePages(true);
  });

  if ($('themeSelect')) $('themeSelect').addEventListener('change', (e) => {
    const cfg = THEME_CONFIG[e.target.value];
    if (cfg) { 
        if($('inputFrontDeco')) $('inputFrontDeco').value = cfg.frontDeco; 
        if($('inputBackDeco')) $('inputBackDeco').value = cfg.backDeco; 
        const isDark = ['#ea580c', '#7f1d1d', '#0b1029'].includes(cfg.grad[0]);
        if($('colorFrontTitle')) $('colorFrontTitle').value = isDark ? '#ffffff' : '#1B4332'; 
        if($('colorBackTitle')) $('colorBackTitle').value = isDark ? '#ffffff' : '#1B4332'; 
        if($('colorLabels')) $('colorLabels').value = isDark ? '#ffffff' : '#1B4332'; 
        if($('lineColor')) $('lineColor').value = cfg.color;
        if($('headerColor')) $('headerColor').value = cfg.color;
        if($('footerColor')) $('footerColor').value = cfg.color;
    }
    generatePages(true); 
  });
  
  if ($('resetPosBtn')) $('resetPosBtn').addEventListener('click', () => { 
      if(state.POSITIONS.coverFrontFields) { state.POSITIONS.coverFrontFields.dx = 0; state.POSITIONS.coverFrontFields.dy = 0; }
      applyPositions(); generatePages(true); 
  });

  ['coverFrontDeco', 'coverBackDeco', 'coverFrontTitle', 'coverFrontSubtitle', 'coverBackTitle', 'coverBackSubtitle', 'coverFrontFields', 'coverFrontImage', 'coverBackImage'].forEach(id => { if($(id)) makeDraggable($(id)); });

  let typingTimer;
  [...SAMPUL_IDS, ...ISI_IDS].forEach(id => {
      let el = $(id); if (!el) return;
      if (el.type === 'range' || el.type === 'color') { el.addEventListener('input', () => generatePages(false)); el.addEventListener('change', () => pushHistory());
      } else if (el.type === 'checkbox' || el.type === 'radio') { el.addEventListener('change', () => generatePages(true));
      } else { el.addEventListener('input', () => { generatePages(false); clearTimeout(typingTimer); typingTimer = setTimeout(() => pushHistory(), 500); }); }
  });
  
  document.querySelectorAll('.sb-tab').forEach(b => b.addEventListener('click', () => {
      state.currentTab = b.dataset.target; 
      document.querySelectorAll('.sb-tab').forEach(tb => tb.classList.toggle('active', tb.dataset.target === state.currentTab)); 
      document.querySelectorAll('.sb-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + state.currentTab));
      
      if(state.currentTab === 'ekspor') { 
          const val = $('exportTarget') ? $('exportTarget').value : 'semua'; 
          document.querySelectorAll('.section').forEach(s => s.classList.remove('active')); 
          if($('sec-' + val)) $('sec-' + val).classList.add('active');
          if($('previewBadge')) $('previewBadge').textContent = { 'sampul': 'Menampilkan: Sampul', 'isi': 'Menampilkan: Isi Buku', 'semua': 'Menampilkan: Semua Halaman' }[val] || '';
      } else {
          document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'sec-' + state.currentTab));
          if($('previewBadge')) $('previewBadge').textContent = { 'sampul': 'Menampilkan: Sampul', 'isi': 'Menampilkan: Isi Buku' }[state.currentTab];
          pushHistory();
      }
  }));

  if ($('exportTarget')) $('exportTarget').addEventListener('change', () => { if(state.currentTab === 'ekspor') { document.querySelectorAll('.section').forEach(s => s.classList.remove('active')); if($('sec-' + $('exportTarget').value)) $('sec-' + $('exportTarget').value).classList.add('active'); if($('previewBadge')) $('previewBadge').textContent = { 'sampul': 'Menampilkan: Sampul', 'isi': 'Menampilkan: Isi Buku', 'semua': 'Menampilkan: Semua Halaman' }[$('exportTarget').value]; } });

  if ($('btnDownloadDraft')) $('btnDownloadDraft').addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ vals: getAllValues(SAMPUL_IDS, ISI_IDS), pos: state.POSITIONS, img: { f: state.frontImageBase64, b: state.backImageBase64, w: state.watermarkImageBase64 } }));
      const dlAnchorElem = document.createElement('a'); dlAnchorElem.setAttribute("href", dataStr); dlAnchorElem.setAttribute("download", "draft-bukuku-studio.json"); dlAnchorElem.click();
      setExportStatus('File Draft terunduh!');
  });
  
  if ($('btnUploadDraft')) $('btnUploadDraft').addEventListener('change', (e) => {
      const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              const data = JSON.parse(ev.target.result);
              if(data.pos) state.POSITIONS = data.pos;
              if(data.img) { if(data.img.f !== undefined) state.frontImageBase64 = data.img.f; if(data.img.b !== undefined) state.backImageBase64 = data.img.b; if(data.img.w !== undefined) state.watermarkImageBase64 = data.img.w; }
              if(data.vals) {
                  Object.keys(data.vals).forEach(id => {
                      if(id === 'bgMode') { const rb = document.querySelector(`input[name="bgMode"][value="${data.vals.bgMode}"]`); if(rb) rb.checked = true;
                      } else { let el = $(id); if(el) { if(el.type === 'checkbox') el.checked = data.vals[id]; else el.value = data.vals[id]; } }
                  });
                  if(data.vals.totalPages && $('customTotalPages')) $('customTotalPages').style.display = data.vals.totalPages === 'custom' ? 'block' : 'none';
                  if($('watermarkType')) { if($('wmTextGroup')) $('wmTextGroup').style.display = $('watermarkType').value === 'text' ? 'block' : 'none'; if($('wmImageGroup')) $('wmImageGroup').style.display = $('watermarkType').value === 'image' ? 'block' : 'none'; }
              }
              window.toggleBgMode(); window.toggleLabelBgMode();
              const tgt = $('exportTarget') ? $('exportTarget').value : 'semua'; document.querySelectorAll('.section').forEach(s => s.classList.remove('active')); if($('sec-' + tgt)) $('sec-' + tgt).classList.add('active');
              resetDraftHistory();
              if ($('homePage') && !$('homePage').classList.contains('hidden')) $('homePage').classList.add('hidden'); 
              if($('editorPage')) $('editorPage').classList.add('active');
              generatePages(true); setExportStatus('Draft berhasil dimuat!');
          } catch (err) { alert("File tidak valid."); }
      };
      reader.readAsText(file); e.target.value = '';
  });

  const mobilePreviewBtn = $('mobilePreviewToggle');
  if (mobilePreviewBtn) {
      mobilePreviewBtn.addEventListener('click', () => {
          const previewArea = document.querySelector('.preview-shell');
          const sidebarArea = document.querySelector('.sidebar-stack');
          if (!previewArea || !sidebarArea) return;
          const isLookingAtPreview = window.scrollY > (previewArea.offsetTop - 150);
          if (isLookingAtPreview) window.scrollTo({ top: sidebarArea.offsetTop - 20, behavior: 'smooth' });
          else window.scrollTo({ top: previewArea.offsetTop - 20, behavior: 'smooth' });
      });

      window.addEventListener('scroll', () => {
          if (window.innerWidth <= 1180 && document.querySelector('.preview-shell')) {
              const previewArea = document.querySelector('.preview-shell');
              const isLookingAtPreview = window.scrollY > (previewArea.offsetTop - 150);
              if (isLookingAtPreview) {
                  mobilePreviewBtn.innerHTML = '<span class="icon">⚙️</span> <span class="text">Edit Lagi</span>';
                  mobilePreviewBtn.style.background = 'var(--accent)'; 
              } else {
                  mobilePreviewBtn.innerHTML = '<span class="icon">👀</span> <span class="text">Lihat Hasil</span>';
                  mobilePreviewBtn.style.background = 'var(--primary)'; 
              }
          }
      }, { passive: true });
  }

  // ==========================================
  // FITUR BARU: AUTO-FOCUS SIDEBAR SAAT KLIK KANVAS
  // ==========================================
  document.querySelectorAll('.draggable-item').forEach(item => {
    item.addEventListener('click', () => {
        // Pindah ke tab Sampul jika belum berada di tab Sampul
        const sampulTab = document.querySelector('.sb-tab[data-target="sampul"]');
        if (sampulTab && !sampulTab.classList.contains('active')) sampulTab.click();

        // Cari grup mana yang harus dibuka
        let targetPanelId = '';
        if (item.id.includes('Title') || item.id.includes('Subtitle')) {
            targetPanelId = 'Teks Judul';
        } else if (item.id.includes('Fields') || item.id.includes('rowId')) {
            targetPanelId = 'Identitas Buku';
        } else if (item.id.includes('Deco') || item.id.includes('Image')) {
            targetPanelId = 'Stiker & Gambar';
        }

        // Buka grup dan beri efek visual (highlight) sementara
        if (targetPanelId) {
            document.querySelectorAll('.ui-group').forEach(group => {
                const title = group.querySelector('.ui-group-title');
                if (title && title.innerText.includes(targetPanelId)) {
                    group.classList.remove('collapsed');
                    group.style.transition = 'border-color 0.3s, box-shadow 0.3s';
                    group.style.borderColor = 'var(--accent)';
                    group.style.boxShadow = '0 0 0 2px rgba(214, 140, 115, 0.2)';
                    
                    setTimeout(() => {
                        group.style.borderColor = 'var(--panel-border)';
                        group.style.boxShadow = 'var(--shadow-sm)';
                    }, 1200);
                    
                    // Scroll sidebar ke bagian tersebut secara perlahan
                    group.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    });
  });

  generatePages(false); 
  state.isAppReady = true; 
  pushHistory();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initApp); } 
else { initApp(); }