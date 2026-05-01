'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { 
  User, Bell, Shield, CreditCard, 
  Globe, Smartphone, Palette, Trash2,
  Save, Upload, Eye, EyeOff,
  Phone, MapPin
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+234 812 345 6789',
    location: 'Lagos, Nigeria',
    bio: 'I love finding matches for my single items!',
    notifications: {
      email: true,
      push: true,
      matches: true,
      messages: true,
      offers: true,
    },
    privacy: {
      profilePublic: true,
      showEmail: false,
      showPhone: false,
      showLocation: false,
    },
  });

  const handleSave = () => {
    // Save logic here
    console.log('Saving settings:', userData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your account preferences and privacy settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{userData.name}</h3>
                <p className="text-sm text-neutral-500">Premium Member</p>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
                  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                  { id: 'regional', label: 'Regional', icon: Globe },
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'devices', label: 'Devices', icon: Smartphone },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="regional">Regional</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and how others see you on Remnant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="phone"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        />
                        <Button variant="outline" size="icon">
                          <Phone size={18} />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="flex gap-2">
                        <Input
                          id="location"
                          value={userData.location}
                          onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                        />
                        <Button variant="outline" size="icon">
                          <MapPin size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[100px] p-3 border rounded-lg"
                      value={userData.bio}
                      onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                      placeholder="Tell others about yourself..."
                    />
                    <p className="text-sm text-neutral-500">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Profile Picture</h4>
                        <p className="text-sm text-neutral-500">
                          JPG, GIF or PNG. Max size 2MB
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Upload size={16} className="mr-2" />
                          Upload New
                        </Button>
                        <Button variant="destructive" size="icon">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                    { key: 'push', label: 'Push Notifications', description: 'Receive browser notifications' },
                    { key: 'matches', label: 'Match Alerts', description: 'Get notified when matches are found' },
                    { key: 'messages', label: 'New Messages', description: 'When someone messages you' },
                    { key: 'offers', label: 'Price Offers', description: 'When someone makes an offer' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-sm text-neutral-500">{item.description}</p>
                      </div>
                      <Switch
                        checked={userData.notifications[item.key as keyof typeof userData.notifications]}
                        onCheckedChange={(checked) =>
                          setUserData({
                            ...userData,
                            notifications: {
                              ...userData.notifications,
                              [item.key]: checked,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage your privacy settings and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Profile Visibility</h4>
                    {[
                      { key: 'profilePublic', label: 'Make profile public', description: 'Anyone can see your profile' },
                      { key: 'showEmail', label: 'Show email address', description: 'Display email on profile' },
                      { key: 'showPhone', label: 'Show phone number', description: 'Display phone on profile' },
                      { key: 'showLocation', label: 'Show location', description: 'Display your city' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{item.label}</h4>
                          <p className="text-sm text-neutral-500">{item.description}</p>
                        </div>
                        <Switch
                          checked={userData.privacy[item.key as keyof typeof userData.privacy]}
                          onCheckedChange={(checked) =>
                            setUserData({
                              ...userData,
                              privacy: {
                                ...userData.privacy,
                                [item.key]: checked,
                              },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                    </div>
                    <Button>Change Password</Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-600">Danger Zone</h4>
                    <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Delete Account</h4>
                          <p className="text-sm text-neutral-500">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment methods for buying and selling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold">VISA</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">•••• •••• •••• 4242</h4>
                          <p className="text-sm text-neutral-500">Expires 12/2025</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full">Add New Payment Method</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Regional Tab */}
            <TabsContent value="regional">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Settings</CardTitle>
                  <CardDescription>
                    Set your language, currency, and timezone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        className="w-full p-2 border rounded-lg"
                        defaultValue="en"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="yo">Yoruba</option>
                        <option value="ha">Hausa</option>
                        <option value="ig">Igbo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        className="w-full p-2 border rounded-lg"
                        defaultValue="NGN"
                      >
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        className="w-full p-2 border rounded-lg"
                        defaultValue="Africa/Lagos"
                      >
                        <option value="Africa/Lagos">West Africa Time (Lagos)</option>
                        <option value="Africa/Abidjan">Greenwich Mean Time (Abidjan)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Measurement Units</Label>
                      <select
                        id="units"
                        className="w-full p-2 border rounded-lg"
                        defaultValue="metric"
                      >
                        <option value="metric">Metric (cm, kg)</option>
                        <option value="imperial">Imperial (in, lb)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how Remnant looks on your device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Theme</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'light', label: 'Light', icon: '☀️' },
                        { id: 'dark', label: 'Dark', icon: '🌙' },
                        { id: 'system', label: 'System', icon: '💻' },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          className="flex flex-col items-center p-4 border rounded-lg hover:border-green-500 transition-colors"
                          onClick={() => console.log('Set theme:', theme.id)}
                        >
                          <span className="text-2xl mb-2">{theme.icon}</span>
                          <span className="font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Font Size</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Small</span>
                      <input
                        type="range"
                        min="14"
                        max="20"
                        defaultValue="16"
                        className="flex-1"
                      />
                      <span className="text-sm">Large</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle>Active Devices</CardTitle>
                  <CardDescription>
                    Manage devices where you&apos;re logged in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { device: 'iPhone 14 Pro', location: 'Lagos, Nigeria', lastActive: 'Now', current: true },
                    { device: 'MacBook Pro', location: 'Home', lastActive: '2 hours ago', current: false },
                    { device: 'Windows PC', location: 'Office', lastActive: '1 day ago', current: false },
                    { device: 'Samsung Galaxy', location: 'Abuja, Nigeria', lastActive: '1 week ago', current: false },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">{session.device}</h4>
                          <p className="text-sm text-neutral-500">
                            {session.location} • Last active {session.lastActive}
                            {session.current && <span className="text-green-600 ml-2">• Current</span>}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="outline" size="sm">
                          Logout
                        </Button>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full">
                      Logout from all devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}