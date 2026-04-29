export const $ = (id) => document.getElementById(id);

export function getAllValues(SAMPUL_IDS, ISI_IDS) { 
  let vals = {};
  let bgEl = document.querySelector('input[name="bgMode"]:checked');
  if (bgEl) vals.bgMode = bgEl.value;
  [...SAMPUL_IDS, ...ISI_IDS].forEach(id => {
      let el = $(id);
      if(el) vals[id] = el.type === 'checkbox' ? el.checked : el.value;
  });
  return vals;
}

export function setExportStatus(msg) { 
    const el = $('exportStatus');
    if (el) el.textContent = msg; 
}