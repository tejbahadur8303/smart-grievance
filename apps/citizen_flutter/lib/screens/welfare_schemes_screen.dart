import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../providers/language_provider.dart';

class WelfareSchemesScreen extends StatefulWidget {
  const WelfareSchemesScreen({super.key});

  @override
  State<WelfareSchemesScreen> createState() => _WelfareSchemesScreenState();
}

class _WelfareSchemesScreenState extends State<WelfareSchemesScreen> {
  List<dynamic> _schemes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSchemes();
  }

  void _fetchSchemes() async {
    final api = Provider.of<ApiService>(context, listen: false);
    final res = await api.getWelfareSchemes();
    if (res['success'] == true) {
      setState(() {
        _schemes = res['data'] ?? [];
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  void _apply(dynamic scheme) async {
    final api = Provider.of<ApiService>(context, listen: false);
    final res = await api.applyWelfareScheme(schemeId: scheme['_id']);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['success'] == true
              ? 'योजना के लिए आवेदन सफलतापूर्वक जमा हुआ!'
              : 'आवेदन विफल रहा।'),
          backgroundColor: res['success'] == true ? const Color(0xFF059669) : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F5),
      appBar: AppBar(
        title: Text(lang.translate('welfare_schemes')),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0.5,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE66518)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _schemes.length,
              itemBuilder: (context, idx) {
                final s = _schemes[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 6,
                        offset: const Offset(0, 3),
                      )
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              s['code'] ?? '',
                              style: const TextStyle(
                                color: Color(0xFF7C3AED),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                          const Spacer(),
                          const Text('पात्र (Active)', style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        s['name'] ?? '',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                      ),
                      if (s['hindiName'] != null) ...[
                        const SizedBox(height: 2),
                        Text(s['hindiName'], style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                      ],
                      const SizedBox(height: 8),
                      Text(s['description'] ?? '', style: const TextStyle(fontSize: 13, color: Color(0xFF475569))),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'लाभ: ${s['benefits'] ?? ''}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _apply(s),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF7C3AED),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('योजना के लिए आवेदन करें (Apply Now)', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
