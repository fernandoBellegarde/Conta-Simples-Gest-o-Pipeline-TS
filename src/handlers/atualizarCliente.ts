import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { exitCode } from "node:process";

const dynamoClient = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    console.log("Iniciando atualização de um cliente");

    const table = process.env.TABELA_DYNAMODB;
    if (!table) {
      throw new Error(
        "Falta a variavel TABELA_DYNAMODB para excluir um cliente",
      );
    }

    const clientId = event.pathParameters?.id;

    let body;
    if (typeof event.body === "string") {
      body = JSON.parse(event.body);
    } else {
      body = event.body || {};
    }
    if (!clientId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          mensagem: "ID do cliente não fornecido na URL",
        }),
      };
    }

    const command = new UpdateItemCommand({
      TableName: table,
      Key: {
        company_origin_id: { S: clientId },
      },
      UpdateExpression:
        "SET nome_empresa = :nome, email_corp = :email, telefone = :tel, potencial_gasto = :gasto",
      ExpressionAttributeValues: {
        ":nome": { S: body.nome_empresa || "Nome não informado" },
        ":email": { S: body.email_corp || "Email não informado" },
        ":tel": { S: body.telefone || "Telefone não informado" },
        ":gasto": {
          N: body.potencial_gasto ? String(body.potencial_gasto) : "0",
        },
      },
      ReturnValues: "ALL_NEW",
    });

    const result = await dynamoClient.send(command);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        mensagem: "Cliente atualizado com sucesso",
        dados_atualizados: result.Attributes,
      }),
    };
  } catch (err) {
    console.error("Erro ao atualizar cliente no DynamoDB:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Erro interno ao atualizar cliente",
      }),
    };
  }
};
