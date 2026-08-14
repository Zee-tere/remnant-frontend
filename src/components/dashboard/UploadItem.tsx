'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Gift,
  Heart,
  Image as ImageIcon,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Recycle,
  RefreshCw,
  ScanSearch,
  Send,
  Wrench,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { listingCategories } from '@/lib/categories';
import { getApiErrorMessage } from '@/lib/errors';
import { cn, formatCurrency } from '@/lib/utils';
import { authApi, listingsApi, uploadApi } from '@/lib/api';
import { nigerianStates } from '@/lib/nigeria-locations';
import { NairaIcon } from '@/components/ui/naira-icon';
import { optimizeImageFile } from '@/lib/image-optimization';
import { listingConditions } from '@/lib/listing-conditions';
import { formatMoneyInput, normalizeMoneyInput } from '@/lib/money-input';
import { ActionArtwork, type ActionArtworkName } from '@/components/brand/ActionArtwork';
import { IntentBadge } from '@/components/ui/intent-badge';
import {
  directContactLabels,
  directContactMethods,
  directContactPlaceholders,
  isPlausibleDirectContact,
  type DirectContactMethod,
} from '@/lib/direct-contact';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const purposes = [
  { label: 'Sell', value: 'SELL', artwork: 'sell' as ActionArtworkName, description: 'Find it a buyer.' },
  { label: 'Trade', value: 'TRADE', artwork: 'trade' as ActionArtworkName, description: 'Swap for what you need.' },
  { label: 'Donate', value: 'DONATE', artwork: 'donate' as ActionArtworkName, description: 'Give it to someone who can use it.' },
  { label: 'Repair', value: 'FIX', artwork: 'repair' as ActionArtworkName, description: 'Get help bringing it back.' },
  { label: 'Recycle', value: 'RECYCLE', artwork: 'recycle' as ActionArtworkName, description: 'Pass useful parts on.' },
] as const;

type PurposeValue = (typeof purposes)[number]['value'];

const purposeValues = purposes.map((purpose) => purpose.value);

const steps = [
  { label: 'Use', icon: Gift },
  { label: 'Photos', icon: Camera },
  { label: 'Details', icon: Package },
  { label: 'Review', icon: CheckCircle },
];

function RequiredMark() {
  return (
    <>
      <span className="ml-0.5 text-[var(--brand)]" aria-hidden="true">*</span>
      <span className="sr-only"> required</span>
    </>
  );
}

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
    needsPair: false,
    pairNeeded: '',
    pairType: '',
    pairSide: '',
    pairBrand: '',
    pairModel: '',
    pairGeneration: '',
    pairSize: '',
    pairSizeSystem: '',
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
    guestName: '',
    guestContactMethod: 'WHATSAPP' as DirectContactMethod,
    guestContactValue: '',
  };
}

interface UploadItemProps {
  initialPurpose?: string;
  isGuest?: boolean;
}

export default function UploadItem({ initialPurpose, isGuest = false }: UploadItemProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => createInitialFormData(initialPurpose));
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validationErrorRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const clientRequestIdRef = useRef<string | null>(null);
  const guestTokenRef = useRef<string | null>(null);
  const selectedPurpose = purposes.find((purpose) => purpose.value === formData.purpose);
  const maxImages = isGuest ? 4 : 8;
  const descriptionLength = formData.description.trim().length;
  const descriptionError = descriptionTouched && descriptionLength < 3
    ? (descriptionLength === 0 ? 'Description is required.' : 'Description must be at least 3 characters.')
    : '';

  useEffect(() => {
    const nextPurpose = normalizePurpose(initialPurpose);
    if (!nextPurpose) return;
    setFormData((current) => ({ ...current, purpose: nextPurpose }));
    setStep(2);
  }, [initialPurpose]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setValidationError('');
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handlePurposeSelect = (value: PurposeValue) => {
    setValidationError('');
    setFormData((current) => ({ ...current, purpose: value }));
    setStep(2);
  };

  const showValidationError = (message: string) => {
    setValidationError(message);
    window.requestAnimationFrame(() => validationErrorRef.current?.focus());
    return false;
  };

  const validateStep = () => {
    if (step === 1 && !formData.purpose) {
      return showValidationError('Choose what this item is for.');
    }

    if (step === 2 && images.length === 0) {
      return showValidationError('Add at least one clear photo before continuing.');
    }

    if (step === 3) {
      if (!formData.name.trim() || !formData.category || !formData.location || !formData.condition) {
        return showValidationError('Complete the item name, category, condition, and state.');
      }

      if (descriptionLength < 3) {
        setDescriptionTouched(true);
        return showValidationError('Description must be at least 3 characters.');
      }

      if (formData.purpose === 'SELL' && (!formData.price || Number(formData.price) <= 0)) {
        return showValidationError('Add a selling price greater than zero.');
      }

      if (formData.needsPair && !formData.pairNeeded.trim()) {
        return showValidationError('Describe the missing piece this item needs.');
      }
      if (formData.needsPair && !formData.pairType) {
        return showValidationError('Choose the kind of pair you are trying to complete.');
      }
      if (formData.needsPair && ['SHOE', 'GLOVE', 'EARBUD'].includes(formData.pairType) && !formData.pairSide) {
        return showValidationError('Choose the side of the piece you already have.');
      }
      if (formData.needsPair && ['SHOE', 'GLOVE'].includes(formData.pairType) && (!formData.pairSize || !formData.pairSizeSystem)) {
        return showValidationError('Add the size and size system for this pair.');
      }
      if (formData.needsPair && formData.pairType === 'EARBUD' && (!formData.pairBrand || !formData.pairModel)) {
        return showValidationError('Add the earbud brand and model so incompatible parts are excluded.');
      }

      if (formData.purpose === 'TRADE' && !formData.tradeLookingFor) {
        return showValidationError('Tell people what you would like to receive in the trade.');
      }

      if (formData.purpose === 'FIX' && (!formData.repairIssue || !formData.repairGoal)) {
        return showValidationError('Add both the repair issue and the outcome you want.');
      }

      if (formData.purpose === 'RECYCLE' && (!formData.recycleMaterial || !formData.recyclePreference)) {
        return showValidationError('Add the material type and a recycle handoff preference.');
      }

      if (isGuest && formData.guestName.trim().length < 2) {
        return showValidationError('Add the name buyers should see.');
      }
      if (isGuest && !isPlausibleDirectContact(formData.guestContactMethod, formData.guestContactValue)) {
        return showValidationError(`Add a valid ${directContactLabels[formData.guestContactMethod]} contact.`);
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setValidationError('');
    setStep((current) => Math.min(current + 1, 4));
  };

  const prevStep = () => {
    setValidationError('');
    setStep((current) => Math.max(current - 1, 1));
  };

  const addFiles = async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (images.length + incoming.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = incoming.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not supported. Use JPEG, PNG, or WebP.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    setIsOptimizing(true);
    try {
      const optimizedFiles: File[] = [];
      for (const file of validFiles) {
        try {
          optimizedFiles.push(await optimizeImageFile(file));
        } catch {
          toast.error(`${file.name} couldn’t be added. Use a JPG, PNG or WebP image under 3 MB.`);
        }
      }

      if (optimizedFiles.length > 0) {
        setImages((current) => [...current, ...optimizedFiles]);
        setPreviewUrls((current) => [...current, ...optimizedFiles.map((file) => URL.createObjectURL(file))]);
        toast.success(`${optimizedFiles.length} ${optimizedFiles.length === 1 ? 'photo' : 'photos'} optimized`);
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles(event.target.files);
    event.target.value = '';
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
    void addFiles(event.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPreviewUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const buildCompatibilityAttributes = () => {
    const base = {
      flow: formData.purpose,
      guestListing: isGuest,
      needsPair: formData.needsPair || undefined,
      pairingType: formData.needsPair ? formData.pairType || undefined : undefined,
      neededPiece: formData.needsPair ? formData.pairNeeded : undefined,
      side: formData.needsPair ? formData.pairSide || undefined : undefined,
      brand: formData.needsPair ? formData.pairBrand || undefined : undefined,
      model: formData.needsPair ? formData.pairModel || undefined : undefined,
      generation: formData.needsPair ? formData.pairGeneration || undefined : undefined,
      size: formData.needsPair ? formData.pairSize || undefined : undefined,
      sizeSystem: formData.needsPair ? formData.pairSizeSystem || undefined : undefined,
    };

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
    if (formData.needsPair) return formData.pairNeeded;
    if (formData.purpose === 'TRADE') return formData.tradeLookingFor;
    if (formData.purpose === 'FIX') return formData.repairIssue;
    if (formData.purpose === 'RECYCLE') return formData.recycleMaterial;
    if (formData.purpose === 'DONATE') return formData.donationMode === 'RECIPIENT' ? 'reserved donation' : 'public giveaway';
    return undefined;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (submittingRef.current) return;

    if (!validateStep()) return;

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    submittingRef.current = true;
    setIsUploading(true);
    setUploadProgress(10);

    try {
      if (!clientRequestIdRef.current) clientRequestIdRef.current = crypto.randomUUID();
      if (isGuest && !guestTokenRef.current) {
        const session = await authApi.createGuestSession(formData.guestName.trim());
        guestTokenRef.current = session.token;
      }
      const uploaded = isGuest
        ? await uploadApi.uploadGuestMultiple(images, guestTokenRef.current!)
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
        price: formData.purpose === 'SELL' ? formData.price || undefined : undefined,
        city: formData.location || undefined,
        images: uploaded.urls,
        uploadIds: uploaded.uploadIds,
        clientRequestId: clientRequestIdRef.current,
        ...(isGuest ? {
          contactMethod: formData.guestContactMethod,
          contactValue: formData.guestContactValue.trim(),
        } : {}),
      };

      const listing = await (isGuest
        ? listingsApi.createGuestListing(payload, guestTokenRef.current!)
        : listingsApi.createListing(payload));

      setUploadProgress(100);
      toast.success(isGuest ? 'Guest listing published' : 'Listing published', {
        description: isGuest
          ? 'It will stay live for 7 days. Your private management link is ready.'
          : 'Your item is live on the marketplace.',
      });

      if (isGuest && typeof listing.managementToken === 'string') {
        try {
          window.localStorage.setItem(`remnant-guest-listing:${listing.id}`, listing.managementToken);
          window.localStorage.setItem('remnant-guest-identity', listing.managementToken);
        } catch {
          // The URL still carries the one-time management key when storage is unavailable.
        }
        router.push(`/manage-listing/${listing.id}#token=${encodeURIComponent(listing.managementToken)}`);
        return;
      }
      router.push(`/marketplace/${listing.slug || listing.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'We couldn’t publish your item. Your details are still here—please try again.'));
    } finally {
      submittingRef.current = false;
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  const renderIntentStep = () => (
    <motion.div
      key="intent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="space-y-4 md:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold md:text-3xl">What should happen to it?</h2>
        <p className="mx-auto mt-1 max-w-2xl text-sm font-medium text-[var(--ink-soft)] md:mt-2 md:text-base">
          Choose the path that fits best.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {purposes.map((purpose) => {
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
                  'flex min-h-[154px] flex-col rounded-2xl border bg-white p-3 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.99] md:min-h-[205px] md:p-4',
                  selected ? 'border-[var(--brand)] bg-[var(--mint-soft)]' : 'border-[var(--border)]/45 hover:border-[var(--lavender)]/30',
                )}
              >
                <ActionArtwork name={purpose.artwork} className="mb-1 h-16 w-16 self-center md:h-28 md:w-28" />
                <h3 className="text-sm font-bold md:text-xl">{purpose.label}</h3>
                <p className="mt-1 text-[0.78rem] font-medium leading-5 text-[var(--ink-soft)] md:mt-2 md:text-sm md:leading-6">{purpose.description}</p>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
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
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-[border-color,background-color,transform] duration-150 md:rounded-2xl md:p-12',
          dragActive ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)] bg-[var(--sand)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]',
        )}
      >
        <ActionArtwork name={selectedPurpose?.artwork || 'sell'} className="mb-2 h-16 w-16 md:mb-3 md:h-28 md:w-28" />
        <h3 className="text-base font-bold md:text-xl">{isOptimizing ? 'Preparing photos...' : 'Add photos'}</h3>
        <p className="mt-1 text-sm font-medium text-[var(--muted-foreground)] md:text-base">
          {isOptimizing ? 'Making them faster to load' : 'Tap to browse files'}
        </p>
        <p className="mt-3 text-xs font-semibold leading-5 text-[var(--muted-foreground)] md:mt-4 md:text-sm">
          JPG, PNG, or WebP. We optimize each photo. {maxImages} photos max.
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
              <div key={url} className="group relative aspect-square overflow-hidden rounded-card bg-[var(--sand)]">
                <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  data-keep-round
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-pill bg-white text-red-600 opacity-100 soft-shadow md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X size={16} aria-hidden="true" />
                </button>
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-pill bg-[var(--brand)] px-3 py-1 text-xs font-bold text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={prevStep} className="border-[var(--border)] bg-white font-bold">
          Back
        </Button>
        <Button type="button" onClick={nextStep} disabled={isOptimizing} className="bg-[var(--brand)] px-8 font-bold text-white hover:bg-[var(--brand-dark)]">
          {isOptimizing ? <Loader2 className="animate-spin" size={16} /> : null}
          Continue
        </Button>
      </div>
    </motion.div>
  );

  const renderPairFields = () => {
    if (formData.needsPair) {
      return (
        <div className="grid gap-3 rounded-card bg-[var(--brand-soft)] p-3.5 md:col-span-2 md:grid-cols-2 md:gap-4 md:p-5">
          <div className="md:col-span-2">
            <h3 className="text-base font-bold md:text-xl">Missing piece details</h3>
            <p className="mt-1 text-xs font-medium leading-5 text-[var(--ink-soft)] md:text-sm">
              This stays attached to the item so people can see what completes it.
            </p>
          </div>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-bold">Missing piece<RequiredMark /></span>
            <Input
              value={formData.pairNeeded}
              onChange={(event) => handleInputChange('pairNeeded', event.target.value)}
              className="bg-white"
              placeholder="Right AirPod Pro 2 earbud"
              required
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold">Pair type<RequiredMark /></span>
            <Select
              value={formData.pairType}
              onChange={(event) => handleInputChange('pairType', event.target.value)}
              className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-3 text-base font-medium outline-none focus:border-[var(--brand)]"
              required
            >
              <option value="">Choose a type</option>
              <option value="SHOE">Shoe</option>
              <option value="GLOVE">Glove</option>
              <option value="EARBUD">Earbud</option>
              <option value="EARRING">Earring</option>
              <option value="LID_OR_COVER">Lid or cover</option>
              <option value="OTHER_PAIR">Other paired item</option>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold">
              Side or position
              {['SHOE', 'GLOVE', 'EARBUD'].includes(formData.pairType) && <RequiredMark />}
            </span>
            <Select
              value={formData.pairSide}
              onChange={(event) => handleInputChange('pairSide', event.target.value)}
              className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-3 text-base font-medium outline-none focus:border-[var(--brand)]"
              required={['SHOE', 'GLOVE', 'EARBUD'].includes(formData.pairType)}
            >
              <option value="">Not applicable</option>
              {['left', 'right', 'top', 'bottom', 'front', 'back', 'upper', 'lower'].map((side) => (
                <option key={side} value={side}>{side[0].toUpperCase() + side.slice(1)}</option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold">Brand {formData.pairType === 'EARBUD' ? <RequiredMark /> : <span className="font-medium text-[var(--muted-foreground)]">(optional)</span>}</span>
            <Input value={formData.pairBrand} onChange={(event) => handleInputChange('pairBrand', event.target.value)} className="bg-white" required={formData.pairType === 'EARBUD'} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold">Model {formData.pairType === 'EARBUD' ? <RequiredMark /> : <span className="font-medium text-[var(--muted-foreground)]">(optional)</span>}</span>
            <Input value={formData.pairModel} onChange={(event) => handleInputChange('pairModel', event.target.value)} className="bg-white" required={formData.pairType === 'EARBUD'} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold">Generation <span className="font-medium text-[var(--muted-foreground)]">(optional)</span></span>
            <Input value={formData.pairGeneration} onChange={(event) => handleInputChange('pairGeneration', event.target.value)} className="bg-white" placeholder="For example: 2nd generation" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold">Size {['SHOE', 'GLOVE'].includes(formData.pairType) ? <RequiredMark /> : <span className="font-medium text-[var(--muted-foreground)]">(when applicable)</span>}</span>
            <Input value={formData.pairSize} onChange={(event) => handleInputChange('pairSize', event.target.value)} className="bg-white" inputMode="decimal" placeholder="10 or 10.5" required={['SHOE', 'GLOVE'].includes(formData.pairType)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold">Size system{['SHOE', 'GLOVE'].includes(formData.pairType) && <RequiredMark />}</span>
            <Select
              value={formData.pairSizeSystem}
              onChange={(event) => handleInputChange('pairSizeSystem', event.target.value)}
              className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-3 text-base font-medium outline-none focus:border-[var(--brand)]"
              required={['SHOE', 'GLOVE'].includes(formData.pairType)}
            >
              <option value="">Not applicable</option>
              <option value="UK">UK</option>
              <option value="US">US</option>
              <option value="EU">EU</option>
              <option value="CM">Centimetres</option>
            </Select>
          </label>
        </div>
      );
    }

    return null;
  };

  const renderRouteSpecificFields = () => {
    if (formData.purpose === 'SELL') {
      return (
        <div className="rounded-surface bg-[var(--cream)] p-5 md:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <NairaIcon size={20} />
            Sale details
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">Selling price<RequiredMark /></span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                ₦
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={formatMoneyInput(formData.price)}
                onChange={(event) => handleInputChange('price', normalizeMoneyInput(event.target.value))}
                className="bg-white pl-10"
                placeholder="0"
                required
              />
            </div>
          </label>
        </div>
      );
    }

    if (formData.purpose === 'TRADE') {
      return (
        <div className="grid gap-5 rounded-surface bg-[var(--cream)] p-5 md:col-span-2 md:grid-cols-2">
          <h3 className="flex items-center gap-2 text-xl font-bold md:col-span-2">
            <RefreshCw size={20} aria-hidden="true" />
            Trade details
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">What would you trade for?<RequiredMark /></span>
            <Input
              value={formData.tradeLookingFor}
              onChange={(event) => handleInputChange('tradeLookingFor', event.target.value)}
              className="bg-white"
              placeholder="Right AirPod, chair leg, spare phone, etc."
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Trade terms</span>
            <Input
              value={formData.tradeTerms}
              onChange={(event) => handleInputChange('tradeTerms', event.target.value)}
              className="bg-white"
              placeholder="Local swap, shipping okay, flexible"
            />
          </label>
        </div>
      );
    }

    if (formData.purpose === 'DONATE') {
      return (
        <div className="space-y-5 rounded-surface bg-[var(--cream)] p-5 md:col-span-2">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Heart size={20} aria-hidden="true" />
            How should the donation work?
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { value: 'GIVEAWAY', title: 'Open giveaway', text: 'Let interested people request it.', disabled: false },
              { value: 'RECIPIENT', title: 'Reserved for someone', text: 'Recipient matching is being prepared.', disabled: true },
            ].map((option) => (
              <label key={option.value} className={option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
                <input
                  type="radio"
                  className="sr-only"
                  name="donationMode"
                  value={option.value}
                  checked={formData.donationMode === option.value}
                  onChange={(event) => handleInputChange('donationMode', event.target.value)}
                  disabled={option.disabled}
                />
                <div
                  className={cn(
                    'h-full rounded-xl border bg-white p-4 transition-[border-color,background-color] duration-150',
                    formData.donationMode === option.value ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)]/55',
                    option.disabled && 'opacity-55',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{option.title}</p>
                    {option.disabled && <span className="rounded-pill bg-[var(--sand)] px-2 py-1 text-xs font-bold uppercase text-[var(--ink-soft)]">Coming soon</span>}
                  </div>
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
                  className="bg-white"
                  placeholder="Optional"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">Recipient phone or email</span>
                <Input
                  value={formData.recipientContact}
                  onChange={(event) => handleInputChange('recipientContact', event.target.value)}
                  className="bg-white"
                  placeholder="Optional"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-bold">Private handoff note</span>
                <Textarea
                  value={formData.recipientNote}
                  onChange={(event) => handleInputChange('recipientNote', event.target.value)}
                  className="min-h-[110px] bg-white text-base"
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
        <div className="grid gap-5 rounded-surface bg-[var(--cream)] p-5 md:col-span-2 md:grid-cols-2">
          <h3 className="flex items-center gap-2 text-xl font-bold md:col-span-2">
            <Wrench size={20} aria-hidden="true" />
            What kind of help do you need?
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">What needs fixing?<RequiredMark /></span>
            <Input
              value={formData.repairIssue}
              onChange={(event) => handleInputChange('repairIssue', event.target.value)}
              className="bg-white"
              placeholder="Broken hinge, missing cable, torn seam"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Desired outcome<RequiredMark /></span>
            <Input
              value={formData.repairGoal}
              onChange={(event) => handleInputChange('repairGoal', event.target.value)}
              className="bg-white"
              placeholder="Repair, parts only, restoration"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Repair budget</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                ₦
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={formatMoneyInput(formData.repairBudget)}
                onChange={(event) => handleInputChange('repairBudget', normalizeMoneyInput(event.target.value))}
                className="bg-white pl-10"
                placeholder="Optional"
              />
            </div>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Timeline</span>
            <Input
              value={formData.repairTimeline}
              onChange={(event) => handleInputChange('repairTimeline', event.target.value)}
              className="bg-white"
              placeholder="Optional"
            />
          </label>
        </div>
      );
    }

    if (formData.purpose === 'RECYCLE') {
      return (
        <div className="grid gap-5 rounded-surface bg-[var(--cream)] p-5 md:col-span-2 md:grid-cols-2">
          <h3 className="flex items-center gap-2 text-xl font-bold md:col-span-2">
            <Recycle size={20} aria-hidden="true" />
            What can be reused?
          </h3>
          <label className="space-y-2">
            <span className="text-sm font-bold">Main material or part type<RequiredMark /></span>
            <Input
              value={formData.recycleMaterial}
              onChange={(event) => handleInputChange('recycleMaterial', event.target.value)}
              className="bg-white"
              placeholder="Metal, battery, wood, fabric, circuit board"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Handoff preference<RequiredMark /></span>
            <Select
              value={formData.recyclePreference}
              onChange={(event) => handleInputChange('recyclePreference', event.target.value)}
              className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-4 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
              required
            >
              <option value="">Choose option</option>
              <option value="PICKUP">Recycler pickup</option>
              <option value="DROPOFF">I can drop it off</option>
              <option value="SHIP">I can ship it</option>
              <option value="FLEXIBLE">Flexible</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Quantity or size</span>
            <Input
              value={formData.recycleQuantity}
              onChange={(event) => handleInputChange('recycleQuantity', event.target.value)}
              className="bg-white"
              placeholder="Optional"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">Recycler notes</span>
            <Input
              value={formData.recycleNotes}
              onChange={(event) => handleInputChange('recycleNotes', event.target.value)}
              className="bg-white"
              placeholder="Optional"
            />
          </label>
        </div>
      );
    }

    return null;
  };

  const renderGuestContactFields = () => {
    if (!isGuest) return null;

    return (
      <fieldset className="rounded-2xl border border-black/10 bg-white p-4 md:col-span-2 md:p-6">
        <legend className="sr-only">Guest seller and contact</legend>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Buyer contact</p>
          <h3 className="mt-1 text-xl font-bold tracking-[-0.025em] text-[#111]">How should buyers reach you?</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">Your selected contact will appear on this listing. Buyers will contact you there; no Remnant inbox or account is needed.</p>
          <p className="mt-2 text-xs font-medium leading-5 text-[var(--muted-foreground)]">This guest listing will be removed automatically 7 days after publishing.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-bold">Display name<RequiredMark /></span>
            <Input
              value={formData.guestName}
              onChange={(event) => handleInputChange('guestName', event.target.value)}
              className="h-12 rounded-xl border-black/15 bg-white px-4 text-base focus-visible:ring-black/15"
              placeholder="The name buyers should see"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              required
            />
          </label>
          <div className="space-y-1.5">
            <span className="text-sm font-bold">Contact with<RequiredMark /></span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Contact method">
              {directContactMethods.map((method) => {
                const Icon = method === 'EMAIL' ? Mail : method === 'TELEGRAM' ? Send : MessageCircle;
                const selected = formData.guestContactMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleInputChange('guestContactMethod', method)}
                    className={`flex min-h-12 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold transition-colors ${selected ? 'border-[#111] bg-[#111] text-white' : 'border-black/15 bg-white text-[#333] hover:border-black/35'}`}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span className="hidden sm:inline">{directContactLabels[method]}</span>
                    <span className="sm:hidden">{method === 'WHATSAPP' ? 'WhatsApp' : directContactLabels[method]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-sm font-bold">{directContactLabels[formData.guestContactMethod]} details<RequiredMark /></span>
            <Input
              value={formData.guestContactValue}
              onChange={(event) => handleInputChange('guestContactValue', event.target.value)}
              className="h-12 rounded-xl border-black/15 bg-white px-4 text-base focus-visible:ring-black/15"
              placeholder={directContactPlaceholders[formData.guestContactMethod]}
              inputMode={formData.guestContactMethod === 'WHATSAPP' ? 'tel' : formData.guestContactMethod === 'EMAIL' ? 'email' : 'text'}
              autoComplete={formData.guestContactMethod === 'WHATSAPP' ? 'tel' : formData.guestContactMethod === 'EMAIL' ? 'email' : 'off'}
              maxLength={254}
              required
            />
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">Only share a contact you are comfortable displaying publicly.</p>
          </label>
        </div>
      </fieldset>
    );
  };

  const renderDetailsStep = () => (
    <motion.div
      key="details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{selectedPurpose ? `${selectedPurpose.label} this item` : 'Tell us about it'}</h2>
        <p className="mt-2 text-sm font-medium text-[var(--ink-soft)] md:text-base">
          A few clear details help the right person find it.
        </p>
        <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]"><span className="text-[var(--brand)]" aria-hidden="true">*</span> Required fields</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <label className="space-y-2">
          <span className="text-sm font-bold">Item name<RequiredMark /></span>
          <Input
            value={formData.name}
            onChange={(event) => handleInputChange('name', event.target.value)}
            className="bg-white"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">Category<RequiredMark /></span>
          <Select
            value={formData.category}
            onChange={(event) => handleInputChange('category', event.target.value)}
            className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-4 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
            required
          >
            <option value="">Choose category</option>
            {listingCategories.map((category) => (
              <option key={category.label} value={category.label}>
                {category.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">Condition<RequiredMark /></span>
          <Select
            value={formData.condition}
            onChange={(event) => handleInputChange('condition', event.target.value)}
            className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-4 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
            required
          >
            <option value="">Choose condition</option>
            {listingConditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">
            {formData.purpose === 'RECYCLE' ? 'Pickup or handoff state' : 'State'}
            <RequiredMark />
          </span>
          <Select
            value={formData.location}
            onChange={(event) => handleInputChange('location', event.target.value)}
            className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-4 text-base font-semibold outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
            required
          >
            <option value="">Choose a state</option>
            {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
          </Select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-bold">Description<RequiredMark /></span>
          <Textarea
            value={formData.description}
            onChange={(event) => handleInputChange('description', event.target.value)}
            onBlur={() => setDescriptionTouched(true)}
            minLength={3}
            maxLength={2000}
            aria-invalid={Boolean(descriptionError)}
            aria-describedby="listing-description-help"
            className={cn(
              'min-h-[112px] bg-white text-base md:min-h-[150px]',
              descriptionError && 'border-red-500 focus-visible:ring-red-500/20',
            )}
            required
          />
          <p
            id="listing-description-help"
            role={descriptionError ? 'alert' : undefined}
            className={cn('text-xs font-medium', descriptionError ? 'text-red-700' : 'text-[var(--muted-foreground)]')}
          >
            {descriptionError || `Minimum 3 characters · ${descriptionLength}/2000`}
          </p>
        </label>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)]/75 bg-white px-3 py-3 md:rounded-xl md:px-4">
            <input
              type="checkbox"
              checked={formData.needsPair}
              onChange={(event) => setFormData((current) => ({ ...current, needsPair: event.target.checked }))}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            <span className="flex min-w-0 items-center gap-2">
              <ScanSearch size={17} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold">This item is missing a piece</span>
                <span className="block text-xs text-[var(--muted-foreground)]">Example: a pot that needs its lid.</span>
              </span>
            </span>
          </label>
        </div>

        {renderPairFields()}
        {renderRouteSpecificFields()}
        {renderGuestContactFields()}
      </div>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={prevStep} className="border-[var(--border)] bg-white font-bold">
          Back
        </Button>
        <Button type="button" onClick={nextStep} className="bg-[var(--brand)] px-8 font-bold text-white hover:bg-[var(--brand-dark)]">
          Review
        </Button>
      </div>
    </motion.div>
  );

  const reviewTags = [
    formData.category,
    listingConditions.find((item) => item.value === formData.condition)?.label,
    selectedPurpose?.label,
    formData.needsPair ? `Needs: ${formData.pairNeeded}` : '',
    formData.purpose === 'TRADE' ? `Trade for: ${formData.tradeLookingFor}` : '',
    formData.purpose === 'DONATE' ? (formData.donationMode === 'RECIPIENT' ? 'Recipient reserved' : 'Public giveaway') : '',
    formData.purpose === 'RECYCLE' ? formData.recycleMaterial : '',
    formData.purpose === 'FIX' ? formData.repairIssue : '',
  ].filter(Boolean);

  const renderReviewStep = () => (
    <motion.div
      key="review"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
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
            <div
              className="h-full origin-left rounded-full bg-[var(--brand)] transition-transform duration-200 ease-out"
              style={{ transform: `scaleX(${uploadProgress / 100})` }}
            />
          </div>
        </div>
      )}

      <div className="surface-card rounded-surface p-5">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <ImageIcon size={20} aria-hidden="true" />
          Listing Preview
        </h3>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-card bg-[var(--sand)] md:w-36">
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
        <Button type="button" variant="outline" onClick={prevStep} disabled={isUploading} className="border-[var(--border)] bg-white font-bold">
          Back
        </Button>
        <Button
          type="submit"
          disabled={isUploading}
          className="bg-[var(--brand)] px-8 font-bold text-white hover:bg-[var(--brand-dark)]"
        >
          {isUploading ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle size={17} />}
          {isUploading ? 'Publishing...' : 'Publish Listing'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 text-center md:mb-10">
        <h1 className="text-2xl font-bold text-[var(--foreground)] md:text-5xl">
          List what you have. Find who needs it.
        </h1>
        {(selectedPurpose || isGuest) && (
          <div className="mx-auto mt-2 flex max-w-2xl flex-wrap items-center justify-center gap-2 md:mt-5 md:gap-3">
            {selectedPurpose && (
              <IntentBadge intent={selectedPurpose.value} />
            )}
            {isGuest && (
              <span className="rounded-pill bg-[var(--secondary-container)] px-3 py-1.5 text-xs font-bold text-[var(--secondary-blue)] md:px-4 md:py-2 md:text-sm">
                Guest
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-5 px-1 md:mb-10 md:px-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-[1.125rem] h-1 rounded-full bg-[var(--sand)] md:top-5" />
          <div
            className="absolute left-0 top-[1.125rem] h-1 w-full origin-left rounded-full bg-[var(--brand)] transition-transform duration-300 ease-out md:top-5"
            style={{ transform: `scaleX(${(step - 1) / (steps.length - 1)})` }}
          />
          {steps.map((item, index) => {
            const stepNumber = index + 1;
            const Icon = item.icon;
            const active = step >= stepNumber;
            return (
              <div key={item.label} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors md:h-11 md:w-11',
                    active ? 'bg-[var(--brand)] text-white soft-shadow' : 'bg-white text-[var(--muted-foreground)]',
                  )}
                >
                  {step > stepNumber ? <CheckCircle size={17} className="md:h-[19px] md:w-[19px]" aria-hidden="true" /> : <Icon size={17} className="md:h-[19px] md:w-[19px]" aria-hidden="true" />}
                </div>
                <span className={cn('text-xs font-bold md:text-sm', active ? 'text-[var(--brand)]' : 'text-[var(--muted-foreground)]')}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden bg-transparent p-0 md:rounded-feature md:border md:border-[var(--border)]/45 md:bg-white md:p-8">
        {validationError && (
          <div
            ref={validationErrorRef}
            tabIndex={-1}
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-control border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-semibold leading-6 text-destructive outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{validationError}</span>
          </div>
        )}
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
