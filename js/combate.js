// cria elementos persistentes no carrossel de turnos
function inicializarCarouselDOM() {
    const container = document.getElementById("turno-carousel");
    if (!container) return;
    container.innerHTML = "";
    delete container.dataset.prevTurn;

    jogo.carouselSlots = [];

    for (let i = -2; i <= 2; i++) {
        const card = document.createElement("div");
        card.className = "turn-slot slot-hidden-right"; // começa oculto na direita
        container.appendChild(card);
        jogo.carouselSlots.push({
            el: card,
            offset: i
        });
    }
}

// inicia o combate
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

    inicializarCarouselDOM();
    renderRodada();
    renderPlayers();
    atualizarCarouselTurno(false);
}

// finaliza o combate
function finalizarCombate() {
    jogo.emCombate = false;
    jogo.ordemTurno = [];
    jogo.turno = 0;
    jogo.rodada = 1;

    // Limpa os slots do carrossel do DOM
    const container = document.getElementById("turno-carousel");
    if (container) {
        container.innerHTML = "";
        delete container.dataset.prevTurn;
    }
    delete jogo.carouselSlots;

    document.body.classList.remove('modo-combate');
    document.getElementById('botoes').style.display = 'block';

    adicionarLog("Combate finalizado");

    renderPlayers();
    renderRodada();
}

// passa para o próximo turno do combate
function proximoTurno() {
    if (!jogo.emCombate) return;

    // Evita loop infinito se todos estiverem mortos
    const vivos = jogo.ordemTurno.filter(x => x.player.vivo);
    if (vivos.length === 0) {
        alert("Todos os personagens estão mortos!");
        finalizarCombate();
        return;
    }

    do {
        jogo.turno++;
        if (jogo.turno >= jogo.ordemTurno.length) {
            jogo.turno = 0;
            jogo.rodada++;
        }
    } while (!jogo.ordemTurno[jogo.turno].player.vivo);

    renderRodada();
    renderPlayers();
    atualizarCarouselTurno();
}

function atualizarCarouselTurno(animar = true) {
    const container = document.getElementById("turno-carousel");
    if (!container || !jogo.emCombate || !jogo.carouselSlots || jogo.ordemTurno.length === 0) return;

    const N = jogo.ordemTurno.length;

    // Calcular o deslocamento de turno (turnShift) para pular transições absurdas no wrap-around
    let turnShift = 0;
    const prevTurnStr = container.dataset.prevTurn;
    if (prevTurnStr !== undefined && animar) {
        const prevTurn = parseInt(prevTurnStr, 10);
        turnShift = jogo.turno - prevTurn;
        // Normaliza o shift no intervalo [-Math.floor(N/2), N - Math.floor(N/2) - 1]
        const halfN = Math.floor(N / 2);
        turnShift = ((turnShift + halfN) % N + N) % N - halfN;
    }
    container.dataset.prevTurn = jogo.turno;

    jogo.carouselSlots.forEach(slot => {
        const oldOffset = slot.offset;
        
        // Se animar e houver turnShift, calcula o novo offset com wrap circular de tamanho 5
        let newOffset = oldOffset;
        if (animar && turnShift !== 0) {
            newOffset = ((oldOffset - turnShift + 2) % 5 + 5) % 5 - 2;
        }
        slot.offset = newOffset;

        // Encontra o player correspondente para este offset
        const playerIdx = ((jogo.turno + newOffset) % N + N) % N;
        const item = jogo.ordemTurno[playerIdx];
        const p = item.player;

        // Determina a classe correspondente ao offset, aplicando as regras de ocultação inicial
        let className = "";
        if (newOffset === -2) {
            if (jogo.rodada === 1 && jogo.turno <= 1) {
                className = "slot-hidden-left";
            } else {
                className = "slot--2";
            }
        } else if (newOffset === -1) {
            if (jogo.rodada === 1 && jogo.turno === 0) {
                className = "slot-hidden-left";
            } else {
                className = "slot--1";
            }
        } else if (newOffset === 0) {
            className = "slot-0";
        } else if (newOffset === 1) {
            className = "slot-1";
        } else if (newOffset === 2) {
            className = "slot-2";
        }

        // Detecta se esse slot sofreu um salto (wrap) e precisa pular a animação
        let skipTransition = false;
        if (!animar) {
            skipTransition = true;
        } else {
            const actualChange = newOffset - oldOffset;
            if (actualChange !== -turnShift) {
                skipTransition = true;
            }
        }

        const card = slot.el;

        if (skipTransition) {
            card.style.transition = "none";
        } else {
            card.style.transition = "";
        }

        // Atualiza conteúdo
        card.innerHTML = `
            <img src="${p.imagem}">
            <span>${p.nome}</span>
        `;

        // Atualiza classes do slot
        card.className = `turn-slot ${className}`;
        card.classList.toggle("morto", !p.vivo);

        if (skipTransition) {
            // Força reflow instantâneo
            card.offsetHeight;
            // Restaura transição no frame seguinte
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    card.style.transition = "";
                });
            });
        }
    });
}

// abre campo para definir a ação do ataque
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

// confirma a ação do ataque
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

    if (jogo.emCombate) {
        atualizarCarouselTurno(true);
    }
}

// abre campo para definir a ação da remoção de status
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

// adiciona status dependendo da ação do usuário
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

// remove status dependendo da ação do usuário
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

// mostra um log das ações do combate
function adicionarLog(texto, tipo = 'sistema') {
    const log = document.getElementById('log-combate');

    const p = document.createElement('p');
    p.textContent = texto;
    p.classList.add(`log-${tipo}`);

    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

// remove os players mortos
function removerMortos() {
    jogo.players = jogo.players.filter(p => p.vivo);
    salvarJogo();
    adicionarLog("Mortos removidos");
    renderPlayers();
}

// pergunta ao usuário se realmente quer reviver um player
function tentarReviver(player) {
    const confirmar = confirm(`Deseja reviver ${player.nome}?`);

    if (!confirmar) return;

    player.vivo = true;
    player.vidaAtual = 1;

    salvarJogo();
    renderPlayers();

    if (jogo.emCombate) {
        atualizarCarouselTurno(true);
    }

    adicionarLog(`${player.nome} foi revivido com 1 HP!`, 'sistema');
}

// conta em qual rodada está e de quem é a vez, quando todos jogarem, vai para a próxima rodada
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

// listeners dos modais
document.getElementById('modal-ataque').addEventListener('submit', e => {
    e.preventDefault();
    confirmarAtaque();
});
document.getElementById('modal-status').addEventListener('submit', e => {
    e.preventDefault();
    removerStatus();
});

// DOM ligado aos botões do combate
document.getElementById('cancelar-ataque').onclick = () => fecharModal('modal-ataque');
document.getElementById('cancelar-remocao').onclick = () => fecharModal('modal-status');
document.getElementById('btn-combate').onclick = iniciarCombate;
document.getElementById('btn-passar').onclick = proximoTurno;
document.getElementById('btn-finalizar').onclick = finalizarCombate;
document.getElementById('btn-atacar').onclick = abrirModalAtaque;
document.getElementById('btn-remover-status').onclick = abrirModalStatus;
document.getElementById('btn-limpar-mortos').onclick = removerMortos;

// atualiza a lista de status do player
document.getElementById('player-status').onchange = atualizarListaStatus;