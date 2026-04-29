import { INITIAL_POSITIONS } from './config.js';

export const state = {
    currentTab: 'sampul',
    currentZoom: 0.9,
    frontImageBase64: '',
    backImageBase64: '',
    watermarkImageBase64: '',
    POSITIONS: JSON.parse(JSON.stringify(INITIAL_POSITIONS)),
    isAppReady: false,
    activeEmojiInput: null
};