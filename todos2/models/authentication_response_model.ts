//
//  authentication_response_model.ts
//  todos
//
//  Created by Roberto O. Buratti on 22/05/2024.
//

import BaseModel from "./base_model"

export default class AuthenticationResponseModel extends BaseModel {
  jwtToken: string = ""
  refreshToken: string = ""

  private constructor() {
    super()
  }

  static fromJson<T>(json: JSONObject): AuthenticationResponseModel {
    let model = new AuthenticationResponseModel()
    model.jwtToken = json['access']
    model.refreshToken = json['refresh']
    return model
  }
}
