import NetworkManager, { INetworkManagerDelegate, NetworkException } from './network_manager'
import UserManager, { IUserManagerDelegate } from './user_manager'

//import GenericResponse from '../messages/generic_response'
import AuthenticationResponseModel from '../models/authentication_response_model'

import UserModel from '../models/user_model'
import TodoModel from '../models/todo_model'

type VoidCallback = (data: any) => void;

// [ROB] like Flutter ValueNotifier but it doesn't call the newly added listener if value is undefined.
export class SmartValueNotifier<T> {
  private _value: T
  private _listeners: VoidCallback[] = []

  constructor(value: T) {
    this._value = value
  }

  set value(x: T) {
    let valueHasChanged = (this._value != x)
    // console.log(`*** SmartValueNotifier: set value: ${JSON.stringify(x)}; changed=${valueHasChanged}; _listeners=${this._listeners.length}`)
    this._value = x;
    if (valueHasChanged) {
      this._listeners.forEach((listener) => listener(this._value))
    }
  }

  get value(): T {
    return this._value
  }

  public addListener(listener: VoidCallback): void {
    this._listeners.push(listener);
    if (this.value != undefined) {
      listener(this.value);
    }
  }

  public removeListener(listener: VoidCallback): void {
    this._listeners = this._listeners.filter(l => l !== listener)
  }

}

export default class ServiceManager implements INetworkManagerDelegate, IUserManagerDelegate {
  static shared: ServiceManager = new ServiceManager()

  isAuthenticated: SmartValueNotifier<boolean> = new SmartValueNotifier<boolean>(false)
  isLoading: SmartValueNotifier<boolean> = new SmartValueNotifier<boolean>(false)
  error: SmartValueNotifier<NetworkException | undefined> = new SmartValueNotifier<NetworkException | undefined>(undefined)

  currentAuthenticatedUser: UserModel | undefined

  private networkManager!: NetworkManager;
  private userManager!: UserManager 

  private constructor() {
    this.networkManager = new NetworkManager(this)
    this.networkManager.delegate = this
    this.userManager = new UserManager(this)
    this.userManager.delegate = this
  }

  // MARK: - Public

  async refreshToken(): Promise<boolean>  {
    let user = this.userManager.currentUser
    if (user == undefined) {
      return false
    }
    const response = await this.networkManager.refreshToken();
    if (response != undefined) {
      // let data: JSONObject = this._validateResponse(response);
      // console.log(`*** ServiceManager:refreshToken:got response ${JSON.stringify(response)}`)
      let result = AuthenticationResponseModel.fromJson(response)
      // [ROB] update the current user with new tokens
      user.jwtToken = result.jwtToken;
      user.refreshToken = result.refreshToken;
      this.userManager.setCurrentUser(user);
      return true;
    }
    return false;
  }

  async register(user: UserModel) {
    // console.log(`*** ServiceManager:register:user=${JSON.stringify(user)}`)
    try {
      let response = await this.networkManager.register(user.email, user.password, user.password2, user.firstName, user.lastName)
      // let data: JSONObject = this._validateResponse(response)
      // console.log(`*** ServiceManager:register:got response ${JSON.stringify(response)}`)
      let result = UserModel.fromJson(response)
      result.password = user.password
      result.password2 = user.password2
      // console.log(`*** ServiceManager:register:result=${JSON.stringify(result)}`)
      this.userManager.setCurrentUser(result)
      // [ROB] if registration succeded, then login immediately.
      await this.login(user.email, user.password)
    } catch (e: any) {
      // console.log(`*** ServiceManager:register:got error ${JSON.stringify(e)}`)
      this.error.value = new NetworkException("Registration failed", e.details)
      throw this.error.value
    }
  }

  async login(email: string, password: string): Promise<void>  {
    try {
      // console.log(`*** ServiceManager:login: u=${email}; p=${password}`)
      let response = await this.networkManager.login(email, password)
      // console.log(`*** ServiceManager:login: got response ${JSON.stringify(response)}`)
      let result = AuthenticationResponseModel.fromJson(response)
      let user = this.userManager.getUser(email)
      // console.log(`*** ServiceManager:login: user=${JSON.stringify(user)}`)
      // [ROB] if login succeded, update the current user with new tokens.
      if (user != undefined) {
        user.jwtToken = result.jwtToken;
        user.refreshToken = result.refreshToken;
        this.userManager.setCurrentUser(user)  
      }
      // console.log(`*** ServiceManager:login: user=${JSON.stringify(user)}`);
    } catch (e: any) {
      this.error.value = new NetworkException("Login failed", e.details)
      throw this.error.value
    }
  }

  logout(): void {
      // [ROB] Not implemented server-side. Just "forget" the user...
      this.userManager.setCurrentUser(undefined)
  }

  async getTodoList(): Promise<TodoModel[]> {
    try {
      let response = await this.networkManager.getTodoList()
      // console.log(`*** ServiceManager:getTodoList:got response ${JSON.stringify(response)}`)
      let result = response.map((t) => TodoModel.fromJson(t)) 
      // console.log(`*** ServiceManager:getTodoList: result=${JSON.stringify(result)}`);
      return result
    } catch (e: any) {
      this.error.value = new NetworkException("Unable to get TODO list", e.details)
      throw this.error.value
    }
  }

  async save(todo: TodoModel) {
    try {
      await this.networkManager.save(todo.toJson())
      return
    } catch (e: any) {
      this.error.value = new NetworkException("Save failed", e.details)
      throw this.error.value
    }
  }

  async delete(todo: TodoModel) {
    try {
      await this.networkManager.delete(todo)
      // console.log(`*** ServiceManager:save:done`)
      return
    } catch (e: any) {
      this.error.value = new NetworkException("Delete failed", e.details)
      throw this.error.value
    }
  }

  // MARK: - INetworkManagerDelegate

  onPendingRequestCountChange(requestCount: number): void {
    // [ROB] reset isLoading only when there are no more pending requests.
    this.isLoading.value = requestCount > 0
  }

  getJwtToken(): string | undefined {
    return this.userManager.currentUser?.jwtToken
  }

  getRefreshToken(): string | undefined {
    return this.userManager.currentUser?.refreshToken
  }

  onTokenRefresh(response: JSONObject, error?: NetworkException): void {
    if (response == null || error != null) {
      // [ROB] failed to refresh token... bye, bye!
      this.logout()
      return
    }
    let result = AuthenticationResponseModel.fromJson(response)
    let user = this.userManager.currentUser
    if (user != undefined) {
      user.jwtToken = result.jwtToken;
      user.refreshToken = result.refreshToken;
      this.userManager.setCurrentUser(user)
    }
  }

  onTokenRevoke(error?: NetworkException): void {
    this.logout()
  }

  onError(error: NetworkException): void {
    // console.log(`*** ServiceManeger:onError: error=${JSON.stringify(error)}`)
    this.error.value = error
  }  

  // MARK: - IUserManagerDelegate

  onUserChanged(user?: UserModel): void {
    // console.log(`*** ServiceManeger:onUserChanged: user=${JSON.stringify(user)}`)
    this.currentAuthenticatedUser = user
    this.isAuthenticated.value = (user?.jwtToken != undefined)
  }

}

