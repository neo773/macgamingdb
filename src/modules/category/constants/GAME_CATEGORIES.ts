import { type GameCategory } from '@/modules/category/types/GameCategory';

export const GAME_CATEGORIES = {
  m1: {
    metaTitle: 'Mac Games for M1 – Compatibility & FPS Reports',
    metaDescription:
      'Which games run on an M1 Mac? Community FPS reports and compatibility ratings for Native, CrossOver and Parallels on Apple M1.',
    heading: 'Mac Games for the M1',
    subheading: 'Compatibility and FPS reports from M1 owners',
    introduction:
      'The M1 was the first Apple Silicon chip, shipping in late 2020 with an 8-core CPU and a 7 or 8-core GPU. It has no hardware ray tracing and most configurations ship with 8GB or 16GB of unified memory, which is the usual bottleneck in modern titles. Reports below come from people running these games on real M1 hardware.',
    chipset: 'M1',
  },
  m2: {
    metaTitle: 'Mac Games for M2 – Compatibility & FPS Reports',
    metaDescription:
      'Which games run on an M2 Mac? Community FPS reports and compatibility ratings for Native, CrossOver and Parallels on Apple M2.',
    heading: 'Mac Games for the M2',
    subheading: 'Compatibility and FPS reports from M2 owners',
    introduction:
      'The M2 raised GPU core counts and memory bandwidth over the M1 but still has no hardware ray tracing. In practice it lands close to the M1 Pro for gaming, and the Air variants are fanless, so sustained framerates drop under long sessions in a way the Pro and Max chips do not.',
    chipset: 'M2',
  },
  m3: {
    metaTitle: 'Mac Games for M3 – Compatibility & FPS Reports',
    metaDescription:
      'Which games run on an M3 Mac? Community FPS reports and compatibility ratings for Native, CrossOver and Parallels on Apple M3.',
    heading: 'Mac Games for the M3',
    subheading: 'Compatibility and FPS reports from M3 owners',
    introduction:
      'The M3 was the first Apple Silicon generation with hardware-accelerated ray tracing and mesh shading, plus Dynamic Caching for GPU memory. That matters for titles that expose ray tracing options, which previously fell back to software paths or were unavailable entirely.',
    chipset: 'M3',
  },
  m4: {
    metaTitle: 'Mac Games for M4 – Compatibility & FPS Reports',
    metaDescription:
      'Which games run on an M4 Mac? Community FPS reports and compatibility ratings for Native, CrossOver and Parallels on Apple M4.',
    heading: 'Mac Games for the M4',
    subheading: 'Compatibility and FPS reports from M4 owners',
    introduction:
      'The M4 carries a second-generation ray tracing engine and higher memory bandwidth than the M3, and the base Mac mini and MacBook Air configurations now start at 16GB of unified memory. It is currently the most commonly reported chip on this site, so M4 entries tend to have the most data behind them.',
    chipset: 'M4',
  },
  m5: {
    metaTitle: 'Mac Games for M5 – Compatibility & FPS Reports',
    metaDescription:
      'Which games run on an M5 Mac? Community FPS reports and compatibility ratings for Native, CrossOver and Parallels on Apple M5.',
    heading: 'Mac Games for the M5',
    subheading: 'Compatibility and FPS reports from M5 owners',
    introduction:
      'The M5 adds neural accelerators inside each GPU core alongside a third-generation ray tracing engine. It is the newest chip covered here, so report counts are still low — treat single-report entries as a data point rather than a verdict.',
    chipset: 'M5',
  },
  native: {
    metaTitle: 'Native Mac Games – Apple Silicon Builds',
    metaDescription:
      'Games with a real macOS build that run natively on Apple Silicon. No translation layer, no Windows licence, best battery life.',
    heading: 'Native Mac Games',
    subheading: 'Games with a real Apple Silicon build',
    introduction:
      'These games ship an actual macOS build that runs directly on Apple Silicon with no translation layer in between. Native builds generally give the best frame pacing and by far the best battery life on laptops, because nothing is spending cycles translating DirectX calls at runtime.',
    playMethod: 'NATIVE',
  },
  crossover: {
    metaTitle: 'CrossOver Mac Games – Compatibility & FPS',
    metaDescription:
      'Which Windows games work in CrossOver on Mac? Community FPS reports and ratings across D3DMetal, DXVK and DXMT backends.',
    heading: 'CrossOver Mac Games',
    subheading: 'Windows games running through CrossOver',
    introduction:
      'CrossOver is CodeWeavers’ commercial build of Wine. It runs Windows games without a Windows licence and without a virtual machine, translating DirectX calls to Metal through one of several backends — D3DMetal, DXVK or DXMT. Which backend a game needs varies, so the reports below record it per entry rather than assuming one works everywhere.',
    playMethod: 'CROSSOVER',
  },
  parallels: {
    metaTitle: 'Parallels Mac Games – Compatibility & FPS',
    metaDescription:
      'Which games work in Parallels Desktop on Mac? Community FPS reports and compatibility ratings for Windows on ARM gaming.',
    heading: 'Parallels Mac Games',
    subheading: 'Windows games running in Parallels Desktop',
    introduction:
      'Parallels Desktop runs a full Windows 11 on ARM virtual machine, so it needs a Windows licence and gives up some performance to virtualisation overhead. It tends to succeed where CrossOver fails on launchers and anti-cheat, and fail where a game demands GPU features the virtual driver does not expose.',
    playMethod: 'PARALLELS',
  },
  action: {
    metaTitle: 'Best Action Games for Mac – Apple Silicon',
    metaDescription:
      'Action games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Action Games for Mac',
    subheading: 'The largest category in the database',
    introduction:
      'Action games lean hardest on sustained GPU throughput, which is where the gap between a fanless Air and a Pro or Max chip shows up most clearly. Where a game has enough reports, check the chip on each one before trusting the headline rating.',
    genre: 'Action',
  },
  adventure: {
    metaTitle: 'Best Adventure Games for Mac – Apple Silicon',
    metaDescription:
      'Adventure games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Adventure Games for Mac',
    subheading: 'Story-driven games on Apple Silicon',
    introduction:
      'Adventure titles are usually the safest bet on modest hardware — they are rarely framerate-critical, so a base M1 that struggles with shooters often handles them comfortably. Translation-layer bugs here tend to affect cutscenes and video playback rather than raw performance.',
    genre: 'Adventure',
  },
  indie: {
    metaTitle: 'Best Indie Games for Mac – Apple Silicon',
    metaDescription:
      'Indie games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Indie Games for Mac',
    subheading: 'Where native Mac builds are most common',
    introduction:
      'Indie games ship native macOS builds far more often than large studio releases, partly because the engines they use — Godot, Love2D, and Unity in particular — export to Apple Silicon with little extra work. This is the category where you are most likely to avoid a translation layer entirely.',
    genre: 'Indie',
  },
  rpg: {
    metaTitle: 'Best RPGs for Mac – Apple Silicon Performance',
    metaDescription:
      'RPGs that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'RPGs for Mac',
    subheading: 'Long sessions, so thermals matter',
    introduction:
      'RPGs are played in long sessions, which makes sustained performance more important than peak framerate. A fanless MacBook Air can post a good opening benchmark and then throttle an hour in, so pay attention to reports that mention heat or longer play times.',
    genre: 'RPG',
  },
  strategy: {
    metaTitle: 'Best Strategy Games for Mac – Apple Silicon',
    metaDescription:
      'Strategy games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Strategy Games for Mac',
    subheading: 'CPU-bound more often than GPU-bound',
    introduction:
      'Strategy games, especially late-game turns in 4X and grand strategy titles, are usually limited by single-core CPU speed rather than the GPU. That makes them one of the few categories where a base chip can match a Max, and where GPU-focused FPS numbers tell you least.',
    genre: 'Strategy',
  },
  simulation: {
    metaTitle: 'Best Simulation Games for Mac – Apple Silicon',
    metaDescription:
      'Simulation games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Simulation Games for Mac',
    subheading: 'Memory-hungry, so check the RAM on each report',
    introduction:
      'Simulation titles are the category most likely to be limited by unified memory rather than the chip itself. A 16GB machine and an 8GB machine on the same chip can produce very different results here, so the RAM field on each report matters more than usual.',
    genre: 'Simulation',
  },
  casual: {
    metaTitle: 'Best Casual Games for Mac – Apple Silicon',
    metaDescription:
      'Casual games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Casual Games for Mac',
    subheading: 'Runs on anything with an Apple Silicon chip',
    introduction:
      'Casual games are the least demanding category here and almost all of them run acceptably on any Apple Silicon Mac, including the base M1. Where a report flags a problem it is usually a compatibility failure — a launcher or anti-cheat — rather than a performance one.',
    genre: 'Casual',
  },
  racing: {
    metaTitle: 'Best Racing Games for Mac – Apple Silicon',
    metaDescription:
      'Racing games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Racing Games for Mac',
    subheading: 'Frame pacing matters more than average FPS',
    introduction:
      'Racing games are unusually sensitive to frame pacing — a stable 45fps feels better than an average 60fps with stutter, which averages alone will not tell you. Reports that mention stutter or hitching are worth more here than the headline number.',
    genre: 'Racing',
  },
  sports: {
    metaTitle: 'Best Sports Games for Mac – Apple Silicon',
    metaDescription:
      'Sports games that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'Sports Games for Mac',
    subheading: 'Anti-cheat is the usual blocker',
    introduction:
      'Sports games are more often blocked by their online components than by performance. Kernel-level anti-cheat does not work under CrossOver or Parallels, so a title can run perfectly in offline modes and refuse to launch online entirely.',
    genre: 'Sports',
  },
  mmo: {
    metaTitle: 'Best MMOs for Mac – Apple Silicon Performance',
    metaDescription:
      'MMOs that run on Apple Silicon Macs, with community FPS reports for Native, CrossOver and Parallels.',
    heading: 'MMOs for Mac',
    subheading: 'Launchers and anti-cheat decide this category',
    introduction:
      'For MMOs the question is rarely whether the engine runs — it is whether the launcher and anti-cheat will start at all. Many of these games perform fine once running, so a failure report here usually points at the patcher rather than the chip.',
    genre: 'MMO',
  },
} as const satisfies Record<string, GameCategory>;
