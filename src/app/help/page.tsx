'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Phone, Mail, Book, Shield, CreditCard, Package } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { question: 'How do I create an account?', answer: 'Choose Sign Up and continue through the secure Remnant sign-up page.' },
        { question: 'Is Remnant free to use?', answer: 'Yes. Accounts and listings are free while launch pricing is finalized.' },
        { question: 'What kind of items can I list?', answer: 'You can list any single item, mismatched pair, or incomplete set. Popular categories include electronics, clothing, shoes, accessories, and home goods.' },
      ],
    },
    {
      category: 'Buying & Selling',
      questions: [
        { question: 'How does the matching system work?', answer: 'Our AI scans listings for complementary items. If you list a "Left AirPod", we\'ll match you with users looking for or selling "Right AirPod".' },
        { question: 'How do I buy an item?', answer: 'Open an item and message the seller to agree on the next step.' },
        { question: 'What payment methods are accepted?', answer: 'Payments are being finalized for launch. Keep communication on Remnant until the payment flow is live.' },
        { question: 'How do I know if a seller is trustworthy?', answer: 'Check profile details and keep the conversation inside Remnant.' },
      ],
    },
    {
      category: 'Safety & Security',
      questions: [
        { question: 'Is it safe to meet sellers/buyers in person?', answer: 'We recommend meeting in public places during daylight hours. Always bring a friend and let someone know where you\'re going.' },
        { question: 'What should I do if I encounter a scam?', answer: 'Immediately report the user through their profile and contact our support team. Never send money outside our platform.' },
        { question: 'How is my personal information protected?', answer: 'Account access is protected with authenticated API sessions, and sensitive transaction updates stay inside the platform workflow.' },
      ],
    },
    {
      category: 'Account & Settings',
      questions: [
        { question: 'How do I reset my password?', answer: 'Open the login page, continue to secure sign-in, and choose “Forgot password?” there.' },
        { question: 'Can I delete my account?', answer: 'Contact support from the help page and the team will handle account removal requests.' },
        { question: 'How do I change my notification preferences?', answer: 'Open Dashboard > Settings and adjust the notification toggles for your dashboard experience.' },
      ],
    },
  ];

  const helpTopics = [
    { icon: Book, title: 'User Guide', description: 'Complete guide to using Remnant', link: '/seller-guide' },
    { icon: Shield, title: 'Safety Tips', description: 'Stay safe while trading', link: '/seller-guide?tab=safety' },
    { icon: CreditCard, title: 'Payments', description: 'Launch payment status', link: '/help?topic=payments' },
    { icon: Package, title: 'Shipping', description: 'Shipping and delivery options', link: '/help?topic=shipping' },
  ];

  const contactOptions = [
    { icon: MessageSquare, title: 'Support Inbox', description: 'Send the team your question', action: 'Open Help Desk', href: 'mailto:support@remnant.africa' },
    { icon: Phone, title: 'Phone Support', description: 'Call us for account or payment help', action: 'Call Now', href: 'tel:+2341700736268' },
    { icon: Mail, title: 'Email Support', description: 'Send us an email', action: 'Send Email', href: 'mailto:support@remnant.africa' },
  ];

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredFaqs = normalizedSearch
    ? faqs
        .map((category) => ({
          ...category,
          questions: category.questions.filter((faq) =>
            `${faq.question} ${faq.answer} ${category.category}`.toLowerCase().includes(normalizedSearch)
          ),
        }))
        .filter((category) => category.questions.length > 0)
    : faqs;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
          Find quick answers or contact support.
        </p>
        
        {/* Search */}
        <form
          className="max-w-2xl mx-auto"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg"
            />
            <Button type="submit" className="absolute right-2 top-2">Search</Button>
          </div>
        </form>
      </div>

      {/* Help Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {helpTopics.map((topic, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-[var(--brand-soft)] dark:bg-[var(--brand-muted)] flex items-center justify-center mb-4">
                  <topic.icon className="text-[var(--brand)] dark:text-[var(--brand)]" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                <p className="text-sm text-neutral-500 mb-4">{topic.description}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={topic.link}>Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4">
          {filteredFaqs.map((category, catIndex) => (
            <Card key={catIndex}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {category.questions.map((faq, qIndex) => (
                    <AccordionItem key={qIndex} value={`${catIndex}-${qIndex}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-neutral-600 dark:text-neutral-400">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
          {filteredFaqs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-neutral-600 dark:text-neutral-400">
                  No help articles matched that search. Email support and we will point you in the right direction.
                </p>
                <Button asChild className="mt-4">
                  <Link href="mailto:support@remnant.africa">Email support</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </Accordion>
      </div>

      <section className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">Still need help?</h2>
          <p className="text-sm text-muted-foreground">Reach support through the channels that are active today.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {contactOptions.map((option) => (
            <div key={option.title} className="rounded-xl border border-[var(--border)] bg-card p-5 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--brand-soft)]">
                <option.icon className="text-[var(--brand)]" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{option.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{option.description}</p>
              <Button asChild className="w-full bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]">
                <Link href={option.href}>{option.action}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
