import express from 'express'
//import exphbs from 'express-handlebars'

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
//import { routerCarrito, routerProductos } from './rutas.js'

import passport from 'passport'
import { Strategy as LocalStrategy} from 'passport-local'

app.use(session({
  store: MongoStore.create({ mongoUrl:'mongodb+srv://ariel:Coder2021@cluster0.wjzen.mongodb.net/ecommerce?retryWrites=true&w=majority',
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
/* ------------------------------------------------------ */
/* MongoAtlas / Entregable 3*/

import mongoose from 'mongoose'

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
        await mongoose.connect ('mongodb+srv://ariel:Coder2021@cluster0.wjzen.mongodb.net/ecommerce?retryWrites=true&w=majority',{
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
    console.log('usuario agregado!')}catch (error) {
      console.log(`Error en operación de base de datos ${error}`)
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
  if (user.password != createHash(password)) {
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
      res.sendFile(__dirname + '/views/register.html')
    })
    
    app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/' }))
    
    app.get('/failregister', (req, res) => {
      res.render('register-error');
    })
  
// LOGIN
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html')
})

app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/' }))

app.get('/faillogin', (req, res) => {
  res.render('login-error');
})


    /* Cargo los routers */

app.set('view engine', 'hbs')
app.set('views', './views')

/* --------- LOGOUT ---------- */
app.get('/logout', (req, res) => {
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
app.get('/', isAuth, (req, res) => {
 res.render(path.join(process.cwd(), '/views/index.hbs'), {email: req.user.username} )
   console.log(req.user.username)
 })

//app.use('/api/carrito',routerCarrito)
//app.use('/api/productos',routerProductos)
/*app.use(function (req, res, next) {
    const rutaincorrecta= {error:-2, descripcion: `Ruta ${req.url} metodo ${req.method} no implementada`}
    res.send(rutaincorrecta)
    next();
  });*/


/* Server Listen */
const PORT = 8080
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${server.address().port}`)
})
server.on('error', error => console.log(`Error en servidor ${error}`))

