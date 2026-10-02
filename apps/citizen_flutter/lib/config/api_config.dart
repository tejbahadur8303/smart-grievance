import 'package:flutter/foundation.dart' show kIsWeb;
import 'platform_stub.dart' if (dart.library.io) 'platform_io.dart';

class ApiConfig {
  // Option 1: Localhost (Web, macOS, iOS Simulator, and Physical Android via 'adb reverse tcp:5002 tcp:5002')
  static const String localUrl = 'http://localhost:5002/api/v1';

  // Option 2: Android Emulator loopback
  static const String androidEmulatorUrl = 'http://10.0.2.2:5002/api/v1';

  // Option 3: Mac Local Wi-Fi IP (for physical phones on the same Wi-Fi network)
  static const String lanUrl = 'http://192.168.1.11:5002/api/v1';

  static String get defaultBaseUrl {
    if (kIsWeb) return localUrl;
    if (isAndroidPlatform) {
      // Defaults to localhost (seamless with 'adb reverse tcp:5002 tcp:5002' on physical phone & emulator)
      return localUrl;
    }
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
