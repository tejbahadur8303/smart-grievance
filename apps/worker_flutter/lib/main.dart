import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/api_service.dart';
import 'providers/worker_auth_provider.dart';
import 'providers/task_provider.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SmartWorkerApp());
}

class SmartWorkerApp extends StatelessWidget {
  final WorkerApiService? apiService;

  const SmartWorkerApp({super.key, this.apiService});

  @override
  Widget build(BuildContext context) {
    final api = apiService ?? WorkerApiService();

    return MultiProvider(
      providers: [
        Provider<WorkerApiService>.value(value: api),
        ChangeNotifierProvider(create: (_) => WorkerAuthProvider(api)),
        ChangeNotifierProvider(create: (_) => TaskProvider(api)),
      ],
      child: MaterialApp(
        title: 'Gramin Field Worker App',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF1E3A8A),
            primary: const Color(0xFF1E3A8A),
          ),
          useMaterial3: true,
          fontFamily: 'Roboto',
        ),
        home: const WorkerLoginScreen(),
      ),
    );
  }
}
