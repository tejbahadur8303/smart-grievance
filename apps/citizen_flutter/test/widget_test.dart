import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_flutter/main.dart';

void main() {
  testWidgets('Citizen App renders login screen properly', (WidgetTester tester) async {
    await tester.pumpWidget(const SmartCitizenApp());
    await tester.pumpAndSettle();

    expect(find.textContaining('स्मार्ट ग्रामीण'), findsOneWidget);
  });
}
