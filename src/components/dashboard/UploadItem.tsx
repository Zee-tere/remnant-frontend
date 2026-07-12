'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  CheckCircle,
  DollarSign,
  Gift,
  Heart,
  Image as ImageIcon,
  Loader2,
  Package,
  Recycle,
  RefreshCw,
  Store,
  UploadCloud,
  Wrench,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { listingCategories } from '@/lib/categories';
import { cn, formatCurrency } from '@/lib/utils';
import { listingsApi, uploadApi } from '@/lib/api';

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const conditions = [
  { label: 'New', value: 'NEW' },
  { label: 'Used - Like New', value: 'LIKE_NEW' },
  { label: 'Used - Good', value: 'GOOD' },
  { label: 'Used - Fair', value: 'FAIR' },
  { label: 'For Parts', value: 'POOR' },
];

const purposes = [
  { label: 'Sell', value: 'SELL', icon: Store, description: 'Find it a buyer.' },
  { label: 'Trade', value: 'TRADE', icon: RefreshCw, description: 'Swap for what you need.' },
  { label: 'Donate', value: 'DONATE', icon: Heart, description: 'Give it to someone who can use it.' },
  { label: 'Repair', value: 'FIX', icon: Wrench, description: 'Get help bringing it back.' },
  { label: 'Recycle', value: 'RECYCLE', icon: Recycle, description: 'Pass useful parts on.' },
] as const;

type PurposeValue = (typeof purposes)[number]['value'];

const purposeValues = purposes.map((purpose) => purpose.value);

const steps = [
  { label: 'Use', icon: Gift },
  { label: 'Photos', icon: Camera },
  { label: 'Details', icon: Package },
  { label: 'Review', icon: CheckCircle },
];

const purposeDisplay: Record<PurposeValue, string> = {
  SELL: 'Sell',
  TRADE: 'Trade',
  DONATE: 'Donate',
  FIX: 'Repair',
  RECYCLE: 'Recycle',
};

function normalizePurpose(value?: string): PurposeValue | '' {
  if (value && purposeValues.includes(value as PurposeValue)) return value as PurposeValue;
  return '';
}

function createInitialFormData(initialPurpose?: string) {
  return {
    name: '',
    description: '',
    category: '',
    price: '',
    location: '',
    condition: '',
    purpose: normalizePurpose(initialPurpose),
    tradeLookingFor: '',
    tradeTerms: '',
    donationMode: 'GIVEAWAY',
    recipientName: '',
    recipientContact: '',
    recipientNote: '',
    repairIssue: '',
    repairGoal: '',
    repairBudget: '',
    repairTimeline: '',
    recycleMaterial: '',
    recyclePreference: '',
    recycleQuantity: '',
    recycleNotes: '',
  };
}

interface UploadItemProps {
  initialPurpose?: string;
  isGuest?: boolean;
}

export default function UploadItem({ initialPurpose, isGuest = false }: UploadItemProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => createInitialFormData(initialPurpose));
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPurpose = purposes.find((purpose) => purpose.value === formData.purpose);
  const maxImages = isGuest ? 4 : 8;

  useEffect(() => {
    const nextPurpose = normalizePurpose(initialPurpose);
    if (!nextPurpose) return;
    setFormData((current) => ({ ...current, purpose: nextPurpose }));
    setStep(2);
  }, [initialPurpose]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handlePurposeSelect = (value: PurposeValue) => {
    setFormData((current) => ({ ...current, purpose: value }));
    setStep(2);
  };

  const validateStep = () => {
    if (step === 1 && !formData.purpose) {
      toast.error('Choose what this item is for');
      return false;
    }

    if (step === 2 && images.length === 0) {
      toast.error('Please add at least one photo');
      return false;
    }

    if (step === 3) {
      if (!formData.name || !formData.description || !formData.category || !formData.location || !formData.condition) {
        toast.error('Please complete the item basics');
        return false;
      }

      if (formData.purpose === 'SELL' && (!formData.price || Number(formData.price) <= 0)) {
        toast.error('Add a selling price');
        return false;
      }

      if (formData.purpose === 'TRADE' && !formData.tradeLookingFor) {
        toast.error('Tell people what you want to trade for');
        return false;
      }

      if (formData.purpose === 'FIX' && (!formData.repairIssue || !formData.repairGoal)) {
        toast.error('Add the repair issue and the outcome you want');
        return false;
      }

      if (formData.purpose === 'RECYCLE' && (!formData.recycleMaterial || !formData.recyclePreference)) {
        toast.error('Add the material type and recycle handoff preference');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, 4));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (images.length + incoming.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 3MB limit`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not supported. Use JPEG, PNG, or WebP.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;
    setImages((current) => [...current, ...validFiles]);
    setPreviewUrls((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPreviewUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearForm = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setFormData(createInitialFormData(initialPurpose));
    setImages([]);
    setPreviewUrls([]);
  };

  const buildCompatibilityAttributes = () => {
    const base = { flow: formData.purpose, guestListing: isGuest };

    if (formData.purpose === 'TRADE') {
      return {
        ...base,
        lookingFor: formData.tradeLookingFor,
        tradeTerms: formData.tradeTerms || undefined,
      };
    }

    if (formData.purpose === 'DONATE') {
      return {
        ...base,
        donationMode: formData.donationMode,
        recipientName: formData.recipientName || undefined,
        recipientContact: formData.recipientContact || undefined,
        recipientNote: formData.recipientNote || undefined,
      };
    }

    if (formData.purpose === 'FIX') {
      return {
        ...base,
        repairIssue: formData.repairIssue,
        repairGoal: formData.repairGoal,
        repairBudget: formData.repairBudget || undefined,
        repairTimeline: formData.repairTimeline || undefined,
      };
    }

    if (formData.purpose === 'RECYCLE') {
      return {
        ...base,
        materialType: formData.recycleMaterial,
        handoffPreference: formData.recyclePreference,
        quantity: formData.recycleQuantity || undefined,
        notes: formData.recycleNotes || undefined,
      };
    }

    return base;
  };

  const getPairingKeyword = () => {
    if (formData.purpose === 'TRADE') return formData.tradeLookingFor;
    if (formData.purpose === 'FIX') return formData.repairIssue;
    if (formData.purpose === 'RECYCLE') return formData.recycleMaterial;
    if (formData.purpose === 'DONATE') return formData.donationMode === 'RECIPIENT' ? 'reserved donation' : 'public giveaway';
    return formData.category;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateStep()) return;

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const uploadedImageUrls = isGuest
        ? await uploadApi.uploadGuestMultiple(images)
        : await uploadApi.uploadMultiple(images);

      setUploadProgress(80);

      const payload = {
        title: formData.name,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        intentionTag: formData.purpose,
        pairingKeyword: getPairingKeyword(),
        compatibilityAttributes: buildCompatibilityAttributes(),
        price: formData.purpose === 'SELL' ? formData.price : undefined,
        city: formData.location || undefined,
        images: uploadedImageUrls,
      };

      await (isGuest ? listingsApi.createGuestListing(payload) : listingsApi.createListing(payload));

      setUploadProgress(100);
      toast.success(isGuest ? 'Guest listing published' : 'Listing published', {
        description: isGuest
          ? 'Create an account later to add a profile.'
          : 'Your item is live on the marketplace.',
      });

      clearForm();
      setStep(1);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to publish item. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  const renderIntentStep = () => (
    <motion.div
      key="intent"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold md:text-3xl">What should happen to it?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-[var(--ink-soft)] md:text-base">
          Choose the path that fits best.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {purposes.map((purpose) => {
          const Icon = purpose.icon;
          const selected = formData.purpose === purpose.value;
          return (
            <button
              key={purpose.value}
              type="button"
              onClick={() => handlePurposeSelect(purpose.value)}
              className="cursor-pointer text-left"
              aria-pressed={selected}
            >
              <div
                className={cn(
                  'flex h-full flex-col rounded-[1.25rem] border-2 bg-white p-4 text-left transition-all active:scale-[0.99] md:rounded-[1.5rem] md:p-5',
                  selected ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)]/55 hover:border-[var(--brand)]/45',
                )}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] md:mb-4 md:h-14 md:w-14">
                  <Icon className="h-5 w-5 md:h-[25px] md:w-[25px]" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold md:text-xl">{purpose.label}</h3>
                <p className="mt-1.5 text-xs font-medium leading-5 text-[var(--ink-soft)] md:mt-2 md:text-sm md:leading-6">{purpose.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderPhotosStep = () => (
    <motion.div
      key="photos"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Show the piece</h2>
        <p className="mt-2 text-sm font-medium text-[var(--ink-soft)] md:text-base">
          Add clear photos from a few angles.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed p-6 text-center transition-all md:rounded-[2rem] md:p-12',
          dragActive ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)] bg-[var(--sand)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]',
        )}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--brand)] soft-shadow md:h-20 md:w-20">
          <UploadCloud className="h-8 w-8 md:h-[38px] md:w-[38px]" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold md:text-xl">Add photos</h3>
        <p className="mt-1 text-sm font-medium text-[var(--muted-foreground)] md:text-base">Tap to browse files</p>
        <p className="mt-4 text-sm font-semibold text-[var(--muted-foreground)]">
          JPG, PNG, or WebP. Max 3MB each. {maxImages} photos max.
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {previewUrls.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-bold">Photos ({previewUrls.length}/{maxImages})</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {previewUrls.map((url, index) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-[1.5rem] bg-[var(--sand)]">
                <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600 opacity-100 soft-shadow md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X size={16} aria-hidden="true" />
                </button>
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-bold text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={prevStep} className="rounded-full border-[var(--border)] bg-white font-bold">
          Back
        </Button>
        <Button type="button" onClick={nextStep} className="rounded-full bg-[var(--brand)] px-8 font-bold text-white hover:bg-[var(--brand-dark)]">
          Continue
        </Button>
      </div>
    </motion.div>
  );

  const renderRouteSpecificFields = () => {
    if (formData.purpose === 'SELL') {
      return (
        <div className="rounded-[1.5rem] bg-[var(--cream)] p-5 md:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <DollarSign size={20} aria-hidden="true" />
            Sale details
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">Selling price</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                NGN
              </span>
              <Input
                type="number"
                value={formData.price}
                onChange={(event) => handleInputChange('price', event.target.value)}
                className="rounded-full bg-white pl-16"
                required
              />
            </div>
          </label>
        </div>
      );
    }

    if (formData.purpose === 'TRADE') {
      return (
        <div className="grid gap-5 rounded-[1.5rem] bg-[var(--cream)] p-5 md:col-span-2 md:grid-cols-2">
          <h3 className="flex items-center gap-2 text-xl font-bold md:col-span-2">
            <RefreshCw size={20} aria-hidden="true" />
            Trade details
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">What would you trade for?</span>
            <Input
              value={formData.tradeLookingFor}
              onChange={(event) => handleInputChange('tradeLookingFor', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Right AirPod, chair leg, spare phone, etc."
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Trade terms</span>
            <Input
              value={formData.tradeTerms}
              onChange={(event) => handleInputChange('tradeTerms', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Local swap, shipping okay, flexible"
            />
          </label>
        </div>
      );
    }

    if (formData.purpose === 'DONATE') {
      return (
        <div className="space-y-5 rounded-[1.5rem] bg-[var(--cream)] p-5 md:col-span-2">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Heart size={20} aria-hidden="true" />
            How should the donation work?
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { value: 'GIVEAWAY', title: 'Open giveaway', text: 'Let interested people request it.' },
              { value: 'RECIPIENT', title: 'Reserved for someone', text: 'Keep the handoff for one person.' },
            ].map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  className="sr-only"
                  name="donationMode"
                  value={option.value}
                  checked={formData.donationMode === option.value}
                  onChange={(event) => handleInputChange('donationMode', event.target.value)}
                />
                <div
                  className={cn(
                    'h-full rounded-[1.25rem] border-2 bg-white p-4 transition-all',
                    formData.donationMode === option.value ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)]/55',
                  )}
                >
                  <p className="font-bold">{option.title}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--ink-soft)]">{option.text}</p>
                </div>
              </label>
            ))}
          </div>
          {formData.donationMode === 'RECIPIENT' && (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold">Recipient name</span>
                <Input
                  value={formData.recipientName}
                  onChange={(event) => handleInputChange('recipientName', event.target.value)}
                  className="rounded-full bg-white"
                  placeholder="Optional"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">Recipient phone or email</span>
                <Input
                  value={formData.recipientContact}
                  onChange={(event) => handleInputChange('recipientContact', event.target.value)}
                  className="rounded-full bg-white"
                  placeholder="Optional"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-bold">Private handoff note</span>
                <Textarea
                  value={formData.recipientNote}
                  onChange={(event) => handleInputChange('recipientNote', event.target.value)}
                  className="min-h-[110px] rounded-[1.5rem] bg-white text-base"
                  placeholder="Optional pickup or handoff note"
                />
              </label>
            </div>
          )}
        </div>
      );
    }

    if (formData.purpose === 'FIX') {
      return (
        <div className="grid gap-5 rounded-[1.5rem] bg-[var(--cream)] p-5 md:col-span-2 md:grid-cols-2">
          <h3 className="flex items-center gap-2 text-xl font-bold md:col-span-2">
            <Wrench size={20} aria-hidden="true" />
            What kind of help do you need?
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">What needs fixing?</span>
            <Input
              value={formData.repairIssue}
              onChange={(event) => handleInputChange('repairIssue', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Broken hinge, missing cable, torn seam"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Desired outcome</span>
            <Input
              value={formData.repairGoal}
              onChange={(event) => handleInputChange('repairGoal', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Repair, parts only, restoration"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Repair budget</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                NGN
              </span>
              <Input
                type="number"
                value={formData.repairBudget}
                onChange={(event) => handleInputChange('repairBudget', event.target.value)}
                className="rounded-full bg-white pl-16"
                placeholder="Optional"
              />
            </div>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Timeline</span>
            <Input
              value={formData.repairTimeline}
              onChange={(event) => handleInputChange('repairTimeline', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Optional"
            />
          </label>
        </div>
      );
    }

    if (formData.purpose === 'RECYCLE') {
      return (
        <div className="grid gap-5 rounded-[1.5rem] bg-[var(--cream)] p-5 md:col-span-2 md:grid-cols-2">
          <h3 className="flex items-center gap-2 text-xl font-bold md:col-span-2">
            <Recycle size={20} aria-hidden="true" />
            What can be reused?
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">Main material or part type</span>
            <Input
              value={formData.recycleMaterial}
              onChange={(event) => handleInputChange('recycleMaterial', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Metal, battery, wood, fabric, circuit board"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Handoff preference</span>
            <select
              value={formData.recyclePreference}
              onChange={(event) => handleInputChange('recyclePreference', event.target.value)}
              className="h-12 w-full rounded-full border border-[var(--border)] bg-white px-4 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
              required
            >
              <option value="">Choose option</option>
              <option value="PICKUP">Recycler pickup</option>
              <option value="DROPOFF">I can drop it off</option>
              <option value="SHIP">I can ship it</option>
              <option value="FLEXIBLE">Flexible</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Quantity or size</span>
            <Input
              value={formData.recycleQuantity}
              onChange={(event) => handleInputChange('recycleQuantity', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Optional"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Recycler notes</span>
            <Input
              value={formData.recycleNotes}
              onChange={(event) => handleInputChange('recycleNotes', event.target.value)}
              className="rounded-full bg-white"
              placeholder="Optional"
            />
          </label>
        </div>
      );
    }

    return null;
  };

  const renderDetailsStep = () => (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{selectedPurpose ? `${selectedPurpose.label} this item` : 'Tell us about it'}</h2>
        <p className="mt-2 text-sm font-medium text-[var(--ink-soft)] md:text-base">
          A few clear details help the right person find it.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold">Item name</span>
          <Input
            value={formData.name}
            onChange={(event) => handleInputChange('name', event.target.value)}
            className="rounded-full bg-white"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">Category</span>
          <select
            value={formData.category}
            onChange={(event) => handleInputChange('category', event.target.value)}
            className="h-12 w-full rounded-full border border-[var(--border)] bg-white px-4 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
            required
          >
            <option value="">Choose category</option>
            {listingCategories.map((category) => (
              <option key={category.label} value={category.label}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">Condition</span>
          <select
            value={formData.condition}
            onChange={(event) => handleInputChange('condition', event.target.value)}
            className="h-12 w-full rounded-full border border-[var(--border)] bg-white px-4 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
            required
          >
            <option value="">Choose condition</option>
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">
            {formData.purpose === 'RECYCLE' ? 'Pickup or handoff city' : 'City'}
          </span>
          <Input
            value={formData.location}
            onChange={(event) => handleInputChange('location', event.target.value)}
            className="rounded-full bg-white"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-bold">Description</span>
          <Textarea
            value={formData.description}
            onChange={(event) => handleInputChange('description', event.target.value)}
            className="min-h-[150px] rounded-[1.5rem] bg-white text-base"
            required
          />
        </label>

        {renderRouteSpecificFields()}
      </div>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={prevStep} className="rounded-full border-[var(--border)] bg-white font-bold">
          Back
        </Button>
        <Button type="button" onClick={nextStep} className="rounded-full bg-[var(--brand)] px-8 font-bold text-white hover:bg-[var(--brand-dark)]">
          Review
        </Button>
      </div>
    </motion.div>
  );

  const reviewTags = [
    formData.category,
    conditions.find((item) => item.value === formData.condition)?.label,
    selectedPurpose?.label,
    formData.purpose === 'TRADE' ? `Trade for: ${formData.tradeLookingFor}` : '',
    formData.purpose === 'DONATE' ? (formData.donationMode === 'RECIPIENT' ? 'Recipient reserved' : 'Public giveaway') : '',
    formData.purpose === 'RECYCLE' ? formData.recycleMaterial : '',
    formData.purpose === 'FIX' ? formData.repairIssue : '',
  ].filter(Boolean);

  const renderReviewStep = () => (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Review and publish</h2>
        <p className="mt-2 text-sm font-medium text-[var(--ink-soft)] md:text-base">
          Make sure it feels ready to share.
        </p>
      </div>

      {uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold text-[var(--ink-soft)]">
            <span>Publishing</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--sand)]">
            <motion.div animate={{ width: `${uploadProgress}%` }} className="h-full rounded-full bg-[var(--brand)]" />
          </div>
        </div>
      )}

      <div className="surface-card rounded-[1.5rem] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <ImageIcon size={20} aria-hidden="true" />
          Listing Preview
        </h3>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-[var(--sand)] md:w-36">
            {previewUrls[0] ? (
              <img src={previewUrls[0]} alt="Listing preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="text-[var(--muted-foreground)]" size={34} aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xl font-bold md:text-2xl">{formData.name || 'Untitled item'}</h4>
            {formData.purpose === 'SELL' && formData.price && (
              <p className="mt-1 text-xl font-bold text-[var(--brand)]">{formatCurrency(parseInt(formData.price, 10))}</p>
            )}
            {formData.purpose === 'DONATE' && (
              <p className="mt-1 text-lg font-bold text-[var(--brand)]">Free to a good home</p>
            )}
            {formData.purpose === 'FIX' && formData.repairBudget && (
              <p className="mt-1 text-lg font-bold text-[var(--brand)]">Repair budget: {formatCurrency(parseInt(formData.repairBudget, 10))}</p>
            )}
            <p className="mt-2 line-clamp-2 font-medium text-[var(--ink-soft)]">{formData.description || 'Description will appear here after you add it.'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reviewTags.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-bold text-[var(--brand)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse justify-between gap-3 md:flex-row">
        <Button type="button" variant="outline" onClick={prevStep} disabled={isUploading} className="rounded-full border-[var(--border)] bg-white font-bold">
          Back
        </Button>
        <Button
          type="submit"
          disabled={isUploading}
          className="rounded-full bg-[var(--brand)] px-8 font-bold text-white hover:bg-[var(--brand-dark)]"
        >
          {isUploading ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle size={17} />}
          {isUploading ? 'Publishing...' : 'Publish Listing'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7 text-center md:mb-10">
        <h1 className="text-[1.8rem] font-bold text-[var(--foreground)] md:text-5xl">Give it a next stop</h1>
        {(selectedPurpose || isGuest) && (
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-2 md:mt-5 md:gap-3">
            {selectedPurpose && (
              <span className="rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-bold text-[var(--brand)]">
                {purposeDisplay[selectedPurpose.value]}
              </span>
            )}
            {isGuest && (
              <span className="rounded-full bg-[#e2f7ff] px-4 py-2 text-sm font-bold text-[var(--secondary-blue)]">
                Guest
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-7 px-1 md:mb-10 md:px-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-[var(--sand)]" />
          <div
            className="absolute left-0 top-5 h-1 rounded-full bg-[var(--brand)] transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((item, index) => {
            const stepNumber = index + 1;
            const Icon = item.icon;
            const active = step >= stepNumber;
            return (
              <div key={item.label} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    active ? 'bg-[var(--brand)] text-white soft-shadow' : 'bg-white text-[var(--muted-foreground)]',
                  )}
                >
                  {step > stepNumber ? <CheckCircle size={19} aria-hidden="true" /> : <Icon size={19} aria-hidden="true" />}
                </div>
                <span className={cn('text-xs font-bold md:text-sm', active ? 'text-[var(--brand)]' : 'text-[var(--muted-foreground)]')}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="surface-card overflow-hidden rounded-[1.5rem] p-4 md:rounded-[2rem] md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && renderIntentStep()}
          {step === 2 && renderPhotosStep()}
          {step === 3 && renderDetailsStep()}
          {step === 4 && renderReviewStep()}
        </AnimatePresence>
      </form>
    </div>
  );
}
