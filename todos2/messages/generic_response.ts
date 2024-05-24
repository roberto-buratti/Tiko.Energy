import BaseResponse from './base_response'

export default class GenericResponse<T> extends BaseResponse {
  status: number = 0;
  count: number = 0;
  data: T | undefined;
  error: string | undefined;
  message: string | undefined;

  static fromJson<T>(json: JSONObject): GenericResponse<T> {
    let response = new GenericResponse<T>(); 
    response.status = json['status'] ?? 0;
    response.count = json['count'] ?? 0;
    response.data = json['data'];
    response.error = json['error'];
    response.message = json['message'];
    return response;
  }

  toJson(): JSONObject {
    let json = super.toJson();
    json['status'] = this.status;
    json['count'] = this.count;
    json['data'] = this.data;
    json['error'] = this.error;
    json['message'] = this.message;
    return json;
  }
}
