-- Create enum for order status
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');

-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  image_url TEXT,
  phone TEXT,
  address TEXT,
  address_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dishes table
CREATE TABLE public.dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  image_filename TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants (public read, authenticated write)
CREATE POLICY "Anyone can view active restaurants"
ON public.restaurants FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can insert restaurants"
ON public.restaurants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update restaurants"
ON public.restaurants FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete restaurants"
ON public.restaurants FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for dishes (public read, authenticated write)
CREATE POLICY "Anyone can view available dishes"
ON public.dishes FOR SELECT
USING (is_available = true);

CREATE POLICY "Authenticated users can insert dishes"
ON public.dishes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update dishes"
ON public.dishes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete dishes"
ON public.dishes FOR DELETE
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
BEFORE UPDATE ON public.dishes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample restaurant
INSERT INTO public.restaurants (name, name_ar, description, description_ar, is_active)
VALUES ('Omda Food', 'عمدة فود', 'Best food in town', 'أفضل طعام في المدينة', true);