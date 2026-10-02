import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ComplaintProvider with ChangeNotifier {
  final ApiService _apiService;
  List<dynamic> _complaints = [];
  bool _isLoading = false;
  String? _error;

  ComplaintProvider(this._apiService);

  List<dynamic> get complaints => _complaints;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchComplaints() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _apiService.getMyComplaints();
      if (res['success'] == true) {
        _complaints = res['data'] ?? [];
      } else {
        _error = res['message'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> analyzeText(String text) async {
    try {
      final res = await _apiService.analyzeComplaint(text);
      if (res['success'] == true) {
        return res['data'];
      }
    } catch (e) {
      debugPrint('AI Analysis Error: $e');
    }
    return null;
  }

  Future<bool> submitComplaint({
    required String title,
    required String description,
    required String category,
    String source = 'TEXT',
    String? transcript,
    String? landmark,
    double? latitude,
    double? longitude,
    List<String>? images,
    bool publicSafetyRisk = false,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _apiService.createComplaint(
        title: title,
        description: description,
        category: category,
        source: source,
        transcript: transcript,
        landmark: landmark,
        latitude: latitude,
        longitude: longitude,
        images: images,
        publicSafetyRisk: publicSafetyRisk,
      );

      _isLoading = false;
      if (res['success'] == true) {
        await fetchComplaints();
        return true;
      }
      return false;
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyResolution({
    required String complaintId,
    required bool isResolved,
    int? rating,
    String? feedback,
    String? reopenReason,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _apiService.verifyResolution(
        complaintId: complaintId,
        isResolved: isResolved,
        rating: rating,
        feedback: feedback,
        reopenReason: reopenReason,
      );

      _isLoading = false;
      if (res['success'] == true) {
        await fetchComplaints();
        return true;
      }
      return false;
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
