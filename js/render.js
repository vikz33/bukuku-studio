import { THEME_CONFIG, LINES_PER_PAGE, PAPER_A4, PAD_LR, PAD_TB, SAMPUL_IDS, ISI_IDS, KDP_CONFIG } from './config.js';
import { $, getAllValues } from './utils.js';
import { state } from './state.js';
import { pushHistory } from './history.js';

const _lineRows = '<div class="line-row"></div>'.repeat(LINES_PER_PAGE);
const _linesHTML = '<div class="lines-area">' + _lineRows + '</div>';
const _blankHTML = '<div class="blank-area"></div>';
const _dotGridHTML = '<div class="dot-grid-area"></div>';
const _checklistHTML = '<div class="checklist-area">' + Array.from({ length: LINES_PER_PAGE }, () => '<div class="checklist-row"><div class="check-box"></div><div class="check-line"></div></div>').join('') + '</div>';

export function applyZoom() {
    if($('zoomLevelDisplay')) $('zoomLevelDisplay').textContent = Math.round(state.currentZoom * 100) + '%';
    document.querySelectorAll('.sheet, .kdp-page').forEach(sheet => {
        sheet.style.transform = `scale(${state.currentZoom})`;
        sheet.style.transformOrigin = 'top center';
        const realHeight = sheet.getBoundingClientRect().height / state.currentZoom;
        const diff = realHeight - (realHeight * state.currentZoom);
        sheet.style.marginBottom = `-${diff}px`;
    });
}

export function applyPositions() {
  Object.keys(state.POSITIONS).forEach(id => {
    const el = $(id);
    if(el) {
      el.style.left = state.POSITIONS[id].rawX;
      el.style.top = state.POSITIONS[id].rawY;
      el.style.transform = `translate(calc(${state.POSITIONS[id].defaultX} + ${state.POSITIONS[id].dx}px), calc(${state.POSITIONS[id].defaultY} + ${state.POSITIONS[id].dy}px))`;
    }
  });
}

function updateCoverTexts(v, cfg) { 
  const toTitleCase = (str) => str ? str.replace(/\b\w/g, l => l.toUpperCase()) : '';

  for(let i=1; i<=4; i++) {
      let show = v['showId'+i];
      if($('rowId'+i)) $('rowId'+i).style.display = show ? 'flex' : 'none';
      if(show) {
          if($('textLabel'+i)) $('textLabel'+i).textContent = toTitleCase(v['labelId'+i]);
          let val = v['valId'+i] || '';
          if($('textVal'+i)) $('textVal'+i).textContent = (v['labelId'+i] || '').toLowerCase().includes('kelas') ? val.toUpperCase() : toTitleCase(val);
      }
  }
  
  ['FrontTitle', 'FrontSubtitle', 'BackTitle', 'BackSubtitle'].forEach(key => {
      let el = $('cover'+key);
      if(!el) return;
      el.textContent = v['input'+key] || cfg[key.charAt(0).toLowerCase() + key.slice(1)];
      let side = key.startsWith('Front') ? 'Front' : 'Back';
      let type = key.endsWith('Subtitle') ? 'Subtitle' : 'Title';
      el.style.fontFamily = v['font' + type + side];
      el.style.fontSize = v['size' + type + side] + 'px';
      if($('valSize' + type + side)) $('valSize' + type + side).textContent = v['size' + type + side] + 'px';
      el.style.color = v['color'+key]; 
      el.style.textAlign = v['align'+key]; 
  });

  if($('coverFrontDeco')) $('coverFrontDeco').style.fontSize = v.sizeDecoFront + 'px'; 
  if($('valSizeDecoFront')) $('valSizeDecoFront').textContent = v.sizeDecoFront + 'px';
  if($('coverBackDeco')) $('coverBackDeco').style.fontSize = v.sizeDecoBack + 'px'; 
  if($('valSizeDecoBack')) $('valSizeDecoBack').textContent = v.sizeDecoBack + 'px';
  if($('coverFrontDeco')) $('coverFrontDeco').textContent = v.inputFrontDeco; 
  if($('coverBackDeco')) $('coverBackDeco').textContent = v.inputBackDeco;
  if($('coverFrontDeco')) $('coverFrontDeco').style.display = v.showCoverDecoFront ? 'block' : 'none'; 
  if($('coverBackDeco')) $('coverBackDeco').style.display = v.showCoverDecoBack ? 'block' : 'none';

  const fieldsEl = $('coverFrontFields');
  if(fieldsEl) {
      if (v.labelBgMode === 'blur') { fieldsEl.style.background = 'rgba(255, 255, 255, 0.14)'; fieldsEl.style.backdropFilter = 'blur(8px)'; fieldsEl.style.border = '1px solid rgba(255, 255, 255, 0.16)';
      } else if (v.labelBgMode === 'transparent') { fieldsEl.style.background = 'transparent'; fieldsEl.style.backdropFilter = 'none'; fieldsEl.style.border = '1px dashed rgba(255,255,255,0.3)';
      } else { fieldsEl.style.background = v.labelBgColor; fieldsEl.style.backdropFilter = 'none'; fieldsEl.style.border = '1px solid rgba(0,0,0,0.1)'; }

      const cLabel = v.colorLabels; 
      if($('bookContent')) $('bookContent').style.setProperty('--cover-label', cLabel);
      fieldsEl.querySelectorAll('.cf-row, .cf-label, .cf-value').forEach(r => { r.style.color = cLabel; if(r.classList.contains('cf-value')) r.style.borderBottomColor = cLabel; });
  }
  
  if(state.frontImageBase64 && v.showFrontImage) { if($('coverFrontImage')) { $('coverFrontImage').src = state.frontImageBase64; $('coverFrontImage').style.display = 'block'; $('coverFrontImage').style.width = v.sizeFrontImage + 'px'; } } else { if($('coverFrontImage')) $('coverFrontImage').style.display = 'none'; }
  if($('valSizeFrontImage')) $('valSizeFrontImage').textContent = v.sizeFrontImage + 'px';
  if(state.backImageBase64 && v.showBackImage) { if($('coverBackImage')) { $('coverBackImage').src = state.backImageBase64; $('coverBackImage').style.display = 'block'; $('coverBackImage').style.width = v.sizeBackImage + 'px'; } } else { if($('coverBackImage')) $('coverBackImage').style.display = 'none'; }
  if($('valSizeBackImage')) $('valSizeBackImage').textContent = v.sizeBackImage + 'px';
  if($('sizeWatermarkImage') && $('valSizeWatermark')) $('valSizeWatermark').textContent = v.sizeWatermarkImage + 'px';

  applyPositions(); 
}

function calcGrid(v) {
  let dimW = PAPER_A4.w / 2; let dimH = PAPER_A4.h;
  let padX = PAD_LR; let padY = PAD_TB;
  
  if (v.kdpMode) {
      const preset = KDP_CONFIG.presets[v.kdpPreset];
      dimW = preset.w; dimH = preset.h;
      if (v.useBleed) { dimW += KDP_CONFIG.bleed; dimH += (KDP_CONFIG.bleed * 2); }
      
      padX = 16; 
      if (v.useGutter) { padX += KDP_CONFIG.gutter; }
      padY = 16; 
  }
  
  const cW = dimW - padX; const cH = dimH - padY;
  let cols = Math.floor(cW / 5); if (cW / cols > 6) cols = Math.ceil(cW / 6);
  let rows = Math.floor(cH / 5); if (cH / rows > 6) rows = Math.ceil(cH / 6);
  return { cols, rows };
}

function buildGridHTML(v) {
  const g = calcGrid(v); 
  let html = '<div class="grid-wrapper"><table class="grid-table">';
  for (let r = 0; r < g.rows; r++) { html += '<tr>'; for (let c = 0; c < g.cols; c++) html += '<td></td>'; html += '</tr>'; }
  return html + '</table></div>';
}

function getLineContentHTML(t, v) { 
    if (t === 'kotak') return buildGridHTML(v); 
    if (t === 'titik') return _dotGridHTML; 
    if (t === 'kosong') return _blankHTML; 
    if (t === 'checklist') return _checklistHTML; 
    if (t === 'cornell') return `<div class="cornell-area"><div class="cornell-cues">Kata Kunci:</div><div class="cornell-notes">${Array.from({length: 20}, () => '<div class="line-row"></div>').join('')}</div><div class="cornell-summary">Ringkasan:</div></div>`;
    if (t === 'playbook') return `<div class="pitch-area"><div class="pitch-half"></div><div class="pitch-circle"></div><div class="pitch-dot"></div><div class="pitch-box-top"></div><div class="pitch-box-bottom"></div><div class="pitch-goal-top"></div><div class="pitch-goal-bottom"></div><div class="pitch-penalty-top"></div><div class="pitch-penalty-bottom"></div></div>`;
    if (t === 'partitur') return `<div class="music-area">${Array.from({length: 10}, () => `<div class="music-stave">${Array.from({length: 5}, () => '<div class="music-line"></div>').join('')}</div>`).join('')}</div>`;
    return _linesHTML; 
}

function createPageHeader(v) {
  if (!v.showHeader) return '<div class="page-header" style="visibility:hidden;margin-bottom:2mm;padding-bottom:1mm;"></div>';
  const n = v.showNumberField ? '<div class="field"><span>No.</span><div class="line"></div></div>' : '';
  const d = v.showDateField ? '<div class="field"><span>Tanggal</span><div class="line"></div></div>' : '';
  const borderStyle = v.showTopLine ? '1.5px solid var(--rule)' : 'none';
  if (v.showNumberField || v.showDateField || v.customHeaderText || v.showTopLine) {
      let html = `<div class="page-header" style="display:flex; flex-direction:row; justify-content:space-between; align-items:flex-end; border-bottom: ${borderStyle};">`;
      html += (v.customHeaderText) ? `<div style="font-weight:800; font-size:12px; color:${v.headerColor || '#475569'}; flex:1; text-align:left; padding-right:8mm; padding-bottom:1mm;">${v.customHeaderText}</div>` : '<div style="flex:1;"></div>';
      if (n || d) html += '<div class="header-fields" style="width: auto; min-width: 33%; margin-left:0;">' + n + d + '</div>';
      return html + '</div>';
  } 
  return '<div class="page-header" style="visibility:hidden;margin-bottom:2mm;padding-bottom:1mm;"></div>';
}

function getFooterText(v) { 
    if (v.footerMode === 'nama-kelas') return (v.valId1 || '___') + ' | Kelas ' + (v.valId2 || '__'); 
    if (v.footerMode === 'nama-mapel') return (v.valId1 || '___') + ' | ' + (v.valId4 || 'Pelajaran'); 
    if (v.footerMode === 'custom') return v.customFooterText || 'Catatan Belajar'; 
    return (v.valId1 || '___') + ' | No. ' + (v.valId3 || '__'); 
}

function createHalfPage(p, v, d, isRightPage = true) { 
  const decoHTML = v.showDecoration ? '<div class="page-decoration">' + d[p % d.length] + '</div>' : '';
  let wmHTML = '';
  if (v.showWatermark) {
      if (v.watermarkType === 'text' && v.watermarkText) wmHTML = `<div class="page-watermark">${v.watermarkText}</div>`;
      else if (v.watermarkType === 'image' && state.watermarkImageBase64) wmHTML = `<img src="${state.watermarkImageBase64}" class="page-watermark-img" style="width:${v.sizeWatermarkImage}px;">`;
  }
  
  const footerHTML = v.showFooter ? `<div class="page-footer" style="color:${v.footerColor || '#475569'}; border-top-color:var(--rule);">${getFooterText(v)}</div>` : '';
  
  let padStyle = 'padding: 10mm;'; 
  if (v.kdpMode) {
      let M = 8; 
      if (v.useGutter) {
          padStyle = isRightPage ? `padding: ${M}mm ${M}mm ${M}mm calc(${KDP_CONFIG.gutter}mm + ${M}mm);` 
                                 : `padding: ${M}mm calc(${KDP_CONFIG.gutter}mm + ${M}mm) ${M}mm ${M}mm;`;
      } else {
          padStyle = `padding: ${M}mm;`;
      }
  }

  return `<div class="half-page" style="${padStyle}">` + createPageHeader(v) + wmHTML + getLineContentHTML(v.lineType, v) + decoHTML + footerHTML + (v.showPageNumber ? '<div class="page-number">' + p + '</div>' : '') + '</div>'; 
}

export function getCoverHTML() { 
    if(!$('cover-sheet')) return '';
    const cl = $('cover-sheet').cloneNode(true); 
    cl.className = 'sheet ' + Array.from($('cover-sheet').classList).join(' '); 
    cl.removeAttribute('id');
    cl.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    return cl.outerHTML; 
}

export function generatePages(saveState = true) {
  const v = getAllValues(SAMPUL_IDS, ISI_IDS); 
  const contentEl = $('bookContent');
  if(!contentEl) return;
  const cfg = THEME_CONFIG[v.themeSelect] || THEME_CONFIG['blank'];

  contentEl.style.setProperty('--line', v.lineColor || '#cbd5e1');
  contentEl.style.setProperty('--grid', v.lineColor || '#cbd5e1');
  contentEl.className = 'content ' + (cfg.cssClass || '');

  if (v.bgMode === 'theme') { contentEl.style.setProperty('--cover-front', `linear-gradient(135deg, ${cfg.grad[0]}, ${cfg.grad[1]})`); contentEl.style.setProperty('--cover-back', `linear-gradient(135deg, ${cfg.grad[1]}, ${cfg.grad[0]})`); contentEl.style.setProperty('--rule', cfg.color);
  } else if (v.bgMode === 'custom') { contentEl.style.setProperty('--cover-front', `linear-gradient(135deg, ${v.bgGrad1}, ${v.bgGrad2})`); contentEl.style.setProperty('--cover-back', `linear-gradient(135deg, ${v.bgGrad2}, ${v.bgGrad1})`); contentEl.style.setProperty('--rule', '#1B4332'); 
  } else { contentEl.style.setProperty('--cover-front', v.bgSolidFront); contentEl.style.setProperty('--cover-back', v.bgSolidBack); contentEl.style.setProperty('--rule', '#1B4332'); }

  updateCoverTexts(v, cfg); 
  let tot = v.totalPages === 'custom' ? (parseInt(v.customTotalPages) || 2) : parseInt(v.totalPages);
  const decos = cfg.decos || ['⭐'];
  
  if (v.kdpMode) {
      contentEl.classList.add('is-kdp-mode');
      const preset = KDP_CONFIG.presets[v.kdpPreset];
      let w = preset.w; let h = preset.h;
      if (v.useBleed) { w += KDP_CONFIG.bleed; h += (KDP_CONFIG.bleed * 2); }
      
      const clFrontEl = $('cover-sheet') ? $('cover-sheet').querySelector('.cover-front-half') : null;
      const clBackEl  = $('cover-sheet') ? $('cover-sheet').querySelector('.cover-back-half') : null;
      
      let frontHTML = clFrontEl ? clFrontEl.innerHTML : '';
      let backHTML  = clBackEl ? clBackEl.innerHTML : '';

      let padRightCover = v.useGutter ? `padding: 8mm 8mm 8mm calc(${KDP_CONFIG.gutter}mm + 8mm);` : 'padding: 8mm;';
      let padLeftCover  = v.useGutter ? `padding: 8mm calc(${KDP_CONFIG.gutter}mm + 8mm) 8mm 8mm;` : 'padding: 8mm;';
      
      // FITUR BARU: Menambahkan garis bantu Safe Zone KDP
      const marginSafe = KDP_CONFIG.bleed + 3.175; // Bleed + Margin aman 0.125 inch
      const gutterAdd = v.useGutter ? KDP_CONFIG.gutter : 0;
      const safeZoneRightCover = `<div class="kdp-safe-zone no-print" style="position: absolute; top: ${marginSafe}mm; bottom: ${marginSafe}mm; right: ${marginSafe}mm; left: calc(${marginSafe}mm + ${gutterAdd}mm); border: 1.5px dashed rgba(214, 140, 115, 0.6); border-radius: 4px; pointer-events: none; z-index: 100;"></div>`;
      const safeZoneLeftCover = `<div class="kdp-safe-zone no-print" style="position: absolute; top: ${marginSafe}mm; bottom: ${marginSafe}mm; left: ${marginSafe}mm; right: calc(${marginSafe}mm + ${gutterAdd}mm); border: 1.5px dashed rgba(214, 140, 115, 0.6); border-radius: 4px; pointer-events: none; z-index: 100;"></div>`;

      let coverHTML = '';
      coverHTML += `<div class="kdp-page right-page ${v.useGutter?'has-gutter':''} ${v.useBleed?'has-bleed':''}" style="width:${w}mm; height:${h}mm; background: var(--cover-front);">${safeZoneRightCover}<div class="half-page cover-front-half" style="${padRightCover} background: var(--cover-front) !important;">${frontHTML}</div></div>`;
      coverHTML += `<div class="kdp-page left-page ${v.useGutter?'has-gutter':''} ${v.useBleed?'has-bleed':''}" style="width:${w}mm; height:${h}mm; background: var(--cover-back);">${safeZoneLeftCover}<div class="half-page cover-back-half" style="${padLeftCover} background: var(--cover-back) !important;">${backHTML}</div></div>`;

      let isiHTML = '';
      for (let i = 1; i <= tot; i++) {
          const isRight = i % 2 !== 0;
          const alignClass = isRight ? 'right-page' : 'left-page';
          const safeZonePage = isRight ? safeZoneRightCover : safeZoneLeftCover;
          
          isiHTML += `<div class="kdp-page ${alignClass} ${v.useGutter?'has-gutter':''} ${v.useBleed?'has-bleed':''}" style="width:${w}mm; height:${h}mm;">` + safeZonePage + createHalfPage(i, v, decos, isRight) + `</div>`;
      }

      if($('sec-isi')) $('sec-isi').innerHTML = isiHTML;
      if($('sec-semua')) $('sec-semua').innerHTML = coverHTML + isiHTML;

  } else {
      contentEl.classList.remove('is-kdp-mode');
      let hHTML = ''; 
      for (let i = 1; i <= tot; i += 2) hHTML += '<div class="sheet">' + createHalfPage(i, v, decos, true) + ((i+1<=tot) ? createHalfPage(i+1, v, decos, false) : '<div class="half-page"><div class="blank-area"></div></div>') + '</div>';
      if($('sec-isi')) $('sec-isi').innerHTML = hHTML; 
      if($('sec-semua')) $('sec-semua').innerHTML = getCoverHTML() + hHTML;
  }

  applyZoom();
  if(saveState && state.isAppReady) pushHistory();
}