import { IAiProvider, AiComplaintAnalysisResult, AiChatContext } from './ai.provider.interface';
import { PriorityLevel, CATEGORY_DEPARTMENT_MAP } from '../../config/constants';

export class DeterministicRulesAiProvider implements IAiProvider {
  async analyzeComplaint(
    text: string,
    metadata?: { villageContext?: string; hasImage?: boolean }
  ): Promise<AiComplaintAnalysisResult> {
    const lower = text.toLowerCase();

    let category = 'Other';
    let subcategory = 'General Grievance';
    let priority = PriorityLevel.MEDIUM;
    let priorityScore = 50;
    let reason = 'Standard grievance classified based on keyword and safety patterns.';
    let suggestedSlaHours = 72;

    // Check Categories
    if (
      lower.includes('bijli') ||
      lower.includes('electric') ||
      lower.includes('light') ||
      lower.includes('wire') ||
      lower.includes('pole') ||
      lower.includes('transformer') ||
      lower.includes('current') ||
      lower.includes('bulb')
    ) {
      category = 'Streetlights & Electrical';
      subcategory = lower.includes('wire') ? 'Exposed/Broken Wire' : 'Streetlight Repair';
    } else if (
      lower.includes('pani') ||
      lower.includes('water') ||
      lower.includes('pipeline') ||
      lower.includes('leak') ||
      lower.includes('handpump') ||
      lower.includes('boring') ||
      lower.includes('tanker') ||
      lower.includes('peene ka pani')
    ) {
      category = 'Water Supply & Leakage';
      subcategory = lower.includes('pipeline') ? 'Pipeline Leakage' : 'Handpump Malfunction';
    } else if (
      lower.includes('sadak') ||
      lower.includes('road') ||
      lower.includes('pothole') ||
      lower.includes('khadda') ||
      lower.includes('dhamaka') ||
      lower.includes('pul') ||
      lower.includes('bridge')
    ) {
      category = 'Roads & Potholes';
      subcategory = 'Pothole & Surface Damage';
    } else if (
      lower.includes('naali') ||
      lower.includes('drain') ||
      lower.includes('sewage') ||
      lower.includes('overflow') ||
      lower.includes('ganda pani') ||
      lower.includes('gutter')
    ) {
      category = 'Drainage & Sewage';
      subcategory = 'Drain Blockage & Sewage Stagnation';
    } else if (
      lower.includes('kachra') ||
      lower.includes('garbage') ||
      lower.includes('safai') ||
      lower.includes('dustbin') ||
      lower.includes('cleanliness') ||
      lower.includes('badbu') ||
      lower.includes('waste')
    ) {
      category = 'Garbage & Sanitation';
      subcategory = 'Solid Waste Accumulation';
    } else if (
      lower.includes('toilet') ||
      lower.includes('shauchalay') ||
      lower.includes('latrine')
    ) {
      category = 'Public Toilets';
      subcategory = 'Public Toilet Sanitation';
    } else if (
      lower.includes('ration') ||
      lower.includes('rashan') ||
      lower.includes('kotedar') ||
      lower.includes('dealer') ||
      lower.includes('chawal') ||
      lower.includes('gehun') ||
      lower.includes('sugar') ||
      lower.includes('pds')
    ) {
      category = 'PDS / Ration Supply';
      subcategory = 'Fair Price Shop Irregularity';
    } else if (
      lower.includes('school') ||
      lower.includes('anganwadi') ||
      lower.includes('vidyalaya') ||
      lower.includes('midday meal') ||
      lower.includes('classroom')
    ) {
      category = 'School & Anganwadi Infrastructure';
      subcategory = 'School Facility Maintenance';
    } else if (
      lower.includes('hospital') ||
      lower.includes('doctor') ||
      lower.includes('clinic') ||
      lower.includes('dawakhana') ||
      lower.includes('medicine') ||
      lower.includes('health')
    ) {
      category = 'Health Centre / Dispensary';
      subcategory = 'Primary Health Centre Services';
    } else if (
      lower.includes('pension') ||
      lower.includes('awas') ||
      lower.includes('scheme') ||
      lower.includes('yojana') ||
      lower.includes('subsidy')
    ) {
      category = 'Welfare Schemes & Pensions';
      subcategory = 'Scheme Benefit Delay';
    } else if (
      lower.includes('kisan') ||
      lower.includes('crop') ||
      lower.includes('fasal') ||
      lower.includes('sinchai') ||
      lower.includes('irrigation') ||
      lower.includes('canal')
    ) {
      category = 'Agriculture & Irrigation';
      subcategory = 'Canal & Irrigation Supply';
    } else if (
      lower.includes('kutta') ||
      lower.includes('dog') ||
      lower.includes('cow') ||
      lower.includes('gay') ||
      lower.includes('animal') ||
      lower.includes('janwar')
    ) {
      category = 'Livestock & Animal Welfare';
      subcategory = 'Stray Animal Concern';
    }

    // Determine Severity & Priority
    const hasEmergencyKeywords =
      lower.includes('fallen wire') ||
      lower.includes('wire fallen') ||
      lower.includes('current') ||
      lower.includes('open manhole') ||
      lower.includes('khula gutter') ||
      lower.includes('drowning') ||
      lower.includes('hazard') ||
      lower.includes('danger') ||
      lower.includes('short circuit') ||
      lower.includes('fatal') ||
      lower.includes('accident');

    const hasHighKeywords =
      lower.includes('leakage') ||
      lower.includes('burst') ||
      lower.includes('no drinking water') ||
      lower.includes('pani band') ||
      lower.includes('road blocked') ||
      lower.includes('flooding') ||
      lower.includes('urgent') ||
      lower.includes('contamination') ||
      lower.includes('overcharging');

    if (hasEmergencyKeywords) {
      priority = PriorityLevel.CRITICAL;
      priorityScore = 95;
      suggestedSlaHours = 12;
      reason = 'Emergency safety hazard detected (electrocution, open manhole, or fatal risk). Immediate intervention required.';
    } else if (hasHighKeywords) {
      priority = PriorityLevel.HIGH;
      priorityScore = 80;
      suggestedSlaHours = 36;
      reason = 'High impact civic disruption identified affecting essential daily village amenities.';
    } else if (lower.includes('broken') || lower.includes('khada') || lower.includes('stink') || lower.includes('smell')) {
      priority = PriorityLevel.MEDIUM;
      priorityScore = 55;
      suggestedSlaHours = 72;
      reason = 'Routine public amenity repair needed without immediate life-safety peril.';
    } else {
      priority = PriorityLevel.LOW;
      priorityScore = 35;
      suggestedSlaHours = 144;
      reason = 'Low impact civic concern or general administrative request.';
    }

    const department = CATEGORY_DEPARTMENT_MAP[category] || 'General Panchayat Administration';

    return {
      category,
      subcategory,
      department,
      priority,
      priorityScore,
      confidence: 0.88,
      reason,
      suggestedSlaHours,
      possibleDuplicateComplaintIds: []
    };
  }

  async chat(message: string, context?: AiChatContext): Promise<string> {
    const lower = message.toLowerCase();

    // Check if user is asking about specific complaint ID
    const complaintMatch = message.match(/GRV-\d{4}-\d{3,5}/i);
    if (complaintMatch && context?.recentComplaints) {
      const code = complaintMatch[0].toUpperCase();
      const found = context.recentComplaints.find((c) => c.complaintId.toUpperCase() === code);
      if (found) {
        return `Aapki shikayat **${found.complaintId}** (${found.title}) ka vartaman status **${found.status}** hai. Ye ${found.category} vibhag ko bheji gayi hai aur iska update samay: ${new Date(found.updatedAt).toLocaleDateString('hi-IN')}.`;
      }
      return `Shikayat sankhya **${code}** hamare record me mil gayi hai, adhik jankari ke liye "My Complaints" section me dekhein.`;
    }

    if (lower.includes('status') || lower.includes('stithi') || lower.includes('meri complaint')) {
      if (context?.recentComplaints && context.recentComplaints.length > 0) {
        const top = context.recentComplaints[0];
        return `Aapki haliya shikayat **${top.complaintId}** ("${top.title}") abhi **${top.status}** stithi me hai. Vibhag: ${top.category}. Jaise hi karmachari kam shuru karega aapko suchit kiya jayega.`;
      }
      return `Aap apni shikayaton ki stithi "My Complaints" tab par click karke real-time dekh sakte hain.`;
    }

    if (lower.includes('shikayat') || lower.includes('complaint') || lower.includes('kaise kare') || lower.includes('how to report')) {
      return `Shikayat darj karne ke 2 aasan tareeqe hain:\n1. **Bolkar (Voice):** "Speak a Complaint" button dabayein aur apni samasya bolein.\n2. **Type karke:** "Report Problem" par jayein, vivaran likhein, photo aur GPS jodein, fir Submit karein.`;
    }

    if (lower.includes('ration') || lower.includes('rashan') || lower.includes('kotedar')) {
      return `Ration sambandhi suvidhayein:\n- "Ration Transparency" module me apna masik aabantan (entitlement) dekhein.\n- Kotedar kam ration de ya dukan band rakhe to "Report Ration Issue" par click karke turant shikayat karein.`;
    }

    if (lower.includes('yojana') || lower.includes('scheme') || lower.includes('awas') || lower.includes('pension')) {
      return `Gramin Kalyan Yojanaayein:\n- **PM Awas Gramin**: Awas ke liye aavedan aur 1.2 Lakh sahayata.\n- **Kisan Samman Nidhi**: Saalana 6,000 rupaye ki sahayata.\n- **Vridhavastha Pension**: Varishth nagrikon ke liye.\n"Welfare Schemes" tab par jakar aavedan karein aur aavashyak dastaavez upload karein.`;
    }

    return `Namaste ${context?.citizenName || 'Nagrik'} ji! Main aapka Gramin Sahayak AI hoon. Main aapki shikayat darj karne, shikayat ki stithi batane, ration ki jankari aur gaon ki kalyankari yojanaon ke bare me madad kar sakta hoon. Kripya apna prashna bolein ya likhein.`;
  }
}
