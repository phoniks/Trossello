import express from 'express'
import {queries, commands} from '../database'
const router = new express.Router()
import uuid from 'uuid'
import sendInviteEmail from '../mail/mailer'



router.post('/:boardId', (request, response, next) => {
  const email = request.body.email
  const { boardId } = request.params
  const token = uuid.v1()
  const attributes = {boardId: boardId, email: email, token: token}
  console.log('email', email);
  commands.createInvite(attributes)
    .then( result => {
      sendInviteEmail( result )
    })
    .catch(next)
})

router.get('/verify/:token', (request, response, next) => {
  let {token} = request.params
  queries.verifyToken(token)
  .then(result => {
    console.log(request.session);
    console.log('session email: ', request.session.email);
    let  {userId} = request.session
    let boardId = result[0].boardId
    if (result[0] === undefined) {
      response.redirect('/')
    } else if (result[0].token === token) {
      if(userId){
        queries.checkUserBoardAssociation(boardId, userId)
        .then( data => {
          if(data === undefined){
            let attributes = {board_id: boardId, user_id: userId}
            commands.createUserBoardEntry(attributes)
            .then(record =>
              response.redirect(`/boards/${record.board_id}`)
            )
          } else {
            response.redirect(`/boards/${boardId}`)
          }
        })
      } else {
        request.session.inviteCookie = token
        request.session.redirectToAfterLogin = `/boards/${record.board_id}`
        console.log(request.session);
        response.redirect('/')
      }
    }
  })
})
export default router