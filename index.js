const database = require('./database');
console.log('프로젝트 생성');
const { ApolloServer, gql } = require('apollo-server');
const { equipments } = require('./database');
const typeDefs = gql`
    type Query{
        teams: [Team]
        team(id: Int) : Team
        equipments: [Equipment]
        supplies: [Supply]
    }
    type Mutation {
        insertEquipment(
            id: String,
            used_by: String,
            count: Int,
            new_or_used: String
        ): Equipment
        deleteEquipment(id:String): Equipment
        editEquipment(
            id: String,
            used_by: String,
            count: Int,
            new_or_used: String
        ):Equipment
    }
    type Team {
        id: Int
        manager: String
        office: String
        extension_number: String
        mascot: String
        cleaning_duty: String
        project: String
        supplies: [Supply]
    }
    type Equipment {
        id: String
        used_by: String
        count: Int
        new_or_used: String
    }
    type Supply{
        id:String
        team: Int
    }
`
const resolvers = {
    Query:{

        teams: () => database.teams.map((team)=> {
            team.supplies = database.supplies.filter((supply) =>{
                return supply.team === team.id
            })
            return team
        }),
        team: (parent, args, context, info) => 
            database.teams.filter((team) =>{
                return team.id === args.id
            })[0],
        equipments: () => database.equipments,
        supplies: () => database.supplies,
    },
    Mutation: {
        insertEquipment: (parent, args, context, info) => {
            database.equipments.push(args)
            return args
        },
        deleteEquipment: (parent, args, context, info) => {
            const deleted = database.equipments
                .filter((equipment) => {
                    return equipment.id === args.id
                })[0]
            database.equipments = database.equipments
                .filter((equipment) => {
                    return equipment.id !== args.id
                })
            return deleted
        },
        editEquipment: (parent, args, context, info) => {
          return database.equipments.filter((equipment) =>{
              return equipment.id === args.id
          }).map((equipment)=> {
              Object.assign(equipment, args)
              return equipment
          })[0]
        }
  }
}

const server = new ApolloServer({ typeDefs, resolvers }) //서버 생성
// typeDef => 요청의 타입 지정 gql로 생성됨
// resolver => 서비스의 액션들을 함수로 지정/ 요청에 따라 데이터를 반환, 입력, 수정, 삭제
server.listen().then(({url})=>{
    console.log(`Server ready at ${url}`)
})
     