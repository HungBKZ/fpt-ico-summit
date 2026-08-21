/**
 * src/lib/config/workshop-tracks.ts
 *
 * Centralized Workshop Track taxonomy and suggested topic definitions for FPT ICO Summit 2026.
 */

import type { OrganizationType } from "@/lib/db/models/organization";

export type WorkshopTrackId =
  | "STUDY_ABROAD_SCHOLARSHIPS"
  | "INTERNATIONAL_MOBILITY_EXCHANGE"
  | "AI_EDUCATION_FUTURE_CAREERS"
  | "TECHNOLOGY_INNOVATION"
  | "GLOBAL_COMPETENCIES_CROSS_CULTURAL"
  | "INDUSTRY_EMPLOYABILITY";

export interface SuggestedTopic {
  id: string;
  title: {
    en: string;
    vi: string;
  };
}

export interface WorkshopTrackDefinition {
  id: WorkshopTrackId;
  name: {
    en: string;
    vi: string;
  };
  description: {
    en: string;
    vi: string;
  };
  recommendedOrganizationTypes: OrganizationType[];
  suggestedTopics: SuggestedTopic[];
}

export const WORKSHOP_TRACKS: WorkshopTrackDefinition[] = [
  {
    id: "STUDY_ABROAD_SCHOLARSHIPS",
    name: {
      en: "Study Abroad & Scholarships",
      vi: "Du học & Học bổng",
    },
    description: {
      en: "Insights into higher education abroad, degree programs, funding, scholarships, and international admissions.",
      vi: "Thông tin giáo dục đại học nước ngoài, chương trình đào tạo, học bổng và quy trình nộp hồ sơ du học.",
    },
    recommendedOrganizationTypes: ["CONSULATE", "UNIVERSITY"],
    suggestedTopics: [
      { id: "TOPIC_SAS_01", title: { en: "Understanding Higher Education in Foreign Countries", vi: "Tìm hiểu hệ thống giáo dục đại học ở nước ngoài" } },
      { id: "TOPIC_SAS_02", title: { en: "Study in Foreign Countries: Programs, Scholarships & Student Life", vi: "Du học: Chương trình, học bổng và cuộc sống sinh viên" } },
      { id: "TOPIC_SAS_03", title: { en: "Choosing the Right University and Major", vi: "Lựa chọn trường đại học và ngành học phù hợp" } },
      { id: "TOPIC_SAS_04", title: { en: "Scholarship Opportunities for Vietnamese Students", vi: "Cơ hội học bổng dành cho sinh viên Việt Nam" } },
      { id: "TOPIC_SAS_05", title: { en: "Building a Strong Study Abroad Application", vi: "Xây dựng hồ sơ du học ấn tượng" } },
      { id: "TOPIC_SAS_06", title: { en: "Personal Statement, CV & Interview Tips", vi: "Bí quyết viết bài luận cá nhân, CV & phỏng vấn du học" } },
      { id: "TOPIC_SAS_07", title: { en: "Visa & Pre-departure Preparation", vi: "Hành trang Visa và chuẩn bị trước khi lên đường" } },
      { id: "TOPIC_SAS_08", title: { en: "From Study Abroad to Global Career Opportunities", vi: "Từ du học đến cơ hội nghề nghiệp toàn cầu" } },
      { id: "TOPIC_SAS_09", title: { en: "IELTS, TOEFL or TOEIC: Which Test Fits Your Goal?", vi: "IELTS, TOEFL hay TOEIC: Chứng chỉ nào phù hợp với bạn?" } },
      { id: "TOPIC_SAS_10", title: { en: "Funding Your International Education", vi: "Giải pháp tài chính cho lộ trình du học" } },
    ],
  },
  {
    id: "INTERNATIONAL_MOBILITY_EXCHANGE",
    name: {
      en: "International Mobility & Exchange",
      vi: "Trao đổi sinh viên & Trải nghiệm quốc tế",
    },
    description: {
      en: "Semester exchange programs, summer/winter camps, study tours, and short-term mobility initiatives.",
      vi: "Chương trình trao đổi sinh viên, trại hè/trại đông quốc tế, study tour và học tập ngắn hạn.",
    },
    recommendedOrganizationTypes: ["UNIVERSITY"],
    suggestedTopics: [
      { id: "TOPIC_IME_01", title: { en: "Semester Exchange: What Students Need to Know", vi: "Trao đổi sinh viên 1 học kỳ: Những điều cần biết" } },
      { id: "TOPIC_IME_02", title: { en: "Summer & Winter Camps Abroad", vi: "Trại hè và trại đông quốc tế dành cho sinh viên" } },
      { id: "TOPIC_IME_03", title: { en: "Research Camps for Undergraduate Students", vi: "Trại nghiên cứu khoa học dành cho sinh viên đại học" } },
      { id: "TOPIC_IME_04", title: { en: "Short-term International Programs", vi: "Các chương trình quốc tế ngắn hạn" } },
      { id: "TOPIC_IME_05", title: { en: "Cultural Immersion & Study Tours", vi: "Hành trình trải nghiệm văn hóa & Study Tour" } },
      { id: "TOPIC_IME_06", title: { en: "Making the Most of Your Exchange Experience", vi: "Tối ưu hóa trải nghiệm học tập trao đổi" } },
      { id: "TOPIC_IME_07", title: { en: "Building an International Network While Studying Abroad", vi: "Xây dựng mạng lưới kết nối quốc tế khi du học" } },
      { id: "TOPIC_IME_08", title: { en: "From Campus to Campus: Student Mobility Opportunities", vi: "Từ khuôn viên này đến khuôn viên khác: Cơ hội dịch chuyển sinh viên" } },
      { id: "TOPIC_IME_09", title: { en: "Academic Collaboration Across Borders", vi: "Hợp tác học thuật xuyên biên giới" } },
      { id: "TOPIC_IME_10", title: { en: "Preparing for Your First International Experience", vi: "Chuẩn bị cho chuyến trải nghiệm quốc tế đầu tiên" } },
    ],
  },
  {
    id: "AI_EDUCATION_FUTURE_CAREERS",
    name: {
      en: "AI, Education & Future Careers",
      vi: "AI, Giáo dục & Nghề nghiệp tương lai",
    },
    description: {
      en: "Generative AI applications in learning, digital transformation in universities, and AI-era skillsets.",
      vi: "Ứng dụng AI tạo sinh trong học tập, chuyển đổi số giáo dục và bộ kỹ năng trong kỷ nguyên AI.",
    },
    recommendedOrganizationTypes: ["UNIVERSITY"],
    suggestedTopics: [
      { id: "TOPIC_AEC_01", title: { en: "AI for Smarter Learning", vi: "Học tập thông minh cùng AI" } },
      { id: "TOPIC_AEC_02", title: { en: "Generative AI in Education", vi: "Trí tuệ nhân tạo tạo sinh (Generative AI) trong giáo dục" } },
      { id: "TOPIC_AEC_03", title: { en: "Responsible AI & Academic Integrity", vi: "Sử dụng AI có trách nhiệm & Liêm chính học thuật" } },
      { id: "TOPIC_AEC_04", title: { en: "AI for Language Learning", vi: "Ứng dụng AI nâng cao kỹ năng học ngoại ngữ" } },
      { id: "TOPIC_AEC_05", title: { en: "AI-powered Personalized Learning", vi: "Cá nhân hóa lộ trình học tập bằng AI" } },
      { id: "TOPIC_AEC_06", title: { en: "How AI Is Changing Universities", vi: "Cách AI đang thay đổi môi trường đại học" } },
      { id: "TOPIC_AEC_07", title: { en: "AI and the Future of Assessment", vi: "AI và tương lai của kiểm tra đánh giá" } },
      { id: "TOPIC_AEC_08", title: { en: "AI Skills Every Student Should Have", vi: "Kỹ năng AI thiết yếu cho sinh viên" } },
      { id: "TOPIC_AEC_09", title: { en: "Careers in the AI Era", vi: "Phát triển sự nghiệp trong kỷ nguyên AI" } },
      { id: "TOPIC_AEC_10", title: { en: "Human Skills That AI Cannot Replace", vi: "Kỹ năng con người AI không thể thay thế" } },
      { id: "TOPIC_AEC_11", title: { en: "AI for Research & Academic Writing", vi: "AI trong nghiên cứu và viết bài báo khoa học" } },
      { id: "TOPIC_AEC_12", title: { en: "From Student to AI-ready Professional", vi: "Từ sinh viên đến nhân sự sẵn sàng cho kỷ nguyên AI" } },
    ],
  },
  {
    id: "TECHNOLOGY_INNOVATION",
    name: {
      en: "Technology & Innovation",
      vi: "Công nghệ & Đổi mới sáng tạo",
    },
    description: {
      en: "Emerging EdTech trends, smart campuses, digital learning tools, and student tech innovation.",
      vi: "Xu hướng công nghệ giáo dục, khuôn viên thông minh, công cụ số và đổi mới sáng tạo sinh viên.",
    },
    recommendedOrganizationTypes: ["UNIVERSITY"],
    suggestedTopics: [
      { id: "TOPIC_TI_01", title: { en: "Emerging Technologies in Education", vi: "Công nghệ mới nổi trong giáo dục" } },
      { id: "TOPIC_TI_02", title: { en: "EdTech Trends Transforming Learning", vi: "Xu hướng EdTech làm thay đổi phương pháp học" } },
      { id: "TOPIC_TI_03", title: { en: "Virtual Reality & Augmented Reality in Education", vi: "Thực tế ảo (VR) và Thực tế tăng cường (AR) trong giáo dục" } },
      { id: "TOPIC_TI_04", title: { en: "Gamification and Game-based Learning", vi: "Game hóa và học tập dựa trên trò chơi" } },
      { id: "TOPIC_TI_05", title: { en: "Digital Classrooms & Learning Management Systems", vi: "Lớp học số và Hệ thống quản lý học tập (LMS)" } },
      { id: "TOPIC_TI_06", title: { en: "Technology-enhanced Language Learning", vi: "Học ngôn ngữ với sự hỗ trợ của công nghệ" } },
      { id: "TOPIC_TI_07", title: { en: "Innovation & Entrepreneurship for Students", vi: "Đổi mới sáng tạo & Khởi nghiệp sinh viên" } },
      { id: "TOPIC_TI_08", title: { en: "Digital Transformation in Universities", vi: "Chuyển đổi số tại các trường đại học" } },
      { id: "TOPIC_TI_09", title: { en: "Cybersecurity & Data Privacy in Education", vi: "An ninh mạng & Bảo mật dữ liệu trong giáo dục" } },
      { id: "TOPIC_TI_10", title: { en: "Cloud Technology for Education", vi: "Công nghệ điện toán đám mây cho giáo dục" } },
      { id: "TOPIC_TI_11", title: { en: "Smart Campus & Future Universities", vi: "Khuôn viên thông minh & Trường đại học tương lai" } },
      { id: "TOPIC_TI_12", title: { en: "From Idea to Innovation: Building Student Projects", vi: "Từ ý tưởng đến sản phẩm: Xây dựng dự án sinh viên" } },
    ],
  },
  {
    id: "GLOBAL_COMPETENCIES_CROSS_CULTURAL",
    name: {
      en: "Global Competencies & Cross-Cultural Skills",
      vi: "Năng lực toàn cầu & Kỹ năng đa văn hóa",
    },
    description: {
      en: "Intercultural communication, multicultural teamwork, presentation skills, and global mindset.",
      vi: "Giao tiếp đa văn hóa, làm việc nhóm toàn cầu, kỹ năng thuyết trình và tư duy công dân toàn cầu.",
    },
    recommendedOrganizationTypes: ["UNIVERSITY"],
    suggestedTopics: [
      { id: "TOPIC_GCC_01", title: { en: "Cross-Cultural Communication in the AI Era", vi: "Giao tiếp đa văn hóa trong kỷ nguyên AI" } },
      { id: "TOPIC_GCC_02", title: { en: "Working Effectively in Multicultural Teams", vi: "Làm việc hiệu quả trong đội ngũ đa quốc gia" } },
      { id: "TOPIC_GCC_03", title: { en: "Understanding Culture Shock", vi: "Vượt qua sốc văn hóa khi hội nhập" } },
      { id: "TOPIC_GCC_04", title: { en: "Building Global Confidence", vi: "Xây dựng sự tự tin trong môi trường toàn cầu" } },
      { id: "TOPIC_GCC_05", title: { en: "Intercultural Leadership for Young People", vi: "Năng lực lãnh đạo đa văn hóa cho người trẻ" } },
      { id: "TOPIC_GCC_06", title: { en: "English Communication in International Environments", vi: "Giao tiếp tiếng Anh trong môi trường quốc tế" } },
      { id: "TOPIC_GCC_07", title: { en: "Presentation Skills for Global Audiences", vi: "Kỹ năng thuyết trình trước khán giả quốc tế" } },
      { id: "TOPIC_GCC_08", title: { en: "Networking Across Cultures", vi: "Mạng lưới kết nối xuyên văn hóa" } },
      { id: "TOPIC_GCC_09", title: { en: "Conflict Resolution in Multicultural Teams", vi: "Giải quyết xung đột trong nhóm đa văn hóa" } },
      { id: "TOPIC_GCC_10", title: { en: "Global Citizenship & International Mindset", vi: "Công dân toàn cầu & Tư duy hội nhập" } },
      { id: "TOPIC_GCC_11", title: { en: "Adaptability in International Study and Work", vi: "Khả năng thích ứng khi học tập và làm việc quốc tế" } },
      { id: "TOPIC_GCC_12", title: { en: "How to Build Your Global Profile from Year 1", vi: "Xây dựng hồ sơ năng lực toàn cầu từ năm nhất" } },
    ],
  },
  {
    id: "INDUSTRY_EMPLOYABILITY",
    name: {
      en: "Industry & Employability Trends",
      vi: "Xu hướng ngành nghề & Cơ hội việc làm toàn cầu",
    },
    description: {
      en: "Global workforce demands, multinational internships, LinkedIn profile optimization, and career readiness.",
      vi: "Nhu cầu thị trường lao động toàn cầu, thực tập quốc tế, tối ưu LinkedIn và chuẩn bị sự nghiệp.",
    },
    recommendedOrganizationTypes: ["UNIVERSITY"],
    suggestedTopics: [
      { id: "TOPIC_IE_01", title: { en: "What Global Employers Look for in Graduates", vi: "Nhà tuyển dụng toàn cầu tìm kiếm điều gì ở sinh viên mới tốt nghiệp" } },
      { id: "TOPIC_IE_02", title: { en: "Future Skills for the Global Workforce", vi: "Kỹ năng tương lai cho lực lượng lao động toàn cầu" } },
      { id: "TOPIC_IE_03", title: { en: "Careers in Technology & Digital Business", vi: "Cơ hội nghề nghiệp trong lĩnh vực Công nghệ & Kinh doanh số" } },
      { id: "TOPIC_IE_04", title: { en: "From University to International Workplace", vi: "Chuyển tiếp từ đại học sang môi trường làm việc quốc tế" } },
      { id: "TOPIC_IE_05", title: { en: "Global Internship Opportunities", vi: "Cơ hội thực tập tại các tập đoàn đa quốc gia" } },
      { id: "TOPIC_IE_06", title: { en: "Building a Career-ready CV & LinkedIn Profile", vi: "Xây dựng CV & Hồ sơ LinkedIn chuyên nghiệp" } },
      { id: "TOPIC_IE_07", title: { en: "How to Prepare for Your First International Interview", vi: "Bí quyết phỏng vấn tuyển dụng quốc tế" } },
      { id: "TOPIC_IE_08", title: { en: "Working in Multinational Companies", vi: "Môi trường làm việc tại các công ty đa quốc gia" } },
      { id: "TOPIC_IE_09", title: { en: "Industry Trends Students Should Know", vi: "Các xu hướng ngành nghề sinh viên cần nắm bắt" } },
      { id: "TOPIC_IE_10", title: { en: "Entrepreneurship in a Global Market", vi: "Khởi nghiệp trong thị trường toàn cầu" } },
      { id: "TOPIC_IE_11", title: { en: "University–Industry Collaboration", vi: "Hợp tác giữa nhà trường và doanh nghiệp" } },
      { id: "TOPIC_IE_12", title: { en: "Careers Without Borders: Working Internationally", vi: "Sự nghiệp không biên giới: Làm việc trên phạm vi quốc tế" } },
      { id: "TOPIC_IE_13", title: { en: "AI, Technology & the Future of Work", vi: "AI, Công nghệ & Tương lai của việc làm" } },
    ],
  },
];

export function getTrackById(trackId?: string): WorkshopTrackDefinition | undefined {
  if (!trackId) return undefined;
  return WORKSHOP_TRACKS.find((t) => t.id === trackId);
}

export function getTopicById(trackId?: string, topicId?: string): SuggestedTopic | undefined {
  const track = getTrackById(trackId);
  if (!track || !topicId) return undefined;
  return track.suggestedTopics.find((tp) => tp.id === topicId);
}
