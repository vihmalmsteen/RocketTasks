import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { authConfig } from "@/configs/auth";
import { AppError } from "@/utils/appError";


interface TokenPayload {
    role: string
    sub: string                  /* sub se refere ao "subject" do token (no caso, userId), é padrão */
}

function ensureAuthenticaded(
    request: Request, 
    response: Response, 
    next: NextFunction) {
    try {
        const authHeader = request.headers.authorization

        if (!authHeader) {
            throw new AppError('JWT token not found.', 401)    
        }

        // Bearer 314kj32b4k324b23k4j23b423kb   ->>   pegando a 2º pos do split (token)
        const [, token] = authHeader.split(' ')
        const { role, sub: user_id } = verify(token, authConfig.jwt.secret) as TokenPayload

        request.user = {
            id: user_id,
            role
        }

        return next()

    } catch (error) {
        throw new AppError('Invalid JWT token.', 401)
    }
}

export { ensureAuthenticaded }