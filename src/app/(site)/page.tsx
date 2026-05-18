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

export default function HomePage() {
  return (
    <>
      <Hero />
      <LiveTicker />
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
