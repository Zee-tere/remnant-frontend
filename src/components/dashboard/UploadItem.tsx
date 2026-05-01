'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadCloud, X, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { uploadApi, listingsApi } from '@/lib/api';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const UploadItem = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    location: '',
    condition: '',
    purpose: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Electronics & Gadgets',
    'Furniture & Home Decor',
    'Clothing & Fashion',
    'Vehicles & Auto Parts',
    'Books & Education',
    'Hobbies & Leisure',
    'Sports & Outdoor',
    'Kitchen & Home Essentials',
    'Tools & DIY',
    'Real Estate & Property',
    'Health & Beauty',
    'Pets & Animals',
    'Business & Industrial',
    'Toys & Games',
    'Musical Instruments',
    'Office & Stationery',
    'Collectibles & Antiques',
    'Baby & Kids',
    'Garden & Outdoor',
    'Event & Party Supplies',
  ];

  const conditions = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'For Parts'];
  const purposes = [
    { label: '✅ Looking to sell', value: 'sell' },
    { label: '🤝 Looking to trade/barter', value: 'trade' },
    { label: '🔄 Donate or give away', value: 'donate' },
    { label: '🔧 Looking for someone to fix/repurpose', value: 'fix' },
    { label: '♻️ Recycle', value: 'recycle' },
  ];

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.description || !formData.category)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (step === 2 && (!formData.location || !formData.condition || !formData.purpose)) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    if (images.length + fileArray.length > 8) {
      toast.error('Maximum 8 images allowed');
      return;
    }

    // Validate file size and type
    const validFiles: File[] = [];
    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 3MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported format. Use JPEG, PNG, or WebP.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...previews]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-green-500', 'bg-green-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
    
    const files = e.dataTransfer.files;
    if (!files) return;

    const fileArray = Array.from(files);
    if (images.length + fileArray.length > 8) {
      toast.error('Maximum 8 images allowed');
      return;
    }

    // Validate file size and type
    const validFiles: File[] = [];
    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 3MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported format. Use JPEG, PNG, or WebP.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setImages(prev => [...prev, ...validFiles]);
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...previews]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previewUrls];
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.name || !formData.description || !formData.category || 
        !formData.location || !formData.condition || !formData.purpose) {
      toast.error('Please fill out all required fields.');
      return;
    }
  
    if (images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }
  
    setIsUploading(true);
    setUploadProgress(10);
  
    try {
      const uploadedImageUrls: string[] = [];
      
      // Upload images sequentially
      for (const [index, image] of images.entries()) {
        setUploadProgress(Math.round(((index + 1) / images.length) * 60) + 10);
        
        try {
          const imageUrl = await uploadApi.uploadFile(image);
          uploadedImageUrls.push(imageUrl);
        } catch (error) {
          console.error('Image upload failed:', error);
          toast.error(`Failed to upload ${image.name}`);
        }
      }
  
      setUploadProgress(80);
  
      // Map purpose to backend IntentionTag
      const purposeMap: Record<string, string> = {
        'sell': 'SELL', 'trade': 'TRADE', 'donate': 'DONATE', 'fix': 'FIX', 'recycle': 'RECYCLE',
      };
      const conditionMap: Record<string, string> = {
        'New': 'NEW', 'Used - Like New': 'LIKE_NEW', 'Used - Good': 'GOOD', 'Used - Fair': 'FAIR', 'For Parts': 'POOR',
      };
      const purposeValue = purposes.find(p => p.label === formData.purpose)?.value || 'sell';

      await listingsApi.createListing({
        title: formData.name,
        description: formData.description,
        category: formData.category,
        condition: conditionMap[formData.condition] || 'GOOD',
        intentionTag: purposeMap[purposeValue] || 'SELL',
        price: formData.price || undefined,
        city: formData.location || undefined,
        images: uploadedImageUrls,
      });
  
      // Complete upload
      setUploadProgress(100);
      
      toast.success('Item uploaded successfully!', {
        description: 'Your listing is now live on the marketplace.',
      });
      
      // Reset form
      clearForm();
      setStep(1);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload item. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      location: '',
      condition: '',
      purpose: '',
    });
    setImages([]);
    setPreviewUrls([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-black p-4">
      <Card className="max-w-4xl w-full mx-auto shadow-2xl rounded-3xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">List Your Item</CardTitle>
              <p className="text-green-100 mt-2">
                Reach thousands of buyers looking for single items and pairs
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                    step === stepNum 
                      ? "bg-white text-green-600 scale-110" 
                      : step > stepNum 
                        ? "bg-green-400 text-white" 
                        : "bg-white/20 text-white"
                  )}>
                    {step > stepNum ? '✓' : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={cn(
                      "w-8 h-1 mx-2 transition-all",
                      step > stepNum ? "bg-green-400" : "bg-white/20"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Item Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Left AirPod Pro, Single Gold Earring"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Category *
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full h-12 justify-between text-left"
                            >
                              {formData.category || 'Select a category'}
                              <span>▼</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto">
                            {categories.map((cat) => (
                              <DropdownMenuItem
                                key={cat}
                                onClick={() => handleInputChange('category', cat)}
                                className="py-3"
                              >
                                {cat}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Price (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                            ₦
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="h-12 pl-8"
                          />
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                          Leave empty for 'Price on request' or 'Free'
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description *
                      </label>
                      <Textarea
                        placeholder="Describe your item in detail. Include brand, size, color, condition, and any unique features..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="min-h-[180px] text-lg"
                        rows={6}
                      />
                      <p className="text-xs text-neutral-500 mt-2">
                        Detailed descriptions get 3x more views
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="w-full md:w-auto float-right"
                      disabled={!formData.name || !formData.description || !formData.category}
                    >
                      Continue to Details →
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Location *
                        </label>
                        <Input
                          type="text"
                          placeholder="City, State"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="h-12"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Condition *
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-between">
                              {formData.condition || 'Select condition'}
                              <span>▼</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {conditions.map((cond) => (
                              <DropdownMenuItem
                                key={cond}
                                onClick={() => handleInputChange('condition', cond)}
                                className="py-3"
                              >
                                {cond}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          What's your intent? *
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-between">
                              {formData.purpose || 'Select purpose'}
                              <span>▼</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {purposes.map((purpose) => (
                              <DropdownMenuItem
                                key={purpose.value}
                                onClick={() => handleInputChange('purpose', purpose.label)}
                                className="py-3"
                              >
                                {purpose.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          💡 Smart Matching Tip
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Items with clear intent tags get matched 5x faster with potential buyers or trading partners.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      ← Back
                    </Button>
                    <Button type="button" onClick={nextStep}>
                      Add Photos →
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Upload Photos</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Add up to 10 photos. First photo will be the cover image.
                    </p>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-3 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10"
                    >
                      <UploadCloud className="w-16 h-16 text-neutral-400 mb-4" />
                      <h4 className="text-lg font-semibold mb-2">Drag & drop photos here</h4>
                      <p className="text-neutral-500 mb-4">or click to browse files</p>
                      <p className="text-sm text-neutral-400">
                        Supported: JPG, PNG, WebP • Max 3MB each
                      </p>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>

                    {previewUrls.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-semibold mb-4">
                          Photos ({previewUrls.length}/8)
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {previewUrls.map((url, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative aspect-square rounded-xl overflow-hidden border group"
                            >
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(index);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full transform scale-0 group-hover:scale-100 transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              {index === 0 && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  Cover
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {previewUrls.length < 8 && (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50/50"
                            >
                              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2">
                                <ImageIcon className="text-neutral-400" size={24} />
                              </div>
                              <span className="text-sm text-neutral-500">Add more</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t flex flex-col-reverse md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={isUploading}
                      >
                        ← Back
                      </Button>
                      <p className="text-xs text-neutral-500">
                        You can edit details after posting
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="submit"
                        disabled={isUploading || images.length === 0}
                        className="w-full md:w-auto min-w-[200px]"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2" />
                            Publish Listing
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-neutral-500 text-right">
                        Your listing will go live immediately
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          {/* Preview Card */}
          {formData.name && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 rounded-2xl border"
            >
              <h4 className="font-bold mb-4">📱 Listing Preview</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                  {previewUrls[0] ? (
                    <img
                      src={previewUrls[0]}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="text-neutral-400" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-lg">{formData.name || 'Your Item Name'}</h5>
                  {formData.price && (
                    <p className="text-xl font-bold text-green-600 mt-1">
                      ₦{parseInt(formData.price).toLocaleString()}
                    </p>
                  )}
                  <p className="text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                    {formData.description || 'Item description will appear here'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.category && (
                      <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm">
                        {formData.category}
                      </span>
                    )}
                    {formData.condition && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                        {formData.condition}
                      </span>
                    )}
                    {formData.purpose && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm">
                        {formData.purpose.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadItem;