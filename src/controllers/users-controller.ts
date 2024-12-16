import { prisma } from "../database/prisma";
import { AppError } from "../utils/appError";
import { Request, Response } from 'express';
import { hash } from 'bcrypt';
import { z } from 'zod';


export class UsersController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(2),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(['admin', 'member']).optional()
        })

        const { name, email, password, role } = bodySchema.parse(request.body);

        const userWithSameEmail = await prisma.users.findFirst({ where: { email } });
        if (userWithSameEmail) {
            throw new AppError("Email already exists.", 400);
        }
    
        const hashedPassword = await hash(password, 8);

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // Incluir 'role' apenas se definido (caso contrario pega o default do schema)
                ...(role && { role }),
            },
        });
    
        return response.status(201).json({
            message:'User created successfully', 
            data: user
        });
    }


    async index(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid()
        })

        // dados do user logado
        const userId = request.user?.id
        const userRole = request.user?.role

        const { id } = bodySchema.parse(request.body);

        const user = await prisma.users.findFirst({ where: { id } })
        
        if(!user) {
            throw new AppError("User not found.", 404)
        }

        if(user.id !== userId && userRole !== 'admin') {
            throw new AppError("Unauthorized.", 401)
        }

        return response.json(user)
    }

    async show(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(2).optional(),
            email: z.string().optional(),
        })
        const { name, email } = bodySchema.parse(request.query);
        const users = await prisma.users.findMany({
            where: {
                AND: [
                    {name: {contains: name, mode: 'insensitive'}},
                    {email: {contains: email, mode: 'insensitive'}}
                ]
            }
        });

        return response.json(users)
    }

    async update(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid(),
            name: z.string().trim().min(2).optional(),
            email: z.string().email().optional(),
            password: z.string().min(6).optional(),
            role: z.enum(['admin', 'member']).optional()
        })

        let { id, name, email, password, role } = bodySchema.parse(request.body);
        
        if(!id) {
            throw new AppError("userId to update not informed.", 400);
        }

        if(!name && !email && !password && !role) {
            throw new AppError("Nothing to update reported. At least: name, email, password or role.", 400);
        }

        if(email) {
            email = email.toLowerCase();
            const userWithSameEmail:any = await prisma.users.findFirst({ where: { email } });
            if (userWithSameEmail && userWithSameEmail.id !== id) {
                throw new AppError("Email already exists.", 400);
            }
        }
        
        const userData = await prisma.users.findFirst({ where: { id } });
        if(!userData) {
            throw new AppError("User not found.", 404)
        }

        const user = await prisma.users.update({
            where: { id },
            data: { 
                name: name ?? userData.name, 
                email: email ?? userData.email, 
                password: password ?? userData.password, 
                role: role ?? userData.role
            }
        })
        return response.json({message:"Only admins change user roles.", user})
    }


    async delete(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid()
        })
        const { id } = bodySchema.parse(request.body)
        const userData = await prisma.users.findFirst({ where: { id } })
        if(!userData) {
            throw new AppError("User not found.", 404)
        }
        await prisma.users.delete({ where: { id } })
        return response.status(200).send("User deleted successfully.")
    }
}
