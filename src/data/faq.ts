/**
 * faq.ts — FAQ entries for FPT ICO Summit 2026.
 *
 * Localized questions and answers for English and Vietnamese.
 */

import type { LocalizedText } from "@/i18n/types";

export type FaqItem = {
  id: string;
  question: string | LocalizedText;
  answer: string | LocalizedText;
};

export const faqItems: FaqItem[] = [
  {
    id: "who-can-attend",
    question: {
      en: "Who can attend FPT ICO Summit 2026?",
      vi: "Ai có thể tham dự FPT ICO Summit 2026?",
    },
    answer: {
      en: "The summit is designed for high-school and university students, educators, and anyone interested in international education and cultural exchange. International education partners, consulates, and institutional guests are also warmly welcomed.",
      vi: "Sự kiện chào đón tất cả học sinh, sinh viên, các thầy cô giáo và bất kỳ ai quan tâm đến giáo dục quốc tế và giao lưu văn hóa. Các đối tác giáo dục quốc tế, cơ quan lãnh sự và đại biểu các tổ chức cũng được trân trọng kính mời.",
    },
  },
  {
    id: "where-is-the-event",
    question: {
      en: "Where is the event held?",
      vi: "Sự kiện được tổ chức ở đâu?",
    },
    answer: {
      en: "FPT ICO Summit 2026 takes place at FPT University Can Tho Campus, 600 Nguyen Van Cu Noi Dai, An Binh, Can Tho City, Vietnam.",
      vi: "FPT ICO Summit 2026 diễn ra tại Trường Đại học FPT Phân hiệu Cần Thơ, số 600 đường Nguyễn Văn Cừ nối dài, phường An Bình, quận Ninh Kiều, TP. Cần Thơ, Việt Nam.",
    },
  },
  {
    id: "when-registration-open",
    question: {
      en: "When does registration open?",
      vi: "Khi nào cổng đăng ký chính thức mở?",
    },
    answer: {
      en: "Registration is now open! Please click the 'Register Now' button on this page to sign up.",
      vi: "Cổng đăng ký hiện đã chính thức mở! Vui lòng nhấn nút 'Đăng ký ngay' trên trang web này để hoàn tất đăng ký.",
    },
  },
  {
    id: "what-can-students-experience",
    question: {
      en: "What can students experience at the summit?",
      vi: "Sinh viên và học sinh sẽ trải nghiệm những gì tại hội nghị?",
    },
    answer: {
      en: "Students can explore international education opportunities, meet university representatives and consulate officials, attend cross-cultural workshops, take part in cultural village activities, watch live performances, and discover study abroad and scholarship pathways.",
      vi: "Học sinh, sinh viên có thể tìm hiểu các cơ hội du học, gặp gỡ trực tiếp đại diện đại học và cơ quan lãnh sự, tham gia hội thảo giao lưu văn hóa, trải nghiệm không gian làng nghề, xem biểu diễn nghệ thuật và khám phá các lộ trình học bổng.",
    },
  },
  {
    id: "open-to-international",
    question: {
      en: "Is the event open to international partners?",
      vi: "Sự kiện có mở cho các đối tác quốc tế không?",
    },
    answer: {
      en: "Yes. FPT ICO Summit 2026 actively welcomes international universities, education organizations, and consulates as participants. To enquire about partnership or participation, please contact us at FPTUCT.HTQT@fe.edu.vn.",
      vi: "Có. FPT ICO Summit 2026 nồng nhiệt chào đón sự tham gia của các trường đại học, tổ chức giáo dục và cơ quan lãnh sự quốc tế. Để tìm hiểu thêm về hợp tác và tham gia gian hàng, vui lòng liên hệ qua email FPTUCT.HTQT@fe.edu.vn.",
    },
  },
  {
    id: "event-dates",
    question: {
      en: "When will the summit take place?",
      vi: "Sự kiện sẽ diễn ra vào thời gian nào?",
    },
    answer: {
      en: "FPT ICO Summit 2026 runs from 20 to 22 November 2026 at FPT University Can Tho Campus.",
      vi: "FPT ICO Summit 2026 diễn ra từ ngày 20 đến ngày 22 tháng 11 năm 2026 tại Trường Đại học FPT Phân hiệu Cần Thơ.",
    },
  },
];
