import express from 'express'
const { Router } = express


import { productosDao } from './daos/index.js'
import { carritosDao } from './daos/index.js'

const administrador= true;

/* ------------------------------------------------------ */
/* Productos */

const routerProductos = new Router()
routerProductos.use(express.json())
routerProductos.use(express.urlencoded({ extended: true }))


routerProductos.get('/', async (req, res) => {
    const products= await productosDao.getAll()
    if (products.length==0){
        res.render('mainformulario', { listadoProd: products, listExists: false })
    } else {res.render('mainformulario', { listadoProd: products, listExists: true })}
})

routerProductos.get('/:id', async(req, res) => {
    const productoSel=await productosDao.getByID(req.params.id)
    res.json(productoSel)
})


routerProductos.post('/', async(req, res) => {
    if(administrador!=false){
    const prueba = await productosDao.save(req.body)
    res.redirect('/api/productos')}else{ res.json({error: -1, descripcion: 'ruta api/productos metodo POST no autorizada'})}
})

routerProductos.put('/:id', async (req, res) => {
    if(administrador!=false){
        const producto = req.body
        await productosDao.actualizar(producto,req.params.id)
        const obtener = await productosDao.getByID(req.params.id)
        res.json(obtener)
    }else{ res.json({error: -1, descripcion: 'ruta api/productos/:id metodo PUT no autorizada'}  )}
  
})

routerProductos.delete('/:id', async(req, res) => {
    if(administrador!=false){
        const borrado = await productosDao.deleteById(req.params.id)
        res.json(borrado)}else{res.json({error: -1, descripcion: 'ruta api/productos/:id metodo DELETE no autorizada'}  )}
    
})

 
/* ------------------------------------------------------ */

/* Carrito*/

const routerCarrito = new Router()
routerCarrito.use(express.json())
routerCarrito.use(express.urlencoded({ extended: true }))

routerCarrito.post('/', async(req, res) => {
    const carritoNuevo = {}
    const prueba = await carritosDao.save(carritoNuevo)
    res.json(prueba)
})

routerCarrito.delete('/:id', async(req, res) => {
    const borrado = await carritosDao.deleteById(req.params.id)
    res.json(borrado)
})

routerCarrito.get('/:id/productos', async(req, res) => {
    const productoSel=await carritosDao.getByID(req.params.id)
    res.json(productoSel.productos)
  
    
})

routerCarrito.post('/:id/productos', async(req, res) => {
    const prueba = await carritosDao.saveProducto(req.params.id,req.body)
    res.json(prueba)
})

routerCarrito.delete('/:id/productos/:id_prod', async(req, res) => {
    const borrado = await carritosDao.deleteByIdFull(req.params.id,req.params.id_prod)
    res.json(borrado)
})

/* ------------------------------------------------------ */
/* Productos home*/

const routerHome = new Router()
routerHome.use(express.json())
routerHome.use(express.urlencoded({ extended: true }))

routerHome.get('/', async (req, res) => {
    const carritos = await carritosDao.getAll()
    console.log(carritos)
    const resultado = carritos.find( carrito => carrito.username === ' req.user.username' );
    console.log(resultado)
    const products= await productosDao.getAll()
    if (resultado==undefined){
        const carritoNuevo = {username: req.user.username}
        const prueba = await carritosDao.save(carritoNuevo)
        console.log(prueba.id)
        //const productoSel=await carritosDao.getByID(req.params.id)
        if (products.length==0){
            res.render('index', { listadoProd: products, listExists: false, email: req.user.username, direccion: req.user.direccion,nombre: req.user.nombre,edad: req.user.edad,numero: req.user.numero,foto: req.user.foto} )
        } else {res.render('index', { listadoProd: products, listExists: true, email: req.user.username, direccion: req.user.direccion,nombre: req.user.nombre,edad: req.user.edad,numero: req.user.numero,foto: req.user.foto })}
    }
    else{
        if (products.length==0){
            res.render('index', { listadoProd: products, listExists: false, email: req.user.username, direccion: req.user.direccion,nombre: req.user.nombre,edad: req.user.edad,numero: req.user.numero,foto: req.user.foto} )
        } else {res.render('index', { listadoProd: products, listExists: true, email: req.user.username, direccion: req.user.direccion,nombre: req.user.nombre,edad: req.user.edad,numero: req.user.numero,foto: req.user.foto })}
    }
    
 } )

export { routerCarrito, routerProductos, routerHome} 
