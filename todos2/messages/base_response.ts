export default abstract class BaseResponse {
  
  static fromJson(json: JSONObject) {

  }

  toJson(): JSONObject {
    var json: JSONObject = JSON.parse("{}");
    return json;
  }

}
