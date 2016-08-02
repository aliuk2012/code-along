require('dotenv').config({silent: true})

const Pusher = require('pusher')
const Redis = require('ioredis')
const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')

const app = express()
const redis = new Redis(process.env.REDIS_URL)
const Store = require('connect-redis')(session)

app.use(express.static('./public'))

app.use(session({
  store: new Store({client: redis}),
  secret: process.env.SECRET || 'whatever'
}))

app.use(bodyParser.urlencoded({ extended: false }))

const pusher = new Pusher({
  appId: process.env.p_app_id,
  key: process.env.p_key,
  secret: process.env.p_secret,
  cluster: process.env.p_cluster,
  encrypted: true
})

app.post('/pusher/auth', (req, res) => {

  const socket_id     = req.body.socket_id
  const channel_name  = req.body.channel_name

  // todo - assign a incrementing number attached to session
  const data = {
    user_id: socket_id,
    user_info: {}
  }

  res.send(
    pusher.authenticate(socket_id, channel_name, data)
  )
})

app.get('/pusher/config', (req, res) => {
  res.send({
    key: process.env.p_key,
    options: {
      cluster: process.env.p_cluster,
      encrypted: true
    }
  })
})


app.get('/content/:key', (req, res) => {
  console.log(req.params.key)
  redis.get('content:' + req.params.key)
    .then(function(d){
      res.send(d || '// ' + req.params.key)
    })
})

app.put('/content/:key', bodyParser.json(), (req, res) => {
  console.log(req.body)

  if(req.body.content) {
    redis.set('content:' + req.params.key, req.body.content)
    .then(function(){
      console.log("saved")

      pusher.trigger('presence-' + req.params.key, 'content', req.body.content, req.body.socket_id)

    })
  }
  res.send('ok')
})

app.listen(process.env.PORT || 5000)
