import BaseModel from "./base_model"

export default class TodoModel extends BaseModel {
  id?: number
  description: string = ""
  done: boolean = false

  // public constructor
  constructor() {
    super()    
  }

  static fromJson(json: JSONObject): TodoModel {
    let model = new TodoModel()

    model.id = json['id']
    model.description = json['description']
    model.done = json['done']
    return model
  }

  toJson(): JSONObject {
    let json = super.toJson()
    json['id'] = this.id
    json['description'] = this.description
    json['done'] = this.done
    return json
  }


}
