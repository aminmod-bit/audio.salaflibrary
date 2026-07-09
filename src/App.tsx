import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Bookmark,
  Heart,
  Clock,
  Search,
  Library as LibraryIcon,
  User,
  Home as HomeIcon,
  Menu,
  X,
  ChevronRight,
  Plus,
  Trash2,
  ListMusic,
  Globe,
  Palette,
  Check,
  Activity,
  ChevronLeft,
  Settings,
} from "lucide-react";
import {
  SCHOLARS,
  BOOKS,
  LECTURES,
  THEMES,
  i18n,
  Lecture,
} from "./data";
import AdminPage from "./pages/AdminPage";
import "./App.css";

/* === COMPONENT: CURSOR GLOW === */
const CursorGlow: React.FC = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="cursor-glow"
      style={
        {
          "--x": `${coords.x}px`,
          "--y": `${coords.y}px`,
        } as React.CSSProperties
      }
    />
  );
};

/* === COMPONENT: NATURE BACKGROUND === */
const NatureBackground: React.FC<{ theme: string }> = ({ theme }) => {
  const [particles, setParticles] = useState<
    Array<{ id: number; left: string; size: string; delay: string; duration: string; isLeaf: boolean }>
  >([]);

  useEffect(() => {
    // Generate organic floating particles
    const list = Array.from({ length: theme === "nature" ? 25 : 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 8 + 4}px`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 10 + 8}s`,
      isLeaf: theme === "nature" && Math.random() > 0.4,
    }));
    setParticles(list);
  }, [theme]);

  return (
    <div className="nature-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`nature-particle ${p.isLeaf ? "leaf" : ""}`}
          style={{
            left: p.left,
            width: p.isLeaf ? undefined : p.size,
            height: p.isLeaf ? undefined : p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
};

/* === COMPONENT: TILT SPOTLIGHT CARD === */
interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TiltSpotlightCard: React.FC<TiltCardProps> = ({ children, className = "", ...props }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    // Only apply hover tilt on devices that support hover
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation angles
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8; // max 8 degrees
    const rotateY = ((x - centerX) / centerX) * 8; // max 8 degrees

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card smooth-transition hover-effect ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

export default function App() {
  // --- CONFIGURATION STATE ---
  const [lang, setLang] = useState<"ru" | "en" | "tg">(
    () => (localStorage.getItem("salaf_lang") as "ru" | "en" | "tg") || "ru"
  );
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem("salaf_theme") || "dark-green"
  );

  // --- NAVIGATION STATE ---
  const [currentTab, setCurrentTab] = useState<
    "home" | "search" | "library" | "favorites" | "profile" | "admin"
  >("home");
  const [selectedScholarId, setSelectedScholarId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // --- APP STATE DATA ---
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    const saved = localStorage.getItem("salaf_custom_lectures");
    return saved ? JSON.parse(saved) : LECTURES;
  });

  const [likes, setLikes] = useState<string[]>(() => {
    const saved = localStorage.getItem("salaf_likes");
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem("salaf_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  const [listenLater, setListenLater] = useState<string[]>(() => {
    const saved = localStorage.getItem("salaf_listenLater");
    return saved ? JSON.parse(saved) : [];
  });

  // --- AUDIO PLAYER STATE ---
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(() => {
    const saved = localStorage.getItem("salaf_current_lecture");
    return saved ? JSON.parse(saved) : null;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<Lecture[]>(() => {
    const saved = localStorage.getItem("salaf_queue");
    return saved ? JSON.parse(saved) : [];
  });

  // A-B Repeat loop state
  const [abPointA, setAbPointA] = useState<number | null>(null);
  const [abPointB, setAbPointB] = useState<number | null>(null);
  const [isAbActive, setIsAbActive] = useState<boolean>(false);

  // Responsive mobile states
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Admin states
  const [adminTitleRu, setAdminTitleRu] = useState("");
  const [adminTitleEn, setAdminTitleEn] = useState("");
  const [adminTitleTg, setAdminTitleTg] = useState("");
  const [adminAudioUrl, setAdminAudioUrl] = useState("");
  const [adminDuration, setAdminDuration] = useState<number>(300);
  const [adminScholarId, setAdminScholarId] = useState(SCHOLARS[0].id);
  const [adminBookId, setAdminBookId] = useState(BOOKS[0].id);

  // Audio HTML reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem("salaf_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("salaf_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("salaf_likes", JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem("salaf_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("salaf_listenLater", JSON.stringify(listenLater));
  }, [listenLater]);

  useEffect(() => {
    localStorage.setItem("salaf_custom_lectures", JSON.stringify(lectures));
  }, [lectures]);

  useEffect(() => {
    localStorage.setItem("salaf_queue", JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    if (currentLecture) {
      localStorage.setItem("salaf_current_lecture", JSON.stringify(currentLecture));
    } else {
      localStorage.removeItem("salaf_current_lecture");
    }
  }, [currentLecture]);

  // Audio HTML effect
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => {
        setProgress(audio.currentTime);

        // A-B Repeat checks
        if (isAbActive && abPointA !== null && abPointB !== null) {
          if (audio.currentTime >= abPointB) {
            audio.currentTime = abPointA;
          }
        }
      });

      audio.addEventListener("ended", () => {
        handleNext();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [queue, isAbActive, abPointA, abPointB]);

  // Sync Lecture Source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentLecture) {
      const prevSrc = audio.src;
      if (prevSrc !== currentLecture.audioUrl) {
        audio.src = currentLecture.audioUrl;
        audio.load();
      }

      if (isPlaying) {
        audio.play().catch((err) => console.log("Audio play error:", err));
      }
    } else {
      audio.pause();
    }
  }, [currentLecture]);

  // Sync IsPlaying state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentLecture) {
      audio.play().catch((err) => {
        console.log("Audio play error:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync volume/mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // --- CONTROLLER HANDLERS ---
  const handlePlayPause = () => {
    if (!currentLecture) {
      // Pick first lecture if none selected
      const first = lectures[0];
      if (first) {
        setCurrentLecture(first);
        setIsPlaying(true);
      }
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const selectAndPlay = (lecture: Lecture) => {
    setCurrentLecture(lecture);
    setIsPlaying(true);
  };

  const addToQueue = (lecture: Lecture) => {
    if (queue.some((item) => item.id === lecture.id)) return;
    setQueue([...queue, lecture]);
  };



  const removeFromQueue = (id: string) => {
    setQueue(queue.filter((item) => item.id !== id));
  };

  const toggleLike = (lectureId: string) => {
    if (likes.includes(lectureId)) {
      setLikes(likes.filter((id) => id !== lectureId));
    } else {
      setLikes([...likes, lectureId]);
    }
  };

  const toggleBookmark = (lectureId: string) => {
    if (bookmarks.includes(lectureId)) {
      setBookmarks(bookmarks.filter((id) => id !== lectureId));
    } else {
      setBookmarks([...bookmarks, lectureId]);
    }
  };

  const toggleListenLater = (lectureId: string) => {
    if (listenLater.includes(lectureId)) {
      setListenLater(listenLater.filter((id) => id !== lectureId));
    } else {
      setListenLater([...listenLater, lectureId]);
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextItem = queue[0];
      setQueue(queue.slice(1));
      setCurrentLecture(nextItem);
      setIsPlaying(true);
    } else {
      // Loop or go to next lecture in list
      if (currentLecture) {
        const idx = lectures.findIndex((l) => l.id === currentLecture.id);
        if (idx !== -1 && idx < lectures.length - 1) {
          setCurrentLecture(lectures[idx + 1]);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
          setProgress(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentLecture) {
      const idx = lectures.findIndex((l) => l.id === currentLecture.id);
      if (idx > 0) {
        setCurrentLecture(lectures[idx - 1]);
        setIsPlaying(true);
      } else {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          setProgress(0);
        }
      }
    }
  };

  // Speed selections
  const speeds = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];

  // A-B Repeat methods
  const handleSetA = () => {
    setAbPointA(progress);
    if (abPointB !== null && progress >= abPointB) {
      setAbPointB(null);
      setIsAbActive(false);
    }
  };

  const handleSetB = () => {
    if (abPointA === null) return;
    if (progress <= abPointA) return;
    setAbPointB(progress);
    setIsAbActive(true);
  };

  const handleClearAB = () => {
    setAbPointA(null);
    setAbPointB(null);
    setIsAbActive(false);
  };

  // Helper formatting for duration
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // i18n helper
  const t = (key: keyof typeof i18n.ru) => {
    return i18n[lang][key] || i18n.ru[key];
  };

  // Get active text based on selected language
  const getLocalized = (obj: any) => {
    if (!obj) return "";
    return obj[lang] || obj["ru"] || "";
  };

  // Handle addition of standard lectures
  const handleAddAdminLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitleRu || !adminAudioUrl) return;

    const scholar = SCHOLARS.find((s) => s.id === adminScholarId);
    const book = BOOKS.find((b) => b.id === adminBookId);

    const newLect: Lecture = {
      id: `custom-${Date.now()}`,
      title: {
        ru: adminTitleRu,
        en: adminTitleEn || adminTitleRu,
        tg: adminTitleTg || adminTitleRu,
      },
      audioUrl: adminAudioUrl,
      duration: adminDuration,
      scholarId: adminScholarId,
      scholarName: {
        ru: scholar?.name.ru || "",
        en: scholar?.name.en || "",
        tg: scholar?.name.tg || "",
      },
      bookId: adminBookId,
      bookName: {
        ru: book?.title.ru || "",
        en: book?.title.en || "",
        tg: book?.title.tg || "",
      },
      likesCount: 0,
    };

    setLectures([...lectures, newLect]);

    // reset forms
    setAdminTitleRu("");
    setAdminTitleEn("");
    setAdminTitleTg("");
    setAdminAudioUrl("");
    setAdminDuration(300);
  };

  const handleDeleteLecture = (id: string) => {
    setLectures(lectures.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen relative flex flex-col transition-colors duration-300">
      {/* Visual Enhancers */}
      <CursorGlow />
      <NatureBackground theme={theme} />

      {/* MOBILE DRAWER */}
      {isDrawerOpen && (
        <div
          className="drawer-backdrop animate-fade-in"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 relative">
        {/* SIDEBAR */}
        <aside className={`sidebar smooth-transition ${isDrawerOpen ? "open" : ""}`}>
          {/* Sidebar Header */}
          <div className="h-14 flex items-center justify-between px-6 border-b border-[var(--color-border)]">
            <span className="font-semibold text-lg tracking-wider text-[var(--color-accent)] uppercase">
              {t("title")}
            </span>
            <button
              className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
              onClick={() => setIsDrawerOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => {
                setCurrentTab("home");
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium transition duration-200 ${
                currentTab === "home"
                  ? "bg-[var(--color-accent)] text-black"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <HomeIcon size={19} />
              <span className="text-[15px]">{t("home")}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("search");
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium transition duration-200 ${
                currentTab === "search"
                  ? "bg-[var(--color-accent)] text-black"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Search size={19} />
              <span className="text-[15px]">{t("search")}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("library");
                setSelectedScholarId(null);
                setSelectedBookId(null);
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium transition duration-200 ${
                currentTab === "library"
                  ? "bg-[var(--color-accent)] text-black"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <LibraryIcon size={19} />
              <span className="text-[15px]">{t("library")}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("favorites");
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium transition duration-200 ${
                currentTab === "favorites"
                  ? "bg-[var(--color-accent)] text-black"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Heart size={19} />
              <span className="text-[15px]">{t("favorites")}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("profile");
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium transition duration-200 ${
                currentTab === "profile"
                  ? "bg-[var(--color-accent)] text-black"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <User size={19} />
              <span className="text-[15px]">{t("profile")}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("admin");
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left font-medium transition duration-200 ${
                currentTab === "admin"
                  ? "bg-[var(--color-accent)] text-black"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Settings size={19} />
              <span className="text-[15px]">{t("admin")}</span>
            </button>
          </nav>

          {/* Languages and Theme Selector in Sidebar on Mobile */}
          <div className="p-4 border-t border-[var(--color-border)] space-y-3 block md:hidden bg-[var(--color-card)]">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <Globe size={14} />
              <span>{t("language")}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["ru", "en", "tg"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`py-1.5 text-xs font-semibold rounded-lg text-center transition ${
                    lang === l
                      ? "bg-[var(--color-accent)] text-black"
                      : "bg-white/5 text-[var(--color-text-secondary)] hover:text-white"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] pt-1">
              <Palette size={14} />
              <span>{t("theme")}</span>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-white/5 border border-[var(--color-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--color-text-primary)] outline-none"
            >
              {THEMES.map((th) => (
                <option key={th.id} value={th.id} className="bg-[var(--color-bg)]">
                  {getLocalized(th.name)}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* HEADER */}
        <header className="app-header smooth-transition">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex items-center justify-center text-[var(--color-text-primary)] p-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <Menu size={24} />
            </button>

            <span className="md:hidden font-bold text-[17px] tracking-wide text-[var(--color-accent)]">
              {t("title")}
            </span>
            <span className="hidden md:inline font-medium text-[15px] text-[var(--color-text-secondary)]">
              {t("tagline")}
            </span>
          </div>

          {/* Desktop Lang & Theme Toggles */}
          <div className="hidden md:flex items-center gap-4">
            {/* Lang dropdown */}
            <div className="flex items-center gap-1 bg-white/5 border border-[var(--color-border)] rounded-xl p-0.5">
              {(["ru", "en", "tg"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    lang === l
                      ? "bg-[var(--color-accent)] text-black"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-[var(--color-text-secondary)]" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-white/5 border border-[var(--color-border)] rounded-xl py-1.5 px-3 text-xs font-medium text-[var(--color-text-primary)] outline-none hover:border-[var(--color-accent)] transition cursor-pointer"
              >
                {THEMES.map((th) => (
                  <option key={th.id} value={th.id} className="bg-[var(--color-bg)] text-[var(--color-text-primary)]">
                    {getLocalized(th.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="main-content smooth-transition flex-1">
          <div className="app-container py-6">
            {/* TAB CONTENT: HOME */}
            {currentTab === "home" && (
              <div className="space-y-8 animate-fade-in">
                {/* HERO BLOCK */}
                <div className="relative rounded-3xl overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-10 rounded-bl-full pointer-events-none" />
                  <h1 className="text-[var(--color-text-primary)] tracking-tight mb-2">
                    {t("title")}
                  </h1>
                  <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-2xl leading-relaxed">
                    {t("tagline")}
                  </p>

                  {/* STATS ROW */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--color-border)]">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <div className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-1">
                        {t("statsLectures")}
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-[var(--color-accent)]">
                        {lectures.length}
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <div className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-1">
                        {t("statsDuration")}
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-[var(--color-accent)]">
                        {formatTime(lectures.reduce((acc, curr) => acc + curr.duration, 0))}
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <div className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-1">
                        {t("statsScholars")}
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-[var(--color-accent)]">
                        {SCHOLARS.length}
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <div className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-1">
                        {t("statsBooks")}
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-[var(--color-accent)]">
                        {BOOKS.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FEATURED / RECOMMENDATIONS */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[var(--color-text-primary)] font-bold flex items-center gap-2">
                      <Activity className="text-[var(--color-accent)]" size={20} />
                      {t("featured")}
                    </h2>
                  </div>

                  {/* HORIZONTAL SCROLL CAROUSEL */}
                  <div className="horizontal-carousel">
                    {lectures
                      .filter((l) => l.isFeatured)
                      .map((lecture) => {
                        const isCurrent = currentLecture?.id === lecture.id;
                        return (
                          <div key={lecture.id} className="carousel-card">
                            <TiltSpotlightCard className="h-full flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <span className="text-[10px] bg-white/10 text-[var(--color-accent)] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                    {getLocalized(lecture.scholarName)}
                                  </span>
                                  <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTime(lecture.duration)}
                                  </span>
                                </div>
                                <h3 className="card-title text-[var(--color-text-primary)] mb-2 line-clamp-2">
                                  {getLocalized(lecture.title)}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 mb-4">
                                  {getLocalized(lecture.bookName)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
                                <button
                                  onClick={() => selectAndPlay(lecture)}
                                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                                    isCurrent && isPlaying
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)]"
                                  }`}
                                >
                                  {isCurrent && isPlaying ? (
                                    <>
                                      <Pause size={14} />
                                      {t("paused")}
                                    </>
                                  ) : (
                                    <>
                                      <Play size={14} />
                                      Play
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => toggleLike(lecture.id)}
                                  className={`p-2 rounded-xl border border-white/5 transition ${
                                    likes.includes(lecture.id)
                                      ? "text-red-500 bg-red-500/10"
                                      : "text-[var(--color-text-secondary)] hover:text-white"
                                  }`}
                                >
                                  <Heart size={16} fill={likes.includes(lecture.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={() => toggleBookmark(lecture.id)}
                                  className={`p-2 rounded-xl border border-white/5 transition ${
                                    bookmarks.includes(lecture.id)
                                      ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                      : "text-[var(--color-text-secondary)] hover:text-white"
                                  }`}
                                >
                                  <Bookmark size={16} fill={bookmarks.includes(lecture.id) ? "currentColor" : "none"} />
                                </button>
                              </div>
                            </TiltSpotlightCard>
                          </div>
                        );
                      })}
                  </div>
                </section>

                {/* RECENTS AND SCHOLARS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* RECENT LECTURES */}
                  <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-[var(--color-text-primary)] font-bold">{t("allLectures")}</h2>
                    <div className="space-y-3">
                      {lectures.slice(0, 5).map((lecture) => {
                        const isCurrent = currentLecture?.id === lecture.id;
                        return (
                          <div
                            key={lecture.id}
                            className={`p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                              isCurrent ? "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]" : ""
                            }`}
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[var(--color-accent)] font-semibold uppercase tracking-wider">
                                  {getLocalized(lecture.scholarName)}
                                </span>
                                <span className="text-white/20 text-xs">•</span>
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                  {getLocalized(lecture.bookName)}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                {getLocalized(lecture.title)}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2.5 self-end sm:self-center">
                              <span className="text-xs text-[var(--color-text-secondary)] mr-2 flex items-center gap-1">
                                <Clock size={12} />
                                {formatTime(lecture.duration)}
                              </span>
                              <button
                                onClick={() => selectAndPlay(lecture)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                                  isCurrent && isPlaying
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)]"
                                }`}
                              >
                                {isCurrent && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                              </button>
                              <button
                                onClick={() => addToQueue(lecture)}
                                className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white transition"
                                title="Add to Queue"
                              >
                                <ListMusic size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* QUICK ACCESS SCHOLARS */}
                  <div className="space-y-4">
                    <h2 className="text-[var(--color-text-primary)] font-bold">{t("scholars")}</h2>
                    <div className="space-y-3">
                      {SCHOLARS.map((scholar) => (
                        <div
                          key={scholar.id}
                          onClick={() => {
                            setSelectedScholarId(scholar.id);
                            setCurrentTab("library");
                          }}
                          className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] flex items-center gap-3.5 hover:border-[var(--color-accent)] transition cursor-pointer"
                        >
                          <img
                            src={scholar.image}
                            alt={getLocalized(scholar.name)}
                            className="w-11 h-11 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                              {getLocalized(scholar.name)}
                            </h3>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">
                              {getLocalized(scholar.bio)}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SEARCH */}
            {currentTab === "search" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h1 className="text-[var(--color-text-primary)]">{t("search")}</h1>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t("searchPlaceholder")}</p>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-[var(--color-text-secondary)]" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl py-3 pl-12 pr-4 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] smooth-transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-3 text-[var(--color-text-secondary)] hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* CATEGORY CHIPS WITH SCROLL SNAP */}
                <div className="chips-scroll scroll-snap-x">
                  {[
                    { id: "all", label: { ru: "Все лекции", en: "All Lectures", tg: "Ҳамаи дарсҳо" } },
                    { id: "albani", label: { ru: "Шейх Аль-Албани", en: "Sheikh Al-Albani", tg: "Шайх Албонӣ" } },
                    { id: "uthaymeen", label: { ru: "Шейх Ибн Усеймин", en: "Sheikh Ibn Uthaymeen", tg: "Шайх Ибни Усаймин" } },
                    { id: "fawzan", label: { ru: "Шейх Салих Аль-Фозан", en: "Sheikh Salih Al-Fawzan", tg: "Шайх Солеҳ Ал-Фавзон" } },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`scroll-snap-item px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border smooth-transition ${
                        filterCategory === cat.id
                          ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                          : "bg-white/5 text-[var(--color-text-secondary)] border-transparent hover:border-white/10"
                      }`}
                    >
                      {getLocalized(cat.label)}
                    </button>
                  ))}
                </div>

                {/* SEARCH RESULTS */}
                <div className="space-y-4 pt-2">
                  {(() => {
                    const filtered = lectures.filter((l) => {
                      // Category Filter
                      if (filterCategory !== "all" && l.scholarId !== filterCategory) return false;

                      // Query Filter
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        getLocalized(l.title).toLowerCase().includes(q) ||
                        getLocalized(l.scholarName).toLowerCase().includes(q) ||
                        getLocalized(l.bookName).toLowerCase().includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center text-[var(--color-text-secondary)] bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)]">
                          <p>{t("noResults")}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((lecture) => {
                          const isCurrent = currentLecture?.id === lecture.id;
                          return (
                            <div
                              key={lecture.id}
                              className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] flex flex-col justify-between gap-4"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <span className="text-[10px] text-[var(--color-accent)] font-semibold uppercase tracking-wider">
                                    {getLocalized(lecture.scholarName)}
                                  </span>
                                  <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTime(lecture.duration)}
                                  </span>
                                </div>
                                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-2">
                                  {getLocalized(lecture.title)}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                  {getLocalized(lecture.bookName)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <button
                                  onClick={() => selectAndPlay(lecture)}
                                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                                    isCurrent && isPlaying
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)]"
                                  }`}
                                >
                                  {isCurrent && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                  {isCurrent && isPlaying ? t("paused") : "Play"}
                                </button>
                                <button
                                  onClick={() => toggleLike(lecture.id)}
                                  className={`p-2 rounded-xl border border-white/5 transition ${
                                    likes.includes(lecture.id)
                                      ? "text-red-500 bg-red-500/10"
                                      : "text-[var(--color-text-secondary)] hover:text-white"
                                  }`}
                                >
                                  <Heart size={16} fill={likes.includes(lecture.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={() => addToQueue(lecture)}
                                  className="p-2 rounded-xl border border-white/5 text-[var(--color-text-secondary)] hover:text-white transition"
                                  title="Add to Queue"
                                >
                                  <ListMusic size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: LIBRARY (SCHOLAR -> BOOK -> LECTURE) */}
            {currentTab === "library" && (
              <div className="space-y-6 animate-fade-in">
                {/* BREADCRUMBS Horizontal Scroll with snaps */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] overflow-x-auto py-1 no-scrollbar whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedScholarId(null);
                      setSelectedBookId(null);
                    }}
                    className="hover:text-[var(--color-text-primary)] transition"
                  >
                    {t("library")}
                  </button>
                  {selectedScholarId && (
                    <>
                      <ChevronRight size={12} />
                      <button
                        onClick={() => {
                          setSelectedBookId(null);
                        }}
                        className="hover:text-[var(--color-text-primary)] transition"
                      >
                        {getLocalized(SCHOLARS.find((s) => s.id === selectedScholarId)?.name)}
                      </button>
                    </>
                  )}
                  {selectedBookId && (
                    <>
                      <ChevronRight size={12} />
                      <span className="text-[var(--color-text-primary)] font-medium">
                        {getLocalized(BOOKS.find((b) => b.id === selectedBookId)?.title)}
                      </span>
                    </>
                  )}
                </div>

                {/* DRILL DOWN CONTENT */}
                {!selectedScholarId && !selectedBookId && (
                  <div className="space-y-6">
                    <h1 className="text-[var(--color-text-primary)]">{t("allScholars")}</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {SCHOLARS.map((scholar) => (
                        <div
                          key={scholar.id}
                          onClick={() => setSelectedScholarId(scholar.id)}
                          className="group rounded-3xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)] smooth-transition cursor-pointer flex flex-col h-full"
                        >
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img
                              src={scholar.image}
                              alt={getLocalized(scholar.name)}
                              className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] via-transparent to-transparent opacity-80" />
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent)] smooth-transition">
                                {getLocalized(scholar.name)}
                              </h3>
                              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                                {getLocalized(scholar.bio)}
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end text-xs font-bold text-[var(--color-accent)]">
                              <span>{t("books")}</span>
                              <ChevronRight size={14} className="ml-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScholarId && !selectedBookId && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedScholarId(null)}
                          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white transition sticky top-0"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-[var(--color-text-primary)]">
                          {getLocalized(SCHOLARS.find((s) => s.id === selectedScholarId)?.name)}
                        </h1>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {BOOKS.filter((b) => b.scholarId === selectedScholarId).map((book) => (
                        <div
                          key={book.id}
                          onClick={() => setSelectedBookId(book.id)}
                          className="group rounded-3xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)] smooth-transition cursor-pointer flex flex-col h-full"
                        >
                          <div className="aspect-[16/10] overflow-hidden relative">
                            <img
                              src={book.image}
                              alt={getLocalized(book.title)}
                              className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] via-transparent to-transparent opacity-80" />
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent)] smooth-transition">
                                {getLocalized(book.title)}
                              </h3>
                              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                                {getLocalized(book.description)}
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end text-xs font-bold text-[var(--color-accent)]">
                              <span>{t("lectures")}</span>
                              <ChevronRight size={14} className="ml-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScholarId && selectedBookId && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedBookId(null)}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white transition"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div>
                        <h1 className="text-[var(--color-text-primary)] leading-tight">
                          {getLocalized(BOOKS.find((b) => b.id === selectedBookId)?.title)}
                        </h1>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {getLocalized(SCHOLARS.find((s) => s.id === selectedScholarId)?.name)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {lectures
                        .filter((l) => l.bookId === selectedBookId)
                        .map((lecture) => {
                          const isCurrent = currentLecture?.id === lecture.id;
                          return (
                            <div
                              key={lecture.id}
                              className={`p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                                isCurrent ? "ring-2 ring-[var(--color-accent)]" : ""
                              }`}
                            >
                              <div className="flex-1 space-y-1">
                                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                  {getLocalized(lecture.title)}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2.5 self-end sm:self-center">
                                <span className="text-xs text-[var(--color-text-secondary)] mr-2 flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatTime(lecture.duration)}
                                </span>
                                <button
                                  onClick={() => selectAndPlay(lecture)}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                                    isCurrent && isPlaying
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)]"
                                  }`}
                                >
                                  {isCurrent && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                <button
                                  onClick={() => addToQueue(lecture)}
                                  className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white transition"
                                  title="Add to Queue"
                                >
                                  <ListMusic size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FAVORITES & USER COLLECTIONS */}
            {currentTab === "favorites" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h1 className="text-[var(--color-text-primary)]">{t("favorites")}</h1>
                  <p className="text-xs text-[var(--color-text-secondary)]">Ваши персональные коллекции, лайки и закладки</p>
                </div>

                {/* Sub tabs: Likes / Bookmarks / Listen Later */}
                <div className="grid grid-cols-3 gap-2 bg-white/5 border border-[var(--color-border)] rounded-2xl p-1 max-w-md">
                  <button
                    onClick={() => setFilterCategory("likes")}
                    className={`py-2 text-xs font-semibold rounded-xl transition ${
                      filterCategory === "likes" || filterCategory === "all"
                        ? "bg-[var(--color-accent)] text-black"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {t("favoritesTab")} ({likes.length})
                  </button>
                  <button
                    onClick={() => setFilterCategory("bookmarks")}
                    className={`py-2 text-xs font-semibold rounded-xl transition ${
                      filterCategory === "bookmarks"
                        ? "bg-[var(--color-accent)] text-black"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {t("bookmarksTab")} ({bookmarks.length})
                  </button>
                  <button
                    onClick={() => setFilterCategory("listenLater")}
                    className={`py-2 text-xs font-semibold rounded-xl transition ${
                      filterCategory === "listenLater"
                        ? "bg-[var(--color-accent)] text-black"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {t("listenLaterTab")} ({listenLater.length})
                  </button>
                </div>

                {/* LIST OF ITEMS */}
                <div className="space-y-3 pt-2">
                  {(() => {
                    const activeCategory = filterCategory === "all" ? "likes" : filterCategory;
                    let targetList: string[] = [];
                    let emptyMsg = "";

                    if (activeCategory === "likes") {
                      targetList = likes;
                      emptyMsg = t("noFavorites");
                    } else if (activeCategory === "bookmarks") {
                      targetList = bookmarks;
                      emptyMsg = t("noBookmarks");
                    } else if (activeCategory === "listenLater") {
                      targetList = listenLater;
                      emptyMsg = t("noListenLater");
                    }

                    const filtered = lectures.filter((l) => targetList.includes(l.id));

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center text-[var(--color-text-secondary)] bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)]">
                          <p>{emptyMsg}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((lecture) => {
                          const isCurrent = currentLecture?.id === lecture.id;
                          return (
                            <div
                              key={lecture.id}
                              className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] flex flex-col justify-between gap-4"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <span className="text-[10px] text-[var(--color-accent)] font-semibold uppercase tracking-wider">
                                    {getLocalized(lecture.scholarName)}
                                  </span>
                                  <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTime(lecture.duration)}
                                  </span>
                                </div>
                                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-2">
                                  {getLocalized(lecture.title)}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                  {getLocalized(lecture.bookName)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <button
                                  onClick={() => selectAndPlay(lecture)}
                                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                                    isCurrent && isPlaying
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)]"
                                  }`}
                                >
                                  {isCurrent && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                  {isCurrent && isPlaying ? t("paused") : "Play"}
                                </button>
                                <button
                                  onClick={() => toggleLike(lecture.id)}
                                  className={`p-2 rounded-xl border border-white/5 transition ${
                                    likes.includes(lecture.id)
                                      ? "text-red-500 bg-red-500/10"
                                      : "text-[var(--color-text-secondary)] hover:text-white"
                                  }`}
                                >
                                  <Heart size={16} fill={likes.includes(lecture.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={() => toggleBookmark(lecture.id)}
                                  className={`p-2 rounded-xl border border-white/5 transition ${
                                    bookmarks.includes(lecture.id)
                                      ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                      : "text-[var(--color-text-secondary)] hover:text-white"
                                  }`}
                                >
                                  <Bookmark size={16} fill={bookmarks.includes(lecture.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={() => toggleListenLater(lecture.id)}
                                  className={`p-2 rounded-xl border border-white/5 transition ${
                                    listenLater.includes(lecture.id)
                                      ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                      : "text-[var(--color-text-secondary)] hover:text-white"
                                  }`}
                                >
                                  <Clock size={16} fill={listenLater.includes(lecture.id) ? "currentColor" : "none"} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROFILE & THEMES */}
            {currentTab === "profile" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h1 className="text-[var(--color-text-primary)]">{t("profile")}</h1>
                  <p className="text-xs text-[var(--color-text-secondary)]">Настройки аккаунта, тем оформления и локализации</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Settings */}
                  <div className="p-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-6">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-white/5 pb-3">
                      {t("userProfile")}
                    </h2>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] font-bold text-xl">
                        SL
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[var(--color-text-primary)]">Salaf Audio Listener</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">Слушатель библиотеки</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Понравилось лекций:</span>
                        <span className="font-bold text-[var(--color-accent)]">{likes.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Закладки:</span>
                        <span className="font-bold text-[var(--color-accent)]">{bookmarks.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Слушать позже:</span>
                        <span className="font-bold text-[var(--color-accent)]">{listenLater.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Themes selection */}
                  <div className="p-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-4">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-white/5 pb-3">
                      {t("theme")}
                    </h2>

                    <div className="grid grid-cols-2 gap-2.5">
                      {THEMES.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => setTheme(th.id)}
                          className={`p-3 text-xs font-semibold rounded-xl text-left border smooth-transition flex items-center justify-between ${
                            theme === th.id
                              ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                              : "bg-white/5 text-[var(--color-text-secondary)] border-transparent hover:border-white/10"
                          }`}
                        >
                          <span>{getLocalized(th.name)}</span>
                          {theme === th.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ADMIN PANEL */}
            {currentTab === "admin" && <AdminPage />}
          </div>
        </main>
      </div>

      {/* FIXED BOTTOM PLAYER (DESKTOP / LAPTOP / TABLET) */}
      {currentLecture && (
        <div className="bottom-player hidden md:flex items-center justify-between">
          {/* Metadata */}
          <div className="flex items-center gap-3.5 max-w-[25%] truncate">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
              {isPlaying ? (
                <div className="audio-visualizer-bar">
                  <span className="av-column animating-1" />
                  <span className="av-column animating-2" />
                  <span className="av-column animating-3" />
                </div>
              ) : (
                <Play size={18} />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                {getLocalized(currentLecture.title)}
              </h4>
              <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                {getLocalized(currentLecture.scholarName)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 max-w-[50%] flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={handlePrev}
                className="p-2 text-[var(--color-text-secondary)] hover:text-white transition"
              >
                <SkipBack size={18} />
              </button>

              {/* Play Pause Button */}
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 transition"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="p-2 text-[var(--color-text-secondary)] hover:text-white transition"
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Slider / Time bar */}
            <div className="w-full flex items-center gap-3 text-[10px] text-[var(--color-text-secondary)]">
              <span>{formatTime(progress)}</span>
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={currentLecture.duration || 100}
                  value={progress}
                  onChange={handleSeekChange}
                  className="custom-slider"
                />
              </div>
              <span>{formatTime(currentLecture.duration)}</span>
            </div>
          </div>

          {/* Right Extras (Speed, Vol, A-B Repeat) */}
          <div className="flex items-center gap-3">
            {/* A-B Repeat */}
            <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-lg p-0.5">
              <button
                onClick={handleSetA}
                className={`px-2 py-1 text-[10px] font-bold rounded transition ${
                  abPointA !== null ? "bg-[var(--color-accent)] text-black" : "text-[var(--color-text-secondary)]"
                }`}
              >
                A
              </button>
              <button
                onClick={handleSetB}
                disabled={abPointA === null}
                className={`px-2 py-1 text-[10px] font-bold rounded transition ${
                  abPointB !== null ? "bg-[var(--color-accent)] text-black" : "text-[var(--color-text-secondary)] disabled:opacity-40"
                }`}
              >
                B
              </button>
              {(abPointA !== null || abPointB !== null) && (
                <button
                  onClick={handleClearAB}
                  className="px-1.5 text-[var(--color-text-secondary)] hover:text-red-400 transition"
                  title="Сброс"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Playback speed */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg px-2 py-1">
                <span>{playbackSpeed}x</span>
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden py-1 z-50">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-4 py-2 text-xs text-left w-24 hover:bg-[var(--color-accent)] hover:text-black transition ${
                      playbackSpeed === s ? "text-[var(--color-accent)] font-bold" : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-[var(--color-text-secondary)] hover:text-white transition"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 h-1 custom-slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MINI-PLAYER (Resting above Bottom navigation) */}
      {currentLecture && (
        <div
          onClick={() => setIsPlayerFullscreen(true)}
          className="bottom-player flex md:hidden items-center justify-between bg-[var(--color-player)] border-t border-[var(--color-border)] px-4 safe-padding-bottom"
          style={{ bottom: "64px" }}
        >
          <div className="flex items-center gap-3 truncate max-w-[70%]">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/15 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] flex-shrink-0">
              {isPlaying ? (
                <div className="audio-visualizer-bar">
                  <span className="av-column animating-1" />
                  <span className="av-column animating-2" />
                </div>
              ) : (
                <Play size={16} />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                {getLocalized(currentLecture.title)}
              </h4>
              <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                {getLocalized(currentLecture.scholarName)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center active:scale-95 transition"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="p-2 text-[var(--color-text-secondary)]"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE FULL-SCREEN PLAYER SHEET */}
      {currentLecture && isPlayerFullscreen && (
        <div className="mobile-fullscreen-player">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setIsPlayerFullscreen(false)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-white"
            >
              <X size={24} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              {t("nowPlaying")}
            </span>
            <button
              onClick={() => {
                setIsQueueOpen(!isQueueOpen);
              }}
              className={`p-2 transition ${isQueueOpen ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}`}
            >
              <ListMusic size={22} />
            </button>
          </div>

          {/* Central Artwork */}
          <div className="flex-1 flex flex-col justify-center items-center py-6">
            <div className="aspect-square w-full max-w-[280px] rounded-3xl bg-[var(--color-accent)]/10 border-2 border-[var(--color-border)] flex items-center justify-center shadow-2xl relative overflow-hidden mb-6">
              {isPlaying ? (
                <div className="flex items-end gap-2 h-20">
                  <span className="w-2.5 bg-[var(--color-accent)] rounded-full animating-1" style={{ animation: "avPulse1 0.7s infinite alternate" }} />
                  <span className="w-2.5 bg-[var(--color-accent)] rounded-full animating-2" style={{ animation: "avPulse2 0.5s infinite alternate" }} />
                  <span className="w-2.5 bg-[var(--color-accent)] rounded-full animating-3" style={{ animation: "avPulse3 0.8s infinite alternate" }} />
                  <span className="w-2.5 bg-[var(--color-accent)] rounded-full animating-2" style={{ animation: "avPulse2 0.6s infinite alternate" }} />
                </div>
              ) : (
                <Play size={48} className="text-[var(--color-accent)] opacity-40" />
              )}
            </div>

            {/* Title / Scholar */}
            <div className="text-center px-4 max-w-sm">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-1 line-clamp-2">
                {getLocalized(currentLecture.title)}
              </h2>
              <p className="text-xs text-[var(--color-accent)] font-semibold mb-2">
                {getLocalized(currentLecture.scholarName)}
              </p>
              <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                {getLocalized(currentLecture.bookName)}
              </p>
            </div>
          </div>

          {/* Bottom Section: Progress bar + Controls */}
          <div className="space-y-6">
            {/* Progress Slider */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={currentLecture.duration || 100}
                  value={progress}
                  onChange={handleSeekChange}
                  className="custom-slider"
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)]">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(currentLecture.duration)}</span>
              </div>
            </div>

            {/* A-B Repeat on Mobile */}
            <div className="flex items-center justify-between border border-[var(--color-border)] rounded-2xl p-2 bg-white/5">
              <span className="text-xs font-bold text-[var(--color-text-secondary)] pl-2">
                {t("repeatAB")}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSetA}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    abPointA !== null ? "bg-[var(--color-accent)] text-black" : "bg-white/5 text-[var(--color-text-secondary)]"
                  }`}
                >
                  {t("repeatA")}
                </button>
                <button
                  onClick={handleSetB}
                  disabled={abPointA === null}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    abPointB !== null ? "bg-[var(--color-accent)] text-black" : "bg-white/5 text-[var(--color-text-secondary)] disabled:opacity-40"
                  }`}
                >
                  {t("repeatB")}
                </button>
                {(abPointA !== null || abPointB !== null) && (
                  <button
                    onClick={handleClearAB}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Speed & Extras row */}
            <div className="flex items-center justify-between">
              {/* Playback speed trigger */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)] font-semibold">{t("speed")}:</span>
                <div className="flex items-center gap-1">
                  {[1.0, 1.2, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        playbackSpeed === s ? "bg-[var(--color-accent)] text-black" : "bg-white/5 text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Likes & Bookmarks */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLike(currentLecture.id)}
                  className={`p-2.5 rounded-xl border border-white/5 transition ${
                    likes.includes(currentLecture.id) ? "text-red-500 bg-red-500/10" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Heart size={18} fill={likes.includes(currentLecture.id) ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => toggleBookmark(currentLecture.id)}
                  className={`p-2.5 rounded-xl border border-white/5 transition ${
                    bookmarks.includes(currentLecture.id) ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Bookmark size={18} fill={bookmarks.includes(currentLecture.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-around py-4">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-text-secondary)] active:scale-90"
              >
                <SkipBack size={22} />
              </button>

              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center shadow-lg active:scale-90"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
              </button>

              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-text-secondary)] active:scale-90"
              >
                <SkipForward size={22} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUEUE BOTTOM SHEET OR SIDEBAR (DESKTOP/MOBILE OVERLAY) */}
      {isQueueOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-end"
          onClick={() => setIsQueueOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--color-sidebar)] h-full border-l border-[var(--color-border)] p-6 flex flex-col justify-between safe-padding-bottom safe-padding-top shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <ListMusic size={18} />
                  {t("queue")}
                </h2>
                <button
                  onClick={() => setIsQueueOpen(false)}
                  className="p-1 text-[var(--color-text-secondary)] hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* QUEUE ITEMS */}
              <div className="space-y-3">
                {queue.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                    Список пуст. Добавьте лекции в очередь воспроизведения.
                  </div>
                ) : (
                  queue.map((lecture, idx) => (
                    <div
                      key={`${lecture.id}-${idx}`}
                      className="p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                          {getLocalized(lecture.title)}
                        </h4>
                        <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                          {getLocalized(lecture.scholarName)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCurrentLecture(lecture);
                            setIsPlaying(true);
                            removeFromQueue(lecture.id);
                          }}
                          className="p-1.5 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-lg"
                        >
                          <Play size={14} />
                        </button>
                        <button
                          onClick={() => removeFromQueue(lecture.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {queue.length > 0 && (
              <button
                onClick={() => setQueue([])}
                className="w-full bg-red-500/15 text-red-400 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/20 active:scale-95 transition mt-4"
              >
                {t("clearQueue")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="bottom-nav md:hidden">
        <button
          onClick={() => setCurrentTab("home")}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === "home" ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
          }`}
        >
          <HomeIcon size={18} />
          <span className="text-[10px] mt-1 font-semibold">{t("home")}</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab("search");
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === "search" ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
          }`}
        >
          <Search size={18} />
          <span className="text-[10px] mt-1 font-semibold">{t("search")}</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab("library");
            setSelectedScholarId(null);
            setSelectedBookId(null);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === "library" ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
          }`}
        >
          <LibraryIcon size={18} />
          <span className="text-[10px] mt-1 font-semibold">{t("library")}</span>
        </button>

        <button
          onClick={() => setCurrentTab("favorites")}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === "favorites" ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
          }`}
        >
          <Heart size={18} />
          <span className="text-[10px] mt-1 font-semibold">{t("favorites")}</span>
        </button>

        <button
          onClick={() => setCurrentTab("profile")}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === "profile" ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
          }`}
        >
          <User size={18} />
          <span className="text-[10px] mt-1 font-semibold">{t("profile")}</span>
        </button>
      </nav>
    </div>
  );
}
