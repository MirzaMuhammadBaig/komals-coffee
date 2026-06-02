import Hero from "@/components/Hero";
import LiveTicker from "@/components/LiveTicker";
import Marquee from "@/components/Marquee";
import PressStrip from "@/components/PressStrip";
import CoffeeJourney from "@/components/CoffeeJourney";
import MoodPicker from "@/components/MoodPicker";
import Story from "@/components/Story";
import FeaturedItems from "@/components/FeaturedItems";
import WhyKomals from "@/components/WhyKomals";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import InstagramTease from "@/components/InstagramTease";
import LocationHours from "@/components/LocationHours";
import CtaBanner from "@/components/CtaBanner";
import Reveal from "@/components/Reveal";
import { getStoreSettings } from "@/lib/admin/store";
import { computeStoreStatus } from "@/lib/hours";

// Render fresh on every request so the hero store-status seed reflects the
// real current time (a statically prerendered page would freeze it at build
// time — which is exactly what made the badge stick on "Closed").
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // The home page is the seed point for every store-status surface
  // below: the hero badge, the live ticker, and (indirectly) the
  // banner. We compute it once here and pass the resolved state down.
  const store = await getStoreSettings();
  const manualOpen = store?.is_open !== false;
  const status = computeStoreStatus(manualOpen);

  return (
    <>
      <Hero />
      <LiveTicker isOpen={status.isOpen} next={status.next} />
      <Marquee />
      <Reveal direction="up" distance={20}>
        <PressStrip />
      </Reveal>
      <CoffeeJourney />
      <MoodPicker />
      <Reveal direction="up">
        <Story />
      </Reveal>
      <Reveal direction="up">
        <FeaturedItems />
      </Reveal>
      <Reveal direction="up">
        <WhyKomals />
      </Reveal>
      <Reveal direction="up">
        <ReviewsCarousel />
      </Reveal>
      <Reveal direction="up">
        <InstagramTease />
      </Reveal>
      <Reveal direction="up">
        <LocationHours />
      </Reveal>
      <Reveal direction="zoom">
        <CtaBanner />
      </Reveal>
    </>
  );
}
