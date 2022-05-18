const fs = require("fs");
const _ = require("lodash");

// Remove apostrofos de uma string
const removePunctuation = s => {
  return s.replace(/"/g, "");
};

// Remove caracteres não numéricos de um número de telefone
const formatPhone = phone => {
  return phone.replace(/\D/g, "");
};

// Extrai email da string
const formatEmail = email => {
  return email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/g);
};

// Salva um objeto para o arquivo output.json
const saveJSON = jsonData => {
  fs.writeFile("output.json", jsonData, err => {
    if (err) {
      console.log(err);
    }
  });
};

// Leitura e extração de dados
fs.readFile("./input.csv", (err, data) => {
  if (err) {
    return console.log(err);
  }

  //Converte e armazena o conteúdo de um arquivo csv em um buffer
  const bufferString = _.toString(data);

  const lines = _.split(bufferString, "\n");
  const rows = _.slice(lines, 1, lines.length);
  const columns = _.split(removePunctuation(lines[0]), ",").map(item =>
    _.trim(item, "\r"),
  );
  let jsonObj = [];

  for (let i = 0; i < rows.length; i++) {
    let obj = {};
    let addresses = [];
    let groups = [];

    rows[i] = _.split(rows[i], ",").map(item => _.trim(item, "\r"));

    for (let j = 0; j < columns.length; j++) {
      const [header1, header2, header3] = _.split(columns[j], " ");

      if (header1 === "invisible" || header1 === "see_all") {
        obj[header1] =
          rows[i][j] === "1" || rows[i][j] === "yes" ? true : false;
      } else if (header1 === "email" || header1 === "phone") {
        // Agrupa os campos sinalizados com phone e email em "addresses"
        const address = {
          type: header1,
          tags: header3 ? [header2, header3] : [header2],
          address:
            header1 === "phone"
              ? `55${formatPhone(rows[i][j])}`
              : formatEmail(rows[i][j]),
        };

        // Descarta phones e emails incompletos
        if (address.type === "phone" && address.address.length === 13) {
          addresses.push(address);
        } else if (address.type === "email" && address.address) {
          addresses.push(address);
        } else {
        }

        obj.addresses = addresses;
      } else if (header1 === "group") {
        // Agrupa os campos sinalizados com group em "groups"
        const group = removePunctuation(rows[i][j]);

        if (group) {
          groups.push(group);
        }

        obj.groups = _.flatMapDeep(groups);
      } else {
        obj[header1] = rows[i][j];
      }
    }
    jsonObj.push(obj);
  }

  // Converte para output.json
  saveJSON(JSON.stringify(jsonObj));
});
