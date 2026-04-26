// Declaracão de Variáveis
let iniciativa = [];
let contRodada = 0;
let cont = 0;

// Abstração do HTML
let player = document.getElementById('players');
let salvar = document.getElementById('salvar');
let comb = document.getElementById('combate');
let add = document.getElementById('criando-player');
let btnCriar = document.getElementById('btn-criar');
let btnCombate = document.getElementById('btn-combate');
let btnPassar = document.getElementById('btn-passar');
let btnFinalizar = document.getElementById('btn-finalizar')

// Funções
function proxRodada (array)
{
    let rodada = document.getElementById('rodada');
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
    console.log("Vez de " + array[cont - 1]);
}

// Eventos de botões
btnCriar.addEventListener('click', () => {
    add.style.display = 'inline';
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
    add.style.display = 'none';
})

btnCombate.addEventListener('click', () => {
    if (iniciativa.length == 0)
    {
        return alert("Não há combatentes definidos!");
    }
    comb.style.display = 'inline';
    proxRodada(iniciativa)
    add.style.display = 'none';
})

btnPassar.addEventListener('click', () => proxRodada(iniciativa));

btnFinalizar.addEventListener('click', () => {
    comb.style.display = 'none';
    cont = 0;
    contRodada = 0;
    add.style.display = 'inline';
})