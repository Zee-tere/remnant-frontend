'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Bell, Check, X, ExternalLink, 
  MessageSquare, ShoppingBag, Package, 
  Heart, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Info
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';




// Alert types and categories
type AlertType = 'match' | 'message' | 'sale' | 'offer' | 'warning' | 'system';
type AlertStatus = 'unread' | 'read' | 'archived';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: Date;
  status: AlertStatus;
  data?: {
    listingId?: string;
    userId?: string;
    amount?: number;
    matchScore?: number;
  };
}

// Mock alerts data
const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'match',
    title: '🎯 Pair Match Found!',
    description: 'Sarah Johnson has the matching Right AirPod Pro for your Left AirPod Pro listing',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'unread',
    data: {
      listingId: '123',
      userId: 'user_456',
      matchScore: 95,
    },
  },
  {
    id: '2',
    type: 'offer',
    title: '💰 New Offer Received',
    description: 'Michael Chen offered ₦22,000 for your Wooden Dining Table (10% below asking)',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    status: 'unread',
    data: {
      listingId: '456',
      userId: 'user_789',
      amount: 22000,
    },
  },
  {
    id: '3',
    type: 'message',
    title: '💬 New Message',
    description: 'Amara Okeke: "Can we trade for my silver bracelet?"',
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    status: 'read',
    data: {
      listingId: '789',
      userId: 'user_012',
    },
  },
  {
    id: '4',
    type: 'sale',
    title: '✅ Item Sold!',
    description: 'Your Vintage Camera Lens has been sold to David Smith for ₦35,000',
    timestamp: new Date(Date.now() - 1000 * 60 * 360), // 6 hours ago
    status: 'read',
    data: {
      listingId: '012',
      userId: 'user_345',
      amount: 35000,
    },
  },
  {
    id: '5',
    type: 'warning',
    title: '⚠️ Listing Expiring Soon',
    description: 'Your "Single Gold Earring" listing will expire in 2 days. Renew to keep it active.',
    timestamp: new Date(Date.now() - 1000 * 60 * 720), // 12 hours ago
    status: 'read',
    data: {
      listingId: '345',
    },
  },
  {
    id: '6',
    type: 'system',
    title: '📢 New Feature: Smart Matching',
    description: 'Try our new AI-powered matching system to find perfect pairs for your items.',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440), // 1 day ago
    status: 'read',
  },
  {
    id: '7',
    type: 'match',
    title: '👟 Shoe Size Match',
    description: 'We found 3 users looking for size 42 right shoes in your area',
    timestamp: new Date(Date.now() - 1000 * 60 * 2880), // 2 days ago
    status: 'read',
    data: {
      matchScore: 87,
    },
  },
];

// Alert type configurations
const alertConfigs = {
  match: {
    icon: Heart,
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    border: 'border-l-pink-500',
  },
  message: {
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    border: 'border-l-blue-500',
  },
  sale: {
    icon: ShoppingBag,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    border: 'border-l-green-500',
  },
  offer: {
    icon: TrendingUp,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    border: 'border-l-amber-500',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    border: 'border-l-red-500',
  },
  system: {
    icon: Info,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    border: 'border-l-purple-500',
  },
};

export default function AlertsSection() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState<AlertType | 'all'>('all');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = alerts.filter(alert => alert.status === 'unread').length;
    setUnreadCount(unread);
  }, [alerts]);

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.type === filter
  );

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'read' } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, status: 'read' })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const archiveAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'archived' } : alert
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  };

  const getAlertIcon = (type: AlertType) => {
    const config = alertConfigs[type];
    const Icon = config.icon;
    return <Icon size={20} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Alerts & Notifications</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Stay updated with your marketplace activity
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check size={16} className="mr-2" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView(view === 'list' ? 'grid' : 'list')}>
            {view === 'list' ? 'Grid View' : 'List View'}
          </Button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filter Alerts</h3>
          <span className="text-sm text-neutral-500">
            {filteredAlerts.length} of {alerts.length} alerts
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'match', 'message', 'offer', 'sale', 'warning', 'system'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="flex items-center gap-2"
            >
              {filterType !== 'all' && getAlertIcon(filterType)}
              {filterType === 'all' ? 'All Alerts' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filterType === 'all' && unreadCount > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Unread', value: unreadCount, icon: Bell, color: 'blue' },
          { label: 'Matches Today', value: 3, icon: Heart, color: 'pink' },
          { label: 'Pending Offers', value: 2, icon: TrendingUp, color: 'amber' },
          { label: 'Sales This Week', value: '₦87,000', icon: ShoppingBag, color: 'green' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                    <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts List/Grid */}
      {filteredAlerts.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="mx-auto text-neutral-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold">No alerts found</h3>
          <p className="text-neutral-500 mt-2">You&apos;re all caught up!</p>
        </Card>
      ) : (
        <div className={cn(
          "gap-4",
          view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'
        )}>
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => {
              const config = alertConfigs[alert.type];
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    alert.status === 'unread' && "ring-2 ring-blue-500/20",
                    config.border,
                    "border-l-4"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-3 rounded-full",
                            config.color
                          )}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{alert.title}</h3>
                              {alert.status === 'unread' && (
                                <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                              {alert.description}
                            </p>
                            
                            {/* Alert Data */}
                            {alert.data && (
                              <div className="flex flex-wrap gap-3 mb-4">
                                {alert.data.matchScore && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <span className="text-neutral-500">Match:</span>
                                    <span className="font-semibold">{alert.data.matchScore}%</span>
                                  </div>
                                )}
                                {alert.data.amount && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <span className="text-neutral-500">Amount:</span>
                                    <span className="font-semibold text-green-600">
                                      {formatCurrency(alert.data.amount)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-neutral-500">
                                <span>{formatTime(alert.timestamp)}</span>
                                {alert.type === 'match' && (
                                  <span className="flex items-center gap-1 text-pink-600">
                                    <Heart size={14} />
                                    Smart Match
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => markAsRead(alert.id)}
                                >
                                  <Check size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => archiveAlert(alert.id)}
                                >
                                  <Package size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => deleteAlert(alert.id)}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button size="sm" className="flex-1">
                          <ExternalLink size={16} className="mr-2" />
                          View Details
                        </Button>
                        {alert.type === 'match' && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare size={16} className="mr-2" />
                            Contact Match
                          </Button>
                        )}
                        {alert.type === 'offer' && (
                          <>
                            <Button size="sm" variant="outline" className="flex-1">
                              <CheckCircle size={16} className="mr-2" />
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <XCircle size={16} className="mr-2" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Alert Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Push Notifications', enabled: true },
              { label: 'Email Alerts', enabled: true },
              { label: 'Match Alerts', enabled: true },
              { label: 'Price Drop Alerts', enabled: false },
              { label: 'New Message Alerts', enabled: true },
              { label: 'Weekly Digest', enabled: true },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span>{pref.label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={pref.enabled}
                    className="sr-only"
                    onChange={() => {}}
                  />
                  <div className={cn(
                    "block w-12 h-6 rounded-full transition-colors",
                    pref.enabled ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700"
                  )}>
                    <div className={cn(
                      "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                      pref.enabled ? "transform translate-x-6" : ""
                    )} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-6">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}