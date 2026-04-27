// Declaracão de Variáveis
let jogo = {
    players: [],
    rodada: 1,
    turno: 0,
    emCombate: false
}

// Classes
class player 
{
    constructor(nome, vida, iniciativa)
    {
        this.nome = nome;
        this.vida = Number(vida);
        this.iniciativa = Number(iniciativa);
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

        if(jogo.emCombate && index === jogo.turno)
        {
            div.classList.add('ativo')
        }
        else
        {
            div.classList.remove('ativo')
        }

        div.innerHTML = `
            <strong>${player.nome}</strong>
            <p>Vida: ${player.vida}/${player.vida}</p>
            <p>${player.iniciativa}</p>`;

        container.appendChild(div);
    })
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
}

function proxRodada()
{
    jogo.turno++;

    if(jogo.turno >= jogo.players.length)
    {
        jogo.turno = 0;
        jogo.rodada++;
    }

    renderRodada();
    renderPlayer();
}

function iniciarCombate() {
    if (jogo.players.length === 0)
    {
        return alert("Não há combatentes definidos!");
    }
    jogo.players.sort((a,b) => b.iniciativa - a.iniciativa);

    jogo.rodada = 1;
    jogo.turno = 0;
    jogo.emCombate = true;

    comb.style.display = 'inline';

    renderRodada();
    renderPlayer();
}

function finalizarCombate() {
    comb.style.display = 'none';
    jogo.emCombate = false;

    renderPlayer();
}

// Eventos de botões
document.getElementById('btn-criar').addEventListener('click', () => {
    addPlayer.style.display = 'block';
    document.body.classList.add('blur-active');
})

document.getElementById('salvar').addEventListener('click', () => {
    let nome = document.getElementById('nome').value;
    let vida = document.getElementById('vida').value;

    if (nome === '' || vida === '' || iniciativa === '')
    {
        alert('Preencha tudo!');
        return;
    }

    let novoPlayer = new player(nome, vida, iniciativa);
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

document.getElementById('btn-finalizar').addEventListener('click', finalizarCombate);