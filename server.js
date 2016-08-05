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

console.log(app.get('env'))

const session_options = {
  store: new Store({client: redis}),
  secret: process.env.SECRET || 'whatever',
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  session_options.cookie.secure = true
}

app.use(session(session_options))

const parser = bodyParser.urlencoded({ extended: false })

const pusher = new Pusher({
  appId: process.env.p_app_id,
  key: process.env.p_key,
  secret: process.env.p_secret,
  cluster: process.env.p_cluster,
  encrypted: true
})

app.post('/pusher/auth', parser, (req, res, next) => {

  const socket_id     = req.body.socket_id
  const channel_name  = req.body.channel_name

  Promise.resolve(
    req.session.pusher_user_id ||
    redis.incr('pusher_user_id_counter')
    .then(i => req.session.pusher_user_id = i)
  )
  .then( user_id => {


    const data = {
      user_id: user_id,
      user_info: {}
    }

    res.send(
      pusher.authenticate(socket_id, channel_name, data)
    )
  })
  .catch(next)

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

app.put('/content', parser, bodyParser.json(), (req, res) => {

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

app.post('/auth', parser, (req, res) => {
  var authed = req.body.password == process.env.PASSWORD
  req.session.auth = authed
  res.sendStatus(authed? 200 : 401)
})



// Storage limitiations
//  Rate per user - .6s
//  Object size - 50chars
//  Per user - 10 keys
//  Users - 200 -> 2000 (depends on keys)

const RateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const store = require('./lib/store')

// 40 reqs a minute
var limiter = new RateLimit({
  windowMs: 30000,
  max: 20,
  delayMs: 0,
  keyGenerator: req => req.session.pusher_user_id || 'nope'
})

app.post('/store', limiter, bodyParser.json(), parser, (req, res) => {
  if(!req.session.pusher_user_id) return res.sendStatus(401)
  if(!(req.body.key && req.body.value)) return res.sendStatus(400)

  store(
    req.session.pusher_user_id,
    req.body.key,
    req.body.value
  )
  res.sendStatus(200)
})

// todo - persist the store
app.get('/store', limiter, (req, res) => {
  res.send(store.getSource())
})


app.listen(process.env.PORT || 5000)
