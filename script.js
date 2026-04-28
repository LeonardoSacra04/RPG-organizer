// Declaracão de Variáveis
let jogo = {
    players: [],
    rodada: 1,
    turno: 0,
    emCombate: false,
    ordemTurno: []
}

// Classes
class Player 
{
    constructor(nome, vida, iniciativa)
    {
        this.nome = nome;
        this.vida = Number(vida);
        this.vidaAtual = this.vida;
        this.iniciativa = Number(iniciativa);
        this.vivo = true;
        this.status = [];
    }
}

// Abstração do HTML
let players = document.getElementById('players');
let salvar = document.getElementById('salvar');
let cancelar = document.getElementById('cancelar');
let comb = document.getElementById('combate');
let addPlayer = document.getElementById('criando-player');
let btnCriar = document.getElementById('btn-criar');
let btnFinalizar = document.getElementById('btn-finalizar')

// Funções
function renderPlayer()
{
    let container = document.getElementById('players');
    container.innerHTML = '';

    jogo.players.forEach((player, index) => {
        let div = document.createElement('div');

        div.classList.add('player-card');

        if(jogo.emCombate &&
           jogo.ordemTurno &&
           jogo.ordemTurno[jogo.turno] &&  
           jogo.ordemTurno[jogo.turno].player === player)
        {
            div.classList.add('ativo');
        }

        if(!player.vivo)
        {
            div.classList.add('morto');
        }

        div.innerHTML = `
            <strong>${player.nome}</strong>
            <p>Vida: ${player.vidaAtual}/${player.vida}</p>
            <p>${player.iniciativa}</p>
            <p>Status: ${player.status.join(', ')}</p>`;

        container.appendChild(div);
    });

}

function abrirModal()
{
    document.getElementById('criando-player').style.display = 'block';
    document.body.classList.add('blur-active');
}

function fecharModal()
{
    document.getElementById('criando-player').style.display = 'none';
    document.body.classList.remove('blur-active');
}

function renderRodada()
{
    let rodadaEl = document.getElementById('rodada');
    rodadaEl.textContent = `Rodada ${jogo.rodada}`;

    if (!jogo.emCombate)
    {
        rodadaEl.textContent = 'Rodada 0';
        return;
    }

    rodadaEl.textContent = `Rodada ${jogo.rodada}`;
}

function proxRodada()
{
    if(!jogo.emCombate || jogo.players.length === 0)
    {
        return;
    }

    do {
        jogo.turno++;
        if(jogo.turno >= jogo.ordemTurno.length) {
            jogo.turno = 0;
            jogo.rodada++;
        }
    } while (!jogo.ordemTurno[jogo.turno].player.vivo);

    renderRodada();
    renderPlayer();
}

function iniciarCombate() {
    if (jogo.players.length === 0)
    {
        return alert("Não há combatentes definidos!");
    }
    jogo.ordemTurno = jogo.players
        .map((player, index) =>  ({ player, index }))
        .sort((a, b) => b.player.iniciativa - a.player.iniciativa);

    jogo.rodada = 1;
    jogo.turno = 0;
    jogo.emCombate = true;

    comb.style.display = 'inline';
    document.getElementById('botoes').style.display = 'none';
    renderRodada();
    renderPlayer();
}

function finalizarCombate() {
    comb.style.display = 'none';
    jogo.emCombate = false;

    document.getElementById('botoes').style.display = 'inline';
    document.getElementById('log-combate').innerHTML = '';
    renderPlayer();

}

function verificarMorte(index) {
    let alvo = jogo.ordemTurno[index].player;

    if(alvo.vidaAtual <= 0)
    {
        adicionarLog(`${alvo.nome} morreu!`);
        alvo.vivo = false;

        alvo.vidaAtual = 0;
        alvo.vivo = false;
    }
}

function abrirModalAtaque() {
    if (!jogo.emCombate) return;

    let select = document.getElementById('alvo');
    select.innerHTML = '<option value="">Selecione o alvo</option>';

    let atacante = jogo.ordemTurno[jogo.turno].player;

    jogo.players.forEach((player, index) => {
        if (player.vivo && player !== atacante) {
            let option = document.createElement('option');
            option.value = index;
            option.textContent = player.nome;
            select.appendChild(option);
        }
    });

    document.getElementById('modal-ataque').style.display = 'block';
    document.body.classList.add('blur-active');
}

function fecharModalAtaque() {
    document.getElementById('modal-ataque').style.display = 'none';
    document.body.classList.remove('blur-active');

    document.getElementById('dano').value = '';
    document.getElementById('status').value = '';
}

function confirmarAtaque() {
    let alvoIndex = document.getElementById('alvo').value;
    let dano = document.getElementById('dano').value;
    let status = document.getElementById('status').value;

    if (alvoIndex === '' || dano === '') {
        alert("Preencha os campos!");
        return;
    }

    let atacante = jogo.ordemTurno[jogo.turno].player;
    let alvo = jogo.players[alvoIndex];

    dano = Number(dano);

    alvo.vidaAtual -= dano;

    if (alvo.vidaAtual < 0) {
        alvo.vidaAtual = 0;
    }

    if (alvo.vidaAtual === 0) {
        alvo.vivo = false;
    }

    adicionarLog(`${atacante.nome} causou ${dano} de dano em ${alvo.nome}`);

    if (status !== '') {
        alvo.status.push(status);
        adicionarLog(`${alvo.nome} está ${status}`);
    }

    fecharModalAtaque();
    renderPlayer();
}

function adicionarLog(texto) {
    let log = document.getElementById('log-combate');
    
    let p = document.createElement('p');
    p.textContent = texto;

    log.prepend(p); // mais recente no topo
}

function removerMortos() {
    if (jogo.emCombate) {
        alert("Não pode remover durante o combate!");
        return;
    }

    jogo.players = jogo.players.filter(player => player.vivo);

    renderPlayer();
    adicionarLog("Players mortos foram removidos.");
}

function abrirModalStatus() {
    let selectPlayer = document.getElementById('player-status');
    selectPlayer.innerHTML = '';

    jogo.players.forEach((player, index) => {
        if (player.status.length > 0) {
            let option = document.createElement('option');
            option.value = index;
            option.textContent = player.nome;
            selectPlayer.appendChild(option);
        }
    });

    // 🔥 CORREÇÃO IMPORTANTE
    if (selectPlayer.options.length > 0) {
        selectPlayer.value = selectPlayer.options[0].value;
        atualizarListaStatus();
    } else {
        alert("Nenhum player possui status!");
        return;
    }

    document.getElementById('modal-status').style.display = 'block';
    document.body.classList.add('blur-active');
}

function atualizarListaStatus() {
    let playerIndex = document.getElementById('player-status').value;
    let lista = document.getElementById('lista-status');

    lista.innerHTML = '';

    if (playerIndex === '') return;

    let player = jogo.players[playerIndex];

    player.status.forEach((status, index) => {
        let option = document.createElement('option');
        option.value = index;
        option.textContent = status;
        lista.appendChild(option);
    });
}

function removerStatus() {
    let playerIndex = document.getElementById('player-status').value;
    let statusIndex = document.getElementById('lista-status').value;

    if (playerIndex === '' || statusIndex === '') {
        alert("Selecione corretamente!");
        return;
    }

    let player = jogo.players[playerIndex];
    let removido = player.status[statusIndex];

    player.status.splice(statusIndex, 1);

    adicionarLog(`${removido} removido de ${player.nome}`);

    fecharModalStatus();
    renderPlayer();
}

function fecharModalStatus() {
    document.getElementById('modal-status').style.display = 'none';
    document.body.classList.remove('blur-active');
}

// Eventos de botões
document.getElementById('btn-criar').addEventListener('click', () => {
    addPlayer.style.display = 'block';
    document.body.classList.add('blur-active');
})

document.getElementById('salvar').addEventListener('click', () => {
    if(jogo.emCombate)
    {
        alert('Combate já iniciado!');
        return;
    }
    
    let nome = document.getElementById('nome').value;
    let vida = document.getElementById('vida').value;
    let iniciativa = document.getElementById('iniciativa').value;

    if (nome === '' || vida === '' || iniciativa === '')
    {
        alert('Preencha tudo!');
        return;
    }

    let novoPlayer = new Player(nome, vida, iniciativa);
    document.getElementById('nome').value = '';
    document.getElementById('vida').value = '';
    document.getElementById('iniciativa').value = '';
    jogo.players.push(novoPlayer);
    renderPlayer();
    fecharModal();
})

cancelar.addEventListener('click', () => {
    addPlayer.style.display = 'none';
    document.body.classList.remove('blur-active');
})

document.getElementById('btn-combate').addEventListener('click', iniciarCombate)

document.getElementById('btn-passar').addEventListener('click', proxRodada);

document.getElementById('btn-atacar').addEventListener('click', abrirModalAtaque);

document.getElementById('btn-finalizar').addEventListener('click', finalizarCombate);

document.getElementById('confirmar-ataque').addEventListener('click', confirmarAtaque);

document.getElementById('cancelar-ataque').addEventListener('click', fecharModalAtaque);

document.getElementById('btn-limpar-mortos').addEventListener('click', removerMortos);

document.getElementById('player-status').addEventListener('change', atualizarListaStatus);

document.getElementById('btn-remover-status').addEventListener('click', abrirModalStatus);

document.getElementById('confirmar-remocao').addEventListener('click', removerStatus);

document.getElementById('cancelar-remocao').addEventListener('click', fecharModalStatus);