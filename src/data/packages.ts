/**
 * packages.ts — Participation packages and benefits registry.
 *
 * AUTHORITATIVE SOURCES:
 * - Summit Benefit Packages (Standard Partner Packages)
 * - Consular Benefit Packages (Consular Packages)
 *
 * STRICT SAFETY RULES:
 * - DO NOT DISPLAY ANY PRICE INFORMATION OR "FREE" LABELS ON THE PUBLIC WEBSITE.
 * - Booth benefit must state: "Each booth is supported by 02 FPT students." / "Mỗi gian hàng được hỗ trợ bởi 02 sinh viên FPT."
 */

import type { LocalizedText } from "@/i18n/types";

export type PackageTierType = "standard" | "consular";

export interface PackageBenefitDetail {
  category: LocalizedText;
  value: LocalizedText;
  isIncluded: boolean;
}

export interface PackageItem {
  id: string;
  name: string;
  tierType: PackageTierType;
  badge?: LocalizedText;
  duration: LocalizedText;
  accessDuration: LocalizedText;
  accentColor: string;
  hotel: LocalizedText;
  booth: LocalizedText | null;
  delegates: LocalizedText;
  tagline: LocalizedText;
  keyHighlights: LocalizedText[];
  allBenefits: PackageBenefitDetail[];
}

export const boothSupportNote: LocalizedText = {
  en: "Each consular booth is supported by 02 FPT student assistants.",
  vi: "Mỗi gian hàng Lãnh sự được hỗ trợ bởi 02 sinh viên FPT.",
};

export const standardPackages: PackageItem[] = [
  {
    id: "summit-signature",
    name: "Summit Signature",
    tierType: "standard",
    badge: {
      en: "Signature Tier",
      vi: "Gói Toàn diện",
    },
    duration: {
      en: "3 Days Access (20–22 Nov)",
      vi: "Tham dự 3 ngày (20–22/11)",
    },
    accessDuration: {
      en: "3-Day Access",
      vi: "Tham dự 3 ngày",
    },
    accentColor: "#F37021",
    hotel: {
      en: "2 representatives · 3 nights (3-star hotel)",
      vi: "2 đại biểu · 3 đêm (Khách sạn 3 sao)",
    },
    booth: {
      en: "Dedicated booth 3 × 3 m",
      vi: "Gian hàng riêng 3 × 3 m",
    },
    delegates: {
      en: "2 official representatives",
      vi: "2 đại biểu chính thức",
    },
    tagline: {
      en: "The most comprehensive participation option for institutions seeking maximum visibility, engagement and partner recognition.",
      vi: "Lựa chọn tham dự toàn diện nhất dành cho các đơn vị hướng đến mức độ nhận diện tối đa, kết nối sâu rộng và vị thế đối tác nổi bật.",
    },
    keyHighlights: [
      { en: "3-day Summit access for 2 representatives", vi: "Tham dự trọn vẹn 3 ngày cho 2 đại biểu" },
      { en: "Hotel accommodation: 2 representatives / 3 nights", vi: "Khách sạn lưu trú: 2 đại biểu / 3 đêm" },
      { en: "Dedicated 3 × 3 m booth", vi: "Gian hàng triển lãm riêng 3 × 3 m" },
      { en: "Opening Ceremony priority seating", vi: "Vị trí ưu tiên tại Lễ Khai mạc" },
      { en: "Mekong Discovery Day: 2 representatives", vi: "Ngày Khám phá Mekong: 2 đại biểu" },
      { en: "Premium Partner recognition", vi: "Định danh Đối tác Cao cấp (Premium Partner)" },
    ],
    allBenefits: [
      {
        category: { en: "Event Access", vi: "Thời lượng tham dự" },
        value: { en: "3 days (20–22 Nov)", vi: "3 ngày (20–22/11)" },
        isIncluded: true,
      },
      {
        category: { en: "3-Star Hotel Experience", vi: "Khách sạn 3 sao" },
        value: { en: "2 representatives / 3 nights", vi: "2 đại biểu / 3 đêm" },
        isIncluded: true,
      },
      {
        category: { en: "Welcome Luncheon", vi: "Tiệc trưa Chào mừng" },
        value: { en: "2 representatives", vi: "2 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Opening Ceremony", vi: "Lễ Khai mạc" },
        value: { en: "2 representatives + priority seating", vi: "2 đại biểu + vị trí ưu tiên" },
        isIncluded: true,
      },
      {
        category: { en: "Technological Exhibition", vi: "Triển lãm Công nghệ" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Cultural Exhibition", vi: "Triển lãm Văn hóa" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "International Networking", vi: "Kết nối Quốc tế" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Brand Recognition", vi: "Mức độ Nhận diện Thương hiệu" },
        value: { en: "Premium Partner", vi: "Đối tác Cao cấp (Premium Partner)" },
        isIncluded: true,
      },
      {
        category: { en: "Mekong Discovery Day", vi: "Ngày Khám phá Mekong" },
        value: { en: "2 representatives", vi: "2 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Farewell Dinner", vi: "Tiệc Giao lưu Chia tay (Dinner)" },
        value: { en: "2 representatives", vi: "2 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop / Session Participation", vi: "Tham gia Hội thảo / Chuyên đề" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop Speakers", vi: "Diễn giả Hội thảo" },
        value: { en: "2 speakers", vi: "2 diễn giả" },
        isIncluded: true,
      },
      {
        category: { en: "Official Event Website", vi: "Website Chính thức" },
        value: { en: "Logo + brand profile + website link / QR", vi: "Logo + hồ sơ thương hiệu + link website / QR" },
        isIncluded: true,
      },
      {
        category: { en: "Partner Wall / On-site Branding", vi: "Partner Wall & Nhận diện Tại chỗ" },
        value: { en: "Premium placement", vi: "Vị trí nổi bật (Premium placement)" },
        isIncluded: true,
      },
      {
        category: { en: "Promotional Video Showcase", vi: "Trình chiếu Video Giới thiệu" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Fanpage Communication", vi: "Truyền thông Fanpage" },
        value: { en: "06 dedicated posts", vi: "06 bài đăng truyền thông riêng" },
        isIncluded: true,
      },
      {
        category: { en: "Website Communication", vi: "Bài viết Website" },
        value: { en: "03 dedicated articles", vi: "03 bài viết riêng trên website chính thức" },
        isIncluded: true,
      },
      {
        category: { en: "Event Recap / Thank-you Communication", vi: "Tri ân & Báo cáo Tổng kết" },
        value: { en: "Featured recognition", vi: "Vinh danh nổi bật" },
        isIncluded: true,
      },
      {
        category: { en: "Exhibition Booth", vi: "Gian hàng Triển lãm" },
        value: { en: "Dedicated booth 3 × 3 m", vi: "Gian hàng riêng 3 × 3 m" },
        isIncluded: true,
      },
      {
        category: { en: "Event Key Visual / Digital Background", vi: "Key Visual & Nền kỹ thuật số" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
      {
        category: { en: "Stage Screen / Event Backdrop", vi: "Màn hình Sân khấu & Backdrop" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
    ],
  },
  {
    id: "summit-connect",
    name: "Summit Connect",
    tierType: "standard",
    badge: {
      en: "Popular",
      vi: "Tiêu chuẩn",
    },
    duration: {
      en: "3 Days Access (20–22 Nov)",
      vi: "Tham dự 3 ngày (20–22/11)",
    },
    accessDuration: {
      en: "3-Day Access",
      vi: "Tham dự 3 ngày",
    },
    accentColor: "#059669",
    hotel: {
      en: "1 representative · 3 nights (3-star hotel)",
      vi: "1 đại biểu · 3 đêm (Khách sạn 3 sao)",
    },
    booth: {
      en: "Shared booth 1.5 × 3 m",
      vi: "Gian hàng chia sẻ 1.5 × 3 m",
    },
    delegates: {
      en: "1 official representative",
      vi: "1 đại biểu chính thức",
    },
    tagline: {
      en: "Ideal for universities and educational institutions seeking dedicated booth presence, speaker participation and full summit engagement.",
      vi: "Lựa chọn phù hợp cho các trường đại học và tổ chức giáo dục muốn có gian hàng triển lãm, diễn giả chuyên đề và trải nghiệm văn hóa trọn vẹn.",
    },
    keyHighlights: [
      { en: "3-day Summit access for 1 representative", vi: "Tham dự trọn vẹn 3 ngày cho 1 đại biểu" },
      { en: "Hotel accommodation: 1 representative / 3 nights", vi: "Khách sạn lưu trú: 1 đại biểu / 3 đêm" },
      { en: "Shared 1.5 × 3 m booth", vi: "Gian hàng chia sẻ 1.5 × 3 m" },
      { en: "Opening Ceremony reserved seating", vi: "Vị trí đặt trước tại Lễ Khai mạc" },
      { en: "Mekong Discovery Day: 1 representative", vi: "Ngày Khám phá Mekong: 1 đại biểu" },
      { en: "Official Partner recognition", vi: "Định danh Đối tác Chính thức (Official Partner)" },
    ],
    allBenefits: [
      {
        category: { en: "Event Access", vi: "Thời lượng tham dự" },
        value: { en: "3 days (20–22 Nov)", vi: "3 ngày (20–22/11)" },
        isIncluded: true,
      },
      {
        category: { en: "3-Star Hotel Experience", vi: "Khách sạn 3 sao" },
        value: { en: "1 representative / 3 nights", vi: "1 đại biểu / 3 đêm" },
        isIncluded: true,
      },
      {
        category: { en: "Welcome Luncheon", vi: "Tiệc trưa Chào mừng" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Opening Ceremony", vi: "Lễ Khai mạc" },
        value: { en: "1 representative + reserved seating", vi: "1 đại biểu + chỗ ngồi đặt trước" },
        isIncluded: true,
      },
      {
        category: { en: "Technological Exhibition", vi: "Triển lãm Công nghệ" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Cultural Exhibition", vi: "Triển lãm Văn hóa" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "International Networking", vi: "Kết nối Quốc tế" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Brand Recognition", vi: "Mức độ Nhận diện Thương hiệu" },
        value: { en: "Official Partner", vi: "Đối tác Chính thức (Official Partner)" },
        isIncluded: true,
      },
      {
        category: { en: "Mekong Discovery Day", vi: "Ngày Khám phá Mekong" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Farewell Dinner", vi: "Tiệc Giao lưu Chia tay (Dinner)" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop / Session Participation", vi: "Tham gia Hội thảo / Chuyên đề" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop Speakers", vi: "Diễn giả Hội thảo" },
        value: { en: "1 speaker", vi: "1 diễn giả" },
        isIncluded: true,
      },
      {
        category: { en: "Official Event Website", vi: "Website Chính thức" },
        value: { en: "Logo + brand name", vi: "Logo + tên thương hiệu" },
        isIncluded: true,
      },
      {
        category: { en: "Partner Wall / On-site Branding", vi: "Partner Wall & Nhận diện Tại chỗ" },
        value: { en: "Standard placement", vi: "Vị trí tiêu chuẩn" },
        isIncluded: true,
      },
      {
        category: { en: "Promotional Video Showcase", vi: "Trình chiếu Video Giới thiệu" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Fanpage Communication", vi: "Truyền thông Fanpage" },
        value: { en: "03 partner recognition posts", vi: "03 bài đăng vinh danh đối tác" },
        isIncluded: true,
      },
      {
        category: { en: "Website Communication", vi: "Bài viết Website" },
        value: { en: "02 dedicated articles", vi: "02 bài viết riêng trên website chính thức" },
        isIncluded: true,
      },
      {
        category: { en: "Event Recap / Thank-you Communication", vi: "Tri ân & Báo cáo Tổng kết" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Exhibition Booth", vi: "Gian hàng Triển lãm" },
        value: { en: "Shared booth 1.5 × 3 m", vi: "Gian hàng chia sẻ 1.5 × 3 m" },
        isIncluded: true,
      },
      {
        category: { en: "Event Key Visual / Digital Background", vi: "Key Visual & Nền kỹ thuật số" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
      {
        category: { en: "Stage Screen / Event Backdrop", vi: "Màn hình Sân khấu & Backdrop" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
    ],
  },
  {
    id: "summit-immersion",
    name: "Summit Immersion",
    tierType: "standard",
    badge: {
      en: "Networking Focus",
      vi: "Giao lưu & Kết nối",
    },
    duration: {
      en: "3 Days Access (20–22 Nov)",
      vi: "Tham dự 3 ngày (20–22/11)",
    },
    accessDuration: {
      en: "3-Day Access",
      vi: "Tham dự 3 ngày",
    },
    accentColor: "#0066CC",
    hotel: {
      en: "1 representative · 3 nights (3-star hotel)",
      vi: "1 đại biểu · 3 đêm (Khách sạn 3 sao)",
    },
    booth: null,
    delegates: {
      en: "1 official representative",
      vi: "1 đại biểu chính thức",
    },
    tagline: {
      en: "Designed for delegates focused on academic exchange, institutional networking, and the Mekong cultural experience.",
      vi: "Dành cho đại biểu tập trung vào trao đổi học thuật, kết nối đối tác và trải nghiệm văn hóa Mekong.",
    },
    keyHighlights: [
      { en: "3-day Summit access for 1 representative", vi: "Tham dự trọn vẹn 3 ngày cho 1 đại biểu" },
      { en: "Hotel accommodation: 1 representative / 3 nights", vi: "Khách sạn lưu trú: 1 đại biểu / 3 đêm" },
      { en: "Welcome Luncheon & Opening Ceremony", vi: "Tiệc trưa Chào mừng & Lễ Khai mạc" },
      { en: "Mekong Discovery Day: 1 representative", vi: "Ngày Khám phá Mekong: 1 đại biểu" },
      { en: "Workshop / session participation", vi: "Tham dự hội thảo & các phiên chuyên đề" },
      { en: "Participating Partner recognition", vi: "Định danh Đối tác Tham dự (Participating Partner)" },
    ],
    allBenefits: [
      {
        category: { en: "Event Access", vi: "Thời lượng tham dự" },
        value: { en: "3 days (20–22 Nov)", vi: "3 ngày (20–22/11)" },
        isIncluded: true,
      },
      {
        category: { en: "3-Star Hotel Experience", vi: "Khách sạn 3 sao" },
        value: { en: "1 representative / 3 nights", vi: "1 đại biểu / 3 đêm" },
        isIncluded: true,
      },
      {
        category: { en: "Welcome Luncheon", vi: "Tiệc trưa Chào mừng" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Opening Ceremony", vi: "Lễ Khai mạc" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Technological Exhibition", vi: "Triển lãm Công nghệ" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Cultural Exhibition", vi: "Triển lãm Văn hóa" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "International Networking", vi: "Kết nối Quốc tế" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Brand Recognition", vi: "Mức độ Nhận diện Thương hiệu" },
        value: { en: "Participating Partner", vi: "Đối tác Tham dự (Participating Partner)" },
        isIncluded: true,
      },
      {
        category: { en: "Mekong Discovery Day", vi: "Ngày Khám phá Mekong" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Farewell Dinner", vi: "Tiệc Giao lưu Chia tay (Dinner)" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop / Session Participation", vi: "Tham gia Hội thảo / Chuyên đề" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop Speakers", vi: "Diễn giả Hội thảo" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Official Event Website", vi: "Website Chính thức" },
        value: { en: "Logo", vi: "Logo" },
        isIncluded: true,
      },
      {
        category: { en: "Partner Wall / On-site Branding", vi: "Partner Wall & Nhận diện Tại chỗ" },
        value: { en: "Standard placement", vi: "Vị trí tiêu chuẩn" },
        isIncluded: true,
      },
      {
        category: { en: "Promotional Video Showcase", vi: "Trình chiếu Video Giới thiệu" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Fanpage Communication", vi: "Truyền thông Fanpage" },
        value: { en: "03 partner recognition posts", vi: "03 bài đăng vinh danh đối tác" },
        isIncluded: true,
      },
      {
        category: { en: "Website Communication", vi: "Bài viết Website" },
        value: { en: "01 dedicated article", vi: "01 bài viết trên website chính thức" },
        isIncluded: true,
      },
      {
        category: { en: "Event Recap / Thank-you Communication", vi: "Tri ân & Báo cáo Tổng kết" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Exhibition Booth", vi: "Gian hàng Triển lãm" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Event Key Visual / Digital Background", vi: "Key Visual & Nền kỹ thuật số" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Stage Screen / Event Backdrop", vi: "Màn hình Sân khấu & Backdrop" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
    ],
  },
  {
    id: "summit-discovery",
    name: "Summit Discovery",
    tierType: "standard",
    badge: {
      en: "Single-Day Access",
      vi: "Tham dự 1 Ngày",
    },
    duration: {
      en: "1 Day Access (20 Nov)",
      vi: "Tham dự 1 ngày (20/11)",
    },
    accessDuration: {
      en: "1-Day Access",
      vi: "Tham dự 1 ngày",
    },
    accentColor: "#38BDF8",
    hotel: {
      en: "1 representative · 1 night (3-star hotel)",
      vi: "1 đại biểu · 1 đêm (Khách sạn 3 sao)",
    },
    booth: null,
    delegates: {
      en: "1 official representative",
      vi: "1 đại biểu chính thức",
    },
    tagline: {
      en: "A focused single-day option covering the Main Summit Day ceremonies, networking luncheon, and international sessions.",
      vi: "Lựa chọn tham dự trọng tâm trong Ngày Hội nghị Chính, bao gồm lễ khai mạc, tiệc trưa chào mừng và các phiên kết nối.",
    },
    keyHighlights: [
      { en: "1-day Main Summit access for 1 representative", vi: "Tham dự Ngày Hội nghị Chính cho 1 đại biểu" },
      { en: "Hotel accommodation: 1 representative / 1 night", vi: "Khách sạn lưu trú: 1 đại biểu / 1 đêm" },
      { en: "Opening Ceremony", vi: "Tham dự Lễ Khai mạc" },
      { en: "Welcome Luncheon", vi: "Tiệc trưa Chào mừng" },
      { en: "International networking", vi: "Kết nối & giao lưu quốc tế" },
      { en: "Workshop / session participation", vi: "Tham dự hội thảo & các phiên chuyên đề" },
    ],
    allBenefits: [
      {
        category: { en: "Event Access", vi: "Thời lượng tham dự" },
        value: { en: "1 day (20 Nov)", vi: "1 ngày (20/11)" },
        isIncluded: true,
      },
      {
        category: { en: "3-Star Hotel Experience", vi: "Khách sạn 3 sao" },
        value: { en: "1 representative / 1 night", vi: "1 đại biểu / 1 đêm" },
        isIncluded: true,
      },
      {
        category: { en: "Welcome Luncheon", vi: "Tiệc trưa Chào mừng" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Opening Ceremony", vi: "Lễ Khai mạc" },
        value: { en: "1 representative", vi: "1 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Technological Exhibition", vi: "Triển lãm Công nghệ" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Cultural Exhibition", vi: "Triển lãm Văn hóa" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "International Networking", vi: "Kết nối Quốc tế" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Brand Recognition", vi: "Mức độ Nhận diện Thương hiệu" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Mekong Discovery Day", vi: "Ngày Khám phá Mekong" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Farewell Dinner", vi: "Tiệc Giao lưu Chia tay (Dinner)" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Workshop / Session Participation", vi: "Tham gia Hội thảo / Chuyên đề" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop Speakers", vi: "Diễn giả Hội thảo" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Official Event Website", vi: "Website Chính thức" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Partner Wall / On-site Branding", vi: "Partner Wall & Nhận diện Tại chỗ" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Promotional Video Showcase", vi: "Trình chiếu Video Giới thiệu" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Fanpage Communication", vi: "Truyền thông Fanpage" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Website Communication", vi: "Bài viết Website" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Event Recap / Thank-you Communication", vi: "Tri ân & Báo cáo Tổng kết" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Exhibition Booth", vi: "Gian hàng Triển lãm" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Event Key Visual / Digital Background", vi: "Key Visual & Nền kỹ thuật số" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Stage Screen / Event Backdrop", vi: "Màn hình Sân khấu & Backdrop" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
    ],
  },
];

export const consularPackages: PackageItem[] = [
  {
    id: "consular-full-access",
    name: "Consular Full Access",
    tierType: "consular",
    badge: {
      en: "3 Days Diplomatic Option",
      vi: "Gói Ngoại giao 3 Ngày",
    },
    duration: {
      en: "3 Days Access (20–22 Nov)",
      vi: "Tham dự 3 ngày (20–22/11)",
    },
    accessDuration: {
      en: "3-Day Access",
      vi: "Tham dự 3 ngày",
    },
    accentColor: "#1E3A8A",
    hotel: {
      en: "2 representatives · 3 nights (3-star hotel)",
      vi: "2 đại biểu · 3 đêm (Khách sạn 3 sao)",
    },
    booth: {
      en: "Special booth 3 × 3 m (Supported by 02 FPT student assistants)",
      vi: "Gian hàng đặc biệt 3 × 3 m (Được hỗ trợ bởi 02 sinh viên FPT)",
    },
    delegates: {
      en: "2 official representatives",
      vi: "2 đại biểu chính thức",
    },
    tagline: {
      en: "A comprehensive diplomatic option offering complete summit attendance, consular exhibition booth, priority protocol, and high-level dialogue.",
      vi: "Chương trình tham dự toàn diện dành cho cơ quan lãnh sự, bao gồm gian hàng ngoại giao, lễ tân ưu tiên và đối thoại cấp cao.",
    },
    keyHighlights: [
      { en: "3-day Summit access for 2 consular representatives", vi: "Tham dự trọn vẹn 3 ngày cho 2 đại biểu lãnh sự" },
      { en: "Hotel accommodation: 2 representatives / 3 nights", vi: "Khách sạn lưu trú: 2 đại biểu / 3 đêm" },
      { en: "Dedicated Consular Booth (3 × 3 m)", vi: "Gian hàng Ngoại giao riêng biệt (3 × 3 m)" },
      { en: "Opening Ceremony priority seating & Welcome Luncheon", vi: "Vị trí ưu tiên Lễ Khai mạc & Tiệc trưa Chào mừng" },
      { en: "Farewell Dinner (2 reps) & Tourism Connection Forum", vi: "Tiệc Giao lưu Chia tay (2 đại biểu) & Diễn đàn Du lịch" },
      { en: "Mekong Discovery Day: 2 representatives", vi: "Ngày Khám phá Mekong: 2 đại biểu" },
    ],
    allBenefits: [
      {
        category: { en: "Event Access", vi: "Thời lượng tham dự" },
        value: { en: "3 days (20–22 Nov)", vi: "3 ngày (20–22/11)" },
        isIncluded: true,
      },
      {
        category: { en: "Special Booth", vi: "Gian hàng Đặc biệt" },
        value: { en: "3 × 3 m (Supported by 02 FPT student assistants)", vi: "3 × 3 m (Hỗ trợ bởi 02 sinh viên FPT)" },
        isIncluded: true,
      },
      {
        category: { en: "3-Star Hotel Experience", vi: "Khách sạn 3 sao" },
        value: { en: "2 representatives / 3 nights", vi: "2 đại biểu / 3 đêm" },
        isIncluded: true,
      },
      {
        category: { en: "Opening Ceremony", vi: "Lễ Khai mạc" },
        value: { en: "2 representatives + priority seating", vi: "2 đại biểu + vị trí ưu tiên" },
        isIncluded: true,
      },
      {
        category: { en: "Welcome Luncheon", vi: "Tiệc trưa Chào mừng" },
        value: { en: "2 representatives", vi: "2 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Farewell Dinner", vi: "Tiệc Giao lưu Chia tay (Dinner)" },
        value: { en: "2 representatives", vi: "2 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Technological Exhibition", vi: "Triển lãm Công nghệ" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Cultural Exhibition", vi: "Triển lãm Văn hóa" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Tourism Connection Forum", vi: "Diễn đàn Kết nối Du lịch" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "International Networking", vi: "Kết nối Quốc tế" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop / Session Participation", vi: "Tham gia Hội thảo / Chuyên đề" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop Speakers", vi: "Diễn giả Hội thảo" },
        value: { en: "3 speakers", vi: "3 diễn giả" },
        isIncluded: true,
      },
      {
        category: { en: "Brand Recognition", vi: "Mức độ Nhận diện" },
        value: { en: "Premium Partner", vi: "Đối tác Cao cấp (Premium Partner)" },
        isIncluded: true,
      },
      {
        category: { en: "Official Event Website", vi: "Website Chính thức" },
        value: { en: "Logo + brand profile + website link", vi: "Logo + hồ sơ cơ quan + liên kết website" },
        isIncluded: true,
      },
      {
        category: { en: "Partner Wall / On-site Branding", vi: "Partner Wall & Nhận diện Tại chỗ" },
        value: { en: "Premium placement", vi: "Vị trí nổi bật (Premium placement)" },
        isIncluded: true,
      },
      {
        category: { en: "Promotional Video Showcase", vi: "Trình chiếu Video Giới thiệu" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Fanpage Communication", vi: "Truyền thông Fanpage" },
        value: { en: "06 dedicated posts", vi: "06 bài đăng truyền thông riêng" },
        isIncluded: true,
      },
      {
        category: { en: "Website Communication", vi: "Bài viết Website" },
        value: { en: "03 dedicated articles", vi: "03 bài viết riêng trên website chính thức" },
        isIncluded: true,
      },
      {
        category: { en: "Event Recap / Thank-you Communication", vi: "Tri ân & Báo cáo Tổng kết" },
        value: { en: "Featured recognition", vi: "Vinh danh nổi bật" },
        isIncluded: true,
      },
      {
        category: { en: "Event Key Visual / Digital Background", vi: "Key Visual & Nền kỹ thuật số" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
      {
        category: { en: "Stage Screen / Event Backdrop", vi: "Màn hình Sân khấu & Backdrop" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
    ],
  },
  {
    id: "consular-access",
    name: "Consular Access",
    tierType: "consular",
    badge: {
      en: "1 Day Diplomatic Option",
      vi: "Gói Ngoại giao 1 Ngày",
    },
    duration: {
      en: "1 Day Access (20 Nov)",
      vi: "Tham dự 1 ngày (20/11)",
    },
    accessDuration: {
      en: "1-Day Access",
      vi: "Tham dự 1 ngày",
    },
    accentColor: "#0369A1",
    hotel: {
      en: "2 representatives · 1 night (3-star hotel)",
      vi: "2 đại biểu · 1 đêm (Khách sạn 3 sao)",
    },
    booth: {
      en: "Special booth 3 × 3 m (Supported by 02 FPT student assistants)",
      vi: "Gian hàng đặc biệt 3 × 3 m (Được hỗ trợ bởi 02 sinh viên FPT)",
    },
    delegates: {
      en: "2 official representatives",
      vi: "2 đại biểu chính thức",
    },
    tagline: {
      en: "A tailored single-day option focusing on the Main Summit Day opening ceremonies, consular exhibition, and high-level meetings.",
      vi: "Gói tham dự tập trung trong Ngày Hội nghị Chính với lễ khai mạc trọng thể, gian hàng ngoại giao và các phiên làm việc cấp cao.",
    },
    keyHighlights: [
      { en: "1-day Main Summit access for 2 consular representatives", vi: "Tham dự Ngày Hội nghị Chính cho 2 đại biểu lãnh sự" },
      { en: "Hotel accommodation: 2 representatives / 1 night", vi: "Khách sạn lưu trú: 2 đại biểu / 1 đêm" },
      { en: "Dedicated Consular Booth (3 × 3 m)", vi: "Gian hàng Ngoại giao riêng biệt (3 × 3 m)" },
      { en: "Opening Ceremony priority seating & Welcome Luncheon", vi: "Vị trí ưu tiên Lễ Khai mạc & Tiệc trưa Chào mừng" },
      { en: "High-level bilateral meetings & networking", vi: "Đối thoại cấp cao & kết nối hợp tác" },
      { en: "Tourism Connection Forum access", vi: "Tham dự Diễn đàn Kết nối Du lịch" },
    ],
    allBenefits: [
      {
        category: { en: "Event Access", vi: "Thời lượng tham dự" },
        value: { en: "1 day (20 Nov)", vi: "1 ngày (20/11)" },
        isIncluded: true,
      },
      {
        category: { en: "Special Booth", vi: "Gian hàng Đặc biệt" },
        value: { en: "3 × 3 m (Supported by 02 FPT student assistants)", vi: "3 × 3 m (Hỗ trợ bởi 02 sinh viên FPT)" },
        isIncluded: true,
      },
      {
        category: { en: "3-Star Hotel Experience", vi: "Khách sạn 3 sao" },
        value: { en: "2 representatives / 1 night", vi: "2 đại biểu / 1 đêm" },
        isIncluded: true,
      },
      {
        category: { en: "Opening Ceremony", vi: "Lễ Khai mạc" },
        value: { en: "2 representatives + priority seating", vi: "2 đại biểu + vị trí ưu tiên" },
        isIncluded: true,
      },
      {
        category: { en: "Welcome Luncheon", vi: "Tiệc trưa Chào mừng" },
        value: { en: "2 representatives", vi: "2 đại biểu" },
        isIncluded: true,
      },
      {
        category: { en: "Farewell Dinner", vi: "Tiệc Giao lưu Chia tay (Dinner)" },
        value: { en: "Not included", vi: "Không bao gồm" },
        isIncluded: false,
      },
      {
        category: { en: "Technological Exhibition", vi: "Triển lãm Công nghệ" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Cultural Exhibition", vi: "Triển lãm Văn hóa" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Tourism Connection Forum", vi: "Diễn đàn Kết nối Du lịch" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "International Networking", vi: "Kết nối Quốc tế" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop / Session Participation", vi: "Tham gia Hội thảo / Chuyên đề" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Workshop Speakers", vi: "Diễn giả Hội thảo" },
        value: { en: "3 speakers", vi: "3 diễn giả" },
        isIncluded: true,
      },
      {
        category: { en: "Brand Recognition", vi: "Mức độ Nhận diện" },
        value: { en: "Premium Partner", vi: "Đối tác Cao cấp (Premium Partner)" },
        isIncluded: true,
      },
      {
        category: { en: "Official Event Website", vi: "Website Chính thức" },
        value: { en: "Logo + brand profile + website link", vi: "Logo + hồ sơ cơ quan + liên kết website" },
        isIncluded: true,
      },
      {
        category: { en: "Partner Wall / On-site Branding", vi: "Partner Wall & Nhận diện Tại chỗ" },
        value: { en: "Premium placement", vi: "Vị trí nổi bật (Premium placement)" },
        isIncluded: true,
      },
      {
        category: { en: "Promotional Video Showcase", vi: "Trình chiếu Video Giới thiệu" },
        value: { en: "Included", vi: "Bao gồm" },
        isIncluded: true,
      },
      {
        category: { en: "Fanpage Communication", vi: "Truyền thông Fanpage" },
        value: { en: "06 dedicated posts", vi: "06 bài đăng truyền thông riêng" },
        isIncluded: true,
      },
      {
        category: { en: "Website Communication", vi: "Bài viết Website" },
        value: { en: "03 dedicated articles", vi: "03 bài viết riêng trên website chính thức" },
        isIncluded: true,
      },
      {
        category: { en: "Event Recap / Thank-you Communication", vi: "Tri ân & Báo cáo Tổng kết" },
        value: { en: "Featured recognition", vi: "Vinh danh nổi bật" },
        isIncluded: true,
      },
      {
        category: { en: "Event Key Visual / Digital Background", vi: "Key Visual & Nền kỹ thuật số" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
      {
        category: { en: "Stage Screen / Event Backdrop", vi: "Màn hình Sân khấu & Backdrop" },
        value: { en: "Logo featured", vi: "Xuất hiện Logo" },
        isIncluded: true,
      },
    ],
  },
];
