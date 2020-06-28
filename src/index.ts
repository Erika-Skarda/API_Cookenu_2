import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import { IdGenerator } from "./services/IdGenerator";
import { UserDatabase, UserData } from "./data/UserDatabase";
import { Authenticator } from "./services/Authenticator";
import { HashManager } from "./services/HashManager";
import { BaseDatabase } from "./data/BaseDataBase";
import { RecipeDataBase } from "./data/RecipeDataBase";
import moment from "moment";
import { signUpEndpoint } from "./endpoints/signup";
import { loginEndpoint } from "./endpoints/login";

dotenv.config();

const app = express();

app.use(express.json());

//**************************************************************************** */
app.post("/signup", signUpEndpoint ) 

app.post("/login", loginEndpoint ) 

app.post("/user/follow", async (req: Request, res: Response) => {
  try {
    const userToFollowId = {
      id: req.body.id,
    };
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    const follower = authenticator.getData(token);

    const userDatabase = new UserDatabase();
    const already = await userDatabase.getfollowUserById(userToFollowId.id, follower.id)

    if(userToFollowId.id === follower.id || !token || userToFollowId.id === "") {

      throw new Error("Invalid");

    }
    if(already > 0) {

      throw new Error("Você já segue");
    }

   console.log(already)
   await userDatabase.followUserById(userToFollowId.id, follower.id);
 
    res.status(200).send({
      message: "Followed successfully",
    });
  } catch (error) {
    res.status(400).send({message: error.message});
  }
  await BaseDatabase.destroyConnection();
});
app.post("/user/unfollow", async(req:Request, res:Response) => {

  try {
    const token = req.headers.authorization as string;

    const userToUnfollowId = req.body.id

    if(!token || !userToUnfollowId) {

      throw new Error("Invalid");
    } 
    const authenticator = new Authenticator();
    const follower = authenticator.getData(token);

    const userDatabase = new UserDatabase();
    const followerId = userDatabase.getUserById(follower.id)
    
    if(!followerId) {

      throw new Error("Invalid");
    }
    await new UserDatabase().unfollowUserById(userToUnfollowId, follower.id);

    res.status(200).send({message: "Unollowed successfully"});

  } catch (error) {

    res.status(400).send({message: error.message || error.mysqlmessage});
  }
  await BaseDatabase.destroyConnection();
})
app.get("/user/profile", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    const authenticationData = authenticator.getData(token);

    const userDb = new UserDatabase();
    const user = await userDb.getUserById(authenticationData.id);

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role:authenticationData.role
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
  await BaseDatabase.destroyConnection();
});
app.delete("/delete/:idUser", async(req:Request,res:Response) => {

  try {
    const token = req.headers.authorization as string
    const idDelete = req.params.id
    
    const authenticator = new Authenticator();
    const verifiedToken = authenticator.getData(token)

    const userData =  new UserDatabase()
    const user = await userData.getUserById(idDelete)

    if(verifiedToken.role !== "admin" ||( user.author_id !== verifiedToken.id && verifiedToken.role !== "admin")) {

      res.status(401).send({message: "Você não está autorizado a fazer isso"})

    } else if(!userData) {

      res.status(400).send({message: "Usuário não existe"})

    } else {

      const recipeDb = new RecipeDataBase();

      await recipeDb.deleteRecipeAuthor(idDelete) 

      await userData.deleteFollow(idDelete)

      await userData.deleteUser(idDelete)

      res.status(200).send({message:"Usuário deletado com sucesso!"})

    }
    
  } catch(error) {

    res.status(400).send({message: error.message || error.mysqlmessage});

  }
  await BaseDatabase.destroyConnection();
})

app.get("/recipe/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    authenticator.getData(token);

    const recipeDb = new RecipeDataBase();
    const recipe = await recipeDb.getRecipeById(id);

    res.status(200).send({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      createDate: recipe.createDate,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
  await BaseDatabase.destroyConnection();
});
/*app.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization as string;
    const id = req.params.id;

    const authenticator = new Authenticator();
    authenticator.getData(token);

    const userDb = new UserDatabase();
    const user = await userDb.getUserById(id);

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
  await BaseDatabase.destroyConnection();
});
*/
 
app.post("/recipe", async (req: Request, res: Response) => {
  try {
      const token = req.headers.authorization as string;

      const authenticator = new Authenticator;
      const authorId = authenticator.getData(token);

      const id = new IdGenerator().generate();
     
      const createAt = moment().format("DD/MM/YYYY")

      const {title, description} = req.body

      const newRecipe = await new RecipeDataBase().createRecipe(
          id,
          title,
          description,
          createAt,
          authorId.id
      );
      if (!title || !description) {

        res.status(400).send({ message: "Preencha todos os campos"});

      } else {

        res.status(200).send({title, description});
      }
          
  } catch(err) {
      res.status(400).send({message: err.message || err.mysqlmessage })
  }
})
app.get("/updateRecipe", async(req:Request, res:Response) => {

  try {

    const token = req.headers.authorization as string
    const idUser = new Authenticator().getData(token)

    const idRecipe = req.body.id
    const {newTitle, newDescription} = req.body

    const recipeToUpdate = await new RecipeDataBase().getRecipeById(idRecipe)

    if(recipeToUpdate.author_id !== idUser.id || idUser.role !== "normal") {
      
      res.status(401).send({ message: "Não autorizado"});

    }

    await new RecipeDataBase().updateRecipe(idRecipe, newTitle, newDescription)
    
    res.status(200).send({ message:
      newTitle,
      newDescription
    });
  } catch(err) {

    res.status(400).send({message: err.message || err.mysqlmessage});

  }

})
app.delete("/delete/recipe", async(req:Request, res:Response) => {

  try { 
    const idDelete = req.body.id;
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    const tokenData = authenticator.getData(token);

    const recipeData = await new RecipeDataBase().getRecipeById(idDelete)

    if(recipeData.author_id !== tokenData.id && tokenData.role === "normal") {

      res.status(401).send({ message: "Não autorizado"});

    }

    await new RecipeDataBase().deleteRecipe(idDelete)

    res.status(200).send({message:"Receita deletada com sucesso!"})

  } catch(err) {

    res.status(400).send({ message: err.message || err.mysqlmessage });

  }

})
app.get("/users/feed", async(req:Request, res:Response) => {

  try {
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    const payloadAuthor = authenticator.getData(token);

    const receipeFeed = await new UserDatabase().getRecipeFeed(payloadAuthor.id)

    console.log(payloadAuthor)
    res.status(200).send({recipes:[receipeFeed]})
  } catch(err) {
    res.status(400).send({message: err.message || err.mysqlmessage })
  }
  
  await BaseDatabase.destroyConnection();

})
const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo;
    console.log(`Server is running in http://localhost:${address.port}`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});
