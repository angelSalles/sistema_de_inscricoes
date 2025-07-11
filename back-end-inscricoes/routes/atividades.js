// backend-inscricoes/routes/atividades.js
const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!db) {
      return res
        .status(500)
        .send("Serviço de banco de dados não inicializado.");
    }
    next();
  });

  // GET all atividades
  router.get("/", async (req, res) => {
    try {
      const atividadesRef = db.collection("ATIVIDADE");
      const snapshot = await atividadesRef.get();
      const atividades = [];
      snapshot.forEach((doc) => {
        atividades.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(atividades);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      res.status(500).json({ error: "Erro ao buscar atividades." }); // Alterado para json
    }
  });

  // GET atividade by ID
  router.get("/:id", async (req, res) => {
    try {
      const atividadeId = req.params.id;
      const atividadeDoc = await db
        .collection("ATIVIDADE")
        .doc(atividadeId)
        .get();

      if (!atividadeDoc.exists) {
        return res.status(404).json({ error: "Atividade não encontrada." }); // Alterado para json
      }

      res.status(200).json({ id: atividadeDoc.id, ...atividadeDoc.data() });
    } catch (error) {
      console.error("Erro ao buscar atividade por ID:", error);
      res.status(500).json({ error: "Erro ao buscar atividade." }); // Alterado para json
    }
  });

  // POST create new atividade
  router.post("/", async (req, res) => {
    try {
      const novaAtividade = req.body;
      novaAtividade.dataCriacao = new Date();
      const docRef = await db.collection("ATIVIDADE").add(novaAtividade);
      res.status(201).json({ id: docRef.id, ...novaAtividade });
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      res.status(500).json({ error: "Erro ao criar atividade." }); // Alterado para json
    }
  });

  // PUT update atividade
  // ...
  // PUT update atividade
  router.put("/:id", async (req, res) => {
    try {
      const atividadeId = req.params.id;
      const dadosAtualizados = req.body;

      console.log("--- Depuração PUT Atividade ---");
      console.log("Tentando atualizar atividade com ID:", atividadeId);
      console.log(
        "Dados recebidos para atualização (req.body):",
        dadosAtualizados
      );

      const atividadeRef = db.collection("ATIVIDADE").doc(atividadeId);
      const doc = await atividadeRef.get();
      if (!doc.exists) {
        console.warn(
          "AVISO: Atividade não encontrada para atualização com ID:",
          atividadeId
        );
        return res
          .status(404)
          .json({ error: "Atividade não encontrada para atualização." });
      }

      delete dadosAtualizados.dataCriacao; // Garante que dataCriacao não seja atualizada

      await atividadeRef.update(dadosAtualizados);
      console.log("Atividade atualizada com sucesso no backend:", atividadeId);

      res
        .status(200)
        .json({
          message: "Atividade atualizada com sucesso.",
          id: atividadeId,
        });
    } catch (error) {
      console.error("Erro ao atualizar atividade no backend:", error);
      res.status(500).json({ error: "Erro ao atualizar atividade." });
    } finally {
      console.log("--- Fim Depuração PUT Atividade ---");
    }
  });
  // ...

  // DELETE atividade
  router.delete("/:id", async (req, res) => {
    try {
      const atividadeId = req.params.id;
      await db.collection("ATIVIDADE").doc(atividadeId).delete();

      // --- CORREÇÃO AQUI ---
      res
        .status(200)
        .json({ message: "Atividade deletada com sucesso.", id: atividadeId });
      // --- FIM CORREÇÃO ---
    } catch (error) {
      console.error("Erro ao deletar atividade:", error);
      res.status(500).json({ error: "Erro ao deletar atividade." }); // Alterado para json
    }
  });

  return router;
};
