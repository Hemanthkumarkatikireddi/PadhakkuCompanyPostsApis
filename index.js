const e = require("express");
const express = require("express");
const path = require("path");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");


const app = express();
app.use(express.json());

const dbPath=path.join(__dirname,"posts.db");
let db = null;

const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database,
        });
        app.listen( 4000 , () => {
            console.log(`server is working on http://localhost:${4000}`)
        });
    } catch (error) {
        console.log(`Db error: ${error.message}`)
        process.exit(1);
    }
} 

initializeDbAndServer();

// api 1 (Sign UP)

app.post("/api/signup",async(req,res) => {
    const {name,email} = req.body;
    const selectUserQuery = `select * from user where email='${email}'`;
    const dbUser = await db.get(selectUserQuery);

    if(dbUser=== undefined){
        const regEmail = /^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/;

        const validity = regEmail.test(email);
        if(validity){
            const createUserQuery = `insert into user (name,email) values ("${name}" , "${email}")` 
            const user = await db.run(createUserQuery);
            res.status(200);
            res.send("Successful user sign-up.");
        }else{
            res.status(400);
            res.send("Invalid email format.");
        }

    }else{
        res.status(400);
        res.send("Email already registered.");
    }
    
})

// api 2 (Create Post Api)

app.post("/api/posts", async(req,res) => {
    const {userId,content} = req.body
    const selectUserQuery = `select * from user where id='${userId}'`;
    const dbUser = await db.get(selectUserQuery);

    if(dbUser){
        if(content){
            const createPostQuery = `insert into post (userId, content) values ("${userId}" , "${content}")` 
            const user = await db.run(createPostQuery);
            res.status(200);
            res.send("Successfully created.");

        }else{
            res.status(400);
            res.send("Content cannot be empty.");
        }

    }else{
        res.status(404);
        res.send("User ID not found.");
    }

})

// api 3 (Delete Post)

app.delete("/api/deletepost/:postId", async(req,res) =>{
    const {postId} = req.params;
    const {userId} = req.body;
    const selectPostQuery = `select * from post where id= ${postId}`;
    const dbPost = await db.get(selectPostQuery);

    if(dbPost){
        // console.log("dbPost",dbPost);
        if(dbPost.userId === userId){
            const deleteQuery = `delete from post where id = ${postId}`;
            const dbDelete = await db.run(deleteQuery);
            res.status(200);
            res.send("Successful post deletion.");

        }else{
            res.status(403);
            res.send("Unauthorized to delete this post.");
        }

    }else{
        res.status(404);
        res.send("Post ID not found.");
    }
})

// api 4 (Fetch user Api's)

app.get("/API/posts/:userId", async(req,res) => {
    const {userId} = req.params;
    const selectUserQuery = `select * from user where id='${userId}'`;
    const dbUser = await db.get(selectUserQuery);

    if(dbUser){
        const getPostsQuery = `select id as postId, content from post where userId = ${userId}`;
        const posts = await db.all(getPostsQuery);
        if(posts.length>0){
            res.status(404);
            const result = {
                status: 200,
                posts: posts
            }
            res.send(result);

        }else{
            res.status(404);
            res.send("No posts found for this user.");
        }

    }else{
        res.status(404);
        res.send("User ID not found.");
    }

})



module.exports = app;

