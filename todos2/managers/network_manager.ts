import Config from 'react-native-config'

//import GenericResponse from '../messages/generic_response.ts'
import AuthenticationResponseModel from '../models/authentication_response_model.ts'

export class NetworkException {
  message: string
  details: any

  constructor(message: string, details?: any) {
    this.message = message
    this.details = details
  }
}

export interface INetworkManagerDelegate {
  // [ROB] called every time a network request starts/end.
  onPendingRequestCountChange(requestCount: number): void
  // [ROB] called to get the access token of the logged user.
  getJwtToken(): string | undefined
  // [ROB] called to get the refresh token of the logged user.
  getRefreshToken(): string | undefined
  // [ROB] called when the access token has been refreshd (or failed to being refreshed).
  onTokenRefresh(response?: JSONObject, error?: NetworkException): void
  // [ROB] called when the access token has been revoked (or failed to being revoked).
  onTokenRevoke(error?: NetworkException): void
  // [ROB] called any time a network error occurred (including not-200 responses).
  onError(error?: NetworkException): void
}

enum APIMethod {
  POST = 'POST',
  PUT = 'PUT',
  GET = 'GET',
  DELETE = 'DELETE',
}

const {
  API_BASE_URL
} = Config;

export default class NetworkManager {  
  pendingRequestCount: number = 0;
  delegate: INetworkManagerDelegate;

  constructor(delegate: INetworkManagerDelegate) {
    this.delegate = delegate;
  }

  async register(email: string, password: string, password2: string, firstName: string, lastName: string)
  : Promise<JSONObject> {
    let json = await this.fetch<JSONObject>({
      path: "/register/",
      method: APIMethod.POST,
      data: { 
        "email": email, 
        "password": password, 
        "password2": password2, 
        "first_name": firstName,
        "last_name": lastName
      },
      queryParameters: undefined,
      retryOnError: false,
    });
   //let response = GenericResponse.fromJson<JSONObject>(json);
   return json;
  }

  async login(email: string, password: string)
  : Promise<JSONObject> {
   let json = await this.fetch<JSONObject>({
     path: "/login/",
     method: APIMethod.POST,
     data: { "email": email, "password": password },
     queryParameters: undefined,
     retryOnError: false,
   });
  //let response = GenericResponse.fromJson<JSONObject>(json);
  return json;
}

  async getTodoList()
  : Promise<JSONObject[]> {
    let json = await this.fetch<JSONObject[]>({
      path: "/todos/",
      method: APIMethod.GET,
      data: undefined,
      queryParameters: undefined,
      retryOnError: true,
    });
    return json
  }

  async save(todo: JSONObject)
  : Promise<void> {
    let path = "/todos/" + (todo["id"] ?? "")
    let method = todo["id"] == undefined ? APIMethod.POST : APIMethod.PUT
    await this.fetch<any>({
      path: path,
      method: method,
      data: todo,
      queryParameters: undefined,
      retryOnError: true,
    });
  }

  async delete(todo: JSONObject)
  : Promise<void> {
    if (todo["id"] == undefined) {
      return
    }
    let path = "/todos/" + todo["id"]
    await this.fetch<any>({
      path: path,
      method: APIMethod.DELETE,
      data: undefined,
      queryParameters: undefined,
      retryOnError: true,
    });
  }

  async refreshToken(): Promise<JSONObject | undefined> {
    let refreshToken = this.delegate?.getRefreshToken()
    if (refreshToken == undefined) {
      return Promise.resolve(undefined);
    }
    try {
      let json = await this.fetch<JSONObject>({
          path: "/token/refresh/",
          method: APIMethod.POST,
          data: { "refresh": refreshToken },
          queryParameters: undefined,
          retryOnError: false
      });
      // console.log(`*** NetworkManager:refreshToken: response=${JSON.stringify(json)}`);
      //let response: GenericResponse<AuthenticationResponseModel> = GenericResponse.fromJson<JSONObject>(json) as GenericResponse<AuthenticationResponseModel>
      this.delegate?.onTokenRefresh(json, undefined);
      return json
    } catch (e: any) {
      // console.log(`*** NetworkManager:refreshToken: got error ${e.message}`)
      this.delegate?.onTokenRefresh(undefined, new NetworkException(`${e}`))
      return undefined;
    }
  }

  async revokeToken(): Promise<boolean> {
    try {
      if (this.delegate?.getJwtToken() == undefined) {
        return false;
      }
      let refreshToken = this.delegate?.getRefreshToken();
      if (refreshToken == undefined) {
        return false;
      }
      // let json = await this.fetch({
      //   path: "/private/user/token/revoke",
      //   method: APIMethod.POST,
      //   data: { "refreshToken": refreshToken },
      //   queryParameters: undefined,
      //   retryOnError: false,
      // });
      // console.log(`*** NetworkManager:revokeToken: response=$json`);
      this.delegate?.onTokenRevoke(undefined);
      return true;
    } catch (e) {
      // console.log(`*** NetworkManager:revokeToken: got error ${e}`);
      this.delegate?.onTokenRevoke(new NetworkException(`${e}`));
      return false;
    }
  }

  private _composeCommonHeaders():  {[key: string]: string} {
    var headers: {[key: string]: string} = {};

    headers["Accept"] = "application/json";

    let jwtToken = this.delegate?.getJwtToken();
    if (jwtToken != undefined) {
      headers["Authorization"] = `Bearer ${jwtToken}`;
    }

    return headers;
  }

  private async fetch<T>(params: {
    path: string,
    method: APIMethod,
    data: any,
    queryParameters: JSONObject | undefined,
    retryOnError: boolean
  }): Promise<T>  {

    const {
      path,
      method,
      data,
      queryParameters,
      retryOnError,
    } = params
    
    console.log(
      `*** NetworkManager:fetch: fetching ${method} ${path} queryParameters=${JSON.stringify(queryParameters)} data=${JSON.stringify(data)}`);
    try {
      // [ROB] notify pendingRequestCount
      this.delegate?.onPendingRequestCountChange(++this.pendingRequestCount)
      let urlString = API_BASE_URL + path
      const headers = this._composeCommonHeaders()
      let body: string | undefined

      // [ROB] should data be put in the body or encoded in the url?
      if ([APIMethod.POST, APIMethod.PUT].includes(method)) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(data)
      } else if ([APIMethod.GET, APIMethod.DELETE].includes(method) && queryParameters) {
        Object.entries(queryParameters)
          .forEach(
            ([key, value], i) =>
              urlString = `${urlString}${i > 0 ? '&' : '?'}${key}=${encodeURIComponent(value as string)}`)
      }

      let request = new Request(urlString, { method, headers, body })
      // console.log(
      //   `*** NetworkManager:fetch: request=${JSON.stringify(request)}`);
      let response = await fetch(request);
      if (response.status == 401) {      
        // [ROB] got 401, try to refresh the jwt token and redo the call.
        // console.log("*** NetworkManager:fetch: unauthorized");
        if (retryOnError) {
          let tokenResponse = await this.refreshToken();
          if (tokenResponse != undefined) {
            // console.log("*** NetworkManager:fetch: retrying...");
            return this.fetch({
                path, method, data, queryParameters, retryOnError: false
            });
          }
        } else {
          // console.log("*** NetworkManager:fetch: revoking token...");
          // [ROB] If fails again, the signout.
          await this.revokeToken();
        }
      }

      let result: any
      result = await response.text()
      try {
        result = JSON.parse(result)
      } catch (error) {
        // [ROB] noop: just `result` is NOT json
      }
      if (response.ok) {
        return result
      } else {
        // console.log(`*** NetworkManager:fetch: Invalid status code ${response.status}; details=${JSON.stringify(result)}`);
        throw new NetworkException(`Invalid status code: ${response.status}`, result["details"] ?? result)
      }
    } catch (error: any) {
      // console.log(
      //   `*** NetworkManager:fetch: got error for ${method} ${path} => ${JSON.stringify(error)}`);
      this.delegate?.onError((error instanceof NetworkException) ? error : new NetworkException(error.message));
      throw error;
    } finally {
      // [ROB] notify pendingRequestCount
      this.delegate?.onPendingRequestCountChange(--this.pendingRequestCount);
    }
  }

}