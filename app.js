let listaRegistros = JSON.parse(localStorage.getItem("registros")) || [];
let grafico = null;

/* =========================
   SALVAR LOCALSTORAGE
========================= */
function salvarLocalStorage() {
    localStorage.setItem("registros", JSON.stringify(listaRegistros));
}

/* =========================
   REGISTRAR GLICEMIA
========================= */
function registrarGlicemia() {

    const nome = document.getElementById("nomePaciente").value.trim();
    const valorInput = document.getElementById("glicemiaValor").value;
    const valor = parseFloat(valorInput);
    const periodo = document.getElementById("periodoGlicemia").value;
    const tipo = document.getElementById("tipoInsulina").value;
    const dose = document.getElementById("doseInsulina").value;

    if (!nome || valorInput.trim() === "" || isNaN(valor)) {
        mostrarModalAlerta("Preencha nome e valor corretamente!");
        return;
    }

    if (valor <= 0) {
        mostrarModalAlerta("O valor deve ser maior que zero!");
        return;
    }

    const registro = {
        nome,
        valor,
        periodo,
        tipo,
        dose,
        data: new Date().toLocaleString(),
        dataISO: new Date().toISOString().split("T")[0]
    };

    listaRegistros.push(registro);
    salvarLocalStorage();
    atualizarInterface();

    document.getElementById("glicemiaValor").value = "";
    document.getElementById("doseInsulina").value = "";
}

/* =========================
   ATUALIZAR INTERFACE
========================= */
function atualizarInterface() {
    atualizarUltimo();
    atualizarMedia();
    atualizarStatus();
    atualizarGrafico();
    atualizarLista();
}

/* =========================
   ÚLTIMO REGISTRO
========================= */
function atualizarUltimo() {
    const el = document.getElementById("ultimaGlicemia");

    if (listaRegistros.length === 0) {
        el.textContent = "Nenhum registro";
        return;
    }

    const r = listaRegistros[listaRegistros.length - 1];

    el.innerHTML = `
        <strong>Paciente:</strong> ${r.nome}<br>
        <strong>Glicemia:</strong> ${r.valor} mg/dL<br>
        <strong>Período:</strong> ${r.periodo}<br>
        <strong>Tipo:</strong> ${r.tipo}<br>
        <strong>Dose:</strong> ${r.dose || "—"}<br>
        <strong>Data:</strong> ${r.data}
    `;
}

/* =========================
   MÉDIA
========================= */
function atualizarMedia() {
    const el = document.getElementById("mediaHoje");

    if (listaRegistros.length === 0) {
        el.textContent = "Nenhum dado";
        return;
    }

    const soma = listaRegistros.reduce((acc, r) => acc + r.valor, 0);
    const media = (soma / listaRegistros.length).toFixed(1);

    el.textContent = `${media} mg/dL`;
}

/* =========================
   STATUS
========================= */
function atualizarStatus() {
    const el = document.getElementById("statusGlicemia");
    const card = document.getElementById("cardStatus");

    if (listaRegistros.length === 0) {
        el.textContent = "---";
        return;
    }

    const valor = listaRegistros[listaRegistros.length - 1].valor;

    if (valor < 70) {
        el.textContent = "Hipoglicemia";
        card.style.background = "#ffcccc";
    } else if (valor <= 180) {
        el.textContent = "Normal";
        card.style.background = "#ccffcc";
    } else {
        el.textContent = "Hiperglicemia";
        card.style.background = "#ffe0b3";
    }
}

/* =========================
   GRÁFICO
========================= */
function atualizarGrafico() {
    const ctx = document.getElementById("graficoGlicemia");

    if (!ctx) return;

    if (grafico) grafico.destroy();

    grafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: listaRegistros.map(r => r.periodo),
            datasets: [{
                label: "Glicemia",
                data: listaRegistros.map(r => r.valor),
                borderColor: "#2563eb",
                tension: 0.3,
                fill: false
            }]
        }
    });
}

/* =========================
   HISTÓRICO RESUMIDO
========================= */
function atualizarLista() {
    const ul = document.getElementById("listaGlicemias");
    ul.innerHTML = "";

    listaRegistros.slice(-5).forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.data} - ${r.valor} mg/dL`;
        ul.appendChild(li);
    });
}

/* =========================
   MODAL HISTÓRICO
========================= */
function abrirModalHistorico() {
    document.getElementById("modalHistorico").style.display = "flex";
    atualizarListaCompleta();
}

function fecharModalHistorico() {
    document.getElementById("modalHistorico").style.display = "none";
}

function fecharAoClicarFora(event) {
    if (event.target.id === "modalHistorico") {
        fecharModalHistorico();
    }
}

function atualizarListaCompleta(filtro = null) {
    const ul = document.getElementById("listaCompleta");
    ul.innerHTML = "";

    let dados = listaRegistros;

    if (filtro) {
        dados = listaRegistros.filter(r => r.dataISO === filtro);
    }

    dados.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.data} - ${r.valor} mg/dL`;
        ul.appendChild(li);
    });
}

function filtrarHistorico() {
    const data = document.getElementById("filtroData").value;
    atualizarListaCompleta(data);
}

/* =========================
   EXPORTAR PDF
========================= */
function exportarPDF() {
    if (listaRegistros.length === 0) {
        mostrarModalAlerta("Nenhum registro para exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Histórico de Glicemia", 10, 10);

    let y = 20;

    listaRegistros.forEach((r, i) => {
        doc.text(
            `${i + 1}. ${r.data} - ${r.valor} mg/dL - ${r.periodo}`,
            10,
            y
        );
        y += 8;
    });

    doc.save("historico_glicemia.pdf");
}

/* =========================
   LIMPAR HISTÓRICO
========================= */
function limparHistorico() {
    document.getElementById("modalConfirmar").style.display = "flex";
}

function fecharModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "none";
}

function verificarConfirmacao() {
    const input = document.getElementById("inputConfirmar").value;
    const btn = document.getElementById("btnConfirmarLimpeza");
    btn.disabled = input !== "CONFIRMAR";
}

function confirmarLimpeza() {
    listaRegistros = [];
    salvarLocalStorage();
    fecharModalConfirmar();
    fecharModalHistorico();
    atualizarInterface();
}

/* =========================
   MODAL ALERTA
========================= */
function mostrarModalAlerta(mensagem) {
    document.getElementById("mensagemAlerta").textContent = mensagem;
    document.getElementById("modalAlerta").style.display = "flex";
}

function fecharModalAlerta() {
    document.getElementById("modalAlerta").style.display = "none";
}

/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener("DOMContentLoaded", atualizarInterface);
