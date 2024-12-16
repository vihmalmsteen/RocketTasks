import request from 'supertest'
import { app } from '../app'
import { prisma } from '../database/prisma'
import { env } from '../env'


describe("TeamsControllers", () => {
    
    let jwtToken: string // Adiciona uma variável para armazenar o token
    const teamName = "createTeamTest"
    const teamDescription = "Team description test"

    beforeAll(async () => {
            const loginResponse = await request(app).post('/sessions').send({
                // admin seed user
                email: "vitor@email.com",
                password: env.PASS_NUMBER_TEST
            })
    
            jwtToken = loginResponse.body.token
    
            await prisma.teams.deleteMany({where: {name: teamName}})
        })
        
    afterAll(async () => {
        await prisma.teams.deleteMany({where: {name: teamName}})
    })

    test("should create a new team successufully", async () => {
        
        const response = await request(app).post('/teams')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            name: teamName,
            description: teamDescription
        })
        expect(response.status).toBe(201)
        expect(response.body.name).toBe(teamName);
    })


    test("should throw an error when team with same name already exists", async () => {
        const response = await request(app).post('/teams')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            name: teamName,
            description: teamDescription
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Name's team already exists.")
    })

    test("should throw a validation error if name is invalid.", async () => {
        
        const teamNameExistsAlready = await prisma.teams.create({ data: { name: teamName, description: teamDescription } })
        const response = await request(app).post('/teams')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            name: teamName,
            description: teamDescription
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Name's team already exists.")
    })
})