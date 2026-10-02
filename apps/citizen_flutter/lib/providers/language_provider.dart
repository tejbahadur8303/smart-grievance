import 'package:flutter/foundation.dart';

class LanguageProvider with ChangeNotifier {
  String _currentLang = 'hi'; // Default Hindi for rural village context

  String get currentLang => _currentLang;
  bool get isHindi => _currentLang == 'hi';

  void setLanguage(String lang) {
    _currentLang = lang;
    notifyListeners();
  }

  void toggleLanguage() {
    _currentLang = _currentLang == 'hi' ? 'en' : 'hi';
    notifyListeners();
  }

  String translate(String key) {
    final Map<String, Map<String, String>> strings = {
      'app_title': {
        'hi': 'स्मार्ट ग्रामीण समाधान',
        'en': 'Smart Village Grievance'
      },
      'report_problem': {
        'hi': 'समस्या दर्ज करें',
        'en': 'Report Problem'
      },
      'speak_complaint': {
        'hi': 'बोलकर शिकायत करें',
        'en': 'Speak a Complaint'
      },
      'my_complaints': {
        'hi': 'मेरी शिकायतें',
        'en': 'My Complaints'
      },
      'welfare_schemes': {
        'hi': 'कल्याणकारी योजनाएं',
        'en': 'Welfare Schemes'
      },
      'ration_transparency': {
        'hi': 'राशन पारदर्शिता',
        'en': 'Ration Transparency'
      },
      'ai_assistant': {
        'hi': 'ग्रामीण सहायक AI',
        'en': 'Gramin Assistant AI'
      },
      'emergency_services': {
        'hi': 'आपातकालीन सेवाएं (112)',
        'en': 'Emergency Services (112)'
      },
      'verify_prompt': {
        'hi': 'क्या आपकी समस्या का समाधान हो गया है?',
        'en': 'Has your issue been resolved?'
      },
      'yes_resolved': {
        'hi': 'हाँ, समस्या हल हो गई',
        'en': 'Yes, Issue Resolved'
      },
      'no_reopen': {
        'hi': 'नहीं, समस्या अभी भी है',
        'en': 'No, Issue Still Exists'
      },
      'submit': {
        'hi': 'शिकायत भेजें',
        'en': 'Submit Complaint'
      }
    };

    return strings[key]?[_currentLang] ?? key;
  }
}
