const Database = {

  getMonthKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
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

  // Blindagem estrutural
  if (!data[monthKey].fundoPercentual)
    data[monthKey].fundoPercentual = 15;

  if (!data[monthKey].parametros) {
    data[monthKey].parametros = {
      agua: {
        taxaMinima: 52.33,
        limiteMinimo: 5,
        valorExcedente: 10.56,
        valorFatura: 0
      },
      gas: {
        valorM3: 16.48
      }
    };
  }

  if (!data[monthKey].apartamentos)
    data[monthKey].apartamentos = {};

  if (!data[monthKey].despesas)
    data[monthKey].despesas = [];

  if (!data[monthKey].caixa)
    data[monthKey].caixa = [];

  this.saveData(data);

  return data[monthKey];
}
};

// APARTAMENTOS FIXOS

Database.getApartamentos = function() {
  return JSON.parse(localStorage.getItem("condo_apartamentos")) || [];
};

Database.saveApartamentos = function(lista) {
  localStorage.setItem("condo_apartamentos", JSON.stringify(lista));
};