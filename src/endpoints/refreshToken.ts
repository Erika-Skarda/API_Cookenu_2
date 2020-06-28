import express, { Request, Response } from "express";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import { UserDatabase, UserData } from "../data/UserDatabase";
import { Authenticator } from "../services/Authenticator";
import { BaseDatabase } from "../data/BaseDataBase";
import { RefreshToken } from "../data/RefreshTokenData";

export const createRefrshToken = async(req: Request, res:Response) => {

    try {

        const { refreshToken, device } = req.body

        const auth = new Authenticator()
        const refreshTokenDataAuth = auth.getData(refreshToken)

        const refresh = new RefreshToken()
        const refreshTokenData = await refresh.getRefreshToken(refreshToken)

        console.log(refreshTokenDataAuth)
        console.log(refreshTokenData)

        if(device !== refreshTokenData.device) {

            throw new Error ("Refresh Token has no device")
        }

        const userDatabase = new UserDatabase()
        const user = await userDatabase.getUserById(refreshTokenDataAuth.id)

        const accessToken = auth.generateToken({
            id: user.id,
            role: user.role
        })

        res.status(200).send ({ ACCESS_TOKEN: accessToken})

   } catch(err) {

    res.status(400).send({message: err.message || err.mysqlmessage })

   }
   await BaseDatabase.destroyConnection();
}
