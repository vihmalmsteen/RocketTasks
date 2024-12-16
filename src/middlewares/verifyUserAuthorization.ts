import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";


export function verifyUserAuthorization(role: string[]) {
    return (request: Request, response: Response, next: NextFunction) => {
        
        if(!request.user) {
            throw new AppError('JWT Error: Usuário não autenticado/autorizado.', 401)
        }
        
        if(!role.includes(request.user.role)) {
            throw new AppError('JWT Error: Usuário não autorizado.', 401)
        }

        return next()
    }
}