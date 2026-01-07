const { ipcRenderer } = require('electron');

// --- CONFIGURAÇÃO DE ÁUDIO ---
const alarme = new Audio('alarme.mp3'); alarme.loop = true;
const somFervendo = new Audio('fervendo.mp3'); somFervendo.loop = true; somFervendo.volume = 0;
const somClick = new Audio('click.mp3'); somClick.volume = 0.15; 
const musicaFofa = new Audio('musica_fofa.mp3'); musicaFofa.loop = true; musicaFofa.volume = 0.3;

// --- INICIALIZAÇÃO DA MÚSICA ---
window.addEventListener('DOMContentLoaded', () => {
    musicaFofa.play().catch(() => {
        document.body.addEventListener('click', () => musicaFofa.play(), { once: true });
    });
});

let timer;
let timeLeft;
let telaAtual = 'start';
let timerPausado = false;

// --- FUNÇÃO DE FADE (TRANSIÇÃO SOFT) ---
function fadeAudio(audioOut, audioIn, finalVolumeIn = 0.5) {
    const step = 0.02;
    const interval = 50; 
    const fadeOut = setInterval(() => {
        if (audioOut && audioOut.volume > step) {
            audioOut.volume -= step;
        } else {
            if (audioOut) { audioOut.pause(); audioOut.volume = 0; }
            clearInterval(fadeOut);
        }
    }, interval);

    if (audioIn) {
        audioIn.volume = 0;
        audioIn.play();
        const fadeIn = setInterval(() => {
            if (audioIn.volume < finalVolumeIn) {
                audioIn.volume += step;
            } else {
                audioIn.volume = finalVolumeIn;
                clearInterval(fadeIn);
            }
        }, interval);
    }
}

// --- NAVEGAÇÃO ---
function trocarTela(idSumir, idAparecer) {
    document.getElementById(idSumir).style.display = 'none';
    document.getElementById(idAparecer).style.display = 'block';
}

function tocarClick() {
    somClick.pause(); somClick.currentTime = 0; somClick.play();
}

function mostrarTimer() {
    tocarClick();
    telaAtual = 'selection';
    gerenciarBotaoVoltar(true);
    trocarTela('start-screen', 'timer-screen');
}

function start(seconds) {
    tocarClick();
    fadeAudio(musicaFofa, somFervendo, 0.5);
    telaAtual = 'countdown';
    gerenciarBotaoVoltar(true);
    trocarTela('timer-screen', 'countdown-screen');
    timeLeft = seconds;
    timerPausado = false;
    iniciarIntervalo();
}

function iniciarIntervalo() {
    clearInterval(timer);
    updateDisplay(timeLeft);
    timer = setInterval(() => {
        if (!timerPausado) {
            timeLeft--;
            updateDisplay(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                ipcRenderer.send('mostrar-janela'); 
                fadeAudio(somFervendo, alarme, 0.7);
                telaAtual = 'done';
                gerenciarBotaoVoltar(false);
                trocarTela('countdown-screen', 'aviso');
            }
        }
    }, 1000);
}

// --- BOTÕES E SISTEMA ---
function botaoVoltarGeral() {
    tocarClick();
    if (telaAtual === 'selection') {
        trocarTela('timer-screen', 'start-screen');
        telaAtual = 'start';
        gerenciarBotaoVoltar(false);
    } else if (telaAtual === 'countdown') {
        timerPausado = true;
        somFervendo.pause();
        document.getElementById('modal-desistir').style.display = 'flex';
    }
}

function confirmarDesistencia() {
    tocarClick();
    clearInterval(timer);
    fadeAudio(somFervendo, musicaFofa, 0.3);
    document.getElementById('modal-desistir').style.display = 'none';
    trocarTela('countdown-screen', 'timer-screen');
    telaAtual = 'selection';
    gerenciarBotaoVoltar(true);
}

function continuarCronometrando() {
    tocarClick();
    document.getElementById('modal-desistir').style.display = 'none';
    timerPausado = false;
    somFervendo.play();
}

function voltarParaSelecao() {
    tocarClick();
    fadeAudio(alarme, musicaFofa, 0.3);
    telaAtual = 'selection'; 
    gerenciarBotaoVoltar(true);
    trocarTela('aviso', 'timer-screen');
}

function minimizarApp() { tocarClick(); ipcRenderer.send('minimizar-app'); }
function abrirPerguntaSair() { tocarClick(); document.getElementById('modal-sair').style.display = 'flex'; }
function fecharPerguntaSair() { tocarClick(); document.getElementById('modal-sair').style.display = 'none'; }
function fecharAppReal() { window.close(); }

function gerenciarBotaoVoltar(mostrar) {
    document.getElementById('back-btn').style.visibility = mostrar ? 'visible' : 'hidden';
}

function updateDisplay(s) {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    document.getElementById('display').innerText = `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}