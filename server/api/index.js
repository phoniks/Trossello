import express from 'express'
import boardsRoutes from './boards'
import listsRoutes from './lists'
import cardsRoutes from './cards'
import inviteRoutes from './invites'

const router = new express.Router()

router.use((request, response, next) => {
  if (request.session.userId) return next()
  response.redirect('/')
  // response.status(400).json({
  //   error: 'Not Authorized'
  // })
})
router.use('/cards',  cardsRoutes)
router.use('/boards', boardsRoutes)
router.use('/lists',  listsRoutes)
router.use('/invites', inviteRoutes)

export default router
