import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/task_provider.dart';

class TaskDetailScreen extends StatefulWidget {
  final Map<String, dynamic> task;

  const TaskDetailScreen({super.key, required this.task});

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  late Map<String, dynamic> _currentTask;
  final _completionNotesController = TextEditingController(text: 'Replaced broken component and tested functionality.');
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _currentTask = Map<String, dynamic>.from(widget.task);
  }

  @override
  void dispose() {
    _completionNotesController.dispose();
    super.dispose();
  }

  void _accept() async {
    setState(() => _isProcessing = true);
    final provider = Provider.of<TaskProvider>(context, listen: false);
    final ok = await provider.acceptTask(_currentTask['taskId']);
    if (ok) {
      setState(() {
        _currentTask['status'] = 'ACCEPTED';
        _isProcessing = false;
      });
    } else {
      setState(() => _isProcessing = false);
    }
  }

  void _startWork() async {
    setState(() => _isProcessing = true);
    final provider = Provider.of<TaskProvider>(context, listen: false);
    final beforePhotos = [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
    ];
    final ok = await provider.startWork(_currentTask['taskId'], beforePhotos);
    if (ok) {
      setState(() {
        _currentTask['status'] = 'IN_PROGRESS';
        _currentTask['beforePhotos'] = beforePhotos;
        _isProcessing = false;
      });
    } else {
      setState(() => _isProcessing = false);
    }
  }

  void _completeTask() async {
    setState(() => _isProcessing = true);
    final provider = Provider.of<TaskProvider>(context, listen: false);
    final afterPhotos = [
      'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80'
    ];
    final ok = await provider.completeTask(
      taskId: _currentTask['taskId'],
      afterPhotos: afterPhotos,
      completionNotes: _completionNotesController.text.trim(),
      latitude: 25.3512,
      longitude: 82.9715,
    );

    setState(() => _isProcessing = false);

    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Task resolved! Citizen notified to verify resolution.'),
          backgroundColor: Color(0xFF059669),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = _currentTask['status'] ?? 'ASSIGNED';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(_currentTask['taskId'] ?? ''),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Info Card
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
                          color: const Color(0xFF1E3A8A).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _currentTask['category'] ?? '',
                          style: const TextStyle(color: Color(0xFF1E3A8A), fontWeight: FontWeight.bold, fontSize: 12),
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
                    _currentTask['title'] ?? '',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Instructions: ${_currentTask['instructions'] ?? "Inspect site and resolve."}',
                    style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
                  ),
                  if (_currentTask['landmark'] != null) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.pin_drop, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(_currentTask['landmark'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),
            const Text(
              'Proof of Work Execution',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            // Proof Upload & Actions Box
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
                  if (status == 'ASSIGNED') ...[
                    const Text('Please review instructions and accept assignment:'),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isProcessing ? null : _accept,
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white),
                            child: const Text('Accept Task'),
                          ),
                        ),
                      ],
                    ),
                  ] else if (status == 'ACCEPTED') ...[
                    const Text('Ready to begin work? Upload before-work proof:'),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isProcessing ? null : _startWork,
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Capture Before Photo & Start'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE66518), foregroundColor: Colors.white),
                      ),
                    ),
                  ] else if (status == 'IN_PROGRESS') ...[
                    const Text('Work completed on site? Provide proof and notes:'),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _completionNotesController,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: 'Completion Notes',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: _isProcessing ? null : _completeTask,
                        icon: const Icon(Icons.check_circle),
                        label: const Text('Upload After Photo & Resolve Task'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white),
                      ),
                    ),
                  ] else if (status == 'COMPLETED') ...[
                    const Row(
                      children: [
                        Icon(Icons.verified, color: Colors.green, size: 24),
                        SizedBox(width: 8),
                        Text('Task Completed & Verified on Ground', style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Notes: ${_currentTask['completionNotes'] ?? "Work verified."}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
