import { NetworkException } from "../managers/network_manager";
import ServiceManager, { SmartValueNotifier } from "../managers/service_manager"
import TodoModel from "../models/todo_model";
import LoginViewModel from "./login_view_model";

export default class HomeViewModel {
  private serviceManager: ServiceManager

  constructor(serviceManager: ServiceManager) {
    this.serviceManager = serviceManager
  }

  get isAuthenticated(): SmartValueNotifier<boolean>  {
    return this.serviceManager.isAuthenticated
  }

  get isLoading(): SmartValueNotifier<boolean>  {
    return this.serviceManager.isLoading
  }

  get error(): SmartValueNotifier<NetworkException | undefined>  {
    return this.serviceManager.error
  }

  get username(): string | undefined {
    const user = this.serviceManager.currentAuthenticatedUser
    if (user == undefined) {
      return undefined
    }
    const username = user.firstName + " " + user.lastName
    return username.trim().length > 0 ? username : user.email
  }

  getLoginViewModel(): LoginViewModel {
    return new LoginViewModel(this.serviceManager)
  }

  logout() {
    return this.serviceManager.logout()
  }

  async getTodoList(): Promise<TodoModel[]> {
    let todoList = await this.serviceManager.getTodoList()
    return todoList.sort((a, b) => { return (a.id ?? 0) - (b.id ?? 0)})
  }

  async save(todo: TodoModel) {
    await this.serviceManager.save(todo)
  }

  async delete(todo: TodoModel) {
    await this.serviceManager.delete(todo)
  }

}