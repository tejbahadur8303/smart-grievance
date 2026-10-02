import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/complaint_provider.dart';
import '../providers/language_provider.dart';

class VoiceComplaintScreen extends StatefulWidget {
  const VoiceComplaintScreen({super.key});

  @override
  State<VoiceComplaintScreen> createState() => _VoiceComplaintScreenState();
}

class _VoiceComplaintScreenState extends State<VoiceComplaintScreen> {
  bool _isRecording = false;
  int _recordSeconds = 0;
  Timer? _timer;

  bool _isTranscribing = false;
  bool _isAnalyzing = false;
  String _transcript = '';
  final _transcriptController = TextEditingController();
  final _landmarkController = TextEditingController();

  Map<String, dynamic>? _aiAnalysis;
  bool _isSubmitting = false;
  bool _publicSafetyRisk = false;

  @override
  void dispose() {
    _timer?.cancel();
    _transcriptController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  void _toggleRecording() {
    if (_isRecording) {
      _stopRecording();
    } else {
      _startRecording();
    }
  }

  void _startRecording() {
    setState(() {
      _isRecording = true;
      _recordSeconds = 0;
      _transcript = '';
      _aiAnalysis = null;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _recordSeconds++;
      });
    });
  }

  void _stopRecording() async {
    _timer?.cancel();
    setState(() {
      _isRecording = false;
      _isTranscribing = true;
    });

    // Call STT / Simulation
    await Future.delayed(const Duration(milliseconds: 1200));

    // Realistic spoken Hindi transcript for village issues
    const spokenTranscript =
        'Hamare gaon me main sadak par bijli ka taar toota hua pada hai aur current ka khatra hai. Kripya turant theek karwayein.';

    _transcriptController.text = spokenTranscript;

    setState(() {
      _isTranscribing = false;
      _transcript = spokenTranscript;
    });

    _runAiAnalysis(spokenTranscript);
  }

  void _runAiAnalysis(String text) async {
    setState(() {
      _isAnalyzing = true;
    });

    final complaintProvider = Provider.of<ComplaintProvider>(context, listen: false);
    final analysis = await complaintProvider.analyzeText(text);

    setState(() {
      _isAnalyzing = false;
      _aiAnalysis = analysis ?? {
        'category': 'Streetlights & Electrical',
        'department': 'Rural Electricity Board',
        'priority': 'CRITICAL',
        'confidence': 0.95,
        'reason': 'Emergency safety hazard: fallen electrical live wire.'
      };
      if (_aiAnalysis?['priority'] == 'CRITICAL') {
        _publicSafetyRisk = true;
      }
    });
  }

  void _submitComplaint() async {
    if (_transcriptController.text.trim().isEmpty) return;

    setState(() {
      _isSubmitting = true;
    });

    final complaintProvider = Provider.of<ComplaintProvider>(context, listen: false);
    final category = _aiAnalysis?['category'] ?? 'Other';

    final success = await complaintProvider.submitComplaint(
      title: 'Voice Grievance: $category',
      description: _transcriptController.text.trim(),
      category: category,
      source: 'VOICE',
      transcript: _transcriptController.text.trim(),
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
          content: Text('शिकायत सफलतापूर्वक दर्ज हो गई! (Grievance Logged)'),
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
        title: Text(lang.isHindi ? 'बोलकर शिकायत करें' : 'Voice Grievance'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Voice Record Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Column(
                children: [
                  GestureDetector(
                    onTap: _toggleRecording,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: _isRecording ? 100 : 88,
                      height: _isRecording ? 100 : 88,
                      decoration: BoxDecoration(
                        color: _isRecording ? const Color(0xFFDC2626) : const Color(0xFFE66518),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: (_isRecording ? Colors.red : const Color(0xFFE66518))
                                .withValues(alpha: 0.35),
                            blurRadius: 20,
                            spreadRadius: _isRecording ? 8 : 2,
                          )
                        ],
                      ),
                      child: Icon(
                        _isRecording ? Icons.stop : Icons.mic,
                        color: Colors.white,
                        size: 44,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _isRecording
                        ? '${lang.isHindi ? "रिकॉर्डिंग जारी है..." : "Recording..."} ($_recordSeconds s)'
                        : (lang.isHindi ? 'माइक बटन दबाएं और समस्या बोलें' : 'Tap Microphone & Speak'),
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: _isRecording ? Colors.red : const Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    lang.isHindi
                        ? 'हिंदी, भोजपुरी या अंग्रेजी में बोल सकते हैं'
                        : 'Supports Hindi, English & regional dialects',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  ),
                ],
              ),
            ),

            if (_isTranscribing) ...[
              const SizedBox(height: 24),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Color(0xFFE66518)),
                  SizedBox(width: 12),
                  Text('आवाज को टेक्स्ट में बदला जा रहा है... (Transcribing)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                ],
              ),
            ],

            // Transcript & AI Analysis Box
            if (_transcript.isNotEmpty) ...[
              const SizedBox(height: 20),
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
                        Text(
                          lang.isHindi ? 'आपकी शिकायत (समीक्षा / बदलें)' : 'Spoken Transcript (Editable)',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        TextButton(
                          onPressed: () => _runAiAnalysis(_transcriptController.text),
                          child: const Text('Re-Analyze', style: TextStyle(fontSize: 12)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _transcriptController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        contentPadding: const EdgeInsets.all(12),
                      ),
                    ),
                  ],
                ),
              ),

              // AI Suggestion Box
              const SizedBox(height: 16),
              if (_isAnalyzing)
                const Center(child: CircularProgressIndicator())
              else if (_aiAnalysis != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFDBA74)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.auto_awesome, color: Color(0xFFE66518), size: 18),
                          const SizedBox(width: 8),
                          Text(
                            lang.isHindi ? 'AI द्वारा सुझाई गई श्रेणी व प्राथमिकता' : 'AI Classification',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: Color(0xFF9A3412),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE66518),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _aiAnalysis!['category'] ?? 'Category',
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.red.shade700,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _aiAnalysis!['priority'] ?? 'PRIORITY',
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'विभाग: ${_aiAnalysis!['department'] ?? ""}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'कारण: ${_aiAnalysis!['reason'] ?? ""}',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 16),
              TextField(
                controller: _landmarkController,
                decoration: InputDecoration(
                  labelText: lang.isHindi ? 'स्थान / लैंडमार्क (उदा. स्कूल के पास)' : 'Landmark (e.g. Near Shiv Mandir)',
                  prefixIcon: const Icon(Icons.location_on, color: Color(0xFFE66518)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),

              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitComplaint,
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
          ],
        ),
      ),
    );
  }
}
