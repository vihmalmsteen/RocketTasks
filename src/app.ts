import "express-async-errors";
import { errorHandling } from './middlewares/error-handling';
import { routes } from './routes/index';
import express from "express";


const app = express()
app.use(express.json())
app.use(routes)
app.use(errorHandling)


export { app }


/*
Pacote express-async-errors
Projetado para silenciar exceções não tratadas em funções assíncronas e que retornam Promises. 
Ele faz com que qualquer erro lançado em suas rotas assíncronas caia automaticamente 
no middleware de tratamento de erros (error-handling.ts).
Deve ser importado antes das rotas e qualquer outro middleware que possa gerar erros


Middleware error-handling.ts
Capta erros lançados das funções. Se um AppError ou um ZodError é lançado, ele responderá 
com a mensagem adequada e o status HTTP correspondente.
*/

