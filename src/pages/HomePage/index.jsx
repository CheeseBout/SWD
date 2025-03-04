import { FeaturedQuizzes } from "@components/FeaturedQuizzes";
import { FeaturedTherapists } from "@components/FeaturedTherapists";
import { HomeHero } from "@components/Hero/HomeHero";
import GoogleCallback from "../Login/GoogleCallbackHandler";

export function HomePage() {
  const params = new URLSearchParams(window.location.search);
  const hasGoogleToken =
    params.has("accessToken") && params.has("refreshToken");
  return (
    <>
      <HomeHero />
      <FeaturedQuizzes />
      <FeaturedTherapists />
      {hasGoogleToken && <GoogleCallback />}
    </>
  );
}
