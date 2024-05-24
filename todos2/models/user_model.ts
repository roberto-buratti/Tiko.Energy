//
//  user_model.ts
//  todos
//
//  Created by Roberto O. Buratti on 22/05/2024.
//

import BaseModel from "./base_model"

export default class UserModel extends BaseModel {
  email!: string
  password!: string
  password2!: string
  firstName!: string
  lastName!: string
  jwtToken!: string
  refreshToken!: string

  private constructor() {
    super()
  }

  static fromJson(json: JSONObject): UserModel {
    let model = new UserModel()

    model.email = json['email']
    model.password = json['password']
    model.password2 = json['password2']
    model.firstName = json['first_name']
    model.lastName = json['last_name']
    model.jwtToken = json['jwtToken']
    model.refreshToken = json['refreshToken']
    return model
  }

  toJson(): JSONObject {
    let json = super.toJson()
    json['email'] = this.email
    json['password'] = this.password
    json['password2'] = this.password2
    json['first_name'] = this.firstName
    json['last_name'] = this.lastName
    json['jwtToken'] = this.jwtToken
    json['refreshToken'] = this.refreshToken
    return json
  }

}
