const jogo = {
    players: [],
    ordemTurno: [],
    turno: 0,
    rodada: 1,
    emCombate: false,
    modoEdicao: null // guarda o index do player ou null
};

const STORAGE_KEY = 'rpg-organizer';
const STORAGE_NOTAS = 'rpg-notas';

// salvar
function salvarJogo() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jogo.players));
}

// carregar
function carregarJogo() {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) return;

    const playersSalvos = JSON.parse(dados);

    // recria como instâncias da classe Player
    jogo.players = playersSalvos.map(p => {
        const player = new Player(p.nome, p.vida, p.iniciativa, p.aliado, p.imagem);
        player.vidaAtual = p.vidaAtual;
        player.vivo = p.vivo;
        player.status = p.status || [];
        return player;
    });
}

// ================= UTIL =================

function abrirModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'block';
    document.body.classList.add('blur-active');
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'none';
    document.body.classList.remove('blur-active');

    if (modal.tagName === 'FORM') {
        modal.reset();
        validarFormularioPlayer(); // 🔥 garante estado correto
    }
}

carregarJogo();
renderPlayers();
validarFormularioPlayer();