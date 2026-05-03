import { THEME_CONFIG, SAMPUL_IDS, ISI_IDS, KDP_CONFIG } from './config.js';
import { $, getAllValues, setExportStatus } from './utils.js';

export async function exportPDF() {
    const b = $('exportPdfBtn');
    if (b) b.disabled = true; 
    
    const targetVal = $('exportTarget') ? $('exportTarget').value : 'semua';
    const isKDP = $('layoutType') && $('layoutType').value === 'kdp';
    const t = isKDP ? $('sec-semua') : (targetVal === 'sampul' ? $('sec-sampul') : (targetVal === 'isi' ? $('sec-isi') : $('sec-semua')));
    
    const jsPDFLib = window.jspdf ? window.jspdf.jsPDF : null;
    if (!window.html2canvas || !jsPDFLib || !t) { 
        setExportStatus('Sistem PDF belum siap atau target kosong.'); 
        if (b) b.disabled = false;
        return; 
    }
    
    // ==========================================
    // TAMPILKAN MODAL ANIMASI LOADING
    // ==========================================
    const modal = $('exportModal');
    const updateProgressText = (text) => {
        if ($('exportProgressText')) $('exportProgressText').textContent = text;
        setExportStatus(text);
    };

    if (modal) modal.classList.add('show');
    updateProgressText('Menyiapkan kanvas cetak resolusi tinggi...'); 
    
    const contentEl = $('bookContent');
    const h = document.createElement('div'); 
    h.id = 'bookContent'; 
    h.style.position = 'fixed'; h.style.left = '0'; h.style.top = '0'; h.style.zIndex = '-9999'; h.style.backgroundColor = '#ffffff';
    
    document.body.appendChild(h);
    document.body.classList.add('exporting-pdf'); 
    
    try {
        let finalW, finalH, pagesToExport;
        const v = getAllValues(SAMPUL_IDS, ISI_IDS);
        const cfg = THEME_CONFIG[v.themeSelect] || THEME_CONFIG['blank'];
        const currentLineColor = v.lineColor || '#cbd5e1';
        
        h.className = 'content ' + (cfg.cssClass || '');
        if (contentEl) {
            h.style.setProperty('--cover-front', contentEl.style.getPropertyValue('--cover-front'));
            h.style.setProperty('--cover-back', contentEl.style.getPropertyValue('--cover-back'));
            h.style.setProperty('--cover-label', contentEl.style.getPropertyValue('--cover-label'));
        }
        h.style.setProperty('--line', currentLineColor);
        h.style.setProperty('--grid', currentLineColor);
        h.style.setProperty('--rule', cfg.color || '#1B4332');

        if (isKDP) {
            const preset = KDP_CONFIG.presets[v.kdpPreset];
            finalW = preset.w; finalH = preset.h;
            if (v.useBleed) { finalW += KDP_CONFIG.bleed; finalH += (KDP_CONFIG.bleed * 2); }
            pagesToExport = Array.from(t.querySelectorAll('.kdp-page'));
        } else {
            finalW = 297; finalH = 210;
            pagesToExport = Array.from(t.querySelectorAll('.sheet'));
        }

        if (!pagesToExport.length) throw new Error('Halaman Kosong.');
        
        const pdf = new jsPDFLib({ 
            orientation: isKDP ? 'portrait' : 'landscape', 
            unit: 'mm', 
            format: [finalW, finalH], 
            compress: true 
        });
        
        for (let i = 0; i < pagesToExport.length; i++) {
            // Update teks animasi saat memproses per halaman
            updateProgressText(`Memproses Halaman ${i + 1} dari ${pagesToExport.length}...`);
            
            const c = pagesToExport[i].cloneNode(true); 
            
            c.style.margin = '0'; c.style.boxShadow = 'none'; c.style.borderRadius = '0'; c.style.transform = 'none'; 
            c.style.width = `${finalW}mm`; c.style.height = `${finalH}mm`;
            c.style.maxWidth = 'none'; c.style.maxHeight = 'none';
            h.innerHTML = ''; h.appendChild(c);
            
            c.querySelectorAll('.draggable-item').forEach(d => { d.style.border = 'none'; d.style.background = 'transparent'; });
            
            const cvs = await html2canvas(c, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff', 
                logging: false,
                width: c.offsetWidth,
                height: c.offsetHeight
            });
            
            if (i > 0) pdf.addPage([finalW, finalH], isKDP ? 'portrait' : 'landscape'); 
            pdf.addImage(cvs.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, finalW, finalH, undefined, 'FAST');
            
            // Berikan jeda nafas pada memori (browser tidak hang)
            await new Promise(r => setTimeout(r, 150)); 
        }
        
        updateProgressText(`Menyimpan file PDF ke perangkat Anda...`);
        const prefix = isKDP ? 'kdp-' : '';
        const fn = `${prefix}${(v.valId1 || 'buku').trim().replace(/[^a-z0-9]+/gi, '-')}.pdf`.toLowerCase();
        pdf.save(fn); 
        
        updateProgressText('PDF Berhasil Diunduh!');
        
    } catch (e) { 
        console.error(e); 
        updateProgressText('Gagal ekspor. Periksa aset gambar.'); 
    } finally { 
        document.body.classList.remove('exporting-pdf');
        h.remove(); 
        if (b) b.disabled = false; 
        
        // Sembunyikan modal setelah 1.5 detik
        setTimeout(() => {
            if (modal) modal.classList.remove('show');
        }, 1500);
    }
}