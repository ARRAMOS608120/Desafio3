import { promises as fs } from 'fs'


class ContenedorArchivo {

    constructor(archivo) {
        this.archivo = archivo;
    }
 
    async getByID (identificador){
        
        const productosJSON = await this.getAll()

        const indice = productosJSON.findIndex(producto=> producto.id ==identificador)
        if (indice != -1){
        return productosJSON[indice]
    }else{return null}
   
}
    
    async getAll(){
        try{
            const productos = await fs.readFile (this.archivo, 'utf-8')
            return  JSON.parse(productos)
    } catch (error){
        throw new Error (`Error al leer el archivo: ${error}`)
    }
    }

    async save (producto){

        const productosJSON = await this.getAll()

        try{
            if(productosJSON.length == 0){
                 producto.id = 1
                 producto.timestamp = Date.now()
                 productosJSON.push(producto)
            }else{ producto.id = productosJSON[productosJSON.length-1].id+1
                   producto.timestamp = Date.now()
                   productosJSON.push(producto)
            }
     
            await fs.writeFile(this.archivo, JSON.stringify(productosJSON,null,2))
            return producto.id
    }catch (error){
        throw new Error (`Error al escribir el archivo: ${error}`)
        }    
}


async actualizar(producto, id) {
    const  productosJSON = await this.getAll()
    const indice = productosJSON.findIndex(product=> product.id == id)
    productosJSON[indice].nombre = producto.nombre
    productosJSON[indice].precio = producto.precio
    productosJSON[indice].foto = producto.foto
    productosJSON[indice].descripcion = producto.descripcion
    productosJSON[indice].codigo= producto.codigo
    productosJSON[indice].stock = producto.stock

    await fs.writeFile(this.archivo, JSON.stringify(productosJSON,null,2))
}

    async saveProducto (identificador,producto){

            const carritosJSON = await this.getAll()
            
            try{
                const indice = carritosJSON.findIndex(carrito=> carrito.id ==identificador)
                if (indice != -1){
                    if (carritosJSON[indice].productos!=undefined){
                        carritosJSON[indice].productos.push(producto)
                    }else{carritosJSON[indice].productos=[producto]}
            }else{return null}
         
             await fs.writeFile(this.archivo, JSON.stringify(carritosJSON,null,2))
             return carritosJSON[indice].productos
        }catch (error){
            throw new Error (`Error al escribir el archivo: ${error}`)
            }
  
    }
    

 async deleteById (identificador){

    const productosJSON = await this.getAll()

    const indice = productosJSON.findIndex(producto=> producto.id ==identificador)
  
    try{
        productosJSON.splice(indice,1)
        await fs.writeFile(this.archivo, JSON.stringify(productosJSON))
    }catch (error){
        throw new Error (`Error al escribir el archivo: ${error}`)
}
}

async deleteAll(){
      
    const productosJSON = await this.getAll()
  
    try{
        productosJSON.splice(0,productosJSON.length)
        await fs.writeFile(this.archivo, JSON.stringify(productosJSON))
    }catch (error){
        throw new Error (`Error al escribir el archivo: ${error}`)
}

}

async deleteByIdFull (identificadorCarrito,identificadorProducto){

        const carritosJSON = await this.getAll()
        const indice = carritosJSON.findIndex(carrito=> carrito.id == identificadorCarrito)

        try{
            if (indice != -1){
            const productos = carritosJSON[indice].productos
            const idproducto= productos.findIndex(producto=> producto.id == identificadorProducto)
            carritosJSON[indice].productos.splice(idproducto,1)
        }else{return null}
           
        await fs.writeFile(this.archivo, JSON.stringify(carritosJSON,null,2))
        }catch (error){
            throw new Error (`Error al escribir el archivo: ${error}`)
    }

}
}


export default ContenedorArchivo