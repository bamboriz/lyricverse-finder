import { Helmet } from "react-helmet";
import { LyricsSubmissionForm } from "@/components/LyricsSubmissionForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const NewSong = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Add New Song - Lyriko</title>
        <meta property="og:title" content="Add New Song - Lyriko" />
        <meta property="og:description" content="Add a new song with lyrics and get an AI-powered interpretation." />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Song</h1>
        <p className="text-gray-600 mb-8">
          Add a new song to our database. Enter the artist name, song title, and lyrics below. 
          We'll format the lyrics and provide an AI-powered interpretation.
        </p>
        <LyricsSubmissionForm artist="" title="" />
      </div>
    </div>
  );
}