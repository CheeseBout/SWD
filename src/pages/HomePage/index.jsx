import { FeaturedQuizzes } from "@components/FeaturedQuizzes";
import { FeaturedTherapists } from "@components/FeaturedTherapists";
import { Hero } from "@components/Hero";

export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedQuizzes />
      <FeaturedTherapists />
    </>
  );
}
