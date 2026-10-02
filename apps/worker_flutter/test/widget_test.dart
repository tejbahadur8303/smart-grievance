import 'package:flutter_test/flutter_test.dart';
import 'package:worker_flutter/main.dart';

void main() {
  testWidgets('Worker App renders login properly', (WidgetTester tester) async {
    await tester.pumpWidget(const SmartWorkerApp());
    await tester.pumpAndSettle();

    expect(find.textContaining('Field Worker'), findsOneWidget);
  });
}
