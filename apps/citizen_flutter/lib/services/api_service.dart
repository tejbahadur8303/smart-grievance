import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
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

  // 1. Auth
  Future<Map<String, dynamic>> login(String phone, String password) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String phone,
    required String password,
    String? villageName,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/auth/register');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'phone': phone,
        'password': password,
        'languagePreference': 'hi',
      }),
    );
    return jsonDecode(response.body);
  }

  // 2. Voice & STT
  Future<Map<String, dynamic>> transcribeSimulatedAudio(String language) async {
    return {
      'success': true,
      'transcript': 'School ke samne wali sadak par bada gaddha hai aur pani bhara hua hai.',
      'confidence': 0.92,
      'language': language
    };
  }

  // 3. AI Analysis
  Future<Map<String, dynamic>> analyzeComplaint(String text) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/ai/analyze-complaint');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'text': text}),
    );
    return jsonDecode(response.body);
  }

  // 4. Complaints
  Future<Map<String, dynamic>> createComplaint({
    required String title,
    required String description,
    required String category,
    String source = 'TEXT',
    String? transcript,
    String? villageName,
    String? landmark,
    double? latitude,
    double? longitude,
    List<String>? images,
    bool publicSafetyRisk = false,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/complaints');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'title': title,
        'description': description,
        'category': category,
        'source': source,
        'transcript': transcript,
        'villageName': villageName ?? 'Shivpur Khas',
        'landmark': landmark,
        'latitude': latitude,
        'longitude': longitude,
        'images': images ?? [],
        'publicSafetyRisk': publicSafetyRisk,
      }),
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> getMyComplaints() async {
    final url = Uri.parse('${ApiConfig.baseUrl}/complaints');
    final response = await http.get(url, headers: _headers());
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> getComplaintTimeline(String complaintId) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/complaints/$complaintId/timeline');
    final response = await http.get(url, headers: _headers());
    return jsonDecode(response.body);
  }

  // 5. Citizen Resolution Verification (Yes -> CLOSED, No -> REOPENED)
  Future<Map<String, dynamic>> verifyResolution({
    required String complaintId,
    required bool isResolved,
    int? rating,
    String? feedback,
    String? reopenReason,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/complaints/$complaintId/verify-resolution');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'isResolved': isResolved,
        'rating': rating,
        'feedback': feedback,
        'reopenReason': reopenReason,
      }),
    );
    return jsonDecode(response.body);
  }

  // 6. AI Assistant Chat
  Future<Map<String, dynamic>> askAssistant(String message) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/ai/chat');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'message': message}),
    );
    return jsonDecode(response.body);
  }

  // 7. Welfare Schemes
  Future<Map<String, dynamic>> getWelfareSchemes() async {
    final url = Uri.parse('${ApiConfig.baseUrl}/welfare/schemes');
    final response = await http.get(url, headers: _headers());
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> applyWelfareScheme({
    required String schemeId,
    double? annualIncome,
    String? category,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/welfare/apply');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'schemeId': schemeId,
        'annualIncome': annualIncome,
        'category': category ?? 'General',
      }),
    );
    return jsonDecode(response.body);
  }

  // 8. Ration Transparency
  Future<Map<String, dynamic>> getMyRationDistributions() async {
    final url = Uri.parse('${ApiConfig.baseUrl}/ration/my-distributions');
    final response = await http.get(url, headers: _headers());
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> getRationShops() async {
    final url = Uri.parse('${ApiConfig.baseUrl}/ration/shops');
    final response = await http.get(url, headers: _headers());
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> reportRationGrievance({
    required String shopId,
    required String grievanceType,
    required String description,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/ration/report-grievance');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'shopId': shopId,
        'grievanceType': grievanceType,
        'description': description,
      }),
    );
    return jsonDecode(response.body);
  }

  // 9. Nearby Emergency & Public Services
  Future<Map<String, dynamic>> getNearbyServices() async {
    final url = Uri.parse('${ApiConfig.baseUrl}/villages/nearby-services');
    final response = await http.get(url, headers: _headers());
    return jsonDecode(response.body);
  }
}
