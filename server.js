require('dotenv').config({silent: true})

const Pusher = require('pusher')
const Redis = require('ioredis')
const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')

const app = express()
const redis = new Redis(process.env.REDIS_URL)
const Store = require('connect-redis')(session)

console.log(app.get('env'))

const session_options = {
  store: new Store({client: redis}),
  secret: process.env.SECRET || 'whatever',
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 2)
  session_options.cookie.secure = true

/*  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] != 'https') {
      res.redirect('https://www.cojs.co' + req.url)
    } else {
      next()
    }
  })
  */
}



app.use(express.static('./public'))

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


app.put('/content/:key', parser, bodyParser.json(), (req, res) => {

  const key = req.params.key

  if(!key) return res.sendStatus(404)
  if(key != req.session.pusher_user_id) return res.sendStatus(401)

  if(req.body.value) {
    redis.setex('content:' + key, 60*60*24, req.body.value)
    .then(function(){
      pusher.trigger('codealong_' + key, 'update', {
        readOnly: readOnly,
        body: req.body.value
      })
    })
  }

  res.send('ok')

})


app.get('/content/:key', (req, res) => {

  // todo normalise
  const key = req.params.key

  redis.get('content:' + key)
    .then(function(d, e){
      res.send(d || "document.body.style.background = '#fc0'" )
    })
})


// API route

const crypto = require('crypto')

app.get('/api/details', (req, res) => {
  const key = req.session.pusher_user_id

  if(!key)
    return res.sendStatus(401)

  getset('api:' + key, _ => crypto.randomBytes(32).toString('hex'))
    .then(token => {
      res.send({
        key: key,
        token: token
      })
    })

})

app.put('/api/content', parser, bodyParser.json(), (req, res) => {

  // res.send("erm")

  const key = req.body.key

  if(!key) return res.sendStatus(404)
  // if(key != req.session.pusher_user_id) return res.sendStatus(401)

  redis.get('api:' + key)
    .then(token => {
      if(!token)
        return res.sendStatus(404)

      if(token!=req.body.token)
        return res.sendStatus(401)

      if(req.body.value) {
        redis.setex('content:' + key, 60*60*24, req.body.value)
        .then(function(){
          pusher.trigger('codealong_' + key, 'update', {
            readOnly: readOnly,
            body: req.body.value
          })
        })
      }

      res.send("ok")

    })


})

function getset(key, generate) {
  return redis.get(key)
    .then(response => {
      if(response)
        return response

      var value = generate()
      return redis.set(key, value)
        .then(_ => value)
    })
}







app.put('/input', parser, bodyParser.json(), (req, res) => {
  if(!req.session.auth) return res.sendStatus(401)
  res.sendStatus(200)

  if(req.body.dial) {
    redis.hset('input', 'dial', req.body.dial)
    pusher.trigger('input','dial',req.body.dial)
  }
  if(req.body.A) {
    redis.hset('input', 'a', req.body.A)
    pusher.trigger('input','a',req.body.A)
  }
  if(req.body.B) {
    redis.hset('input', 'b', req.body.B)
    pusher.trigger('input','b',req.body.B)
  }

  // auto expire in 40 mins
  redis.expire('input', 60*40)

})

app.get('/input', (req, res) => {
  redis.hgetall('input')
    .then(data => {
      res.send(data)
    })
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
store.setBacking(redis)

// 40 reqs a minute
var limiter = new RateLimit({
  windowMs: 30000,
  max: 20,
  delayMs: 0,
  keyGenerator: req => req.session.pusher_user_id || 'nope'
})

// Storage random test
// setInterval(function(){
//   var m = 'f-' + Math.random().toString(16).substr(2,1)
//   var row = store(
//     m,
//     Math.random().toString(16).substr(2,6),
//     // 'color'
//     '#' + Math.random().toString(16).substr(2,6)
//   )
//   if(row) {
//     pusher.trigger('codealong_store', 'add', {
//       rows:[row]
//     })
//   }
// }, 10)

app.post('/store', limiter, bodyParser.json(), parser, (req, res) => {
  if(!req.session.pusher_user_id) return res.sendStatus(401)
  if(!(req.body.key && req.body.value)) return res.sendStatus(400)

  var row = store(
    req.session.pusher_user_id,
    req.body.key,
    req.body.value
  )

  if(row) {
    pusher.trigger('codealong_store', 'add', {
      rows:[row]
    })
  }

  res.sendStatus(200)
})

// todo - persist the store
app.get('/store', limiter, (req, res) => {
  res.send(store.getSource())
})

app.get('/.well-known/acme-challenge/2Ihmf8yHfaw-q8AHan6tX9_Gz6W2JSjPE-Cn-sNU49g', (req, res) => res.send('2Ihmf8yHfaw-q8AHan6tX9_Gz6W2JSjPE-Cn-sNU49g.YrwmERb5B8tzJXXeqFFBS25ZCYDE_vgpeHG-1znUCXA'))

app.listen(process.env.PORT || 5000)
