/**
 * faq.ts — FAQ entries for FPT ICO Summit 2026.
 *
 * Rules:
 *  - Do not invent answers that have not been confirmed.
 *  - Use controlled placeholder wording where the final answer is not yet available.
 *  - Each item requires both a question and an answer string.
 */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "who-can-attend",
    question: "Who can attend FPT ICO Summit 2026?",
    answer:
      "The summit is designed for high-school and university students, educators, and anyone interested in international education and cultural exchange. International education partners, consulates, and institutional guests are also warmly welcomed.",
  },
  {
    id: "where-is-the-event",
    question: "Where is the event held?",
    answer:
      "FPT ICO Summit 2026 takes place at FPT University Can Tho Campus, 600 Nguyen Van Cu Noi Dai, An Binh, Can Tho City, Vietnam.",
  },
  {
    id: "when-registration-open",
    question: "When does registration open?",
    answer:
      "Registration information will be announced soon. Please check back on this page for updates.",
  },
  {
    id: "what-can-students-experience",
    question: "What can students experience at the summit?",
    answer:
      "Students can explore international education opportunities, meet university representatives and consulate officials, attend cross-cultural workshops, take part in cultural village activities, watch live performances, and discover study abroad and scholarship pathways.",
  },
  {
    id: "open-to-international",
    question: "Is the event open to international partners?",
    answer:
      "Yes. FPT ICO Summit 2026 actively welcomes international universities, education organizations, and consulates as participants. To enquire about partnership or participation, please contact us at FPTUCT.HTQT@fe.edu.vn.",
  },
  {
    id: "event-dates",
    question: "When will the summit take place?",
    answer:
      "FPT ICO Summit 2026 runs from 20 to 22 November 2026 at FPT University Can Tho Campus.",
  },
];
