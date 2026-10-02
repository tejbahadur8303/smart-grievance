import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/api_service.dart';
import 'providers/auth_provider.dart';
import 'providers/complaint_provider.dart';
import 'providers/language_provider.dart';
import 'theme/app_theme.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SmartCitizenApp());
}

class SmartCitizenApp extends StatelessWidget {
  final ApiService? apiService;

  const SmartCitizenApp({super.key, this.apiService});

  @override
  Widget build(BuildContext context) {
    final api = apiService ?? ApiService();

    return MultiProvider(
      providers: [
        Provider<ApiService>.value(value: api),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider(api)),
        ChangeNotifierProvider(create: (_) => ComplaintProvider(api)),
      ],
      child: MaterialApp(
        title: 'Smart Gramin Citizen Portal',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const LoginScreen(),
      ),
    );
  }
}

