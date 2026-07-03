// ================= COMBATE =================

function iniciarCombate() {
    jogo.modoEdicao = null;
    fecharModal('criando-player');

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

function adicionarLog(texto, tipo = 'sistema') {
    const log = document.getElementById('log-combate');

    const p = document.createElement('p');
    p.textContent = texto;
    p.classList.add(`log-${tipo}`);

    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

// ================= OUTROS =================

function removerMortos() {
    jogo.players = jogo.players.filter(p => p.vivo);
    salvarJogo();
    adicionarLog("Mortos removidos");
    renderPlayers();
}

function tentarReviver(player) {
    const confirmar = confirm(`Deseja reviver ${player.nome}?`);

    if (!confirmar) return;

    player.vivo = true;
    player.vidaAtual = 1;

    salvarJogo();
    renderPlayers();

    adicionarLog(`${player.nome} foi revivido com 1 HP!`, 'sistema');
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

document.getElementById('modal-ataque').addEventListener('submit', e => {
    e.preventDefault();
    confirmarAtaque();
});

document.getElementById('modal-status').addEventListener('submit', e => {
    e.preventDefault();
    removerStatus();
});

document.getElementById('cancelar-ataque').onclick = () => fecharModal('modal-ataque');
document.getElementById('cancelar-remocao').onclick = () => fecharModal('modal-status');
document.getElementById('btn-combate').onclick = iniciarCombate;
document.getElementById('btn-passar').onclick = proximoTurno;
document.getElementById('btn-finalizar').onclick = finalizarCombate;
document.getElementById('btn-atacar').onclick = abrirModalAtaque;
document.getElementById('btn-remover-status').onclick = abrirModalStatus;
document.getElementById('player-status').onchange = atualizarListaStatus;
document.getElementById('btn-limpar-mortos').onclick = removerMortos;