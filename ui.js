/* ================================
CONTROLE DE TELAS
================================ */

const UI = {

  showSection(id) {

    document.querySelectorAll(".section").forEach(sec => {
      sec.classList.remove("active");
    });

    const section = document.getElementById(id);
    if (section) {
      section.classList.add("active");
    }

    switch(id) {
      case "apartamentos":
        Apartamentos.render();
        break;

      case "leituras":
        Leituras.render();
        break;

      case "despesas":
        Lancamentos.render();
        break;

      case "extratos":
        Extratos.init();
        break;

      case "config":
        if (typeof Config !== "undefined" && Config.loadParametros) {
          Config.loadParametros();
        }
        break;

      default:
        break;
    }
  },

  loadDashboard() {
    const monthKey = Database.getMonthKey();
    document.getElementById("mesAtual").innerText = "Competência: " + monthKey;

    const monthData = Database.getCurrentMonth();

    document.getElementById("saldoAtual").innerText = "R$ 0,00";
    document.getElementById("fundoAcumulado").innerText =
      monthData?.fundo?.toFixed ? "R$ " + monthData.fundo.toFixed(2) : "R$ 0,00";
    document.getElementById("despesasMes").innerText = "R$ 0,00";
  }

};

/* ================================
   APARTAMENTOS
================================ */

const Apartamentos = {

  add() {

    const numero = document.getElementById("aptNumero").value;
    const responsavel = document.getElementById("aptResponsavel").value;
    const coeficiente = parseFloat(document.getElementById("aptCoeficiente").value);

    if (!numero || !coeficiente) {
      alert("Preencha número e coeficiente.");
      return;
    }

    const lista = Database.getApartamentos();

    lista.push({
      numero,
      responsavel,
      coeficiente
    });

    Database.saveApartamentos(lista);

    document.getElementById("aptNumero").value = "";
    document.getElementById("aptResponsavel").value = "";
    document.getElementById("aptCoeficiente").value = "";

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
          <td>${apt.coeficiente}</td>
          <td>
            <button onclick="Apartamentos.remove(${index})">
              Excluir
            </button>
          </td>
        </tr>
      `;

    });

  }

};


/* ================================
   LEITURAS ÁGUA E GÁS
================================ */

const Leituras = {

 render() {

    const apartamentos = Database.getApartamentos();
    const monthData = Database.getCurrentMonth();
    const tbody = document.getElementById("tabelaLeituras");

    const valorFatura = parseFloat(monthData.parametros.agua.valorFatura) || 0;

    document.getElementById("valorFaturaAgua").value = valorFatura;

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

      const consumoAgua = aguaAtu - aguaAnt;
      const consumoGas = gasAtu - gasAnt;

      const valorAgua = this.calcularAgua(consumoAgua, monthData);
      const valorGas = this.calcularGas(consumoGas, monthData);

      somaAguaApartamentos += valorAgua;

      tbody.innerHTML += `
        <tr>
          <td>${apt.numero}</td>
          <td>${aguaAnt}</td>
          <td><input type="number" value="${aguaAtu}" onchange="Leituras.update('${apt.numero}','aguaAtual',this.value)"></td>
          <td>${consumoAgua > 0 ? consumoAgua : 0}</td>
          <td>R$ ${valorAgua.toFixed(2)}</td>
          <td>${gasAnt}</td>
          <td><input type="number" value="${gasAtu}" onchange="Leituras.update('${apt.numero}','gasAtual',this.value)"></td>
          <td>${consumoGas > 0 ? consumoGas : 0}</td>
          <td>R$ ${valorGas.toFixed(2)}</td>
        </tr>
      `;
    });

    // -------------------------
    // Mostrar Diferença de Gastos
    // -------------------------
    const diferencaGastos = valorFatura - somaAguaApartamentos;

    const diffRow = document.getElementById("diferencaGastos");
    if(diffRow) {
      diffRow.innerText = "Diferença de Gastos: R$ " + diferencaGastos.toFixed(2);
    } else {
      // cria elemento se não existir
      const div = document.createElement("div");
      div.id = "diferencaGastos";
      div.style.marginTop = "10px";
      div.style.fontWeight = "bold";
      div.innerText = "Diferença de Gastos: R$ " + diferencaGastos.toFixed(2);
      tbody.parentNode.parentNode.insertBefore(div, tbody.parentNode.nextSibling);
    }

    Database.saveData(Database.getData());
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

    data[monthKey].apartamentos[apto][campo] = parseFloat(valor) || 0;

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

    const data = Database.getData();
    const monthKey = Database.getMonthKey();

    data[monthKey].parametros.agua.valorFatura =
      parseFloat(valor) || 0;

    Database.saveData(data);

  }

};

const Config = {

  loadParametros() {
    const monthData = Database.getCurrentMonth();

    document.getElementById("taxaMinima").value =
      monthData.parametros.agua.taxaMinima || 0;

    document.getElementById("limiteMinimo").value =
      monthData.parametros.agua.limiteMinimo || 0;

    document.getElementById("valorExcedente").value =
      monthData.parametros.agua.valorExcedente || 0;

    document.getElementById("valorGas").value =
      monthData.parametros.gas.valorM3 || 0;
  },

  saveParametros() {
    const data = Database.getData();
    const monthKey = Database.getMonthKey();

    data[monthKey].parametros.agua.taxaMinima =
      parseFloat(document.getElementById("taxaMinima").value) || 0;

    data[monthKey].parametros.agua.limiteMinimo =
      parseFloat(document.getElementById("limiteMinimo").value) || 0;

    data[monthKey].parametros.agua.valorExcedente =
      parseFloat(document.getElementById("valorExcedente").value) || 0;

    data[monthKey].parametros.gas.valorM3 =
      parseFloat(document.getElementById("valorGas").value) || 0;

    Database.saveData(data);

    alert("Parâmetros atualizados");
  }

};


//------------------------//
//MENU DESPESAS E RECEITAS//
//------------------------//
const Lancamentos = {

init(){
document.getElementById("lanData").valueAsDate = new Date();
this.render();
},

add(){

const data = document.getElementById("lanData").value;
const tipo = document.getElementById("lanTipo").value;
const categoria = document.getElementById("lanCategoria").value;
const descricao = document.getElementById("lanDescricao").value;

// valor com R$ -> precisa converter para número
let valor = document.getElementById("lanValor").value;
valor = parseFloat(valor.replace("R$","").replace(/\./g,"").replace(",","."));

const destino = document.getElementById("lanDestino").value;

if(!data){
alert("Informe a data");
return;
}

if(!valor || valor <= 0){
alert("Valor deve ser maior que zero");
return;
}

const banco = Database.getData();
const mes = Database.getMonthKey();

if(!banco[mes]){
banco[mes] = { apartamentos:{}, lancamentos:[], parametros:{agua:{}, gas:{}} };
}
if(!banco[mes].lancamentos){
banco[mes].lancamentos = [];
}

banco[mes].lancamentos.push({
id: Date.now(),
data,
tipo,
categoria,
descricao,
valor,
destino
});

Database.saveData(banco);

document.getElementById("lanDescricao").value = "";
document.getElementById("lanValor").value = "";

this.render();

},

remove(id){
const banco = Database.getData();
const mes = Database.getMonthKey();
if(!banco[mes] || !banco[mes].lancamentos) return;

banco[mes].lancamentos = banco[mes].lancamentos.filter(l => l.id !== id);
Database.saveData(banco);
this.render();
},

render(){
const mesData = Database.getCurrentMonth();
if(!mesData) return;

const lista = mesData.lancamentos || [];
const tbody = document.getElementById("listaLancamentos");
if(!tbody) return;

tbody.innerHTML = "";

let totalReceitas = 0;
let totalIgual = 0;
let totalCoef = 0;
let totalFundo = 0;

lista.forEach(l => {

if(l.tipo === "receita"){
totalReceitas += l.valor;
}

if(l.tipo === "despesa" && l.destino === "igual"){
totalIgual += l.valor;
}

if(l.tipo === "despesa" && l.destino === "coeficiente"){
totalCoef += l.valor;
}

if(l.tipo === "despesa" && l.destino === "fundo"){
totalFundo += l.valor;
}

tbody.innerHTML += `
<tr>
<td>${formatarData(l.data)}</td>
<td>${l.tipo}</td>
<td>${l.categoria}</td>
<td>${l.descricao}</td>
<td>${formatarValor(l.valor)}</td>
<td>${l.destino}</td>
<td>
<button onclick="Lancamentos.remove(${l.id})">Excluir</button>
</td>
</tr>
`;
});

document.getElementById("totalReceitas").innerText =
"Receitas: " + formatarValor(totalReceitas);

document.getElementById("totalDespesasIgual").innerText =
"Despesas divididas por igual: " + formatarValor(totalIgual);

document.getElementById("totalDespesasCoef").innerText =
"Despesas comuns (coeficiente): " + formatarValor(totalCoef);

document.getElementById("totalDespesasFundo").innerText =
"Despesas fundo de reserva: " + formatarValor(totalFundo);
}

};

// -----------------
// Funções auxiliares
// -----------------
function formatarData(dataStr){
if(!dataStr) return "";
const d = new Date(dataStr);
const dia = String(d.getDate()).padStart(2,'0');
const mes = String(d.getMonth()+1).padStart(2,'0');
const ano = d.getFullYear();
return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor){
return "R$ " + valor.toFixed(2).replace(".", ",");
}

// Máscara para o input de valor
const inputValor = document.getElementById("lanValor");

if(inputValor){
inputValor.addEventListener("input", function(e){

let cursor = this.selectionStart;
let valor = this.value.replace(/\D/g,'');

valor = (valor/100).toFixed(2);

this.value = "R$ " + valor.replace(".", ",");

this.setSelectionRange(cursor, cursor);

});
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

function calcularCondominio(){

const mesData = Database.getCurrentMonth();
if(!mesData) return;

const apartamentos = Database.getApartamentos();
const aptosMes = mesData.apartamentos || {};


let totalIgual = 0;
let totalCoef = 0;
const lancamentos = mesData.lancamentos || [];
// soma despesas
lancamentos.forEach(l => {

if(l.tipo === "despesa" && l.destino === "igual"){
totalIgual += l.valor;
}

if(l.tipo === "despesa" && l.destino === "coeficiente"){
totalCoef += l.valor;
}

});

const qtdAptos = apartamentos.length;
const valorIgual = totalIgual / qtdAptos;

const tabela = document.getElementById("tabelaCondominio");
tabela.innerHTML = "";

apartamentos.forEach(apt => {

const numero = apt.numero;
const coef = parseFloat(apt.coeficiente) || 0;

const valorCoef = totalCoef * coef;

const dados = aptosMes[numero] || {};

const aguaAnterior = parseFloat(dados.aguaAnterior) || 0;
const aguaAtual = parseFloat(dados.aguaAtual) || 0;

const gasAnterior = parseFloat(dados.gasAnterior) || 0;
const gasAtual = parseFloat(dados.gasAtual) || 0;

const consumoAgua = aguaAtual - aguaAnterior;
const consumoGas = gasAtual - gasAnterior;

// parâmetros
const taxaMinima = mesData.parametros?.agua?.taxaMinima || 0;
const limiteMinimo = mesData.parametros?.agua?.limiteMinimo || 0;
const valorExcedente = mesData.parametros?.agua?.valorExcedente || 0;
const valorGasM3 = mesData.parametros?.gas?.valorM3 || 0;

// cálculo da água
let valorAgua = 0;

if(consumoAgua > 0){

if(consumoAgua <= limiteMinimo){
valorAgua = taxaMinima;
}else{
const excedente = consumoAgua - limiteMinimo;
valorAgua = taxaMinima + (excedente * valorExcedente);
}

}

// cálculo gás
const valorGas = consumoGas > 0 ? consumoGas * valorGasM3 : 0;

const total = valorIgual + valorCoef + valorAgua + valorGas;

tabela.innerHTML += `
<tr>
<td>${numero}</td>
<td>${formatarValor(valorIgual)}</td>
<td>${formatarValor(valorCoef)}</td>
<td>${formatarValor(valorAgua)}</td>
<td>${formatarValor(valorGas)}</td>
<td><strong>${formatarValor(total)}</strong></td>
</tr>
`;

});

}



//-------------//
//MENU EXTRATOS//
//-------------//

const Extratos = {

init() {
const apartamentos = Database.getApartamentos();
const div = document.getElementById("listaExtratos");

div.innerHTML = "";

apartamentos.forEach(ap => {
div.innerHTML += `
<label style="display:block">
<input type="checkbox" value="${ap.numero}">
${ap.numero} - ${ap.responsavel}
</label>

`;
});
},

gerar() {
const selecionados = [...document.querySelectorAll("#listaExtratos input:checked")]
.map(c => c.value);

if (selecionados.length === 0) {
alert("Selecione ao menos um apartamento");
return;
}

const mesData = Database.getCurrentMonth();
const aptosMes = mesData.apartamentos || {};
const apartamentos = Database.getApartamentos();
const lancamentos = mesData.lancamentos || [];

const resultado = document.getElementById("resultadoExtratos");
resultado.innerHTML = "";

// -----------------------------
// 1️⃣ Calcular totais de despesas
// -----------------------------
let totalIgual = 0;
let totalCoef = 0;

lancamentos.forEach(l => {
if (l.tipo === "despesa" && l.destino === "igual") totalIgual += l.valor;
if (l.tipo === "despesa" && l.destino === "coeficiente") totalCoef += l.valor;
});

const qtdAptos = apartamentos.length;
const valorIgual = totalIgual / qtdAptos;

// -----------------------------
// 2️⃣ Loop para gerar extrato de cada apartamento selecionado
// -----------------------------
selecionados.forEach(numero => {

const ap = apartamentos.find(a => a.numero == numero);
const dados = aptosMes[numero] || {};

const aguaAnterior = dados.aguaAnterior || 0;
const aguaAtual = dados.aguaAtual || 0;
const gasAnterior = dados.gasAnterior || 0;
const gasAtual = dados.gasAtual || 0;

const consumoAgua = aguaAtual - aguaAnterior;
const consumoGas = gasAtual - gasAnterior;

const taxaMinima = mesData.parametros?.agua?.taxaMinima || 0;
const limiteMinimo = mesData.parametros?.agua?.limiteMinimo || 0;
const valorExcedente = mesData.parametros?.agua?.valorExcedente || 0;
const valorGasM3 = mesData.parametros?.gas?.valorM3 || 0;

let valorAgua = 0;
if (consumoAgua <= limiteMinimo) {
valorAgua = taxaMinima;
} else {
valorAgua = taxaMinima + ((consumoAgua - limiteMinimo) * valorExcedente);
}

const valorGas = consumoGas * valorGasM3;

const coef = parseFloat(ap.coeficiente) || 0;
const valorCoef = totalCoef * coef;
const geralCondominio = valorIgual + valorCoef;

const totalTitulo = geralCondominio + valorAgua + valorGas; // depois podemos adicionar fundo/extras/multas

const hoje = new Date();
const mesReferencia = hoje.toLocaleString("pt-BR",{month:"long", year:"numeric"});
const vencimento = "15/" + (hoje.getMonth()+1).toString().padStart(2,"0") + "/" + hoje.getFullYear();

resultado.innerHTML += `

<div class="extrato">

<h3 style="text-align:center">EXTRATO MENSAL</h3>

<p><b>NOME:</b> ${ap.responsavel}</p>
<p><b>APARTAMENTO:</b> ${numero}</p>
<p><b>MÊS DE REFERÊNCIA:</b> ${mesReferencia}</p>
<p><b>VENCIMENTO:</b> ${vencimento}</p>




<h4 style="text-align:center">GÁS</h4>

<table>

<tr>
<th>Leitura anterior</th>
<th>Leitura atual</th>
<th>Consumo</th>
<th>Valor</th>
</tr>

<tr>
<td>${gasAnterior}</td>
<td>${gasAtual}</td>
<td>${consumoGas}</td>
<td>R$ ${valorGas.toFixed(2)}</td>
</tr>

</table>




<h4 style="text-align:center">ÁGUA</h4>

<table>

<tr>
<th>Leitura anterior</th>
<th>Leitura atual</th>
<th>Consumo</th>
<th>Valor</th>
</tr>

<tr>
<td>${aguaAnterior}</td>
<td>${aguaAtual}</td>
<td>${consumoAgua}</td>
<td>R$ ${valorAgua.toFixed(2)}</td>
</tr>

</table>




<h4 style="text-align:center">OUTROS LANÇAMENTOS</h4>

GERAL CONDOMÍNIO: R$ ${geralCondominio.toFixed(2)}

<p>
FUNDO DE RESERVA DO MÊS:
<input type="number" value="0">
</p>

<p>
EXTRAS:
<input type="number" value="0">
</p>

<p>
MULTAS / TAXA DE MUDANÇA:
<input type="number" value="0">
</p>




<h3>
VALOR DO TÍTULO DO MÊS:
<strong>R$ ${totalTitulo.toFixed(2)}</strong>
</h3>

<hr>

</div>

`;

});

}

};

function copiarExtrato() {

const texto = document.getElementById("resultadoExtratos").innerText;

navigator.clipboard.writeText(texto);

alert("Extrato copiado para enviar no WhatsApp");

}

function imprimirExtratos() {

window.print();

}



function gerarPDF(){

const element = document.getElementById("resultadoExtratos");

const opt = {

margin: 5,
filename: 'extratos-condominio.pdf',
image: { type: 'jpeg', quality: 0.98 },
html2canvas: { scale: 2 },
jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }

};

html2pdf().set(opt).from(element).save();

}
document.addEventListener("DOMContentLoaded", function(){

if(document.getElementById("listaLancamentos")){
Lancamentos.init();
}

});
