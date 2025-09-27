import Header from "@/components/Header";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
