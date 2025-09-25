const express = require('express')
const app = express()
const PORT = 4000
const sql = require("mssql");
const cors = require('cors');
const path = require('path');
const ExcelJS = require("exceljs");
const moment = require("moment");
const { Sequelize, QueryTypes } = require("sequelize");

app.use(cors());
app.use(express.json());

const config = {
  user: "Sa",
  password: "P@ssw0rd2023@#$",
  server: "192.168.1.43",
  database: "SOUTTOMAYOR",
  options: {
    encrypt: false, // ou true, dependendo da sua config
    trustServerCertificate: true,
  },
    requestTimeout: 60000 // 2 minutos
};
// Rota principal

(async () => {
  try {
    await sql.connect(config);
    console.log("✅ Conectado com sucesso ao banco!");
  } catch (err) {
    console.error("❌ Erro na conexão:", err.message);
  }
})();

app.get("/", (req, res) => {
  res.send("Servidor Node.js rodando! 🚀");
});
function statusEvento(row) {
  
  return row;
}

// Função que busca valores
async function getValoresEvento(dataInicio, dataFim) {
  try {
const pool = await sql.connect(config);

    const query = `SELECT
    T1.DOCUMENTO,
	t1.TPDOCTO,
    T1.NOME,
    EVE.DESCRICAO,
	CASE
    WHEN EVE.PK_EVENTO IN (106,126,130,113,127,131) THEN 'Aniversário'
    WHEN EVE.PK_EVENTO IN (52,120,121,122,123,124,134,115,116,117,118,119) THEN 'Infantil'
    WHEN EVE.PK_EVENTO IN (80,136,83,81,82,110,102) THEN 'Bodas'
    WHEN EVE.PK_EVENTO IN (140,57,58,133) THEN 'Café Da Manhã'
    WHEN EVE.PK_EVENTO IN (59,84) THEN 'Camarim'
    WHEN EVE.PK_EVENTO IN (49,100) THEN 'Casamento'
    WHEN EVE.PK_EVENTO IN (85,89) THEN 'Natal'
    WHEN EVE.PK_EVENTO IN (56,125) THEN 'Batizado'
    WHEN EVE.PK_EVENTO IN (60,103,107,114) THEN 'Chá'
    WHEN EVE.PK_EVENTO IN (61) THEN 'Churrasco'
    WHEN EVE.PK_EVENTO IN (139,63,65,101) THEN 'Coquetel'
    WHEN EVE.PK_EVENTO IN (64) THEN 'Congresso'
    WHEN EVE.PK_EVENTO IN (69,75) THEN 'Jantar'
    WHEN EVE.PK_EVENTO IN (109) THEN 'Encomenda'
    WHEN EVE.PK_EVENTO IN (70) THEN 'Evento'
    WHEN EVE.PK_EVENTO IN (66) THEN 'Feijoada'
    WHEN EVE.PK_EVENTO IN (68,93) THEN 'Stand'
    WHEN EVE.PK_EVENTO IN (105,67,97,98,73) THEN 'Temático'
    WHEN EVE.PK_EVENTO IN (71,128,129,72) THEN 'Formatura'
    WHEN EVE.PK_EVENTO IN (74,62,138,77,95) THEN 'Coffee Break'
    WHEN EVE.PK_EVENTO IN (86,88,87) THEN 'Lançamento'
    WHEN EVE.PK_EVENTO IN (76) THEN 'Lanche'
    WHEN EVE.PK_EVENTO IN (112) THEN 'Locação de Materiais'
    WHEN EVE.PK_EVENTO IN (90) THEN 'Noivado'
    WHEN EVE.PK_EVENTO IN (137,141) THEN 'Almoço'
    WHEN EVE.PK_EVENTO IN (132) THEN 'Petit Comitê'
    WHEN EVE.PK_EVENTO IN (91) THEN 'Premiação'
    WHEN EVE.PK_EVENTO IN (92) THEN 'Reveillon'
    WHEN EVE.PK_EVENTO IN (99) THEN 'Seminário'
    WHEN EVE.PK_EVENTO IN (94) THEN 'Vernissage'
    ELSE 'Outros'
	END AS INDICADORES,
    FUNC.NOMEINTERNO,
    T1.DTINC AS DTINCLUSAO, 
ISNULL(CONT.DTINC, T1.DTALT) AS DTFECHAMENTO,
    T1.DTEVENTO,
    EVENTO.CONVIDADOS,
    CONT.DESCONTO,
	t1.Totaldocto,
	ISNULL(AJUSTE.TOTALAJUSTE, 0),
    T1.TOTALDOCTO + ISNULL(AJUSTE.TOTALAJUSTE, 0) AS TOTALDOC,

    -- Valor por participante
	ISNULL( (T1.TOTALDOCTO + ISNULL(AJUSTE.TOTALAJUSTE, 0)) / NULLIF(EVENTO.CONVIDADOS, 0), 0) AS VALORPP,


    -- Somatório de materiais (Locação e Açúcares)
    SUM(
        CASE 
            WHEN T3.IDX_NEGOCIO = 'Locação de Materiais'
              OR (T3.IDX_NEGOCIO = 'Estoque Almoxarifado' AND T3.IDX_LINHA = 'Açúcares')
            THEN T2.L_PRECOTOTAL + COALESCE(T4.QUANTIDADE * T4.PRECO, 0)
            ELSE 0
        END
    ) AS VALOR_MATERIAIS,

    -- Materiais por participante
    ISNULL(
        SUM(
            CASE 
                WHEN T3.IDX_NEGOCIO = 'Locação de Materiais'
                  OR (T3.IDX_NEGOCIO = 'Estoque Almoxarifado' AND T3.IDX_LINHA = 'Açúcares')
                THEN T2.L_PRECOTOTAL + COALESCE(T4.QUANTIDADE * T4.PRECO, 0)
                ELSE 0
            END
        ) / NULLIF(EVENTO.CONVIDADOS, 0),
        0
    ) AS MATERIAISPP,

    -- Quantidade de itens
    COUNT(DISTINCT T2.PK_MOVTOPED) AS QTD_ITENS,

    -- Preço médio por item
    ISNULL(
        (T1.TOTALDOCTO + ISNULL(AJUSTE.TOTALAJUSTE, 0)) / NULLIF(COUNT(DISTINCT T2.PK_MOVTOPED), 0),
        0
    ) AS PRECOMEDIOITEM,

    T1.SITUACAO,
	CASE T1.SITUACAO
        WHEN 'B' THEN 'OK'
        WHEN 'V' THEN 'OK'
        WHEN 'F' THEN 'OK'
        ELSE (NULL)
    END AS CONVERTIDO,
	CASE T1.SITUACAO
        WHEN 'C' THEN 'Perdido'
        WHEN 'N' THEN 'Perdido'
        WHEN 'Y' THEN 'Perdido'
        ELSE NULL
    END AS 'CANCELADO/PERDIDO'

FROM TPADOCTOPED T1
LEFT JOIN TPAMOVTOPED T2 ON T1.PK_DOCTOPED = T2.RDX_DOCTOPED
LEFT JOIN TPAPRODUTO T3 ON T3.CODPRODUTO = T2.CODPRODUTO
LEFT JOIN TPAAJUSTEPEDITEM T4 ON T4.IDX_MOVTOPED = T2.PK_MOVTOPED
LEFT JOIN TPAEVENTOORC EVENTO ON EVENTO.PK_EVENTOORC = T1.IDX_DOCTOEVENTO
LEFT JOIN TPAEVENTO EVE ON EVE.PK_EVENTO = EVENTO.IDX_EVENTO
LEFT JOIN TPAFUNCIONARIO FUNC ON FUNC.PK_FUNCIONARIO = T1.IDX_VENDEDOR1
LEFT JOIN TPACONTRATOMOV CONTMOV ON CONTMOV.PK_CONTRATOMOV = T1.IDX_CONTRATOMOV
LEFT JOIN TPACONTRATO CONT ON CONT.PK_CONTRATO = CONTMOV.RDX_CONTRATO

-- Subquery que consolida ajustes por documento
LEFT JOIN (
    SELECT RDX_DOCTOPED, SUM(TOTALVALOR) AS TOTALAJUSTE
    FROM TPAAJUSTEPED
    GROUP BY RDX_DOCTOPED
) AJUSTE ON AJUSTE.RDX_DOCTOPED = T1.PK_DOCTOPED

WHERE T1.TPDOCTO in ('OR','EC')
AND CONVERT(DATE, ISNULL(cont.dtinc, T1.DTINC)) BETWEEN '${dataInicio}' AND '${dataFim}'
  AND T1.NOME NOT IN ('Contato')


GROUP BY
	EVE.PK_EVENTO,
	t1.TPDOCTO,
    T1.SITUACAO,
    T1.TOTALDOCTO,
    CONT.DESCONTO,
    EVENTO.CONVIDADOS,
    ISNULL(CONT.DTINC, T1.DTALT), -- aqui
    T1.DOCUMENTO,
    FUNC.NOMEINTERNO,
    T1.NOME,
    T1.DTINC,
    EVE.DESCRICAO,
    T1.DTEVENTO,
    T1.CNPJCPF,
    AJUSTE.TOTALAJUSTE

ORDER BY ISNULL(CONT.DTINC, T1.DTALT);
`;

    const result = await pool.request().query(query);
    return result.recordset.map(statusEvento);
  } catch (err) {
    console.error("Erro ao buscar eventos:", err.message);
    return [];
  }
}


// Função principal
(async () => {
  try {
    const eventos18 = await getValoresEvento(20180101, 20190101);
    const eventos19 = await getValoresEvento(20190101, 20200101);
    const eventos23 = await getValoresEvento(20230101, 20240101);
    const eventos24 = await getValoresEvento(20240101, 20250101);
    const eventos25 = await getValoresEvento(20250101, 20260101);

    // Criando arquivo Excel
    const workbook = new ExcelJS.Workbook();

    function addSheet(name, data) {
      const sheet = workbook.addWorksheet(name);
      if (data.length > 0) {
        sheet.columns = Object.keys(data[0]).map((key) => ({
          header: key,
          key: key,
          width: 20,
        }));
        sheet.addRows(data);
      }
    }

    addSheet("2018", eventos18);
    addSheet("2019", eventos19);
    addSheet("2023", eventos23);
    addSheet("2024", eventos24);
    addSheet("2025", eventos25);

    await workbook.xlsx.writeFile("materiais_pp.xlsx");
    console.log("Arquivo Excel gerado com sucesso!");
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await sql.close();
  }
})();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
