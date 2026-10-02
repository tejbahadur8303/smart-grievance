import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/complaint_provider.dart';
import '../providers/language_provider.dart';
import '../services/api_service.dart';

class ComplaintDetailScreen extends StatefulWidget {
  final String complaintId;

  const ComplaintDetailScreen({super.key, required this.complaintId});

  @override
  State<ComplaintDetailScreen> createState() => _ComplaintDetailScreenState();
}

class _ComplaintDetailScreenState extends State<ComplaintDetailScreen> {
  Map<String, dynamic>? _timelineData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  void _fetchDetail() async {
    setState(() => _isLoading = true);
    final api = Provider.of<ApiService>(context, listen: false);
    final res = await api.getComplaintTimeline(widget.complaintId);
    if (res['success'] == true) {
      setState(() {
        _timelineData = res['data'];
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  void _showVerificationDialog(bool isResolved) {
    final complaintProvider = Provider.of<ComplaintProvider>(context, listen: false);
    final reasonController = TextEditingController();
    int rating = 5;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(
            isResolved ? 'सत्यापन व रेटिंग (Resolution Rating)' : 'समस्या पुनः खोलें (Reopen Complaint)',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isResolved) ...[
                const Text('कृपया कार्य की गुणवत्ता को रेटिंग दें:'),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (idx) {
                    return IconButton(
                      icon: Icon(
                        idx < rating ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 32,
                      ),
                      onPressed: () {
                        setDialogState(() => rating = idx + 1);
                      },
                    );
                  }),
                ),
                TextField(
                  controller: reasonController,
                  decoration: const InputDecoration(
                    hintText: 'प्रशंसा या टिप्पणी लिखें (वैकल्पिक)...',
                    border: OutlineInputBorder(),
                  ),
                ),
              ] else ...[
                const Text('कृपया बताएं कि समस्या का समाधान क्यों नहीं हुआ:'),
                const SizedBox(height: 8),
                TextField(
                  controller: reasonController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: 'जैसे: बिजली का बल्ब अभी भी नहीं जल रहा है...',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('रद्द करें'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isResolved ? const Color(0xFF059669) : Colors.red,
                foregroundColor: Colors.white,
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                await complaintProvider.verifyResolution(
                  complaintId: widget.complaintId,
                  isResolved: isResolved,
                  rating: isResolved ? rating : null,
                  feedback: isResolved ? reasonController.text.trim() : null,
                  reopenReason: !isResolved ? reasonController.text.trim() : null,
                );
                _fetchDetail();
              },
              child: Text(isResolved ? 'सत्यापित करें (Close)' : 'पुनः खोलें (Reopen)'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Color(0xFFE66518))),
      );
    }

    final complaint = _timelineData?['complaint'];
    final updates = _timelineData?['updates'] as List<dynamic>? ?? [];
    final status = complaint?['status'] ?? 'SUBMITTED';

    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F5),
      appBar: AppBar(
        title: Text(widget.complaintId),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Prominent Citizen Verification Prompt if RESOLVED
            if (status == 'RESOLVED') ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFF59E0B)),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.help_outline, color: Color(0xFFB45309), size: 36),
                    const SizedBox(height: 8),
                    Text(
                      lang.translate('verify_prompt'),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: Color(0xFF92400E),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'कर्मचारी द्वारा कार्य पूरा चिन्हित किया गया है। पुष्टि करें:',
                      style: TextStyle(fontSize: 12, color: Color(0xFF78350F)),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _showVerificationDialog(true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                            ),
                            icon: const Icon(Icons.check_circle, size: 18),
                            label: Text(lang.translate('yes_resolved'), style: const TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _showVerificationDialog(false),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFDC2626),
                              foregroundColor: Colors.white,
                            ),
                            icon: const Icon(Icons.cancel, size: 18),
                            label: Text(lang.translate('no_reopen'), style: const TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Complaint Details Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE66518).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          complaint?['category'] ?? '',
                          style: const TextStyle(color: Color(0xFFE66518), fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                      Text(
                        status,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    complaint?['title'] ?? '',
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    complaint?['description'] ?? '',
                    style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.4),
                  ),
                  if (complaint?['landmark'] != null && (complaint?['landmark'] as String).isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.pin_drop, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(complaint?['landmark'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),
            const Text(
              'प्रगति समयरेखा (Status Timeline)',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
            ),
            const SizedBox(height: 12),

            // Timeline List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: updates.length,
              itemBuilder: (context, idx) {
                final u = updates[idx];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          decoration: const BoxDecoration(
                            color: Color(0xFFE66518),
                            shape: BoxShape.circle,
                          ),
                        ),
                        if (idx < updates.length - 1)
                          Container(width: 2, height: 44, color: Colors.orange.shade200),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              u['message'] ?? '',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            if (u['notes'] != null && (u['notes'] as String).isNotEmpty)
                              Text(u['notes'], style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                            const SizedBox(height: 2),
                            Text(
                              'द्वारा: ${u['changedByName']} (${u['changedByRole']})',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
