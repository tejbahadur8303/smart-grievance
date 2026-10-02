import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/complaint_provider.dart';
import '../providers/language_provider.dart';

class TextComplaintScreen extends StatefulWidget {
  const TextComplaintScreen({super.key});

  @override
  State<TextComplaintScreen> createState() => _TextComplaintScreenState();
}

class _TextComplaintScreenState extends State<TextComplaintScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _landmarkController = TextEditingController();

  String _selectedCategory = 'Roads & Potholes';
  bool _publicSafetyRisk = false;
  bool _isSubmitting = false;

  final List<String> _categories = [
    'Roads & Potholes',
    'Streetlights & Electrical',
    'Water Supply & Leakage',
    'Drainage & Sewage',
    'Garbage & Sanitation',
    'Public Toilets',
    'Health Centre / Dispensary',
    'School & Anganwadi Infrastructure',
    'PDS / Ration Supply',
    'Welfare Schemes & Pensions',
    'Agriculture & Irrigation',
    'Livestock & Animal Welfare',
    'Other'
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (_titleController.text.trim().isEmpty || _descController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill title and description')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final complaintProvider = Provider.of<ComplaintProvider>(context, listen: false);
    final success = await complaintProvider.submitComplaint(
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      category: _selectedCategory,
      landmark: _landmarkController.text.trim(),
      latitude: 25.3512,
      longitude: 82.9715,
      publicSafetyRisk: _publicSafetyRisk,
    );

    setState(() {
      _isSubmitting = false;
    });

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Grievance logged successfully!'),
          backgroundColor: Color(0xFF059669),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F5),
      appBar: AppBar(
        title: Text(lang.translate('report_problem')),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lang.isHindi ? 'समस्या का शीर्षक' : 'Complaint Title',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      hintText: lang.isHindi ? 'उदा. नलकूप खराब है' : 'e.g. Broken Handpump',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    lang.isHindi ? 'समस्या की श्रेणी (Category)' : 'Category',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedCategory,
                    items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    lang.isHindi ? 'विस्तार से बताएं (Description)' : 'Detailed Description',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _descController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: lang.isHindi ? 'समस्या का पूरा विवरण लिखें...' : 'Describe the problem in detail...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    lang.isHindi ? 'स्थान / लैंडमार्क (Landmark)' : 'Landmark & Location',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _landmarkController,
                    decoration: InputDecoration(
                      hintText: lang.isHindi ? 'उदा. पंचायत भवन के सामने' : 'e.g. Opposite Shiv Mandir',
                      prefixIcon: const Icon(Icons.pin_drop, color: Color(0xFFE66518)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Public Safety Checkbox
                  CheckboxListTile(
                    title: Text(
                      lang.isHindi ? 'क्या यह जानलेवा खतरा है? (Public Safety Risk)' : 'Is this an immediate danger to life?',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      lang.isHindi ? 'खुला मैनहोल, टूटा बिजली का तार आदि' : 'Open manholes, fallen live electrical wires, etc.',
                      style: const TextStyle(fontSize: 11),
                    ),
                    value: _publicSafetyRisk,
                    onChanged: (val) => setState(() => _publicSafetyRisk = val ?? false),
                    activeColor: Colors.red,
                    contentPadding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        lang.translate('submit'),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
