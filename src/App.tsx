/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Download, Loader2, Package, Trash2, ImagePlus } from "lucide-react";
import { extractIconsFromImage } from "./lib/gemini";
import { processAndCropIcons, downloadAllIconsAsPNG, ProcessedIcon } from "./lib/imageProcessor";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<ProcessedIcon[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("الرجاء رفع ملف صورة صالح.");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setOriginalImageUrl(URL.createObjectURL(selectedFile));
    setIcons([]);
    setLoading(true);

    try {
      const extractedData = await extractIconsFromImage(selectedFile);
      if (extractedData.length === 0) {
        setError("لم يتم العثور على أي أيقونات في هذه الصورة.");
      } else {
        const processedIcons = await processAndCropIcons(selectedFile, extractedData);
        setIcons(processedIcons);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadPNG = (icon: ProcessedIcon) => {
    const a = document.createElement("a");
    a.href = icon.dataUrl;
    a.download = `${icon.name}.png`;
    a.click();
  };

  const updateIconName = (id: string, newName: string) => {
    setIcons(icons.map(icon => icon.id === id ? { ...icon, name: newName } : icon));
  };

  const removeIcon = (id: string) => {
    setIcons(icons.filter(icon => icon.id !== id));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Package className="w-10 h-10 text-blue-600" />
            مستخرج الأيقونات الذكي
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            يقوم النظام باقتصاص <strong>الأيقونات الأصلية</strong> من صورتك، إزالة الخلفية لتصبح شفافة، <strong>ومعالجة النصوص المتداخلة</strong> لتعود الأيقونة صافية تماماً.
          </p>
        </header>

        {!file && !loading && icons.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ease-in-out
              ${isHovering ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50 hover:shadow-sm"}
            `}
          >
            <UploadCloud className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">اسحب الصورة وأفلتها هنا</h3>
            <p className="text-gray-500 mb-6">أو انقر لاختيار ملف من جهازك</p>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transition shadow-sm hover:shadow">
              تصفح الملفات
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="relative mb-6">
               <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
               </div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">يتم معالجة الصورة الأصلية...</h3>
            <ul className="text-sm text-gray-500 space-y-2 text-center">
              <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> اقتصاص العناصر...</li>
              <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> إزالة وتفريغ الخلفية السحرية...</li>
              <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> مسح وتلوين النصوص للعودة للصورة الصافية...</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl mb-8 flex flex-col items-center text-center border border-red-100">
            <p className="font-medium mb-3">{error}</p>
            <button 
              onClick={() => { setError(null); setFile(null); setOriginalImageUrl(null); }}
              className="text-red-700 font-semibold underline hover:text-red-800"
            >
              حاول مجدداً بصورة أخرى
            </button>
          </div>
        )}

        {icons.length > 0 && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                {originalImageUrl && (
                  <img src={originalImageUrl} alt="Original" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    تمت المعالجة: {icons.length} أيقونات (PNG)
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">مكتمل</span>
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">تم اقتصاص الصورة الأصلية بنجاح مع إزالة الخلفية والنصوص.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                <button
                  onClick={() => { setFile(null); setIcons([]); setOriginalImageUrl(null); }}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                >
                  صورة جديدة
                </button>
                <div className="flex overflow-hidden rounded-xl shadow-sm hover:shadow transition border border-gray-200">
                  <button
                    onClick={() => downloadAllIconsAsPNG(icons)}
                    className="px-5 py-2.5 font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4 text-blue-500" />
                    تحميل الكل ZIP
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {icons.map((icon) => (
                <div key={icon.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition duration-300">
                  <div className="aspect-square bg-[url('https://cdn.pixabay.com/photo/2018/11/08/17/26/pattern-3802958_960_720.png')] bg-repeat bg-[length:16px_16px] flex items-center justify-center p-8 relative border-b border-gray-50">
                    <img 
                      src={icon.dataUrl} 
                      alt={icon.name} 
                      className="max-w-full max-h-full object-contain filter drop-shadow-md relative z-10"
                    />
                    <button 
                      onClick={() => removeIcon(icon.id)}
                      className="absolute z-20 top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 border border-red-100 shadow-sm"
                      title="حذف الأيقونة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">اسم الأيقونة</label>
                    <input
                      type="text"
                      value={icon.name}
                      onChange={(e) => updateIconName(icon.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 text-left mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-mono"
                      dir="ltr"
                    />
                    <button
                      onClick={() => handleDownloadPNG(icon)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
                    >
                      <ImagePlus className="w-4 h-4" />
                      تحميل PNG شفاف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}