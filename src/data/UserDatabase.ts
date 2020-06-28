import { BaseDatabase } from "./BaseDataBase";
import { RecipeDataBase } from './RecipeDataBase'

export interface UserData {
  id: string,
  email:string,
  name:string,
  password:string,
  role: string | undefined,
  device: string,

}
export class UserDatabase extends BaseDatabase {
  

  private static TABLE_NAME = "cookenu_user";
  private static TABLE_NAME_FOLLOW = "cookenu_follow";

  public async createUser(data:UserData
    // id: string,
    // email: string,
    // name: string,
    // password: string,
    // role: string
  ): Promise<void> {
    await this.getConnection()
      .insert(data
        // id,
        // email,
        // name,
        // password,
        // role
      )
      .into(UserDatabase.TABLE_NAME);
  }

  public async getUserByEmail(email: string): Promise<any> {
    const result = await this.getConnection()
      .select("*")
      .from(UserDatabase.TABLE_NAME)
      .where({ email });

    return result[0];
  }

  public async getUserById(id: string): Promise<any> {
    const result = await this.getConnection()
      .select("*")
      .from(UserDatabase.TABLE_NAME)
      .where({ id });

    return result[0];
  }
  public async deleteFollow(id: string): Promise<void> {
    await this.getConnection()
    .del()
    .from(UserDatabase.TABLE_NAME_FOLLOW)
    .where({ id_follower:id })
    .orWhere({ id_followed :id})

  }

  public async deleteFollowRaw(id: string): Promise<void> {
    
    await this.getConnection().raw (
      `DELETE FROM ${UserDatabase.TABLE_NAME_FOLLOW}
       WHERE ${id} = id_follower
       OR WHERE ${id} =id_followed
      `
    )
  }
  public async deleteUser(id:string):Promise<void> {

    await this.getConnection()
    .del()
    .from(UserDatabase.TABLE_NAME)
    .where({ id })

  }
  public async getfollowUserById(id_follower: string, id_followed: string): Promise<any>{
    const result = await this.getConnection()
      .select ("*")
      .from(UserDatabase.TABLE_NAME_FOLLOW)
      .where({  id_followed, id_follower });

      return(result.length)
  }

  public async followUserById(id_follower: string, id_followed: string): Promise<any>{
    const result = await this.getConnection()
      .insert({
        id_followed,
        id_follower
      })
      .into(UserDatabase.TABLE_NAME_FOLLOW)

      return(result)
  }
  public async unfollowUserById(id_followed: string, id_follower: string): Promise<any>{
     await this.getConnection().raw (
       `
       DELETE 
       FROM cookenu_follow
       WHERE id_follower = "${id_follower}" 
       AND id_followed = "${id_followed}"

       `
     )
  }
  public async getRecipeFeed(author_id:string):Promise<any> {

    const recipeFeed = await this.getConnection().raw ( 
      `
       SELECT cr.id AS "ID_RECIPE", cr.title, cr.description, cr.createAt, cr.author_id, cu.name AS "author"
       FROM cookenu_recipe AS cr
       JOIN ${UserDatabase.TABLE_NAME} AS cu
       ON cr.author_id = cu.id
       JOIN ${UserDatabase.TABLE_NAME_FOLLOW} AS cf
       ON cf.id_followed = cu.id
       WHERE cf.id_follower = "${author_id}"
       ORDER BY cr.createAt DESC
       
      `
    )
    return recipeFeed[0][0]
  }
}
