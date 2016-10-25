import knex from './knex'
import queries from './queries'

const firstRecord = records => records[0]

const createRecord = (table, attributes) =>
  knex
    .table(table)
    .insert(attributes)
    .returning('*')
    .then(firstRecord)


const updateRecord = (table, id, attributes) =>
  knex
    .table(table)
    .where('id', id)
    .update(attributes)
    .returning('*')
    .then(firstRecord)


const deleteRecord = (table, id) =>
  knex
    .table(table)
    .where('id', id)
    .del()

const archiveRecord = (table, id) =>
  knex
    .table(table)
    .where('id', id)
    .update({
      archived: true,
    })

const unarchiveRecord = (table, id) =>
  knex
    .table(table)
    .where('id', id)
    .update({
      archived: false,
    })

const archiveListItems = (id) =>
  knex
    .table('cards')
    .where('list_id', id)
    .update({
      archived: true,
    })

const unarchiveListItems = (id) =>
  knex
    .table('cards')
    .where('list_id', id)
    .update({
      archived: false,
    })

const findOrCreateUserFromGithubProfile = (githubProfile) => {
  const github_id = githubProfile.id
  const userAttributes = {
    github_id: github_id,
    name: githubProfile.name,
    email: githubProfile.email,
    avatar_url: githubProfile.avatar_url,
  }
  return knex.table('users').where('github_id', github_id).first('*')
    .then(user => user ? user : createUser(userAttributes))
}

const createUser = (attributes) =>
  createRecord('users', attributes)


const updateUser = (id, attributes) =>
  updateRecord('users', id, attributes)


const deleteUser = (id) =>
  deleteRecord('users', id)


//

const createList = (attributes) => {
  return createRecord('lists', attributes)
}

const updateList = (id, attributes) =>
  updateRecord('lists', id, attributes)


const deleteList = (id) =>
  Promise.all([
    deleteRecord('lists', id),
    knex.table('cards').where('list_id', id).del(),
  ])

//

const createCard = (attributes) => {
  return knex
    .table('cards')
    .where({list_id: attributes.list_id})
    .count()
    .then( results => {
      attributes.order = results[0].count
      return knex
        .table('cards')
        .insert(attributes)
        .returning('*')
        .then(firstRecord)
    })
}

const updateCard = (id, attributes) =>
  updateRecord('cards', id, attributes)

const deleteCard = (id) =>
  deleteRecord('cards', id)

const archiveCard = (id) =>
  archiveRecord('cards', id)

const unarchiveCard = (id) =>
  unarchiveRecord('cards', id)

const reorderCard = ({list_id, card_id, order}) => {
  order = Number(order)
  return knex
    .table('cards')
    .where({list_id})
    .orderBy('order', 'asc')
    .then(cards => {
      cards.forEach(card => {
        card.order = Number(card.order)
        if (card.id === card_id){
          card.order = Number(order)
        }else if (card.order >= order) {
          card.order += 1
        }
      })
      const queries = cards.map(card =>
        updateCard(card.id, {order: card.order})
      )
      return Promise.all(queries)
    })
}

const archiveList = (id) =>
  Promise.all([
    archiveListItems(id),
    archiveRecord('lists', id)
  ])

const unarchiveList = (id) =>
  Promise.all([
    unarchiveRecord('lists', id),
    unarchiveListItems(id)
  ])

const archiveBoard = (id) =>
  archiveRecord('boards', id)

const unarchiveBoard = (id) =>
  unarchiveRecord('boards', id)

const createBoard = (userId, attributes) => {
  if (!attributes.background_color) delete attributes.background_color
  return createRecord('boards', attributes).then(board => {
    let attrs = {
      user_id: userId,
      board_id: board.id,
    }
    return createRecord('user_boards', attrs).then(() => board)
  })
}


const updateBoard = (id, attributes) =>
  updateRecord('boards', id, attributes)


const deleteBoard = (boardId) =>
  Promise.all([
    deleteRecord('boards', boardId),
    knex.table('user_boards').where('board_id', boardId).del(),
  ]).then(results => results[0] + results[1])


export default {
  createUser,
  updateUser,
  deleteUser,
  findOrCreateUserFromGithubProfile,
  createList,
  updateList,
  deleteList,
  createCard,
  updateCard,
  deleteCard,
  reorderCard,
  createBoard,
  updateBoard,
  deleteBoard,
  archiveCard,
  unarchiveCard,
  archiveList,
  unarchiveList,
  archiveBoard,
  unarchiveBoard,
}
