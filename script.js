const jogo = {
    players: [],
    ordemTurno: [],
    turno: 0,
    rodada: 1,
    emCombate: false
};

const STORAGE_KEY = 'rpg-organizer';

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
        const player = new Player(p.nome, p.vida, p.iniciativa, p.aliado);
        player.vidaAtual = p.vidaAtual;
        player.vivo = p.vivo;
        player.status = p.status || [];
        return player;
    });
}

class Player {
    constructor(nome, vida, iniciativa, aliado) {
        this.nome = nome;
        this.vida = Number(vida);
        this.vidaAtual = this.vida;
        this.iniciativa = Number(iniciativa);
        this.aliado = aliado;
        this.vivo = true;
        this.status = [];
    }

    sofrerDano(dano) {
        this.vidaAtual -= dano;
        if (this.vidaAtual <= 0) {
            this.vidaAtual = 0;
            this.vivo = false;
        }
    }
}

// ================= UTIL =================

function abrirModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'block';
    document.body.classList.add('blur-active');

    if (modal.tagName === 'FORM') {
        modal.reset();
    }
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'none';
    document.body.classList.remove('blur-active');

    if (modal.tagName === 'FORM') {
        modal.reset();
    }
}

function adicionarLog(texto, tipo = 'sistema') {
    const log = document.getElementById('log-combate');

    const p = document.createElement('p');
    p.textContent = texto;
    p.classList.add(`log-${tipo}`);

    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

// ================= RENDER =================

function renderPlayers() {
    const aliados = document.getElementById('Aliados');
    const inimigos = document.getElementById('Inimigos');

    aliados.innerHTML = '';
    inimigos.innerHTML = '';

    jogo.players.forEach(player => {
        const card = document.createElement('article');
        card.classList.add('player-card');

        if (!player.vivo) card.classList.add('morto');

        if (jogo.emCombate &&
            jogo.ordemTurno[jogo.turno]?.player === player) {
            card.classList.add('ativo');
        }

        // 🔥 AQUI
        const porcentagem = (player.vidaAtual / player.vida) * 100;

        let cor = '#4caf50';
        if (porcentagem <= 50) cor = '#ff9800';
        if (porcentagem <= 25) cor = '#f44336';

        // 👇 usa aqui
        card.innerHTML = `
            <div class="iniciativa">${player.iniciativa}</div>

            <strong>${player.nome}</strong>

            <div>
                <div class="barra-vida">
                    <span style="width: ${porcentagem}%; background: ${cor}"></span>
                </div>
                <small>${player.vidaAtual}/${player.vida} HP</small>
            </div>

            <small>${player.status.join(', ') || 'Sem status'}</small>
        `;

        player.aliado
            ? aliados.appendChild(card)
            : inimigos.appendChild(card);
    });
}

function renderRodada() {
    const rodadaEl = document.getElementById('rodada');

    if (!jogo.emCombate) {
        rodadaEl.textContent = 'Rodada 0';
        document.getElementById('rodada-player').textContent = '';
        return;
    }

    rodadaEl.textContent = `Rodada ${jogo.rodada}`;
    document.getElementById('rodada-player').textContent =
        jogo.ordemTurno[jogo.turno].player.nome;
}

// ================= COMBATE =================

function iniciarCombate() {
    if (jogo.players.length === 0) {
        alert("Adicione players primeiro!");
        return;
    }

    jogo.ordemTurno = jogo.players
        .map(p => ({ player: p }))
        .sort((a, b) => b.player.iniciativa - a.player.iniciativa);

    jogo.turno = 0;
    jogo.rodada = 1;
    jogo.emCombate = true;

    document.body.classList.add('modo-combate');
    document.getElementById('botoes').style.display = 'none';

    renderRodada();
    renderPlayers();
}

function finalizarCombate() {
    jogo.emCombate = false;
    jogo.ordemTurno = [];
    jogo.turno = 0;
    jogo.rodada = 1;

    document.body.classList.remove('modo-combate');
    document.getElementById('botoes').style.display = 'block';

    adicionarLog("Combate finalizado");

    renderPlayers();
    renderRodada();
}

function proximoTurno() {
    if (!jogo.emCombate) return;

    do {
        jogo.turno++;
        if (jogo.turno >= jogo.ordemTurno.length) {
            jogo.turno = 0;
            jogo.rodada++;
        }
    } while (!jogo.ordemTurno[jogo.turno].player.vivo);

    renderRodada();
    renderPlayers();
}

// ================= ATAQUE =================

function abrirModalAtaque() {
    const select = document.getElementById('alvo');
    select.innerHTML = '';

    const atacante = jogo.ordemTurno[jogo.turno].player;

    jogo.players.forEach((p, i) => {
        if (p.vivo && p !== atacante) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = p.nome;
            select.appendChild(opt);
        }
    });

    abrirModal('modal-ataque');
}

function confirmarAtaque() {
    const alvoIndex = Number(document.getElementById('alvo').value);
    const dano = Number(document.getElementById('dano').value);
    const status = document.getElementById('status').value.trim();

    if (isNaN(alvoIndex) || isNaN(dano)) {
        alert("Preencha corretamente!");
        return;
    }

    const atacante = jogo.ordemTurno[jogo.turno].player;
    const alvo = jogo.players[alvoIndex];

    if (!alvo) return;

    alvo.sofrerDano(dano);
    salvarJogo();

    adicionarLog(`${atacante.nome} causou ${dano} em ${alvo.nome}`, 'ataque');

    if (!alvo.vivo) {
        adicionarLog(`${alvo.nome} morreu!`, 'morte');
    }

    if (status) {
        alvo.status.push(status);
        salvarJogo();
        adicionarLog(`${alvo.nome} está ${status}`, 'status');
    }

    fecharModal('modal-ataque');
    renderPlayers();
}

// ================= STATUS =================

function abrirModalStatus() {
    const select = document.getElementById('player-status');
    select.innerHTML = '';

    jogo.players.forEach((p, i) => {
        if (p.status.length > 0) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = p.nome;
            select.appendChild(opt);
        }
    });

    if (select.options.length === 0) {
        alert("Nenhum status disponível");
        return;
    }

    atualizarListaStatus();
    abrirModal('modal-status');
}

function atualizarListaStatus() {
    const playerIndex = document.getElementById('player-status').value;
    const lista = document.getElementById('lista-status');

    lista.innerHTML = '';

    const player = jogo.players[playerIndex];
    if (!player) return;

    player.status.forEach((s, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = s;
        lista.appendChild(opt);
    });
}

function removerStatus() {
    const playerIndex = document.getElementById('player-status').value;
    const statusIndex = document.getElementById('lista-status').value;

    const player = jogo.players[playerIndex];
    if (!player) return;

    const removido = player.status.splice(statusIndex, 1)[0];
    salvarJogo();

    adicionarLog(`${removido} removido de ${player.nome}`);

    fecharModal('modal-status');
    renderPlayers();
}

// ================= OUTROS =================

function removerMortos() {
    jogo.players = jogo.players.filter(p => p.vivo);
    salvarJogo();
    adicionarLog("Mortos removidos");
    renderPlayers();
}

// ================= VALIDAÇÃO =================

function validarFormularioPlayer() {
    const nome = document.getElementById('nome').value.trim();
    const vida = Number(document.getElementById('vida').value);
    const iniciativa = document.getElementById('iniciativa').value;

    const valido = nome.length > 0 && vida > 0 && iniciativa !== '';

    document.getElementById('salvar').disabled = !valido;
}

// ================= EVENTOS =================

document.getElementById('btn-criar').onclick = () => abrirModal('criando-player');

['nome', 'vida', 'iniciativa'].forEach(id => {
    document.getElementById(id).addEventListener('input', validarFormularioPlayer);
});

document.getElementById('criando-player').addEventListener('submit', e => {
    e.preventDefault();

    const form = e.target;

    const nome = document.getElementById('nome').value.trim();
    const vida = Number(document.getElementById('vida').value);
    const iniciativa = document.getElementById('iniciativa').value;
    const lado = document.getElementById('lado').value === '1';

    if (!nome || vida <= 0 || !iniciativa) return;

    const novo = new Player(nome, vida, iniciativa, lado);
    jogo.players.push(novo);
    salvarJogo();

    renderPlayers();

    form.reset(); // limpa inputs

    // 🔥 força botão voltar ao estado inicial
    document.getElementById('salvar').disabled = true;

    fecharModal('criando-player');
});

document.getElementById('modal-ataque').addEventListener('submit', e => {
    e.preventDefault();
    confirmarAtaque();
});

document.getElementById('modal-status').addEventListener('submit', e => {
    e.preventDefault();
    removerStatus();
});

document.getElementById('cancelar').onclick = () => fecharModal('criando-player');
document.getElementById('cancelar-ataque').onclick = () => fecharModal('modal-ataque');
document.getElementById('cancelar-remocao').onclick = () => fecharModal('modal-status');

document.getElementById('btn-combate').onclick = iniciarCombate;
document.getElementById('btn-passar').onclick = proximoTurno;
document.getElementById('btn-finalizar').onclick = finalizarCombate;
document.getElementById('btn-atacar').onclick = abrirModalAtaque;
document.getElementById('btn-remover-status').onclick = abrirModalStatus;
document.getElementById('player-status').onchange = atualizarListaStatus;
document.getElementById('btn-limpar-mortos').onclick = removerMortos;

carregarJogo();
renderPlayers();
validarFormularioPlayer();