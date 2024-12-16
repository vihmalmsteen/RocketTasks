import request from 'supertest'
import { app } from '../app'
import { prisma } from '../database/prisma'
import { env } from '../env'

describe("TasksControllers", () => {

    let jwtToken: string
    let taskId: string
    let userId: string
    let teamId: string
    let teamMemberId: string

    beforeAll(async () => {
        const loginResponse = await request(app).post('/sessions').send({
            // admin seed user
            email: "vitor@email.com",
            password: env.PASS_NUMBER_TEST
        })
    
        jwtToken = loginResponse.body.token
        userId = loginResponse.body.id

        await prisma.users.deleteMany({where: {email: "testuser@email.com"}})
    })
        
    afterAll(async () => {
        await prisma.tasks.deleteMany({where: { id: taskId }})
        await prisma.teamMembers.deleteMany({where: { id: teamMemberId }})
        await prisma.teams.deleteMany({where: { id: teamId }})
    })

    test("should create a new task successufully", async () => {
        const createTeam = await prisma.teams.create({ data: { name: "createTeamTest", description: "Team description test" } })
        teamId = createTeam.id
        const setTeam = await prisma.teamMembers.create({ data: { userId, teamId } })
        teamMemberId = setTeam.id
        const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            title:"createTaskTest",
            description:"Task description test",
            status:"pending",
            priority:"low",
            assigned_to: setTeam.userId
        })
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("id")

        taskId = response.body.id
    })
})

