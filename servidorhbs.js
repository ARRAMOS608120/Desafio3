import express from 'express'
import exphbs from 'express-handlebars'

import nodemailer from 'nodemailer'

const app = express()

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

import session from 'express-session'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//app.use(express.static('views'))

import MongoStore from'connect-mongo'
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
import { routerCarrito, routerProductos, routerHome } from './rutas.js'

import passport from 'passport'
import { Strategy as LocalStrategy} from 'passport-local'


app.engine('hbs', exphbs({
  extname: ".hbs",
  defaultLayout: "index.hbs",
  //layoutsDir: __dirname + "/views/layouts",
  partialsDir: __dirname + "/views/partials"
}))
app.use(session({
  store: MongoStore.create({ mongoUrl:'',
  mongoOptions: advancedOptions, ttl: 100
  }),
  secret: 'secreto',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
      maxAge: 100000
  }
}))

import path from 'path'

import mongoose from 'mongoose'

import logger from './winston-module.js'

/* ------------------ MAIL -------------------- */
function createSendMail(mailConfig) {

  const transporter = nodemailer.createTransport(mailConfig);

  return function sendMail({ to, subject, text, html, attachments }) {
    const mailOptions = { from: mailConfig.auth.user, to, subject, text, html, attachments };
    return transporter.sendMail(mailOptions)
  }
}

function createSendMailEthereal() {
  return createSendMail({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: "hailie.murphy14@ethereal.email",
      pass: ""
    }
  })
}

const sendMail = createSendMailEthereal()

const cuentaDePrueba = '"hailie.murphy14@ethereal.email'
const asunto = 'Nuevo registro'

/* ------------------ Whatsapp -------------------- */
import twilio from 'twilio'

const accountSid = '';
const authToken = '';

const client = twilio(accountSid, authToken)

const numero = +5491162422921 

async function whatsapp(mensaje){
  try {
  const message = await client.messages.create({
      body: mensaje, 
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${numero}`
  })
  console.log(message.sid)
} catch (error) {
  console.log(error)
}
}

const from = '+16614909501'
const body = 'Su pedido ha sido recibido y se encuentra en proceso'

/* --------------------------------------------------------------------- */
/*  Definición del esquema de documento y del modelo                     */
/*  (para poder interactuar con la base de datos: leer, escribir, etc)   */
/* --------------------------------------------------------------------- */
const usuarioSchema = new mongoose.Schema({
    username: {type: String, require: true},
    password: {type: String, require: true},
    nombre: {type: String, require: true},
    direccion: {type: String, require: true},
    edad: {type: Number, require: true},
    numero: {type: String, require: true},
    foto: {type: String, require: true},
})

const usuarioModel = mongoose.model('usuarios', usuarioSchema)

CRUD();

async function CRUD(){
    try{
        await mongoose.connect ('',{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Base de datos conectada')
    }catch (error) {
    console.log(`Error de conexión a la base de datos ${error}`)
    }
}

import bCrypt from 'bcrypt'

/* ------------------ PASSPORT -------------------- */

passport.use('register', new LocalStrategy({
    passReqToCallback: true
  }, async (req, username, password, done) => {

  const { direccion } = req.body
  const { nombre } = req.body
  const { edad } = req.body
  const { numero } = req.body
  const { foto } = req.body
  
  let usuarios = await usuarioModel.find({})
  const usuario = usuarios.find(usuario => usuario.username == username)
  
    if (usuario) {
      return done((null, false))
   }
  
    const user = {
      username,
      password,
      nombre,
      direccion,
      edad,
      numero,
      foto,
    }
  
  try{
    const usuarioNuevo = new usuarioModel({ username: username,  password: createHash(password), direccion: direccion, nombre: nombre, edad: edad, numero: numero, foto: foto})
    usuarioNuevo.save()
    const info = await sendMail({
      to: cuentaDePrueba,
      subject: asunto,
      html: JSON.stringify(user)
    })
    console.log(info)
    console.log('usuario agregado!')}catch (error) {
      logger.error(`Error: ${error}`);
  }
  
    return done(null, user)
  }));
  
  function createHash(password){
      return bCrypt.hashSync(
          password,
          bCrypt.genSaltSync(10),
          null);
  }

passport.use('login', new LocalStrategy(async (username, password, done) => {
 
  let usuarios = await usuarioModel.find({})
  const user = usuarios.find(usuario => usuario.username == username)
  

  if (!user) {
    return done(null, false)
  }
  if (bCrypt.compareSync(user.password, password)){
    return done(null, false)
  }

  return done(null, user);
}));

  passport.serializeUser(function (user, done) {
    done(null, user.username);
  });
  
  passport.deserializeUser(async function (username, done) {
    let usuarios = await usuarioModel.find({})
    const usuario = usuarios.find(usuario => usuario.username == username)
    done(null, usuario);
  });
  
  
  app.use(passport.initialize());
  app.use(passport.session());


  /* --------------------- AUTH --------------------------- */

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/login')
  }
}
  /* --------------------- ROUTES --------------------------- */
  
 // REGISTER
  app.get('/register', (req, res) => {
      logger.info(`Ruta ${req.method} ${req.url} funcionando correctamente`)
      res.sendFile(__dirname + '/views/register.html')
    })
    
    app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/' }))
    
    app.get('/failregister', (req, res) => {
      logger.warn(`Falla ${req.method} ${req.url} el registrarse`)
      res.render('register-error');
    })
  
// LOGIN
app.get('/login', (req, res) => {
  logger.info(`Ruta ${req.method} ${req.url} funcionando correctamente`)
  res.sendFile(__dirname + '/views/login.html')
})

app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/' }))

app.get('/faillogin', (req, res) => {
  logger.warn(`Falla ${req.method} ${req.url} al loguearse`)
  res.render('login-error');
})


    /* Cargo los routers */

app.set('view engine', 'hbs')
app.set('views', './views')

/* --------- LOGOUT ---------- */
app.get('/logout', (req, res) => {
    logger.info(`Ruta ${req.method} ${req.url} funcionando correctamente`)
    const nombre = req.user.username
    if (nombre) {
        req.session.destroy(err => {
            if (!err) {
                res.render(path.join(process.cwd(), './views/logout.hbs'), { nombre })
                req.logout();
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/')
    }
  })
  
  /* --------- INICIO ---------- */
app.use('/',isAuth,routerHome)

app.get('/pedido-finalizado', async (req, res) => {
  logger.info(`Ruta ${req.method} ${req.url} funcionando correctamente`)
  const asuntopedido=  `Nuevo pedido de ${req.user.nombre}  ${req.user.username}`
  const infopedido = await sendMail({
    to: cuentaDePrueba,
    subject: asuntopedido,
    html: JSON.stringify(req.carritofinal)
  })
  console.log(infopedido)
  const pedidowhatsapp=  `Nuevo pedido de ${req.user.nombre}  ${req.user.username}  ${JSON.stringify(req.carritofinal)}`
  whatsapp(pedidowhatsapp)
  const to = req.user.numero
  const infomensaje = await client.messages.create({ body, from, to })
  console.log(infomensaje)
  res.render (path.join(process.cwd(), '/views/pedido-finalizado.hbs'), {email: req.user.username, direccion: req.user.direccion,nombre: req.user.nombre,edad: req.user.edad,numero: req.user.numero,foto: req.user.foto,  carrito: req.carritofinal} )
})


app.use('/api/carrito',routerCarrito)
app.use('/api/productos',routerProductos)

app.use(function (req, res, next) {
    const rutaincorrecta= {error:-2, descripcion: `Ruta ${req.url} metodo ${req.method} no implementada`}
    logger.warn(`Ruta ${req.method} ${req.url} no implementada`)
    res.send(rutaincorrecta)
    next();
  });


/* Server Listen */
import os from 'os';
const numCPUs = os.cpus().length;
import cluster from 'cluster'
const modo = "FORK"

if (modo == "FORK") {
  levantarServer();
} else if (modo== "CLUSTER") {
  if (cluster.isMaster){
      console.log(`Cantidad de CPUs: ${numCPUs}`);
      console.log(`Master PID ${process.pid} is running`);
      for (let i=0; i<numCPUs; i++){
          cluster.fork();
      }
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`)
        cluster.fork();});
  } else {
      levantarServer();
  }    
}


function levantarServer(){
  const PORT = 8080
  const server = app.listen(PORT, ()=>{
      logger.info(`Servidor express escuchando en el puerto ${PORT}`)
  });
  server.on('error', error=>logger.error(`Error en servidor: ${error}`));
}


