// abre o campo de anotações
function abrirNotas() {
    document.getElementById('notas').classList.add('aberto');
    document.getElementById('overlay').classList.add('ativo');
    carregarNotas();
}

// fecha o campo de anotações
function fecharNotas() {
    const notas = document.getElementById('notas');

    notas.classList.remove('aberto');
    notas.style.transform = ''; // 🔥 limpa qualquer inline antigo

    document.getElementById('overlay').classList.remove('ativo');
}

// alterna o botão entre abrir e fechar anotações
function toggleNotas() {
    const notas = document.getElementById('notas');

    if (notas.classList.contains('aberto')) {
        fecharNotas();
    } else {
        abrirNotas();
    }
}

// salva automaticamente o que for escrito nas anotações
function salvarNotas() {
    const texto = document.getElementById('campo-notas').value;
    localStorage.setItem(STORAGE_NOTAS, texto);
}

// carrega as informações do LocalStorage para as anotações ao abrir o site
function carregarNotas() {
    const texto = localStorage.getItem(STORAGE_NOTAS) || '';
    document.getElementById('campo-notas').value = texto;
}

// DOM e listeners ligados ao campo de anotações
document.getElementById('toggle-notas').onclick = toggleNotas;
document.getElementById('overlay').onclick = fecharNotas;
document
    .getElementById('campo-notas')
    .addEventListener('input', salvarNotas);