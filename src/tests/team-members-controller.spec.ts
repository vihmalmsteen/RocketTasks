import request from 'supertest'
import { app } from '../app'
import { prisma } from '../database/prisma'
import { env } from '../env'


describe("TeamMembersControllers", () => {

    let userId: string | undefined
    let jwtToken: string

    beforeAll(async () => {
        const loginResponse = await request(app).post('/sessions').send({
            // admin seed user
            email: "vitor@email.com",
            password: env.PASS_NUMBER_TEST
        })    
        jwtToken = loginResponse.body.token
    })

    afterAll(async () => {
        await prisma.teamMembers.deleteMany({where: { userId }})
    })

    test("should create a new team member successufully", async () => {
        const user = await prisma.users.findFirst({ where: { email: "vitor@email.com" } })
        const team = await prisma.teams.create({ data: { name: "createTeamTest", description: "Team description test" } })

        const response = await request(app).post('/team-members')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            user_id: user?.id,
            team_id: team.id
        })
        expect(response.status).toBe(201)
        userId = user?.id
    })
})