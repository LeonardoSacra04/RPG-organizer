function abrirNotas() {
    document.getElementById('notas').classList.add('aberto');
    document.getElementById('overlay').classList.add('ativo');
    carregarNotas();
}

function fecharNotas() {
    const notas = document.getElementById('notas');

    notas.classList.remove('aberto');
    notas.style.transform = ''; // 🔥 limpa qualquer inline antigo

    document.getElementById('overlay').classList.remove('ativo');
}

function toggleNotas() {
    const notas = document.getElementById('notas');

    if (notas.classList.contains('aberto')) {
        fecharNotas();
    } else {
        abrirNotas();
    }
}

function salvarNotas() {
    const texto = document.getElementById('campo-notas').value;
    localStorage.setItem(STORAGE_NOTAS, texto);
}

function carregarNotas() {
    const texto = localStorage.getItem(STORAGE_NOTAS) || '';
    document.getElementById('campo-notas').value = texto;
}

document.getElementById('toggle-notas').onclick = toggleNotas;
document.getElementById('overlay').onclick = fecharNotas;
document
    .getElementById('campo-notas')
    .addEventListener('input', salvarNotas);