import { prisma } from "../src/database/prisma"
import { hash } from 'bcrypt'

async function seed() {
    const hashedPassword = await hash('555159', 8);
    await prisma.users.createMany({
        data: [
            {name: 'vitor', email: 'vitor@email.com', password: hashedPassword, role: 'admin'},
            {name: 'carinny', email: 'carinny@email.com', password: hashedPassword, role: 'admin'},
            {name: 'bento', email: 'bento@email.com', password: hashedPassword},
            {name: 'carlos', email: 'carlos@email.com', password: hashedPassword}
        ]
    })
}

seed().then(() => {
    console.log('Seed executado com sucesso.')
    prisma.$disconnect()
})

// npx prisma db seed