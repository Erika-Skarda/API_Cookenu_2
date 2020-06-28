import { BaseDatabase } from "./BaseDataBase";

export class RefreshToken extends BaseDatabase {
    private static TABLE_NAME = "RefreshToken";

    public async createRefreshToken (
        refresh_token : string,
        device : string,
        is_active : boolean,
        user_id : string
    ) : Promise<void> {

        await this.getConnection()
         .insert({
            refresh_token,
            device,
            is_active: Number(is_active) === 0 ? false : true,
            //is_active: this.convertBooleanToInt(is_active)
            user_id 
         })
         .into(RefreshToken.TABLE_NAME)
    }

    public async getRefreshToken (refresh_token: string) : Promise<any> {
        const result = await this.getConnection().raw (
            `
            SELECT * FROM ${RefreshToken.TABLE_NAME}
            WHERE refresh_token = "${refresh_token}"
            `
        )
        const retrievdeToken =  result[0][0]

        return {
            refresh_token: retrievdeToken.refresh_token,
            device: retrievdeToken.device,
            is_active : Number(retrievdeToken.is_active) === 0 ? false : true,
            user_id: retrievdeToken.user_id
        }
        
    }

    public async getRefreshTokenByIdAndDevice (id:string, device:string): Promise<any> {
        const result = await this.getConnection().raw(
            `
            SELECT  * FROM ${RefreshToken.TABLE_NAME}
            WHERE user_id = "${id}"
            AND device - "${device}"
            `
        )
        const retrievedToken = result[0][0]
        if(retrievedToken === undefined) {

            return undefined
        }
        return {
            refresh_token: retrievedToken.refresh_token,
            device: retrievedToken.device,
            is_active : Number(retrievedToken.is_active) === 0 ? false : true,
            user_id: retrievedToken.user_id
        }
    }
    public async deleteRefreshToken(token:string) : Promise<void> {
        await this.getConnection()
            .del()
            .from(RefreshToken.TABLE_NAME)
            .where({refresh_token: token})
    }
}