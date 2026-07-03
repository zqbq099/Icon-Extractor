# AI Icon Extractor 🪄 / مستخرج الأيقونات الذكي

[English](#english) | [العربية](#arabic)

---

<a name="english"></a>
## 🇬🇧 English

**AI Icon Extractor** is a smart, AI-powered web application that automatically extracts UI icons, logos, and standalone graphical elements from any uploaded image. 

It goes beyond simple cropping; the integrated AI Agent analyzes the image to accurately isolate symbols, **removes the background** to make them fully transparent, and **intelligently heals overlaid text** (like watermarks or labels) to return a clean, pure PNG icon ready for use.

### ✨ Features
*   **🧠 AI-Powered Detection:** Leverages Google's Gemini Vision API to accurately locate and identify icons within complex interfaces or images.
*   **✂️ Smart Cropping:** Automatically crops individual icons based on precise bounding boxes.
*   **🪄 Magic Background Removal:** Analyzes the surrounding colors and safely removes backgrounds using an intelligent flood-fill algorithm to deliver transparent PNGs.
*   **🧽 Text Healing:** Detects text overlaid on icons and repaints the pixels with the icon's primary color, effectively removing text/watermarks.
*   **📦 Bulk Download:** Review all extracted icons in a sleek grid, rename them if needed, and download them all at once as a ZIP file.

### 🛠️ Tech Stack
*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **AI/ML:** Google Gemini API (`gemini-2.5-pro`)
*   **Image Processing:** HTML5 Canvas API (Client-side)
*   **Utilities:** JSZip, FileSaver.js

### 🚀 Getting Started

1. **Clone the repository** (if running locally):
   ```bash
   git clone <repository-url>
   cd icon-extractor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY="your_google_gemini_api_key_here"
   ```
   *(Note: In the AI Studio environment, `GEMINI_API_KEY` is injected automatically on the server/build level).*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

<a name="arabic"></a>
## 🇸🇦 العربية

**مستخرج الأيقونات الذكي** هو تطبيق ويب متطور يعمل بالذكاء الاصطناعي، يقوم تلقائياً باستخراج أيقونات واجهة المستخدم (UI)، الشعارات، والعناصر الرسومية من أي صورة تقوم برفعها.

الأمر لا يقتصر على مجرد الاقتصاص؛ حيث يقوم "العامل الذكي" بتحليل الصورة بدقة لعزل الرموز، و**إزالة الخلفية تماماً** لتصبح شفافة، بالإضافة إلى **مسح ومعالجة النصوص المتداخلة** (مثل العلامات المائية أو التسميات) ليعيد لك أيقونة صافية بصيغة PNG جاهزة للاستخدام.

### ✨ المميزات
*   **🧠 استخراج بالذكاء الاصطناعي:** يعتمد على نموذج (Gemini Vision) من جوجل للتعرف الدقيق على الأيقونات داخل الصور المعقدة.
*   **✂️ اقتصاص ذكي:** يقوم باقتصاص كل أيقونة على حدة بناءً على إحداثيات دقيقة يحددها الذكاء الاصطناعي.
*   **🪄 إزالة سحرية للخلفية:** يحلل ألوان الخلفية المحيطة بالأيقونة ويزيلها برمجياً لإنتاج صور شفافة تماماً.
*   **🧽 تصفية النصوص (Healing):** يكتشف النصوص المكتوبة فوق الأيقونات ويقوم بمسحها وإعادة تلوين مكانها بلون الأيقونة الأصلي.
*   **📦 تحميل جماعي:** يمكنك مراجعة الأيقونات المستخرجة، تعديل أسمائها، وتحميلها جميعاً بضغطة زر كملف ZIP.

### 🛠️ التقنيات المستخدمة
*   **واجهة المستخدم:** React 19, TypeScript, Vite
*   **التصميم:** Tailwind CSS, Lucide React
*   **الذكاء الاصطناعي:** Google Gemini API
*   **معالجة الصور:** HTML5 Canvas API
*   **أدوات مساعدة:** JSZip, FileSaver.js

### 🚀 طريقة التشغيل

1. **تنزيل المشروع:**
   ```bash
   git clone <repository-url>
   cd icon-extractor
   ```

2. **تثبيت الحزم البرمجية:**
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة:**
   قم بإنشاء ملف `.env` في المسار الرئيسي وضع فيه مفتاح API الخاص بـ Gemini:
   ```env
   VITE_GEMINI_API_KEY="ضع_مفتاح_الـAPI_هنا"
   ```

4. **تشغيل خادم التطوير:**
   ```bash
   npm run dev
   ```

---
*Made with ❤️ by Google AI Studio's AI Coding Agent.*
