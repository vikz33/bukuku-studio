export const THEME_CONFIG = {
  blank:  { frontDeco: '📝', backDeco: '📓', frontTitle: 'Notebook', frontSubtitle: 'Simple & Clean', backTitle: 'Notes', backSubtitle: 'Selesai', decos: ['⭐'], cssClass: 'book-blank', color: '#1B4332', grad: ['#F5F2ED', '#F5F2ED'] },
  flower: { frontDeco: '🌸✨', backDeco: '🌿', frontTitle: 'Buku Catatanku', frontSubtitle: 'My Lovely Notebook', backTitle: 'Terima Kasih', backSubtitle: 'Semangat Belajar! 💪', decos: ['🐰','🌸','🦊','⭐','🎀','🐱','🌈','🦋','💖','🍀','🐣','🎨'], cssClass: '', color: '#D68C73', grad: ['#FFEDEB', '#F5F2ED'] },
  grandprix:{ frontDeco: '🏎️🏁', backDeco: '🚥', frontTitle: 'Race Log', frontSubtitle: 'Full Throttle!', backTitle: 'Pit Stop', backSubtitle: 'Rest & Race Again', decos: ['🏎️','🏁','🚥','🏆','⏱️','⚙️'], cssClass: 'book-space', color: '#ea580c', grad: ['#ea580c', '#1e293b'] },
  matchday: { frontDeco: '⚽🏆', backDeco: '🥅', frontTitle: 'Match Tactic', frontSubtitle: 'Play Hard, Win Smart!', backTitle: 'Final Whistle', backSubtitle: 'Good Game!', decos: ['⚽','🏆','👟','🥅','🥇','🏟️'], cssClass: 'book-space', color: '#7f1d1d', grad: ['#7f1d1d', '#f1f5f9'] },
  space:  { frontDeco: '🚀🌌', backDeco: '🪐', frontTitle: 'Buku Catatanku', frontSubtitle: 'My Space Notebook', backTitle: 'Ad Astra', backSubtitle: 'Terus Belajar! 🌟', decos: ['🚀','🌟','🪐','👽','🛸','🌌','☄️','🌙','⭐','🔭','🛰️','💫'], cssClass: 'book-space', color: '#312e81', grad: ['#0b1029', '#312e81'] },
  urban:  { frontDeco: '🌱🪴', backDeco: '🍅', frontTitle: 'Jurnal Hijau', frontSubtitle: 'Tumbuh Setiap Hari 🌱', backTitle: 'Panen', backSubtitle: 'Rawat Terus Alammu', decos: ['🌱','🌿','🪴','💧','🌞','🍅'], cssClass: '', color: '#1B4332', grad: ['#E8F3EE', '#F5F2ED'] },
  zen:    { frontDeco: '🍵⛩️', backDeco: '🌸', frontTitle: 'Catatan Fokus', frontSubtitle: 'Sederhana & Rapi 🍵', backTitle: 'Owari', backSubtitle: 'Kedamaian Pikiran', decos: ['⛩️','🍵','🎋','🍙','🎌','🌸'], cssClass: '', color: '#45322E', grad: ['#FDF6E3', '#F5F2ED'] }
};

export const ALL_EMOJIS = ['📖','✨','🌸','🚀','🪐','💻','💡','⚽','🏀','🎸','🎨','✏️','📚','🎓','🔥','🌟','💖','🌿','🍀','🐱','🦊','🐰','🌍','🏆','🎯','🎵','🍉','🚗','✈️','🌈'];
export const LINES_PER_PAGE = 24; 
export const PAPER_A4 = { w: 297, h: 210 }; 
export const PAD_LR = 24; 
export const PAD_TB = 44; 

export const KDP_CONFIG = {
  presets: {
    '6x9': { w: 152.4, h: 228.6, label: '6" x 9" (Standard)' },
    '8.5x11': { w: 215.9, h: 279.4, label: '8.5" x 11" (Large)' }
  },
  bleed: 3.175, 
  gutter: 9.525 
};

export const INITIAL_POSITIONS = {
  coverFrontDeco: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '15%' },
  coverBackDeco: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '30%' },
  coverFrontTitle: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '40%' },
  coverBackTitle: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '45%' },
  coverFrontSubtitle: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '50%' },
  coverBackSubtitle: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '55%' },
  coverFrontFields: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '70%' },
  coverFrontImage: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '60%' },
  coverBackImage: { defaultX: '-50%', defaultY: '0px', dx: 0, dy: 0, rawX: '50%', rawY: '60%' }
};

export const SAMPUL_IDS = ['inputFrontTitle','inputFrontSubtitle','inputBackTitle','inputBackSubtitle','fontTitleFront','fontSubtitleFront','fontTitleBack','fontSubtitleBack','sizeTitleFront','sizeTitleBack','sizeSubtitleFront','sizeSubtitleBack','sizeDecoFront','sizeDecoBack','bgGrad1','bgGrad2','bgSolidFront','bgSolidBack','labelBgMode','labelBgColor','colorLabels','inputFrontDeco','inputBackDeco','themeSelect','colorFrontTitle','colorFrontSubtitle','colorBackTitle','colorBackSubtitle','sizeFrontImage','sizeBackImage','showFrontImage','showBackImage','showCoverDecoFront','showCoverDecoBack', 'alignFrontTitle','alignFrontSubtitle','alignBackTitle','alignBackSubtitle', 'showId1','labelId1','valId1','showId2','labelId2','valId2','showId3','labelId3','valId3','showId4','labelId4','valId4'];
export const ISI_IDS = ['layoutType','lineType','footerMode','customFooterText','customHeaderText','lineColor','watermarkText','watermarkType','sizeWatermarkImage','showPageNumber','showDateField','showNumberField','showFooter','showDecoration','showWatermark','totalPages','customTotalPages','showHeader','headerColor','footerColor','showTopLine', 'kdpPreset', 'useBleed', 'useGutter'];