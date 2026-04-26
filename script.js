// Declaracão de Variáveis
let iniciativa = [];
let contRodada = 0;
let cont = 0;

// Abstração do HTML
let player = document.getElementById('players');
let salvar = document.getElementById('salvar');
let cancelar = document.getElementById('cancelar');
let comb = document.getElementById('combate');
let addPlayer = document.getElementById('criando-player');
let btnCriar = document.getElementById('btn-criar');
let btnCombate = document.getElementById('btn-combate');
let btnPassar = document.getElementById('btn-passar');
let btnFinalizar = document.getElementById('btn-finalizar')

// Funções
function proxRodada (array)
{
    let rodada = document.getElementById('rodada');
    let rodadaPlayer = document.getElementById('rodada-player');
    contRodada++;
    rodada.innerHTML = `Rodada ${contRodada}`;

    if (cont == array.length)
    {
        cont = 1;
    }
    else
    {
        cont++;
    }
    rodadaPlayer.innerHTML = `Vez de ${array[cont - 1]}`;
}

// Eventos de botões
btnCriar.addEventListener('click', () => {
    addPlayer.style.display = 'block';
    document.body.classList.add('blur-active');
})

salvar.addEventListener('click', () => {
    let item = document.createElement('p');
    let nome = document.getElementById('nome').value;
    let vida = document.getElementById('vida').value;
    item.textContent = `Nome: ${nome}\n\n Vida: ${vida}\n\n`;
    player.appendChild(item);
    iniciativa.push(nome);
    document.getElementById('nome').value = '';
    document.getElementById('vida').value = '';
    addPlayer.style.display = 'none';
    document.body.classList.remove('blur-active');
})

cancelar.addEventListener('click', () => {
    addPlayer.style.display = 'none';
    document.body.classList.remove('blur-active');
})

btnCombate.addEventListener('click', () => {
    if (iniciativa.length == 0)
    {
        return alert("Não há combatentes definidos!");
    }
    comb.style.display = 'inline';
    proxRodada(iniciativa)
    addPlayer.style.display = 'none';
})

btnPassar.addEventListener('click', () => proxRodada(iniciativa));

btnFinalizar.addEventListener('click', () => {
    comb.style.display = 'none';
    cont = 0;
    contRodada = 0;
})