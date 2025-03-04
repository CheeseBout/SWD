import { FeaturedQuizzes } from "@components/FeaturedQuizzes";
import { FeaturedTherapists } from "@components/FeaturedTherapists";
import { HomeHero } from "@components/Hero/HomeHero";
import GoogleCallback from "../Login/GoogleCallbackHandler";

export function HomePage() {
  return (
    <>
      <HomeHero />
      <FeaturedQuizzes />
      <FeaturedTherapists />
      <GoogleCallback />
    </>
  );
}
