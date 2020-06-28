import { BaseDatabase } from "./BaseDataBase";

export class RecipeDataBase extends BaseDatabase {
  private static TABLE_NAME = "cookenu_recipe";

  public async createRecipe(
    id: string,
    title: string,
    description: string,
    createAt: string,
    author_id:string
  ): Promise<any> {
    await this.getConnection()
      .insert({
        id,
        title,
        description,
        createAt,
        author_id
        
      })
      .into(RecipeDataBase.TABLE_NAME);
      await BaseDatabase.destroyConnection();
  }
  public async getRecipeById(id: string): Promise<any> {
    const recipe = await this.getConnection()
      .select("*")
      .from(RecipeDataBase.TABLE_NAME)
      .where({ id });

    return recipe[0];
  }
  public async updateRecipe (
    id: string,
    newTitle:string, 
    newDescription:string) : Promise<void> {
      
    await this.getConnection()
        .update({

          title: newTitle,
          description: newDescription

        })
        .from(RecipeDataBase.TABLE_NAME)
        .where({ id });
      
    }
    public async deleteRecipe(id:string):Promise<void> {

      await this.getConnection()
      .del()
      .from(RecipeDataBase.TABLE_NAME)
      .where({ id })

    }
    public async deleteRecipeAuthor(author_id:string) : Promise<void> {
       await this.getConnection()
      .del()
      .from(RecipeDataBase.TABLE_NAME)
      .where({author_id })
    }
}
// const editInfoUser = async(id:string, name:string, nickname:string):Promise<any> => {
//   try {

//       const result = await connection.raw (
//           `
//           UPDATE User
//           SET name = "${name}", nickname = "${nickname}"
//           WHERE id = "${id}"
//           `
//       )
//       return (result[0][0])

//   } catch(err) {

//       console.log("\x1b[31m","Erro ao encontrar usuário")
//   }
// }