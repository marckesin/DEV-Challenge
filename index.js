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

// Salva um objeto para um arquivo .json
const saveJSON = jsonData => {
  fs.writeFile("output.json", jsonData, err => {
    if (err) {
      console.log(err);
    }
  });
};

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
        const address = {
          type: header1,
          tags: header3 ? [header2, header3] : [header2],
          address:
            header1 === "phone" ? `55${formatPhone(rows[i][j])}` : rows[i][j],
        };

        if (address.type === "phone" && address.address.length === 13) {
          addresses.push(address);
        } else if (address.type === "email" && address.address) {
          addresses.push(address);
        } else {
        }

        obj.addresses = addresses;
      } else if (header1 === "group") {
        const r = rows[i][j].replace(/\W/g, " ");

        groups.push(rows[i][j]);
        obj.groups = groups;
      } else {
        obj[columns[j]] = rows[i][j];
      }
    }
    jsonObj.push(obj);
  }
  saveJSON(JSON.stringify(jsonObj));
});
