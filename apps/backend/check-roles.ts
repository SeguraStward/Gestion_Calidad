import { PrismaService } from './src/prisma/prisma.service'

async function checkUserRoles() {
  const prisma = new PrismaService()

  try {
    console.log('🔍 Checking users and their roles...\n')

    // Get all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        roleIds: true,
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: true
          }
        }
      }
    })

    console.log(`📊 Total users found: ${users.length}\n`)

    for (const user of users) {
      console.log(`👤 User: ${user.fullName} (${user.email})`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Role IDs: [${user.roleIds?.join(', ') || 'none'}]`)
      console.log(`   Roles: ${user.roles.length}`)

      if (user.roles.length > 0) {
        user.roles.forEach(role => {
          console.log(`   - ${role.name} (${role.status}) - ${role.permissions.length} permissions`)
        })
      } else {
        console.log('   ❌ No roles assigned')
      }
      console.log('')
    }

    // Get all available roles
    console.log('\n🎭 Available roles:')
    const roles = await prisma.userRole.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        permissions: true,
        userIds: true
      }
    })

    for (const role of roles) {
      console.log(`- ${role.name} (${role.status})`)
      console.log(`  Description: ${role.description || 'No description'}`)
      console.log(`  Permissions: ${role.permissions.length}`)
      console.log(`  Assigned to ${role.userIds?.length || 0} users`)
    }

  } catch (error) {
    console.error('❌ Error checking user roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserRoles()
