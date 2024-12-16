import request from 'supertest'
import { app } from '../app'
import { prisma } from '../database/prisma'
import { env } from '../env'

describe("UsersControllers", () => {

    let user_id: string
    let jwtToken: string // Adiciona uma variável para armazenar o token

    beforeAll(async () => {
        const loginResponse = await request(app).post('/sessions').send({
            // admin seed user
            email: "vitor@email.com",
            password: env.PASS_NUMBER_TEST
        })

        jwtToken = loginResponse.body.token

        await prisma.users.deleteMany({where: {email: "testuser@email.com"}})
    })
    
    afterAll(async () => {
        await prisma.users.deleteMany({where: {id: user_id}})
    })

    test("should create a new user successufully", async () => {
        const response = await request(app).post('/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            name:"createUserTest",
            email:"testuser@email.com",
            password:"password123"
        })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("data")
        expect(response.body.data.name).toBe("createUserTest")

        user_id = response.body.data.id
    })


    test("should throw an error when user with same email already exists", async () => {
        const response = await request(app).post('/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            name:"createUserTestDuplicate",
            email:"testuser@email.com",
            password:"password123"
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Email already exists.")
    })

    test("should throw a validation error if email is invalid.", async () => {
        const response = await request(app).post('/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            name:"Invalid email user",
            email:"invalid email",
            password:"password123"
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("validation error")
    })
})

