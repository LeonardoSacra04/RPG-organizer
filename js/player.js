// classe com todas as informações padrão do player
class Player {
    constructor(nome, vida, iniciativa, aliado, imagem = "images/generic-icon.png") {
        this.nome = nome;
        this.vida = Number(vida);
        this.vidaAtual = this.vida;
        this.iniciativa = Number(iniciativa);
        this.aliado = aliado;
        this.imagem = imagem;
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

// variável para facilitar acesso à imagem
let imagemSelecionada = "images/generic-icon.png";

// constantes para definir a largura do input de vida e vida atual
const vida = document.getElementById("vida");
const vidaAtual = document.getElementById("vida-atual");

// função para definir a largura do input de vida e vida atual
function ajustarWidth() {
    const digitos = Math.max(1, vida.value.length);
    const digitosAtual = Math.max(1, vidaAtual.value.length);
    vida.style.width = `${digitos}ch`;
    vidaAtual.style.width = `${digitosAtual}ch`;
}

// função para atualizar a borda lateral do card no modal de acordo com o lado selecionado
function atualizarBordaModal() {
    const ladoSelect = document.getElementById('lado');
    const modal = document.querySelector('#criando-player .modal-player-card');
    if (!modal) return;
    
    if (ladoSelect.value === '1') {
        modal.classList.add('modal-card-aliado');
        modal.classList.remove('modal-card-inimigo');
    } else {
        modal.classList.add('modal-card-inimigo');
        modal.classList.remove('modal-card-aliado');
    }
}

// função para atualizar a barra de vida do preview no modal
function atualizarVidaModal() {
    const total = Number(document.getElementById('vida').value) || 0;
    const atualInput = document.getElementById('vida-atual');
    
    // Na criação de player, o input de vidaAtual está oculto. Nesse caso, a vida atual é igual à total.
    let atual = total;
    if (atualInput.style.display !== 'none' && atualInput.value !== '') {
        atual = Number(atualInput.value);
    }
    
    const barra = document.getElementById('preview-barra-vida');
    if (!barra) return;
    
    if (total <= 0) {
        barra.style.width = '0%';
        return;
    }
    
    const porcentagem = Math.max(0, Math.min(100, (atual / total) * 100));
    barra.style.width = `${porcentagem}%`;
    
    let cor = '#4caf50';
    if (porcentagem <= 50) cor = '#ff9800';
    if (porcentagem <= 25) cor = '#f44336';
    barra.style.background = cor;
}

// listeners para definir a largura do input de vida e vida atual e atualizar o preview
vidaAtual.addEventListener("input", ajustarWidth);
vida.addEventListener("input", ajustarWidth);
document.getElementById('lado').addEventListener('change', atualizarBordaModal);

// atualiza e renderiza os players na página
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

        // define a barra de vida
        const porcentagem = (player.vidaAtual / player.vida) * 100;

        let cor = '#4caf50';
        if (porcentagem <= 50) cor = '#ff9800';
        if (porcentagem <= 25) cor = '#f44336';

        // cria o design dos cards
        card.innerHTML = `
            <div class="player-header">
                <div class="avatar">
                    <img src="${player.imagem}" alt="Avatar">
                </div>

                <div class="player-info">
                    <h3>${player.nome}</h3>

                    <div class="hp-text">
                        ${player.vidaAtual}/${player.vida} HP
                    </div>

                    <div class="barra-vida">
                        <span style="width:${porcentagem}%; background:${cor}"> </span>
                    </div>

                    <div class="status">
                        ${player.status.join(', ') || 'Sem status'}
                    </div>
                </div>

                <div class="iniciativa">
                    ${player.iniciativa}
                </div>
            </div>
        `;

        card.style.cursor = 'pointer';

        card.onclick = () => {
            const modalAberto = document.getElementById('criando-player').style.display === 'block';
            if (modalAberto) return;

            if (!player.vivo) {
                tentarReviver(player);
                return;
            }

            // bloqueia edição em combate
            if (jogo.emCombate) return;

            abrirEdicaoPlayer(player);
        };

        player.aliado
            ? aliados.appendChild(card)
            : inimigos.appendChild(card);
    });
}

// passa as informações dos campos do modal para o card do player
function validarFormularioPlayer() {
    if (jogo.modoEdicao !== null) {
        document.getElementById('salvar').disabled = false;
        return;
    }
    
    const nome = document.getElementById('nome').value.trim();
    const vida = Number(document.getElementById('vida').value);
    const iniciativa = document.getElementById('iniciativa').value;

    const valido = nome.length > 0 && vida > 0 && iniciativa !== '';

    document.getElementById('salvar').disabled = !valido;
}

// ao editar um player, puxa as informações do player para o modal
function abrirEdicaoPlayer(player) {
    
    jogo.modoEdicao = player;

    document.getElementById('deletar-player').style.display = 'block';
    
    document.getElementById('nome').value = player.nome;
    document.getElementById('vida').value = player.vida;
    document.getElementById('iniciativa').value = player.iniciativa;
    document.getElementById('lado').value = player.aliado ? '1' : '2';
    imagemSelecionada = player.imagem;
    document.getElementById("preview-avatar").src = player.imagem;

    const vidaAtualInput = document.getElementById('vida-atual');
    const removeP = document.getElementById('remove-p');
    vidaAtualInput.style.display = 'block';
    removeP.style.display = "block";
    vidaAtualInput.value = player.vidaAtual;

    document.getElementById('salvar').disabled = false;

    const previewStatus = document.getElementById('preview-status');
    if (previewStatus) {
        previewStatus.textContent = player.status.join(', ') || 'Sem status';
    }

    ajustarWidth();
    atualizarBordaModal();
    atualizarVidaModal();
    abrirModal('criando-player');
}

// DOM ligado a opção de deletar um player na edição
document.getElementById('deletar-player').onclick = () => {
    if (jogo.modoEdicao === null) return;

    const confirmar = confirm(`Deseja deletar ${jogo.modoEdicao.nome}?`);
    if (!confirmar) return;

    jogo.players = jogo.players.filter(p => p !== jogo.modoEdicao);

    jogo.modoEdicao = null;

    salvarJogo();
    renderPlayers();
    fecharModal('criando-player');

    adicionarLog("Player removido", 'sistema');
};

// DOM para resgatar as informações do formulário de criação/edição para adicionar ao player
['nome', 'vida', 'vida-atual', 'iniciativa', 'lado'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        validarFormularioPlayer();
        if (id === 'vida' || id === 'vida-atual') {
            atualizarVidaModal();
        }
    });
});

// DOM para abrir o seletor de arquivos ao clicar na imagem de preview
document.getElementById("preview-avatar").addEventListener("click", () => {
    document.getElementById("imagem-player").click();
});

// DOM ligado a seleção da imagem para o player
document.getElementById("imagem-player").addEventListener("change", function () {
    const arquivo = this.files[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        imagemSelecionada = e.target.result;
        document.getElementById("preview-avatar").src = imagemSelecionada;
    };
    reader.readAsDataURL(arquivo);
});

// DOM ligado ao botão de confirmação ao criar um player
document.getElementById('criando-player').addEventListener('submit', e => {
    e.preventDefault();

    const form = e.target;

    const nome = document.getElementById('nome').value.trim();
    const vida = Number(document.getElementById('vida').value);
    const iniciativa = document.getElementById('iniciativa').value;
    const lado = document.getElementById('lado').value === '1';

    if (!nome || vida <= 0 || !iniciativa) return;

    if (jogo.modoEdicao !== null) {
        const p = jogo.modoEdicao;

        const vidaAtualInput = document.getElementById('vida-atual').value;

        p.nome = nome;
        p.vida = vida;
        p.iniciativa = Number(iniciativa);
        p.aliado = lado;
        p.imagem = imagemSelecionada;;

        // vida atual editável
        if (vidaAtualInput !== '') {
            let novaVidaAtual = Number(vidaAtualInput);

            // não pode ser maior que vida total
            novaVidaAtual = Math.min(novaVidaAtual, vida);

            // não pode ser negativa
            novaVidaAtual = Math.max(novaVidaAtual, 0);

            p.vidaAtual = novaVidaAtual;

            // define se está vivo ou morto
            p.vivo = novaVidaAtual > 0;
        }

        jogo.modoEdicao = null;
    } else {
        const novo = new Player(nome, vida, iniciativa, lado, imagemSelecionada);
        jogo.players.push(novo);
    }

    salvarJogo();
    renderPlayers();

    form.reset();

    // força botão voltar ao estado inicial
    validarFormularioPlayer();

    fecharModal('criando-player');
});

// DOM ligado ao botão para criar um player
document.getElementById('btn-criar').onclick = () => {
    jogo.modoEdicao = null;

    document.getElementById('deletar-player').style.display = 'none';

    const form = document.getElementById('criando-player');
    form.reset();
    imagemSelecionada = "images/generic-icon.png";
    document.getElementById("preview-avatar").src = imagemSelecionada;

    const vidaAtualInput = document.getElementById('vida-atual');
    const removeP = document.getElementById('remove-p');
    vidaAtualInput.style.display = 'none';
    removeP.style.display = 'none';
    vidaAtualInput.value = '';

    const previewStatus = document.getElementById('preview-status');
    if (previewStatus) {
        previewStatus.textContent = 'Sem status';
    }

    validarFormularioPlayer();
    ajustarWidth();
    atualizarBordaModal();
    atualizarVidaModal();
    abrirModal('criando-player');
};

// cancela as alterações feitas na edição
document.getElementById('cancelar').onclick = () => {
    jogo.modoEdicao = null;
    fecharModal('criando-player');
    validarFormularioPlayer();
};

// TESTE TESTE TESTE
// document.getElementById('teste-lado').value = player.aliado ? '1' : '2';
// if (testeLado == 1) {
//     document.getElementsByClassName('teste-card').classList.add('teste-card-aliado');
//     document.getElementsByClassName('teste-card').classList.remove('teste-card-inimigo');
// } else if (testeLado == 2) {
//     document.getElementsByClassName('teste-card').classList.add('teste-card-inimigo');
//     document.getElementsByClassName('teste-card').classList.remove('teste-card-aliado');
// }

