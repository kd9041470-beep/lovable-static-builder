import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, ChefHat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Restaurant {
  id: string;
  name_ar: string;
  description_ar: string | null;
  phone: string | null;
  address_ar: string | null;
  is_active: boolean;
}

const RestaurantManager = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name_ar: "",
    description_ar: "",
    phone: "",
    address_ar: "",
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل المطاعم",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const restaurantData = {
        name: formData.name_ar,
        name_ar: formData.name_ar,
        description: formData.description_ar,
        description_ar: formData.description_ar || null,
        phone: formData.phone || null,
        address: formData.address_ar,
        address_ar: formData.address_ar || null,
        is_active: true,
      };

      if (editingRestaurant) {
        const { error } = await supabase
          .from("restaurants")
          .update(restaurantData)
          .eq("id", editingRestaurant.id);

        if (error) throw error;
        toast({ title: "تم تحديث المطعم بنجاح" });
      } else {
        const { error } = await supabase.from("restaurants").insert([restaurantData]);

        if (error) throw error;
        toast({ title: "تم إضافة المطعم بنجاح" });
      }

      setDialogOpen(false);
      resetForm();
      loadRestaurants();
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ المطعم",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      description_ar: "",
      phone: "",
      address_ar: "",
    });
    setEditingRestaurant(null);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name_ar: restaurant.name_ar,
      description_ar: restaurant.description_ar || "",
      phone: restaurant.phone || "",
      address_ar: restaurant.address_ar || "",
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">المطاعم</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                إضافة مطعم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingRestaurant ? "تعديل المطعم" : "إضافة مطعم جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">اسم المطعم (بالعربية) *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_ar">الوصف (بالعربية)</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_ar">العنوان (بالعربية)</Label>
                    <Input
                      id="address_ar"
                      value={formData.address_ar}
                      onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" size="lg">
                    {editingRestaurant ? "تحديث" : "إضافة"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                    size="lg"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground">لا توجد مطاعم مضافة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-xl">{restaurant.name_ar}</h3>
                    {restaurant.description_ar && (
                      <p className="text-muted-foreground">{restaurant.description_ar}</p>
                    )}
                    {restaurant.phone && (
                      <p className="text-sm">
                        <span className="font-medium">الهاتف:</span> {restaurant.phone}
                      </p>
                    )}
                    {restaurant.address_ar && (
                      <p className="text-sm">
                        <span className="font-medium">العنوان:</span> {restaurant.address_ar}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(restaurant)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RestaurantManager;
