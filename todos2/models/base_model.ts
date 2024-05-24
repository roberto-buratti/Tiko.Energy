//
//  base_model.ts
//  todos
//
//  Created by Roberto O. Buratti on 22/05/2024.
//

export default abstract class BaseModel {

  constructor() {
  }

  toJson(): JSONObject {    
    let json = JSON.parse("{}")
    return json;
  }

}
