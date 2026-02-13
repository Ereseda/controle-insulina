let grafico;
let registros = JSON.parse(localStorage.getItem("registros")) || [];

document.addEventListener("DOMContentLoaded", () => {
    atualizarTela();
});

/* ============================= */
/* SALVAR */
/* ============================= */

function salvarDados() {
    localStorage.setItem("registros", JSON.stringify(registros));
}

/* ============================= */
/* REGISTRAR */
/* ============================= */

function registrarGlicemia() {

    const valor = Number(document.getElementById("glicemiaValor").value);
    const periodo = document.getElementById("periodoGlicemia").value;
    const tipoInsulina = document.getElementById("tipoInsulina").value;
    const dose = Number(document.getElementById("doseInsulina").value);

    if (!valor || valor <= 0) return;

    const agora = new Date();

    registros.push({
        valor,
        periodo,
        tipoInsulina,
        dose: dose || null,
        data: agora.toISOString().split("T")[0],
        hora: agora.toLocaleTimeString()
    });

    salvarDados();

    document.getElementById("glicemiaValor").value = "";
    document.getElementById("doseInsulina").value = "";

    atualizarTela();
}

/* ============================= */
/* ATUALIZA TELA */
/* ============================= */

function atualizarTela() {
    atualizarUltimoRegistro();
    atualizarMediaHoje();
    atualizarStatus();
    atualizarHistorico();
    atualizarGrafico();
    atualizarResumoDia();
}

/* ============================= */
/* ÚLTIMO REGISTRO */
/* ============================= */

function atualizarUltimoRegistro() {

    const el = document.getElementById("ultimaGlicemia");

    if (!registros.length) {
        el.textContent = "Nenhum registro encontrado.";
        return;
    }

    const ultimo = registros[registros.length - 1];

    el.textContent =
        `${ultimo.valor} mg/dL - ${ultimo.periodo} - ${ultimo.data} ${ultimo.hora}`;
}

/* ============================= */
/* MÉDIA */
/* ============================= */

function atualizarMediaHoje() {

    const hoje = new Date().toISOString().split("T")[0];
    const hojeReg = registros.filter(r => r.data === hoje);

    const el = document.getElementById("mediaHoje");

    if (!registros.length) {
        el.innerHTML = "<em>Base de dados vazia.</em>";
        return;
    }

    if (!hojeReg.length) {
        el.innerHTML = "<em>Nenhuma medição registrada hoje.</em>";
        return;
    }

    const soma = hojeReg.reduce((a, b) => a + Number(b.valor), 0);
    const media = (soma / hojeReg.length).toFixed(1);

    el.textContent = `${media} mg/dL`;
}

/* ============================= */
/* STATUS */
/* ============================= */

function atualizarStatus() {

    const el = document.getElementById("statusGlicemia");
    const card = document.getElementById("cardStatus");

    if (!registros.length) {
        el.textContent = "Sem dados";
        card.className = "card";
        return;
    }

    const ultimo = Number(registros[registros.length - 1].valor);

    let texto = "";
    let classe = "card";

    if (ultimo <= 60) {
        texto = "Crítico Baixo 🔴";
        classe += " card-critico";
    }
    else if (ultimo <= 140) {
        texto = "Normal 🟢";
        classe += " card-normal";
    }
    else if (ultimo <= 200) {
        texto = "Alto 🟡";
        classe += " card-leve";
    }
    else {
        texto = "Crítico Alto 🔴";
        classe += " card-critico";
    }

    el.textContent = texto;
    card.className = classe;
}

/* ============================= */
/* HISTÓRICO */
/* ============================= */

function atualizarHistorico() {

    const lista = document.getElementById("listaGlicemias");
    lista.innerHTML = "";

    if (!registros.length) {
        const li = document.createElement("li");
        li.textContent = "Nenhum registro encontrado.";
        li.style.opacity = "0.6";
        li.style.fontStyle = "italic";
        lista.appendChild(li);
        return;
    }

    registros.slice(-10).reverse().forEach(r => {

        const li = document.createElement("li");
        li.textContent =
            `${r.valor} mg/dL - ${r.periodo} - ${r.data} ${r.hora}`;

        lista.appendChild(li);
    });
}

/* ============================= */
/* MODAL HISTÓRICO */
/* ============================= */

function abrirModalHistorico() {

    const modal = document.getElementById("modalHistorico");
    const lista = document.getElementById("listaCompleta");

    lista.innerHTML = "";

    if (!registros.length) {
        const li = document.createElement("li");
        li.textContent = "Nenhum dado salvo na base.";
        li.style.opacity = "0.6";
        li.style.fontStyle = "italic";
        lista.appendChild(li);

        modal.style.display = "flex";
        return;
    }

    registros.slice().reverse().forEach(r => {

        const li = document.createElement("li");

        if (r.valor <= 60 || r.valor > 250) {
            li.style.color = "#c62828";
            li.style.fontWeight = "bold";
        }

        li.textContent =
            `${r.valor} mg/dL - ${r.periodo} - ${r.data} ${r.hora}`;

        lista.appendChild(li);
    });

    modal.style.display = "flex";
}

function fecharModalHistorico() {
    document.getElementById("modalHistorico").style.display = "none";
}

function fecharAoClicarFora(e) {
    if (e.target.id === "modalHistorico") {
        fecharModalHistorico();
    }
}

/* ============================= */
/* LIMPAR COM CONFIRMAR */
/* ============================= */

function limparHistorico() {
    document.getElementById("inputConfirmar").value = "";
    document.getElementById("btnConfirmarLimpeza").disabled = true;
    document.getElementById("modalConfirmar").style.display = "flex";
}

function fecharModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "none";
}

function verificarConfirmacao() {
    const texto = document.getElementById("inputConfirmar").value.trim();
    const botao = document.getElementById("btnConfirmarLimpeza");
    botao.disabled = texto !== "CONFIRMAR";
}

function confirmarLimpeza() {
    registros = [];
    salvarDados();
    atualizarTela();
    fecharModalConfirmar();
    fecharModalHistorico();
}

/* ============================= */
/* EXPORTAR CSV */
/* ============================= */

function exportarCSV() {

    if (!registros.length) {
        alert("Não há dados para exportar.");
        return;
    }

    let csv = "Valor (mg/dL),Periodo,Tipo Insulina,Dose,Data,Hora\n";

    registros.forEach(r => {
        csv += `${r.valor},${r.periodo},${r.tipoInsulina || ""},${r.dose || ""},${r.data},${r.hora}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `historico_glicemia_${new Date().toISOString().split("T")[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ============================= */
/* EXPORTAR PDF */
/* ============================= */
function exportarPDF() {

    if (!registros.length) {
        alert("Não há dados para exportar.");
        return;
    }

    if (!window.jspdf) {
        alert("Biblioteca PDF não carregada.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nomePaciente = document.getElementById("nomePaciente").value || "Não informado";
    const hojeFormatado = new Date().toLocaleDateString();

    /* ===========================
       CABEÇALHO
    ============================ */

    doc.setFontSize(18);
    doc.setTextColor(25, 118, 210);
    doc.text("Relatório de Monitoramento Glicêmico", 105, 20, null, null, "center");

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${nomePaciente}`, 20, 35);
    doc.text(`Data de emissão: ${hojeFormatado}`, 20, 42);

    /* ===========================
       RESUMO
    ============================ */

    const valores = registros.map(r => r.valor);
    const maior = Math.max(...valores);
    const menor = Math.min(...valores);
    const media = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1);

    doc.setFontSize(12);
    doc.text("Resumo Geral:", 20, 55);

    doc.setFontSize(10);
    doc.text(`Total de medições: ${registros.length}`, 20, 63);
    doc.text(`Média: ${media} mg/dL`, 20, 69);
    doc.text(`Maior valor: ${maior} mg/dL`, 20, 75);
    doc.text(`Menor valor: ${menor} mg/dL`, 20, 81);

    /* ===========================
       GRÁFICO
    ============================ */

    const canvas = document.getElementById("graficoGlicemia");

    if (canvas) {
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 20, 90, 170, 60);
    }

    /* ===========================
       TABELA
    ============================ */

    let y = 160;

    doc.setFontSize(12);
    doc.text("Histórico de Registros:", 20, y);
    y += 8;

    doc.setFontSize(9);

    // Cabeçalho da tabela
    doc.setFillColor(230, 230, 230);
    doc.rect(20, y - 5, 170, 8, "F");

    doc.setTextColor(0, 0, 0);
    doc.text("Valor", 22, y);
    doc.text("Período", 50, y);
    doc.text("Data", 90, y);
    doc.text("Hora", 130, y);

    y += 10;

    registros.forEach(r => {

        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        if (r.valor <= 60 || r.valor > 250) {
            doc.setTextColor(200, 0, 0);
        } else {
            doc.setTextColor(0, 0, 0);
        }

        doc.text(`${r.valor} mg/dL`, 22, y);
        doc.text(`${r.periodo}`, 50, y);
        doc.text(`${r.data}`, 90, y);
        doc.text(`${r.hora}`, 130, y);

        y += 7;
    });

    /* ===========================
       RODAPÉ
    ============================ */

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
        "Este relatório é apenas informativo e não substitui avaliação médica profissional.",
        105,
        290,
        null,
        null,
        "center"
    );

    doc.save("relatorio_clinico_glicemia.pdf");
}
/* ============================= */
/* GRÁFICO */
/* ============================= */

function atualizarGrafico() {

    const canvas = document.getElementById("graficoGlicemia");
    if (!canvas) return;

    const hoje = new Date().toISOString().split("T")[0];

    const hojeReg = registros
        .filter(r => r.data === hoje)
        .sort((a, b) => a.hora.localeCompare(b.hora));

    if (!hojeReg.length) {
        if (grafico) grafico.destroy();
        return;
    }

    const labels = hojeReg.map(r => r.hora);
    const valores = hojeReg.map(r => r.valor);

    if (grafico) grafico.destroy();

    grafico = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Glicemia (mg/dL)",
                data: valores,
                borderColor: "#1976d2",
                tension: 0.3
            }]
        }
    });
}

/* ============================= */
/* RESUMO */
/* ============================= */

function atualizarResumoDia() {

    const el = document.getElementById("resumoDia");
    const hoje = new Date().toISOString().split("T")[0];

    if (!registros.length) {
        el.innerHTML = "<em>Nenhum dado registrado na base.</em>";
        return;
    }

    const hojeReg = registros.filter(r => r.data === hoje);

    if (!hojeReg.length) {
        el.innerHTML = "<em>Nenhuma medição registrada hoje.</em>";
        return;
    }

    const valores = hojeReg.map(r => r.valor);

    const total = valores.length;
    const maior = Math.max(...valores);
    const menor = Math.min(...valores);

    el.innerHTML = `
        <strong>${total}</strong> medições hoje<br>
        Maior valor: <strong>${maior} mg/dL</strong><br>
        Menor valor: <strong>${menor} mg/dL</strong>
    `;
}

const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];
