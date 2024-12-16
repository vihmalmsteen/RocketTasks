import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { z } from 'zod';
import { AppError } from "../utils/appError";

export class TeamsController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(2),
            description: z.string().trim().min(2)
       })

        const { name, description } = bodySchema.parse(request.body);

        if(!name || !description) {
            throw new AppError("All fields required: name, description.", 400);
        }

        const titleExistsAlready = await prisma.teams.findFirst({ where: { name } });
        if(titleExistsAlready) {
            throw new AppError("Name's team already exists.", 400);
        }

        const team = await prisma.teams.create({
            data: {
                name,
                description
            },
        });

        return response.status(201).json(team);
    }


    async index(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid()
        })

        const { id } = bodySchema.parse(request.body);
        
        const team = await prisma.teams.findFirst({where:{ id }});
        if(!team) {
            throw new AppError("Team not found.", 404);
        }

        return response.json(team);
    }


    async show(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(2).optional(),
            description: z.string().trim().min(2).optional(),
        })

        const { name, description } = bodySchema.parse(request.query);

        const teams = await prisma.teams.findMany({
            where: {
                AND: [
                    {name: {contains: name, mode: 'insensitive'}},
                    {description: {contains: description, mode: 'insensitive'}}
                ]
            }
        });

        return response.json(teams)
    }


    async delete(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid()
        })
        const { id } = bodySchema.parse(request.body);

        const team = await prisma.teams.findFirst({ where: { id } });
        if(!team) {
            throw new AppError("Team not found.", 404);
        }

        await prisma.teams.delete({ where: { id } });
        return response.status(200).send("Team deleted successfully.");
    }


    async update(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid(),
            name: z.string().trim().min(2).optional(),
            description: z.string().trim().min(2).optional(),
        })

        let { id, name, description } = bodySchema.parse(request.body);

        if(!id) {
            throw new AppError("TeamId to update not informed.", 400);
        }

        if(!name && !description) {
            throw new AppError("Nothing to update reported.\nAt least: name or description.", 400);
        }

        const team = await prisma.teams.findFirst({ where: { id } });
        if(!team) {
            throw new AppError("Team not found.", 404);
        }

        await prisma.teams.update({ 
            where: { id }, 
            data: { 
                name: name ?? team.name, 
                description: description ?? team.description
            } 
        });

        return response.status(200).send("Team updated successfully.");
    }
}