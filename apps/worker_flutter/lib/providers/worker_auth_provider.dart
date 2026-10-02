import 'package:flutter/material.dart';
import '../services/api_service.dart';

class WorkerAuthProvider with ChangeNotifier {
  final WorkerApiService _apiService;
  Map<String, dynamic>? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;

  WorkerAuthProvider(this._apiService);

  bool get isAuthenticated => _token != null;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<bool> login(String phone, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _apiService.login(phone, password);
      if (res['success'] == true) {
        _token = res['data']['accessToken'];
        _user = res['data']['user'];
        _apiService.setToken(_token);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = res['message'] ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void logout() {
    _token = null;
    _user = null;
    _apiService.setToken(null);
    notifyListeners();
  }
}
