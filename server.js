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

app.get('/content', (req, res) => {
  redis.get('content')
    .then(function(d, e){
      res.send(d || "document.body.style.background = '#fc0'" )
    })
})

var readOnly = false

app.put('/content', bodyParser.json(), (req, res) => {

  if(!req.session.auth) return res.sendStatus(401)

  if(req.body.value) {
    redis.setex('content', 60*60*24, req.body.value)
    .then(function(){
      pusher.trigger('codealong', 'update', {
        readOnly: readOnly,
        body: req.body.value
      })
    })
  }

  res.send('ok')

})

app.put('/readonly/on', bodyParser.json(), (req, res) => {
  if(!req.session.auth) return res.sendStatus(401)
  readOnly = true
  pusher.trigger('codealong', 'update', {
    readOnly: readOnly
  })
  res.send('ok')
})
app.put('/readonly/off', bodyParser.json(), (req, res) => {
  if(!req.session.auth) return res.sendStatus(401)
  readOnly = false
  pusher.trigger('codealong', 'update', {
    readOnly: readOnly
  })
  res.send('ok')
})

app.get('/auth', (req, res) => res.send(req.session.auth?'YES':'NO'))

app.post('/auth', (req, res) => {
  var authed = req.body.password == process.env.PASSWORD
  req.session.auth = authed
  res.sendStatus(authed? 200 : 401)
})


app.listen(process.env.PORT || 5000)
