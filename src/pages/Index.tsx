import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

const trustItems = [
  {
    emoji: "🚚",
    label: "Free Delivery",
    sublabel: "Orders over GH₵100",
  },
  {
    emoji: "⚡",
    label: "Same Day Delivery",
    sublabel: "Order before 2pm",
  },
  {
    emoji: "💳",
    label: "Mobile Money",
    sublabel: "MTN, Vodafone, AirtelTigo",
  },
  {
    emoji: "🛡️",
    label: "Fresh Guarantee",
    sublabel: "Or your money back",
  },
];

const TrustStrip = () => (
  <section className="border-y border-border bg-gradient-to-r from-primary/5 via-white to-secondary/5 py-6">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:flex-nowrap md:justify-between">
        {trustItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 min-w-[15rem] md:min-w-0"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg"
              aria-hidden
            >
              {item.emoji}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground">{item.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
