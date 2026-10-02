import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../providers/language_provider.dart';

class RationTransparencyScreen extends StatefulWidget {
  const RationTransparencyScreen({super.key});

  @override
  State<RationTransparencyScreen> createState() => _RationTransparencyScreenState();
}

class _RationTransparencyScreenState extends State<RationTransparencyScreen> {
  List<dynamic> _distributions = [];
  List<dynamic> _shops = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRationData();
  }

  void _fetchRationData() async {
    final api = Provider.of<ApiService>(context, listen: false);
    final distRes = await api.getMyRationDistributions();
    final shopRes = await api.getRationShops();

    if (mounted) {
      setState(() {
        if (distRes['success'] == true) _distributions = distRes['data'] ?? [];
        if (shopRes['success'] == true) _shops = shopRes['data'] ?? [];
        _isLoading = false;
      });
    }
  }

  void _showReportGrievanceDialog() {
    final api = Provider.of<ApiService>(context, listen: false);
    String selectedType = 'SHORT_QUANTITY';
    final descController = TextEditingController();
    String? shopId = _shops.isNotEmpty ? _shops[0]['_id'] : null;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('राशन दुकान संबंधी शिकायत दर्ज करें', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                initialValue: selectedType,
                items: const [
                  DropdownMenuItem(value: 'SHORT_QUANTITY', child: Text('कम राशन देना (Short Quantity)')),
                  DropdownMenuItem(value: 'SHOP_CLOSED', child: Text('दुकान बंद रहना (Shop Closed)')),
                  DropdownMenuItem(value: 'OVERCHARGING', child: Text('अधिक मूल्य लेना (Overcharging)')),
                  DropdownMenuItem(value: 'BIOMETRIC_ISSUE', child: Text('अंगूठा न लगना (Biometric)')),
                  DropdownMenuItem(value: 'RATION_NOT_GIVEN', child: Text('राशन देने से मना करना')),
                ],
                onChanged: (val) {
                  if (val != null) setDialogState(() => selectedType = val);
                },
                decoration: const InputDecoration(labelText: 'समस्या का प्रकार', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'विवरण लिखें...',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करें')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD97706), foregroundColor: Colors.white),
              onPressed: () async {
                if (shopId != null && descController.text.trim().isNotEmpty) {
                  final messenger = ScaffoldMessenger.of(context);
                  Navigator.pop(ctx);
                  final res = await api.reportRationGrievance(
                    shopId: shopId,
                    grievanceType: selectedType,
                    description: descController.text.trim(),
                  );
                  if (mounted) {
                    messenger.showSnackBar(
                      SnackBar(
                        content: Text(res['success'] == true ? 'राशन शिकायत दर्ज हुई!' : 'त्रुटि हुई।'),
                        backgroundColor: const Color(0xFF059669),
                      ),
                    );
                  }
                }
              },
              child: const Text('शिकायत भेजें'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F5),
      appBar: AppBar(
        title: Text(lang.translate('ration_transparency')),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0.5,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE66518)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Masked Ration Card Header
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFD97706), Color(0xFFB45309)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFD97706).withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'राष्ट्रीय खाद्य सुरक्षा मिशन (NFSA)',
                          style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'राशन कार्ड नंबर: UP-AAY-****-5829',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                        ),
                        SizedBox(height: 6),
                        Text('परिवार सदस्य: 4 व्यक्ति | योजना: अंत्योदय अन्न योजना',
                            style: TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'मासिक राशन वितरण रिकॉर्ड',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                      ),
                      TextButton.icon(
                        onPressed: _showReportGrievanceDialog,
                        icon: const Icon(Icons.report_problem, size: 16, color: Color(0xFFD97706)),
                        label: const Text('शिकायत करें', style: TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _distributions.length,
                    itemBuilder: (context, idx) {
                      final d = _distributions[idx];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  d['commodity'] ?? '',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1E293B)),
                                ),
                                const SizedBox(height: 4),
                                Text('माह: ${d['monthYear']}', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '${d['distributedQuantityKg']} / ${d['entitledQuantityKg']} kg',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF059669)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  d['status'] ?? 'DISTRIBUTED',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
    );
  }
}
