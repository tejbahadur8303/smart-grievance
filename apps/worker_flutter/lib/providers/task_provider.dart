import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TaskProvider with ChangeNotifier {
  final WorkerApiService _apiService;
  List<dynamic> _tasks = [];
  bool _isLoading = false;
  String? _error;

  TaskProvider(this._apiService);

  List<dynamic> get tasks => _tasks;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchTasks([String? status]) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _apiService.getTasks(status);
      if (res['success'] == true) {
        _tasks = res['data'] ?? [];
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

  Future<bool> acceptTask(String taskId) async {
    try {
      final res = await _apiService.acceptTask(taskId);
      if (res['success'] == true) {
        await fetchTasks();
        return true;
      }
    } catch (e) {
      _error = e.toString();
    }
    return false;
  }

  Future<bool> rejectTask(String taskId, String reason) async {
    try {
      final res = await _apiService.rejectTask(taskId, reason);
      if (res['success'] == true) {
        await fetchTasks();
        return true;
      }
    } catch (e) {
      _error = e.toString();
    }
    return false;
  }

  Future<bool> startWork(String taskId, List<String> beforePhotos) async {
    try {
      final res = await _apiService.startWork(taskId, beforePhotos);
      if (res['success'] == true) {
        await fetchTasks();
        return true;
      }
    } catch (e) {
      _error = e.toString();
    }
    return false;
  }

  Future<bool> completeTask({
    required String taskId,
    required List<String> afterPhotos,
    required String completionNotes,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final res = await _apiService.completeTask(
        taskId: taskId,
        afterPhotos: afterPhotos,
        completionNotes: completionNotes,
        latitude: latitude,
        longitude: longitude,
      );
      if (res['success'] == true) {
        await fetchTasks();
        return true;
      }
    } catch (e) {
      _error = e.toString();
    }
    return false;
  }
}
