import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Method from "@/components/Method";
import Offer from "@/components/Offer";
import Differentiation from "@/components/Differentiation";
import Results from "@/components/Results";
import CtaFinal from "@/components/CtaFinal";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <Method />
      <Offer />
      <Differentiation />
      <Results />
      <CtaFinal />
      <FAQ />
      <Footer />
    </main>
  );
}
