import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { z } from 'zod';
import { AppError } from "../utils/appError";

export class TeamMembersController {

    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            user_id: z.string().uuid(),
            team_id: z.string().uuid()
        })

        const { user_id, team_id } = bodySchema.parse(request.body);

        const user = await prisma.users.findFirst({ where: { id: user_id } });
        if(!user) {
            throw new AppError("User not found.", 404);
        }

        const userAlreadyWithTeam = await prisma.teamMembers.findFirst({ where: { userId: user_id } });
        if (userAlreadyWithTeam) {
            throw new AppError("User already has a team.", 400);
        }

        const team = await prisma.teams.findFirst({ where: { id: team_id } });
        if(!team) {
            throw new AppError("Team not found.", 404);
        }

        const userTeam = await prisma.teamMembers.create({
            data: {
                userId: user_id, 
                teamId: team_id
            },
        });

        return response.status(201).json({
            message:'Team member added.', 
            data: userTeam
        });
    }


    async show(request: Request, response: Response) {
        const bodySchema = z.object({
            team_id: z.string().uuid()
        })

        const { team_id } = bodySchema.parse(request.body);

        const team = await prisma.teams.findFirst({ where: { id: team_id } });
        if(!team) {
            throw new AppError("Team not found.", 404);
        }

        const members = await prisma.teamMembers.findMany({ where: { teamId: team_id } });

        return response.json(members);
    }


    async update(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid(),
            user_id: z.string().uuid().optional(),
            team_id: z.string().uuid().optional()
        })

        let { id, user_id, team_id } = bodySchema.parse(request.body);

        const user = await prisma.users.findFirst({ where: { id: user_id } });
        if(!user) {
            throw new AppError("User not found.", 404);
        }

        const team = await prisma.teams.findFirst({ where: { id: team_id } });
        if(!team) {
            throw new AppError("Team not found.", 404);
        }

        const membership = await prisma.teamMembers.findFirst({ where: { id } });
        if(!membership) {
            throw new AppError("Team member not found.", 404);
        }

        if(user_id) {
            const userAlreadyWithTeam = await prisma.teamMembers.findFirst({ where: { userId: user_id } });
            if (userAlreadyWithTeam) {
                throw new AppError("User already has a team.", 400);
            }
        }

        if(!user_id && !team_id) {
            throw new AppError("Nothing to update reported. At least: user_id or team_id.", 400);
        }

        await prisma.teamMembers.update({ 
            where: { id }, 
            data: { 
                userId: user_id ?? membership.userId,
                teamId: team_id ?? membership.teamId
            } 
        });

        return response.status(200).send("Team member updated.");
    }


    async delete(request: Request, response: Response) {
        const bodySchema = z.object({
            id: z.string().uuid()
        })
        const { id } = bodySchema.parse(request.body);

        const membership = await prisma.teamMembers.findFirst({ where: { id } });
        if(!membership) {
            throw new AppError("Team member not found.", 404);
        }

        await prisma.teamMembers.delete({ where: { id } });
        return response.status(200).send("Member removed from team.");
    }
}
