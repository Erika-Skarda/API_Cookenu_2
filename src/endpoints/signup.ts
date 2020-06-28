import express, { Request, Response } from "express";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import { UserDatabase, UserData } from "../data/UserDatabase";
import { Authenticator } from "../services/Authenticator";
import { BaseDatabase } from "../data/BaseDataBase";
import { RefreshToken } from "../data/RefreshTokenData";

export const signUpEndpoint = async(req: Request, res: Response) => {

    try {
        const userData:UserData = {
            id:'',
            email: req.body.email,
            name: req.body.name,
            password: req.body.password,
            role: req.body.role,
            device : req.body.device

          };

      if (userData.name === "") {

        throw new Error("Preencha o campo name");
      }
  
      if (!userData.email || userData.email.indexOf("@") === -1 || userData.email.includes(".com")!== true) {
        
        throw new Error("Invalid email");

      }
  
      if (!userData.password || userData.password.length < 6) {

        throw new Error("Invalid password");
      }
    
      const idGenerator = new IdGenerator();
      userData.id = idGenerator.generate();
  
      const hashManager = new HashManager();
      userData.password = await hashManager.hash(userData.password);
  
      const userDb = new UserDatabase();
      await userDb.createUser(userData);
  
      const authenticator = new Authenticator();
      const acessToken = authenticator.generateToken({

        id: userData.id,
        role: userData.role
      }, "15s");
      const refreshToken = authenticator.generateToken({
        id: userData.id,
        device: userData.device
      }, "2y")
      
      const refresTokenDataBase = new RefreshToken()
      await refresTokenDataBase.createRefreshToken(refreshToken, userData.device, true, userData.id)
      
      /*const token = authenticator.generateToken({
        id:userData.id,
        role: userData.role
      }) */
      
      res.status(200).send({
        access_token: acessToken,
        refresh_token:refreshToken
      });
    } catch (err) {
      res.status(400).send({
        message: err.message || err.mysqlmessage,
      });
    }
    await BaseDatabase.destroyConnection();
  };
  