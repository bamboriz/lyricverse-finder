import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Song from "@/pages/Song";
import { Toaster } from "sonner";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/songs/:slug" element={<Song />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;