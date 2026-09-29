import Aurora from "@/components/Aurora";
import Analytics from "@/components/Analytics";
import CommandPalette from "@/components/CommandPalette";
import Expeditions from "@/components/Expeditions";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import MediaHub from "@/components/MediaHub";
import Navbar from "@/components/Navbar";
import Outreach from "@/components/Outreach";
import Repository from "@/components/Repository";
import SmoothScroll from "@/components/SmoothScroll";
import WeatherProvider from "@/components/WeatherContext";

export default function Page() {
  return (
    <WeatherProvider>
      <SmoothScroll />
      <Aurora />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Repository />
        <Expeditions />
        <MediaHub />
        <Outreach />
        <Analytics />
      </main>
      <Footer />
      <CommandPalette />
    </WeatherProvider>
  );
}
