import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class WorkerApiService {
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> _headers() {
    final headers = {'Content-Type': 'application/json'};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> login(String phone, String password) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> getTasks([String? status]) async {
    final query = status != null ? '?status=$status' : '';
    final url = Uri.parse('${ApiConfig.baseUrl}/tasks$query');
    final response = await http.get(url, headers: _headers());
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> acceptTask(String taskId) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/tasks/$taskId/accept');
    final response = await http.post(url, headers: _headers());
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> rejectTask(String taskId, String reason) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/tasks/$taskId/reject');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'reason': reason}),
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> startWork(String taskId, List<String> beforePhotos) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/tasks/$taskId/start');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'beforePhotos': beforePhotos}),
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> completeTask({
    required String taskId,
    required List<String> afterPhotos,
    required String completionNotes,
    double? latitude,
    double? longitude,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/tasks/$taskId/complete');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'afterPhotos': afterPhotos,
        'completionNotes': completionNotes,
        'latitude': latitude ?? 25.3512,
        'longitude': longitude ?? 82.9715,
      }),
    );
    return jsonDecode(response.body);
  }
}
