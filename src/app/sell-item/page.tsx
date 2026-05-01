"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle, ArrowRight, ArrowLeft,
  Camera, Tag, MapPin, DollarSign, FileText, Sparkles,
  RefreshCw, HandHeart, Wrench, Recycle, ImageIcon, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth";
import { listingsApi, uploadApi } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

const categories = [
  "Electronics & Gadgets", "Clothing & Fashion", "Shoes & Footwear",
  "Accessories & Jewelry", "Furniture & Home Decor", "Kitchen & Home Essentials",
  "Vehicles & Auto Parts", "Tools & DIY", "Sports & Outdoor",
  "Books & Education", "Toys & Games", "Musical Instruments",
  "Health & Beauty", "Baby & Kids", "Office & Stationery",
  "Garden & Outdoor", "Collectibles & Antiques", "Other",
];

const conditions = [
  { value: "NEW", label: "New", description: "Unused, in original condition" },
  { value: "LIKE_NEW", label: "Like new", description: "Barely used, looks new" },
  { value: "GOOD", label: "Good", description: "Normal wear, fully functional" },
  { value: "FAIR", label: "Fair", description: "Visible wear, still works" },
  { value: "POOR", label: "Poor / Broken", description: "Damaged but has usable parts" },
];

const intentions = [
  { value: "SELL", label: "Sell it", icon: DollarSign, description: "Set a price and sell", color: "#4a7c6f" },
  { value: "TRADE", label: "Trade it", icon: RefreshCw, description: "Swap for something else", color: "#3b82f6" },
  { value: "DONATE", label: "Give it away", icon: HandHeart, description: "Free to someone who needs it", color: "#f59e0b" },
  { value: "FIX", label: "Get it fixed", icon: Wrench, description: "Find someone to repair it", color: "#f97316" },
  { value: "RECYCLE", label: "Recycle it", icon: Recycle, description: "Responsible disposal", color: "#14b8a6" },
];

export default function SellItemPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "" as string,
    intentionTag: "" as string,
    pairingKeyword: "",
    price: "",
    city: "",
    images: [] as string[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to list an item");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 3 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 3MB per image.`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;
    if (form.images.length + validFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setIsUploading(true);
    try {
      const urls: string[] = [];
      const previews: string[] = [];
      for (const file of validFiles) {
        previews.push(URL.createObjectURL(file));
        try {
          const url = await uploadApi.uploadFile(file);
          urls.push(url);
        } catch {
          // If upload fails, use a data URL as fallback for the preview
          urls.push(URL.createObjectURL(file));
        }
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      setImagePreviews((prev) => [...prev, ...previews]);
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.condition || !form.intentionTag) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await listingsApi.createListing({
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition,
        intentionTag: form.intentionTag,
        pairingKeyword: form.pairingKeyword || undefined,
        price: form.intentionTag === "SELL" && form.price ? form.price : undefined,
        city: form.city || undefined,
        images: form.images,
      });
      setSuccess(true);
      toast.success("Your item has been listed!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create listing";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return form.title.length >= 3 && form.description.length >= 10;
      case 2: return form.category !== "" && form.condition !== "";
      case 3: return form.intentionTag !== "";
      default: return true;
    }
  };

  if (!isAuthenticated) return null;

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4a7c6f]/10 mb-6">
            <CheckCircle className="text-[#4a7c6f]" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-neutral-900">Item listed!</h1>
          <p className="text-neutral-500 mb-8">
            Your item is live on the marketplace. Our matching engine is already scanning for potential pairs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/marketplace">
              <Button className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
                View marketplace
              </Button>
            </Link>
            <Button variant="outline" onClick={() => { setSuccess(false); setStep(1); setForm({ title: "", description: "", category: "", condition: "", intentionTag: "", pairingKeyword: "", price: "", city: "", images: [] }); setImagePreviews([]); }}>
              List another item
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
            List your item
          </h1>
          <p className="text-neutral-500">
            That incomplete, broken, or singular thing — someone is looking for it.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s === step
                    ? 'bg-[#4a7c6f] text-white scale-110'
                    : s < step
                    ? 'bg-[#4a7c6f]/20 text-[#4a7c6f] cursor-pointer'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {s < step ? <CheckCircle size={16} /> : s}
              </button>
              {s < 4 && (
                <div className={`w-10 h-0.5 rounded-full ${s < step ? 'bg-[#4a7c6f]/30' : 'bg-neutral-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Card className="border border-neutral-100">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#4a7c6f]/10 flex items-center justify-center">
                      <FileText className="text-[#4a7c6f]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">Describe your item</h2>
                      <p className="text-sm text-neutral-400">Be specific — &quot;Left AirPod Pro 2nd gen&quot; gets matches faster than &quot;earphone&quot;</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Item name *</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Left Nike Air Max 90 — Size 42"
                      className="border-neutral-200 focus:border-[#4a7c6f] focus:ring-[#4a7c6f]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      placeholder="Describe the condition, what's missing, and anything a buyer should know..."
                      className="w-full px-3 py-2.5 text-base border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c6f]/20 focus:border-[#4a7c6f] resize-none"
                    />
                    <p className="text-xs text-neutral-400">{form.description.length}/500 characters</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Category & Condition */}
            {step === 2 && (
              <Card className="border border-neutral-100">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#4a7c6f]/10 flex items-center justify-center">
                      <Tag className="text-[#4a7c6f]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">Categorize it</h2>
                      <p className="text-sm text-neutral-400">Help buyers find your item with the right labels</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2.5 text-base border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c6f]/20 focus:border-[#4a7c6f] bg-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-neutral-700">Condition *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {conditions.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setForm({ ...form, condition: c.value })}
                          className={`text-left p-3 rounded-xl border-2 transition-all ${
                            form.condition === c.value
                              ? 'border-[#4a7c6f] bg-[#4a7c6f]/5'
                              : 'border-neutral-100 hover:border-neutral-200'
                          }`}
                        >
                          <p className="font-medium text-sm text-neutral-900">{c.label}</p>
                          <p className="text-xs text-neutral-400">{c.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Intent & Pricing */}
            {step === 3 && (
              <Card className="border border-neutral-100">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#4a7c6f]/10 flex items-center justify-center">
                      <Sparkles className="text-[#4a7c6f]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">What do you want to do with it?</h2>
                      <p className="text-sm text-neutral-400">Choose your intent — this helps us match you better</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {intentions.map((i) => {
                      const Icon = i.icon;
                      return (
                        <button
                          key={i.value}
                          type="button"
                          onClick={() => setForm({ ...form, intentionTag: i.value })}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            form.intentionTag === i.value
                              ? 'border-[#4a7c6f] bg-[#4a7c6f]/5'
                              : 'border-neutral-100 hover:border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${i.color}15` }}>
                              <Icon size={18} style={{ color: i.color }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-neutral-900">{i.label}</p>
                              <p className="text-xs text-neutral-400">{i.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {form.intentionTag === "SELL" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Price (₦)</label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="Enter your asking price"
                        className="border-neutral-200 focus:border-[#4a7c6f] focus:ring-[#4a7c6f]/20"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Pairing keyword <span className="text-neutral-400">(optional)</span>
                    </label>
                    <Input
                      value={form.pairingKeyword}
                      onChange={(e) => setForm({ ...form, pairingKeyword: e.target.value })}
                      placeholder="e.g. 'AirPod Pro right' — helps our matching engine"
                      className="border-neutral-200 focus:border-[#4a7c6f] focus:ring-[#4a7c6f]/20"
                    />
                    <p className="text-xs text-neutral-400">What would the matching item be called?</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Photos & Location */}
            {step === 4 && (
              <Card className="border border-neutral-100">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#4a7c6f]/10 flex items-center justify-center">
                      <Camera className="text-[#4a7c6f]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">Add photos & location</h2>
                      <p className="text-sm text-neutral-400">Items with photos get 5x more views</p>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-neutral-700">Photos (max 5, 3MB each)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200">
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                      {form.images.length < 5 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-[#4a7c6f] flex flex-col items-center justify-center text-neutral-400 hover:text-[#4a7c6f] transition-colors"
                        >
                          {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                          <span className="text-xs mt-1">{isUploading ? "..." : "Add"}</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      <MapPin size={14} className="inline mr-1" />
                      City <span className="text-neutral-400">(optional)</span>
                    </label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Lagos, Abuja, Port Harcourt"
                      className="border-neutral-200 focus:border-[#4a7c6f] focus:ring-[#4a7c6f]/20"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gap-2 bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white disabled:opacity-50"
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Post listing
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
