'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Mail, Book, Shield, Handshake, Package, Loader2 } from 'lucide-react';
import { ActionArtwork } from '@/components/brand/ActionArtwork';
import { supportApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportForm, setSupportForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportReference, setSupportReference] = useState<string | null>(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { question: 'How do I create an account?', answer: 'Choose Sign Up and continue through the secure Remnant sign-up page.' },
        { question: 'Is Remnant free to use?', answer: 'Yes. Remnant does not charge you to list an item and does not collect payment for an exchange.' },
        { question: 'What kind of items can I list?', answer: 'List a useful item, a single piece, or part of an incomplete set. Common examples include electronics, clothing, shoes, accessories, and household items.' },
      ],
    },
    {
      category: 'Finding & Exchanging',
      questions: [
        { question: 'How does the matching system work?', answer: 'Remnant compares listing details for complementary items. If you list a "Left AirPod", we\'ll match you with users looking for or selling a "Right AirPod".' },
        { question: 'How do I get an item?', answer: 'Open the listing, message the person, and agree on collection, delivery, and any payment directly.' },
        { question: 'Does Remnant take payment or hold money?', answer: 'No. Remnant helps people find and message each other; it does not process payment or provide escrow. Never send money because someone claims Remnant is holding or protecting it.' },
        { question: 'How do I know if another person is trustworthy?', answer: 'Check their profile, ask clear questions, inspect the item, and keep the conversation inside Remnant.' },
      ],
    },
    {
      category: 'Safety & Security',
      questions: [
        { question: 'Is it safe to meet sellers/buyers in person?', answer: 'We recommend meeting in public places during daylight hours. Always bring a friend and let someone know where you\'re going.' },
        { question: 'What should I do if I encounter a scam?', answer: 'Stop the conversation, report the account, and contact support. Never share your password, one-time code, or card PIN. Confirm the item and recipient before making any direct payment.' },
        { question: 'How is my personal information protected?', answer: 'Account access uses authenticated sessions. Contact details are only shared through the flows designed for an exchange.' },
      ],
    },
    {
      category: 'Account & Settings',
      questions: [
        { question: 'How do I reset my password?', answer: 'Open the login page, continue to secure sign-in, and choose “Forgot password?” there.' },
        { question: 'Can I delete my account?', answer: 'Yes. Open Dashboard > Settings to download your data or schedule account deletion without contacting support.' },
        { question: 'How do I change my notification preferences?', answer: 'Open Dashboard > Settings and adjust the notification toggles for your dashboard experience.' },
      ],
    },
  ];

  const helpTopics = [
    { icon: Book, title: 'Seller guide', description: 'Practical help for a clear, trustworthy listing', link: '/seller-guide' },
    { icon: Shield, title: 'Safety Tips', description: 'Stay safe while trading', link: '/seller-guide?tab=safety' },
    { icon: Handshake, title: 'Direct exchanges', description: 'Agree clearly and avoid common scams', link: '/help?topic=exchanges' },
    { icon: Package, title: 'Collection & delivery', description: 'Plan a practical handoff', link: '/help?topic=delivery' },
  ];

  const contactOptions = [
    { icon: Mail, title: 'Email Support', description: 'Send us an email', action: 'Send Email', href: 'mailto:support@remnantmarket.co' },
  ];

  const submitSupport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittingSupport(true);
    try {
      const result = await supportApi.createRequest(supportForm);
      setSupportReference(result.id);
      setSupportForm((current) => ({ ...current, topic: '', message: '' }));
      toast.success('Support request received');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not send your request'));
    } finally {
      setSubmittingSupport(false);
    }
  };

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
        <ActionArtwork name="find" priority className="mx-auto mb-5 h-20 w-20 md:mb-6 md:h-40 md:w-40" />
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
      <div className="mb-12 grid grid-cols-1 border-y border-[var(--line-soft)] md:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[var(--line-soft)]">
        {helpTopics.map((topic, index) => (
          <article key={index} className="border-b border-[var(--line-soft)] p-6 text-center last:border-b-0 lg:border-b-0">
              <div className="flex h-full flex-col items-center text-center">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center ${['text-[var(--brand)]','text-[var(--lavender)]','text-[var(--amber)]','text-[var(--aqua)]'][index]}`}>
                  <topic.icon size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                <p className="mb-4 flex-1 text-sm text-neutral-500">{topic.description}</p>
                <Button asChild variant="outline" className="w-full bg-white">
                  <Link href={topic.link}>Learn More</Link>
                </Button>
              </div>
          </article>
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
                  <Link href="mailto:support@remnantmarket.co">Email support</Link>
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
        <form onSubmit={submitSupport} className="mb-6 grid gap-4 rounded-xl border border-[var(--border)] bg-card p-5 md:grid-cols-2 md:p-7">
          <label className="space-y-1.5"><span className="text-sm font-bold">Name</span><Input value={supportForm.name} onChange={(event) => setSupportForm((current) => ({ ...current, name: event.target.value }))} minLength={2} maxLength={80} required /></label>
          <label className="space-y-1.5"><span className="text-sm font-bold">Email</span><Input type="email" value={supportForm.email} onChange={(event) => setSupportForm((current) => ({ ...current, email: event.target.value }))} maxLength={254} required /></label>
          <label className="space-y-1.5 md:col-span-2"><span className="text-sm font-bold">Topic</span><Input value={supportForm.topic} onChange={(event) => setSupportForm((current) => ({ ...current, topic: event.target.value }))} maxLength={80} required /></label>
          <label className="space-y-1.5 md:col-span-2"><span className="text-sm font-bold">How can we help?</span><Textarea value={supportForm.message} onChange={(event) => setSupportForm((current) => ({ ...current, message: event.target.value }))} minLength={10} maxLength={4000} rows={5} required /></label>
          <div className="flex flex-col gap-2 md:col-span-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-muted-foreground">We will reply to the email above. Do not include passwords or verification codes.</p>
            <Button type="submit" disabled={submittingSupport} className="bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]">{submittingSupport ? <Loader2 className="animate-spin" size={16} /> : <MessageSquare size={16} />}Send request</Button>
          </div>
          {supportReference && <p className="md:col-span-2 rounded-lg bg-[var(--brand-soft)] p-3 text-sm font-bold text-[var(--brand)]">Reference: {supportReference}</p>}
        </form>
        <div className="grid grid-cols-1 gap-4">
          {contactOptions.map((option) => (
            <div key={option.title} className="rounded-xl border border-[var(--border)] bg-card p-5 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-[var(--brand)]">
                <option.icon className="text-[var(--brand)]" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{option.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{option.description}</p>
              <Button asChild className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]">
                <Link href={option.href}>{option.action}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
