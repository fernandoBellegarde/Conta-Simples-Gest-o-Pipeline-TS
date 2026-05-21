import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import crypto from "node:crypto";
import type { CriarClienteInput } from "../handlers/cadastro.js";

const REGIAO = "us-east-2";
export const dynamoClient = new DynamoDBClient({ region: REGIAO });

export async function salvarCliente(dadosFormulario: CriarClienteInput) {
  const company_origin_id = crypto.randomUUID();
  const data_abertura = new Date().toISOString();

  const table = process.env.TABELA_DYNAMODB;

  if (!table) {
    throw new Error("A variavel de ambiente TABELA_DYNAMO não foi configurada");
  }

  const comando = new PutItemCommand({
    TableName: table,
    Item: {
      company_origin_id: { S: company_origin_id },
      data_abertura: { S: data_abertura },
      nome_empresa: { S: dadosFormulario.nome_empresa },
      email_corp: { S: dadosFormulario.email_corp },
      telefone: { S: dadosFormulario.telefone },
      potencial_gasto: { N: dadosFormulario.potencial_gasto.toString() },
    },
  });

  await dynamoClient.send(comando);
}
