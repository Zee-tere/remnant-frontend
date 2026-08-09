'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Camera, Tag, Shield,
  MessageSquare, Truck, Star, TrendingUp,
  CheckCircle, AlertCircle, Zap, Target
} from 'lucide-react';
import { NairaIcon } from '@/components/ui/naira-icon';

export default function SellerGuidePage() {
  const [activeTab, setActiveTab] = useState('getting-started');

  const steps = [
    {
      step: 1,
      title: 'Take clear photos',
      description: 'Show the real item in good light from more than one angle',
      icon: Camera,
      tips: [
        'Use natural lighting',
        'Clean item before shooting',
        'Show all angles and any flaws',
        'Include something for scale',
      ],
    },
    {
      step: 2,
      title: 'Describe it plainly',
      description: 'Include the details a buyer needs and be honest about faults',
      icon: Tag,
      tips: [
        'Include brand, size, colour',
        'Mention any defects or flaws',
        'State why you\'re selling',
        'Add keywords for search',
      ],
    },
    {
      step: 3,
      title: 'Set a fair price',
      description: 'Check similar items and account for condition',
      icon: NairaIcon,
      tips: [
        'Check similar listings',
        'Consider item condition',
        'Leave room for negotiation',
        'Price in round numbers',
      ],
    },
    {
      step: 4,
      title: 'Reply clearly',
      description: 'Answer useful questions and confirm the next step',
      icon: MessageSquare,
      tips: [
        'Enable notifications',
        'Be polite and professional',
        'Answer all questions',
        'Follow up with interested buyers',
      ],
    },
    {
      step: 5,
      title: 'Meet Safely',
      description: 'Prioritize safety in every exchange',
      icon: Shield,
      tips: [
        'Meet in public places',
        'Bring a friend if possible',
        'Check buyer ratings',
        'Agree on payment and collection clearly',
      ],
    },
    {
      step: 6,
      title: 'Close the loop',
      description: 'Package carefully and mark the listing complete',
      icon: Star,
      tips: [
        'Package items well',
        'Ship/deliver on time',
        'Follow up after sale',
        'Mark the item sold once exchanged',
      ],
    },
  ];

  const categories = [
    {
      name: 'Electronics',
      tips: [
        'Include model number',
        'Show it working',
        'Include original accessories',
        'Mention battery health',
      ],
    },
    {
      name: 'Clothing & Shoes',
      tips: [
        'Show measurements',
        'Photograph labels',
        'Mention exact size',
        'Show any stains or damage',
      ],
    },
    {
      name: 'Furniture',
      tips: [
        'Include dimensions',
        'Show assembly/disassembly',
        'Mention delivery options',
        'Photograph all sides',
      ],
    },
    {
      name: 'Collectibles',
      tips: [
        'Prove authenticity',
        'Show condition details',
        'Include provenance',
        'Compare to similar items',
      ],
    },
  ];

  const pricingExamples = [
    { item: 'iPhone 12 (Used)', condition: 'Good', price: '₦180,000 - ₦220,000' },
    { item: 'Nike Air Force 1', condition: 'Like New', price: '₦25,000 - ₦35,000' },
    { item: 'Laptop Bag', condition: 'New', price: '₦8,000 - ₦12,000' },
    { item: 'Books (5)', condition: 'Used', price: '₦3,000 - ₦5,000' },
    { item: 'AirPod (Single)', condition: 'Good', price: '₦20,000 - ₦30,000' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Seller&apos;s Guide</h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto">
          Everything you need to know to sell successfully on Remnant. 
          Turn your unwanted items into cash with our proven strategies.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/sell-item">Start Selling Now</Link>
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.print()}>
            Print Guide
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
        <TabsList className="mb-8 flex h-auto w-full snap-x justify-start gap-1 overflow-x-auto rounded-xl p-1">
          <TabsTrigger className="min-h-11 min-w-fit shrink-0 snap-start px-4" value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger className="min-h-11 min-w-fit shrink-0 snap-start px-4" value="pricing">Pricing Guide</TabsTrigger>
          <TabsTrigger className="min-h-11 min-w-fit shrink-0 snap-start px-4" value="photos">Photos & Descriptions</TabsTrigger>
          <TabsTrigger className="min-h-11 min-w-fit shrink-0 snap-start px-4" value="safety">Safety & Exchanges</TabsTrigger>
          <TabsTrigger className="min-h-11 min-w-fit shrink-0 snap-start px-4" value="success">Success Tips</TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>6 Steps to Seller Success</CardTitle>
                  <CardDescription>
                    Follow this proven process to maximize your sales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {steps.map((step) => (
                      <div key={step.step} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center text-[var(--brand)]">
                            <step.icon className="text-[var(--brand)] dark:text-[var(--brand)]" size={24} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[var(--brand)]">Step {step.step}</span>
                            <h3 className="font-semibold text-lg">{step.title}</h3>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400 mb-2">{step.description}</p>
                          <ul className="space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap size={20} />
                    Quick Start Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Complete your profile with photo',
                      'Verify your phone number',
                      'Add your payment or pickup preference',
                      'Take 5+ photos of your item',
                      'Write detailed description',
                      'Research similar listings',
                      'Set fair price',
                      'Choose meeting location',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-5 w-5 border rounded flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Mistakes to Avoid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Blurry or dark photos',
                      'Vague descriptions',
                      'Overpricing items',
                      'Slow response to messages',
                      'Meeting in unsafe locations',
                      'Sharing verification codes or passwords',
                    ].map((mistake, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Guide Tab */}
        <TabsContent value="pricing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>How to Price Your Items</CardTitle>
                  <CardDescription>
                    Smart pricing strategies for maximum sales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Research Similar Listings</h4>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Search for identical or similar items on Remnant to see current market prices.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Consider Condition</h4>
                      <div className="space-y-2">
                        {[
                          { condition: 'New', discount: '10-20% off retail' },
                          { condition: 'Like New', discount: '30-40% off retail' },
                          { condition: 'Good', discount: '50-60% off retail' },
                          { condition: 'Fair', discount: '70-80% off retail' },
                          { condition: 'For Parts', discount: '90%+ off retail' },
                        ].map((item) => (
                          <div key={item.condition} className="flex justify-between items-center p-2 border rounded">
                            <span>{item.condition}</span>
                            <Badge variant="outline">{item.discount}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Factor in Demand</h4>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        High-demand items (like single AirPods or specific shoe sizes) can command premium prices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Examples</CardTitle>
                  <CardDescription>
                    Sample prices for common items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pricingExamples.map((example, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{example.item}</h4>
                          <p className="text-sm text-neutral-500">{example.condition}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--brand)]">{example.price}</p>
                          <p className="text-xs text-neutral-500">Market Range</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Negotiation Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Price 10-15% higher than your target to allow for negotiation',
                      'Bundle items for better value',
                      'Be flexible on price but firm on your minimum',
                      'Consider trades for items you need',
                      'Use "Or Best Offer" to attract more buyers',
                    ].map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Photos & Descriptions Tab */}
        <TabsContent value="photos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Photo Guidelines</CardTitle>
                  <CardDescription>
                    Clear photos help buyers decide with fewer messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Front View', icon: Camera },
                        { label: 'Back View', icon: Camera },
                        { label: 'Side View', icon: Camera },
                        { label: 'Detail Shots', icon: Target },
                        { label: 'With Scale', icon: Tag },
                        { label: 'Working Proof', icon: Zap },
                      ].map((item) => (
                        <div key={item.label} className="border rounded-lg p-4 text-center">
                          <item.icon className="mx-auto mb-2 text-[var(--brand)]" size={24} />
                          <p className="font-medium">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Photo Do&apos;s &amp; Don&apos;ts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="mb-1 flex items-center gap-2 font-medium text-[var(--brand)]">
                            <CheckCircle size={16} />
                            Do
                          </h5>
                          <ul className="space-y-1 text-sm">
                            <li>Use natural light</li>
                            <li>Clean item first</li>
                            <li>Use plain background</li>
                            <li>Show all angles</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="mb-1 flex items-center gap-2 font-medium text-red-600">
                            <AlertCircle size={16} />
                            Don&apos;t
                          </h5>
                          <ul className="space-y-1 text-sm">
                            <li>Use blurry photos</li>
                            <li>Hide defects</li>
                            <li>Use filters</li>
                            <li>Show personal info</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Writing Effective Descriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Description Example</h4>
                      <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                        <p className="text-sm mb-2">Apple AirPod Pro 2 - right side only</p>
                        <p className="text-sm mb-2">Condition: Good</p>
                        <p className="text-sm mb-2">Includes: Earbud and charging case photo proof</p>
                        <p className="text-sm mb-2">Defects: Small scratch near the stem</p>
                        <p className="text-sm mb-2">Reason for selling: Left side was lost</p>
                        <p className="text-sm">Location: Ikeja, Lagos</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Keywords to Include</h4>
                      <div className="flex flex-wrap gap-2">
                        {['single', 'left', 'right', 'pair', 'match', 'unwanted', 'spare', 'extra', 'replacement'].map((keyword) => (
                          <Badge key={keyword} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Category-Specific Tips</h4>
                      <div className="space-y-4">
                        {categories.map((cat) => (
                          <div key={cat.name}>
                            <h5 className="font-medium mb-1">{cat.name}</h5>
                            <ul className="space-y-1 text-sm">
                              {cat.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Safety & Exchanges Tab */}
        <TabsContent value="safety">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Safety First</CardTitle>
                  <CardDescription>
                    Protect yourself during a direct exchange
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Meeting Locations</h4>
                      <div className="space-y-3">
                        {[
                          { location: 'Police Stations', note: 'Many have designated safe exchange zones' },
                          { location: 'Bank Lobbies', note: 'Secure with cameras and security' },
                          { location: 'Shopping Malls', note: 'Public with many people around' },
                          { location: 'Coffee Shops', note: 'Public during daylight hours' },
                          { location: 'Your Home', note: 'Never invite strangers to your home' },
                          { location: 'Isolated Areas', note: 'Avoid parks or empty lots at night' },
                        ].map((item) => (
                          <div key={item.location} className="flex items-start gap-3 p-3 border rounded">
                            <div className="font-medium">{item.location}</div>
                            <div className="text-sm text-neutral-500">{item.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Direct Exchange Safety</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Shield className="h-4 w-4 text-green-500 mr-2 mt-1" />
                          <span>Agree on the item, amount, and handoff before meeting</span>
                        </li>
                        <li className="flex items-start">
                          <Shield className="h-4 w-4 text-green-500 mr-2 mt-1" />
                          <span>Meet in a safe public place when possible</span>
                        </li>
                        <li className="flex items-start">
                          <Shield className="h-4 w-4 text-green-500 mr-2 mt-1" />
                          <span>Remnant does not take payment or provide escrow</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exchange Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'Receive a Message', description: 'Someone asks about your listing' },
                      { step: '2', title: 'Agree Clearly', description: 'Use messages to agree on the details' },
                      { step: '3', title: 'Arrange Meeting', description: 'Choose safe public location' },
                      { step: '4', title: 'Check the Item', description: 'Confirm the condition matches the listing' },
                      { step: '5', title: 'Make the Exchange', description: 'Complete the handoff only when both people are satisfied' },
                      { step: '6', title: 'Close the Listing', description: 'Mark the item complete so it leaves the marketplace' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center text-[var(--brand)]">
                          <span className="font-bold text-[var(--brand)]">{item.step}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Packaging Tips</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>• Use bubble wrap for fragile items</li>
                      <li>• Seal boxes with strong tape</li>
                      <li>• Put the recipient name and agreed delivery details inside the parcel</li>
                      <li>• Take photo of packaged item</li>
                    </ul>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <NairaIcon size={20} className="text-green-500" />
                        <span className="font-medium">Shipping Costs</span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        Ask the courier for a current quote, then agree who will pay before dispatch. Delivery prices vary by distance, size, and service.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Success Tips Tab */}
        <TabsContent value="success">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Practical seller habits</CardTitle>
                  <CardDescription>
                    Simple ways to make a listing easier to trust
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        title: 'Bundle Items',
                        description: 'Group related items together for better value',
                        example: 'Bundle all single earrings together',
                      },
                      {
                        title: 'List at the right time',
                        description: 'Post seasonal items while people are searching for them',
                        example: 'List school supplies before a new term',
                      },
                      {
                        title: 'Cross-Promote',
                        description: 'Mention other listings in your descriptions',
                        example: 'See my other listings for more items',
                      },
                      {
                        title: 'Keep details current',
                        description: 'Update the listing if its condition, price, or availability changes',
                        example: 'Replace a blurry photo or correct the model number',
                      },
                      {
                        title: 'Offer Discounts',
                        description: 'Discount for multiple purchases',
                        example: 'Buy 2 items, get 10% off',
                      },
                    ].map((strategy, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-1">{strategy.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {strategy.description}
                        </p>
                        <div className="text-sm text-[var(--brand)] font-medium">
                          Example: {strategy.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>A healthy listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Response Time</h4>
                        <p className="text-sm text-neutral-500">Reply when you can, and keep answers clear</p>
                      </div>
                      <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Listing Quality</h4>
                        <p className="text-sm text-neutral-500">Clear photos and the exact identifying details</p>
                      </div>
                      <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Accurate condition</h4>
                        <p className="text-sm text-neutral-500">State faults before the buyer has to ask</p>
                      </div>
                      <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Up-to-date availability</h4>
                        <p className="text-sm text-neutral-500">Remove or complete an item once it is gone</p>
                      </div>
                      <Badge className="bg-[var(--brand-soft)] text-[var(--brand)]">Ready</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    Tools available now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-1">Listing views</h4>
                      <p className="text-sm text-neutral-500">
                        See how many times people have opened each listing
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-1">Pair alerts</h4>
                      <p className="text-sm text-neutral-500">
                        Save a search and hear when a likely matching item appears
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-1">Remnant messages</h4>
                      <p className="text-sm text-neutral-500">
                        Keep item questions and exchange details in one conversation
                      </p>
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/user/dashboard">Open your dashboard</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Seller FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'How much does it cost to sell on Remnant?',
                a: 'Listing is free. Remnant does not collect payment; both people agree on payment, collection, or delivery directly.',
              },
              {
                q: 'How do I get paid?',
                a: 'Agree the amount and payment method directly in your conversation. Remnant does not collect or hold money. Never share passwords, one-time codes, or card PINs.',
              },
              {
                q: 'What if a buyer doesn\'t show up?',
                a: 'Confirm the time before you travel. If plans change, keep the update in Remnant messages; report the account if the behaviour seems unsafe or deceptive.',
              },
              {
                q: 'Can I sell items from outside Nigeria?',
                a: 'Remnant currently connects people within Nigeria. Both people should be able to arrange a practical local exchange.',
              },
              {
                q: 'How long do listings stay active?',
                a: 'Listings expire after 90 days by default. You can renew an expired listing from its private management page or dashboard; remove or complete it as soon as the item is no longer available.',
              },
              {
                q: 'What items are prohibited?',
                a: 'Illegal items, weapons, drugs, and dangerous goods are not allowed. Contact support before listing anything you are unsure about.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-neutral-600 dark:text-neutral-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center mt-12">
        <Card className="bg-[var(--brand)] text-white">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Selling?</h3>
            <p className="mb-6 opacity-90">
              Create a listing, let matching surface useful pairings, and keep buyer conversations in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-[var(--navy)] hover:bg-white/90">
                <Link href="/sell-item">List Your First Item</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/70 bg-transparent text-white hover:bg-white hover:text-[var(--brand)]">
                <Link href="mailto:support@remnantmarket.co?subject=Seller%20support">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
