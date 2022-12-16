const express = require('express');

const { listarContas, criarConta, atualizarConta, excluirConta, depositar, sacar, transferir, saldo, extrato } = require("../controladores/controladores");

const roteador = express();

roteador.get("/contas", listarContas);
roteador.post("/contas", criarConta);
roteador.put("/contas/:numeroConta/usuario", atualizarConta);
roteador.delete("/contas/:numeroConta", excluirConta);
roteador.post("/transacoes/depositar", depositar);
roteador.post("/transacoes/sacar", sacar);
roteador.post("/transacoes/transferir", transferir);
roteador.get("/contas/saldo", saldo);
roteador.get("/contas/extrato", extrato);





module.exports = roteador;

