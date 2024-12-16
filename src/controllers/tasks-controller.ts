import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { z } from 'zod';
import { AppError } from "../utils/appError";


export class TasksController {
    
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            title: z.string().trim().min(2),
            description: z.string().trim().min(2),
            status: z.enum(['pending', 'in_progress', 'completed']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            assigned_to: z.string().uuid()  /*userId*/
    })

        const { title, description, status, priority, assigned_to } = bodySchema.parse(request.body);

        const userMembership = await prisma.teamMembers.findFirst({ where: { userId: assigned_to } });
        if(!userMembership) {
            throw new AppError("Member user not found.", 404);
        }

        const titleExistsAlready = await prisma.tasks.findFirst({ where: { title } });
        if(titleExistsAlready) {
            throw new AppError("Title's task already exists.", 400);
        }

        const task = await prisma.tasks.create({
            data: {
                title,
                description,
                // Incluir 'status' e 'priority' apenas se definidos (caso contrario pega o default do schema)
                ...(status && { status }),
                ...(priority && { priority }),
                assignedTo: assigned_to,
                teamId: userMembership.teamId
            }
        });

        return response.json(task);
    }


    async show(request: Request, response: Response) {
        const bodySchema = z.object({
            title: z.string().trim().min(2).optional(),
            description: z.string().trim().min(2).optional(),
            status: z.enum(['pending', 'in_progress', 'completed']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            assigned_to: z.string().uuid().optional(),  /*userId*/
            team_id: z.string().uuid().optional()
        })

        const { title, description, status, priority, assigned_to, team_id } = bodySchema.parse(request.query);

        const tasks = await prisma.tasks.findMany({
            where: {
                AND: [
                    {title: {contains: title, mode: 'insensitive'}},
                    {description: {contains: description, mode: 'insensitive'}},
                    {status: status},
                    {priority: priority},
                    {assignedTo: {contains: assigned_to, mode: 'insensitive'}},
                    {teamId: {contains: team_id, mode: 'insensitive'}},
                ]
            }
        });

        return response.json(tasks)
    }


    async update(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid(),
            title: z.string().trim().min(2).optional(),
            description: z.string().trim().min(2).optional(),
            status: z.enum(['pending', 'in_progress', 'completed']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            assigned_to: z.string().uuid().optional()  /*userId*/
        })

        let { id, title, description, status, priority, assigned_to } = bodySchema.parse(request.body);

        if(!title && !description && !status && !priority && !assigned_to) {
            throw new AppError("At least one field must be updated.", 400);
        }

        const task = await prisma.tasks.findFirst({ where: { id } });
        if(!task) {
            throw new AppError("Task not found.", 404);
        }

        const memberUser = await prisma.teamMembers.findFirst({ where: { userId: assigned_to } });
        if(!memberUser) {
            throw new AppError("Member user not found.", 404);
        }

        const changes = {
            oldStatus: task.status,
            newStatus: status || task.status
        }

        await prisma.tasks.update({ 
            where: { id }, 
            data: { 
                title: title ?? task.title, 
                description: description ?? task.description, 
                status: status ?? task.status, 
                priority: priority ?? task.priority, 
                assignedTo: assigned_to ?? task.assignedTo, 
                teamId: assigned_to ?? memberUser.teamId
            }
        })

        if(changes.oldStatus !== changes.newStatus) {
            // dados do user logado
            const userId = request.user.id
            await prisma.taskHistory.create({
                data: {
                    changedBy: userId,
                    taskId: task.id,                      /*o ideal é o user que fez a alteracao e nao o da task*/
                    oldStatus: changes.oldStatus,
                    newStatus: changes.newStatus
                }
            })
        }

        return response.status(200).send('Task updated successfully.');
    }


    async delete(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid()
        })
        const { id } = bodySchema.parse(request.body);

        const task = await prisma.tasks.findFirst({ where: { id } });
        if(!task) {
            throw new AppError("Task not found.", 404);
        }

        await prisma.tasks.delete({ where: { id } });
        return response.status(200).send("Task deleted successfully.");
    }
}