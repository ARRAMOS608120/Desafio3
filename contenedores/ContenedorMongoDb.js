import mongoose from 'mongoose'
import config from '../config.js'


await mongoose.connect(config.mongodb.cnxStr, config.mongodb.options)

class ContenedorMongoDb {

    constructor(nombreColeccion, esquema) {
        this.coleccion = mongoose.model(nombreColeccion, esquema)
    }

    async getByID(id) {
        try {
            const doc= await this.coleccion.find({ '_id': id })
            if (doc.length == 0) {
                throw new Error(' ID no encontrado')
            } else {
                const resultado= JSON.parse(JSON.stringify(doc[0]))
                resultado['id'] = resultado ['_id']
                return resultado
            }
        } catch (error) {
            throw new Error(`Error al buscar por id: ${error}`)
        }
    }

    async getAll() {
        try {
            let listado = await this.coleccion.find({})
            listado = listado.map(obj => JSON.parse(JSON.stringify(obj)))

            return listado
        } catch (error) {
            throw new Error(`Error al listar todo: ${error}`)
        }
    }

    async save(producto) {
        try {
            let doc = await this.coleccion.create(producto);
            return doc.id
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }

    async actualizar(producto,id) {
        try {
            let actualizado = await this.coleccion.updateOne({
                 _id: id,
              }, { nombre: producto.nombre, precio: producto.precio})
              console.log(actualizado)
        } catch (error) {
            throw new Error(`Error al actualizar: ${error}`)
        }
    }

    async deleteById(id) {
        try {
            const { n, nDeleted } = await this.coleccion.deleteOne({ '_id': id })
            if (n == 0 || nDeleted == 0) {
                throw new Error('Error al borrar: no encontrado')
            }
        } catch (error) {
            throw new Error(`Error al borrar: ${error}`)
        }
    }


    async saveProducto (identificador,producto){
        try {
            const doc = await this.getByID(identificador)
            doc.productos.push(producto)
            const products=doc.productos
            let actualizado = await this.coleccion.updateOne({
                 _id: identificador,
              }, { productos: products})
            console.log(actualizado)
        } catch (error) {
            throw new Error(`Error al actualizar: ${error}`)
        }
    }

    async deleteByIdFull (identificadorCarrito,identificadorProducto){

        const doc = await this.getByID(identificadorCarrito)
        const indice= doc.productos.findIndex(p => p.id == identificadorProducto)
        try{
            if (indice != -1){
                doc.productos.splice(indice, 1)
                const products = doc.productos
                let actualizado = await this.coleccion.updateOne({
                    _id: identificadorCarrito,
                 }, { productos: products})
               console.log(actualizado)
        }else{return null}
        }catch (error){
            throw new Error (`Error al borrar producto: ${error}`)
    }

    }


}

export default ContenedorMongoDb