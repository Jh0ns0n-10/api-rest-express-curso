const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express = require("express");
const config = require("config");
const morgan = require("morgan");
const Joi = require("@hapi/joi");
const app = express();
//const logger = require("./logger.js");

app.use(express.json());//body
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

//configuracion de entornos
console.log("Aplication: " + config.get("nombre"));
console.log("BD Server: " + config.get("configDB.host"));

//USO DE MIDDELWARE DE TERCERO - MORGAN
if(app.get('env') === 'development'){
    app.use(morgan("tiny"));
    //console.log("Morgan habilitado");
    inicioDebug('Morgan esta habilitado');
}

dbDebug('Conectando con la base de datos');

app.use(function(req,res,next){
    console.log("Autenticando...");
    next();
});

const usuarios = [
    {id: 1, nombre: 'Joel'},
    {id: 2, nombre: 'Juan'},
    {id: 3, nombre: 'Perez'}
]
app.get("/", (req, res)=>{
    res.send("Suñuna");
});

app.get("/api/usuarios",(req, res)=>{
    res.send(usuarios);
});

app.get("/api/usuarios/:id",(req, res)=>{
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    if(!usuario){
        res.status(404).send("El usuario no fue encontrado"); //Indica que la pagina no ha sido encontrada
        return;
    } 
    res.send(usuario);
});

app.post("/api/usuarios",(req,res)=>{

    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    const {error, value} = schema.validate({nombre:req.body.nombre});
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        }
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        res.status(400).send(error.message);
    }
    
})

app.put("/api/usuarios/:id", (req,res)=>{
    //Encontrar si existe el usuario
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    if(!usuario) res.status(404).send("El usuario no fue encontrado");

    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    const {error, value} = schema.validate({nombre:req.body.nombre});
    if(error){
        res.status(400).send(error.message);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
});

app.delete("/api/usuarios/:id", (req,res)=>{
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    if(!usuario) res.status(404).send("El usuario no fue encontrado");

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index,1);

    res.send(usuarios);
});

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`Escuchando en el puerto ${port}...`)
});
