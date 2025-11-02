import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ChefHat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Dish {
  id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  image_filename: string | null;
  category: string | null;
  is_available: boolean;
  restaurant_id: string | null;
}

const DishManager = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name_ar: "",
    description_ar: "",
    price: "",
    image_url: "",
    image_filename: "",
    category: "",
  });

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDishes(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل الأطباق",
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
      const dishData = {
        name: formData.name_ar,
        name_ar: formData.name_ar,
        description_ar: formData.description_ar || null,
        price: parseFloat(formData.price),
        image_url: formData.image_url || null,
        image_filename: formData.image_filename || null,
        category: formData.category || null,
        is_available: true,
      };

      if (editingDish) {
        const { error } = await supabase
          .from("dishes")
          .update(dishData)
          .eq("id", editingDish.id);

        if (error) throw error;
        toast({ title: "تم تحديث الطبق بنجاح" });
      } else {
        const { error } = await supabase.from("dishes").insert([dishData]);

        if (error) throw error;
        toast({ title: "تم إضافة الطبق بنجاح" });
      }

      setDialogOpen(false);
      resetForm();
      loadDishes();
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ الطبق",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطبق؟")) return;

    try {
      const { error } = await supabase.from("dishes").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "تم حذف الطبق بنجاح" });
      loadDishes();
    } catch (error: any) {
      toast({
        title: "خطأ في حذف الطبق",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      description_ar: "",
      price: "",
      image_url: "",
      image_filename: "",
      category: "",
    });
    setEditingDish(null);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name_ar: dish.name_ar,
      description_ar: dish.description_ar || "",
      price: dish.price.toString(),
      image_url: dish.image_url || "",
      image_filename: dish.image_filename || "",
      category: dish.category || "",
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
          <h2 className="text-2xl font-bold">الأطباق المتوفرة</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                إضافة طبق جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingDish ? "تعديل الطبق" : "إضافة طبق جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">اسم الطبق (بالعربية) *</Label>
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
                    <Label htmlFor="price">السعر (دج) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">رابط الصورة</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_filename">اسم ملف الصورة</Label>
                  <Input
                    id="image_filename"
                    value={formData.image_filename}
                    onChange={(e) => setFormData({ ...formData, image_filename: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" size="lg">
                    {editingDish ? "تحديث" : "إضافة"}
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

        {dishes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground">لا توجد أطباق مضافة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <Card key={dish.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name_ar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg">{dish.name_ar}</h3>
                  {dish.description_ar && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dish.description_ar}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-primary">
                      {dish.price.toFixed(2)} دج
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(dish)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(dish.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DishManager;
