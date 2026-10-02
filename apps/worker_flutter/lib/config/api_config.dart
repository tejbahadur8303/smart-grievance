import 'package:flutter/foundation.dart' show kIsWeb;
import 'platform_stub.dart' if (dart.library.io) 'platform_io.dart';

class ApiConfig {
  static const String androidEmulatorUrl = 'http://10.0.2.2:5002/api/v1';
  static const String localUrl = 'http://localhost:5002/api/v1';

  static String get defaultBaseUrl {
    if (kIsWeb) return localUrl;
    if (isAndroidPlatform) return androidEmulatorUrl;
    return localUrl;
  }

  static String _baseUrl = '';

  static String get baseUrl {
    if (_baseUrl.isNotEmpty) return _baseUrl;
    const definedUrl = String.fromEnvironment('API_BASE_URL');
    if (definedUrl.isNotEmpty) return definedUrl;
    return defaultBaseUrl;
  }

  static void setBaseUrl(String url) {
    _baseUrl = url;
  }
}
