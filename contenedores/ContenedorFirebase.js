import admin from "firebase-admin"
import config from '../config.js'

admin.initializeApp({
    credential: admin.credential.cert(config.firebase)
})

const db = admin.firestore();

class ContenedorFirebase {

    constructor(nombreColeccion) {
        this.coleccion = db.collection(nombreColeccion)
    }

    async getByID(id) {
        try {
            const doc = await this.coleccion.doc(id).get();
            if (!doc.exists) {
                throw new Error(`ID no encontrado`)
            } else {
                return { ...doc.data(), id }
            }
        } catch (error) {
            throw new Error(`Error al buscar por id: ${error}`)
        }
    }

    async getAll() {
        try {
            const lista = []
            const todos = await this.coleccion.get();
            todos.forEach(doc => {
                lista.push({ id: doc.id, ...doc.data() })
            })
            return lista
        } catch (error) {
            throw new Error(`Error al listar todos los elementos: ${error}`)
        }
    }

    async save(producto) {
        try {
            const guardado = await this.coleccion.add(producto);
            return { ...producto, id: guardado.id }
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }

    async actualizar(producto, identificador) {
        try {
            const actualizado = await this.coleccion.doc(identificador).set(producto);
            return actualizado
        } catch (error) {
            throw new Error(`Error al actualizar: ${error}`)
        }
    }

    async deleteById(id) {
        try {
            const eliminado = await this.coleccion.doc(id).delete();
            return eliminado
        } catch (error) {
            throw new Error(`Error al borrar: ${error}`)
        }
    }

    async saveProducto (identificador,producto){
        try {
            const doc = await this.coleccion.doc(identificador).get();

            if (!doc.exists) {
                throw new Error(`ID no encontrado`)
            } else {
               if (doc.data().productos==undefined){
                    const nuevo = await this.coleccion.doc(identificador).set({productos: [producto]});
                    return nuevo
                }else{
                    const lista = doc.data().productos
                    console.log(lista)
                    lista.push(producto)
                    console.log(lista)
                    const actualizado = await this.coleccion.doc(identificador).set({productos: lista});
                    return actualizado
                }
            }
    
        } catch (error) {
            throw new Error(`Error al actualizar: ${error}`)
        }
    }

    async deleteByIdFull (identificadorCarrito,identificadorProducto){
        
            const doc = await this.coleccion.doc(identificadorCarrito).get();
            const indice= doc.data().productos.findIndex(p => p.id == identificadorProducto)
            if (indice != -1){
                    const lista = doc.data().productos
                    lista.splice(indice,1)
                    console.log(lista)
                    const actualizado = await this.coleccion.doc(identificadorCarrito).set({productos: lista});
                    return actualizado
        
            } else {
                return null
                }
    }
}

export default ContenedorFirebase