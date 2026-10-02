import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../providers/complaint_provider.dart';
import 'voice_complaint_screen.dart';
import 'text_complaint_screen.dart';
import 'complaint_list_screen.dart';
import 'welfare_schemes_screen.dart';
import 'ration_transparency_screen.dart';
import 'ai_assistant_screen.dart';
import 'nearby_services_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentNavIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ComplaintProvider>(context, listen: false).fetchComplaints();
    });
  }

  void _navigateTo(Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final lang = context.watch<LanguageProvider>();
    final complaintsProv = context.watch<ComplaintProvider>();
    final isHindi = lang.isHindi;

    final userName = (auth.user?['name'] ?? (isHindi ? 'नागरिक' : 'Citizen')).toString();
    final village = (auth.user?['village'] ?? (isHindi ? 'रामपुर गाँव' : 'Rampur Village')).toString();
    final district = (auth.user?['district'] ?? (isHindi ? 'वाराणसी, उत्तर प्रदेश' : 'Varanasi, Uttar Pradesh')).toString();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background Gradient at Top (Soft Green Village Hill Ambience)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 240,
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFD2EED8), Color(0xFFEAF5EC), AppColors.background],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          SafeArea(
            bottom: false,
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 110),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 10),

                  // 1. Top Location Bar & Notifications
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, color: AppColors.primary, size: 22),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                village,
                                style: const TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.ink,
                                ),
                              ),
                              Text(
                                district,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.muted,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Language Toggle Chip
                        InkWell(
                          onTap: () => lang.toggleLanguage(),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Text(
                              isHindi ? 'ENG' : 'हिंदी',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Notification Bell with Badge
                        InkWell(
                          onTap: () => _navigateTo(const ComplaintListScreen()),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.border),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                )
                              ],
                            ),
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                const Icon(Icons.notifications_none_rounded, color: AppColors.ink, size: 20),
                                Positioned(
                                  top: 8,
                                  right: 9,
                                  child: Container(
                                    width: 7,
                                    height: 7,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFEF4444),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // 2. Greeting Headline with Village Illustration Motif
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      isHindi ? 'नमस्ते, $userName' : 'Namaste, $userName',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 21,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.ink,
                                        letterSpacing: -0.4,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text('👋', style: TextStyle(fontSize: 20)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isHindi
                                    ? 'आपके गाँव की सेवाओं में आपका स्वागत है'
                                    : 'Welcome to your village services portal',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.muted,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Rural Hut & Greenery Motif
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFE2F4E6), Color(0xFFC7EBD2)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(
                            Icons.cottage_rounded,
                            color: AppColors.primary,
                            size: 28,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 3. Capsule Search Bar ("आप क्या करना चाहते हैं?")
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: InkWell(
                      onTap: () => _navigateTo(const AiAssistantScreen()),
                      borderRadius: BorderRadius.circular(28),
                      child: Container(
                        height: 50,
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: AppColors.border),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search, color: AppColors.mutedLight, size: 22),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                isHindi ? 'आप क्या करना चाहते हैं?' : 'What would you like to do?',
                                style: const TextStyle(
                                  color: AppColors.muted,
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const Icon(Icons.mic_none_rounded, color: AppColors.primary, size: 20),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 4. Dual Hero Action Cards (Side-by-side)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: Row(
                      children: [
                        // Left Hero: शिकायत दर्ज करें (Soft Blue Card)
                        Expanded(
                          child: _buildHeroCard(
                            title: isHindi ? 'शिकायत दर्ज करें' : 'Lodge Complaint',
                            icon: Icons.edit_note_rounded,
                            backgroundColor: AppColors.heroBlueSoft,
                            iconContainerColor: Colors.white,
                            iconColor: AppColors.heroBlueIcon,
                            textColor: AppColors.heroBlueText,
                            onTap: () => _navigateTo(const TextComplaintScreen()),
                          ),
                        ),
                        const SizedBox(width: 14),

                        // Right Hero: बोलकर शिकायत (Vibrant Forest Green Card)
                        Expanded(
                          child: _buildHeroCard(
                            title: isHindi ? 'बोलकर शिकायत' : 'Voice Complaint',
                            icon: Icons.mic_rounded,
                            backgroundColor: AppColors.primary,
                            iconContainerColor: Colors.white.withValues(alpha: 0.2),
                            iconColor: Colors.white,
                            textColor: Colors.white,
                            hasShadow: true,
                            onTap: () => _navigateTo(const VoiceComplaintScreen()),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 5. 2x2 Civic Services Grid
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 2.15,
                      children: [
                        // 1. राशन स्थिति >
                        _buildServiceTile(
                          title: isHindi ? 'राशन स्थिति' : 'Ration Status',
                          icon: Icons.rice_bowl_rounded,
                          iconColor: const Color(0xFFD97706),
                          iconBgColor: const Color(0xFFFEF3C7),
                          onTap: () => _navigateTo(const RationTransparencyScreen()),
                        ),

                        // 2. सरकारी योजनाएं >
                        _buildServiceTile(
                          title: isHindi ? 'सरकारी योजनाएं' : 'Govt. Schemes',
                          icon: Icons.account_balance_rounded,
                          iconColor: const Color(0xFFD97706),
                          iconBgColor: const Color(0xFFFEF3C7),
                          onTap: () => _navigateTo(const WelfareSchemesScreen()),
                        ),

                        // 3. मेरी शिकायतें >
                        _buildServiceTile(
                          title: isHindi ? 'मेरी शिकायतें' : 'My Complaints',
                          icon: Icons.assignment_outlined,
                          iconColor: const Color(0xFFDB2777),
                          iconBgColor: const Color(0xFFFCE7F3),
                          badge: complaintsProv.complaints.isNotEmpty
                              ? '${complaintsProv.complaints.length}'
                              : null,
                          onTap: () => _navigateTo(const ComplaintListScreen()),
                        ),

                        // 4. गाँव की जानकारी >
                        _buildServiceTile(
                          title: isHindi ? 'गाँव की जानकारी' : 'Village Info',
                          icon: Icons.bar_chart_rounded,
                          iconColor: AppColors.primary,
                          iconBgColor: AppColors.primarySoft,
                          onTap: () => _navigateTo(const NearbyServicesScreen()),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // 6. Bottom Resolve Banner ("आपकी आवाज़, हमारा संकल्प")
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFFF4E6), Color(0xFFE8F6ED)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          )
                        ],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isHindi ? 'आपकी आवाज़, हमारा संकल्प' : 'Your voice, our resolve',
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.ink,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  isHindi
                                      ? 'एक बेहतर गाँव, एक मजबूत भारत'
                                      : 'A better village, a stronger India',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.muted,
                                    height: 1.3,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),

                          // Circular Emblem with Indian Tricolor Accent
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ],
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.groups_rounded,
                                color: Color(0xFFD97706),
                                size: 28,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),

      // 7. Center Floating Mic Action Button
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: Container(
        width: 66,
        height: 66,
        padding: const EdgeInsets.all(4),
        decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
        ),
        child: FloatingActionButton(
          elevation: 4,
          backgroundColor: AppColors.primary,
          shape: const CircleBorder(),
          onPressed: () => _navigateTo(const VoiceComplaintScreen()),
          child: const Icon(Icons.mic_rounded, color: Colors.white, size: 30),
        ),
      ),

      // 8. Notched Bottom Navigation Bar
      bottomNavigationBar: BottomAppBar(
        color: Colors.white,
        elevation: 10,
        height: 68,
        padding: EdgeInsets.zero,
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(
              icon: Icons.home_rounded,
              label: isHindi ? 'Home' : 'Home',
              isSelected: _currentNavIndex == 0,
              onTap: () {
                setState(() => _currentNavIndex = 0);
              },
            ),
            _buildNavItem(
              icon: Icons.grid_view_rounded,
              label: isHindi ? 'Services' : 'Services',
              isSelected: _currentNavIndex == 1,
              onTap: () {
                setState(() => _currentNavIndex = 1);
                _showServicesBottomSheet(context, isHindi);
              },
            ),
            const SizedBox(width: 56), // Gap for center notched mic FAB
            _buildNavItem(
              icon: Icons.timeline_rounded,
              label: isHindi ? 'Track' : 'Track',
              isSelected: _currentNavIndex == 2,
              onTap: () {
                setState(() => _currentNavIndex = 2);
                _navigateTo(const ComplaintListScreen());
              },
            ),
            _buildNavItem(
              icon: Icons.person_outline_rounded,
              label: isHindi ? 'Profile' : 'Profile',
              isSelected: _currentNavIndex == 3,
              onTap: () {
                setState(() => _currentNavIndex = 3);
                _showProfileBottomSheet(context, auth, lang, isHindi, userName);
              },
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // HELPER WIDGETS
  // =========================================================================

  Widget _buildHeroCard({
    required String title,
    required IconData icon,
    required Color backgroundColor,
    required Color iconContainerColor,
    required Color iconColor,
    required Color textColor,
    bool hasShadow = false,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        height: 110,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(20),
          boxShadow: hasShadow ? AppShadows.fab : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconContainerColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            Text(
              title,
              style: TextStyle(
                color: textColor,
                fontSize: 14.5,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceTile({
    required String title,
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    String? badge,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconBgColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 4),
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  badge,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: iconColor,
                  ),
                ),
              ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.mutedLight, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final color = isSelected ? AppColors.primary : AppColors.muted;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: color,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // BOTTOM SHEETS (SERVICES & PROFILE)
  // =========================================================================

  void _showServicesBottomSheet(BuildContext context, bool isHindi) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetCtx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                isHindi ? 'सभी नागरिक सेवाएं' : 'All Citizen Services',
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.ink),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.mic_rounded, color: AppColors.primary),
                title: Text(isHindi ? 'बोलकर शिकायत दर्ज करें' : 'Voice Grievance Lodging'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _navigateTo(const VoiceComplaintScreen());
                },
              ),
              ListTile(
                leading: const Icon(Icons.edit_note_rounded, color: Color(0xFF0284C7)),
                title: Text(isHindi ? 'लिखित शिकायत दर्ज करें' : 'Text Grievance Lodging'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _navigateTo(const TextComplaintScreen());
                },
              ),
              ListTile(
                leading: const Icon(Icons.rice_bowl_rounded, color: Color(0xFFD97706)),
                title: Text(isHindi ? 'राशन कार्ड व मासिक कोटा' : 'PDS Ration Quotas & Transparency'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _navigateTo(const RationTransparencyScreen());
                },
              ),
              ListTile(
                leading: const Icon(Icons.account_balance_rounded, color: Color(0xFF7C3AED)),
                title: Text(isHindi ? 'सरकारी कल्याणकारी योजनाएं' : 'Government Welfare Schemes'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _navigateTo(const WelfareSchemesScreen());
                },
              ),
              ListTile(
                leading: const Icon(Icons.emergency_rounded, color: Color(0xFFDC2626)),
                title: Text(isHindi ? 'आपातकालीन सेवाएं (112 / 108)' : 'Emergency Services & Health'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _navigateTo(const NearbyServicesScreen());
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showProfileBottomSheet(
    BuildContext context,
    AuthProvider auth,
    LanguageProvider lang,
    bool isHindi,
    String userName,
  ) {
    final phone = (auth.user?['phone'] ?? '9876543203').toString();
    final village = (auth.user?['village'] ?? (isHindi ? 'रामपुर गाँव' : 'Rampur Village')).toString();
    final district = (auth.user?['district'] ?? (isHindi ? 'वाराणसी, उत्तर प्रदेश' : 'Varanasi, Uttar Pradesh')).toString();

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetCtx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),

              // User Info Card
              Row(
                children: [
                  const CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.primarySoft,
                    child: Icon(Icons.person, color: AppColors.primary, size: 32),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppColors.ink,
                          ),
                        ),
                        Text(
                          '+91 $phone',
                          style: const TextStyle(fontSize: 12, color: AppColors.muted),
                        ),
                        Text(
                          '$village, $district',
                          style: const TextStyle(fontSize: 11, color: AppColors.muted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),
              const Divider(),
              const SizedBox(height: 8),

              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.translate, color: AppColors.primary),
                title: Text(isHindi ? 'भाषा / Language' : 'Language / भाषा'),
                trailing: Text(
                  isHindi ? 'हिंदी' : 'English',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                onTap: () {
                  lang.toggleLanguage();
                  Navigator.pop(sheetCtx);
                },
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.description_outlined, color: AppColors.ink),
                title: Text(isHindi ? 'मेरी शिकायतें' : 'My Complaints'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _navigateTo(const ComplaintListScreen());
                },
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.rice_bowl_outlined, color: AppColors.ink),
                title: Text(isHindi ? 'राशन कार्ड' : 'Ration Card'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _navigateTo(const RationTransparencyScreen());
                },
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.logout, color: AppColors.danger),
                title: Text(
                  isHindi ? 'लॉग आउट' : 'Log Out',
                  style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700),
                ),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  auth.logout();
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}