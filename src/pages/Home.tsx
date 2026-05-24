import AiRecommendations from "../components/AiRecommendations";
import HeroBanner from "../components/HeroBanner";
import StoreServices from "../components/StoreServices";
import TrendingProducts from "../components/TrendingProducts";
import VoucherList from "../components/VoucherList";

function Home() {
  return (
    <div className="space-y-14 pb-10 pt-2 sm:space-y-16">
      <HeroBanner />
      <StoreServices />
      <VoucherList />
      <AiRecommendations />
      <TrendingProducts />
    </div>
  );
}

export default Home;
