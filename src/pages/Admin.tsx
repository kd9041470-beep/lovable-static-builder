import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import RestaurantManager from "@/components/admin/RestaurantManager";
import DishManager from "@/components/admin/DishManager";
import CSVImport from "@/components/admin/CSVImport";
import AuthGuard from "@/components/admin/AuthGuard";

const Admin = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-secondary border-b shadow-lg">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
                  <p className="text-white/80">إدارة المطاعم والأطباق</p>
                </div>
              </div>
              <Link to="/">
                <Button variant="secondary" size="lg" className="gap-2">
                  <ArrowRight className="w-5 h-5" />
                  العودة للصفحة الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <Tabs defaultValue="dishes" className="space-y-6" dir="rtl">
            <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-card shadow-md">
              <TabsTrigger value="dishes" className="text-lg py-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                إدارة الأطباق
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="text-lg py-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                إدارة المطاعم
              </TabsTrigger>
              <TabsTrigger value="import" className="text-lg py-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                استيراد CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dishes" className="space-y-6">
              <DishManager />
            </TabsContent>

            <TabsContent value="restaurants" className="space-y-6">
              <RestaurantManager />
            </TabsContent>

            <TabsContent value="import" className="space-y-6">
              <CSVImport />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Admin;
