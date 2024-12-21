import { SearchLyrics } from "@/components/SearchLyrics";

const Index = () => {
  return (
    <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-b from-accent via-white to-accent/50">
      <div className="relative z-10 py-12">
        <SearchLyrics />
      </div>
    </div>
  );
};

export default Index;