import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Restaurant {
  id: string;
  name_ar: string;
  description_ar: string;
  image_url: string | null;
  phone: string | null;
  address_ar: string | null;
}

interface Dish {
  id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
}

const Home = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .single();

      const { data: dishesData } = await supabase
        .from("dishes")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      setRestaurant(restaurantData);
      setDishes(dishesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-xl text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary py-20 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <ChefHat className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              {restaurant?.name_ar || "عمدة فود"}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              {restaurant?.description_ar || "اكتشف أفضل الأطباق الشهية"}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              {restaurant?.phone && (
                <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">{restaurant.phone}</span>
                </div>
              )}
              {restaurant?.address_ar && (
                <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{restaurant.address_ar}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Link */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <Link to="/admin">
          <Button variant="outline" size="lg" className="w-full md:w-auto">
            لوحة التحكم
          </Button>
        </Link>
      </div>

      {/* Dishes Grid */}
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            قائمة الأطباق
          </h2>
          <p className="text-muted-foreground text-lg">اختر من أشهى الأطباق المتوفرة</p>
        </div>

        {dishes.length === 0 ? (
          <Card className="p-12 text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground">لا توجد أطباق متاحة حالياً</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dishes.map((dish) => (
              <Card
                key={dish.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/80"
              >
                <div className="aspect-video overflow-hidden bg-muted relative">
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name_ar}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <ChefHat className="w-24 h-24 text-muted-foreground/30" />
                    </div>
                  )}
                  {dish.category && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {dish.category}
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">{dish.name_ar}</h3>
                  {dish.description_ar && (
                    <p className="text-muted-foreground line-clamp-2">{dish.description_ar}</p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {dish.price.toFixed(2)} دج
                    </span>
                    <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                      اطلب الآن
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary/5 to-secondary/5 border-t mt-20">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center space-y-4">
            <ChefHat className="w-12 h-12 mx-auto text-primary" />
            <p className="text-lg font-medium">عمدة فود</p>
            <p className="text-muted-foreground">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
