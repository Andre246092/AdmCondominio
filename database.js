const Database = {

  getMonthKey() {
  const monthKeySalvo = localStorage.getItem("monthKey");

  if (monthKeySalvo) {
    return monthKeySalvo;
  }

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  return `${ano}-${mes}`;
  },

  getData() {
    return JSON.parse(localStorage.getItem("condo_data")) || {};
  },

  saveData(data) {
    localStorage.setItem("condo_data", JSON.stringify(data));
  },

  getCurrentMonth() {
    const data = this.getData();
    const monthKey = this.getMonthKey();

    if (!data[monthKey]) {
      data[monthKey] = {};
    }

    if (data[monthKey].fundoPercentual == null) {
      data[monthKey].fundoPercentual = 15;
    }

    if (!data[monthKey].parametros) {
      data[monthKey].parametros = {};
    }

    if (!data[monthKey].parametros.agua) {
      data[monthKey].parametros.agua = {
        taxaMinima: 52.33,
        limiteMinimo: 5,
        valorExcedente: 10.56,
        valorFatura: 0
      };
    }

    if (!data[monthKey].parametros.gas) {
      data[monthKey].parametros.gas = {
        valorM3: 16.48
      };
    }

    if (!data[monthKey].apartamentos) {
      data[monthKey].apartamentos = {};
    }

    if (!data[monthKey].despesas) {
      data[monthKey].despesas = [];
    }

    if (!data[monthKey].caixa) {
  data[monthKey].caixa = {
    saldoInicial: "R$ 0.000,00",
    receitasMes: "R$ 0,00",
    receitaAplicacao: "R$ 0,00"
  };
}

    this.saveData(data);
    return data[monthKey];
  }
};

Database.getApartamentos = function () {
  return JSON.parse(localStorage.getItem("condo_apartamentos")) || [];
};

Database.saveApartamentos = function (lista) {
  localStorage.setItem("condo_apartamentos", JSON.stringify(lista));
};