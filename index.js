import  express, { request } from "express";
import { MongoClient } from 'mongodb';
import { ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const url="mongodb+srv://caroljeffri:Carol290304@carol.oeewlco.mongodb.net/?retryWrites=true&w=majority&appName=Carol"
const client=new MongoClient(url);
await client.connect();
console.log("Db connected Successfully");
app.use(express.json());
app.use(cors());
const auth= (request,response,next) => {
    try{
        const token=request.header("backend-token");
        jwt.verify(token,"student");
        next();
    }catch(error){
        response.status(401).send({message:error.message});
    }
}

app.get("/",function(request,response){
    response.status(200).send("Hello world")
});
app.post("/post", async function(request,response){
    const getPostman = request.body;
    const setMethod= await client.db("CRUD").collection("data").insertOne(getPostman);
    console.log(getPostman);
    response.status(201).send(setMethod);
});

app.post("/postmany",async function(request,response){
const getmany =request.body;
const sendMethod = await  client.db("CRUD").collection("data").insertMany(getmany);
response.status(201).send(sendMethod);
});
app.get("/get",auth, async function (request,response){
    const getMethod = await client.db("CRUD").collection("data").find({}).toArray();
    response.status(200).send(getMethod);

});
app.get("/getone/:id",async function(request,response){
    const {id}=request.params;
    const getMethod=await client.db("CRUD").collection("data").findOne({_id:new ObjectId(id)});
    response.status(200).send(getMethod);
});                
app.put("/put/:id",async function(request,response){
    const {id} = request.params;
    const getPostman = request.body;
    const updateMethod = await client.db("CRUD").collection("data").updateOne({_id : new ObjectId(id)},{$set:getPostman});
    response.status(200).send(updateMethod);
});

app.delete("/delete/:id",async function(request,response){
    const {id} = request.params;
    const deleteMethod = await client.db("CRUD").collection("data").deleteOne({_id : new ObjectId(id)});
    response.status(200).send(deleteMethod);
})

app.post("/register", async function(request,response){
const {username,email,password} = request.body;
const userfind= await client.db("CRUD").collection("private").findOne({email:email});
if(userfind) {
    response.status(400).send("User already exists");
} else{
    const salt=await bcrypt.genSalt(10);
    const hashPass=await bcrypt.hash(password,salt);
   console.log(hashPass);
   const registerMethod = await client.db("CRUD").collection("private").insertOne({username:username,email:email,password:hashPass});  
   response.status(200).send(registerMethod);
}
})
app.post("/login", async function(request,response){
    const {email,password}=request.body;
    const userFind = await client.db("CRUD").collection("private").findOne({email:email});
    // console.log(email,password);
if(userFind){
   const mongodbpassword=userFind.password;
   const passwordcheck=await bcrypt.compare(password,mongodbpassword);
   console.log(passwordcheck);
    if(passwordcheck==true){
    const token = jwt.sign({id:userFind._id},"student");
    response.status(200).send({token:token});

    }
    else{
        response.status(400).send("invalid password");
    }
    }
else
    {
        response.status(400).send("login failed -  Invalid email id");
    }
});
app.listen(5000,() => {
    console.log ("server connected successfully");
})