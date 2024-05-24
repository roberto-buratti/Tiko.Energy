import ServiceManager from "../managers/service_manager"
import UserModel from "../models/user_model"

export default class LoginViewModel {
  _serviceManager: ServiceManager

  constructor(serviceManager: ServiceManager) {
    this._serviceManager = serviceManager
  }

  async login(email: string, password: string) {
    await this._serviceManager.login(email, password)
  }

  async register(email: string, password: string, password2: string, firstName: string, lastName: string) {
    let user = UserModel.fromJson({
      email,
      password,
      password2,
      "first_name": firstName,
      "last_name": lastName
    })
    await this._serviceManager.register(user)    
  }

}