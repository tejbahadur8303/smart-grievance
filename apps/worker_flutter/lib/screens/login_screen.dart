import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/worker_auth_provider.dart';
import 'tasks_screen.dart';

class WorkerLoginScreen extends StatefulWidget {
  const WorkerLoginScreen({super.key});

  @override
  State<WorkerLoginScreen> createState() => _WorkerLoginScreenState();
}

class _WorkerLoginScreenState extends State<WorkerLoginScreen> {
  final _phoneController = TextEditingController(text: '9876543202');
  final _passwordController = TextEditingController(text: 'Village@123');

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() async {
    final auth = Provider.of<WorkerAuthProvider>(context, listen: false);
    final success = await auth.login(
      _phoneController.text.trim(),
      _passwordController.text.trim(),
    );

    if (success && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const TasksScreen()),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Worker login failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<WorkerAuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: Image.asset(
                    'assets/images/app_logo.png',
                    width: 84,
                    height: 84,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 76,
                      height: 76,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E3A8A),
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: const Icon(Icons.engineering, color: Colors.white, size: 40),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Field Worker App',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Gram Panchayat Ground Operations & Proof of Work',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 32),

                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    children: [
                      TextField(
                        controller: _phoneController,
                        decoration: InputDecoration(
                          labelText: 'Mobile Number',
                          prefixIcon: const Icon(Icons.phone),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                      const SizedBox(height: 24),

                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: auth.isLoading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E3A8A),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: auth.isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : const Text('Login to Field Tasks', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                const Text(
                  'Demo: 9876543202 / Village@123',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
