/**
 * src/lib/config/performance-scopes.ts
 *
 * Centralized Stage Performance Scope taxonomy for FPT ICO Summit 2026.
 */

export type PerformanceScopeId =
  | "TRADITIONAL_CULTURAL_HERITAGE"
  | "DANCE_MOVEMENT"
  | "MUSIC_INSTRUMENTAL"
  | "VOCAL_MUSICAL_SHOWCASE"
  | "CULTURAL_COSTUME_FASHION"
  | "CROSS_CULTURAL_CREATIVE_FUSION";

export interface PerformanceScopeDefinition {
  id: PerformanceScopeId;
  name: {
    en: string;
    vi: string;
  };
  description: {
    en: string;
    vi: string;
  };
  suitableFor: {
    en: string;
    vi: string;
  };
  examples: {
    en: string;
    vi: string;
  };
}

export const PERFORMANCE_SCOPES: PerformanceScopeDefinition[] = [
  {
    id: "TRADITIONAL_CULTURAL_HERITAGE",
    name: {
      en: "Traditional & Cultural Heritage",
      vi: "Di sản Văn hóa & Truyền thống",
    },
    description: {
      en: "Authentic traditional folk performances, cultural storytelling, and heritage showcases.",
      vi: "Biểu diễn dân gian truyền thống, kể chuyện văn hóa và trình diễn di sản đặc sắc.",
    },
    suitableFor: {
      en: "Universities, Consulates, Cultural Delegations, International Student Groups",
      vi: "Trường Đại học, Lãnh sự quán, Đoàn đại biểu văn hóa, Nhóm sinh viên quốc tế",
    },
    examples: {
      en: "Traditional folk dance, heritage music, martial arts demonstration, cultural ritual showcase",
      vi: "Múa dân gian truyền thống, âm nhạc di sản, biểu diễn võ thuật, nghi thức văn hóa",
    },
  },
  {
    id: "DANCE_MOVEMENT",
    name: {
      en: "Dance & Movement",
      vi: "Múa & Vũ đạo sáng tạo",
    },
    description: {
      en: "Choreographed dance routines, modern movement, traditional-modern fusion dance.",
      vi: "Vũ đạo dàn dựng, nhảy hiện đại, múa đương đại hoặc kết hợp truyền thống - hiện đại.",
    },
    suitableFor: {
      en: "Student Clubs, University Dance Troupes, Youth Cultural Ambassadors",
      vi: "CLB sinh viên, Đội múa Đại học, Đại sứ văn hóa trẻ",
    },
    examples: {
      en: "Contemporary dance, traditional fan/umbrella dance, hip-hop fusion, group choreography",
      vi: "Múa đương đại, múa nón/quạt truyền thống, nhảy hip-hop kết hợp, vũ đạo nhóm",
    },
  },
  {
    id: "MUSIC_INSTRUMENTAL",
    name: {
      en: "Music & Instrumental",
      vi: "Âm nhạc & Hòa tấu Nhạc cụ",
    },
    description: {
      en: "Live musical instrument performances, traditional/modern ensembles, solo instrumentalists.",
      vi: "Trình diễn nhạc cụ trực tiếp, hòa tấu truyền thống/hiện đại, độc tấu nhạc cụ.",
    },
    suitableFor: {
      en: "Music Orchestras, Instrumental Ensembles, Solo Performers",
      vi: "Dàn nhạc, Nhóm hòa tấu nhạc cụ, Nghệ sĩ độc tấu",
    },
    examples: {
      en: "Traditional zither/flute ensemble, acoustic guitar duo, violin-piano duet, percussion performance",
      vi: "Hòa tấu đàn tranh/sáo trúc, song tấu guitar, violin-piano, trình diễn gõ dân gian",
    },
  },
  {
    id: "VOCAL_MUSICAL_SHOWCASE",
    name: {
      en: "Vocal & Musical Showcase",
      vi: "Hát & Trình diễn Thanh nhạc",
    },
    description: {
      en: "Solo/duet/choir singing performances representing national, international, or youth music themes.",
      vi: "Hát đơn ca, song ca, hợp xướng thể hiện âm nhạc dân tộc, quốc tế hoặc tuổi trẻ.",
    },
    suitableFor: {
      en: "Choirs, Vocal Bands, Student Singers, Cultural Ambassadors",
      vi: "Dàn hợp xướng, Ban nhạc vocal, Sinh viên ca hát, Đại sứ văn hóa",
    },
    examples: {
      en: "National anthem/cultural song, international pop cover, choir medley, vocal harmony show",
      vi: "Làn điệu dân ca/bài hát văn hóa, bản cover quốc tế, liên khúc hợp xướng, hòa thanh",
    },
  },
  {
    id: "CULTURAL_COSTUME_FASHION",
    name: {
      en: "Cultural Costume & Fashion",
      vi: "Trình diễn Trang phục & Thời trang Văn hóa",
    },
    description: {
      en: "Parade or stage catwalk featuring national costumes, traditional attire, or eco-cultural fashion.",
      vi: "Trình diễn catwalk hoặc diễu hành trang phục dân tộc, trang phục truyền thống và thời trang văn hóa.",
    },
    suitableFor: {
      en: "International Student Delegations, Fashion Clubs, Cultural Envoys",
      vi: "Đoàn sinh viên quốc tế, CLB Thời trang, Đại sứ văn hóa",
    },
    examples: {
      en: "Traditional national dress parade (Ao Dai, Hanbok, Kimono, Sari), fusion fashion show",
      vi: "Trình diễn trang phục dân tộc (Áo dài, Hanbok, Kimono, Sari), thời trang giao thoa",
    },
  },
  {
    id: "CROSS_CULTURAL_CREATIVE_FUSION",
    name: {
      en: "Cross-cultural / Creative Fusion",
      vi: "Giao thoa Văn hóa & Sáng tạo Đa phương tiện",
    },
    description: {
      en: "Innovative acts blending East-West elements, drama, musical theater, or multi-art fusion.",
      vi: "Tiết mục sáng tạo kết hợp Đông - Tây, kịch nghệ, nhạc kịch hoặc nghệ thuật đa phương tiện.",
    },
    suitableFor: {
      en: "Creative Arts Societies, Drama Clubs, Collaborative Multi-University Teams",
      vi: "Hội nghệ thuật sáng tạo, CLB Kịch, Nhóm hợp tác liên trường",
    },
    examples: {
      en: "Short musical skit, East-West music collaboration, interactive cultural storytelling show",
      vi: "Vở kịch ngắn âm nhạc, hợp tác âm nhạc Đông - Tây, kịch tương tác văn hóa",
    },
  },
];

export function getPerformanceScopeById(scopeId?: string): PerformanceScopeDefinition | undefined {
  if (!scopeId) return undefined;
  return PERFORMANCE_SCOPES.find((s) => s.id === scopeId);
}
