import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="w-full max-w-lg text-center space-y-8">
        {/* 404 Display */}
        <div className="relative">
          <div className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
            الصفحة غير موجودة
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير متاحة حالياً أو قد تم حذفها.
          </p>
        </div>

        {/* Floating Elements */}
        <div className="flex justify-center gap-4 items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce delay-200"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-50 font-semibold rounded-lg transition-all duration-200"
          >
            الصفحة الرئيسية
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="pt-8 space-y-2 text-sm text-slate-500 dark:text-slate-500">
          <p>Error Code: 404</p>
          <p className="text-xs">Page not found • صفحة غير موجودة</p>
        </div>
      </div>
    </div>
  );
}
