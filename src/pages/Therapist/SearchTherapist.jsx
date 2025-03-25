import { TherapistHero } from "../../components/Hero/TherapistHero";
import { TherapyProcess } from "../../components/Process/TherapyProcess";
import TherapistList from "./Therapist";

export default function SearchTherapist() {
  return (
    <div>
      <TherapistHero />
      <TherapistList />
      <TherapyProcess />
    </div>
  );
}
