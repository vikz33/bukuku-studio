import { $ } from './utils.js';
import { state } from './state.js';
import { generatePages } from './render.js';

export function makeDraggable(el) {
  let isDragging = false; let startX, startY; let clampedDx = 0, clampedDy = 0;
  
  const start = (e) => {
    isDragging = true; const event = e.type.includes('mouse') ? e : e.touches[0]; 
    startX = event.clientX; startY = event.clientY;
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', move, {passive: false}); document.addEventListener('touchend', end);
  };
  
  const move = (e) => {
    if (!isDragging) return; e.preventDefault(); const event = e.type.includes('mouse') ? e : e.touches[0];
    const currentDx = (event.clientX - startX) / state.currentZoom; 
    const currentDy = (event.clientY - startY) / state.currentZoom;
    const totalDx = state.POSITIONS[el.id].dx + currentDx; 
    const totalDy = state.POSITIONS[el.id].dy + currentDy;
    const limitX = el.parentElement.clientWidth / 2 - 20; 
    const limitY = el.parentElement.clientHeight / 2 - 20;
    
    clampedDx = Math.round(Math.max(-limitX, Math.min(limitX, totalDx)) / 10) * 10;
    clampedDy = Math.round(Math.max(-limitY, Math.min(limitY, totalDy)) / 10) * 10;
    
    $('guide-y').style.display = (clampedDx === 0) ? 'block' : 'none'; 
    $('guide-x').style.display = (clampedDy === 0) ? 'block' : 'none';
    el.style.transform = `translate(calc(${state.POSITIONS[el.id].defaultX} + ${clampedDx}px), calc(${state.POSITIONS[el.id].defaultY} + ${clampedDy}px))`;
  };
  
  const end = () => {
    isDragging = false; $('guide-y').style.display = 'none'; $('guide-x').style.display = 'none';
    if(state.POSITIONS[el.id].dx !== clampedDx || state.POSITIONS[el.id].dy !== clampedDy) { 
        state.POSITIONS[el.id].dx = clampedDx; 
        state.POSITIONS[el.id].dy = clampedDy; 
        generatePages(true); 
    }
    document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', end); 
    document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end);
  };
  
  el.addEventListener('mousedown', start); el.addEventListener('touchstart', start, {passive: false});
}