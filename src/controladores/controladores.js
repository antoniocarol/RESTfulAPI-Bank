const bancodedados = require("../bancodedados/bancodedados");
const { format } = require('date-fns');


let numero = 1;


let listarContas = (req, res) => {
    const { senha_banco } = req.query;
    if (!senha_banco) {
        return res.status(400).json({ mensagem: "Por favor, insira a senha!" });
    }

    if (!senha_banco || senha_banco !== bancodedados.banco.senha) {
        return res.status(400).json({ mensagem: "Senha inserida incorreta!" });
    }

    return res.status(200).send(bancodedados.contas);
}

let criarConta = (req, res) => {
    let usuario = {
        nome: nome,
        cpf: cpf,
        data_nascimento: data_nascimento,
        telefone: telefone,
        email: email
    } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" });
    }

    const contaEmail = bancodedados.contas.find((contaEmail) =>
        contaEmail.usuario.email === email);

    const contaCPF = bancodedados.contas.find((contaCPF) =>
        contaCPF.usuario.cpf === cpf);

    if (contaEmail || contaCPF) {
        return res.status(404).json({ mensagem: 'Email ou CPF já cadastrado!' });
    }

    try {
        usuario = { numero, saldo: 0, usuario };
        numero++;
        bancodedados.contas.push(usuario);
        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}
let atualizarConta = (req, res) => {
    const {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email
    } = req.body;

    let { numeroConta } = req.params;

    // LEVANTAMENTO DAS EXCECOES
    const conta = bancodedados.contas.find((conta) =>
        conta.numero === Number(numeroConta)
    );

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta com o numero informado, não encontrada.' });
    }

    if (!nome || !cpf || !data_nascimento || !telefone || !email) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" });
    }

    const contaEmail = bancodedados.contas.find((contaEmail) =>
        contaEmail.usuario.email === email);

    const contaCPF = bancodedados.contas.find((contaCPF) =>
        contaCPF.usuario.cpf === cpf);

    if (contaEmail) {
        return res.status(404).json({ mensagem: 'Email já cadastrado!' });
    }

    if (contaCPF) {
        return res.status(404).json({ mensagem: 'CPF já cadastrado!' });
    }
    // FIM DAS EXCECOES


    try {
        conta.usuario.nome = nome;
        conta.usuario.cpf = cpf;
        conta.usuario.data_nascimento = data_nascimento;
        conta.usuario.telefone = telefone;
        conta.usuario.email = email;
        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}

let excluirConta = (req, res) => {
    let { numeroConta } = req.params;

    // LEVANTAMENTO DAS EXCECOES
    const conta = bancodedados.contas.find((conta) =>
        conta.numero === Number(numeroConta)
    );

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta com o numero informado, não encontrada.' });
    }

    if (conta.saldo !== 0) {
        return res.status(403).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    }

    try {
        bancodedados.contas.splice(numeroConta - 1, 1);
        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}

let depositar = (req, res) => {
    let { numero_conta, valor } = req.body;

    // LEVANTAMENTO DAS EXCECOES
    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" });
    }

    const conta = bancodedados.contas.find((conta) =>
        conta.numero === Number(numero_conta)
    );

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta com o numero informado, não encontrada.' });
    }

    if (Number(valor) <= 0) {
        return res.status(400).json({ mensagem: 'Depositos sem valor ou negativos não são aceitos!' });
    }

    try {
        const date = new Date()

        bancodedados.depositos.push({
            "data": format(date, "yyy-LL-dd HH:mm:ss"),
            "numero_conta": numero_conta,
            "valor": Number(valor)
        });
        conta.saldo += Number(valor);
        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}

let sacar = (req, res) => {
    let { numero_conta, valor, senha } = req.body;

    // LEVANTAMENTO DAS EXCECOES
    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" });
    }

    const conta = bancodedados.contas.find((conta) =>
        conta.numero === Number(numero_conta)
    );

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta com o numero informado, não encontrada.' });
    }

    if (Number(conta.usuario.senha) !== Number(senha)) {
        return res.status(400).json({ mensagem: 'Senha inválida!' });
    }

    if (conta.saldo < valor) {
        return res.status(400).json({ mensagem: 'Saldo indisponível para saque!' });
    }
    try {
        const date = new Date()

        bancodedados.saques.push({
            "data": format(date, "yyy-LL-dd HH:mm:ss"),
            "numero_conta": numero_conta,
            "valor": Number(valor)
        });
        conta.saldo -= Number(valor);
        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}

let transferir = (req, res) => {
    let { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    // LEVANTAMENTO DAS EXCECOES
    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" });
    }

    const contaOrigem = bancodedados.contas.find((contaOrigem) =>
        contaOrigem.numero === Number(numero_conta_origem)
    );

    const contaDestino = bancodedados.contas.find((contaDestino) =>
        contaDestino.numero === Number(numero_conta_destino)
    );

    if (!contaOrigem) {
        return res.status(404).json({ mensagem: 'Conta de origem com o numero informado, não encontrada.' });
    }
    if (!contaDestino) {
        return res.status(404).json({ mensagem: 'Conta de destino com o numero informado, não encontrada.' });
    }

    if (Number(contaOrigem.usuario.senha) !== Number(senha)) {
        return res.status(400).json({ mensagem: 'Senha inválida!' });
    }

    if (contaOrigem.saldo < valor) {
        return res.status(400).json({ mensagem: 'Saldo indisponível para saque!' });
    }
    try {
        const date = new Date()
        bancodedados.transferencias.push({
            "data": format(date, "yyy-LL-dd HH:mm:ss"),
            "numero_conta_origem": numero_conta_origem,
            "numero_conta_destino": numero_conta_destino,
            "valor": Number(valor)
        });
        contaOrigem.saldo -= Number(valor);
        contaDestino.saldo += Number(valor);

        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}

let saldo = (req, res) => {
    let { numero_conta, senha } = req.query;

    // LEVANTAMENTO DAS EXCECOES
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" });
    }

    const conta = bancodedados.contas.find((conta) =>
        conta.numero === Number(numero_conta)
    );

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta com o numero informado, não encontrada.' });
    }

    if (Number(conta.usuario.senha) !== Number(senha)) {
        return res.status(400).json({ mensagem: 'Senha inválida!' });
    }

    try {
        return res.status(200).json({ saldo: conta.saldo });
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}

let extrato = (req, res) => {
    let { numero_conta, senha } = req.query;

    // LEVANTAMENTO DAS EXCECOES
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" });
    }

    const conta = bancodedados.contas.find((conta) =>
        conta.numero === Number(numero_conta)
    );

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta com o numero informado, não encontrada.' });
    }

    if (Number(conta.usuario.senha) !== Number(senha)) {
        return res.status(400).json({ mensagem: 'Senha inválida!' });
    }

    try {
        let saques = bancodedados.saques.filter((saques) =>
            saques.numero_conta === numero_conta
        );
        let depositos = bancodedados.depositos.filter((depositos) =>
            depositos.numero_conta === numero_conta
        );
        let transferenciasEnviadas = bancodedados.transferencias.filter((transferencias) => transferencias.numero_conta_origem === numero_conta);
        let transferenciasRecebidas = bancodedados.transferencias.filter((transferencias) => transferencias.numero_conta_destino === numero_conta);

        return res.status(200).json({ depositos: depositos, saques: saques, transferenciasEnviadas: transferenciasEnviadas, transferenciasRecebidas: transferenciasRecebidas });
    } catch (erro) {
        return res.status(500).json(`Opss... Algo ocorreu: ${erro}`);
    }

}

module.exports = { listarContas, criarConta, atualizarConta, excluirConta, depositar, sacar, transferir, saldo, extrato };