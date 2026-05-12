const state = {
    answer: null,
    currentNoteIndex: null,
    audioContext: null
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES = generateNotes(3, 5);

function getFrequency(name, octave) {
    const index = NOTE_NAMES.indexOf(name);
    const semitoneFromA4 = index - 9 + (octave - 4) * 12;
    return 440 * Math.pow(2, semitoneFromA4 / 12);
}

function generateNotes(minOctave, maxOctave) {
    const notes = [];
    for (let octave = minOctave; octave <= maxOctave; octave++) {
        NOTE_NAMES.forEach((noteName, noteIndex) => {
            notes.push({
                name: `${noteName}${octave}`,
                semitone: noteIndex + octave * 12,
                freq: getFrequency(noteName, octave)
            });
        });
    }
    return notes;
}

const gameType = document.body.dataset.game;
const feedbackEl = document.getElementById('feedback');
const answerForm = document.getElementById('answer-form');
const answerInput = document.getElementById('answer-input');
const inputR = document.getElementById('input-r');
const inputG = document.getElementById('input-g');
const inputB = document.getElementById('input-b');
const noteInput = document.getElementById('answer-note');
const playBtn = document.getElementById('play-note-btn');
const canvas = document.getElementById('visual-canvas');
const colorSwatch = document.getElementById('color-swatch');
const noteCanvas = document.getElementById('note-keyboard');
const retryBtn = document.getElementById('retry-btn');

function initGame() {
    attachListeners();
    loadProblem();
}

function attachListeners() {
    if (answerForm) {
        answerForm.addEventListener('submit', event => {
            event.preventDefault();
            handleSubmit();
        });
    }

    if (retryBtn) retryBtn.addEventListener('click', () => {
        loadProblem();
    });
    if (playBtn) playBtn.addEventListener('click', playCurrentNote);
}

function loadProblem() {
    clearFeedback();
    resetInputs();

    if (gameType === 'angle') setupAngleProblem();
    else if (gameType === 'length') setupLengthProblem();
    else if (gameType === 'color') setupColorProblem();
    else if (gameType === 'note') setupNoteProblem();
}

function retryAnswer() {
    clearFeedback();
    resetInputs();
    feedbackEl.textContent = '다시 입력해 보세요.';
}

function revealAnswer() {
    if (gameType === 'angle') feedbackEl.textContent = `정답: ${state.answer}° 입니다.`;
    else if (gameType === 'length') feedbackEl.textContent = `정답: ${state.answer.toFixed(1)} cm 입니다.`;
    else if (gameType === 'color') feedbackEl.textContent = `정답: R ${state.answer.r}, G ${state.answer.g}, B ${state.answer.b}`;
    else if (gameType === 'note') feedbackEl.textContent = `정답: ${state.answer}`;
}

function clearFeedback() {
    if (feedbackEl) feedbackEl.textContent = '';
}

function resetInputs() {
    if (answerInput) answerInput.value = '';
    if (inputR) inputR.value = '';
    if (inputG) inputG.value = '';
    if (inputB) inputB.value = '';
    if (noteInput) noteInput.value = '';
}

function setupAngleProblem() {
    state.answer = Math.floor(Math.random() * 321) + 20;
    drawAngleCanvas(state.answer);
    if (feedbackEl) feedbackEl.textContent = '선을 보고 각도를 맞혀보세요.';
}

function drawAngleCanvas(angle) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f7f8fd';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#b4bfdc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#d8dce9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    ctx.strokeStyle = '#5d7cff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const rad = angle * (Math.PI / 180);
    ctx.lineTo(centerX + Math.cos(rad) * radius, centerY - Math.sin(rad) * radius);
    ctx.stroke();

    ctx.fillStyle = '#4f6ef7';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2a3252';
    ctx.font = '600 14px Arial';
    ctx.fillText('기준선', centerX + radius - 18, centerY + 22);
}

function setupLengthProblem() {
    state.answer = parseFloat((Math.random() * 10 + 5).toFixed(1));
    drawLengthCanvas(state.answer);
    if (feedbackEl) feedbackEl.textContent = '1cm 기준선과 비교해 전체 길이를 맞혀보세요.';
}

function drawLengthCanvas(lengthCm) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const left = 30;
    const top = height * 0.55;
    const unitPx = 24;
    const lineLengthPx = Math.min(lengthCm * unitPx, width - left - 40);
    const refX = width - 130;
    const refY = top - 42;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f7f8fd';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#d8dce9';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + lineLengthPx, top);
    ctx.stroke();

    ctx.strokeStyle = '#18203d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, top - 18);
    ctx.lineTo(left, top + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left + lineLengthPx, top - 18);
    ctx.lineTo(left + lineLengthPx, top + 18);
    ctx.stroke();

    ctx.strokeStyle = '#5d7cff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(refX, refY);
    ctx.lineTo(refX + unitPx, refY);
    ctx.stroke();

    ctx.strokeStyle = '#18203d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(refX, refY - 10);
    ctx.lineTo(refX, refY + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(refX + unitPx, refY - 10);
    ctx.lineTo(refX + unitPx, refY + 10);
    ctx.stroke();

    ctx.fillStyle = '#2a3252';
    ctx.font = '600 13px Arial';
    ctx.fillText('1cm 기준', refX, refY - 14);
    ctx.font = '700 14px Arial';
    ctx.fillText('이 선의 길이를 맞혀보세요', left, refY + 28);
}

function drawNoteKeyboard() {
    if (!noteCanvas) return;
    const ctx = noteCanvas.getContext('2d');
    const width = noteCanvas.width;
    const height = noteCanvas.height;
    const whiteCount = 14;
    const whiteWidth = width / whiteCount;
    const blackWidth = whiteWidth * 0.6;
    const blackHeight = height * 0.58;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f7f8fd';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#9aa3c8';
    ctx.lineWidth = 1;
    for (let i = 0; i < whiteCount; i++) {
        const x = i * whiteWidth;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, 0, whiteWidth, height);
        ctx.strokeRect(x, 0, whiteWidth, height);
    }

    const blackOffsets = [0.72, 1.72, 3.72, 4.72, 5.72, 7.72, 8.72, 10.72, 11.72, 12.72];
    ctx.fillStyle = '#222';
    for (const offset of blackOffsets) {
        const x = offset * whiteWidth;
        ctx.fillRect(x, 0, blackWidth, blackHeight);
        ctx.strokeRect(x, 0, blackWidth, blackHeight);
    }

    ctx.fillStyle = '#2a3252';
    ctx.font = '600 13px Arial';
    ctx.fillText('C3–B5 음역 중 하나', 12, height - 10);
}

function setupColorProblem() {
    state.answer = {
        r: Math.floor(Math.random() * 216) + 20,
        g: Math.floor(Math.random() * 216) + 20,
        b: Math.floor(Math.random() * 216) + 20
    };
    if (colorSwatch) colorSwatch.style.background = `rgb(${state.answer.r}, ${state.answer.g}, ${state.answer.b})`;
    if (feedbackEl) feedbackEl.textContent = '색을 보고 R, G, B 값을 맞혀보세요.';
}

function setupNoteProblem() {
    state.currentNoteIndex = Math.floor(Math.random() * NOTES.length);
    state.answer = NOTES[state.currentNoteIndex].name;
    if (feedbackEl) feedbackEl.textContent = '들려주는 음을 듣고 음 이름을 입력하세요.';
    drawNoteKeyboard();
}

function handleSubmit() {
    if (gameType === 'angle') return submitAngle();
    if (gameType === 'length') return submitLength();
    if (gameType === 'color') return submitColor();
    if (gameType === 'note') return submitNote();
}

function submitAngle() {
    const guess = parseFloat(answerInput?.value);
    if (Number.isNaN(guess)) {
        feedbackEl.textContent = '숫자로 된 각도 값을 입력하세요.';
        return;
    }
    const diff = Math.abs(guess - state.answer);
    if (diff === 0) feedbackEl.textContent = `정답입니다! 차이 ${diff.toFixed(1)}°입니다.`;
    else feedbackEl.textContent = `정답과 ${diff.toFixed(1)}° 차이입니다.`;
}

function submitLength() {
    const guess = parseFloat(answerInput?.value);
    if (Number.isNaN(guess)) {
        feedbackEl.textContent = '센티미터 단위 숫자를 입력하세요.';
        return;
    }
    const diff = Math.abs(guess - state.answer);
    if (diff < 0.05) feedbackEl.textContent = `정답입니다! 차이 ${diff.toFixed(1)} cm입니다.`;
    else feedbackEl.textContent = `정답과 ${diff.toFixed(1)} cm 차이입니다.`;
}

function submitColor() {
    const r = parseInt(inputR?.value, 10);
    const g = parseInt(inputG?.value, 10);
    const b = parseInt(inputB?.value, 10);
    if ([r, g, b].some(value => Number.isNaN(value) || value < 0 || value > 255)) {
        feedbackEl.textContent = '0에서 255 사이의 R, G, B 값을 모두 입력하세요.';
        return;
    }
    const dr = Math.abs(r - state.answer.r);
    const dg = Math.abs(g - state.answer.g);
    const db = Math.abs(b - state.answer.b);
    if (dr === 0 && dg === 0 && db === 0) {
        feedbackEl.textContent = '정답입니다! 정확하게 RGB 값을 맞히셨습니다.';
    } else {
        feedbackEl.textContent = `정답과 R ${dr}, G ${dg}, B ${db} 차이입니다.`;
    }
}

function submitNote() {
    const guess = (noteInput?.value || '').trim().toUpperCase();
    if (!guess) {
        feedbackEl.textContent = '예: C3 또는 D#4 형식으로 입력하세요.';
        return;
    }
    const guessed = NOTES.find(note => note.name === guess);
    if (!guessed) {
        feedbackEl.textContent = '알 수 없는 음입니다. C3~B5 범위의 음 이름을 입력하세요.';
        return;
    }
    const answerNote = NOTES[state.currentNoteIndex];
    if (guess === answerNote.name) {
        feedbackEl.textContent = `정답입니다! 들려준 음은 ${answerNote.name} 입니다.`;
        return;
    }
    const diff = Math.abs(guessed.semitone - answerNote.semitone);
    feedbackEl.textContent = `정답과 ${diff} 반음 차이입니다.`;
}

function playCurrentNote() {
    if (gameType !== 'note') return;
    if (!state.currentNoteIndex && state.currentNoteIndex !== 0) return;

    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = state.audioContext.currentTime;
    const frequency = NOTES[state.currentNoteIndex].freq;

    const osc1 = state.audioContext.createOscillator();
    const osc2 = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    const filter = state.audioContext.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.value = frequency;

    osc2.type = 'sine';
    osc2.frequency.value = frequency * 2.003;
    osc2.detune.value = -8;

    filter.type = 'lowpass';
    filter.frequency.value = 2400;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(state.audioContext.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);

    osc2.onended = () => {
        if (feedbackEl && !feedbackEl.textContent) {
            feedbackEl.textContent = '음이 재생되었습니다. 답을 입력해 보세요.';
        }
    };
}

window.addEventListener('DOMContentLoaded', initGame);
