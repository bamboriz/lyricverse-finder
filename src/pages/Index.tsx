import { SearchLyrics } from "@/components/SearchLyrics";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-b from-accent via-white to-accent/50">
      <Helmet>
        <title>Lyriko - Discover Song Meanings and Interpretations</title>
        <meta property="og:title" content="Lyriko - Discover Song Meanings and Interpretations" />
        <meta property="og:description" content="Explore the deeper meaning behind your favorite songs with AI-powered interpretations and create beautiful lyric cards to share." />
        <meta property="og:url" content="https://lyriko.xyz" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="absolute top-4 right-4 z-20">
        <a 
          href="https://www.tiktok.com/@lyrikoxyz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm text-sm font-medium text-gray-800"
          aria-label="Follow us on TikTok"
        >
          Follow on TikTok
        </a>
      </div>
      <div className="relative z-10 py-12">
        <SearchLyrics />
      </div>
    </div>
  );
};

export default Index;