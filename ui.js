/* ================================
CONTROLE DE TELAS
================================ */

window.UI = {
  showSection(id) {
    document.querySelectorAll(".section").forEach(sec => {
      sec.classList.remove("active");
      sec.style.display = "none";
    });

    const section = document.getElementById(id);
    if (!section) {
      console.error("Seção não encontrada:", id);
      return;
    }

    section.classList.add("active");
section.style.display = "block";

if (id === "login") {
  setTimeout(() => {
    const campoSenha = document.getElementById("senha");
    if (campoSenha) campoSenha.focus();
  }, 100);
}

  if (id === "dashboard") {
  UI.loadDashboard();

  if (typeof Sistema !== "undefined" && Sistema.carregarListaBalancos) {
    Sistema.carregarListaBalancos();
  }

  if (typeof Sistema !== "undefined" && Sistema.carregarAnos) {
    Sistema.carregarAnos();
  }
}
    if (id === "apartamentos") {
      Apartamentos.render();
    }

    
    if (id === "leituras") {
  Leituras.render();

  const monthKey = Database.getMonthKey();
  const tituloLeituras = document.getElementById("tituloLeituras");

  if (tituloLeituras) {
    tituloLeituras.innerText = `Leituras - Água e Gás - ${formatarMesAno(monthKey)}`;
  }
}
    

    if (id === "despesas") {
      Lancamentos.init();
      const monthKey = Database.getMonthKey();
const tituloDespesas = document.getElementById("tituloDespesasReceitas");

if (tituloDespesas) {
  tituloDespesas.innerText = `Controle de despesas e receitas - ${formatarMesAno(monthKey)}`;
}
    }

    if (id === "caixa") {
  Caixa.init();
  const monthKey = Database.getMonthKey();
const tituloCaixa = document.getElementById("tituloLivroCaixa");

if (tituloCaixa) {
  tituloCaixa.innerText = `Controle de Caixa - ${formatarMesAno(monthKey)}`;
}
}

   // if (id === "extratos") {
   //   Extratos.init();
   // }

   if (id === "config") {
  Config.loadParametros();
  Config.aplicarMascaraMoeda();
   
  if (Config.loadReciboSindico) {
    Config.loadReciboSindico();
  }
}

if (id === "relatorio") {
  if (Relatorio.carregarApartamentosSelectRelatorio) {
    Relatorio.carregarApartamentosSelectRelatorio();
  }
}
  },

  loadDashboard() {
  const monthKey = Database.getMonthKey();
  const monthData = Database.getCurrentMonth();

  const caixa = monthData.caixa || {};

const saldoInicial = moedaParaNumero(caixa.saldoInicial || "R$ 0,00");
const receitasMes = moedaParaNumero(caixa.receitasMes || "R$ 0,00");
const receitaAplicacao = moedaParaNumero(caixa.receitaAplicacao || "R$ 0,00");
const receitasLivroCaixa = receitasMes + receitaAplicacao;
const monthKeyAnterior = DashboardFinanceiro.obterMonthKeyAnterior(monthKey);
const banco = Database.getData();
const mesAnteriorData = banco[monthKeyAnterior] || {};
const caixaAnterior = mesAnteriorData.caixa || {};

const receitasMesAnterior = moedaParaNumero(caixaAnterior.receitasMes || "R$ 0,00");
const receitaAplicacaoAnterior = moedaParaNumero(caixaAnterior.receitaAplicacao || "R$ 0,00");
const receitasLivroCaixaAnterior = receitasMesAnterior + receitaAplicacaoAnterior;

  document.getElementById("mesAtual").innerText =
  "Competência: " + formatarMesAno(monthKey);

  const resumo = DashboardFinanceiro.calcularResumo(monthData);
  const resumoAnterior = DashboardFinanceiro.calcularResumoMesAnterior(monthKey);

  document.getElementById("dashSaldoInicial").innerText = formatarValor(saldoInicial);
document.getElementById("dashReceitasMes").innerText = formatarValor(receitasLivroCaixa);
document.getElementById("dashTotalDespesas").innerText = formatarValor(resumo.totalDespesas);
document.getElementById("dashSaldoConta").innerText = formatarValor(resumo.saldoConta);


  document.getElementById("compDespesas").innerText =
    DashboardFinanceiro.formatarComparacao(resumo.totalDespesas, resumoAnterior.totalDespesas);

  document.getElementById("compArrecadacao").innerText =
  DashboardFinanceiro.formatarComparacao(receitasLivroCaixa, receitasLivroCaixaAnterior);
}
};

/* ================================
   APARTAMENTOS
================================ */

window.Apartamentos = {
  add() {
  const numero = document.getElementById("aptNumero").value.trim();
  const responsavel = document.getElementById("aptResponsavel").value.trim();
  const whatsapp = document.getElementById("aptWhatsapp").value.trim();
  const email = document.getElementById("aptEmail").value.trim();
  const formaEnvio = document.getElementById("aptFormaEnvio").value;

  if (!numero || !responsavel) {
    alert("Informe o apartamento e o morador.");
    return;
  }

  const lista = Database.getApartamentos();

  lista.push({
    numero,
    responsavel,
    whatsapp,
    email,
    formaEnvio
  });

  Database.saveApartamentos(lista);

  document.getElementById("aptNumero").value = "";
  document.getElementById("aptResponsavel").value = "";
  document.getElementById("aptWhatsapp").value = "";
  document.getElementById("aptEmail").value = "";
  document.getElementById("aptFormaEnvio").value = "impresso";

  this.render();
},

  remove(index) {
    const lista = Database.getApartamentos();
    lista.splice(index, 1);
    Database.saveApartamentos(lista);
    this.render();
  },

  render() {
  const lista = Database.getApartamentos();
  const tbody = document.getElementById("listaApartamentos");

  tbody.innerHTML = "";

  lista.forEach((apt, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${apt.numero}</td>
        <td>${apt.responsavel || ""}</td>
        <td>${apt.whatsapp || ""}</td>
        <td>${apt.email || ""}</td>
        <td>${this.formatarFormaEnvio(apt.formaEnvio)}</td>
        <td>
          <td>
<td>
  <button onclick="Relatorio.imprimirExtratoApartamento('${apt.numero}')">
    PDF Extrato
  </button>

  <button onclick="Relatorio.enviarWhatsApp('${apt.numero}')">
    WhatsApp
  </button>

  <button onclick="Relatorio.enviarEmail('${apt.numero}')">
    E-mail
  </button>

  <button onclick="Apartamentos.remove(${index})">
    Excluir
  </button>
</td>
      </tr>
    `;
  });

},

formatarFormaEnvio(valor) {
  const opcoes = {
    impresso: "Impresso",
    whatsapp: "WhatsApp",
    email: "E-mail",
    whatsapp_impresso: "WhatsApp + Impresso",
    email_impresso: "E-mail + Impresso"
  };

  return opcoes[valor] || "Impresso";
}
}

/* ================================
   LEITURAS ÁGUA E GÁS
================================ */


window.Leituras = {

  render() {
    const apartamentos = Database.getApartamentos();
    const monthData = Database.getCurrentMonth();
    const tbody = document.getElementById("tabelaLeituras");

    const valorFatura = parseFloat(monthData.parametros.agua.valorFatura) || 0;

    document.getElementById("valorFaturaAgua").value = Number(valorFatura || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    tbody.innerHTML = "";

    let somaAguaApartamentos = 0;

    apartamentos.forEach(apt => {
      if (!monthData.apartamentos[apt.numero]) {
        monthData.apartamentos[apt.numero] = {
          aguaAnterior: 0,
          aguaAtual: 0,
          gasAnterior: 0,
          gasAtual: 0
        };
      }

      const dados = monthData.apartamentos[apt.numero];

      const aguaAnt = parseFloat(dados.aguaAnterior) || 0;
      const aguaAtu = parseFloat(dados.aguaAtual) || 0;
      const gasAnt = parseFloat(dados.gasAnterior) || 0;
      const gasAtu = parseFloat(dados.gasAtual) || 0;

      const consumoAgua = Number((aguaAtu - aguaAnt).toFixed(2));
const consumoGas = Number((gasAtu - gasAnt).toFixed(3));

      const valorAgua = this.calcularAgua(consumoAgua, monthData);
      const valorGas = this.calcularGas(consumoGas, monthData);

      somaAguaApartamentos += valorAgua;

      tbody.innerHTML += `
        <tr>
          <td>${apt.numero}</td>
          <td>${formatarLeitura(aguaAnt, 2)}</td>
          <td>
  <input
    type="text"
    value="${formatarLeitura(aguaAtu, 2)}"
    onchange="Leituras.update('${apt.numero}','aguaAtual',this.value)"
  >
</td>
          <td>${consumoAgua > 0 ? consumoAgua : 0}</td>
          <td>R$ ${valorAgua.toFixed(2)}</td>
          <td>${gasAnt}</td>
         <td>
  <input
    type="text"
    value="${formatarLeitura(gasAtu, 3)}"
    onchange="Leituras.update('${apt.numero}','gasAtual',this.value)"
  >
</td>
          <td>${consumoGas > 0 ? consumoGas : 0}</td>
          <td>R$ ${valorGas.toFixed(2)}</td>
        </tr>
      `;
    });

    const diferencaGastos = valorFatura - somaAguaApartamentos;
    const diffRow = document.getElementById("diferencaGastos");

    if (diffRow) {
      diffRow.innerText = "Diferença de Gastos: " + diferencaGastos.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
    } else {
      const div = document.createElement("div");
      div.id = "diferencaGastos";
      div.style.marginTop = "10px";
      div.style.fontWeight = "bold";
      div.innerText = "Diferença de Gastos: " + diferencaGastos.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
      tbody.parentNode.parentNode.insertBefore(div, tbody.parentNode.nextSibling);
    }

    Database.saveData(Database.getData());
  },

  importarExcel(event) {
    const file = event.target.files[0];

    if (!file) {
      alert("Selecione uma planilha.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const primeiraAba = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[primeiraAba];
        const linhas = XLSX.utils.sheet_to_json(worksheet, {
  defval: "",
  raw: false
});

        if (!linhas.length) {
          alert("A planilha está vazia.");
          return;
        }

        const db = Database.getData();
        const monthKey = Database.getMonthKey();

        if (!db[monthKey]) db[monthKey] = {};
        if (!db[monthKey].apartamentos) db[monthKey].apartamentos = {};

        let importados = 0;

        linhas.forEach((linha) => {
          const apto = String(
            linha.AP ||
            linha.Apto ||
            linha.Apartamento ||
            linha.ap ||
            linha.apto ||
            linha.apartamento ||
            ""
          ).trim();

          const aguaBruta =
  linha["Água"] ??
  linha["Agua"] ??
  linha["agua"] ??
  0;

const gasBruto =
  linha["Gás"] ??
  linha["Gas"] ??
  linha["gas"] ??
  0;

const aguaNova = lerNumeroPlanilha(aguaBruta);
const gasNovo = lerNumeroPlanilha(gasBruto);

          if (!apto) return;

          if (!db[monthKey].apartamentos[apto]) {
            db[monthKey].apartamentos[apto] = {
              aguaAnterior: 0,
              aguaAtual: 0,
              gasAnterior: 0,
              gasAtual: 0
            };
          }

          const registro = db[monthKey].apartamentos[apto];

          registro.aguaAnterior = Number(registro.aguaAtual) || 0;
          registro.gasAnterior = Number(registro.gasAtual) || 0;
          registro.aguaAtual = aguaNova || 0;
          registro.gasAtual = gasNovo || 0;

          importados++;
        });

        Database.saveData(db);
        this.render();

        alert(`${importados} apartamentos importados com sucesso.`);
      } catch (erro) {
        console.error("Erro ao importar planilha:", erro);
        alert("Não foi possível ler a planilha. Verifique o arquivo.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  },

  update(apto, campo, valor) {
    const data = Database.getData();
    const monthKey = Database.getMonthKey();

    if (!data[monthKey].apartamentos[apto]) {
      data[monthKey].apartamentos[apto] = {
        aguaAnterior: 0,
        aguaAtual: 0,
        gasAnterior: 0,
        gasAtual: 0
      };
    }

    data[monthKey].apartamentos[apto][campo] = numeroBrParaFloat(valor);
    Database.saveData(data);
    this.render();
  },

  calcularAgua(consumo, monthData) {
    consumo = parseFloat(consumo);

    if (isNaN(consumo) || consumo <= 0) return 0;

    const taxaMinima = monthData.parametros.agua.taxaMinima;
    const limiteMinimo = monthData.parametros.agua.limiteMinimo;
    const valorExcedente = monthData.parametros.agua.valorExcedente;

    if (consumo <= limiteMinimo) {
      return taxaMinima;
    }

    const excedente = consumo - limiteMinimo;
    return taxaMinima + (excedente * valorExcedente);
  },

  calcularGas(consumo, monthData) {
    consumo = parseFloat(consumo);

    if (isNaN(consumo) || consumo <= 0) return 0;

    const valorM3 = monthData.parametros.gas.valorM3;
    return consumo * valorM3;
  },

  updateFatura(valor) {
    const valorNumerico = moedaParaNumero(valor);

    const mes = Database.getCurrentMonth();
    mes.parametros.agua.valorFatura = valorNumerico;

    const data = Database.getData();
    const monthKey = Database.getMonthKey();
    data[monthKey] = mes;
    Database.saveData(data);

    this.render();
  }

};


function formatarLeitura(valor, casas = 2) {
  const numeroFormatado = Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });

  // remove separador de milhar
  return numeroFormatado.replace(/\./g, "");
}

function lerNumeroPlanilha(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;

  if (typeof valor === "number") return valor;

  let texto = String(valor).trim();

  texto = texto.replace(/\s/g, "");
  texto = texto.replace(/[^\d,.-]/g, "");

  if (texto.includes(",") && texto.includes(".")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  return parseFloat(texto) || 0;
}
 // -------------------------
// Mostrar Diferença de Gastos
// -------------------------


window.Config = {

  loadParametros() {
    const monthData = Database.getCurrentMonth();
    const taxaMinima = document.getElementById("taxaMinima");
    const limiteMinimo = document.getElementById("limiteMinimo");
    const valorExcedente = document.getElementById("valorExcedente");
    const valorGas = document.getElementById("valorGas");

    if (!taxaMinima || !limiteMinimo || !valorExcedente || !valorGas) {
      console.error("Campos de configuração não encontrados");
      return;
    }

    taxaMinima.value =
      "R$ " + Number(monthData.parametros.agua.taxaMinima || 0).toFixed(2).replace(".", ",");

    limiteMinimo.value = monthData.parametros.agua.limiteMinimo ?? 5;

    valorExcedente.value =
      "R$ " + Number(monthData.parametros.agua.valorExcedente || 0).toFixed(2).replace(".", ",");

    valorGas.value =
      "R$ " + Number(monthData.parametros.gas.valorM3 || 0).toFixed(2).replace(".", ",");
  },

  aplicarMascaraMoeda() {
    ["taxaMinima", "valorExcedente", "valorGas"].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;

      if (input.dataset.masked === "true") return;

      input.addEventListener("input", function () {
        formatarMoeda(this);
      });

      input.dataset.masked = "true";
    });
  },

  saveParametros() {
    const data = Database.getData();
    const monthKey = Database.getMonthKey();

    if (!data[monthKey]) {
      data[monthKey] = {};
    }

    if (!data[monthKey].parametros) {
      data[monthKey].parametros = {};
    }

    if (!data[monthKey].parametros.agua) {
      data[monthKey].parametros.agua = {};
    }

    if (!data[monthKey].parametros.gas) {
      data[monthKey].parametros.gas = {};
    }

    const taxaMinima = moedaParaNumero(document.getElementById("taxaMinima").value);
    const limiteMinimo = parseFloat(document.getElementById("limiteMinimo").value) || 0;
    const valorExcedente = moedaParaNumero(document.getElementById("valorExcedente").value);
    const valorGas = moedaParaNumero(document.getElementById("valorGas").value);

    data[monthKey].parametros.agua.taxaMinima = taxaMinima;
    data[monthKey].parametros.agua.limiteMinimo = limiteMinimo;
    data[monthKey].parametros.agua.valorExcedente = valorExcedente;
    data[monthKey].parametros.gas.valorM3 = valorGas;

    Database.saveData(data);

    console.log("Parâmetros salvos:", data[monthKey].parametros);

    alert("Parâmetros atualizados");
  },
loadReciboSindico() {
  const banco = Database.getData();
  const monthKey = Database.getMonthKey();

  if (!banco[monthKey].reciboSindico) {
    banco[monthKey].reciboSindico = {
      nome: "",
      cpf: "",
      rg: "",
      valor: "R$ 0,00"
    };

    Database.saveData(banco);
  }

  const recibo = banco[monthKey].reciboSindico;

  document.getElementById("reciboNomeSindico").value = recibo.nome || "";
  document.getElementById("reciboCpfSindico").value = recibo.cpf || "";
  document.getElementById("reciboRgSindico").value = recibo.rg || "";
  document.getElementById("reciboValorSindico").value = recibo.valor || "R$ 0,00";
},

saveReciboSindico() {
  const banco = Database.getData();
  const monthKey = Database.getMonthKey();

  if (!banco[monthKey]) return;

  banco[monthKey].reciboSindico = {
    nome: document.getElementById("reciboNomeSindico").value.trim(),
    cpf: document.getElementById("reciboCpfSindico").value.trim(),
    rg: document.getElementById("reciboRgSindico").value.trim(),
    valor: document.getElementById("reciboValorSindico").value || "R$ 0,00"
  };

  Database.saveData(banco);

  alert("Dados do recibo do síndico salvos.");
}
};

//------------------------//
//MENU DESPESAS E RECEITAS//
//------------------------//
window.Lancamentos = {

  init() {
  document.getElementById("lanData").valueAsDate = new Date();
  this.carregarApartamentosSelect();
  this.atualizarCamposPorTipo();
  this.render();
},

  add() {
    console.log("clicou salvar");

  const data = document.getElementById("lanData").value;
  const tipo = document.getElementById("lanTipo").value;
  const categoria = document.getElementById("lanCategoria").value;
  let descricao = document.getElementById("lanDescricao").value.trim();

if (descricao) {
  descricao = descricao.charAt(0).toUpperCase() + descricao.slice(1);
}
  const destino = document.getElementById("lanDestino").value;
  const apartamento = String(
  document.getElementById("lanApartamento").value
).replace(/\D/g, "");
 console.log("Apartamento selecionado:", apartamento);
  const valor = moedaParaNumero(document.getElementById("lanValor").value);

  if (!data) {
    alert("Informe a data");
    return;
  }

  if (!valor || valor <= 0) {
    alert("Informe um valor maior que zero");
    return;
  }

  if (tipo === "receita" && categoria !== "Outros" && destino === "individual" && !apartamento) {
  alert("Selecione o apartamento para lançamento individual.");
  return;
}

  const banco = Database.getData();
  const mes = Database.getMonthKey();

  if (!banco[mes]) {
    banco[mes] = {
      apartamentos: {},
      lancamentos: [],
      parametros: {
        agua: {
          taxaMinima: 52.33,
          limiteMinimo: 5,
          valorExcedente: 10.56,
          valorFatura: 0
        },
        gas: {
          valorM3: 16.48
        }
      }
    };
  }

  if (!tipo) {
  alert("Selecione o tipo (Receita ou Despesa).");
  return;
}

if (!categoria) {
  alert("Selecione a categoria.");
  return;
}

if (!destino && !(tipo === "receita" && categoria === "Outros")) {
  alert("Selecione o tipo de rateio.");
  return;
}

  if (!banco[mes].lancamentos) {
    banco[mes].lancamentos = [];
  }
  const destinoFinal =
  tipo === "receita" && categoria === "Outros"
    ? "geral"
    : destino;

  banco[mes].lancamentos.push({
  id: Date.now(),
  data,
  tipo,
  categoria,
  descricao,
  valor,
  destino: destinoFinal,
  apartamento
});

  Database.saveData(banco);

  document.getElementById("lanTipo").value = "";
document.getElementById("lanCategoria").innerHTML = `<option value="">Selecione</option>`;
document.getElementById("lanDestino").innerHTML = `<option value="">Selecione</option>`;
document.getElementById("lanApartamento").value = "";
document.getElementById("lanApartamento").disabled = true;

document.getElementById("lanDescricao").value = "";
document.getElementById("lanValor").value = "";
  this.render();
},

  remove(id) {
    const banco = Database.getData();
    const mes = Database.getMonthKey();
    if (!banco[mes] || !banco[mes].lancamentos) return;

    banco[mes].lancamentos = banco[mes].lancamentos.filter(l => l.id !== id);
    Database.saveData(banco);
    this.render();
  },

  gerarPDFDespesas() {
  const blocosIds = [
    "blocoEntradas",
    "blocoIgual",
    "blocoFundo",
    "blocoCoef",
    "blocoFundoReservaMes",
    "blocoCalculoCondominio",
    "blocoSaldos"
  ];

  let conteudo = "";

  blocosIds.forEach(id => {
    const bloco = document.getElementById(id);
    if (bloco) {
      const clone = bloco.cloneNode(true);

      clone.querySelectorAll("table").forEach(tabela => {
        if (typeof removerColunaAcao === "function") {
          removerColunaAcao(tabela);
        }
      });

      conteudo += clone.outerHTML;
    }
  });

  const janela = window.open("", "_blank");

  janela.document.write(`
    <html>
      <head>
        <title>Despesas e Receitas</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 7mm;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10px;
            color: #000;
            background: #fff;
          }

          h1 {
            text-align: center;
            font-size: 20px;
            margin-bottom: 14px;
          }

          .bloco-financeiro {
            margin-bottom: 14px;
            page-break-inside: avoid;
          }

          .bloco-financeiro h3 {
            margin: 0 0 6px;
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          th, td {
            border: 1px solid #777;
            padding: 5px;
            text-align: left;
          }

          th {
            background: #f1f1f1;
          }

          .subtotal {
            font-weight: bold;
            margin: 6px 0 10px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <h1>Despesas e Receitas - ${formatarMesAno(Database.getMonthKey())}</h1>
        ${conteudo}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 400);
},


  atualizarCamposPorTipo() {
  const tipo = document.getElementById("lanTipo").value;
  const categoria = document.getElementById("lanCategoria");
  const destino = document.getElementById("lanDestino");
  const apartamento = document.getElementById("lanApartamento");

  categoria.innerHTML = "";
  destino.innerHTML = "";

  if (!tipo) {
    categoria.innerHTML = `<option value="">Selecione</option>`;
    destino.innerHTML = `<option value="">Selecione</option>`;
    apartamento.value = "";
    apartamento.disabled = true;
    return;
  }

  if (tipo === "receita") {
  categoria.innerHTML = `
    <option value="">Selecione</option>
    <option value="TaxaDeMudanca">Taxa de Mudança</option>
    <option value="Multas">Multas</option>
    <option value="Extras">Extras</option>
    <option value="Outros">Outros</option>
  `;

  destino.innerHTML = `
    <option value="individual">Individual</option>
  `;

  destino.disabled = false;
  destino.value = "individual";
  apartamento.disabled = false;
}

  if (tipo === "despesa") {
    categoria.innerHTML = `
      <option value="">Selecione</option>
      <option value="Agua">Água</option>
      <option value="Gas">Gás</option>
      <option value="Luz">Luz</option>
      <option value="MaterialLimpeza">Material Limpeza</option>
      <option value="Manutencao">Manutenção</option>
      <option value="Jardinagem">Jardinagem</option>
      <option value="PreventivaElevador">Manutenção Preventiva Elevador</option>
      <option value="ManutençãoElevador">Manutenção Elevador</option>
      <option value="TaxasBancarias">Taxas Bancárias</option>
      <option value="Limpeza">Serviços de Limpeza</option>
      <option value="Honorarios">Honorários Síndico</option>
      <option value="CondominioAtraso">Condomínio em atraso (Rateio)</option>
      <option value="Outros">Outros</option>
    `;

    destino.innerHTML = `
      <option value="">Selecione</option>
      <option value="coeficiente">Coeficiente</option>
      <option value="igual">Igual</option>
      <option value="fundo">Fundo de Reserva</option>
    `;

    apartamento.value = "";
    apartamento.disabled = true;
  }
},

atualizarCamposPorCategoria() {
  const tipo = document.getElementById("lanTipo").value;
  const categoria = document.getElementById("lanCategoria").value;
  const destino = document.getElementById("lanDestino");
  const apartamento = document.getElementById("lanApartamento");

  if (tipo === "receita" && categoria === "Outros") {
    destino.disabled = false;
    destino.innerHTML = `<option value="geral">Não se aplica</option>`;
    destino.value = "geral";
    destino.disabled = true;

    apartamento.value = "";
    apartamento.disabled = true;
    return;
  }

  if (tipo === "receita") {
    destino.disabled = false;
    destino.innerHTML = `<option value="individual">Individual</option>`;
    destino.value = "individual";

    apartamento.disabled = false;
  }
},


  carregarApartamentosSelect() {
  const select = document.getElementById("lanApartamento");
  if (!select) return;

  const apartamentos = Database.getApartamentos();

  select.innerHTML = `<option value="">Selecione</option>`;

  apartamentos.forEach(ap => {
    select.innerHTML += `
      <option value="${ap.numero}">
        AP ${ap.numero} - ${ap.responsavel || ""}
      </option>
    `;
  });
},

  render() {
  const mesData = Database.getCurrentMonth();
  if (!mesData) return;

  const lista = (mesData.lancamentos || []).slice().sort((a, b) => {
  const [anoA, mesA, diaA] = a.data.split("-").map(Number);
  const [anoB, mesB, diaB] = b.data.split("-").map(Number);

  const dataA = new Date(anoA, mesA - 1, diaA);
  const dataB = new Date(anoB, mesB - 1, diaB);

  return dataA - dataB;
});

  const aptosMes = mesData.apartamentos || {};

  const tbodyEntradas = document.getElementById("listaEntradas");
  const tbodyIgual = document.getElementById("listaLancamentosIgual");
  const tbodyFundo = document.getElementById("listaLancamentosFundo");
  const tbodyCoef = document.getElementById("listaLancamentosCoef");
  const tbodyFundoReservaCalculado = document.getElementById("listaFundoReservaCalculado");
  const tbodyCalculoCondominio = document.getElementById("listaCalculoCondominio");
  const tbodySaldos = document.getElementById("listaSaldos");
  if (!tbodyEntradas || !tbodyIgual || !tbodyFundo || !tbodyCoef || !tbodyFundoReservaCalculado || !tbodyCalculoCondominio || !tbodySaldos) return;

  tbodyEntradas.innerHTML = "";
  tbodyIgual.innerHTML = "";
  tbodyFundo.innerHTML = "";
  tbodyCoef.innerHTML = "";
  tbodyFundoReservaCalculado.innerHTML = "";
  tbodyCalculoCondominio.innerHTML = "";
  tbodySaldos.innerHTML = "";

  let totalEntradas = 0;
  let totalIgual = 0;
  let totalCoef = 0;
  let totalFundo = 0;

  let totalAguaLeituras = 0;
  let totalGasLeituras = 0;

  let valorGasLancado = 0;
  let valorFundoReserva = 0;

  // 1) Somar água e gás vindos das leituras
  Object.keys(aptosMes).forEach(numero => {
    const dados = aptosMes[numero] || {};

    const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
    const aguaAtual = parseFloat(dados.aguaAtual) || 0;
    const gasAnterior = parseFloat(dados.gasAnterior) || 0;
    const gasAtual = parseFloat(dados.gasAtual) || 0;

    const consumoAgua = aguaAtual - aguaAnterior;
    const consumoGas = gasAtual - gasAnterior;

    const valorAgua = Leituras.calcularAgua(consumoAgua, mesData);
    const valorGas = Leituras.calcularGas(consumoGas, mesData);

    totalAguaLeituras += valorAgua;
    totalGasLeituras += valorGas;
  });

  // 2) Entradas automáticas
  totalEntradas += totalAguaLeituras + totalGasLeituras;

  // 3) Receitas lançadas manualmente
  lista.forEach(l => {
    if (l.tipo === "receita") {
      totalEntradas += l.valor;
    }
  });

  // 4) Somar despesas por grupo e localizar categoria Gás
  lista.forEach(l => {
    if (l.tipo !== "despesa") return;

    if (l.destino === "igual") totalIgual += l.valor;
    if (l.destino === "fundo") totalFundo += l.valor;
    if (l.destino === "coeficiente") totalCoef += l.valor;

    if (l.categoria === "Gas" || l.categoria === "Gás") {
      valorGasLancado += l.valor;
    }
  });

  // 5) Cálculo do Fundo de Reserva
  valorFundoReserva = (totalCoef - valorGasLancado) * 0.15;
  if (valorFundoReserva < 0) valorFundoReserva = 0;

  // -----------------------------
  // TABELA ENTRADAS
  // -----------------------------
  tbodyEntradas.innerHTML += `
    <tr>
      <td>Arrecadação do consumo de água individual - mês anterior</td>
      <td>${formatarValor(totalAguaLeituras)}</td>
      <td>-</td>
    </tr>
  `;

  tbodyEntradas.innerHTML += `
    <tr>
      <td>Entrada do fundo para o Gás</td>
      <td>${formatarValor(totalGasLeituras)}</td>
      <td>-</td>
    </tr>
  `;

  lista.forEach(l => {
    if (l.tipo === "receita") {
      tbodyEntradas.innerHTML += `
        <tr>
          <td>${l.descricao || l.categoria}</td>
          <td>${formatarValor(l.valor)}</td>
          <td>
            <button onclick="Lancamentos.remove(${l.id})">Excluir</button>
          </td>
        </tr>
      `;
    }
  });

  // -----------------------------
  // TABELAS DE DESPESAS
  // -----------------------------
  lista.forEach(l => {
    if (l.tipo !== "despesa") return;

    const linha = `
      <tr>
        <td>${formatarData(l.data)}</td>
        <td>${formatarTipo(l.tipo)}</td>
        <td>${formatarCategoria(l.categoria)}</td>
        <td>${l.descricao}</td>
        <td>${formatarValor(l.valor)}</td>
        <td>${formatarRateio(l.destino)}</td>
        <td>
          <button onclick="Lancamentos.remove(${l.id})">Excluir</button>
        </td>
      </tr>
    `;

    if (l.destino === "igual") tbodyIgual.innerHTML += linha;
    if (l.destino === "fundo") tbodyFundo.innerHTML += linha;
    if (l.destino === "coeficiente") tbodyCoef.innerHTML += linha;
  });

  // -----------------------------
  // TABELA FUNDO DE RESERVA
  // -----------------------------

const coef2Quartos = 0.057732;
const coef3Quartos = 0.084536;

const valor2Quartos = valorFundoReserva * coef2Quartos;
const valor3Quartos = valorFundoReserva * coef3Quartos;

tbodyFundoReservaCalculado.innerHTML += `
  <tr>
    <td>Fundo de Reserva (15% de Despesas Comuns)</td>
    <td>${formatarValor(valorFundoReserva)}</td>
    <td>${formatarValor(valor2Quartos)}</td>
    <td>${formatarValor(valor3Quartos)}</td>
  </tr>
`;
// -----------------------------
// TABELA CÁLCULO DO CONDOMÍNIO
// -----------------------------
const totalDespesasComunsComEntradas =
  totalCoef
  - totalAguaLeituras
  - valorGasLancado
  + valorFundoReserva;

const valorCondominio2Quartos = totalDespesasComunsComEntradas * coef2Quartos;
const valorCondominio3Quartos = totalDespesasComunsComEntradas * coef3Quartos;

tbodyCalculoCondominio.innerHTML += `
  <tr>
    <td>Total despesas comuns com entradas</td>
    <td>${formatarValor(totalDespesasComunsComEntradas)}</td>
    <td>${formatarValor(valorCondominio2Quartos)}</td>
    <td>${formatarValor(valorCondominio3Quartos)}</td>
  </tr>
`;

// -----------------------------
// TABELA SALDOS
// -----------------------------
const caixa = mesData.caixa || {};

const saldoInicial = moedaParaNumero(caixa.saldoInicial || "R$ 0,00");
const receitasMes = moedaParaNumero(caixa.receitasMes || "R$ 0,00");
const receitaAplicacao = moedaParaNumero(caixa.receitaAplicacao || "R$ 0,00");

const totalDespesas = (mesData.lancamentos || [])
  .filter(l => l.tipo === "despesa")
  .reduce((soma, l) => soma + (Number(l.valor) || 0), 0);

const saldoContaCorrenteMesSeguinte =
  saldoInicial + receitasMes + receitaAplicacao - totalDespesas;

tbodySaldos.innerHTML += `
  <tr>
    <td>Saldo total em conta corrente para mês seguinte</td>
    <td>${formatarValor(saldoContaCorrenteMesSeguinte)}</td>
  </tr>
`;

  // -----------------------------
  // SUBTOTAIS
  // -----------------------------
  document.getElementById("subtotalEntradas").innerHTML =
    `<strong>Subtotal => ${formatarValor(totalEntradas)}</strong>`;

  document.getElementById("subtotalIgual").innerHTML =
    `<strong>Sub Total = ${formatarValor(totalIgual)}</strong>`;

  document.getElementById("subtotalFundo").innerHTML =
    `<strong>Sub Total = ${formatarValor(totalFundo)}</strong>`;

  document.getElementById("subtotalCoef").innerHTML =
    `<strong>Sub Total = ${formatarValor(totalCoef)}</strong>`;

  document.getElementById("subtotalFundoReservaCalculado").innerHTML =
    `<strong>Sub Total = ${formatarValor(valorFundoReserva)}</strong>`;

  document.getElementById("totalGeralLancamentos").innerText =
    `Total geral = ${formatarValor(totalIgual + totalFundo + totalCoef)}`;

    document.getElementById("subtotalCalculoCondominio").innerHTML =
  `<strong>Sub Total = ${formatarValor(totalDespesasComunsComEntradas)}</strong>`;

  
  // -----------------------------
  // RESUMO DO TOPO
  // -----------------------------
  //document.getElementById("totalReceitas").innerText =
    //"Receitas: " + formatarValor(totalEntradas);

  //document.getElementById("totalDespesasIgual").innerText =
    //"Despesas divididas por igual: " + formatarValor(totalIgual);

  //document.getElementById("totalDespesasCoef").innerText =
    //"Despesas comuns (coeficiente): " + formatarValor(totalCoef);

  //document.getElementById("totalDespesasFundo").innerText =
    //"Despesas fundo de reserva: " + formatarValor(totalFundo);
}
};

// -----------------
// Funções auxiliares
// -----------------
function formatarCategoria(categoria) {
  const mapa = {
    Agua: "Água",
    Gas: "Gás",
    Luz: "Luz",
    MaterialLimpeza: "Material Limpeza",
    Manutencao: "Manutenção",
    Jardinagem: "Jardinagem",
    PreventivaElevador: "Manutenção Preventiva Elevador",
    ManutençãoElevador: "Manutenção Elevador",
    TaxasBancarias: "Taxas Bancárias",
    Limpeza: "Serviços de Limpeza",
    Honorarios: "Honorários Síndico",
    CondominioAtraso: "Condomínio em atraso",
    TaxaDeMudanca: "Taxa de Mudança",
    Multas: "Multas",
    Extras: "Extras",
    Outros: "Outros"
  };

  return mapa[categoria] || categoria;
}


function formatarTipo(tipo) {
  if (!tipo) return "";
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function formatarRateio(destino) {
  if (!destino) return "";

  const mapa = {
    coeficiente: "Coeficiente",
    igual: "Igual",
    fundo: "Fundo de Reserva",
    individual: "Individual",
    geral: "Geral"
  };

  return mapa[destino] || destino;
}

function formatarData(dataStr) {
  if (!dataStr) return "";

  const [ano, mes, dia] = dataStr.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Máscara para o input de valor
const inputValor = document.getElementById("lanValor");

if (inputValor) {
  inputValor.addEventListener("input", function (e) {

    let cursor = this.selectionStart;
    let valor = this.value.replace(/\D/g, '');

    valor = (valor / 100).toFixed(2);

    this.value = "R$ " + valor.replace(".", ",");

    this.setSelectionRange(cursor, cursor);

  });
}

function moedaParaNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;

  if (typeof valor === "number") return valor;

  return parseFloat(
    String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}
function formatarMoeda(campo) {
  let valor = campo.value.replace(/\D/g, "");

  valor = (Number(valor) / 100).toFixed(2) + "";
  valor = valor.replace(".", ",");
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  campo.value = "R$ " + valor;
}


//--const apartamentos = {
//"11":0.0577,
//"12":0.0845,
//"13":0.0577,
//"21":0.0577,
//"22":0.0845,
//"23":0.0577,
//"31":0.0577,
//"32":0.0845,
//"33":0.0577,
//"41":0.0577,
//"42":0.0845,
//"43":0.0577,
//"51":0.0577,
//"52":0.0845,
//"53":0.0577
//};



const DashboardFinanceiro = {
  calcularResumo(monthData) {
    if (!monthData) {
      return this.resumoZerado();
    }

    const apartamentos = Database.getApartamentos();
    const aptosMes = monthData.apartamentos || {};
    const lancamentos = monthData.lancamentos || [];

    let totalAgua = 0;
    let totalGas = 0;
    let totalEntradasManuais = 0;

    let totalIgual = 0;
    let totalFundo = 0;
    let totalCoef = 0;
    let valorGasLancado = 0;

    Object.keys(aptosMes).forEach(numero => {
      const dados = aptosMes[numero] || {};

      const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
      const aguaAtual = parseFloat(dados.aguaAtual) || 0;
      const gasAnterior = parseFloat(dados.gasAnterior) || 0;
      const gasAtual = parseFloat(dados.gasAtual) || 0;

      const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);
      const consumoGas = Math.max(gasAtual - gasAnterior, 0);

      totalAgua += Leituras.calcularAgua(consumoAgua, monthData);
      totalGas += Leituras.calcularGas(consumoGas, monthData);
    });

    lancamentos.forEach(l => {
      const valor = Number(l.valor) || 0;

      if (l.tipo === "receita") {
        totalEntradasManuais += valor;
      }

      if (l.tipo === "despesa") {
        if (l.destino === "igual") totalIgual += valor;
        if (l.destino === "fundo") totalFundo += valor;
        if (l.destino === "coeficiente") totalCoef += valor;

        if (l.categoria === "Gas" || l.categoria === "Gás") {
          valorGasLancado += valor;
        }
      }
    });

    const totalDespesas = totalIgual + totalFundo + totalCoef;

    const coef2Quartos = 0.057732;
    const coef3Quartos = 0.084536;

    const valorFundoReserva = Math.max((totalCoef - valorGasLancado) * 0.15, 0);

    const totalDespesasComEntradas =
      totalCoef - totalAgua - valorGasLancado + valorFundoReserva;

    const valor2Quartos = totalDespesasComEntradas * coef2Quartos;
    const valor3Quartos = totalDespesasComEntradas * coef3Quartos;

    const qtd2Quartos = apartamentos.filter(ap =>
      !["12", "22", "32", "42", "52"].includes(String(ap.numero))
    ).length;

    const qtd3Quartos = apartamentos.filter(ap =>
      ["12", "22", "32", "42", "52"].includes(String(ap.numero))
    ).length;

    const condominioGerado =
      (valor2Quartos * qtd2Quartos) +
      (valor3Quartos * qtd3Quartos);

    const totalArrecadado =
      totalAgua +
      totalGas +
      totalEntradasManuais +
      condominioGerado +
      valorFundoReserva;

    const saldoConta = this.calcularSaldoConta(monthData, totalDespesas);

    return {
      totalAgua,
      totalGas,
      totalDespesas,
      condominioGerado,
      totalArrecadado,
      saldoConta
    };
  },

  calcularSaldoConta(monthData, totalDespesas) {
    const caixa = monthData.caixa || {};

    const saldoInicial = moedaParaNumero(caixa.saldoInicial || "R$ 0,00");
    const receitasMes = moedaParaNumero(caixa.receitasMes || "R$ 0,00");
    const receitaAplicacao = moedaParaNumero(caixa.receitaAplicacao || "R$ 0,00");

    return saldoInicial + receitasMes + receitaAplicacao - totalDespesas;
  },

  calcularResumoMesAnterior(monthKeyAtual) {
    const banco = Database.getData();
    const anterior = this.obterMonthKeyAnterior(monthKeyAtual);

    if (!banco[anterior]) {
      return this.resumoZerado();
    }

    return this.calcularResumo(banco[anterior]);
  },

  obterMonthKeyAnterior(monthKey) {
    const [ano, mes] = monthKey.split("-");

const nomesMeses = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro"
};

const mesFormatado = `${nomesMeses[mes]} de ${ano}`;

document.getElementById("mesAtual").innerText = `Competência: ${mesFormatado}`;
    

    let novoAno = ano;
    let novoMes = mes - 1;

    if (novoMes === 0) {
      novoMes = 12;
      novoAno--;
    }

    return `${novoAno}-${String(novoMes).padStart(2, "0")}`;
  },

  formatarComparacao(valorAtual, valorAnterior) {
    const diferenca = valorAtual - valorAnterior;

    if (!valorAnterior || valorAnterior === 0) {
      return `${formatarValor(valorAtual)} | mês anterior sem dados`;
    }

    const percentual = (diferenca / valorAnterior) * 100;
    const sinal = diferenca >= 0 ? "+" : "";

    return `${formatarValor(valorAtual)} | ${sinal}${percentual.toFixed(1).replace(".", ",")}%`;
  },

  resumoZerado() {
    return {
      totalAgua: 0,
      totalGas: 0,
      totalDespesas: 0,
      condominioGerado: 0,
      totalArrecadado: 0,
      saldoConta: 0
    };
  }
};

function formatarMesAno(monthKey) {
  const [ano, mes] = monthKey.split("-");

  const nomesMeses = {
    "01": "Janeiro",
    "02": "Fevereiro",
    "03": "Março",
    "04": "Abril",
    "05": "Maio",
    "06": "Junho",
    "07": "Julho",
    "08": "Agosto",
    "09": "Setembro",
    "10": "Outubro",
    "11": "Novembro",
    "12": "Dezembro"
  };

  return `${nomesMeses[mes]} de ${ano}`;
}


//------------------------//
//MENU RELATÓRIOS//
//------------------------//

const Relatorio = {
 gerar() {
  document.getElementById("conteudoRelatorio").innerHTML = `
    ${this.gerarCapa()}
    ${this.gerarResumoFinanceiro()}
    ${this.gerarLeituras()}
    ${this.gerarDespesasReceitas()}
    ${this.gerarLivroCaixa()}
    ${this.gerarResumoExtratos()}
    ${this.gerarTodosExtratos()}
    ${this.gerarReciboSindico()}
  `;
},

gerarPDFCompleto() {
  const html = `
    ${this.gerarCapa()}
    ${this.gerarResumoFinanceiro()}
    ${this.gerarLeituras()}
    ${this.gerarDespesasReceitas()}
    ${this.gerarLivroCaixa()}
    ${this.gerarResumoExtratos()}
    ${this.gerarTodosExtratos()}
    ${this.gerarReciboSindico()}
  `;

  const janela = window.open("", "_blank");

  janela.document.write(`
    <html>
      <head>
        <title>Relatório Mensal</title>

        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
          }

          .pagina-relatorio,
          .capa-relatorio,
          .recibo-sindico {
            page-break-after: always;
          }

          .pagina-relatorio:last-child,
          .capa-relatorio:last-child,
          .recibo-sindico:last-child {
            page-break-after: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #555;
            padding: 6px;
          }

          th {
            background: #f1f1f1;
          }

          .linha-total-relatorio td {
            background: #eaeaea;
            font-weight: bold;
          }

          .extrato-total-relatorio {
            background: #000;
            color: #fff;
            padding: 10px;
            text-align: right;
            font-weight: bold;
            margin-top: 10px;
          }

          .capa-relatorio {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  font-family: Arial;
}

.capa-logo {
  text-align: center;
  margin-bottom: 25px;
}

.capa-logo img {
  max-width: 140px;
}

.capa-titulo {
  text-align: center;
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 5px;
}

.capa-subtitulo {
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
  color: #555;
}

.capa-linha {
  display: grid;
  grid-template-columns: 180px 1fr;
  margin-bottom: 20px;
}

.capa-label {
  font-weight: bold;
}

.linha-assinatura {
  display: inline-block;
  border-bottom: 1px solid #000;
  width: 250px;
  margin-left: 10px;
}

.capa-bloco {
  margin-bottom: 25px;
}

.capa-checks {
  margin-left: 180px;
  margin-bottom: 10px;
}

.capa-observacao {
  display: grid;
  grid-template-columns: 180px 1fr;
}

.capa-rodape {
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
}
        </style>
      </head>

      <body>
        ${html}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 500);
},

imprimirExtratosMoradores() {
  const apartamentos = Database.getApartamentos();

  let html = "";

  apartamentos.forEach(ap => {
    html += this.gerarExtratoApartamento(ap.numero);
  });

  const janela = window.open("", "_blank");

  janela.document.write(`
    <html>
      <head>
        <title>Extratos dos Moradores</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            color: #000;
            background: #fff;
          }

          .pagina-relatorio {
            padding: 20px;
          }

          .extrato-relatorio {
            page-break-after: always;
            break-after: page;
          }

          .extrato-relatorio:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          h2 {
            text-align: center;
          }

          h3 {
            background: #f1f1f1;
            padding: 8px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          th, td {
            border: 1px solid #777;
            padding: 8px;
            text-align: center;
          }

          .extrato-info-relatorio {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
          }

          .extrato-total-relatorio {
            background: #0f172a;
            color: white;
            padding: 14px;
            margin-top: 18px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
          }

          
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 400);
},


carregarApartamentosSelectRelatorio() {
  const select = document.getElementById("selectApartamentoRelatorio");
  if (!select) return;

  const apartamentos = Database.getApartamentos();

  select.innerHTML = `<option value="">Selecione</option>`;

  apartamentos.forEach(ap => {
    select.innerHTML += `
      <option value="${ap.numero}">
        AP ${ap.numero} - ${ap.responsavel || ""}
      </option>
    `;
  });
},

gerarExtratoIndividual() {
  const numero = document.getElementById("selectApartamentoRelatorio").value;

  if (!numero) {
    alert("Selecione um apartamento.");
    return;
  }

  document.getElementById("resultadoExtratoRelatorio").innerHTML =
    this.gerarExtratoApartamento(numero);
},

imprimirExtratoSelecionado() {
  const numero = document.getElementById("selectApartamentoRelatorio").value;

  if (!numero) {
    alert("Selecione um apartamento.");
    return;
  }

  this.imprimirExtratoApartamento(numero);
},

gerarExtratosParaImpressao() {
  document.getElementById("conteudoRelatorio").innerHTML = `
    ${this.gerarTodosExtratos()}
  `;
},

gerarTodosExtratosTela() {
  const apartamentos = Database.getApartamentos();

  let html = `
    <div class="pagina-relatorio quebra-pagina">
      <h2>Todos os Extratos dos Apartamentos</h2>
    </div>
  `;

  apartamentos.forEach(ap => {
    html += this.gerarExtratoApartamento(ap.numero);
  });

  document.getElementById("conteudoRelatorio").innerHTML = html;
},


gerarExtratoIndividual() {
  const numero = document.getElementById("selectApartamentoRelatorio").value;

  if (!numero) {
    alert("Selecione um apartamento.");
    return;
  }

  const resultado = document.getElementById("resultadoExtratoRelatorio");

  resultado.innerHTML = this.gerarExtratoApartamento(numero);
},

carregarApartamentosSelectRelatorio() {
  const select = document.getElementById("selectApartamentoRelatorio");
  if (!select) return;

  const apartamentos = Database.getApartamentos();

  select.innerHTML = `<option value="">Selecione</option>`;

  apartamentos.forEach(ap => {
    select.innerHTML += `
      <option value="${ap.numero}">
        AP ${ap.numero} - ${ap.responsavel || ""}
      </option>
    `;
  });
},



gerarCapa() {
  const monthKey = Database.getMonthKey();
  const competencia = formatarMesAno(monthKey);

  return `
    <div class="capa-relatorio quebra-pagina">

      <div class="capa-logo">
        <img src="logo.png" alt="Condomínio Guaianazes Plaza">
      </div>

      <div class="capa-titulo">
        DEMONSTRATIVOS CONTÁBEIS
      </div>

      <div class="capa-subtitulo">
        Condomínio Guaianazes Plaza
      </div>

      <div class="capa-linha">
        <div class="capa-label">Competência</div>
        <div class="capa-valor">${competencia}</div>
      </div>

      <!-- SÍNDICO -->
      <div class="capa-bloco">
        <div class="capa-linha">
          <div class="capa-label">Síndico</div>
          <div class="capa-valor">
            Rafael de Souza <span class="linha-assinatura"></span>
          </div>
        </div>
      </div>

      <!-- SUBSÍNDICA -->
      <div class="capa-bloco">
        <div class="capa-linha">
          <div class="capa-label">Subsíndica</div>
          <div class="capa-valor">
            Sinara Barbosa <span class="linha-assinatura"></span>
          </div>
        </div>

        <div class="capa-checks">
          ☐ Aprovado &nbsp;&nbsp;&nbsp; ☐ Reprovado
        </div>

        <div class="capa-observacao">
          <div class="capa-label">Observação</div>
          <div class="capa-valor">
            ___________________________________________________________<br><br>
            ___________________________________________________________
          </div>
        </div>
      </div>

      <!-- CONSELHO -->
      <div class="capa-bloco">
        <div class="capa-linha">
          <div class="capa-label">Conselho Fiscal</div>
          <div class="capa-valor">
            Carlos Zaramello <span class="linha-assinatura"></span>
          </div>
        </div>

        <div class="capa-checks">
          ☐ Aprovado &nbsp;&nbsp;&nbsp; ☐ Reprovado
        </div>

        <div class="capa-observacao">
          <div class="capa-label">Observação</div>
          <div class="capa-valor">
            ___________________________________________________________<br><br>
            ___________________________________________________________
          </div>
        </div>
      </div>

      <div class="capa-rodape">
        Transparência, responsabilidade e compromisso com o bem-estar de todos.
        <br><br>
        <em>Guaianazes Plaza – O lugar que você chama de lar.</em>
      </div>

    </div>
  `;
},

gerarResumoFinanceiro() {
  const monthKey = Database.getMonthKey();
  const mesData = Database.getCurrentMonth();

  const resumo = DashboardFinanceiro.calcularResumo(mesData);

  return `
    <div class="pagina-relatorio quebra-pagina">
      <h2>Resumo Financeiro</h2>
      <p><strong>Competência:</strong> ${formatarMesAno(monthKey)}</p>

      <table class="tabela-relatorio">
        <tbody>
          <tr>
            <td>Saldo conta corrente</td>
            <td>${formatarValor(resumo.saldoConta)}</td>
          </tr>
          <tr>
            <td>Total arrecadado do mês</td>
            <td>${formatarValor(resumo.totalArrecadado)}</td>
          </tr>
          <tr>
            <td>Total água</td>
            <td>${formatarValor(resumo.totalAgua)}</td>
          </tr>
          <tr>
            <td>Total gás</td>
            <td>${formatarValor(resumo.totalGas)}</td>
          </tr>
          <tr>
            <td>Total condomínio gerado</td>
            <td>${formatarValor(resumo.condominioGerado)}</td>
          </tr>
          <tr>
            <td>Total despesas</td>
            <td>${formatarValor(resumo.totalDespesas)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
},

calcularLancamentosIndividuais(numero) {
  const mesData = Database.getCurrentMonth();
  const lancamentos = mesData.lancamentos || [];

  let extras = 0;
  let multas = 0;

  const apExtrato = String(numero || "")
    .replace("AP", "")
    .replace("Ap", "")
    .replace("ap", "")
    .trim()
    .split("-")[0]
    .trim();

  lancamentos.forEach(l => {
    const apLancamento = String(l.apartamento || "")
      .replace("AP", "")
      .replace("Ap", "")
      .replace("ap", "")
      .trim()
      .split("-")[0]
      .trim();

    const tipo = String(l.tipo || "").toLowerCase();
    const destino = String(l.destino || "").toLowerCase();
    const categoria = String(l.categoria || "");

    if (
      tipo === "receita" &&
      destino === "individual" &&
      apLancamento === apExtrato
    ) {
      const valor = Number(l.valor) || 0;

      if (categoria === "Extras") {
        extras += valor;
      }

      if (
        categoria === "Multas" ||
        categoria === "TaxaDeMudanca"
      ) {
        multas += valor;
      }
    }
  });

  return { extras, multas };
},

gerarReciboSindico() {
  const banco = Database.getData();
  const monthKey = Database.getMonthKey();
  const mesData = banco[monthKey] || {};

  const recibo = mesData.reciboSindico || {
    nome: "",
    cpf: "",
    rg: "",
    valor: "R$ 0,00"
  };

  const [ano, mes] = monthKey.split("-");

  const nomesMeses = {
    "01": "janeiro",
    "02": "fevereiro",
    "03": "março",
    "04": "abril",
    "05": "maio",
    "06": "junho",
    "07": "julho",
    "08": "agosto",
    "09": "setembro",
    "10": "outubro",
    "11": "novembro",
    "12": "dezembro"
  };

  const mesNome = nomesMeses[mes] || mes;

  return `
    <div class="recibo-sindico quebra-pagina">
      <h2>Recibo</h2>

      <p>
        Eu ${recibo.nome || "____________________________"}, inscrito no CPF sob o nº
        ${recibo.cpf || "________________"} e no RG nº ${recibo.rg || "________________"},
        declaro que recebi do Condomínio Guaianazes Plaza, inscrito no CNPJ sob o nº
        03.255.378/0001-24, a importância de ${recibo.valor || "R$ 0,00"},
        referente honorário de síndico do mês de ${mesNome}, de ${ano}.
      </p>

      <p class="recibo-data">
        Curitiba, 30 de ${mesNome}, de ${ano}
      </p>

      <div class="recibo-assinatura">
        <p>${recibo.nome || "Síndico"}</p>
        <p>Síndico</p>
      </div>
    </div>
  `;
},


gerarLivroCaixa() {
  const mesData = Database.getCurrentMonth();
  const caixa = mesData.caixa || {};

  const totalDespesas = (mesData.lancamentos || [])
    .filter(l => l.tipo === "despesa")
    .reduce((soma, l) => soma + (Number(l.valor) || 0), 0);

  const saldoInicial = moedaParaNumero(caixa.saldoInicial || "R$ 0,00");
  const receitasMes = moedaParaNumero(caixa.receitasMes || "R$ 0,00");
  const receitaAplicacao = moedaParaNumero(caixa.receitaAplicacao || "R$ 0,00");

  const saldoFinal = saldoInicial + receitasMes + receitaAplicacao - totalDespesas;

  return `
    <div class="pagina-relatorio quebra-pagina">
      <h2>Livro Caixa - ${formatarMesAno(Database.getMonthKey())}</h2>

      <table class="tabela-relatorio">
        <tbody>
          <tr>
            <td>Saldo inicial conta corrente</td>
            <td>${formatarValor(saldoInicial)}</td>
          </tr>
          <tr>
            <td>Receitas do mês</td>
            <td>${formatarValor(receitasMes)}</td>
          </tr>
          <tr>
            <td>Receita aplicação conta corrente</td>
            <td>${formatarValor(receitaAplicacao)}</td>
          </tr>
          <tr>
            <td>Despesas</td>
            <td>${formatarValor(totalDespesas)}</td>
          </tr>
          <tr class="linha-total-relatorio">
            <td>Saldo conta corrente</td>
            <td>${formatarValor(saldoFinal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
},

gerarLeituras() {
  const mesData = Database.getCurrentMonth();
  const apartamentos = Database.getApartamentos();
  const aptosMes = mesData.apartamentos || {};
  const monthKey = Database.getMonthKey();

  const valorFatura = mesData.parametros?.agua?.valorFatura || 0;

  let linhas = "";
  let totalValorAgua = 0; // 👈 DECLARA AQUI (ANTES DO LOOP)

  apartamentos.forEach(ap => {
    const apto = String(ap.numero);
    const item = aptosMes[apto] || {};

    const aguaAnterior = parseFloat(item.aguaAnterior) || 0;
    const aguaAtual = parseFloat(item.aguaAtual) || 0;
    const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);
    const valorAgua = Leituras.calcularAgua(consumoAgua, mesData);

    totalValorAgua += valorAgua; // 👈 SOMA AQUI

    const gasAnterior = parseFloat(item.gasAnterior) || 0;
    const gasAtual = parseFloat(item.gasAtual) || 0;
    const consumoGas = Math.max(gasAtual - gasAnterior, 0);
    const valorGas = Leituras.calcularGas(consumoGas, mesData);

    linhas += `
      <tr>
        <td>${apto}</td>
        <td>${formatarLeitura(aguaAnterior, 2)}</td>
        <td>${formatarLeitura(aguaAtual, 2)}</td>
        <td>${consumoAgua.toFixed(2).replace(".", ",")}</td>
        <td>${formatarValor(valorAgua)}</td>
        <td>${formatarLeitura(gasAnterior, 3)}</td>
        <td>${formatarLeitura(gasAtual, 3)}</td>
        <td>${consumoGas.toFixed(3).replace(".", ",")}</td>
        <td>${formatarValor(valorGas)}</td>
      </tr>
    `;
  });

  const diferenca = valorFatura - totalValorAgua;

  return `
    <div class="pagina-relatorio quebra-pagina">
      <h2>Leituras - Água e Gás - ${formatarMesAno(monthKey)}</h2>

      <p><strong>Conta Total da Sanepar:</strong> ${formatarValor(valorFatura)}</p>
      <p><strong>Total arrecadado de água:</strong> ${formatarValor(totalValorAgua)}</p>
      <p><strong>Diferença de gastos:</strong> ${formatarValor(diferenca)}</p>

      <table class="tabela-relatorio tabela-relatorio-menor">
        <thead>
          <tr>
            <th>Apto</th>
          <th>Água Ant. (m³)</th>
          <th>Água Atual (m³)</th>
          <th>Consumo Água (m³)</th>
          <th>Valor Água (R$)</th>
          <th>Gás Ant. (m³)</th>
          <th>Gás Atual (m³)</th>
          <th>Consumo Gás (m³)</th>
          <th>Valor Gás (R$)</th>
        </tr>
        </thead>
        <tbody>
          ${linhas || `<tr><td colspan="9">Nenhuma leitura encontrada.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
},


gerarDespesasReceitas() {
  const mesData = Database.getCurrentMonth();
  const lista = (mesData.lancamentos || []).slice().sort((a, b) => {
  return String(a.data || "").localeCompare(String(b.data || ""));
});
  const aptosMes = mesData.apartamentos || {};

  let totalEntradas = 0;
  let totalIgual = 0;
  let totalFundo = 0;
  let totalCoef = 0;
  let totalAguaLeituras = 0;
  let totalGasLeituras = 0;
  let valorGasLancado = 0;

  Object.keys(aptosMes).forEach(numero => {
    const dados = aptosMes[numero] || {};

    const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
    const aguaAtual = parseFloat(dados.aguaAtual) || 0;
    const gasAnterior = parseFloat(dados.gasAnterior) || 0;
    const gasAtual = parseFloat(dados.gasAtual) || 0;

    const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);
    const consumoGas = Math.max(gasAtual - gasAnterior, 0);

    totalAguaLeituras += Leituras.calcularAgua(consumoAgua, mesData);
    totalGasLeituras += Leituras.calcularGas(consumoGas, mesData);
  });

  totalEntradas += totalAguaLeituras + totalGasLeituras;

  lista.forEach(l => {
    const valor = Number(l.valor) || 0;

    if (l.tipo === "receita") totalEntradas += valor;

    if (l.tipo === "despesa") {
      if (l.destino === "igual") totalIgual += valor;
      if (l.destino === "fundo") totalFundo += valor;
      if (l.destino === "coeficiente") totalCoef += valor;

      if (l.categoria === "Gas" || l.categoria === "Gás") {
        valorGasLancado += valor;
      }
    }
  });

  const coef2Quartos = 0.057732;
  const coef3Quartos = 0.084536;

  const valorFundoReserva = Math.max((totalCoef - valorGasLancado) * 0.15, 0);
  const valor2Quartos = valorFundoReserva * coef2Quartos;
  const valor3Quartos = valorFundoReserva * coef3Quartos;

  const totalDespesasComunsComEntradas =
    totalCoef - totalAguaLeituras - valorGasLancado + valorFundoReserva;

  const valorCondominio2Quartos = totalDespesasComunsComEntradas * coef2Quartos;
  const valorCondominio3Quartos = totalDespesasComunsComEntradas * coef3Quartos;

  const totalGeral = totalIgual + totalFundo + totalCoef;

  const linhasReceitas = lista
    .filter(l => l.tipo === "receita")
    .map(l => `
      <tr>
        <td>${l.descricao || l.categoria}</td>
        <td>${formatarValor(Number(l.valor) || 0)}</td>
      </tr>
    `).join("");

  const tabelaDespesas = (titulo, destino, subtotal) => {
    const linhas = lista
      .filter(l => l.tipo === "despesa" && l.destino === destino)
      .map(l => `
        <tr>
          <td>${formatarData(l.data)}</td>
          <td>${formatarTipo(l.tipo)}</td>
          <td>${formatarCategoria(l.categoria)}</td>
          <td>${l.descricao}</td>
          <td>${formatarValor(Number(l.valor) || 0)}</td>
          <td>${formatarRateio(l.destino)}</td>
        </tr>
      `).join("");

    return `
      <h3>${titulo}</h3>
      <table class="tabela-relatorio tabela-relatorio-menor">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Rateio</th>
          </tr>
        </thead>
        <tbody>
          ${linhas || `<tr><td colspan="6">Sem lançamentos</td></tr>`}
          <tr class="linha-total-relatorio">
            <td colspan="4">Subtotal</td>
            <td>${formatarValor(subtotal)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `;
  };

  return `
    <div class="pagina-relatorio quebra-pagina">
      <h2>Despesas e Receitas - ${formatarMesAno(Database.getMonthKey())}</h2>

      <h3>Entradas</h3>
      <table class="tabela-relatorio tabela-relatorio-menor">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Arrecadação do consumo de água individual - mês anterior</td>
            <td>${formatarValor(totalAguaLeituras)}</td>
          </tr>
          <tr>
            <td>Entrada do fundo para o Gás</td>
            <td>${formatarValor(totalGasLeituras)}</td>
          </tr>
          ${linhasReceitas}
          <tr class="linha-total-relatorio">
            <td>Subtotal Entradas</td>
            <td>${formatarValor(totalEntradas)}</td>
          </tr>
        </tbody>
      </table>

      ${tabelaDespesas("Despesas divididas por igual", "igual", totalIgual)}
      ${tabelaDespesas("Despesas sem rateio - Fundo de Reserva", "fundo", totalFundo)}
      ${tabelaDespesas("Despesas comuns - Coeficiente", "coeficiente", totalCoef)}

      <h3>Total Geral</h3>
      <table class="tabela-relatorio">
        <tbody>
          <tr class="linha-total-relatorio">
            <td>Total geral</td>
            <td>${formatarValor(totalGeral)}</td>
          </tr>
        </tbody>
      </table>

      <h3>Fundo de Reserva do mês</h3>
      <table class="tabela-relatorio tabela-relatorio-menor">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor</th>
            <th>AP 2 Quartos</th>
            <th>AP 3 Quartos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fundo de Reserva (15% de Despesas Comuns)</td>
            <td>${formatarValor(valorFundoReserva)}</td>
            <td>${formatarValor(valor2Quartos)}</td>
            <td>${formatarValor(valor3Quartos)}</td>
          </tr>
          <tr class="linha-total-relatorio">
            <td>Subtotal</td>
            <td>${formatarValor(valorFundoReserva)}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <h3>Cálculo do Condomínio</h3>
      <table class="tabela-relatorio tabela-relatorio-menor">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Total</th>
            <th>AP 2 Quartos</th>
            <th>AP 3 Quartos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total despesas comuns com entradas</td>
            <td>${formatarValor(totalDespesasComunsComEntradas)}</td>
            <td>${formatarValor(valorCondominio2Quartos)}</td>
            <td>${formatarValor(valorCondominio3Quartos)}</td>
          </tr>
          <tr class="linha-total-relatorio">
            <td>Subtotal</td>
            <td>${formatarValor(totalDespesasComunsComEntradas)}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <h3>Saldos</h3>
      <table class="tabela-relatorio">
        <tbody>
          <tr>
            <td>Saldo total em conta corrente para mês seguinte</td>
            <td>R$ 0,00</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
},

gerarTodosExtratos() {
  const apartamentos = Database.getApartamentos();

  const apartamentosParaImprimir = apartamentos.filter(ap =>
    ap.formaEnvio === "impresso" ||
    ap.formaEnvio === "whatsapp_impresso" ||
    ap.formaEnvio === "email_impresso" ||
    !ap.formaEnvio
  );

  let html = "";

  apartamentosParaImprimir.forEach(ap => {
    html += this.gerarExtratoApartamento(ap.numero);
  });

  return html;
},

gerarExtratoApartamento(numero) {
  const mesData = Database.getCurrentMonth();
  const apartamentos = Database.getApartamentos();
  const aptosMes = mesData.apartamentos || {};
  const lancamentos = mesData.lancamentos || [];

  const ap = apartamentos.find(a => String(a.numero) === String(numero));
  const dados = aptosMes[numero] || {};

  const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
  const aguaAtual = parseFloat(dados.aguaAtual) || 0;
  const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);
  const valorAgua = Leituras.calcularAgua(consumoAgua, mesData);

  const gasAnterior = parseFloat(dados.gasAnterior) || 0;
  const gasAtual = parseFloat(dados.gasAtual) || 0;
  const consumoGas = Math.max(gasAtual - gasAnterior, 0);
  const valorGas = Leituras.calcularGas(consumoGas, mesData);

  let totalIgual = 0;
  let totalCoef = 0;
  let valorGasLancado = 0;

  lancamentos.forEach(l => {
    if (l.tipo !== "despesa") return;

    if (l.destino === "igual") totalIgual += Number(l.valor) || 0;
    if (l.destino === "coeficiente") totalCoef += Number(l.valor) || 0;

    if (l.categoria === "Gas" || l.categoria === "Gás") {
      valorGasLancado += Number(l.valor) || 0;
    }
  });

  const qtdAptos = apartamentos.length || 1;
  const valorIgualPorAp = totalIgual / qtdAptos;

  const coeficiente = this.obterCoeficienteApartamento(numero);

  const valorFundoReserva = Math.max((totalCoef - valorGasLancado) * 0.15, 0);
  const fundoReservaAp = valorFundoReserva * coeficiente;

  const totalAguaLeituras = this.calcularTotalAguaLeituras(mesData);

  const totalDespesasComunsComEntradas =
    totalCoef - totalAguaLeituras - valorGasLancado + valorFundoReserva;

  const condominioCoeficienteAp = totalDespesasComunsComEntradas * coeficiente;

const geralCondominioComFundo = valorIgualPorAp + condominioCoeficienteAp;

const geralCondominio = geralCondominioComFundo - fundoReservaAp;
  const individuais = Relatorio.calcularLancamentosIndividuais(numero);
const extras = individuais.extras;
const multas = individuais.multas;
  
  const totalTitulo =
  valorAgua +
  valorGas +
  geralCondominio +
  fundoReservaAp +
  extras +
  multas;

  const monthKey = Database.getMonthKey();
  const [ano, mes] = monthKey.split("-");
  const mesReferencia = this.nomeMes(mes) + "/" + ano;
  let mesVencimento = Number(mes) + 1;
let anoVencimento = Number(ano);

if (mesVencimento > 12) {
  mesVencimento = 1;
  anoVencimento++;
}

const vencimento = `15/${String(mesVencimento).padStart(2, "0")}/${anoVencimento}`;

  return `
    <div class="pagina-relatorio extrato-relatorio quebra-pagina">
      <h2>EXTRATO MENSAL</h2>

      <div class="extrato-info-relatorio">
        <p><strong>Nome:</strong> ${ap?.responsavel || ""}</p>
        <p><strong>Apartamento:</strong> ${numero}</p>
        <p><strong>Mês de referência:</strong> ${mesReferencia}</p>
        <p><strong>Vencimento:</strong> ${vencimento}</p>
      </div>

      <h3>Água</h3>
      <table class="tabela-relatorio tabela-relatorio-menor">
        <thead>
          <tr>
            <th>Leitura anterior (m³)</th>
            <th>Leitura atual (m³)</th>
            <th>Consumo (m³)</th>
            <th>Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${formatarLeitura(aguaAnterior, 2)}</td>
            <td>${formatarLeitura(aguaAtual, 2)}</td>
            <td>${consumoAgua.toFixed(2).replace(".", ",")}</td>
            <td>${formatarValor(valorAgua)}</td>
          </tr>
        </tbody>
      </table>

      <h3>Gás</h3>
      <table class="tabela-relatorio tabela-relatorio-menor">
        <thead>
          <tr>
            <th>Leitura anterior (m³)</th>
            <th>Leitura atual (m³)</th>
            <th>Consumo (m³)</th>
            <th>Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${formatarLeitura(gasAnterior, 3)}</td>
            <td>${formatarLeitura(gasAtual, 3)}</td>
            <td>${consumoGas.toFixed(3).replace(".", ",")}</td>
            <td>${formatarValor(valorGas)}</td>
          </tr>
        </tbody>
      </table>

      <h3>Outros lançamentos</h3>
      <table class="tabela-relatorio">
        <tbody>
          <tr>
            <td>Geral condomínio</td>
            <td>${formatarValor(geralCondominio)}</td>
          </tr>
          <tr>
            <td>Fundo de reserva do mês</td>
            <td>${formatarValor(fundoReservaAp)}</td>
          </tr>
          <tr>
  <td>Extras</td>
  <td>${formatarValor(extras)}</td>
</tr>
<tr>
  <td>Multas / Taxa de mudança</td>
  <td>${formatarValor(multas)}</td>
</tr>
        </tbody>
      </table>

      <div class="extrato-total-relatorio">
        Valor do título do mês: ${formatarValor(totalTitulo)}
      </div>
    </div>
  `;
},

obterCoeficienteApartamento(numero) {
  const coef2Quartos = 0.057732;
  const coef3Quartos = 0.084536;

  const aps3Quartos = ["12", "22", "32", "42", "52"];

  return aps3Quartos.includes(String(numero)) ? coef3Quartos : coef2Quartos;
},

calcularTotalAguaLeituras(mesData) {
  let total = 0;
  const aptosMes = mesData.apartamentos || {};

  Object.keys(aptosMes).forEach(numero => {
    const dados = aptosMes[numero] || {};

    const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
    const aguaAtual = parseFloat(dados.aguaAtual) || 0;
    const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);

    total += Leituras.calcularAgua(consumoAgua, mesData);
  });

  return total;
},

nomeMes(mes) {
  const meses = {
    "01": "Janeiro",
    "02": "Fevereiro",
    "03": "Março",
    "04": "Abril",
    "05": "Maio",
    "06": "Junho",
    "07": "Julho",
    "08": "Agosto",
    "09": "Setembro",
    "10": "Outubro",
    "11": "Novembro",
    "12": "Dezembro"
  };

  return meses[mes] || mes;
},
gerarResumoExtratos() {
  const mesData = Database.getCurrentMonth();
  const apartamentos = Database.getApartamentos();
  const aptosMes = mesData.apartamentos || {};
  const lancamentos = mesData.lancamentos || [];

  let totalIgual = 0;
  let totalCoef = 0;
  let valorGasLancado = 0;

  lancamentos.forEach(l => {
    if (l.tipo !== "despesa") return;

    if (l.destino === "igual") totalIgual += Number(l.valor) || 0;
    if (l.destino === "coeficiente") totalCoef += Number(l.valor) || 0;

    if (l.categoria === "Gas" || l.categoria === "Gás") {
      valorGasLancado += Number(l.valor) || 0;
    }
  });

  const qtdAptos = apartamentos.length || 1;
  const valorIgualPorAp = totalIgual / qtdAptos;

  const valorFundoReserva = Math.max((totalCoef - valorGasLancado) * 0.15, 0);
  const totalAguaLeituras = this.calcularTotalAguaLeituras(mesData);

  const totalDespesasComunsComEntradas =
    totalCoef - totalAguaLeituras - valorGasLancado + valorFundoReserva;

  let linhas = "";

  apartamentos.forEach(ap => {
    const numero = String(ap.numero);
    const dados = aptosMes[numero] || {};
    const coeficiente = this.obterCoeficienteApartamento(numero);

    const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
    const aguaAtual = parseFloat(dados.aguaAtual) || 0;
    const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);
    const valorAgua = Leituras.calcularAgua(consumoAgua, mesData);

    const gasAnterior = parseFloat(dados.gasAnterior) || 0;
    const gasAtual = parseFloat(dados.gasAtual) || 0;
    const consumoGas = Math.max(gasAtual - gasAnterior, 0);
    const valorGas = Leituras.calcularGas(consumoGas, mesData);

    const fundoReservaAp = valorFundoReserva * coeficiente;

const geralCondominioComFundo =
  valorIgualPorAp + (totalDespesasComunsComEntradas * coeficiente);

const geralCondominio = geralCondominioComFundo - fundoReservaAp;

const individuais = this.calcularLancamentosIndividuais(numero);
const extras = individuais.extras;
const multas = individuais.multas;

    const total =
      valorAgua +
      valorGas +
      geralCondominio +
      fundoReservaAp +
      extras +
      multas;

    linhas += `
      <tr>
        <td>${numero}</td>
        <td>${ap.responsavel || ""}</td>
        <td>${formatarValor(valorAgua)}</td>
        <td>${formatarValor(valorGas)}</td>
        <td>${formatarValor(geralCondominio)}</td>
        <td>${formatarValor(fundoReservaAp)}</td>
        <td>${formatarValor(extras)}</td>
        <td>${formatarValor(multas)}</td>
        <td><strong>${formatarValor(total)}</strong></td>
      </tr>
    `;
  });

  return `
    <div class="pagina-relatorio quebra-pagina">
      <h2>Resumo dos Valores por Apartamento - ${formatarMesAno(Database.getMonthKey())}</h2>

      <table class="tabela-relatorio tabela-resumo-extratos">
        <thead>
          <tr>
            <th>AP</th>
            <th>Morador</th>
            <th>Água</th>
            <th>Gás</th>
            <th>Geral Condomínio</th>
            <th>Fundo de Reserva</th>
            <th>Extras</th>
            <th>Multas / Taxa Mudança</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${linhas}
        </tbody>
      </table>
    </div>
  `;
},

imprimir() {
  const conteudo = document.getElementById("conteudoRelatorio");

  if (!conteudo) {
    alert("Gere o relatório antes de imprimir.");
    return;
  }

  const janela = window.open("", "_blank");

  janela.document.write(`
    <html>
      <head>
        <title>Relatório Mensal</title>

        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
          }

          .pagina-relatorio,
          .capa-relatorio,
          .recibo-sindico {
            page-break-after: always;
          }

          .pagina-relatorio:last-child,
          .capa-relatorio:last-child,
          .recibo-sindico:last-child {
            page-break-after: auto;
          }

          h2, h3 {
            text-align: center;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #555;
            padding: 6px;
          }

          th {
            background: #f1f1f1;
          }

          td:last-child {
            text-align: right;
          }

          .linha-total-relatorio td {
            background: #eaeaea;
            font-weight: bold;
          }

          .extrato-total-relatorio {
            background: #000;
            color: #fff;
            padding: 10px;
            text-align: right;
            font-weight: bold;
            margin-top: 10px;
          }

          .recibo-sindico {
            padding: 40px;
          }

          .recibo-sindico p {
            font-size: 18px;
            line-height: 1.4;
          }

.capa-relatorio {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  font-family: Arial;
}

.capa-logo {
  text-align: center;
  margin-bottom: 25px;
}

.capa-logo img {
  max-width: 140px;
}

.capa-titulo {
  text-align: center;
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 5px;
}

.capa-subtitulo {
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
  color: #555;
}

.capa-linha {
  display: grid;
  grid-template-columns: 180px 1fr;
  margin-bottom: 20px;
}

.capa-label {
  font-weight: bold;
}

.linha-assinatura {
  display: inline-block;
  border-bottom: 1px solid #000;
  width: 250px;
  margin-left: 10px;
}

.capa-bloco {
  margin-bottom: 25px;
}

.capa-checks {
  margin-left: 180px;
  margin-bottom: 10px;
}

.capa-observacao {
  display: grid;
  grid-template-columns: 180px 1fr;
}

.capa-rodape {
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
}        </style>
      </head>

      <body>
        ${conteudo.innerHTML}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 500);
},

buscarHonorarioSindico() {
  const mesData = Database.getCurrentMonth();
  const lancamentos = mesData.lancamentos || [];

  const honorario = lancamentos.find(l =>
    l.tipo === "despesa" &&
    (
      l.categoria === "Honorarios" ||
      l.categoria === "Honorários" ||
      l.categoria === "HonorariosSindico" ||
      l.categoria === "Honorários Sindico"
    )
  );

  return honorario ? Number(honorario.valor) || 0 : 0;
},


formatarNumeroWhatsApp(numero) {
  return numero.replace(/\D/g, "");
},

gerarMensagemWhatsApp(numero) {
  const mesData = Database.getCurrentMonth();
  const apartamentos = Database.getApartamentos();
  const aptosMes = mesData.apartamentos || {};
  const lancamentos = mesData.lancamentos || [];

  const ap = apartamentos.find(a => String(a.numero) === String(numero));
  const dados = aptosMes[numero] || {};

  const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
  const aguaAtual = parseFloat(dados.aguaAtual) || 0;
  const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);
  const valorAgua = Leituras.calcularAgua(consumoAgua, mesData);

  const gasAnterior = parseFloat(dados.gasAnterior) || 0;
  const gasAtual = parseFloat(dados.gasAtual) || 0;
  const consumoGas = Math.max(gasAtual - gasAnterior, 0);
  const valorGas = Leituras.calcularGas(consumoGas, mesData);

  let totalIgual = 0;
  let totalCoef = 0;
  let valorGasLancado = 0;

  lancamentos.forEach(l => {
    if (l.tipo !== "despesa") return;

    if (l.destino === "igual") totalIgual += Number(l.valor) || 0;
    if (l.destino === "coeficiente") totalCoef += Number(l.valor) || 0;

    if (l.categoria === "Gas" || l.categoria === "Gás") {
      valorGasLancado += Number(l.valor) || 0;
    }
  });

  const qtdAptos = apartamentos.length || 1;
  const valorIgualPorAp = totalIgual / qtdAptos;

  const coeficiente = this.obterCoeficienteApartamento(numero);

  const valorFundoReserva = Math.max((totalCoef - valorGasLancado) * 0.15, 0);
  const fundoReservaAp = valorFundoReserva * coeficiente;

  const totalAguaLeituras = this.calcularTotalAguaLeituras(mesData);

  const totalDespesasComunsComEntradas =
    totalCoef - totalAguaLeituras - valorGasLancado + valorFundoReserva;

  const condominioComFundo =
  valorIgualPorAp + (totalDespesasComunsComEntradas * coeficiente);

const condominio = condominioComFundo - fundoReservaAp;
  const individuais = this.calcularLancamentosIndividuais(numero);
  const extras = individuais.extras;
  const multas = individuais.multas;

  const monthKey = Database.getMonthKey();
const [ano, mes] = monthKey.split("-");

let mesVencimento = Number(mes) + 1;
let anoVencimento = Number(ano);

if (mesVencimento > 12) {
  mesVencimento = 1;
  anoVencimento++;
}

const vencimento = `15/${String(mesVencimento).padStart(2, "0")}/${anoVencimento}`;
  
  const total =
  valorAgua +
  valorGas +
  condominio +
  fundoReservaAp +
  extras +
  multas;

  const mensagem = `
📊 *Condomínio Guaianazes Plaza*

AP ${numero} - ${ap?.responsavel || ""}

💧 Água: ${formatarValor(valorAgua)}
🔥 Gás: ${formatarValor(valorGas)}
🏢 Condomínio: ${formatarValor(condominio)}
🏦 Fundo de reserva: ${formatarValor(fundoReservaAp)}
➕ Extras: ${formatarValor(extras)}
⚠️ Multas/Taxas: ${formatarValor(multas)}

💰 *Total: ${formatarValor(total)}*

Vencimento: ${vencimento}
`;

  return encodeURIComponent(mensagem);
},

enviarWhatsApp(numero) {
  const apartamentos = Database.getApartamentos();
  const ap = apartamentos.find(a => String(a.numero) === String(numero));

  if (!ap || !ap.whatsapp) {
    alert("Apartamento sem WhatsApp cadastrado.");
    return;
  }

  const telefone = this.formatarNumeroWhatsApp(ap.whatsapp);
  const mensagem = this.gerarMensagemWhatsApp(numero);

  const url = `https://wa.me/55${telefone}?text=${mensagem}`;

  window.open(url, "_blank");
},



imprimirExtratoApartamento(numero) {
  const conteudo = this.gerarExtratoApartamento(numero);

  const janela = window.open("", "_blank");

  janela.document.write(`
    <html>
      <head>
        <title>Extrato AP ${numero}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            font-family: Arial, sans-serif;
            background: #fff;
            color: #000;
            margin: 0;
            padding: 10px;
          }

          .pagina-relatorio {
            padding: 20px;
          }

          h2 {
            text-align: center;
            margin-bottom: 20px;
          }

          h3 {
            margin-top: 20px;
            background: #f1f1f1;
            padding: 8px;
          }

          .extrato-info-relatorio {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 14px;
          }

          th, td {
            border: 1px solid #777;
            padding: 8px;
            text-align: center;
          }

          th {
            background: #f1f1f1;
          }

          td:last-child {
            text-align: right;
            font-weight: bold;
          }

          .extrato-total-relatorio {
            background: #0f172a;
            color: #fff;
            padding: 14px;
            margin-top: 18px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        ${conteudo}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 400);
},

enviarEmail(numero) {
  const apartamentos = Database.getApartamentos();
  const ap = apartamentos.find(a => String(a.numero) === String(numero));

  if (!ap || !ap.email) {
    alert("Apartamento sem e-mail cadastrado.");
    return;
  }

  

  const monthKey = Database.getMonthKey();
  const [ano, mes] = monthKey.split("-");
  

  const assunto = `Extrato e boleto mensal condomínio - AP ${numero} - ${mes}/${ano}`;

  let mesVencimento = Number(mes) + 1;
let anoVencimento = Number(ano);

if (mesVencimento > 12) {
  mesVencimento = 1;
  anoVencimento++;
}

const vencimento = `15/${String(mesVencimento).padStart(2, "0")}/${anoVencimento}`;
  const corpo = `
Olá, ${ap.responsavel || ""}.

Segue o extrato e o boleto mensal do Condomínio Guaianazes Plaza referente à competência ${mes}/${ano}.

Vencimento: ${vencimento}.

Atenciosamente,
Condomínio Guaianazes Plaza
`;

  const mailto =
    `mailto:${ap.email}` +
    `?subject=${encodeURIComponent(assunto)}` +
    `&body=${encodeURIComponent(corpo)}`;

  window.location.href = mailto;
},
};


//-------------//
//MENU EXTRATOS//
//-------------//

window.Extratos = {
  init() {
    const apartamentos = Database.getApartamentos();
    const select = document.getElementById("selectApartamentoExtrato");

    if (!select) return;

    select.innerHTML = `<option value="">Selecione</option>`;

    apartamentos.forEach(ap => {
      select.innerHTML += `
        <option value="${ap.numero}">
          ${ap.numero} - ${ap.responsavel || ""}
        </option>
      `;
    });
  },

  gerar() {
  const numero = document.getElementById("selectApartamentoExtrato").value;

  if (!numero) {
    alert("Selecione um apartamento.");
    return;
  }

  const resultado = document.getElementById("resultadoExtratos");

  resultado.innerHTML = Relatorio.gerarExtratoApartamento(numero);
},

  obterCoeficienteApartamento(numero) {
    const coef2Quartos = 0.057732;
    const coef3Quartos = 0.084536;

    const aps3Quartos = ["12", "22", "32", "42", "52"];

    return aps3Quartos.includes(String(numero)) ? coef3Quartos : coef2Quartos;
  },

  calcularTotalAguaLeituras(mesData) {
    let total = 0;
    const aptosMes = mesData.apartamentos || {};

    Object.keys(aptosMes).forEach(numero => {
      const dados = aptosMes[numero] || {};

      const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
      const aguaAtual = parseFloat(dados.aguaAtual) || 0;
      const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);

      total += Leituras.calcularAgua(consumoAgua, mesData);
    });

    return total;
  },

  nomeMes(mes) {
    const meses = {
      "01": "Janeiro",
      "02": "Fevereiro",
      "03": "Março",
      "04": "Abril",
      "05": "Maio",
      "06": "Junho",
      "07": "Julho",
      "08": "Agosto",
      "09": "Setembro",
      "10": "Outubro",
      "11": "Novembro",
      "12": "Dezembro"
    };

    return meses[mes] || mes;
  },

  copiarTexto() {
    const extrato = document.getElementById("extratoParaPDF");

    if (!extrato) return;

    navigator.clipboard.writeText(extrato.innerText);
    alert("Extrato copiado.");
  },

  imprimirPDF() {
    const extrato = document.getElementById("extratoParaPDF");

    if (!extrato) return;

    const conteudo = extrato.cloneNode(true);

    conteudo.querySelectorAll(".no-print").forEach(el => el.remove());

    const janela = window.open("", "_blank");

    janela.document.write(`
      <html>
        <head>
          <title>Extrato Mensal</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            body {
              font-family: Arial, sans-serif;
              color: #000;
              background: #fff;
              padding: 10px;
            }

            .extrato-card {
              box-shadow: none;
              max-width: 100%;
              margin: 0;
              padding: 0;
            }

            .extrato-topo {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 16px;
            }

            .extrato-topo h2 {
              margin: 0;
              font-size: 22px;
            }

            .extrato-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 18px;
              margin-bottom: 18px;
            }

            .extrato-bloco {
              margin-bottom: 18px;
            }

            .extrato-bloco h3 {
              background: #f1f1f1;
              padding: 8px;
              font-size: 15px;
              margin-bottom: 6px;
            }

            .tabela-extrato {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }

            .tabela-extrato th,
            .tabela-extrato td {
              border: 1px solid #777;
              padding: 8px;
              text-align: center;
            }

            .extrato-total {
              background: #f1f1f1;
              border: 1px solid #777;
              padding: 12px;
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              margin-top: 16px;
            }

            
          </style>
        </head>
        <body>
          ${conteudo.outerHTML}
        </body>
      </html>
    `);

    janela.document.close();
    janela.focus();

    setTimeout(() => {
      janela.print();
    }, 400);
  }
};


function removerColunaAcao(tabela) {
  if (!tabela) return;

  const ths = Array.from(tabela.querySelectorAll("thead th"));
  let indiceAcao = -1;

  ths.forEach((th, index) => {
    const texto = th.textContent.trim().toLowerCase();
    if (texto === "ação" || texto === "acao") {
      indiceAcao = index;
    }
  });

  if (indiceAcao === -1) return;

  // remove cabeçalho
  const linhaHead = tabela.querySelector("thead tr");
  if (linhaHead && linhaHead.children[indiceAcao]) {
    linhaHead.children[indiceAcao].remove();
  }

  // remove células do corpo
  tabela.querySelectorAll("tbody tr").forEach(tr => {
    if (tr.children[indiceAcao]) {
      tr.children[indiceAcao].remove();
    }
  });

  // remove células do rodapé, se existir
  tabela.querySelectorAll("tfoot tr").forEach(tr => {
    if (tr.children[indiceAcao]) {
      tr.children[indiceAcao].remove();
    }
  });
}

//-------------------
//GERAR PDF LEITURAS 
//------------------- 

function gerarPDFLeituras() {
  const bloco = document.getElementById("blocoTabelaLeituras");
  if (!bloco) return;

  const conteudo = bloco.outerHTML;

  const mesData = Database.getCurrentMonth();
  const monthKey = Database.getMonthKey();

  const valorFatura =
    mesData.parametros?.agua?.valorFatura || 0;

  const janela = window.open("", "_blank");

  janela.document.write(`
    <html>
      <head>
        <title>Leituras - Água e Gás</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #000;
            background: #fff;
          }

          h1 {
            text-align: center;
            margin-bottom: 10px;
            font-size: 22px;
          }

          .info-sanepar {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 16px 0;
            padding: 10px;
            border: 1px solid #888;
            background: #f7f7f7;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #888;
            padding: 8px;
            text-align: center;
          }

          th {
            background: #f1f1f1;
            font-weight: bold;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <h1>Leituras - Água e Gás - ${formatarMesAno(monthKey)}</h1>

        <div class="info-sanepar">
          Conta Total da Sanepar: ${formatarValor(valorFatura)}
        </div>

        ${conteudo}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 400);
}

//-------------------
//LIVRO CAIXA  
//------------------- 

const Caixa = {
  init() {
    const banco = Database.getData();
    const monthKey = Database.getMonthKey();

    if (!banco[monthKey]) {
      banco[monthKey] = {};
    }

    if (!banco[monthKey].caixa) {
      banco[monthKey].caixa = {
        saldoInicial: "R$ 0.000,00",
        receitasMes: "R$ 0,00",
        receitaAplicacao: "R$ 0,00"
      };
      Database.saveData(banco);
    }

    const caixa = banco[monthKey].caixa;

    document.getElementById("caixaSaldoInicial").value = caixa.saldoInicial || "R$ 0.000,00";
    document.getElementById("caixaReceitasMes").value = caixa.receitasMes || "R$ 0,00";
    document.getElementById("caixaReceitaAplicacao").value = caixa.receitaAplicacao || "R$ 0,00";

    this.atualizarDespesas();
    this.calcularSaldo();
  },

  update() {
    const banco = Database.getData();
    const monthKey = Database.getMonthKey();

    if (!banco[monthKey]) {
      banco[monthKey] = {};
    }

    banco[monthKey].caixa = {
      saldoInicial: document.getElementById("caixaSaldoInicial").value,
      receitasMes: document.getElementById("caixaReceitasMes").value,
      receitaAplicacao: document.getElementById("caixaReceitaAplicacao").value
    };

    Database.saveData(banco);
    this.atualizarDespesas();
    this.calcularSaldo();
  },

  atualizarDespesas() {
    const campoDespesas = document.getElementById("caixaDespesas");
    if (!campoDespesas) return;

    const totalDespesas = this.buscarTotalDespesas();
    campoDespesas.value = this.formatarMoedaNumero(totalDespesas);
  },

  buscarTotalDespesas() {
    const monthKey = Database.getMonthKey();
    const banco = Database.getData();
    const lancamentos = banco[monthKey]?.lancamentos || [];

    let total = 0;

    lancamentos.forEach(item => {
      if (item.tipo === "despesa") {
        total += Number(item.valor) || 0;
      }
    });

    return total;
  },

  calcularSaldo() {
    const saldoInicial = this.moedaParaNumero(document.getElementById("caixaSaldoInicial").value);
    const receitasMes = this.moedaParaNumero(document.getElementById("caixaReceitasMes").value);
    const receitaAplicacao = this.moedaParaNumero(document.getElementById("caixaReceitaAplicacao").value);
    const despesas = this.moedaParaNumero(document.getElementById("caixaDespesas").value);

    const saldoFinal = saldoInicial + receitasMes + receitaAplicacao - despesas;

    document.getElementById("caixaSaldoFinal").value = this.formatarMoedaNumero(saldoFinal);
  },

  moedaParaNumero(valor) {
    if (!valor) return 0;
    return parseFloat(
      String(valor)
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;
  },

  formatarMoedaNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  },

  gerarPDF() {
    const saldoInicial = document.getElementById("caixaSaldoInicial").value;
    const receitasMes = document.getElementById("caixaReceitasMes").value;
    const receitaAplicacao = document.getElementById("caixaReceitaAplicacao").value;
    const despesas = document.getElementById("caixaDespesas").value;
    const saldoFinal = document.getElementById("caixaSaldoFinal").value;

    const janela = window.open("", "_blank");

    janela.document.write(`
      <html>
        <head>
          <title>Livro Caixa</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            h1 { text-align: center; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #888; padding: 10px; text-align: left; }
            th { background: #f1f1f1; }
            .linha-total td { font-weight: bold; background: #f5f5f5; }
          
          
            </style>
        </head>
        <body>
          <h1>Livro Caixa</h1>
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Saldo inicial conta corrente</td><td>${saldoInicial}</td></tr>
              <tr><td>Receitas do mês</td><td>${receitasMes}</td></tr>
              <tr><td>Receita aplicação conta corrente</td><td>${receitaAplicacao}</td></tr>
              <tr><td>Despesas</td><td>${despesas}</td></tr>
              <tr class="linha-total"><td>Saldo conta corrente</td><td>${saldoFinal}</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `);

    janela.document.close();
    janela.focus();

    setTimeout(() => {
      janela.print();
    }, 400);
  }
};


//-------------------
//criar novo mes pagina daschboard
//-------------------
const Sistema = {
  criarNovoMes() {
    const mes = document.getElementById("novoMes").value;
    const ano = document.getElementById("novoAno").value.trim();

    if (!mes || !ano) {
      alert("Selecione o mês e informe o ano.");
      return;
    }
const confirmar = confirm(
  "Ao criar um novo mês:\n\n" +
  "- Os lançamentos serão zerados\n" +
  "- O saldo será carregado para o novo mês\n" +
  "- O mês atual continuará salvo\n\n" +
  "Deseja continuar?"
);


if (!confirmar) return;
    const novoMonthKey = `${ano}-${mes}`;
    const monthKeyAtual = Database.getMonthKey();
    const banco = Database.getData();

    if (novoMonthKey === monthKeyAtual) {
      alert("Esse já é o mês atual do sistema.");
      return;
    }

    if (banco[novoMonthKey]) {
      alert("Esse mês já existe no sistema.");
      return;
    }

    const saldoFinalAtual = this.buscarSaldoFinalAtual();

    banco[novoMonthKey] = {
      apartamentos: JSON.parse(JSON.stringify(banco[monthKeyAtual]?.apartamentos || {})),
      lancamentos: [],
      parametros: JSON.parse(JSON.stringify(banco[monthKeyAtual]?.parametros || {
        agua: {
          taxaMinima: 52.33,
          limiteMinimo: 5,
          valorExcedente: 10.56,
          valorFatura: 0
        },
        gas: {
          valorM3: 16.48
        }
      })),
      caixa: {
        saldoInicial: this.formatarMoedaNumero(saldoFinalAtual),
        receitasMes: "R$ 0,00",
        receitaAplicacao: "R$ 0,00"
      }
    };

    if (!banco[novoMonthKey].parametros.agua) {
      banco[novoMonthKey].parametros.agua = {
        taxaMinima: 52.33,
        limiteMinimo: 5,
        valorExcedente: 10.56,
        valorFatura: 0
      };
    }

    if (!banco[novoMonthKey].parametros.gas) {
      banco[novoMonthKey].parametros.gas = { valorM3: 16.48 };
    }

Database.saveData(banco);
localStorage.setItem("monthKey", novoMonthKey);

alert(`Novo mês criado com sucesso: ${mes}/${ano}`);

UI.loadDashboard();

if (Sistema.carregarListaBalancos) {
  Sistema.carregarListaBalancos();
}

UI.showSection("dashboard");
  },

  buscarSaldoFinalAtual() {
    const campoSaldoFinal = document.getElementById("caixaSaldoFinal");

    if (campoSaldoFinal && campoSaldoFinal.value) {
      return this.moedaParaNumero(campoSaldoFinal.value);
    }

    const monthKeyAtual = Database.getMonthKey();
    const banco = Database.getData();
    const caixa = banco[monthKeyAtual]?.caixa || {};

    const saldoInicial = this.moedaParaNumero(caixa.saldoInicial || "R$ 0,00");
    const receitasMes = this.moedaParaNumero(caixa.receitasMes || "R$ 0,00");
    const receitaAplicacao = this.moedaParaNumero(caixa.receitaAplicacao || "R$ 0,00");

    const lancamentos = banco[monthKeyAtual]?.lancamentos || [];
    let totalDespesas = 0;

    lancamentos.forEach(item => {
      if (item.tipo === "despesa") {
        totalDespesas += Number(item.valor) || 0;
      }
    });

    return saldoInicial + receitasMes + receitaAplicacao - totalDespesas;
  },

  

  moedaParaNumero(valor) {
    if (!valor) return 0;

    return parseFloat(
      String(valor)
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;
  },

  formatarMoedaNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  },
  fecharMes() {
  const banco = Database.getData();
  const monthKey = Database.getMonthKey();
  const mesData = banco[monthKey];

  if (!mesData) {
    alert("Nenhum dado encontrado para fechar este mês.");
    return;
  }

  const confirmar = confirm(
    `Deseja fechar o mês ${monthKey} e baixar o Excel de backup?`
  );

  if (!confirmar) return;

  const wb = XLSX.utils.book_new();

  // ABA APARTAMENTOS
  const apartamentos = Database.getApartamentos().map(ap => ({
    Apartamento: ap.numero,
    Responsável: ap.responsavel || ""
  }));

  const wsApartamentos = XLSX.utils.json_to_sheet(apartamentos);
  XLSX.utils.book_append_sheet(wb, wsApartamentos, "Apartamentos");

  // ABA LEITURAS
const leituras = [];

Object.keys(mesData.apartamentos || {}).forEach(apto => {
  const item = mesData.apartamentos[apto] || {};

  const aguaAnterior = parseFloat(item.aguaAnterior) || 0;
  const aguaAtual = parseFloat(item.aguaAtual) || 0;
  const consumoAgua = Math.max(aguaAtual - aguaAnterior, 0);
  const valorAgua = Leituras.calcularAgua(consumoAgua, mesData);

  const gasAnterior = parseFloat(item.gasAnterior) || 0;
  const gasAtual = parseFloat(item.gasAtual) || 0;
  const consumoGas = Math.max(gasAtual - gasAnterior, 0);
  const valorGas = Leituras.calcularGas(consumoGas, mesData);

  leituras.push({
    Apartamento: apto,
    "Água Anterior": aguaAnterior,
    "Água Atual": aguaAtual,
    "Consumo Água": Number(consumoAgua.toFixed(2)),
    "Valor Água": valorAgua,
    "Gás Anterior": gasAnterior,
    "Gás Atual": gasAtual,
    "Consumo Gás": Number(consumoGas.toFixed(3)),
    "Valor Gás": valorGas
  });
});


const wsLeituras = XLSX.utils.json_to_sheet(leituras);
XLSX.utils.book_append_sheet(wb, wsLeituras, "Leituras");
  // ABA DESPESAS E RECEITAS COMPLETA
const lancamentosMes = mesData.lancamentos || [];
const aptosMes = mesData.apartamentos || {};

let totalEntradas = 0;
let totalIgual = 0;
let totalFundo = 0;
let totalCoef = 0;
let totalAguaLeituras = 0;
let totalGasLeituras = 0;
let valorGasLancado = 0;

// Soma água e gás vindos das leituras
Object.keys(aptosMes).forEach(numero => {
  const dados = aptosMes[numero] || {};

  const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
  const aguaAtual = parseFloat(dados.aguaAtual) || 0;
  const gasAnterior = parseFloat(dados.gasAnterior) || 0;
  const gasAtual = parseFloat(dados.gasAtual) || 0;

  const consumoAgua = aguaAtual - aguaAnterior;
  const consumoGas = gasAtual - gasAnterior;

  const valorAgua = Leituras.calcularAgua(consumoAgua, mesData);
  const valorGas = Leituras.calcularGas(consumoGas, mesData);

  totalAguaLeituras += valorAgua;
  totalGasLeituras += valorGas;
});

totalEntradas += totalAguaLeituras + totalGasLeituras;

lancamentosMes.forEach(l => {
  if (l.tipo === "receita") {
    totalEntradas += Number(l.valor) || 0;
  }

  if (l.tipo === "despesa") {
    if (l.destino === "igual") totalIgual += Number(l.valor) || 0;
    if (l.destino === "fundo") totalFundo += Number(l.valor) || 0;
    if (l.destino === "coeficiente") totalCoef += Number(l.valor) || 0;

    if (l.categoria === "Gas" || l.categoria === "Gás") {
      valorGasLancado += Number(l.valor) || 0;
    }
  }
});

const coef2Quartos = 0.057732;
const coef3Quartos = 0.084536;

const valorFundoReserva = Math.max((totalCoef - valorGasLancado) * 0.15, 0);
const fundoReserva2Quartos = valorFundoReserva * coef2Quartos;
const fundoReserva3Quartos = valorFundoReserva * coef3Quartos;

const totalDespesasComunsComEntradas =
  totalCoef - totalAguaLeituras - valorGasLancado + valorFundoReserva;

const condominio2Quartos = totalDespesasComunsComEntradas * coef2Quartos;
const condominio3Quartos = totalDespesasComunsComEntradas * coef3Quartos;

const totalGeral = totalIgual + totalFundo + totalCoef;

const abaDespesas = [];

// ENTRADAS
abaDespesas.push(["ENTRADAS"]);
abaDespesas.push(["Descrição", "Valor"]);
abaDespesas.push(["Arrecadação do consumo de água individual - mês anterior", totalAguaLeituras]);
abaDespesas.push(["Entrada do fundo para o Gás", totalGasLeituras]);

lancamentosMes
  .filter(l => l.tipo === "receita")
  .forEach(l => {
    abaDespesas.push([l.descricao || l.categoria, Number(l.valor) || 0]);
  });

abaDespesas.push(["Subtotal Entradas", totalEntradas]);
abaDespesas.push([]);

// DESPESAS DIVIDIDAS POR IGUAL
abaDespesas.push(["DESPESAS DIVIDIDAS POR IGUAL"]);
abaDespesas.push(["Data", "Tipo", "Categoria", "Descrição", "Valor", "Rateio"]);

lancamentosMes
  .filter(l => l.tipo === "despesa" && l.destino === "igual")
  .forEach(l => {
    abaDespesas.push([l.data, l.tipo, l.categoria, l.descricao, Number(l.valor) || 0, l.destino]);
  });

abaDespesas.push(["", "", "", "Subtotal Despesas por Igual", totalIgual, ""]);
abaDespesas.push([]);

// DESPESAS FUNDO DE RESERVA
abaDespesas.push(["DESPESAS SEM RATEIO - FUNDO DE RESERVA"]);
abaDespesas.push(["Data", "Tipo", "Categoria", "Descrição", "Valor", "Rateio"]);

lancamentosMes
  .filter(l => l.tipo === "despesa" && l.destino === "fundo")
  .forEach(l => {
    abaDespesas.push([l.data, l.tipo, l.categoria, l.descricao, Number(l.valor) || 0, l.destino]);
  });

abaDespesas.push(["", "", "", "Subtotal Fundo de Reserva", totalFundo, ""]);
abaDespesas.push([]);

// DESPESAS COMUNS COEFICIENTE
abaDespesas.push(["DESPESAS COMUNS - COEFICIENTE"]);
abaDespesas.push(["Data", "Tipo", "Categoria", "Descrição", "Valor", "Rateio"]);

lancamentosMes
  .filter(l => l.tipo === "despesa" && l.destino === "coeficiente")
  .forEach(l => {
    abaDespesas.push([l.data, l.tipo, l.categoria, l.descricao, Number(l.valor) || 0, l.destino]);
  });

abaDespesas.push(["", "", "", "Subtotal Despesas Comuns", totalCoef, ""]);
abaDespesas.push([]);
abaDespesas.push(["TOTAL GERAL", totalGeral]);
abaDespesas.push([]);

// FUNDO RESERVA DO MÊS
abaDespesas.push(["FUNDO DE RESERVA DO MÊS"]);
abaDespesas.push(["Descrição", "Valor", "AP 2 Quartos", "AP 3 Quartos"]);
abaDespesas.push([
  "Fundo de Reserva (15% de Despesas Comuns)",
  valorFundoReserva,
  fundoReserva2Quartos,
  fundoReserva3Quartos
]);
abaDespesas.push(["Subtotal Fundo Reserva do Mês", valorFundoReserva]);
abaDespesas.push([]);

// CÁLCULO DO CONDOMÍNIO
abaDespesas.push(["CÁLCULO DO CONDOMÍNIO"]);
abaDespesas.push(["Descrição", "Total", "AP 2 Quartos", "AP 3 Quartos"]);
abaDespesas.push([
  "Total despesas comuns com entradas",
  totalDespesasComunsComEntradas,
  condominio2Quartos,
  condominio3Quartos
]);
abaDespesas.push(["Subtotal Cálculo do Condomínio", totalDespesasComunsComEntradas]);
abaDespesas.push([]);

// SALDOS
abaDespesas.push(["SALDOS"]);
abaDespesas.push(["Descrição", "Valor"]);
abaDespesas.push(["Saldo total em conta corrente para mês seguinte", 0]);

const wsLancamentos = XLSX.utils.aoa_to_sheet(abaDespesas);
XLSX.utils.book_append_sheet(wb, wsLancamentos, "Despesas e Receitas");
  // ABA LIVRO CAIXA
  const caixa = mesData.caixa || {};

  const totalDespesas = (mesData.lancamentos || [])
    .filter(l => l.tipo === "despesa")
    .reduce((soma, l) => soma + (Number(l.valor) || 0), 0);

  const saldoInicial = Sistema.moedaParaNumero(caixa.saldoInicial || "R$ 0,00");
  const receitasMes = Sistema.moedaParaNumero(caixa.receitasMes || "R$ 0,00");
  const receitaAplicacao = Sistema.moedaParaNumero(caixa.receitaAplicacao || "R$ 0,00");

  const saldoFinal = saldoInicial + receitasMes + receitaAplicacao - totalDespesas;

  const livroCaixa = [
    {
      Descrição: "Saldo inicial conta corrente",
      Valor: caixa.saldoInicial || "R$ 0,00"
    },
    {
      Descrição: "Receitas do mês",
      Valor: caixa.receitasMes || "R$ 0,00"
    },
    {
      Descrição: "Receita aplicação conta corrente",
      Valor: caixa.receitaAplicacao || "R$ 0,00"
    },
    {
      Descrição: "Despesas",
      Valor: Sistema.formatarMoedaNumero(totalDespesas)
    },
    {
      Descrição: "Saldo conta corrente",
      Valor: Sistema.formatarMoedaNumero(saldoFinal)
    }
  ];

  const wsCaixa = XLSX.utils.json_to_sheet(livroCaixa);
  XLSX.utils.book_append_sheet(wb, wsCaixa, "Livro Caixa");

  // MARCA O MÊS COMO FECHADO
  mesData.fechado = true;
  mesData.dataFechamento = new Date().toLocaleString("pt-BR");

  banco[monthKey] = mesData;
  Database.saveData(banco);

  // BAIXA O EXCEL
  const nomeArquivo = `Balanco Condominio ${formatarMesAno(monthKey)}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);

this.exportarBackupJSON();

alert("Mês fechado, Excel e backup JSON baixados com sucesso.");
},

importarBackupJSON(event) {
  const file = event.target.files[0];

  if (!file) return;

  const confirmar = confirm(
    "Atenção!\n\n" +
    "Importar este backup vai substituir todos os dados atuais do sistema.\n\n" +
    "Deseja continuar?"
  );

  if (!confirmar) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);

      if (!backup.dados || backup.tipo !== "backup_condominio") {
        alert("Arquivo de backup inválido.");
        return;
      }

      Database.saveData(backup.dados);

      if (backup.monthKeyAtual) {
        localStorage.setItem("monthKey", backup.monthKeyAtual);
      }

      alert("Backup restaurado com sucesso.");

      UI.showSection("dashboard");
      UI.loadDashboard();

      if (Sistema.carregarListaBalancos) {
        Sistema.carregarListaBalancos();
      }

      if (Sistema.carregarAnos) {
        Sistema.carregarAnos();
      }

    } catch (erro) {
      console.error("Erro ao importar backup JSON:", erro);
      alert("Não foi possível importar o backup. Verifique o arquivo.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
},

carregarListaBalancos() {
  const banco = Database.getData();
  const select = document.getElementById("mesConsulta");

  if (!select) return;

  select.innerHTML = `<option value="">Selecione um mês</option>`;

  const meses = Object.keys(banco).sort().reverse();

  meses.forEach(monthKey => {
    const mesData = banco[monthKey];

    const status = mesData.fechado ? "Fechado" : "Aberto";

    const option = document.createElement("option");
    option.value = monthKey;
    option.textContent = `${this.formatarMonthKey(monthKey)} - ${status}`;

    select.appendChild(option);
  });
},

carregarAnos() {
  const select = document.getElementById("novoAno");

  if (!select) return;

  const anoAtual = new Date().getFullYear();

  select.innerHTML = "";

  for (let i = anoAtual - 0; i <= anoAtual + 5; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
  }

  select.value = anoAtual;
},

abrirBalancoAnterior() {
  const select = document.getElementById("mesConsulta");
  const monthKey = select.value;

  if (!monthKey) {
    alert("Selecione um balanço para abrir.");
    return;
  }

  localStorage.setItem("monthKey", monthKey);

  UI.loadDashboard();

  if (Sistema.carregarListaBalancos) {
    Sistema.carregarListaBalancos();
  }

  if (Sistema.carregarAnos) {
    Sistema.carregarAnos();
  }

  UI.showSection("dashboard");

  alert(`Balanço ${this.formatarMonthKey(monthKey)} carregado com sucesso.`);
},


exportarBackupJSON() {
  const banco = Database.getData();
  const monthKey = Database.getMonthKey();

  const backup = {
    tipo: "backup_condominio",
    versao: "1.0",
    dataBackup: new Date().toISOString(),
    monthKeyAtual: monthKey,
    dados: banco
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Backup Balanco Condominio ${formatarMesAno(monthKey)}.json`;
  a.click();

  URL.revokeObjectURL(url);
},

formatarMonthKey(monthKey) {
  const [ano, mes] = monthKey.split("-");

  const nomesMeses = {
    "01": "Janeiro",
    "02": "Fevereiro",
    "03": "Março",
    "04": "Abril",
    "05": "Maio",
    "06": "Junho",
    "07": "Julho",
    "08": "Agosto",
    "09": "Setembro",
    "10": "Outubro",
    "11": "Novembro",
    "12": "Dezembro"
  };

  return `${nomesMeses[mes] || mes}/${ano}`;
},
};



const Storage = {
  getMonthKey() {
    return localStorage.getItem("monthKey") || this.getMesAtual();
  },

  getMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    return `${ano}-${mes}`;
  },

  save() {
    localStorage.setItem("condominioData", JSON.stringify(data));
  }
};

const banco = Database.getData();
const monthKey = Database.getMonthKey();

if (!banco[monthKey]) {
  banco[monthKey] = {
    apartamentos: {},
    lancamentos: [],
    parametros: {
      agua: {
        taxaMinima: 52.33,
        limiteMinimo: 5,
        valorExcedente: 10.56,
        valorFatura: 0
      },
      gas: {
        valorM3: 16.48
      }
    },
    caixa: {
      saldoInicial: "R$ 0,00",
      receitasMes: "R$ 0,00",
      receitaAplicacao: "R$ 0,00"
    }
  };

  Database.saveData(banco);
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof Sistema !== "undefined" && Sistema.carregarListaBalancos) {
    Sistema.carregarListaBalancos();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  if (typeof Sistema !== "undefined" && Sistema.carregarAnos) {
    Sistema.carregarAnos();
  }

  if (typeof Sistema !== "undefined" && Sistema.carregarListaBalancos) {
    Sistema.carregarListaBalancos();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const campoSenha = document.getElementById("passwordInput");
  if (campoSenha) campoSenha.focus();
});

document.getElementById("passwordInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    Auth.login();
  }
});
