import express, { Request, Response } from "express";
import { HashManager } from "../services/HashManager";
import { UserDatabase, UserData } from "../data/UserDatabase";
import { Authenticator } from "../services/Authenticator";
import { BaseDatabase } from "../data/BaseDataBase";
import { RefreshToken } from "../data/RefreshTokenData";


export const loginEndpoint = async (req: Request, res: Response) => {
    try {
      
      const userData = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
      };
  
      if (!req.body.email || req.body.email.indexOf("@") === -1 || req.body.email.includes(".com") !== true) {
        throw new Error("Invalid email");
      }
  
      const userDatabase = new UserDatabase();
      const user = await userDatabase.getUserByEmail(userData.email);
  
      const passwordCheck = await new HashManager().compare(user.password, userData.password)
  
      if(!passwordCheck || !user) {
        throw new Error("Invalid password or email");
      }
  
      const authenticator = new Authenticator();
      const token = authenticator.generateToken({
        id: user.id,
        role:user.role
      });
      
      const refreshToken = authenticator.generateToken({
        id: user.id,
        device: user.device 

      },process.env.ACESS_TOKEN_EXPIRES_IN )

      const refreshTokenDatabase = new RefreshToken()
      const refreshTokenFromDayabase = await refreshTokenDatabase.getRefreshTokenByIdAndDevice(user.id, user.device)

      if(refreshTokenFromDayabase) {

        await refreshTokenDatabase.deleteRefreshToken(refreshTokenFromDayabase.token)
     
      }

      await refreshTokenDatabase.createRefreshToken(
        refreshToken,
        user.device,
        true,
        user.id

      )
      res.status(200).send({
        ACCESS_TOKEN: token,
        REFRESH_TOKEN: refreshToken
      })
    } catch (err) {
      res.status(400).send({
        message: err.message,
      });
    }
    await BaseDatabase.destroyConnection();
  };
  