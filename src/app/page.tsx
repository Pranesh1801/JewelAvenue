import { HomeIntro } from "@/components/home/HomeIntro";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function Home() {
  return (
    <main>
      <HomeIntro />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
