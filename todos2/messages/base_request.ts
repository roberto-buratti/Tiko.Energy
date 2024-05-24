type JSONObject = { [key: string]: any };

abstract class BaseRequest {
  static fromJson(json: JSONObject) {

  }

  toJson(): JSONObject {
    var json: JSONObject = JSON.parse("{}");
    return json;
  }
}
