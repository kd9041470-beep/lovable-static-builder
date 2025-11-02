import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CSVRow {
  "اسم الطبق (بالعربية)": string;
  "اسم الملف (لصورة)": string;
  "سعر مقترح (دج)": string;
}

interface ImportResult {
  success: boolean;
  row: CSVRow;
  message: string;
}

const CSVImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى اختيار ملف CSV",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "ملف فارغ",
          description: "الملف لا يحتوي على بيانات",
          variant: "destructive",
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const expectedHeaders = ["اسم الطبق (بالعربية)", "اسم الملف (لصورة)", "سعر مقترح (دج)"];
      
      const hasCorrectHeaders = expectedHeaders.every(h => headers.includes(h));
      if (!hasCorrectHeaders) {
        toast({
          title: "خطأ في رؤوس الأعمدة",
          description: `يجب أن تحتوي على: ${expectedHeaders.join('، ')}`,
          variant: "destructive",
        });
        return;
      }

      const data: CSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
      }

      setPreview(data);
      toast({
        title: "تم تحميل الملف",
        description: `تم العثور على ${data.length} صف`,
      });
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      toast({
        title: "لا توجد بيانات",
        description: "يرجى تحميل ملف CSV أولاً",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setResults([]);
    const importResults: ImportResult[] = [];

    for (const row of preview) {
      try {
        const price = parseFloat(row["سعر مقترح (دج)"]);
        
        if (isNaN(price)) {
          throw new Error("السعر غير صحيح");
        }

        const { error } = await supabase.from("dishes").insert([{
          name: row["اسم الطبق (بالعربية)"],
          name_ar: row["اسم الطبق (بالعربية)"],
          price: price,
          image_filename: row["اسم الملف (لصورة)"],
          is_available: true,
        }]);

        if (error) throw error;

        importResults.push({
          success: true,
          row,
          message: "تم الإضافة بنجاح",
        });
      } catch (error: any) {
        importResults.push({
          success: false,
          row,
          message: error.message,
        });
      }
    }

    setResults(importResults);
    setImporting(false);

    const successCount = importResults.filter(r => r.success).length;
    const failCount = importResults.filter(r => !r.success).length;

    toast({
      title: "اكتمل الاستيراد",
      description: `نجح: ${successCount} | فشل: ${failCount}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">استيراد الأطباق من CSV</h2>
            <p className="text-muted-foreground">
              قم بتحميل ملف CSV يحتوي على الأعمدة التالية: اسم الطبق (بالعربية)، اسم الملف (لصورة)، سعر مقترح (دج)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">اختر ملف CSV</Label>
            <div className="flex gap-4">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              {preview.length > 0 && (
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  size="lg"
                  className="gap-2"
                >
                  <Upload className="w-5 h-5" />
                  {importing ? "جاري الاستيراد..." : "استيراد الآن"}
                </Button>
              )}
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">معاينة البيانات ({preview.length} صف)</h3>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الطبق</TableHead>
                      <TableHead className="text-right">اسم الملف</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      {results.length > 0 && <TableHead className="text-right">الحالة</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row["اسم الطبق (بالعربية)"]}</TableCell>
                        <TableCell className="font-mono text-sm">{row["اسم الملف (لصورة)"]}</TableCell>
                        <TableCell>{row["سعر مقترح (دج)"]} دج</TableCell>
                        {results.length > 0 && (
                          <TableCell>
                            {results[index]?.success ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">نجح</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-destructive">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">{results[index]?.message}</span>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">ملخص النتائج:</h3>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  تم استيراد {results.filter(r => r.success).length} طبق بنجاح
                </p>
                {results.filter(r => !r.success).length > 0 && (
                  <p className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    فشل استيراد {results.filter(r => !r.success).length} طبق
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-4">القائمة الأولية للاستيراد</h3>
        <div className="text-sm space-y-2 font-mono bg-card p-4 rounded-lg overflow-x-auto">
          <div>اسم الطبق (بالعربية),اسم الملف (لصورة),سعر مقترح (دج)</div>
          <div>بوراك باللحم,بوراك باللحم - Meat Borek.jpg,450</div>
          <div>بيتزا 4 فرماج (أربعة أجبان),بيتزا 4 فرماج - Four Cheese Pizza.jpg,900</div>
          <div>بيتزا مارغريتا,بيتزا مارغريتا - Margherita Pizza.jpg,600</div>
          <div>بيتزا 4 فصول,بيتزا 4 فصول - Four Seasons Pizza.jpg,850</div>
          <div>بيتزا بالفطر,بيتزا بالفطر - Mushroom Pizza.jpg,750</div>
          <div>بيتزا نباتية,بيتزا نباتية - Vegetarian Pizza.jpg,700</div>
          <div>بيتزا 3 فورماج (ثلاثة أجبان),بيتزا 3 فورماج - Three Cheese Pizza.jpg,800</div>
        </div>
      </Card>
    </div>
  );
};

export default CSVImport;
