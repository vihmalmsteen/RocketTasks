import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { z } from 'zod'
import { AppError } from '../utils/appError'
import { compare } from 'bcrypt'
import { authConfig } from '../configs/auth'
import { sign } from 'jsonwebtoken'


class SessionsController {

    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6)
        })

        const { email, password } = bodySchema.parse(request.body);

        const user = await prisma.users.findFirst({where: { email }})

        if(!user) {
            throw new AppError("Email ou senha errado(s).", 404)
        }

        const passwordMatched = await compare(password, user.password)

        if(!passwordMatched) {
            throw new AppError("Email ou senha errado(s).", 404)
        }

        const { secret, expiresIn } = authConfig.jwt
        const token = sign({role: user.role ?? "member"}, secret, {
            subject: String(user.id),
            expiresIn
        })

        return response.status(200).json({ 
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "token": token
        })
    }
}


export { SessionsController }
